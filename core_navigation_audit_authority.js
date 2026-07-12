"use strict";

/*
========================================
CORE NAVIGATION AUDIT AUTHORITY v1.1
========================================
Purpose
----------------------------------------
• Audits application navigation
• Records page navigation events
• Maintains navigation history
• Broadcasts navigation activity
• Provides navigation audit API

Framework Layer
----------------------------------------
Core Infrastructure

Dependencies
----------------------------------------
• PIN Role Access (optional)
• PIN Event Bus (optional)

Exports
----------------------------------------
window.CORE_NAVIGATION_AUDIT
window.initCoreNavigationAudit()

========================================
*/

(function () {

    // Prevent duplicate loading
    if (
        window.__CORE_NAVIGATION_AUDIT__ &&
        window.__CORE_NAVIGATION_AUDIT__.initialized
    ) {
        return;
    }

    window.__CORE_NAVIGATION_AUDIT__ = {
        initialized: true,
        ready: false,
        version: "1.1",
        timestamp: Date.now()
    };

    const MAX_LOGS = 500;

    const BLOCK_AUDIT = [
        "access_denied"
    ];

    const STATE = {
        logs: []
    };

    function getCurrentRole() {

        return (
            window.PIN_ROLE_ACCESS?.getCurrentRole?.() ||
            "USER"
        );

    }

    function record(action, page, status) {

        if (BLOCK_AUDIT.includes(page)) {
            console.warn(
                "[CORE NAVIGATION AUDIT] Skipped:",
                page
            );
            return;
        }

        const entry = {

            action,
            page,
            status,

            role: getCurrentRole(),

            timestamp: Date.now()

        };

        STATE.logs.push(entry);

        if (STATE.logs.length > MAX_LOGS) {
            STATE.logs.shift();
        }

        if (typeof window.broadcastPinEvent === "function") {

            window.broadcastPinEvent(
                "CORE_NAVIGATION_AUDIT",
                entry
            );

        }

        console.log(
            "[CORE NAVIGATION AUDIT]",
            action,
            page,
            status
        );

    }

    function navigationRequested(page) {

        record(
            "REQUESTED",
            page,
            "PENDING"
        );

    }

    function navigationLoaded(page) {

        record(
            "LOADED",
            page,
            "SUCCESS"
        );

    }

    function navigationFailed(page) {

        record(
            "FAILED",
            page,
            "FAILED"
        );

    }

    window.CORE_NAVIGATION_AUDIT = {

        navigationRequested,

        navigationLoaded,

        navigationFailed,

        getLogs() {

            return [...STATE.logs];

        },

        clearLogs() {

            STATE.logs.length = 0;

        }

    };

    window.initCoreNavigationAudit = function () {

        window.__CORE_NAVIGATION_AUDIT__.ready = true;

        console.log(
            "[CORE NAVIGATION AUDIT] READY"
        );

        return true;

    };

})();

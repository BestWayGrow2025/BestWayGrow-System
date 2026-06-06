"use strict";

/*
PIN SYSTEM CONTROLLER V2.1 FINAL SAFE
✔ Central traffic controller
✔ Queue-based execution
✔ Boot-safe engine resolution
✔ Contract-aware execution gate
✔ Production hardened
*/

// ================= INIT GUARD =================
(function () {

    if (
        window.__PIN_SYSTEM_CONTROLLER__ &&
        window.__PIN_SYSTEM_CONTROLLER__.initialized
    ) {
        return;
    }

    window.__PIN_SYSTEM_CONTROLLER__ = {
        initialized: true,
        ready: false,
        timestamp: Date.now()
    };

})();

// ================= QUEUE =================
const PIN_SYSTEM_QUEUE = [];

// ================= STATE =================
let PIN_SYSTEM_BUSY = false;

// ================= ENTRY =================
function pinSystemExecute(actionType, payload = {}) {
    return enqueuePinTask(actionType, payload);
}

// ================= ENQUEUE =================
function enqueuePinTask(actionType, payload = {}) {

    PIN_SYSTEM_QUEUE.push({
        actionType: String(actionType || "").trim(),
        payload: payload || {},
        createdAt: Date.now()
    });

    // safe async scheduling (prevents burst recursion issues)
    queueMicrotask(processPinQueue);

    return true;
}

// ================= PROCESSOR =================
async function processPinQueue() {

    if (PIN_SYSTEM_BUSY) return;

    PIN_SYSTEM_BUSY = true;

    try {

        while (PIN_SYSTEM_QUEUE.length > 0) {

            const task = PIN_SYSTEM_QUEUE.shift();
            if (!task) continue;

            try {
                await executePinTask(task.actionType, task.payload);
            } catch (err) {
                console.error("[PIN SYSTEM CONTROLLER TASK ERROR]", err);
            }

        }

    } finally {
        PIN_SYSTEM_BUSY = false;
    }
}

// ================= TASK EXECUTION =================
async function executePinTask(actionType, payload) {

    // ================= CONTRACT SAFETY =================
    if (!window.PIN_GLOBAL_CONTRACT) {
        throw new Error("PIN GLOBAL CONTRACT NOT LOADED");
    }

    if (!actionType) {
        throw new Error("Missing actionType");
    }

    // ================= ENGINE RESOLUTION =================

    // Priority 1: explicit router
    if (typeof window.routePinRequest === "function") {
        return await window.routePinRequest(actionType, payload || {});
    }

    // Priority 2: execution flow engine
    if (typeof window.executePinFlow === "function") {
        return await window.executePinFlow(actionType, payload || {});
    }

    // Priority 3: global execution engine (safe fallback)
    if (typeof window.PIN_EXECUTION_ENGINE === "function") {
        return await window.PIN_EXECUTION_ENGINE(actionType, payload || {});
    }

    console.warn("[PIN SYSTEM] No execution engine registered yet");
    return false;
}

// ================= READY =================

window.__PIN_SYSTEM_CONTROLLER__.ready = true;

// ================= EXPORT =================

window.pinSystemExecute = pinSystemExecute;
window.enqueuePinTask = enqueuePinTask;

window.PIN_SYSTEM = {
    get queue() {
        return PIN_SYSTEM_QUEUE;
    },

    isBusy() {
        return PIN_SYSTEM_BUSY;
    }
};

// Optional debug exposure (safe namespace)
window.PIN_SYSTEM = {
    get queue() {
        return PIN_SYSTEM_QUEUE;
    },
    isBusy() {
        return PIN_SYSTEM_BUSY;
    }
};

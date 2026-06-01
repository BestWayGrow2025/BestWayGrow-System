"use strict";
/*
PIN SYSTEM CONTROLLER V2.0 FINAL
✔ Central traffic controller ✔ Single execution gateway ✔ Queue-based flow ✔ One-way execution only ✔ No business logic ✔ No UI rendering ✔ No routing modification ✔ Safe async execution ✔ Production LOCKED
*/
// ================= INIT GUARD =================
(function () {

if (window.PIN_SYSTEM_CONTROLLER) {
    return;
}

window.PIN_SYSTEM_CONTROLLER = true;

})();
// ================= QUEUE =================
const PIN_SYSTEM_QUEUE = [];

// ================= PROCESS STATE =================
let PIN_SYSTEM_BUSY = false;

// ================= ENTRY =================
function pinSystemExecute(actionType, payload = {}) {

    return enqueuePinTask(
        actionType,
        payload
    );

}

// ================= ENQUEUE =================
function enqueuePinTask(actionType, payload = {}) {

    PIN_SYSTEM_QUEUE.push({

        actionType: String(
            actionType || ""
        ).trim(),

        payload: payload || {},

        createdAt: Date.now()

    });

    processPinQueue();

    return true;

}
// ================= PROCESSOR =================
async function processPinQueue() {

    if (PIN_SYSTEM_BUSY) {
        return;
    }

    PIN_SYSTEM_BUSY = true;

    try {

        while (PIN_SYSTEM_QUEUE.length > 0) {

            const task =
                PIN_SYSTEM_QUEUE.shift();

            if (!task) {
                continue;
            }

            try {

                await executePinTask(
                    task.actionType,
                    task.payload
                );

            } catch (err) {

                console.error(
                    "[PIN SYSTEM CONTROLLER TASK ERROR]",
                    err
                );

            }

        }

    } finally {

        PIN_SYSTEM_BUSY = false;

    }

}
// ================= TASK EXECUTION =================
async function executePinTask(
    actionType,
    payload
) {

    // ================= VALIDATION =================
    if (!actionType) {

        throw new Error(
            "Missing actionType"
        );

    }

    // PRIORITY 1
    if (typeof routePinRequest === "function") {

        return await routePinRequest(
            actionType,
            payload || {}
        );

    }

    // PRIORITY 2
if (typeof executePinFlow === "function") {

    return await executePinFlow(
        actionType,
        payload || {}
    );

}

// ==================================================
// FAILURE
// ==================================================
throw new Error(
    "No PIN execution engine available"
);

}

// ================= EXPORT =================
window.pinSystemExecute = pinSystemExecute;
window.enqueuePinTask = enqueuePinTask;

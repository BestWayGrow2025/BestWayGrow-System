"use strict";

/*
========================================
PIN UI LAUNCHER V1.2 FINAL SAFE
========================================
✔ Contract-safe UI launcher
✔ Dispatcher-only execution
✔ Event bus integrated
✔ No business logic in UI
✔ Injector-compatible design
✔ Single modal authority layer
========================================
*/

(function () {

  // ================= INIT GUARD =================
  if (window.__PIN_UI_LAUNCHER__) return;

  window.__PIN_UI_LAUNCHER__ = true;

  document.addEventListener("DOMContentLoaded", initPinUILauncher);

})();

// ================= INIT =================
function initPinUILauncher() {

  if (!window.PIN_GLOBAL_CONTRACT) {
    console.error("[PIN UI LAUNCHER] Contract missing");
    return;
  }

  window.broadcastPinEvent?.("PIN_UI_LAUNCHER_READY", {});

  createModalRoot();
}

// ================= ROOT =================
function createModalRoot() {

  if (document.getElementById("pinModalRoot")) return;

  const root = document.createElement("div");
  root.id = "pinModalRoot";

  document.body.appendChild(root);
}

// ================= MODAL RENDER =================
function renderPinModal(title, bodyHTML) {

  const root = document.getElementById("pinModalRoot");
  if (!root) return false;

  root.innerHTML = `
    <div style="
      position:fixed;
      inset:0;
      background:rgba(0,0,0,0.45);
      z-index:99999;
      display:flex;
      align-items:center;
      justify-content:center;
    ">

      <div style="
        background:#fff;
        width:95%;
        max-width:500px;
        border-radius:10px;
        padding:20px;
      ">

        <div style="display:flex;justify-content:space-between;">
          <h3>${title}</h3>
          <button onclick="window.closePinModal()">✖</button>
        </div>

        ${bodyHTML}

      </div>

    </div>
  `;

  return true;
}

// ================= CLOSE =================
function closePinModal() {

  const root = document.getElementById("pinModalRoot");
  if (root) root.innerHTML = "";

  window.broadcastPinEvent?.("PIN_MODAL_CLOSED", {});
}

// ================= SAFE DISPATCH =================
function execute(action, payload = {}) {

  if (!window.dispatchPinAction) {
    console.error("[PIN UI LAUNCHER] Dispatcher not available");
    return false;
  }

  window.broadcastPinEvent?.("PIN_ACTION_TRIGGERED", {
    action,
    payload
  });

  return window.dispatchPinAction(action, payload);
}

// ================= PANELS =================
function openPinRequestPanel(payload = {}) {

  renderPinModal(
    "📌 Request PIN",
    `
      <p>Submit PIN Request</p>

      <button onclick="window.__pinSubmitRequest()">Submit</button>
    `
  );

  window.broadcastPinEvent?.("PIN_UI_OPEN", { type: "REQUEST" });
}

function openApprovePanel(payload = {}) {

  renderPinModal(
    "✅ Approve Request",
    `
      <p>Request ID: ${payload.requestId || "-"}</p>

      <button onclick="window.__pinApprove('${payload.requestId || ""}')">
        Approve
      </button>
    `
  );

  window.broadcastPinEvent?.("PIN_UI_OPEN", { type: "APPROVE" });
}

function openAssignPinPanel(payload = {}) {

  renderPinModal(
    "🎯 Assign PIN",
    `
      <input id="assignToId" placeholder="User ID" style="width:100%;padding:10px;" />

      <button onclick="window.__pinAssign('${payload.pinId || ""}')">
        Assign
      </button>
    `
  );

  window.broadcastPinEvent?.("PIN_UI_OPEN", { type: "ASSIGN" });
}

// ================= GLOBAL SAFE HANDLERS =================
window.__pinSubmitRequest = function () {

  execute("REQUEST_PIN", {
    type: "upgrade",
    amount: 100,
    paymentId: "AUTO_" + Date.now(),
    quantity: 1
  });

  closePinModal();
};

window.__pinApprove = function (requestId) {

  execute("APPROVE_REQUEST", {
    requestId
  });

  closePinModal();
};

window.__pinAssign = function (pinId) {

  const toId = document.getElementById("assignToId")?.value || "";

  execute("ASSIGN_PIN", {
    pinId,
    toId
  });

  closePinModal();
};

// ================= EXPORT =================
window.renderPinModal = renderPinModal;
window.closePinModal = closePinModal;

window.openPinRequestPanel = openPinRequestPanel;
window.openApprovePanel = openApprovePanel;
window.openAssignPinPanel = openAssignPinPanel;

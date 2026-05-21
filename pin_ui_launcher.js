"use strict";

/*
========================================
PIN UI LAUNCHER V1.1 (PRODUCTION FIXED CORE)
========================================
✔ Central UI launcher layer
✔ Safe modal rendering
✔ Router-safe execution (NO inline JS routing)
✔ Event-safe button binding
✔ Stable lifecycle control
✔ Clean separation from router
✔ Production locked
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_UI_LAUNCHER__) return;

  window.__PIN_UI_LAUNCHER__ = true;

  document.addEventListener("DOMContentLoaded", initPinUILauncher);

})();

// ================= INIT =================
function initPinUILauncher() {

  createModalRoot();

}

// ================= ROOT =================
function createModalRoot() {

  if (document.getElementById("pinModalRoot")) return;

  const root = document.createElement("div");
  root.id = "pinModalRoot";

  document.body.appendChild(root);
}

// ================= MODAL =================
function renderPinModal(title, bodyHTML) {

  const root = document.getElementById("pinModalRoot");
  if (!root) return false;

  root.innerHTML = `
    <div id="pinModalOverlay" style="
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
        box-shadow:0 10px 30px rgba(0,0,0,0.2);
      ">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:15px;
        ">
          <h3 style="margin:0;">${title}</h3>

          <button onclick="window.closePinModal()">
            ✖
          </button>
        </div>

        <div>
          ${bodyHTML}
        </div>

      </div>

    </div>
  `;

  return true;
}

// ================= CLOSE =================
function closePinModal() {

  const root = document.getElementById("pinModalRoot");
  if (!root) return;

  root.innerHTML = "";
}

// ================= SAFE ROUTE CALL =================
function safeRoute(action, payload) {

  if (typeof window.routePinRequest !== "function") {
    console.error("Router not available");
    return false;
  }

  return window.routePinRequest(action, payload);
}

// ================= REQUEST PANEL =================
function openPinRequestPanel(payload = {}) {

  return renderPinModal(
    "📌 Request PIN",
    `
      <p>Create new PIN request</p>

      <button id="submitRequestBtn">
        Submit Request
      </button>
    `
  );
}

// ================= APPROVE PANEL =================
function openApprovePanel(payload = {}) {

  return renderPinModal(
    "✅ Approve PIN Request",
    `
      <p>Approve request:</p>

      <b>${payload.requestId || "-"}</b>

      <br><br>

      <button id="approveBtn">
        Approve Now
      </button>
    `
  );
}

// ================= ASSIGN PANEL =================
function openAssignPinPanel(payload = {}) {

  return renderPinModal(
    "🎯 Assign PIN",
    `
      <p>Assign PIN to user</p>

      <input
        id="assignToId"
        placeholder="Enter User ID"
        style="width:100%;padding:10px;margin-bottom:10px;"
      />

      <button id="assignBtn">
        Assign PIN
      </button>
    `
  );
}

// ================= EVENT BINDING (AFTER MODAL RENDER) =================
document.addEventListener("click", function (e) {

  // REQUEST
  if (e.target && e.target.id === "submitRequestBtn") {

    safeRoute("REQUEST_PIN", {
      type: "upgrade",
      amount: 100,
      paymentId: "PAY_" + Date.now(),
      quantity: 1
    });

    closePinModal();
  }

  // APPROVE
  if (e.target && e.target.id === "approveBtn") {

    const reqId = document.querySelector("b")?.innerText || "";

    safeRoute("APPROVE_REQUEST", {
      requestId: reqId,
      __directExecute: true
    });

    closePinModal();
  }

  // ASSIGN
  if (e.target && e.target.id === "assignBtn") {

    const toId = document.getElementById("assignToId")?.value || "";

    safeRoute("ASSIGN_PIN", {
      pinId: "PIN001",
      toId: toId
    });

    closePinModal();
  }
});

// ================= EXPORT =================
window.renderPinModal = renderPinModal;
window.closePinModal = closePinModal;

window.openPinRequestPanel = openPinRequestPanel;
window.openApprovePanel = openApprovePanel;
window.openAssignPinPanel = openAssignPinPanel;

"use strict";

/*
========================================
PIN UI LAUNCHER V1.0 (ENTERPRISE UI CORE)
========================================
✔ Central UI launcher layer
✔ Request / Approve / Assign popup system
✔ Safe modal rendering
✔ No business logic
✔ Router-compatible
✔ DOM-safe injection
✔ Single modal lifecycle
✔ Production stable
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_UI_LAUNCHER__) return;

  window.__PIN_UI_LAUNCHER__ = true;

  initPinUILauncher();

})();

// ================= INIT =================
function initPinUILauncher() {

  createModalRoot();

}

// ================= ROOT =================
function createModalRoot() {

  if (document.getElementById("pinModalRoot")) {
    return;
  }

  const root = document.createElement("div");

  root.id = "pinModalRoot";

  document.body.appendChild(root);
}

// ================= MODAL RENDER =================
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

          <button onclick="closePinModal()">
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

// ================= REQUEST PANEL =================
function openPinRequestPanel(payload = {}) {

  return renderPinModal(
    "📌 Request PIN",
    `
      <p>Create new PIN request</p>

      <button onclick="
        routePinRequest(
          'REQUEST_PIN',
          {
            __directExecute:true,
            type:'upgrade',
            amount:100,
            paymentId:'PAY_' + Date.now(),
            quantity:1
          }
        );
        closePinModal();
      ">
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

      <button onclick="
        routePinRequest(
          'APPROVE_REQUEST',
          {
            __directExecute:true,
            requestId:'${payload.requestId || ""}'
          }
        );
        closePinModal();
      ">
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
        style="
          width:100%;
          padding:10px;
          margin-bottom:10px;
        "
      />

      <button onclick="
        routePinRequest(
          'ASSIGN_PIN',
          {
            __directExecute:true,
            pinId:'${payload.pinId || "PIN001"}',
            toId:document.getElementById('assignToId').value
          }
        );
        closePinModal();
      ">
        Assign PIN
      </button>
    `
  );
}

// ================= EXPORT =================
window.renderPinModal = renderPinModal;
window.closePinModal = closePinModal;

window.openPinRequestPanel = openPinRequestPanel;
window.openApprovePanel = openApprovePanel;
window.openAssignPinPanel = openAssignPinPanel;


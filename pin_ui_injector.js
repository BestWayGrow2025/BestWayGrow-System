"use strict";

/*
========================================
PIN UI AUTO INJECTOR V3.0 (UI RENDER CORE)
========================================
✔ Role-safe injection layer
✔ Central modal renderer
✔ Request PIN popup
✔ Assign PIN popup
✔ Approve Request popup
✔ Close modal system
✔ Router-compatible UI layer
✔ MutationObserver safe sync
✔ Production stable
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_UI_INJECTOR__) return;

  window.__PIN_UI_INJECTOR__ = true;

  document.addEventListener("DOMContentLoaded", initInjector);

})();

// ================= INIT =================
function initInjector() {

  bindPinElements();

  observeDOMChanges();

  injectModalRoot();
}

// ================= SAFE MARKER =================
function bindPinElements() {

  document.querySelectorAll("[data-pin-action]").forEach(el => {

    if (el.__pinBound) return;

    el.__pinBound = true;

    el.setAttribute("data-pin-bound", "true");
  });
}

// ================= MODAL ROOT =================
function injectModalRoot() {

  if (document.getElementById("pinModalRoot")) return;

  const div = document.createElement("div");

  div.id = "pinModalRoot";

  document.body.appendChild(div);
}

// ================= OPEN REQUEST PANEL =================
function openPinRequestPanel() {

  renderPinModal(`
    <h3>📌 Request PIN</h3>

    <input id="pinRequestType"
      placeholder="upgrade / repurchase"
      style="width:100%;margin-bottom:10px;"
    />

    <input id="pinRequestAmount"
      placeholder="Amount"
      type="number"
      style="width:100%;margin-bottom:10px;"
    />

    <input id="pinPaymentId"
      placeholder="Payment ID"
      style="width:100%;margin-bottom:10px;"
    />

    <button onclick="submitPinRequest()">
      Submit Request
    </button>

    <button onclick="closePinModal()">
      Close
    </button>
  `);
}

// ================= OPEN ASSIGN PANEL =================
function openAssignPinPanel(payload = {}) {

  renderPinModal(`
    <h3>📌 Assign PIN</h3>

    <p>PIN ID: ${payload.pinId || "-"}</p>

    <input id="assignToUser"
      placeholder="User ID"
      style="width:100%;margin-bottom:10px;"
    />

    <button onclick="submitAssignPin('${payload.pinId || ""}')">
      Assign
    </button>

    <button onclick="closePinModal()">
      Close
    </button>
  `);
}

// ================= OPEN APPROVE PANEL =================
function openApprovePanel(payload = {}) {

  renderPinModal(`
    <h3>✅ Approve Request</h3>

    <p>Request ID: ${payload.requestId || "-"}</p>

    <button onclick="submitApproveRequest('${payload.requestId || ""}')">
      Approve Now
    </button>

    <button onclick="closePinModal()">
      Close
    </button>
  `);
}

// ================= MODAL RENDER =================
function renderPinModal(content) {

  const root = document.getElementById("pinModalRoot");

  if (!root) return;

  root.innerHTML = `
    <div style="
      position:fixed;
      top:0;
      left:0;
      width:100%;
      height:100%;
      background:rgba(0,0,0,0.5);
      z-index:99999;
      display:flex;
      align-items:center;
      justify-content:center;
    ">

      <div style="
        background:#fff;
        padding:20px;
        width:400px;
        border-radius:10px;
      ">
        ${content}
      </div>

    </div>
  `;
}

// ================= CLOSE MODAL =================
function closePinModal() {

  const root = document.getElementById("pinModalRoot");

  if (!root) return;

  root.innerHTML = "";
}

// ================= REQUEST SUBMIT =================
function submitPinRequest() {

  const type = document.getElementById("pinRequestType")?.value;
  const amount = document.getElementById("pinRequestAmount")?.value;
  const paymentId = document.getElementById("pinPaymentId")?.value;

  execute("REQUEST_PIN", {
    type,
    amount,
    paymentId
  });

  closePinModal();
}

// ================= ASSIGN SUBMIT =================
function submitAssignPin(pinId) {

  const toId = document.getElementById("assignToUser")?.value;

  execute("ASSIGN_PIN", {
    pinId,
    toId
  });

  closePinModal();
}

// ================= APPROVE SUBMIT =================
function submitApproveRequest(requestId) {

  execute("APPROVE_REQUEST", {
    requestId
  });

  closePinModal();
}

// ================= EXECUTION =================
function execute(action, payload) {

  try {

    if (typeof routePinRequest === "function") {
      return routePinRequest(action, payload);
    }

    if (typeof handlePinAction === "function") {
      return handlePinAction(action, payload);
    }

    console.error("PIN SYSTEM NOT AVAILABLE");

    return false;

  } catch (err) {

    console.error("PIN INJECTOR ERROR:", err);

    return false;
  }
}

// ================= DOM OBSERVER =================
function observeDOMChanges() {

  const observer = new MutationObserver(() => {

    bindPinElements();

  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// ================= EXPORT =================
window.initPinInjector = initInjector;

window.openPinRequestPanel = openPinRequestPanel;
window.openAssignPinPanel = openAssignPinPanel;
window.openApprovePanel = openApprovePanel;

window.closePinModal = closePinModal;

window.submitPinRequest = submitPinRequest;
window.submitAssignPin = submitAssignPin;
window.submitApproveRequest = submitApproveRequest;

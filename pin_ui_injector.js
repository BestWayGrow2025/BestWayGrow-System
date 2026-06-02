"use strict";

/*
========================================
PIN UI AUTO INJECTOR V3.1 FINAL SAFE
========================================
✔ Contract-safe UI initialization
✔ Engine-based execution only
✔ Event bus integration added
✔ No direct routing bypass
✔ MutationObserver-safe
✔ Production locked UI layer
========================================
*/

(function () {

  // ================= INIT GUARD =================
  if (window.__PIN_UI_INJECTOR__) return;

  window.__PIN_UI_INJECTOR__ = true;

  // ================= CONTRACT SAFETY =================
  if (!window.PIN_GLOBAL_CONTRACT) {
    console.error("[PIN UI INJECTOR] Contract not loaded");
    return;
  }

  document.addEventListener("DOMContentLoaded", initInjector);

})();

// ================= INIT =================
function initInjector() {

  injectModalRoot();
  bindPinElements();
  observeDOMChanges();

  window.broadcastPinEvent?.("PIN_UI_INJECTOR_READY", {});
}

// ================= ELEMENT BIND =================
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

// ================= MODAL SYSTEM =================
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
  if (root) root.innerHTML = "";

  window.broadcastPinEvent?.("PIN_MODAL_CLOSED", {});
}

// ================= OPEN PANELS =================
function openPinRequestPanel() {

  renderPinModal(`
    <h3>📌 Request PIN</h3>

    <input id="pinRequestType" placeholder="upgrade / repurchase" style="width:100%;margin-bottom:10px;" />
    <input id="pinRequestAmount" type="number" placeholder="Amount" style="width:100%;margin-bottom:10px;" />
    <input id="pinPaymentId" placeholder="Payment ID" style="width:100%;margin-bottom:10px;" />

    <button onclick="submitPinRequest()">Submit Request</button>
    <button onclick="closePinModal()">Close</button>
  `);

  window.broadcastPinEvent?.("PIN_UI_OPEN", { type: "REQUEST" });
}

function openAssignPinPanel(payload = {}) {

  renderPinModal(`
    <h3>📌 Assign PIN</h3>
    <p>PIN ID: ${payload.pinId || "-"}</p>

    <input id="assignToUser" placeholder="User ID" style="width:100%;margin-bottom:10px;" />

    <button onclick="submitAssignPin('${payload.pinId || ""}')">Assign</button>
    <button onclick="closePinModal()">Close</button>
  `);

  window.broadcastPinEvent?.("PIN_UI_OPEN", { type: "ASSIGN" });
}

function openApprovePanel(payload = {}) {

  renderPinModal(`
    <h3>✅ Approve Request</h3>
    <p>Request ID: ${payload.requestId || "-"}</p>

    <button onclick="submitApproveRequest('${payload.requestId || ""}')">Approve Now</button>
    <button onclick="closePinModal()">Close</button>
  `);

  window.broadcastPinEvent?.("PIN_UI_OPEN", { type: "APPROVE" });
}

// ================= SUBMIT ACTIONS =================
function submitPinRequest() {

  const type = document.getElementById("pinRequestType")?.value;
  const amount = document.getElementById("pinRequestAmount")?.value;
  const paymentId = document.getElementById("pinPaymentId")?.value;

  window.dispatchPinAction?.("REQUEST_PIN", {
    type,
    amount,
    paymentId
  });

  window.broadcastPinEvent?.("PIN_REQUEST_SUBMITTED", { type, amount });

  closePinModal();
}

function submitAssignPin(pinId) {

  const toId = document.getElementById("assignToUser")?.value;

  window.dispatchPinAction?.("ASSIGN_PIN", {
    pinId,
    toId
  });

  window.broadcastPinEvent?.("PIN_ASSIGN_SUBMITTED", { pinId, toId });

  closePinModal();
}

function submitApproveRequest(requestId) {

  window.dispatchPinAction?.("APPROVE_REQUEST", {
    requestId
  });

  window.broadcastPinEvent?.("PIN_APPROVE_SUBMITTED", { requestId });

  closePinModal();
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

// ================= EXPORTS =================
window.initPinInjector = initInjector;

window.openPinRequestPanel = openPinRequestPanel;
window.openAssignPinPanel = openAssignPinPanel;
window.openApprovePanel = openApprovePanel;

window.closePinModal = closePinModal;

window.submitPinRequest = submitPinRequest;
window.submitAssignPin = submitAssignPin;
window.submitApproveRequest = submitApproveRequest;

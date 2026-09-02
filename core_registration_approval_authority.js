"use strict";

/*
========================================
REGISTRATION APPROVAL AUTHORITY V1.0
========================================

Single authority for:
• Approval
• Rejection
• Queue status update
• Queue persistence
• Audit/Event notification

========================================
*/

function approveRegistration(fingerprint) {

  if (!fingerprint) return false;

  if (
    typeof getRegQueue !== "function" ||
    typeof saveRegQueue !== "function"
  ) {
    return false;
  }

  const queue = getRegQueue();

  const index = queue.findIndex(function (row) {
    return (
      row &&
      row.fingerprint === fingerprint &&
      row.status === "PENDING"
    );
  });

  if (index === -1) return false;

  queue[index].status = "APPROVED";
  queue[index].approvedAt = Date.now();

  saveRegQueue(queue);

 if (typeof emitSystemEvent === "function") {
    emitSystemEvent(
      "REGISTRATION_APPROVED",
      {
        fingerprint: fingerprint
      }
    );
  }

  /*
  ========================================
  APPROVAL → REGISTRATION QUEUE PROCESSING
  ========================================
  Existing queue authority remains in
  core_registration_queue_manager.js.

  RBK-019 does NOT redefine:
  • processRegistrationQueue()
  • startRegistrationQueue()
  • createUserWithTree()

  It only triggers the existing queue processor
  after successful approval.
  ========================================
  */

  if (typeof processRegistrationQueue === "function") {
    processRegistrationQueue();
  }

  return true;
}
function rejectRegistration(fingerprint) {

  if (!fingerprint) return false;

  if (
    typeof getRegQueue !== "function" ||
    typeof saveRegQueue !== "function"
  ) {
    return false;
  }

  const queue = getRegQueue();

  const index = queue.findIndex(function (row) {
    return (
      row &&
      row.fingerprint === fingerprint &&
      row.status === "PENDING"
    );
  });

  if (index === -1) return false;

  queue[index].status = "REJECTED";
  queue[index].rejectedAt = Date.now();

  saveRegQueue(queue);

  if (typeof emitSystemEvent === "function") {
    emitSystemEvent(
      "REGISTRATION_REJECTED",
      {
        fingerprint: fingerprint
      }
    );
  }

  return true;
}


window.approveRegistration =
  approveRegistration;

window.rejectRegistration =
  rejectRegistration;

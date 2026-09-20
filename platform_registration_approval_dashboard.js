"use strict";

/*
========================================
REGISTRATION APPROVAL AUTHORITY
RETIRED FROM ACTIVE REGISTRATION FLOW
========================================

RBK-004 is the sole authority for:
• QUEUED
• PROCESSING
• DONE
• FAILED
• Registration processing

RBK-019 no longer:
• Approves registration
• Rejects registration
• Changes registration queue status
• Starts registration processing

The Registration Approval Dashboard may remain
as a separate monitoring/history surface.
========================================
*/

function approveRegistration(fingerprint) {

  console.warn(
    "[REGISTRATION APPROVAL] Manual approval is disabled. Registration is automatic."
  );

  return false;
}


function rejectRegistration(fingerprint) {

  console.warn(
    "[REGISTRATION APPROVAL] Manual rejection is disabled. Registration is automatic."
  );

  return false;
}


window.approveRegistration =
  approveRegistration;

window.rejectRegistration =
  rejectRegistration;

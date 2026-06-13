"use strict";

/*
========================================
WALLET SYNC ENGINE DISABLED
========================================
✔ wallet_system.js is source of truth
✔ wallet_engine.js disabled
✔ Prevents wallet overwrite risk
✔ Prevents reconciliation conflicts
========================================
*/

console.warn(
  "[WALLET SYNC ENGINE] Disabled - wallet_system.js is authoritative"
);

function rebuildWalletFromLedger() {

  console.warn(
    "rebuildWalletFromLedger disabled"
  );

  return false;
}

window.__WALLET_SYNC_ENGINE__ = {
  initialized: true,
  ready: true,
  disabled: true,
  timestamp: Date.now()
};

window.rebuildWalletFromLedger =
  rebuildWalletFromLedger;

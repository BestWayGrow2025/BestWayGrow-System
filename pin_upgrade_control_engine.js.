"use strict";

/*
========================================
PIN UPGRADE CONTROL ENGINE V1.0
========================================
✔ START_UPGRADE activates Upgrade products
✔ STOP_UPGRADE deactivates Upgrade products
✔ Uses existing PIN_PRODUCT_MASTER storage
✔ Registers with existing PIN engine registry
✔ Repurchase products remain unchanged
✔ No fallback or duplicate engine
========================================
*/

(function () {
  if (window.__PIN_UPGRADE_CONTROL_ENGINE__) return;

  function setUpgradeProducts(targetStatus) {
    try {
      // Require existing safety and authority infrastructure.
      if (
        typeof window.isPinFlowSystemSafe !== "function" ||
        window.isPinFlowSystemSafe() !== true
      ) {
        return { success: false, reason: "PIN system is not safe" };
      }

      if (
        typeof window.getPinProducts !== "function" ||
        typeof window.savePinProducts !== "function"
      ) {
        return { success: false, reason: "PIN product master unavailable" };
      }

      const products = window.getPinProducts();

      if (!Array.isArray(products)) {
        return { success: false, reason: "Invalid PIN product data" };
      }

      const upgradeProducts = products.filter(
        product => product && product.pinType === "upgrade"
      );

      if (upgradeProducts.length === 0) {
        return { success: false, reason: "No Upgrade products found" };
      }

      let changed = 0;

      upgradeProducts.forEach(product => {
        if (product.status !== targetStatus) {
          product.status = targetStatus;
          product.updatedAt = Date.now();
          changed++;
        }
      });

      if (!window.savePinProducts(products)) {
        return { success: false, reason: "Could not save product status" };
      }

      return {
        success: true,
        action: targetStatus === "active"
          ? "START_UPGRADE"
          : "STOP_UPGRADE",
        affected: upgradeProducts.length,
        changed: changed
      };
    } catch (error) {
      console.error("[PIN UPGRADE CONTROL ERROR]", error);
      return { success: false, reason: "Upgrade control failed" };
    }
  }

  function startUpgrade() {
    return setUpgradeProducts("active");
  }

  function stopUpgrade() {
    return setUpgradeProducts("inactive");
  }

  // Do not create or replace the engine registry.
  const engineCore = window.PIN_ENGINE_CORE;

  if (
    !engineCore ||
    typeof engineCore.register !== "function"
  ) {
    console.error(
      "[PIN UPGRADE CONTROL] Existing PIN engine registry unavailable"
    );
    return;
  }

  if (
    typeof window.getPinProducts !== "function" ||
    typeof window.savePinProducts !== "function"
  ) {
    console.error(
      "[PIN UPGRADE CONTROL] PIN product master unavailable"
    );
    return;
  }

  engineCore.register("startUpgrade", startUpgrade);
  engineCore.register("stopUpgrade", stopUpgrade);

  window.__PIN_UPGRADE_CONTROL_ENGINE__ = true;

  console.log("[PIN UPGRADE CONTROL ENGINE] REGISTERED");
})();

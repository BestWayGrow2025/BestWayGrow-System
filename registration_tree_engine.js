"use strict";

/*
========================================
REGISTRATION TREE ENGINE V5.0
COMPATIBILITY WRAPPER
========================================
✔ Reuses tree_system.js implementation
✔ No duplicate business logic
✔ Safe fallback compatibility layer
✔ Production LOCKED
========================================
*/

(function () {

  if (window.__REGISTRATION_TREE_ENGINE__) return;

  window.__REGISTRATION_TREE_ENGINE__ = true;

  // Ensure required functions exist
  if (typeof window.createUserWithTree !== "function") {
    console.error(
      "[REGISTRATION TREE ENGINE] createUserWithTree not found. Load tree_system.js first."
    );
    return;
  }

  // Compatibility aliases
  window.registerUserWithTree = window.createUserWithTree;

  // Required diagnostics compatibility
  window.__TREE_ENGINE_ACTIVE__ = true;

  if (typeof window.getTreeData !== "function") {
    window.getTreeData = function () {
      if (typeof window.getUsers === "function") {
        return window.getUsers() || [];
      }
      return [];
    };
  }

  console.log("[REGISTRATION TREE ENGINE] Compatibility wrapper loaded");

})();

"use strict";

/*
========================================
UI RENDER MANAGER v1.0 (ENTERPRISE FINAL)
========================================
✔ Centralized UI rendering authority
✔ Prevents duplicate DOM injection
✔ Prevents nested render contamination
✔ Safe viewport replacement
✔ Mounted module tracking
✔ Duplicate mount prevention
✔ Enterprise dashboard compatible
✔ Diagnostics compatible
✔ Production LOCKED
========================================
*/

(function () {

  // ========================================
  // INIT GUARD
  // ========================================
  if (window.__UI_RENDER_MANAGER__) {
    console.log("[UI RENDER] Already Loaded");
    return;
  }

  window.__UI_RENDER_MANAGER__ = true;

  console.log("[UI RENDER] Initializing");

  // ========================================
  // INTERNAL STATE
  // ========================================
  const UI_RENDER_STATE = {

    mountedModules: {},

    currentPage: null,

    renderCount: 0,

    lastRenderAt: null
  };

  // ========================================
  // MAIN VIEWPORT
  // ========================================
  function getViewport() {

    return (
      document.getElementById("mainContent") ||
      null
    );
  }

  // ========================================
  // SAFE HTML REPLACEMENT
  // ========================================
  function replaceViewport(content = "") {

    const viewport = getViewport();

    if (!viewport) {
      console.warn("[UI RENDER] Viewport Missing");
      return false;
    }

    try {

      viewport.innerHTML = content;

      UI_RENDER_STATE.renderCount++;
      UI_RENDER_STATE.lastRenderAt = Date.now();

      return true;

    } catch (err) {

      console.error("[UI RENDER ERROR]", err);
      return false;
    }
  }

  // ========================================
  // CLEAR VIEWPORT
  // ========================================
  function clearViewport() {

    return replaceViewport("");
  }

  // ========================================
  // PREVENT DUPLICATE MODULE MOUNT
  // ========================================
  function isMounted(moduleId) {

    return !!UI_RENDER_STATE.mountedModules[moduleId];
  }

  // ========================================
  // REGISTER MOUNT
  // ========================================
  function registerMount(moduleId) {

    UI_RENDER_STATE.mountedModules[moduleId] = {
      mounted: true,
      timestamp: Date.now()
    };
  }

  // ========================================
  // UNREGISTER MOUNT
  // ========================================
  function unregisterMount(moduleId) {

    delete UI_RENDER_STATE.mountedModules[moduleId];
  }

  // ========================================
  // SAFE MODULE RENDER
  // ========================================
  function renderModule(moduleId, html = "") {

    if (!moduleId) {
      console.warn("[UI RENDER] Missing Module ID");
      return false;
    }

    // Prevent duplicate same-page rendering
    if (
      UI_RENDER_STATE.currentPage === moduleId &&
      isMounted(moduleId)
    ) {

      console.log(
        "[UI RENDER] Duplicate Render Prevented:",
        moduleId
      );

      return false;
    }

    try {

      // Clear previous state
      UI_RENDER_STATE.mountedModules = {};

      // Replace viewport
      replaceViewport(html);

      // Register new mount
      registerMount(moduleId);

      // Set active page
      UI_RENDER_STATE.currentPage = moduleId;

      console.log(
        "[UI RENDER] Mounted:",
        moduleId
      );

      return true;

    } catch (err) {

      console.error(
        "[UI RENDER MODULE ERROR]",
        err
      );

      return false;
    }
  }

  // ========================================
  // SAFE COMPONENT INJECTION
  // ========================================
  function mountComponent(
    targetId,
    html = "",
    options = {}
  ) {

    try {

      const target =
        document.getElementById(targetId);

      if (!target) {
        console.warn(
          "[UI RENDER] Component Target Missing:",
          targetId
        );
        return false;
      }

      const mode =
        options.mode || "replace";

      // Replace
      if (mode === "replace") {
        target.innerHTML = html;
      }

      // Append
      else if (mode === "append") {

        const wrapper =
          document.createElement("div");

        wrapper.innerHTML = html;

        target.appendChild(wrapper);
      }

      return true;

    } catch (err) {

      console.error(
        "[UI COMPONENT ERROR]",
        err
      );

      return false;
    }
  }

  // ========================================
  // ACTIVE PAGE
  // ========================================
  function getCurrentPage() {

    return UI_RENDER_STATE.currentPage;
  }

  // ========================================
  // RENDER STATUS
  // ========================================
  function getRenderStatus() {

    return {

      currentPage:
        UI_RENDER_STATE.currentPage,

      renderCount:
        UI_RENDER_STATE.renderCount,

      lastRenderAt:
        UI_RENDER_STATE.lastRenderAt,

      mountedModules:
        Object.keys(
          UI_RENDER_STATE.mountedModules
        )
    };
  }

  // ========================================
  // DIAGNOSTICS SUPPORT
  // ========================================
  function renderDiagnosticsCard() {

    const status = getRenderStatus();

    return `
      <div class="ui-render-diagnostics">

        <h3>🎨 UI Render Manager</h3>

        <p>
          <strong>Current Page:</strong>
          ${status.currentPage || "None"}
        </p>

        <p>
          <strong>Render Count:</strong>
          ${status.renderCount}
        </p>

        <p>
          <strong>Mounted Modules:</strong>
          ${status.mountedModules.join(", ") || "None"}
        </p>

      </div>
    `;
  }

  // ========================================
  // GLOBAL EXPORTS
  // ========================================
  window.renderModule = renderModule;

  window.replaceViewport = replaceViewport;

  window.clearViewport = clearViewport;

  window.mountComponent = mountComponent;

  window.unregisterMount = unregisterMount;

  window.getCurrentRenderedPage = getCurrentPage;

  window.getUIRenderStatus = getRenderStatus;

  window.renderDiagnosticsCard =
    renderDiagnosticsCard;

  window.UI_RENDER_STATE =
    UI_RENDER_STATE;

  console.log("[UI RENDER] READY");

})();

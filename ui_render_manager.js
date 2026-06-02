"use strict";

/*
========================================
UI RENDER MANAGER v1.1 FINAL SAFE
========================================
*/

(function () {

  // ================= INIT GUARD =================
  if (window.__UI_RENDER_MANAGER__) {
    console.log("[UI RENDER] Already Loaded");
    return;
  }

  window.__UI_RENDER_MANAGER__ = true;

  console.log("[UI RENDER] Initializing");

  // ================= CONTRACT SAFETY =================
  if (!window.PIN_GLOBAL_CONTRACT) {
    console.error("[UI RENDER] Contract not loaded");
    return;
  }

  // ================= INTERNAL STATE =================
  const UI_RENDER_STATE = {
    mountedModules: {},
    currentPage: null,
    renderCount: 0,
    lastRenderAt: null,
    history: []
  };

  // ================= VIEWPORT =================
  function getViewport() {
    return document.getElementById("mainContent") || null;
  }

  // ================= EVENT EMITTER =================
  function emit(eventName, payload = {}) {
    if (typeof window.broadcastPinEvent === "function") {
      window.broadcastPinEvent(eventName, {
        ...payload,
        timestamp: Date.now()
      });
    }
  }

  // ================= REPLACE VIEWPORT =================
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

      emit("UI_VIEWPORT_REPLACED", {
        renderCount: UI_RENDER_STATE.renderCount
      });

      return true;

    } catch (err) {
      console.error("[UI RENDER ERROR]", err);
      return false;
    }
  }

  // ================= CLEAR =================
  function clearViewport() {
    return replaceViewport("");
  }

  // ================= MOUNT CHECK =================
  function isMounted(moduleId) {
    return !!UI_RENDER_STATE.mountedModules[moduleId];
  }

  // ================= REGISTER =================
  function registerMount(moduleId) {
    UI_RENDER_STATE.mountedModules[moduleId] = {
      mounted: true,
      timestamp: Date.now()
    };
  }

  // ================= RENDER MODULE =================
  function renderModule(moduleId, html = "") {

    if (!moduleId) {
      console.warn("[UI RENDER] Missing Module ID");
      return false;
    }

    if (
      UI_RENDER_STATE.currentPage === moduleId &&
      isMounted(moduleId)
    ) {
      console.log("[UI RENDER] Duplicate Render Prevented:", moduleId);
      return false;
    }

    try {

      if (UI_RENDER_STATE.currentPage) {
        UI_RENDER_STATE.history.push(UI_RENDER_STATE.currentPage);
      }

      UI_RENDER_STATE.mountedModules = {};

      emit("UI_RENDER_START", { moduleId });

      replaceViewport(html);

      registerMount(moduleId);

      UI_RENDER_STATE.currentPage = moduleId;

      emit("UI_RENDER_COMPLETE", { moduleId });

      console.log("[UI RENDER] Mounted:", moduleId);

      return true;

    } catch (err) {

      console.error("[UI RENDER MODULE ERROR]", err);

      emit("UI_RENDER_ERROR", {
        moduleId,
        error: err.message
      });

      return false;
    }
  }

  // ================= COMPONENT MOUNT =================
  function mountComponent(targetId, html = "", options = {}) {

    try {
      const target = document.getElementById(targetId);
      if (!target) return false;

      if (options.mode === "append") {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        target.appendChild(wrapper);
      } else {
        target.innerHTML = html;
      }

      emit("UI_COMPONENT_MOUNTED", {
        targetId,
        mode: options.mode || "replace"
      });

      return true;

    } catch (err) {
      console.error("[UI COMPONENT ERROR]", err);
      return false;
    }
  }

  // ================= STATUS =================
  function getRenderStatus() {
    return {
      currentPage: UI_RENDER_STATE.currentPage,
      renderCount: UI_RENDER_STATE.renderCount,
      lastRenderAt: UI_RENDER_STATE.lastRenderAt
    };
  }

  // ================= GLOBAL EXPORTS (FIXED) =================
  window.renderModule = renderModule;
  window.clearViewport = clearViewport;
  window.mountComponent = mountComponent;
  window.getUIRenderStatus = getRenderStatus;

  console.log("[UI RENDER] READY");

})();

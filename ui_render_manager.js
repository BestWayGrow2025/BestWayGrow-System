"use strict";

/*
========================================
UI RENDER MANAGER v1.1 FINAL SAFE
========================================
*/

(function () {

  if (window.__UI_RENDER_MANAGER__) {
    console.log("[UI RENDER] Already Loaded");
    return;
  }

  window.__UI_RENDER_MANAGER__ = true;

  if (!window.PIN_GLOBAL_CONTRACT) {
    console.error("[UI RENDER] Contract not loaded");
    return;
  }

  const UI_RENDER_STATE = {
    mountedModules: {},
    currentPage: null,
    renderCount: 0,
    lastRenderAt: null,
    history: []
  };

  function getViewport() {
    return document.getElementById("mainContent") || null;
  }

  function emit(eventName, payload = {}) {
    if (typeof window.broadcastPinEvent === "function") {
      window.broadcastPinEvent(eventName, {
        ...payload,
        timestamp: Date.now()
      });
    }
  }

  function replaceViewport(content = "") {
    const viewport = getViewport();
    if (!viewport) return false;

    viewport.innerHTML = content;

    UI_RENDER_STATE.renderCount++;
    UI_RENDER_STATE.lastRenderAt = Date.now();

    emit("UI_VIEWPORT_REPLACED", {
      renderCount: UI_RENDER_STATE.renderCount
    });

    return true;
  }

  function clearViewport() {
    return replaceViewport("");
  }

  function isMounted(moduleId) {
    return !!UI_RENDER_STATE.mountedModules[moduleId];
  }

  function registerMount(moduleId) {
    UI_RENDER_STATE.mountedModules[moduleId] = {
      mounted: true,
      timestamp: Date.now()
    };
  }

  function renderModule(moduleId, html = "") {

    if (!moduleId) return false;

    if (
      UI_RENDER_STATE.currentPage === moduleId &&
      isMounted(moduleId)
    ) return false;

    if (UI_RENDER_STATE.currentPage) {
      UI_RENDER_STATE.history.push(UI_RENDER_STATE.currentPage);
    }

    UI_RENDER_STATE.mountedModules = {};

    emit("UI_RENDER_START", { moduleId });

    replaceViewport(html);

    registerMount(moduleId);

    UI_RENDER_STATE.currentPage = moduleId;

    emit("UI_RENDER_COMPLETE", { moduleId });

    return true;
  }

  function mountComponent(targetId, html = "", options = {}) {

    const target = document.getElementById(targetId);
    if (!target) return false;

    if (options.mode === "append") {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;
      target.appendChild(wrapper);
    } else {
      target.innerHTML = html;
    }

    return true;
  }

  function getRenderStatus() {
    return {
      currentPage: UI_RENDER_STATE.currentPage,
      renderCount: UI_RENDER_STATE.renderCount,
      lastRenderAt: UI_RENDER_STATE.lastRenderAt
    };
  }

  // 🔥 GLOBAL EXPORTS (CRITICAL FIX)
  window.renderModule = renderModule;
  window.clearViewport = clearViewport;
  window.getUIRenderStatus = getRenderStatus;

})();

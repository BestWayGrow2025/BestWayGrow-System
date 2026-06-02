"use strict";

/*
========================================
UI RENDER MANAGER v1.1 FINAL SAFE
========================================
✔ Centralized UI rendering authority
✔ Contract-aware boot safety
✔ Event bus integration enabled
✔ Safe module lifecycle tracking
✔ Controlled state mutation
✔ Production-ready UI layer core
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

  // ================= SAFE VIEWPORT REPLACEMENT =================
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

  // ================= CLEAR VIEWPORT =================
  function clearViewport() {
    return replaceViewport("");
  }

  // ================= MODULE TRACKING =================
  function isMounted(moduleId) {
    return !!UI_RENDER_STATE.mountedModules[moduleId];
  }

  function registerMount(moduleId) {
    UI_RENDER_STATE.mountedModules[moduleId] = {
      mounted: true,
      timestamp: Date.now()
    };
  }

  function unregisterMount(moduleId) {
    delete UI_RENDER_STATE.mountedModules[moduleId];
  }

  // ================= SAFE MODULE RENDER =================
  function renderModule(moduleId, html = "") {

    if (!moduleId) {
      console.warn("[UI RENDER] Missing Module ID");
      return false;
    }

    // Prevent duplicate render
    if (
      UI_RENDER_STATE.currentPage === moduleId &&
      isMounted(moduleId)
    ) {
      console.log("[UI RENDER] Duplicate Render Prevented:", moduleId);
      return false;
    }

    try {

      // Track history BEFORE overwrite
      if (UI_RENDER_STATE.currentPage) {
        UI_RENDER_STATE.history.push(UI_RENDER_STATE.currentPage);
      }

      // Clear only module state (not full system reset)
      UI_RENDER_STATE.mountedModules = {};

      emit("UI_RENDER_START", { moduleId });

      // Render
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

      if (!target) {
        console.warn("[UI RENDER] Component Target Missing:", targetId);
        return false;
      }

      const mode = options.mode || "replace";

      if (mode === "replace") {
        target.innerHTML = html;
      }

      else if (mode === "append") {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        target.appendChild(wrapper);
      }

      emit("UI_COMPONENT_MOUNTED", {
        targetId,
        mode
      });

      return true;

    } catch (err) {

      console.error("[UI COMPONENT ERROR]", err);

      emit("UI_COMPONENT_ERROR", {
        targetId,
        error: err.message
      });

      return false;
    }
  }

  // ================= STATUS =================
  function getRenderStatus() {

    return {

      currentPage: UI_RENDER_STATE.currentPage,

      renderCount: UI_RENDER_STATE.renderCount,

      lastRenderAt: UI_RENDER_STATE.lastRender

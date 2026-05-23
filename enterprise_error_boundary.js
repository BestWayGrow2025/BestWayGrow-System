"use strict";

/*
========================================
ENTERPRISE ERROR BOUNDARY v1.0 (FINAL CORE)
========================================
✔ Global error catcher
✔ Promise rejection handler
✔ Safe execution wrapper
✔ Module isolation wrapper
✔ Lightweight fallback UI
✔ Production LOCKED
========================================
*/

(function () {

  // ================= GUARD =================
  if (window.__ENTERPRISE_ERROR_BOUNDARY__) return;

  window.__ENTERPRISE_ERROR_BOUNDARY__ = {
    loaded: true,
    version: "1.0"
  };

  console.log("[ERROR BOUNDARY] ACTIVE");

  // ================= ERROR LOG =================
  const LOG = [];
  const MAX = 50;

  function push(err, ctx) {

    LOG.push({
      message: err?.message || String(err),
      stack: err?.stack || null,
      ctx,
      time: Date.now()
    });

    if (LOG.length > MAX) LOG.shift();

    console.error("[ERROR]", ctx, err);
  }

  // ================= GLOBAL HANDLERS =================
  window.addEventListener("error", (e) => {
    push(e.error || e.message, "window");
    e.preventDefault?.();
  });

  window.addEventListener("unhandledrejection", (e) => {
    push(e.reason, "promise");
    e.preventDefault?.();
  });

  // ================= SAFE EXECUTE =================
  function safe(fn, ctx = "safe") {
    try {
      return typeof fn === "function" ? fn() : null;
    } catch (err) {
      push(err, ctx);
      return null;
    }
  }

  // ================= MODULE WRAPPER =================
  function wrap(fn, name = "module") {

    if (typeof fn !== "function") return fn;

    return function (...args) {

      try {
        return fn.apply(this, args);
      } catch (err) {
        push(err, name);
        return null;
      }
    };
  }

  // ================= FALLBACK UI =================
  function fallbackUI() {

    const el = document.getElementById("mainContent");
    if (!el) return;

    el.innerHTML = `
      <div style="padding:15px;background:#c0392b;color:#fff">
        <b>System Error</b><br/>
        Fallback UI Active
      </div>
    `;
  }

  // ================= API =================
  function getLogs() {
    return LOG;
  }

  function clearLogs() {
    LOG.length = 0;
  }

  // ================= EXPORT =================
  window.safeExecute = safe;
  window.wrapModule = wrap;
  window.getErrorLog = getLogs;
  window.clearErrorLog = clearLogs;
  window.renderFallbackUI = fallbackUI;

})();

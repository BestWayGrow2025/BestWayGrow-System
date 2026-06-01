"use strict";

function bindPinUI() {

  console.log("[PIN UI] Binding UI system...");

  if (typeof window.ui_render_manager !== "undefined") {
    window.ui_render_manager.init?.();
  }

  if (typeof window.pin_ui_launcher !== "undefined") {
    window.pin_ui_launcher.init?.();
  }

  if (typeof window.pin_ui_injector !== "undefined") {
    window.pin_ui_injector.init?.();
  }

  return true;
}

window.bindPinUI = bindPinUI;

"use strict";

(function () {

  if (window.PIN_ZERO_ORDER_BOOT) return;
  window.PIN_ZERO_ORDER_BOOT = true;

  const MODULES = {};
  const GRAPH = {};

  // Register module with dependencies
  function define(name, deps, factory) {

    MODULES[name] = {
      deps: deps || [],
      factory
    };

  }

  // Build dependency graph
  function buildGraph() {

    Object.keys(MODULES).forEach(name => {

      GRAPH[name] = MODULES[name].deps || [];

    });

  }

  // Topological sort (correct execution order)
  function resolveOrder() {

    const visited = new Set();
    const result = [];

    function visit(node) {

      if (visited.has(node)) return;

      visited.add(node);

      (GRAPH[node] || []).forEach(dep => {
        visit(dep);
      });

      result.push(node);

    }


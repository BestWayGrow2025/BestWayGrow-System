/* =========================
   TREE CONTAINER
========================= */
#tree {
  width: 100%;
  overflow-x: auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

/* =========================
   ROOT TREE WRAPPER
========================= */
.tree-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

/* =========================
   USER CARD (NODE)
========================= */
.tree-card {
  background: #0f172a;
  color: #ffffff;
  padding: 12px 16px;
  border-radius: 12px;
  min-width: 150px;
  text-align: center;
  box-shadow: 0 6px 18px rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.08);
  transition: 0.2s ease;
}

.tree-card:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 22px rgba(0,0,0,0.35);
}

/* =========================
   TEXT STYLES
========================= */
.tree-card div:first-child {
  font-weight: bold;
  font-size: 14px;
}

.tree-card div:nth-child(2) {
  font-size: 12px;
  opacity: 0.85;
  margin-top: 4px;
}

.tree-card div:nth-child(3) {
  font-size: 11px;
  opacity: 0.6;
}

/* =========================
   CHILD CONTAINER (LEFT / RIGHT)
========================= */
.tree-children {
  display: flex;
  justify-content: space-between;
  gap: 60px;
  margin-top: 25px;
  position: relative;
}

/* =========================
   LINES (VISUAL CONNECTOR)
========================= */
.tree-children::before {
  content: "";
  position: absolute;
  top: -15px;
  left: 50%;
  width: 2px;
  height: 15px;
  background: #94a3b8;
}

/* =========================
   LEFT / RIGHT BRANCHES
========================= */
.tree-children > div {
  display: flex;
  flex: 1;
  justify-content: center;
  position: relative;
}

/* horizontal connectors */
.tree-children > div::before {
  content: "";
  position: absolute;
  top: -15px;
  width: 100%;
  height: 2px;
  background: #94a3b8;
}


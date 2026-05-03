/*
========================================
ADMIN PIN STOCK V1.0 (SAFE STOCK LAYER)
========================================
✔ Admin stock visibility
✔ Own stock check
✔ Stock reserve validation
✔ Low stock escalation
✔ Manual stock request trigger
✔ No stock mutation here
✔ Read / route layer only
========================================
*/

// ================= HELPERS =================
function getSafeAdmin() {
  if (typeof getCurrentUser !== "function") return null;
  const user = getCurrentUser();
  return user && user.role === "admin" ? user : null;
}

function getAdminPinStock() {
  const admin = getSafeAdmin();
  if (!admin) return { upgrade: 0, repurchase: 0 };

  return {
    upgrade: Number(admin.availableUpgradePins || 0),
    repurchase: Number(admin.availableRepurchasePins || 0)
  };
}

function hasAdminPinStock(type, qty = 1) {
  qty = Number(qty || 1);
  if (qty < 1) qty = 1;

  const stock = getAdminPinStock();
  return Number(stock[type] || 0) >= qty;
}

// ================= STOCK STATUS =================
function getAdminPinStockStatus() {
  const stock = getAdminPinStock();

  return {
    upgrade: {
      available: stock.upgrade,
      low: stock.upgrade <= 5,
      empty: stock.upgrade <= 0
    },
    repurchase: {
      available: stock.repurchase,
      low: stock.repurchase <= 5,
      empty: stock.repurchase <= 0
    }
  };
}

// ================= REQUEST ESCALATION =================
function canEscalatePinStock(type, qty = 1) {
  if (!["upgrade", "repurchase"].includes(type)) return false;

  const admin = getSafeAdmin();
  if (!admin) return false;

  qty = Number(qty || 1);
  if (qty < 1) qty = 1;

  return !hasAdminPinStock(type, qty);
}

function createAdminStockRequest(type, qty = 1) {
  const admin = getSafeAdmin();
  if (!admin) return null;

  if (!["upgrade", "repurchase"].includes(type)) return null;

  qty = Number(qty || 1);
  if (qty < 1) qty = 1;

  if (!canEscalatePinStock(type, qty)) return null;

  if (typeof createPinRequest !== "function") return null;

  return createPinRequest({
    userId: admin.userId,
    type,
    amount: 0,
    paymentId: "ADMIN_STOCK_" + Date.now(),
    quantity: qty
  });
}

// ================= STOCK VIEW =================
function getAdminStockView() {
  const stock = getAdminPinStockStatus();

  return {
    upgradeAvailable: stock.upgrade.available,
    repurchaseAvailable: stock.repurchase.available,
    upgradeLow: stock.upgrade.low,
    repurchaseLow: stock.repurchase.low,
    upgradeEmpty: stock.upgrade.empty,
    repurchaseEmpty: stock.repurchase.empty
  };
}


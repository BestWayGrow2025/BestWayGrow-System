*/
const INCOME_CONFIG = { UGLI_LEVEL_1: 23.81, UGLI_LEVEL_OTHERS: 1.19, MAX_LEVELS: 30, CTOR_PERCENT: 25 };
// =================================== // 🔹 CALC // =================================== function calc(bv, percent) { return parseFloat(((Number(bv) * Number(percent)) / 100).toFixed(2)); }
// =================================== // 🔒 VALIDATION // =================================== function canRunIncome(type) {
let s = getSystemSettings();
if (!s || typeof s !== "object") return false;
if (s.lockMode === true) return false;
if (type === "upgrade" && s.upgradesOpen === false) return false;
if (type === "repurchase" && s.repurchaseOpen === false) return false;
return true; }
// =================================== // 🔥 SAFE INCOME EXECUTION // =================================== function safeIncome(data) {
try {
if (!data || !data.userId) return false;

let amount = Number(data.amount);
if (isNaN(amount) || amount <= 0) return false;

if (!canRunIncome(data.type)) return false;

if (typeof isIncomeAllowed === "function") {
  if (!isIncomeAllowed(data.type)) return false;
}

// ⚠️ SYSTEM USER SAFE GUARD
if (data.userId === "SYSTEM") {
  console.warn("SYSTEM income skipped (no wallet)");
  return false;
}

let payload = {
  userId: data.userId,
  type: data.type,
  amount: parseFloat(amount.toFixed(2)),
  sourceUser: data.sourceUser || "-",
  note: data.note || ""
};

// 💰 WALLET CREDIT
if (typeof creditWallet === "function") {

  let success = creditWallet(
    payload.userId,
    payload.amount,
    `${payload.type.toUpperCase()} - ${payload.note}`
  );

  if (!success) return false;

} else {
  console.warn("creditWallet missing");
  return false;
}

// 📜 LOG
if (typeof addIncomeLog === "function") {
  addIncomeLog(payload);
}

return true;

} catch (err) {
if (typeof logCritical === "function") {
  logCritical("safeIncome error: " + err.message);
}

return false;

} }
// =================================== // 🔹 HELPERS // =================================== function getUser(userId) {
if (typeof getUserById === "function") { return getUserById(userId); }
if (typeof getUsers === "function") { return getUsers().find(u => u.userId === userId); }
return null; }
function getIntroducer(user) { if (!user || !user.introducerId) return null; return getUser(user.introducerId); }
// =================================== // 🔥 CTOR DISTRIBUTION // =================================== function distributeCTOR(userId, totalCTOR, type) {
const CTOR_SPLIT = [25,15,12,6,6,6,6,6,6,6,6];
totalCTOR = parseFloat(Number(totalCTOR).toFixed(2));
CTOR_SPLIT.forEach((percent, index) => {
let amount = calc(totalCTOR, percent);
if (amount <= 0) return;

safeIncome({
  userId: "SYSTEM",
  type: "ctor",
  amount: amount,
  sourceUser: userId,
  note: `${type.toUpperCase()} CTOR ${index + 1}`
});

}); }
// =================================== // 🔥 UPGRADE INCOME // =================================== function processUpgradeIncome(userId, bv) {
let current = getUser(userId); if (!current) return false;
let level = 1; let safety = 0;
while (level <= INCOME_CONFIG.MAX_LEVELS) {
if (safety++ > 1000) break;

let parent = getIntroducer(current);
if (!parent) break;

let percent = (level === 1)
  ? INCOME_CONFIG.UGLI_LEVEL_1
  : INCOME_CONFIG.UGLI_LEVEL_OTHERS;

let income = calc(bv, percent);

if (income > 0) {
  safeIncome({
    userId: parent.userId,
    type: "upgrade",
    amount: income,
    sourceUser: userId,
    note: `LEVEL ${level}`
  });
}

current = parent;
level++;

}
let totalCTOR = calc(bv, INCOME_CONFIG.CTOR_PERCENT); distributeCTOR(userId, totalCTOR, "upgrade");
return true; }
// =================================== // 🔥 REPURCHASE INCOME // =================================== function processRepurchaseIncome(userId, bv) {
let current = getUser(userId); if (!current) return false;
let usableBV = calc(bv, 50); let rliPool = calc(usableBV, 40); let ctorPool = calc(usableBV, 60);
let perLevel = parseFloat((rliPool / INCOME_CONFIG.MAX_LEVELS).toFixed(2));
let level = 1; let safety = 0;
while (level <= INCOME_CONFIG.MAX_LEVELS) {
if (safety++ > 1000) break;

let parent = getIntroducer(current);
if (!parent) break;

if (perLevel > 0) {
  safeIncome({
    userId: parent.userId,
    type: "repurchase",
    amount: perLevel,
    sourceUser: userId,
    note: `RLI LEVEL ${level}`
  });
}

current = parent;
level++;

}
distributeCTOR(userId, ctorPool, "repurchase");
return true; }
// =================================== // 🚀 MAIN ENTRY // =================================== function processIncome(type, userId, bv) {
try {
bv = Number(bv);

if (!userId || isNaN(bv) || bv <= 0) return false;

if (!canRunIncome(type)) return false;

if (type === "upgrade") {
  return processUpgradeIncome(userId, bv);
}
else if (type === "repurchase") {
  return processRepurchaseIncome(userId, bv);
}
else {
  console.warn("Unknown income type:", type);
  return false;
}

} catch (err) {
if (typeof logCritical === "function") {
  logCritical("processIncome error: " + err.message);
}

return false;

} }

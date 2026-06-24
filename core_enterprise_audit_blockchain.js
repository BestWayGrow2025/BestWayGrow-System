"use strict";

/*
========================================
ENTERPRISE AUDIT BLOCKCHAIN V1.0
========================================
✔ Immutable audit ledger
✔ Hash-linked chain structure
✔ Tamper-evident records
✔ Full system traceability
✔ Export-ready architecture
========================================
*/

console.log("[ENTERPRISE AUDIT BLOCKCHAIN] LOADED");

const AUDIT_CHAIN_KEY = "ENTERPRISE_AUDIT_CHAIN";
const AUDIT_CHAIN_LIMIT = 100000;

/* ================= SIMPLE HASH ================= */

function createAuditHash(str) {
  str = String(str || "");

  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash =
      ((hash << 5) - hash) +
      str.charCodeAt(i);

    hash |= 0; // 32-bit integer
  }

  return "HASH_" + Math.abs(hash).toString(36).toUpperCase();
}

/* ================= LOAD / SAVE ================= */

function getAuditChain() {
  let chain = safeGet(AUDIT_CHAIN_KEY, []);
  return Array.isArray(chain) ? chain : [];
}

function saveAuditChain(chain) {
  if (!Array.isArray(chain)) chain = [];

  if (chain.length > AUDIT_CHAIN_LIMIT) {
    chain = chain.slice(-AUDIT_CHAIN_LIMIT);
  }

  safeSet(AUDIT_CHAIN_KEY, chain);
}

/* ================= CREATE ENTRY ================= */

function appendAuditBlock({
  module = "SYSTEM",
  action = "UNKNOWN",
  userId = null,
  amount = 0,
  refId = null,
  status = "success",
  details = {}
} = {}) {

  let chain = getAuditChain();

  let previousBlock =
    chain.length > 0
      ? chain[chain.length - 1]
      : null;

  let previousHash =
    previousBlock
      ? previousBlock.hash
      : "GENESIS";

  let block = {
    blockId:
      "BLK_" +
      Date.now() +
      "_" +
      Math.floor(Math.random() * 100000),

    index: chain.length + 1,

    timestamp: Date.now(),

    module,
    action,
    userId,

    amount: Number(amount || 0),

    refId,
    status,

    details,

    previousHash,
    hash: null
  };

  block.hash = createAuditHash(
    JSON.stringify({
      index: block.index,
      timestamp: block.timestamp,
      module: block.module,
      action: block.action,
      userId: block.userId,
      amount: block.amount,
      refId: block.refId,
      status: block.status,
      details: block.details,
      previousHash: block.previousHash
    })
  );

  chain.push(block);
  saveAuditChain(chain);

  return block;
}

/* ================= VERIFY CHAIN ================= */

function verifyAuditChain() {
  let chain = getAuditChain();

  if (!chain.length) {
    return {
      valid: true,
      blocks: 0,
      message: "Empty chain"
    };
  }

  for (let i = 0; i < chain.length; i++) {

    let block = chain[i];

    let expectedPrevious =
      i === 0
        ? "GENESIS"
        : chain[i - 1].hash;

    if (block.previousHash !== expectedPrevious) {
      return {
        valid: false,
        index: i + 1,
        reason: "previous_hash_mismatch"
      };
    }

    let expectedHash = createAuditHash(
      JSON.stringify({
        index: block.index,
        timestamp: block.timestamp,
        module: block.module,
        action: block.action,
        userId: block.userId,
        amount: block.amount,
        refId: block.refId,
        status: block.status,
        details: block.details,
        previousHash: block.previousHash
      })
    );

    if (block.hash !== expectedHash) {
      return {
        valid: false,
        index: i + 1,
        reason: "hash_mismatch"
      };
    }
  }

  return {
    valid: true,
    blocks: chain.length,
    message: "Chain verified successfully"
  };
}

/* ================= SEARCH ================= */

function getAuditBlocksByRef(refId) {
  return getAuditChain()
    .filter(b => b.refId === refId)
    .sort((a, b) => b.timestamp - a.timestamp);

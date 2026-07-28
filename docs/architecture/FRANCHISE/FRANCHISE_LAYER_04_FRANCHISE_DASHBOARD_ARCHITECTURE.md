# FRANCHISE LAYER 04 — FRANCHISE DASHBOARD ARCHITECTURE

**Document Name:** FRANCHISE_LAYER_04_FRANCHISE_DASHBOARD_ARCHITECTURE.md  
**Architecture Layer:** 04 — Franchise Dashboard Architecture  
**Module:** Franchise Architecture  
**Location:** `docs/architecture/FRANCHISE/FRANCHISE_LAYER_04_FRANCHISE_DASHBOARD_ARCHITECTURE.md`  
**Status:** ✅ Verified Architecture  
**Version:** 1.0  
**Last Updated:** 2026-07-28

---

# Purpose

This document defines the architecture of the BestWayGrow Franchise Dashboard system.

The Franchise Dashboard is the primary operational interface for authorized franchise partners to manage daily business activities, monitor inventory, review financial information, manage orders, and access operational reports.

The dashboard provides controlled access to franchise functions while maintaining complete integration with Admin, Financial, Inventory, and Audit systems.

---

# Objectives

The Franchise Dashboard Architecture is designed to:

- Provide centralized franchise operations
- Display real-time business information
- Manage PIN and product inventory
- Monitor financial activity
- Provide operational transparency
- Reduce manual dependency
- Maintain secure access control

---

# Dashboard Access Flow

```text
Franchise Login
        │
        ▼
Authentication Validation
        │
        ▼
Role Permission Check
        │
        ▼
Franchise Dashboard
        │
        ▼
Operational Modules
Dashboard Main Modules
The Franchise Dashboard contains:
Overview Dashboard
PIN Management
Product Management
Order Management
Financial Management
Bank Details
Reports
Activity History
Support Section
Dashboard Overview
Displays:
Franchise Status
Franchise ID
Available Balance
Total PIN Stock
Total Product Stock
Recent Transactions
Pending Orders
Recent Activities
PIN Management Module
The PIN section provides complete PIN inventory visibility.
Functions:
PIN Order Details
PIN Purchase History
Available PIN Stock
Used PIN Details
Unused PIN Details
PIN Allocation History
PIN Status Tracking
Flow:
Franchise Bank
        │
        ▼
PIN Purchase Request
        │
        ▼
System Bank Validation
        │
        ▼
PIN Bank
        │
        ▼
Franchise PIN Stock
Product Management Module
Functions:
Product Order Details
Product Purchase History
Available Product Stock
Sold Product Details
Product Inventory Tracking
Stock Movement History
Flow:
Franchise Bank
        │
        ▼
Product Purchase
        │
        ▼
Product Bank
        │
        ▼
Franchise Inventory
Financial Management Module
The financial dashboard provides:
Franchise Bank Balance
Fund Details
Purchase Transactions
Payment History
Settlement Records
Ledger References
The Franchise Bank is used for:
PIN Purchase Payment
Product Purchase Payment
Business Transactions
Order Management Module
Functions:
Create Orders
View Orders
Track Order Status
Order History
Delivery Status
Transaction Reference
Order Status:
Created
   │
   ▼
Processing
   │
   ▼
Completed
   │
   ▼
Recorded
Reports Module
Available reports:
Inventory Reports
PIN Stock Report
Product Stock Report
Used Stock Report
Unused Stock Report
Financial Reports
Purchase Report
Transaction Report
Bank Statement
Settlement Report
Activity Reports
Login History
Transaction Activity
Order Activity
Dashboard Security
The dashboard enforces:
Secure Authentication
Role-Based Access Control
Session Validation
Permission Checking
Activity Logging
Unauthorized Access Prevention
Integration Points
The Franchise Dashboard integrates with:
Admin System
Franchise Application System
Franchise Approval System
Franchise Bank
System Bank
PIN Bank
Product Bank
Inventory System
Transaction Engine
Ledger System
Audit System
Security Framework
Data Flow
Franchise User
        │
        ▼
Franchise Dashboard
        │
        ▼
Business Modules
        │
        ├────► Financial System
        │
        ├────► Inventory System
        │
        ├────► Order System
        │
        └────► Audit System
Design Principles
The Franchise Dashboard Architecture follows:
Simple Operations
Controlled Access
Real-Time Visibility
Complete Inventory Tracking
Financial Transparency
Secure Business Execution
Enterprise Scalability
Layer Summary
The Franchise Dashboard Architecture provides the operational control center for franchise partners within the BestWayGrow platform.
It enables franchise users to manage PIN stock, product inventory, orders, financial activities, and business reports through a secure and integrated dashboard while maintaining complete synchronization with enterprise financial, inventory, and audit systems.

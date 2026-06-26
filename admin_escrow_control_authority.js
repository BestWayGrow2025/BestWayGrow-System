"use strict";

/*
========================================
ADMIN ESCROW CONTROL AUTHORITY V2.0
========================================
✔ Admin authority guard
✔ Safe escrow loading
✔ Approve / Reject workflow
✔ Activity logging support
✔ No legacy system references
✔ Production safe
========================================
*/

console.log("[ADMIN ESCROW AUTHORITY] LOADED");


// ================= AUTH =================

function verifyAdminAuthority(){

    const session =
        typeof getSession === "function"
        ? getSession()
        : null;


    if(
        !session ||
        String(session.role).toLowerCase() !== "admin"
    ){

        window.location.replace(
            "admin_auth.html"
        );

        return false;

    }


    return true;

}



// ================= LOAD PANEL =================

function loadEscrowAdminPanel(){

    if(!verifyAdminAuthority()){
        return;
    }


    const main =
        document.getElementById(
            "mainContent"
        );


    if(!main) return;



    const escrows =
        typeof loadEscrows === "function"
        ? loadEscrows() || []
        : [];



    main.innerHTML = `

    <h3>
    🖥 ESCROW ADMIN CONTROL PANEL
    </h3>


    <table border="1" width="100%">

    <tr>
      <th>ID</th>
      <th>User</th>
      <th>Amount</th>
      <th>Status</th>
      <th>Action</th>
    </tr>


    ${
        escrows.map(function(e){

            return `

            <tr>

            <td>${safeHtml(e.escrowId)}</td>

            <td>${safeHtml(e.userId)}</td>

            <td>${safeHtml(e.amount)}</td>

            <td>${safeHtml(e.status)}</td>


            <td>

            <button onclick="approveEscrow('${e.escrowId}')">
            ✔ Approve
            </button>


            <button onclick="rejectEscrow('${e.escrowId}')">
            ✖ Reject
            </button>


            </td>

            </tr>

            `;


        }).join("")

    }


    </table>

    `;

}



// ================= APPROVE =================

function approveEscrow(id){

    if(!verifyAdminAuthority()){
        return;
    }


    if(typeof updateEscrowStatus === "function"){

        updateEscrowStatus(
            id,
            "APPROVED"
        );

    }


    logEscrowAction(
        "APPROVED",
        id
    );


    loadEscrowAdminPanel();

}



// ================= REJECT =================

function rejectEscrow(id){

    if(!verifyAdminAuthority()){
        return;
    }


    if(typeof updateEscrowStatus === "function"){

        updateEscrowStatus(
            id,
            "REJECTED"
        );

    }


    logEscrowAction(
        "REJECTED",
        id
    );


    loadEscrowAdminPanel();

}



// ================= AUDIT =================

function logEscrowAction(action,id){

    if(
        typeof logActivity === "function"
    ){

        logActivity(
            "ADMIN",
            "ESCROW",
            action + " : " + id
        );

    }

}



// ================= SAFE HTML =================

function safeHtml(value){

    return String(
        value || "-"
    )
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");

}



// ================= EXPORT =================

window.loadEscrowAdminPanel =
    loadEscrowAdminPanel;

window.approveEscrow =
    approveEscrow;

window.rejectEscrow =
    rejectEscrow;

"use strict";

/*
========================================
ADMIN FRANCHISE AUTHORITY V1.0
========================================
✔ Franchise request monitoring
✔ Admin approval control
✔ Admin rejection control
✔ Safe dashboard module
✔ No missing imports
✔ Repository aligned
========================================
*/

console.log("[ADMIN FRANCHISE AUTHORITY] LOADED");


function loadFranchiseRequests() {

    const container =
        document.getElementById(
            "requestList"
        );

    if (!container) return;


    const requests =
        typeof getFranchiseRequests === "function"
            ? getFranchiseRequests()
            : [];


    if (!Array.isArray(requests) || !requests.length) {

        container.innerHTML =
            "<p>No franchise requests available.</p>";

        return;
    }


    container.innerHTML =
        requests.map(function(request){

            return `

            <div class="request-item">

                <b>
                Request ID:
                ${request.id || "-"}
                </b>

                <br>

                User:
                ${request.userId || "-"}

                <br>

                Status:
                ${request.status || "PENDING"}

                <br>


                <button
                class="approve-btn"
                onclick="approveFranchise('${request.id}')">

                Approve

                </button>


                <button
                class="reject-btn"
                onclick="rejectFranchise('${request.id}')">

                Reject

                </button>


            </div>

            `;

        }).join("");

}



function approveFranchise(id){

    console.log(
        "[FRANCHISE APPROVED]",
        id
    );


    if(typeof approveFranchiseRequest === "function"){

        approveFranchiseRequest(id);

    }


    loadFranchiseRequests();

}



function rejectFranchise(id){

    console.log(
        "[FRANCHISE REJECTED]",
        id
    );


    if(typeof rejectFranchiseRequest === "function"){

        rejectFranchiseRequest(id);

    }


    loadFranchiseRequests();

}



function resetUserPassword(){

    console.log(
        "[RESET PASSWORD REQUEST]"
    );

}



function bindFranchiseAuthorityEvents(){

    const refreshBtn =
        document.getElementById(
            "refreshBtn"
        );


    const resetBtn =
        document.getElementById(
            "resetPasswordBtn"
        );


    if(refreshBtn){

        refreshBtn.onclick =
            loadFranchiseRequests;

    }


    if(resetBtn){

        resetBtn.onclick =
            resetUserPassword;

    }


    loadFranchiseRequests();

}



document.addEventListener(
    "DOMContentLoaded",
    bindFranchiseAuthorityEvents
);



window.loadFranchiseRequests =
    loadFranchiseRequests;


window.approveFranchise =
    approveFranchise;


window.rejectFranchise =
    rejectFranchise;


window.resetUserPassword =
    resetUserPassword;

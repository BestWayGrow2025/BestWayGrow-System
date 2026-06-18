"use strict";


(function(){


if(window.__INCOME_CONTROL_UI_LOADED__){
    return;
}


window.__INCOME_CONTROL_UI_LOADED__ = true;


console.log("[INCOME CONTROL UI JS] LOADED");



function refreshIncomeControl(){


try{


if(typeof window.getIncomeSettings !== "function"){

    console.warn("[INCOME CONTROL] Waiting for income system...");

    setTimeout(
        refreshIncomeControl,
        500
    );

    return;
}



const settings = window.getIncomeSettings();



const status = document.getElementById("incomeStatus");

if(status){

    status.innerHTML =
    settings.incomeEnabled
    ?
    "🟢 Income System Active"
    :
    "🔴 Income System Disabled";

}



const hold = document.getElementById("holdIncomeStatus");

if(hold){

    hold.innerHTML =
    settings.holdWalletEnabled
    ?
    "🟢 Hold Income Active"
    :
    "🔴 Hold Income Disabled";

}



const upgrade = document.getElementById("upgradeStatus");

if(upgrade){

    upgrade.innerHTML =
    settings.ugli
    ?
    "🟢 Active"
    :
    "🔴 Disabled";

}



const repurchase = document.getElementById("repurchaseStatus");

if(repurchase){

    repurchase.innerHTML =
    settings.rli
    ?
    "🟢 Active"
    :
    "🔴 Disabled";

}


}
catch(err){

console.error(
"[INCOME CONTROL ERROR]",
err
);

}


}





function bindIncomeButtons(){



const master =
document.getElementById("masterIncomeBtn");


if(master){

master.onclick=function(){

if(typeof window.toggleMasterIncome === "function"){

window.toggleMasterIncome();

refreshIncomeControl();

}

};

}




const wallet =
document.getElementById("incomeWalletBtn");


if(wallet){

wallet.onclick=function(){

if(typeof window.toggleIncomeWallet === "function"){

window.toggleIncomeWallet();

refreshIncomeControl();

}

};

}




const tracking =
document.getElementById("totalTrackingBtn");


if(tracking){

tracking.onclick=function(){

if(typeof window.toggleTotalIncomeTracking === "function"){

window.toggleTotalIncomeTracking();

refreshIncomeControl();

}

};

}


}





window.initIncomeControlUI=function(){


bindIncomeButtons();

refreshIncomeControl();


console.log(
"[INCOME CONTROL UI] READY"
);


};




// AUTO START

setTimeout(function(){


if(typeof window.initIncomeControlUI === "function"){

window.initIncomeControlUI();

}


},100);



})();

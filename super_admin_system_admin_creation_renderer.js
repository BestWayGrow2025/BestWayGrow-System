"use strict";

/*
========================================
SUPER ADMIN CREATE SYSTEM ADMIN RENDERER
========================================
*/

window.renderCreateAdmin = function () {

return `

<div class="box">

  <h2 style="text-align:center;">
    CREATE SYSTEM ADMIN
  </h2>

  <input
    id="sysId"
    placeholder="System Admin ID">

  <input
    id="sysName"
    placeholder="Name">

  <input
    id="sysPass"
    type="password"
    placeholder="Password">

  <button id="createBtn">
    Create
  </button>

  <p id="msg"></p>

  <h3>
    System Admin List
  </h3>

  <div id="systemAdminList"></div>

</div>

<style>

.box{
background:white;
padding:20px;
border-radius:10px;
width:300px;
margin:20px auto;
box-shadow:0 4px 10px rgba(0,0,0,.1);
}

input{
width:100%;
margin-bottom:10px;
padding:8px;
box-sizing:border-box;
}

button{
padding:8px 12px;
cursor:pointer;
width:100%;
background:#0077b5;
color:white;
border:none;
border-radius:5px;
}

button:hover{
background:#005f8a;
}

#msg{
margin-top:10px;
text-align:center;
font-weight:bold;
}

#systemAdminList{
margin-top:20px;
}

.admin-card{
background:#f5f5f5;
padding:12px;
margin-top:10px;
border-radius:8px;
border-left:4px solid #0077b5;
}

.admin-card h4{
margin:0 0 8px 0;
}

.admin-card p{
margin:4px 0;
}

</style>

`;

};

console.log("[CREATE ADMIN RENDERER] READY");

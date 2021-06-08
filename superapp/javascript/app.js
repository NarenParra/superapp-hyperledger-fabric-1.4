"use strict";

const express = require("express");
const app = express();
const fs = require("fs");

let query = require("./query.js");
let registerUser = require("./registerUser.js");
let registerAdmin = require("./enrollAdmin.js");
let createUser = require("./createUser");
let createOrg = require("./createOrg");
let createTransaction = require("./createTransaction");

//register admin
app.post("/admin", async function (req, res) {
    let message = await registerAdmin();
    res.send(message);
});

//register user
app.post("/user", async function (req, res) {
    try {
        const { name, role, orgAffiliation } = req.query;
        console.log(req.query);
        const orgMSP = "Org1MSP";
        let message = await registerUser.registerUser(
            name,
            orgMSP,
            role,
            orgAffiliation
        );
        res.send(message);
    } catch (error) {
        return res.send(error);
    }
});
//create organization
app.get("/create-org", async function (req, res) {
    try {
        const { identity, name, epms } = req.query;

        let message = await createOrg.createOrg(identity, name, epms);
        res.send(message);
    } catch (err) {
        return res.send(err);
    }
});
//create transaction
app.get("/create-transaction", async function (req, res) {
    try {
        const { identity, name, epms } = req.query;
        let message = await createUser.createUser(identity, name, epms);
        res.send(message);
    } catch (error) {
        return res.send(error);
    }
});
// Query on chaincode on target peers

app.post("/createuser", async function (req, res) {
    try {
        const { identity, name, epms } = req.query;
        let message = await createUser.createUser(identity, name, epms);
        res.send(message);
    } catch (error) {
        return res.send(error);
    }
});

app.listen(8080, () => {
    console.log("server is running on port" + 8080);
});

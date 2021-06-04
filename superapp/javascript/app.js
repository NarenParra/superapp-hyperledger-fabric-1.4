"use strict";

const express = require("express");
const app = express();
const fs = require("fs");

let query = require("./query.js");
let registerUser = require("./registerUser.js");
let registerAdmin = require("./enrollAdmin.js");
let createUser = require("./createUser");

//register admin
app.post("/admin", async function (req, res) {
    let message = await registerAdmin();
    res.send(message);
});

//register user
app.post("/user", async function (req, res) {
    try {
        const { name } = req.query;
        let message = await registerUser.registerUser(name);
        res.send(message);
    } catch (error) {
        return res.send(error);
    }
});

// Query on chaincode on target peers
app.get("/query", async function (req, res) {
    const { identity } = req.query;
    console.log("---------------------------------identity-----------------");
    console.log(identity);
    let message = await query.queryUser(identity);
    res.send(message);
});

app.post("/createuser", async function (req, res) {
    const { identity, name, epms } = req.query;
    let message = await createUser.createUser(identity, name, epms);
    res.send(message);
});

app.listen(8080, () => {
    console.log("server is running on port" + 8080);
});

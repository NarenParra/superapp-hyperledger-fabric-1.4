"use strict";

const express = require("express");
const app = express();
const fs = require("fs");

let query = require("./query.js");
let registerUser = require("./registerUser.js");
let registerAdmin = require("./enrollAdmin.js");
let buyEpms = require("./buyEpms.js");
let buyMetroTickets = require("./buyMetroTickets.js");
let payPredial = require("./payPredial");

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

    let message = await query.query(identity);
    res.send(message);
});

app.put("/buyepms", async function (req, res) {
    try {
        const { number, amount } = req.query;
        let message = await buyEpms.buyEpms(number, amount);
        res.send(message);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

app.put("/buymetrotickets", async function (req, res) {
    const { number, amount } = req.query;
    let message = await buyMetroTickets.buyMetroTickets(number, amount);
    res.send(message);
});

app.put("/paypredial", async function (req, res) {
    const { number, amount } = req.query;
    let message = await payPredial.payPredial(number, amount);
    res.send(message);
});

app.listen(8080, () => {
    console.log("server is running on port" + 8080);
});

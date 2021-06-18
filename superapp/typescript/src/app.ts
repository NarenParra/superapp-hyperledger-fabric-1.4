const express = require("express");
const app = express();

import { registerUser } from "./registerUser";
import { createOrg } from "./createOrg";
import { createTransaction } from "./createTransaction";
import { createUser } from "./createUser";
import { enrollAdmin } from "./enrollAdmin";
import { singleQuery } from "./singleQuery";
import { richQuery } from "./richQuery";
import { historyQuery } from "./historyQuery";

app.use(express.json());

//register user
app.post("/user", async function (req, res) {
  try {
    const { name, role, orgAffiliation } = req.body;
    console.log(req.query);
    const orgMSP = "Org1MSP";
    let message = await registerUser(name, orgMSP, role, orgAffiliation);
    res.send(message);
  } catch (error) {
    return res.send(error);
  }
});
//create organization
app.post("/create-org", async function (req, res) {
  try {
    const { identity, name, epms } = req.body;

    let message = await createOrg(identity, name, epms);
    res.send(message);
  } catch (err) {
    return res.send(err);
  }
});
//create transaction
app.post("/create-transaction", async function (req, res) {
  try {
    const { identity, idUser, idOrg, epms, description } = req.body;
    let message = await createTransaction(
      identity,
      idUser,
      idOrg,
      epms,
      description
    );
    res.send(message);
  } catch (error) {
    return res.send(error);
  }
});
// Query on chaincode on target peers

app.post("/createuser", async function (req, res) {
  try {
    const { identity, name, epms } = req.body;
    let message = await createUser(identity, name, epms);
    res.send(message);
  } catch (error) {
    return res.send(error);
  }
});

//get single query
app.get("/single-obj", async function (req, res) {
  try {
    const { identity, id } = req.query;
    let message = await singleQuery(String(identity), String(id));
    res.send(message);
  } catch (error) {
    return res.send(error);
  }
});

app.get("/rich-obj", async function (req, res) {
  try {
    const { identity } = req.query;
    let message = await richQuery(String(identity));
    console.log("+++++++++++++++++++++++++++++++ queryResults");
    console.log(message);
    res.send(message.toString());
  } catch (error) {
    return res.send(error);
  }
});

app.get("/history", async function (req, res) {
  try {
    const { identity, id } = req.query;
    let message = await historyQuery(String(identity), String(id));
    res.send(message.toString());
  } catch (error) {
    return res.send(error);
  }
});

app.listen(8080, async () => {
  console.log("server is running on port" + 8080);
  await enrollAdmin();
});

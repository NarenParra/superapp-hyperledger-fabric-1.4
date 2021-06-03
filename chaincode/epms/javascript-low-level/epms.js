/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

"use strict";
const shim = require("fabric-shim");
const util = require("util");

let Chaincode = class {
  // The Init method is called when the Smart Contract 'epms' is instantiated by the blockchain network
  // Best practice is to have any Ledger initialization in separate function -- see initLedger()
  async Init(stub) {
    console.info("=========== Instantiated epms chaincode ===========");
    return shim.success();
  }

  // The Invoke method is called as a result of an application request to run the Smart Contract
  // 'epms'. The calling application program has also specified the particular smart contract
  // function to be called, with arguments
  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.error("no function of name:" + ret.fcn + " found");
      throw new Error("Received unknown function " + ret.fcn + " invocation");
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async queryEpm(stub, args) {
    if (args.length != 1) {
      throw new Error(
        "Incorrect number of arguments. Expecting EpmNumber ex: EPM01"
      );
    }
    let epmNumber = args[0];

    let epmAsBytes = await stub.getState(epmNumber); //get the epm from chaincode state
    if (!epmAsBytes || epmAsBytes.toString().length <= 0) {
      throw new Error(epmNumber + " does not exist: ");
    }
    console.log(epmAsBytes.toString());
    return epmAsBytes;
  }

  async initLedger(stub, args) {
    console.info("============= START : Initialize Ledger ===========");
    let epms = [];
    epms.push({
      name: "blue",
      epms: "123456",
      train: "0",
      predial: "0",
    });

    for (let i = 0; i < epms.length; i++) {
      epms[i].docType = "epm";
      await stub.putState("EPM" + i, Buffer.from(JSON.stringify(epms[i])));
      console.info("Added <--> ", epms[i]);
    }
    console.info("============= END : Initialize Ledger ===========");
  }

  async createEpm(stub, args) {
    console.info("============= START : Create Epm ===========");
    if (args.length != 5) {
      throw new Error("Incorrect number of arguments. Expecting 5");
    }

    var epm = {
      docType: "epm",
      name: args[1],
      epms: args[2],
      train: args[3],
      predial: args[4],
    };

    await stub.putState(args[0], Buffer.from(JSON.stringify(epm)));
    console.info("============= END : Create Epm ===========");
  }

  async queryAllCars(stub, args) {
    let startKey = "CAR0";
    let endKey = "CAR999";

    let iterator = await stub.getStateByRange(startKey, endKey);

    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString("utf8"));

        jsonRes.Key = res.value.key;
        try {
          jsonRes.Record = JSON.parse(res.value.value.toString("utf8"));
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString("utf8");
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log("end of data");
        await iterator.close();
        console.info(allResults);
        return Buffer.from(JSON.stringify(allResults));
      }
    }
  }

  async changeCarOwner(stub, args) {
    console.info("============= START : changeCarOwner ===========");
    if (args.length != 2) {
      throw new Error("Incorrect number of arguments. Expecting 2");
    }

    let carAsBytes = await stub.getState(args[0]);
    let car = JSON.parse(carAsBytes);
    car.owner = args[1];

    await stub.putState(args[0], Buffer.from(JSON.stringify(car)));
    console.info("============= END : changeCarOwner ===========");
  }

  async buyEpms(stub, args) {
    console.info("============= START : buyEpms ===========");
    if (args.length != 2) {
      throw new Error("Incorrect number of arguments. Expecting 2");
    }

    let epmAsBytes = await stub.getState(args[0]);
    let epm = JSON.parse(epmAsBytes);
    epm.npms += args[1];

    await stub.putState(args[0], Buffer.from(JSON.stringify(epm)));
    console.info("============= END : buyEpms ===========");
  }
};

shim.start(new Chaincode());

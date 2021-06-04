/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { FileSystemWallet, Gateway } = require("fabric-network");
const fs = require("fs");
const path = require("path");

const ccpPath = path.resolve(
    __dirname,
    "..",
    "..",
    "basic-network",
    "connection.json"
);
const ccpJSON = fs.readFileSync(ccpPath, "utf8");
const ccp = JSON.parse(ccpJSON);

let errror;

const createUser = async function (identity, name, epms) {
    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), "wallet");
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(identity);
        const user = await wallet.list();
        errror = userExists;
        if (!userExists) {
            console.log(
                "An identity for the user identity does not exist in the wallet"
            );
            console.log("Run the registerUser.js application before retrying");
            return {
                message: "Run the registerUser.js application before retrying",
            };
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: identity,
            discovery: { enabled: false },
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork("mychannel");

        // Get the contract from the network.
        const contract = network.getContract("superapp");

        // Submit the specified transaction.
        // createEpm transaction - requires 5 argument, ex: ('createEpm', 'EPM12', 'Honda', 'Accord', 'Black', 'Tom')
        await contract.submitTransaction("createUser", "USER02", name, epms);
        console.log(`Transaction has been submitted ${user}`);

        console.log(user);

        console.log(ccp);

        // Disconnect from the gateway.
        await gateway.disconnect();

        return {
            message: `Transaction has been submitted ${user}`,
        };
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return {
            message: errror,
        };
    }
};

exports.createUser = createUser;
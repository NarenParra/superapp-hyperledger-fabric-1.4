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

const createTransaction = async function (
    identityUser,
    identityOrg,
    epms,
    description
) {
    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), "wallet");
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the Org.
        const OrgExists = await wallet.exists(identityOrg);
        const UserExists = await wallet.exists(identityUser);
        // const Org = await wallet.list();
        if (!OrgExists) {
            return {
                message: "Run the registerUser.js application before retrying",
            };
        } else if (!UserExists) {
            return {
                message: "Run the registerUser.js application before retrying",
            };
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: identityUser,
            discovery: { enabled: false },
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork("mychannel");

        // Get the contract from the network.
        const contract = network.getContract("superapp");

        // Submit the specified transaction.
        // createEpm transaction - requires 5 argument, ex: ('createEpm', 'EPM12', 'Honda', 'Accord', 'Black', 'Tom')
        const date = new Date().toLocaleDateString();
        const message = await contract.submitTransaction(
            "createTransaction",
            identityUser,
            identityOrg,
            epms,
            date,
            description
        );
        console.log(`Transaction has been submitted from create trans 1 `);
        // Disconnect from the gateway.
        await gateway.disconnect();

        return {
            message: message,
        };
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return {
            message: error,
        };
    }
};

exports.createTransaction = createTransaction;

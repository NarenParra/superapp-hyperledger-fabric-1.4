/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

import { FileSystemWallet, Gateway } from "fabric-network";
import path from "path";
import { ccp } from "./createOrg";

export const createUser = async function (identity: string, name: string, epms: string) {
    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), "wallet");
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(identity);
        //  const user = await wallet.list();
        if (!userExists) {
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
        //const labelUser = user.find(({ label }) => label === identity);
        //const userId = `com.superapp.epm.usuario:${labelUser.label}@blockchain.epm.com`;

        // Submit the specified transaction.
        // createEpm transaction - requires 5 argument, ex: ('createEpm', 'EPM12', 'Honda', 'Accord', 'Black', 'Tom')
        const message = await contract.submitTransaction(
            "createUser",
            // userId,
            name,
            epms
        );
        console.log("Transaction has been submitted from register user");
        // Disconnect from the gateway.
        gateway.disconnect();

        return {
            message: "Transaction has been submitted from register user",
        };
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return {
            message: error,
        };
    }
};

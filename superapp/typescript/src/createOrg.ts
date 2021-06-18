/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

import { FileSystemWallet, X509WalletMixin, Gateway } from "fabric-network";
import * as fs from "fs";
import * as path from "path";

const ccpPath = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "basic-network",
  "connection.json"
);
const ccpJSON = fs.readFileSync(ccpPath, "utf8");
export const ccp = JSON.parse(ccpJSON);

export const createOrg = async function (
  identity: string,
  name: string,
  epms: string
) {
  try {
    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the Org.
    const OrgExists = await wallet.exists(identity);
    // const Org = await wallet.list();
    if (!OrgExists) {
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
    const generated = "0";
    const expend = "0";

    const message = await contract.submitTransaction(
      "createOrg",
      name,
      epms,
      generated,
      expend
    );
    console.log(`Transaction has been submitted from create org 1 ${name}`);
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

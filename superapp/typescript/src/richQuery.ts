/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

import { FileSystemWallet, X509WalletMixin, Gateway } from "fabric-network";
import * as path from "path";
import { ccp } from "./createOrg";

export const richQuery = async function (identity: string) {
  try {
    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = new FileSystemWallet(walletPath);

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists(identity);
    if (!userExists) {
      console.log(
        `An identity for the user ${identity} does not exist in the wallet from query`
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

    // Evaluate the specified transaction.
    // queryEpm transaction - requires 1 argument, ex: ('queryEpm', 'Epm4')
    // queryAllEpms transaction - requires no arguments, ex: ('queryAllEpms')
    //const result = await contract.evaluateTransaction("queryAllEpms");
    const result = await contract.evaluateTransaction("richQuery");

    return result;
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    return error;
  }
};

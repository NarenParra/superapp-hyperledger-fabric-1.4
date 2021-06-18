/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

import { FileSystemWallet, X509WalletMixin, Gateway } from "fabric-network";
import * as path from "path";
import { ccp } from "./createOrg";

export const createTransaction = async function (
  identity: string,
  idUser: string,
  idOrg: string,
  epms: string,
  description: string
) {
  try {
    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the Org.
    const identityExists = await wallet.exists(identity);

    // const Org = await wallet.list();
    if (!identityExists) {
      return {
        message: "Run the registerUser.js application before retrying",
      };
    } else if (!identityExists) {
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
    const date = new Date().toLocaleDateString();
    const message = await contract.submitTransaction(
      "createTransaction",
      identity,
      idUser,
      idOrg,
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

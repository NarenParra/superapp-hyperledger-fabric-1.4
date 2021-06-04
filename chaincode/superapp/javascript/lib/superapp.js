/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Contract } = require("fabric-contract-api");

class SuperApp extends Contract {
    async initLedger(ctx) {
        console.info("============= START : Initialize Ledger ===========");
        const user = [
            {
                udi: "com.superapp.epm.usuario:prueba.user@blockchain.epm.com",
                name: "prueba.user",
                epms: 1000,
            },
        ];

        for (let i = 0; i < user.length; i++) {
            user[i].docType = "user";
            await ctx.stub.putState(
                "user" + i,
                Buffer.from(JSON.stringify(user[i]))
            );
            console.info("Added <--> ", user[i]);
        }

        console.info("============= END : Initialize Ledger ===========");
    }

    async initOrg(ctx) {
        console.info("============= START : Initialize Ledger ===========");
        const org = [{ name: "EPM", epms: 1000000 }];

        for (let i = 0; i < org.length; i++) {
            org[i].docType = "org";
            await ctx.stub.putState(
                "com.superapp.epm.org:epm@blockchain.epm.com",
                Buffer.from(JSON.stringify(org[i]))
            );
            console.info("Added <--> ", org[i]);
        }

        console.info("============= END : Initialize Ledger ===========");
    }

    async initTransaction(ctx) {
        console.info("============= START : Initialize Ledger ===========");
        const transaction = [
            {
                udi: "",
                uid_org: "",
                uid_user: "",
                epms: 0,
                date: "",
                descriptiom: "",
            },
        ];

        for (let i = 0; i < transaction.length; i++) {
            transaction[i].docType = "transaction";
            await ctx.stub.putState(
                "transaction" + i,
                Buffer.from(JSON.stringify(transaction[i]))
            );
            console.info("Added <--> ", transaction[i]);
        }

        console.info("============= END : Initialize Ledger ===========");
    }

    async queryUser(ctx, userNumber) {
        const userAsBytes = await ctx.stub.getState(userNumber); // get the user from chaincode state
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`${userNumber} does not exist`);
        }
        console.log(userAsBytes.toString());
        return userAsBytes.toString();
    }

    async createUser(ctx, userId, name, epms) {
        try {
            console.info("============= START : Create user ===========");

            const user = {
                docType: "user",
                epms,
                name,
            };

            await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));
            console.info("============= END : Create users ===========");
            return {
                message: "successful",
            };
        } catch (error) {
            return {
                message: error,
            };
        }
    }
}

module.exports = SuperApp;

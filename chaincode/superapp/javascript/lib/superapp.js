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
                userId: "com.superapp.epm.usuario:prueba.user@blockchain.epm.com",
                commonName: "prueba",
                organizationName: "org1.superapp.epm.com",
                docType: "user",
                epms: 1000,
                name: "prueba.user",
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
        const org = [
            {
                orgId: "com.superapp.epm.org:orgPrueba1",
                name: "Prueba",
                epms: 1000000,
                generated: 0,
                expend: 0,
            },
        ];

        for (let i = 0; i < org.length; i++) {
            org[i].docType = "org";
            await ctx.stub.putState(
                "com.superapp.epm.org:orgPrueba1@blockchain.epm.com",
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
                userId: "com.superapp.epm.usuario:prueba.user@blockchain.epm.com",
                orgId: "orgPrueba1",
                epms: 500,
                date: "22/06/2021",
                descriptiom: "incial transaction",
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

    async createUser(ctx, name, epms) {
        try {
            const identity = ctx.clientIdentity.getX509Certificate();
            const organizationName = identity.issuer.organizationName;
            const commonName = identity.subject.commonName;
            let userId = organizationName + "user:" + commonName;

            const user = {
                userId,
                commonName,
                organizationName,
                docType: "user",
                epms,
                name,
            };

            await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));
            return identity;
        } catch (error) {
            return {
                message: error,
            };
        }
    }

    async createOrg(ctx, name, epms, generated, expend) {
        try {
            const identity = ctx.clientIdentity.getX509Certificate();
            const organizationName = identity.issuer.organizationName;
            const commonName = identity.subject.commonName;
            let orgId = organizationName + "org:" + commonName;

            const org = {
                orgId,
                commonName,
                organizationName,
                docType: "org",
                epms,
                name,
                generated,
                expend,
            };

            await ctx.stub.putState(orgId, Buffer.from(JSON.stringify(org)));
            return {
                message: "Transaction has been submitted from create org 1",
            };
        } catch (error) {
            return {
                message: error,
            };
        }
    }

    async createTransaction(
        ctx,
        identity,
        idUser,
        idOrg,
        epms,
        date,
        description
    ) {
        try {
            const userAsBytes = await ctx.stub.getState(idUser);
            const orgAsBytes = await ctx.stub.getState(idOrg);

            if (!userAsBytes || userAsBytes.length === 0) {
                throw new Error(`${userAsBytes} does not exist`);
            }

            if (!orgAsBytes || orgAsBytes.length === 0) {
                throw new Error(`${orgAsBytes} does not exist`);
            }

            const identityCtx = ctx.clientIdentity.getX509Certificate();
            const organizationName = identityCtx.issuer.organizationName;
            const commonName = identityCtx.subject.commonName;
            let transId =
                organizationName + ".transaction:" + commonName + "." + date;

            const user = JSON.parse(userAsBytes.toString());
            user.epms = parseInt(user.epms) + parseInt(epms);

            const org = JSON.parse(orgAsBytes.toString());
            org.epms = parseInt(org.epms) - parseInt(epms);

            const trans = {
                transId,
                identity,
                idUser,
                idOrg,
                docType: "trans",
                epms,
                date,
                description,
            };

            await ctx.stub.putState(
                transId,
                Buffer.from(JSON.stringify(trans))
            );
            await ctx.stub.putState(idUser, Buffer.from(JSON.stringify(user)));
            await ctx.stub.putState(idOrg, Buffer.from(JSON.stringify(org)));
            return {
                message: "Transaction has been submitted from create trans 1",
            };
        } catch (error) {
            return {
                message: error,
            };
        }
    }
}

module.exports = SuperApp;

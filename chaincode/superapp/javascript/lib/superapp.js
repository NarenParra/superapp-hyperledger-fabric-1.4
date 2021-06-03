/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Contract } = require("fabric-contract-api");

class SuperApp extends Contract {
    async initLedger(ctx) {
        console.info("============= START : Initialize Ledger ===========");
        const user = [{ udi: "", name: "naren", epms: 1000 }];

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
        const org = [{ udi: "", name: "org", epms: 1000 }];

        for (let i = 0; i < org.length; i++) {
            org[i].docType = "org";
            await ctx.stub.putState(
                "org" + i,
                Buffer.from(JSON.stringify(org[i]))
            );
            console.info("Added <--> ", org[i]);
        }

        console.info("============= END : Initialize Ledger ===========");
    }

    async initTransaction(ctx) {
        console.info("============= START : Initialize Ledger ===========");
        const transaction = [{ udi: "", name: "transaction", epms: 1000 }];

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

    async queryEpm(ctx, epmNumber) {
        const epmAsBytes = await ctx.stub.getState(epmNumber); // get the epm from chaincode state
        if (!epmAsBytes || epmAsBytes.length === 0) {
            throw new Error(`${epmNumber} does not exist`);
        }
        console.log(epmAsBytes.toString());
        return epmAsBytes.toString();
    }

    async createEpm(ctx, epmNumber, name, epms, train, predial) {
        console.info("============= START : Create Epms ===========");

        const epm = {
            name,
            docType: "epm",
            epms,
            train,
            predial,
        };

        await ctx.stub.putState(epmNumber, Buffer.from(JSON.stringify(epm)));
        console.info("============= END : Create Epms ===========");
    }

    async queryAllEpms(ctx) {
        const startKey = "EPM0";
        const endKey = "EPM999";

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString("utf8"));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString("utf8"));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString("utf8");
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log("end of data");
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    async buyEpms(ctx, epmNumber, amount) {
        console.info("============= START : buyEpms ===========");

        const epmAsBytes = await ctx.stub.getState(epmNumber); // get the car from chaincode state
        if (!epmAsBytes || epmAsBytes.length === 0) {
            throw new Error(`${epmNumber} does not exist`);
        }
        const epm = JSON.parse(epmAsBytes.toString());
        epm.epms = parseInt(epm.epms) + parseInt(amount);

        await ctx.stub.putState(epmNumber, Buffer.from(JSON.stringify(epm)));
        console.info("============= END : buyEpms ===========");
    }

    async buyMetroTickets(ctx, epmNumber, amount) {
        console.info("============= START : buyMetroTickets ===========");

        const epmAsBytes = await ctx.stub.getState(epmNumber); // get the car from chaincode state
        if (!epmAsBytes || epmAsBytes.length === 0) {
            throw new Error(`${epmNumber} does not exist`);
        }

        const epm = JSON.parse(epmAsBytes.toString());

        if (parseInt(epm.epms) < parseInt(amount)) {
            throw new Error(`${epmNumber} lower npms than requested`);
        }

        epm.epms = parseInt(epm.epms) - parseInt(amount);
        epm.train = parseInt(epm.train) + parseInt(amount);

        await ctx.stub.putState(epmNumber, Buffer.from(JSON.stringify(epm)));
        console.info("============= END : buyMetroTickets ===========");
    }

    async payPredial(ctx, epmNumber, amount) {
        console.info("============= START : buyMetroTickets ===========");

        const epmAsBytes = await ctx.stub.getState(epmNumber); // get the car from chaincode state
        if (!epmAsBytes || epmAsBytes.length === 0) {
            throw new Error(`${epmNumber} does not exist`);
        }

        const epm = JSON.parse(epmAsBytes.toString());

        if (parseInt(epm.epms) < parseInt(amount)) {
            throw new Error(`${epmNumber} lower npms than requested`);
        }

        epm.epms = parseInt(epm.epms) - parseInt(amount);
        epm.predial = parseInt(epm.predial) + parseInt(amount);

        await ctx.stub.putState(epmNumber, Buffer.from(JSON.stringify(epm)));
        console.info("============= END : buyMetroTickets ===========");
    }
}

module.exports = SuperApp;

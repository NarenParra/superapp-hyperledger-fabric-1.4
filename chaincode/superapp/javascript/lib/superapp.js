/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";
const shim = require("fabric-shim");

const { Contract } = require("fabric-contract-api");

class SuperApp extends Contract {
    async Init(ctx) {
        let ret = ctx.stub.getFunctionAndParameters();
        console.info(ret);
        return shim.success();
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
                organizationName +
                ".transaction:" +
                commonName +
                "." +
                Date.now();
            //get user
            const user = JSON.parse(userAsBytes.toString());
            user.epms = parseInt(user.epms) + parseInt(epms);
            //get org
            const org = JSON.parse(orgAsBytes.toString());
            org.epms = parseInt(org.epms) - parseInt(epms);
            org.expend = parseInt(org.expend) + parseInt(epms);

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

    async singleQuery(ctx, id) {
        const objAsBytes = await ctx.stub.getState(id);

        if (!objAsBytes || objAsBytes.length === 0) {
            throw new Error(`${id} does not exist`);
        }

        return objAsBytes.toString();
    }
    //get transactions 1 user
    async richQuery(ctx) {
        try {
            let queryString = "naren";

            const queryResults = await ctx.stub.getQueryResult(queryString);
            console.log("+++++++++++++++++++++++++++++++ queryResults");
            console.log(queryResults);
            return queryResults.toString();
        } catch (error) {
            return {
                message: error,
            };
        }
    }

    async getHistoryForAnyKey(ctx, id) {
        if (!id || id.length === 0) {
            throw new Error("Incorrect number of arguments. Expecting 1");
        }

        let resultsIterator = await ctx.stub.getHistoryForKey(id);
        //let method = thisClass["getAllResults"];
        let results = await ctx.getAllResults(resultsIterator, true);
        console.log(Buffer.from(JSON.stringify(results)));
        return Buffer.from(JSON.stringify(results));
    }

    async getAllResults(iterator, isHistory) {
        let allResults = [];
        while (true) {
            let res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString("utf8"));

                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.tx_id;
                    jsonRes.Timestamp = res.value.timestamp;
                    jsonRes.IsDelete = res.value.is_delete.toString();
                    try {
                        jsonRes.Value = JSON.parse(
                            res.value.value.toString("utf8")
                        );
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = res.value.value.toString("utf8");
                    }
                } else {
                    jsonRes.Key = res.value.key;
                    try {
                        jsonRes.Record = JSON.parse(
                            res.value.value.toString("utf8")
                        );
                    } catch (err) {
                        console.log(err);
                        jsonRes.Record = res.value.value.toString("utf8");
                    }
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log("end of data");
                await iterator.close();
                console.info(allResults);
                return allResults;
            }
        }
    }
}

module.exports = SuperApp;

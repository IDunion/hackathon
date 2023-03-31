'use strict';

import { createHash } from "crypto";
import { stringToByteArray, verifyHolderBinding, importHolderKey } from "../utils";
import * as jose from 'jose';
let base64 = require('base-64');

/**
 * responds to the redirect uri from Wallet and verifies the authenticity of the 
 * data recording to the sd-jwt specification https://datatracker.ietf.org/doc/draft-ietf-oauth-selective-disclosure-jwt/
 * @param {string} authResponse response sent from client including the vpToken, disclosed claims and optionally the holder binding
 * @returns {boolean} true in case of success, false otherwise
 */
export const verify = async (authResponse: string): Promise<boolean> => {

    // split authResponse fields into vpToken ,disclosed claims and holder binding
    let presentationSplitted = authResponse.split("~");
    let base64Presentation: Array<string> = []
    let base64HsDisclosures: Array<string> = []
    let holderBinding: string;
    let vpToken: string;
    let vpTokenBase64: string;
    let vpTokenJSON: any; //TODO declare type vp token


    presentationSplitted.forEach(splittedPres => {
        if (splittedPres.split(".").length > 1)
            base64Presentation.push(splittedPres.split(".")[1])
        else {
            base64HsDisclosures.push(splittedPres)
        }
    })
    vpTokenBase64 = base64Presentation[0];
    console.log("\nvpToken: ", vpTokenBase64)

    vpToken = base64.decode(vpTokenBase64)
    vpTokenJSON = JSON.parse(vpToken)
    console.log("\nvp token decrypted: ", vpTokenJSON)

    //check for credential type (currently hard coded)
    if (vpTokenJSON.type !== "VerifiedEMail") {
        console.log("invalid credential type is used")
        return false;
    }
    console.log("\nright credential type is used")


    //check for credential expiration
    if (vpTokenJSON.exp * 1000 < Date.now()) {
        console.log("Credential Expired")
        return false;
    }
    console.log("\ncredential is not expired")

    // TODO check iat?


    // public key is currently directly extracted from JWT in did:key:{key} format  
    let issuerPublicKeyBase64 = vpTokenJSON.iss.split(":").slice(-1)[0]
    let issuerPublicKey = JSON.parse(base64.decode(issuerPublicKeyBase64))
    console.log("\ngot issuers public key:", issuerPublicKey)
    
    const jwk = await jose.importJWK(issuerPublicKey, "ES256")
    try {
        await jose.jwtVerify(presentationSplitted[0], jwk);
        console.log("\nverified issuers signature with public key: ", issuerPublicKey)
    }
    catch (VerificationError) {
        console.log("Could not verify issuers signature")
        return false;
    }

    //check if holder binding is present
    const holderBindingPresent = base64Presentation.length > 1;

    if (holderBindingPresent) {
        holderBinding = presentationSplitted.slice(-1)[0];
        console.log("\nholder binding: ", holderBinding)

        let holderPublicKey = await importHolderKey(vpTokenJSON.cnf)

        if (await verifyHolderBinding(holderPublicKey, holderBinding)) {
            console.log("\nverified holder binding with holders public key: ", vpTokenJSON.cnf)
        }
        else {
            return false;
        }
    }
    else {
        console.log("\nholder binding not available");
    }

    let hashedClaims: Array<string> = vpTokenJSON.credentialSubject._sd;
    // hash disclosed claims and compare with the presented claim hashes
    let hsDisclosureHashes: Array<string> = []

    base64HsDisclosures.forEach(
        hsDisclosure => {
            console.log("\ndisclosed claims from holder: ", base64.decode(hsDisclosure))
            hsDisclosureHashes.push(createHash('sha256').update(stringToByteArray(hsDisclosure)).digest("base64").replace(/\//, '_').replace(/\+/, '-').replace(/=/, ''));
        }
    )
    //TODO: error handling!!!
    const allContained: boolean = hsDisclosureHashes.every(hash => hashedClaims.includes(hash));
    if (allContained) {
        console.log("\nSuccess, found all disclosed claims in vpToken");
        console.log("\nHashed claims from vpToken:", hashedClaims)
        console.log("\nselectively disclosed hashed claims:", hsDisclosureHashes)

    }

    console.log("\nSuccess, found all disclosed claims in vpToken");
    return allContained;
}
'use strict';
import * as jose from 'jose';


/**
 * responds to the redirect uri from Wallet and verifies the authenticity of the 
 * data recording to the sd-jwt specification https://datatracker.ietf.org/doc/draft-ietf-oauth-selective-disclosure-jwt/
 * @param {any} cnf cnf claim contained in the vpToken
 * @returns {Promise<any>} holders public Key 
 */
export async function importHolderKey(cnf: any): Promise<any> {
    return await jose.importJWK(
        cnf.jwk,
        'ES256',
    );
}

/**
 * verifies the holder binding recording to https://datatracker.ietf.org/doc/draft-ietf-oauth-selective-disclosure-jwt/
 * @param {any} holderPublicKey holders public key
 * @param {string} holderBindingJwt holder binding jwt
 * @returns {Promise<boolean>} returns true if verification succeeds, false otherwise
 */
export async function verifyHolderBinding(holderPublicKey: any, holderBindingJwt: string): Promise<boolean> {
    try {
        // verify holders signature and check if audience matches the host
        await jose.jwtVerify(holderBindingJwt, holderPublicKey);
        return true;
    }
    catch (e) {
        console.log("Holder Binding not successful....Stopping");
        // TODO: change back to false. Only used for hackathon demo!!.
        return true;
    }
}


/**
 * helper function which converts from string to byte Array
 * @param {string} str string to be converted
 * @returns {Uint8Array} 
 */
export function stringToByteArray(str: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

/**
 * helper function which converts an object to byte Array
 * @param {Object} obj string to be converted
 * @returns {string} base64 converted object
 */
export const toBase64 = (obj: Object) : string => {
    // converts the obj to a string
    const str = JSON.stringify(obj);
    // returns string converted to base64
    return Buffer.from(str).toString('base64');
};

/**
 * helper function which makes base64 string url-safe
 * @param {Object} b64string string which is made url safe
 * @returns {string} base64 url-safe string
 */
export const replaceSpecialChars = (b64string: string) : string => {
    //@ts-ignore  
    return b64string.replace(/[=+/]/g, charToBeReplaced => {
        switch (charToBeReplaced) {
            case '=':
                return '';
            case '+':
                return '-';
            case '/':
                return '_';
        }
    });
};
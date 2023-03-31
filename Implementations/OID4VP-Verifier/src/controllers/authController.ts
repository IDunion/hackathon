"use strict";
import { readFile, writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { replaceSpecialChars, toBase64 } from "../utils";
import * as jose from "jose";
const jwt = require("jsonwebtoken");
var pem2jwk = require("pem-jwk").pem2jwk;

/**
 * handles the auth flow initiation and returns the auth request url, from where
 * the wallet can download the auth request object
 * @returns {Promise<String>} auth request url
 */
export const handleAuthInitiation = async (): Promise<String> => {
  // add new authentication process id to valid authentication process ids (usually holer would generate and send id)
  const authenticationProcessId = uuidv4();
  let validAuthProcessIdsBuffer: Buffer = await readFile(
    "./valid_auth_process_ids.json"
  );
  let validAuthProcessIds = JSON.parse(validAuthProcessIdsBuffer.toString());
  validAuthProcessIds.push(authenticationProcessId);
  let validAuthRequestsJSON = JSON.stringify(validAuthProcessIds);

  await writeFile("./valid_auth_process_ids.json", validAuthRequestsJSON);
  console.log(
    `\nstore generated auth process id ${authenticationProcessId} in file`
  );

  if (typeof process.env.CREDENTIAL_TTL !== "undefined") {
    //after credentials TTL exceeded, remove auth process id from valid IDs
    setTimeout(async () => {
      let validAuthProcessBuffer: Buffer = await readFile(
        "./valid_auth_process_ids.json"
      );
      let validAuthProcessIds = JSON.parse(validAuthProcessBuffer.toString());
      const authProcessIdIndex = validAuthProcessIds.findIndex(
        (id: string) => id === authenticationProcessId
      );
      validAuthProcessIds.splice(authProcessIdIndex, 1);
      let validAuthRequestsJSON = JSON.stringify(validAuthProcessIds);
      console.log(
        `\ndelete auth process id ${authenticationProcessId} from file`
      );
      await writeFile("./valid_auth_process_ids.json", validAuthRequestsJSON);
    }, parseInt(process.env.CREDENTIAL_TTL));
  } else {
    throw new Error("CREDENTIAL_TTL is not set");
  }

  const requestURI = `${process.env.HOST}/auth/${authenticationProcessId}`;
  const clientID = `${process.env.HOST}/auth/`;
  console.log(
    `\nreturn auth request url: ${process.env.WALLET_HOST}?client_id=${clientID}&request_uri=${requestURI}`
  );
  return `${process.env.WALLET_HOST}?client_id=${encodeURIComponent(
    clientID
  )}&request_uri=${encodeURIComponent(requestURI)}`;
};

/**
 * verifies if the auth process id is valid and returns the auth request object
 * @param {string} authProcessId id which specifies the authentication process
 * @returns {Promise<string>} auth request object
 */
export const handleCallback = async (
  authProcessId: string
): Promise<string | null> => {
  // check if request is valid (not expired)
  console.log(`\ncheck if auth process Id ${authProcessId} is valid`);
  let validAuthProcesIdsBuffer: Buffer = await readFile(
    "./valid_auth_process_ids.json"
  );
  let validAuthProcessIds = JSON.parse(validAuthProcesIdsBuffer.toString());
  const index = validAuthProcessIds.findIndex(
    (id: string) => id === authProcessId
  );

  if (index !== -1) {
    console.log(`\nauth process Id ${authProcessId} is valid!`);

    // create auth request object
    let authRequestJSON: Buffer = await readFile("./auth_request_cross.json");
    let authRequest = JSON.parse(authRequestJSON.toString());
    authRequest.client_id = process.env.HOST + "/verify";
    authRequest.redirect_uri = process.env.HOST + "/verify";
    console.log("\nreturn auth request object: ", authRequest);

    // if verifiers private key is present in .env, sign the auth request object
    if (process.env.VERIFIER_PRIVATE_KEY) {
      var verifierJWK = pem2jwk(process.env.VERIFIER_PRIVATE_KEY);
      const verifierPublicKeyJWK = await jose.importJWK(verifierJWK, "rsa");
      const signedAuthRequestJWT = new jose.SignJWT(authRequest)
        .setProtectedHeader({ alg: "RS256" })
        .sign(verifierPublicKeyJWK);
      console.log("return signed JWT: ", signedAuthRequestJWT);
      return signedAuthRequestJWT;
    } else {
      const header = {
        alg: "none",
        typ: "JWT",
      };
      const b64Header = toBase64(header);
      const jwtB64Header = replaceSpecialChars(b64Header);
      console.log("the header is: ", jwtB64Header);

      // adds additional fields like iat to the jwt
      var unsignedAuthRequestJWT = jwt.sign(authRequest, "", {
        algorithm: "none",
        noTimestamp: true,
      });

      console.log("\nreturn unsigned JWT: ", unsignedAuthRequestJWT);
      return unsignedAuthRequestJWT;
    }
  } else {
    console.log("auth process Id is invalid")
    return null;
  }
};

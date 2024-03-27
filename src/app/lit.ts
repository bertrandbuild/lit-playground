"use client";

import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { EvmContractConditions, AccessControlConditions } from "@lit-protocol/types";
import { GetWalletClientResult } from "@wagmi/core";

import { signAndSaveAuthMessage } from "./lit-signature";

const client = new LitJsSdk.LitNodeClient({
  litNetwork: "cayenne",
});

class Lit {
  litNodeClient: LitJsSdk.LitNodeClient;
  chain;

  constructor(chain: string = "mumbai") {
    this.chain = chain;
    this.litNodeClient = client;
  }

  async connect() {
    await this.litNodeClient.connect();
  }

  async encrypt(
    client: GetWalletClientResult,
    // evmContractConditions: EvmContractConditions,
    accessControlConditions: AccessControlConditions,
    message: string,
  ) {
    if (!this.litNodeClient.connectedNodes) {
      await this.connect();
    }

    // // Custom sign
    // const authSig = await signAndSaveAuthMessage({
    //   web3: client,
    //   expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    // });
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: this.chain });
    const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
      {
        // evmContractConditions,
        accessControlConditions,
        authSig,
        chain: this.chain,
        dataToEncrypt: message,
      },
      this.litNodeClient,
    );

    return {
      ciphertext,
      dataToEncryptHash,
    };
  }

  async decrypt(
    client: GetWalletClientResult,
    ciphertext: string,
    dataToEncryptHash: string,
    accessControlConditions: any
  ) {
    if (!this.litNodeClient) {
      await this.connect()
    }

    // const authSig = await signAndSaveAuthMessage({
    //   web3: client,
    //   expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    // });
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: this.chain });
    console.log(ciphertext, dataToEncryptHash, accessControlConditions, this.litNodeClient, this.chain, authSig)
    const decryptedString = await LitJsSdk.decryptToString(
      {
        accessControlConditions,
        ciphertext,
        dataToEncryptHash,
        authSig,
        chain: this.chain,
      },
      this.litNodeClient,
    );
    return { decryptedString }
  }
}

const lit = new Lit();

export default lit;

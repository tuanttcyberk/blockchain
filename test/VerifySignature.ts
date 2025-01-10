import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Wallet } from "ethers";
import { expect } from "chai";
import dotenv from "dotenv";

dotenv.config();

async function deployContract() {
  const messageVerifier = await ethers.getContractFactory("VerifySignature");
  const messageVerifierContract = await messageVerifier.deploy(
    process.env.WALLET_1 as string
  );

  return { messageVerifierContract };
}

describe("Verify Signature", function () {
  it("Valid Message", async function () {
    const { messageVerifierContract } = await loadFixture(deployContract);
    const wallet = new Wallet(process.env.PRIVATE_KEY_1 as string);

    const message = "ABC";
    const messageHash = ethers.hashMessage(message);
    const signMessage = await wallet.signMessage(message);

    // const { r, s, v } = ethers.Signature.from(signMessage);

    // const isvalid = await contract.verifyMessage(messageHash, v, r, s);
    // console.log(isvalid);

    await expect(
      messageVerifierContract.claimOwnership(messageHash, signMessage)
    ).to.be.not.reverted;
  });

  it("Invalid Message", async function () {
    const { messageVerifierContract } = await loadFixture(deployContract);
    const wallet = new Wallet(process.env.PRIVATE_KEY_2 as string);

    const message = "ABC";
    const messageHash = ethers.hashMessage(message);
    const signMessage = await wallet.signMessage(message);

    await expect(
      messageVerifierContract.claimOwnership(messageHash, signMessage)
    ).to.be.revertedWith("Invalid signature");
  });
});

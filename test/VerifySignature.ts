import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers as originalEthers, Wallet } from "ethers";
import { expect } from "chai";
import dotenv from "dotenv";

dotenv.config();

async function deployContract() {
  const [user] = await ethers.getSigners();

  const messageVerifier = await ethers.getContractFactory("VerifySignature");
  const messageVerifierContract = await messageVerifier.deploy(
    process.env.WALLET_1 as string
  );

  return { messageVerifierContract, user };
}

describe("Verify Signature", function () {
  it("Valid Message", async function () {
    const { messageVerifierContract, user } = await loadFixture(deployContract);

    const userAddress = await user.getAddress();
    const signer = new Wallet(process.env.PRIVATE_KEY_1 as string);

    const message = userAddress;

    const messageHash = originalEthers.keccak256(
      originalEthers.toUtf8Bytes(message)
    );

    const signMessage = await signer.signMessage(
      originalEthers.getBytes(messageHash)
    );

    const valid = await messageVerifierContract.compareMessageWithHash(
      userAddress,
      messageHash
    );
    console.log(valid);

    await expect(
      messageVerifierContract
        .connect(user)
        .claimOwnership(messageHash, signMessage, userAddress)
    ).to.be.not.reverted;
  });

  it("Invalid Message", async function () {
    const { messageVerifierContract } = await loadFixture(deployContract);
    const signer = new Wallet(process.env.PRIVATE_KEY_2 as string);

    const message = "ABC";
    const messageHash = originalEthers.keccak256(
      originalEthers.toUtf8Bytes(message)
    );

    const signMessage = await signer.signMessage(
      originalEthers.getBytes(messageHash)
    );

    await expect(
      messageVerifierContract.claimOwnership(messageHash, signMessage, message)
    ).to.be.revertedWith("Invalid signature");
  });
});

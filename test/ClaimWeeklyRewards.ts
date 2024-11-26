import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";

describe("ClaimWeeklyRewards", function () {
  let startTime: number;
  let endTime: number;
  const weeklyReward = parseEther("1.0");

  async function deployContract() {
    const [owner, claimer] = await ethers.getSigners();

    startTime = Math.floor(Date.now() / 1000) + 60; // Start in 1 minute
    endTime = startTime + 60 * 60 * 24 * 7 * 8; // End in 8 weeks

    const Day3Contract = await hre.ethers.getContractFactory(
      "ClaimWeeklyRewards"
    );

    const claimContract = await Day3Contract.deploy(
      startTime,
      endTime,
      weeklyReward
    );
    return { claimContract, owner, claimer };
  }

  describe("Claiming", function () {
    it("Check user claim", async function () {
      const { claimContract, claimer } = await loadFixture(deployContract);
      await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 7]);
      await ethers.provider.send("evm_mine", []);

      await claimContract.connect(claimer).claim();

      const lastClaimed = await claimContract.lastClaimedWeek(
        await claimer.getAddress()
      );
      expect(lastClaimed).to.equal(1);
    });

    it("Already claimed for the current week", async function () {
      const { claimContract, claimer } = await loadFixture(deployContract);
      await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 7]);
      await ethers.provider.send("evm_mine", []);

      // claim
      await claimContract.connect(claimer).claim();

      // claim again
      await expect(claimContract.connect(claimer).claim()).to.be.revertedWith(
        "Already claimed for the current week"
      );
    });

    it("Claiming has not started yet", async function () {
      const { claimContract, claimer } = await loadFixture(deployContract);
      // not increase time
      await expect(claimContract.connect(claimer).claim()).to.be.revertedWith(
        "Claiming has not started yet"
      );
    });

    it("Claiming period has ended", async function () {
      const { claimContract, claimer } = await loadFixture(deployContract);

      // increase time to 9 weeks
      await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 7 * 9]);
      await ethers.provider.send("evm_mine", []);

      await expect(claimContract.connect(claimer).claim()).to.be.revertedWith(
        "Claiming period has ended"
      );
    });
  });
});

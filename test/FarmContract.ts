import { ethers } from "hardhat";
import { parseEther, parseUnits, toBigInt } from "ethers";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";

describe("FarmContract", function () {
  async function deployContract() {
    const [owner, user1, user2] = await ethers.getSigners();

    const FarmContract = await hre.ethers.getContractFactory("FarmContract");
    const stakingToken = await hre.ethers.getContractFactory("MockToken");

    const stakingTokenContract = await stakingToken.deploy(
      "Staking Token",
      "ST",
      parseEther("100000")
    );

    // const stakingTokenContractAddress = await stakingTokenContract.getAddress();

    const farmContract = await FarmContract.deploy(
      stakingTokenContract,
      parseEther("1")
    );
    return { farmContract, stakingTokenContract, owner, user1, user2 };
  }

  describe("stake", function () {
    it("Check contract", async function () {
      const { farmContract, stakingTokenContract, owner, user1, user2 } =
        await loadFixture(deployContract);
      // increase Time: 60 seconds

      await time.increase(60);

      const farmContractAddress = await farmContract.getAddress();
      // const token1Address = await stakingTokenContract.getAddress();
      // const token2Address = await rewardTokenContract.getAddress();

      // transfer
      await stakingTokenContract
        .connect(owner)
        .approve(farmContractAddress, parseEther("10000"));

      await stakingTokenContract
        .connect(owner)
        .transfer(farmContractAddress, parseEther("10000"));

      await stakingTokenContract
        .connect(owner)
        .transfer(user1.address, parseEther("1"));

      await stakingTokenContract
        .connect(user1)
        .approve(farmContractAddress, parseEther("1"));

      await stakingTokenContract
        .connect(owner)
        .transfer(user2.address, parseEther("1"));

      await stakingTokenContract
        .connect(user2)
        .approve(farmContractAddress, parseEther("1"));
      // end transfer

      await farmContract.connect(user1).stake(parseEther("1"));

      // increase Time: 60 seconds
      await time.increase(1);

      await farmContract.connect(user2).stake(parseEther("1"));

      await time.increase(1);

      await farmContract.connect(user1).claimRewards();

      await time.increase(1);

      await farmContract.connect(user2).claimRewards();

      // // increase Time: 60 seconds
      // await hre.network.provider.send("evm_increaseTime", [60]);
      // await hre.network.provider.send("evm_mine", []);

      // await farmContract.connect(owner).claimRewards();
      // expect(farmContract.connect(owner).claimRewards()).to.not.be.reverted;
      const balance1 = await stakingTokenContract.balanceOf(user1.address);

      const balance2 = await stakingTokenContract.balanceOf(user2.address);

      console.log(Number(BigInt(balance1)) / 1e18);

      console.log(Number(BigInt(balance2)) / 1e18);

      // await farmContract.connect(owner).stake(parseEther("100"));
    });
  });
});

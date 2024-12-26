import { ethers } from "hardhat";
import { parseEther, parseUnits } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";

describe("FarmContract", function () {
  async function deployContract() {
    const [owner] = await ethers.getSigners();

    const FarmContract = await hre.ethers.getContractFactory("FarmContract");
    const stakingToken = await hre.ethers.getContractFactory("MockToken");
    const rewardToken = await hre.ethers.getContractFactory("MockToken");

    const stakingTokenContract = await stakingToken.deploy(
      "Staking Token",
      "ST",
      parseEther("100")
    );
    const rewardTokenContract = await rewardToken.deploy(
      "Reward Token",
      "RT",
      parseEther("100")
    );
    const stakingTokenContractAddress = await stakingTokenContract.getAddress();
    const rewardTokenContractAddress = await rewardTokenContract.getAddress();

    const farmContract = await FarmContract.deploy(
      stakingTokenContract,
      rewardTokenContract,
      parseEther("0.01")
    );
    return { farmContract, stakingTokenContract, rewardTokenContract, owner };
  }

  describe("stake", function () {
    it("Check contract", async function () {
      const { farmContract, stakingTokenContract, rewardTokenContract, owner } =
        await loadFixture(deployContract);
      // increase Time: 60 seconds
      await hre.network.provider.send("evm_increaseTime", [60]);
      await hre.network.provider.send("evm_mine", []);

      const farmContractAddress = await farmContract.getAddress();
      // const token1Address = await stakingTokenContract.getAddress();
      // const token2Address = await rewardTokenContract.getAddress();

      await stakingTokenContract
        .connect(owner)
        .approve(farmContractAddress, parseEther("10"));

      await rewardTokenContract
        .connect(owner)
        .approve(farmContractAddress, parseEther("10000"));

      // approve farm contract to spend reward token

      // await rewardTokenContract
      //   .connect(owner)
      //   .approve(farmContractAddress, parseEther("2000"));

      await farmContract.connect(owner).stake(parseEther("5"));

      // increase Time: 60 seconds
      await hre.network.provider.send("evm_increaseTime", [60]);
      await hre.network.provider.send("evm_mine", []);

      await farmContract.connect(owner).stake(parseEther("1"));

      // // increase Time: 60 seconds
      // await hre.network.provider.send("evm_increaseTime", [60]);
      // await hre.network.provider.send("evm_mine", []);

      // await farmContract.connect(owner).claimRewards();
      // expect(farmContract.connect(owner).claimRewards()).to.not.be.reverted;
      const balance = await stakingTokenContract.balanceOf(owner.address);
      console.log(balance);

      // await farmContract.connect(owner).stake(parseEther("100"));
    });
  });
});

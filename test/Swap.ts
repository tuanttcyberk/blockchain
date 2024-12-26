import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther, parseUnits } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";

describe("Swap", function () {
  async function deployContract() {
    const [owner, claimer] = await ethers.getSigners();

    const Day4Contract = await hre.ethers.getContractFactory("Swap");
    const token1 = await hre.ethers.getContractFactory("MockToken");
    const token2 = await hre.ethers.getContractFactory("MockToken");

    const token1Contract = await token1.deploy(
      "Token 1",
      "T1",
      parseEther("100000")
    );
    const token2Contract = await token2.deploy(
      "Token 2",
      "T2",
      parseEther("900000")
    );

    const swapContract = await Day4Contract.deploy(
      token1Contract,
      token2Contract
    );
    return { swapContract, token1Contract, token2Contract, owner, claimer };
  }

  describe("addLiquidity", function () {
    it("Check addLiquidity", async function () {
      const { swapContract, token1Contract, token2Contract, owner } =
        await loadFixture(deployContract);

      const contractAddress = await swapContract.getAddress();
      const token1Address = await token1Contract.getAddress();
      const token2Address = await token2Contract.getAddress();

      await token1Contract
        .connect(owner)
        .approve(contractAddress, parseEther("100"));
      await token2Contract
        .connect(owner)
        .approve(contractAddress, parseEther("900"));

      await swapContract
        .connect(owner)
        .addLiquidity(parseEther("10"), parseEther("10"));

      await expect(
        swapContract
          .connect(owner)
          .addLiquidity(parseEther("100"), parseEther("10"))
      ).to.be.revertedWith("Invalid ratio");

      // await swapContract.connect(owner).swap(token1Address, parseEther("1"));

      // const a = await token1Contract.balanceOf(contractAddress);
      // const b = await token2Contract.balanceOf(contractAddress);
      // console.log(a);
      // console.log(b);
    });
  });
});

import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { expect } from "chai";

async function deployContract() {
  const [user1, user2] = await ethers.getSigners();

  const ContractFactory = await ethers.getContractFactory("MerkleTreeValidate");

  const data = [
    [user1.address, "100"],
    [user2.address, "200"],
  ];
  const tree = StandardMerkleTree.of(data, ["address", "uint256"]);

  const root = tree.root;
  const contract = await ContractFactory.deploy(root);

  return { user1, user2, contract, tree, root, data };
}

describe("Merkle Tree", function () {
  it("should verify a valid proof", async function () {
    const { user1, user2, contract, tree, data } = await loadFixture(
      deployContract
    );

    const proof = tree.getProof(data[0]);

    const isValid = await contract.verify(user1.address, 100, proof);

    expect(isValid).to.be.true;
  });

  it("should verify a invalid proof", async function () {
    const { user2, contract, tree, data } = await loadFixture(deployContract);

    const proof = tree.getProof(data[1]);

    const isValid = await contract.verify(user2.address, 300, proof);

    expect(isValid).to.be.false;
  });
});

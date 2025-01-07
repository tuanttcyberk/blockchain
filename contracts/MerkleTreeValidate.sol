// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleTreeValidate {
    bytes32 private root;

    constructor(bytes32 _root) {
        root = _root;
    }

    function verify(
        address addr,
        uint256 amount,
        bytes32[] memory proof
    ) public view returns (bool) {
        bytes32 leaf = keccak256(
            bytes.concat(keccak256(abi.encode(addr, amount)))
        );
        return MerkleProof.verify(proof, root, leaf);
    }

    function getRoot() public view returns (bytes32) {
        return root;
    }
}

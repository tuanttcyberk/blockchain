// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VerifySignature {
    address public storedOwner;

    constructor(address _owner) {
        storedOwner = _owner;
    }

    function verifyMessage(
        bytes32 messageHash,
        bytes memory signature
    ) public view returns (bool) {
        address recoveredAddress = recoverSigner(messageHash, signature);
        return recoveredAddress == storedOwner;
    }

    function claimOwnership(
        bytes32 messageHash,
        bytes memory signature
    ) public view {
        require(verifyMessage(messageHash, signature), "Invalid signature");
        // TODO: claim ownership
    }

    function recoverSigner(
        bytes32 messageHash,
        bytes memory signature
    ) internal pure returns (address) {
        require(signature.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        if (v < 27) {
            v += 27;
        }

        return ecrecover(messageHash, v, r, s);
    }
}

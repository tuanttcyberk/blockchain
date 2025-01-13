// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";

contract VerifySignature {
    address public storedOwner;

    constructor(address _owner) {
        storedOwner = _owner;
    }

    function verifyMessage(
        bytes32 messageHash,
        bytes memory signature
    ) public view returns (bool) {
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        address recoveredAddress = recoverSigner(
            ethSignedMessageHash,
            signature
        );

        return recoveredAddress == storedOwner;
    }

    function claimOwnership(
        bytes32 messageHash,
        bytes memory signature,
        string memory senderAddress
    ) public view {
        require(
            compareMessageWithHash(senderAddress, messageHash),
            "Invalid sender"
        );
        require(verifyMessage(messageHash, signature), "Invalid signature");
        // TODO: claim ownership
    }

    function getEthSignedMessageHash(
        bytes32 messageHash
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    messageHash
                )
            );
    }

    function compareMessageWithHash(
        string memory senderAddress,
        bytes32 messageHash
    ) public pure returns (bool) {
        bytes32 calculatedHash = keccak256(abi.encodePacked(senderAddress));

        return calculatedHash == messageHash;
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

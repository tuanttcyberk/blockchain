// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWorld {
    string public message = "Hello, World!";
    address public owner;

    event MessageSet(string message, address sender);

    constructor() {
        owner = msg.sender;
    }

    function setMessage(string memory _message) public {
        message = _message;
        emit MessageSet(_message, msg.sender);
    }

    function getMessage() public view returns (string memory) {
        return message;
    }
}

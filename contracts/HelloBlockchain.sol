// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract HelloBlockchain {
    string public message;
    
    constructor() {
        message = "Hello from BlueCarbon Nexus!";
    }
    
    function setMessage(string memory newMessage) public {
        message = newMessage;
    }
    
    function getMessage() public view returns (string memory) {
        return message;
    }
}
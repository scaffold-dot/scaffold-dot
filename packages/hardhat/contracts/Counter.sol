// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Counter
 * @dev A simple counter contract that demonstrates basic smart contract functionality
 */
contract Counter {
    uint256 private count;
    address public owner;

    event CountIncremented(uint256 newCount);
    event CountDecremented(uint256 newCount);
    event CountReset(uint256 newCount);

    constructor(uint256 _initialCount) {
        count = _initialCount;
        owner = msg.sender;
    }

    /**
     * @dev Increment the counter by 1
     */
    function increment() public {
        count += 1;
        emit CountIncremented(count);
    }

    /**
     * @dev Decrement the counter by 1
     */
    function decrement() public {
        require(count > 0, "Counter: cannot decrement below zero");
        count -= 1;
        emit CountDecremented(count);
    }

    /**
     * @dev Reset the counter to zero (only owner)
     */
    function reset() public {
        require(msg.sender == owner, "Counter: only owner can reset");
        count = 0;
        emit CountReset(count);
    }

    /**
     * @dev Get the current count
     */
    function getCount() public view returns (uint256) {
        return count;
    }
}
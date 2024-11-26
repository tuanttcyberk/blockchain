// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract ClaimWeeklyRewards {
    address public owner;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public weeklyReward;

    mapping(address => uint256) public lastClaimedWeek;

    event Claimed(
        address indexed user,
        uint256 weeksClaimed,
        uint256 reward,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor(uint256 _startTime, uint256 _endTime, uint256 _weeklyReward) {
        require(_startTime < _endTime, "startTime must be before endTime");
        require(
            _startTime > block.timestamp,
            "startTime must be in the future"
        );

        owner = msg.sender;
        startTime = _startTime;
        endTime = _endTime;
        weeklyReward = _weeklyReward;
    }

    function getWeekNumber(uint256 timestamp) public view returns (uint256) {
        require(timestamp >= startTime, "Timestamp is before startTime");
        return ((timestamp - startTime) / 1 weeks) + 1;
    }

    function claim() public {
        require(block.timestamp >= startTime, "Claiming has not started yet");
        require(block.timestamp <= endTime, "Claiming period has ended");

        uint256 currentWeek = getWeekNumber(block.timestamp);
        uint256 lastClaimed = lastClaimedWeek[msg.sender];

        if (lastClaimed == 0) {
            lastClaimed = 0;
        }

        require(
            lastClaimed < currentWeek,
            "Already claimed for the current week"
        );

        uint256 weeksToClaim = currentWeek - lastClaimed;
        // update lastClaimedWeek
        lastClaimedWeek[msg.sender] = currentWeek;

        uint256 reward = weeksToClaim * weeklyReward;

        emit Claimed(msg.sender, weeksToClaim, reward, block.timestamp);
    }

    function withdraw(uint256 amount) external onlyOwner {
        payable(owner).transfer(amount);
    }

    receive() external payable {}
}

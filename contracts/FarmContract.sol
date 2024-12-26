// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract FarmContract {
    using Strings for uint256;

    IERC20 public stakingToken;
    address public owner;
    uint256 public totalStaked;
    uint256 public rewardPerSecond;
    uint256 public rewardPerToken;
    uint256 public lastUpdateRewardTime;
    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
    }
    mapping(address => UserInfo) public userInfo;

    constructor(IERC20 _stakingToken, uint256 _rewardPerSecond) {
        owner = msg.sender;
        stakingToken = IERC20(_stakingToken);
        rewardPerSecond = _rewardPerSecond;
        lastUpdateRewardTime = block.timestamp;
    }

    function updatePool() public {
        // cập nhật số lượng stake trong pool và rewardPerToken

        if (block.timestamp < lastUpdateRewardTime) return;
        uint256 timePassed = block.timestamp - lastUpdateRewardTime;

        if (totalStaked > 0) {
            // thưởng mỗi token bằng rewardPerSecond nhân thời gian chia tổng stake
            uint256 reward = (rewardPerSecond * timePassed * 1e36) /
                totalStaked;
            rewardPerToken += reward;
        }

        lastUpdateRewardTime = block.timestamp;
    }

    function stake(uint256 _amount) external {
        updatePool();
        UserInfo storage user = userInfo[msg.sender];
        if (user.amount > 0) {
            // trả về reward cho người dùng
            uint256 totalReward = (user.amount * rewardPerToken) / 1e36;
            uint256 availableReward = totalReward - user.rewardDebt;
            if (availableReward > 0) {
                stakingToken.transfer(msg.sender, availableReward);
            }
        }
        // thêm số lượng stake cho người dùng
        user.amount += _amount;
        user.rewardDebt = (user.amount * rewardPerToken) / 1e36; // cập nhật mới rewardDebt từ lúc stake
        stakingToken.transfer(address(this), _amount);
        totalStaked += _amount;
    }

    function withdraw(uint256 _amount) external {
        UserInfo storage user = userInfo[msg.sender];
        require(user.amount >= _amount, "Khong lam ma doi co an - Thay Huan");
        updatePool();

        // trả về reward cho người dùng
        uint256 totalReward = (user.amount * rewardPerToken) /
            1e36 -
            user.rewardDebt;
        stakingToken.transfer(msg.sender, totalReward);
        // trả về số lượng stake cho người dùng
        user.amount -= _amount;
        user.rewardDebt = (user.amount * rewardPerToken) / 1e36; // cập nhật mới rewardDebt
        totalStaked -= _amount;
    }

    function claimRewards() external {
        UserInfo storage user = userInfo[msg.sender];
        updatePool();
        uint256 totalReward = ((user.amount * rewardPerToken) / 1e36) -
            user.rewardDebt;
        require(totalReward > 0, "Khong lam ma doi co an - Thay Huan");
        stakingToken.transfer(msg.sender, totalReward);
        user.rewardDebt = (user.amount * rewardPerToken) / 1e36;
    }
}

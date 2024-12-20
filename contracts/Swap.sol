// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Swap {
    IERC20 public token0;
    IERC20 public token1;
    uint256 public k;

    uint256 public reserve0;
    uint256 public reserve1;
    address public owner;

    constructor(address _token0, address _token1) {
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
        owner = msg.sender;
    }

    function addLiquidity(uint256 _amount0, uint256 _amount1) external {
        // xử lý khi supply0, supply1 > 0
        // biến smart contract thành một token (LP Token)
        // xử lý khi supply0, supply1 = 0
        if (reserve0 == 0 && reserve1 == 0) {
            reserve0 = _amount0;
            reserve1 = _amount1;
            token0.transferFrom(msg.sender, address(this), _amount0);
            token1.transferFrom(msg.sender, address(this), _amount1);
        } else {
            uint256 ratioReserve0 = reserve0 / _amount0;
            uint256 ratioReserve1 = reserve1 / _amount1;
            require(ratioReserve0 == ratioReserve1, "Invalid ratio");
            token0.transferFrom(msg.sender, address(this), _amount0);
            token1.transferFrom(msg.sender, address(this), _amount1);
        }
    }

    function swap(address _from, uint256 _amountIn) external {
        uint256 supply0 = reserve0;
        uint256 supply1 = reserve1;

        if (address(token0) == _from) {
            // supply0 * supply1 = (supply0 + amountIn) * (supply1 - amountOut)
            // supply0 * supply1 = supply0 * supply1 - supply0 * amountOut + supply1 * amountIn - amountIn * amountOut
            // 0 = -supply0 * amountOut + supply1 * amountIn - amountIn * amountOut
            // supply0 * amountOut - amountIn * amountOut = supply1 * amountIn
            // amountOut * (supply0 - amountIn) = supply1 * amountIn
            // amountOut = (supply1 * amountIn) / (supply0 - amountIn)
            uint256 totalAmountOut = (_amountIn * supply1) /
                (supply0 - _amountIn);
            // fee 0.3%
            uint256 amountOut = totalAmountOut - (totalAmountOut * 3) / 1000;
            uint256 fee = totalAmountOut - amountOut;
            // transfer fee
            token0.transfer(owner, fee);
            token0.transferFrom(msg.sender, address(this), _amountIn);
            token1.transfer(msg.sender, amountOut);
            reserve0 += _amountIn;
            reserve1 -= amountOut;
        } else {
            uint256 amountOut = (_amountIn * reserve0) / (reserve1 - _amountIn);
            token1.transferFrom(msg.sender, address(this), _amountIn);
            token0.transfer(msg.sender, amountOut);
            reserve0 -= amountOut;
            reserve1 += _amountIn;
        }
    }
}

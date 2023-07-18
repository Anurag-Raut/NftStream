// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Creator is ERC20, ERC20Burnable, Ownable {
    uint256 priceOfOneToken;
    constructor(address owner) ERC20("Creator", "Cr") {
        priceOfOneToken=0.001 ether;
        transferOwnership(owner);
    }

    function mint(address to, uint256 amount) public payable {
        require(msg.value>=(amount*priceOfOneToken),'insufficient eth send');
        _mint(to, amount);
    }
}

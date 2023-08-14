// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Creator.sol";

contract Factory {
    mapping(address=>address) public CreatorAddress;


    function newCreator() public returns (address) {
        Creator new_creator = new Creator(msg.sender);
	
        CreatorAddress[msg.sender]=address(new_creator);

		return address(new_creator);

    }

	



	


}

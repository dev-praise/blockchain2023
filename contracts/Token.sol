// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token {

	string public name;
	string public symbol;
	uint public decimal = 18;
	uint public totalSupply;

	constructor(string memory _name, string memory _symbol, uint _totalSupply){
		name = _name;
		symbol = _symbol;
		totalSupply = _totalSupply * (10 ** decimal);
	}
}


pragma solidity >=0.4.22 <0.9.0;

contract QkToken{

    //numbers of tokens. Name is because the ERC-20 standard
    uint256 public totalSupply;
    // constructor
    constructor() public{
        totalSupply = 1000000;
    }
}

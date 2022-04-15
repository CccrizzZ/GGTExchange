// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol";


// NFT for game ownership 
contract GGTimeEx is ERC721 {


    // variables
    // owner address
    address private owner;


    // map of all users
    mapping(address => Roles) AllUsers;

    // 3 different roles
    enum Roles {
        Player,
        Developer,
        Admin
    }


    // constructor also ERC721's contructor
    constructor() ERC721("GGTimeToken", "GGTT") {
        // set owner and set role to admin
        owner = msg.sender;
        AllUsers[msg.sender] = Roles.Admin;

    }


    // modifier
    modifier OnlyAdmin {
        require(AllUsers[msg.sender] == Roles.Admin, "Only Admin Can Call!");
        _;
    }

    modifier OnlyPlayer {
        require(AllUsers[msg.sender] == Roles.Admin, "Only Player Can Call!");
        _;
    }

    modifier OnlyDeveloper {
        require(AllUsers[msg.sender] == Roles.Admin, "Only Developer Can Call!");
        _;
    }




    // functions
    // set to certain role
    function SetRole(address user, Roles role) OnlyAdmin public {
        AllUsers[user] = role;
    }


    // set caller role to player
    function SetMeToPlayer() public {
        AllUsers[msg.sender] = Roles.Player;
    }


    // check role for caller
    function GetMyRole() public view returns (Roles) {
        return AllUsers[msg.sender];
    }


    function MintForNewGame(string memory name ) OnlyAdmin public {

    }

}
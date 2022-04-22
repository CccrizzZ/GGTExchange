// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


// NFT for game ownership 
contract GGTimeEx is ERC721URIStorage {

    // owner address
    address public owner;


    // counter utility for erc721
    using Counters for Counters.Counter;
    Counters.Counter public TokenIDs;    // token id
    Counters.Counter private GIDs;        // game id


    // royalties percentage for P2P market
    uint256 public constant RoyaltiesPercentage = 1;

    // royalties percentage for P2P market
    uint256 public constant PlatformPercentage = 2;


    // P2P market listing
    // token id and price
    mapping(uint256 => P2PListing) P2PStoreListing;
    struct P2PListing {
        uint256 id;
        uint256 price;
        bool sold;  // determines if the item is already sold
    }


    // constructor also ERC721's contructor
    constructor() ERC721("GGTimeToken", "GGTT") {
        // set owner and set role to admin
        owner = msg.sender;
        AllUsers[msg.sender] = Roles.Admin;
        TipJar = 0;
    }


    // modifier
    modifier OnlyAdmin {
        require(AllUsers[msg.sender] == Roles.Admin, "Only Admin Can Call!");
        _;
    }
    modifier OnlyPlayer {
        require(AllUsers[msg.sender] == Roles.Player, "Only Player Can Call!");
        _;
    }
    modifier OnlyDeveloper {
        require(AllUsers[msg.sender] == Roles.Developer, "Only Developer Can Call!");
        _;
    }
    modifier OnlyGuest {
        require(AllUsers[msg.sender] == Roles.Guest, "Only Guest Can Call!");
        _;
    }





    // map of all users and related functions
    mapping(address => Roles) public AllUsers ;
    // 3 different roles
    enum Roles {
        Guest,
        Player,
        Developer,
        Admin
    }
    function SetRole(address user, Roles role) OnlyAdmin public {
        AllUsers[user] = role;
    }
    function GetRole(address user) OnlyAdmin public view returns (Roles) {
        return AllUsers[user];
    }
    function SetMeToPlayer() OnlyGuest public {
        AllUsers[msg.sender] = Roles.Player;
    }
    function SetMeToDeveloper() OnlyPlayer public {
        AllUsers[msg.sender] = Roles.Developer;
    }
    function GetMyRole() public view returns (Roles) {
        return AllUsers[msg.sender];
    }





    // map of all submitted games
    mapping(address => GamePitch[]) AllGamePitch;
    // developer pitch data
    struct GamePitch {
        uint256 GID;
        string name;
        uint256 price;
        string URI;
        bool approved;
        bool rejected;
    }
    function SubmitPitch(string memory name, uint256 price, string memory URI) OnlyDeveloper public returns(uint256) {
        
        // increment game id counter
        GIDs.increment();

        // get counter current number
        uint256 newID = GIDs.current();

        // construct and push new game pitch
        AllGamePitch[msg.sender].push(GamePitch(newID, name, price, URI, false, false));

        return newID;
    }
    function ApproveGameByDevID(address dev, uint256 gid) OnlyAdmin public {
        AllGamePitch[dev][gid].approved = true;
    }
    function RejectGameByDevID(address dev, uint256 gid) OnlyAdmin public {
        AllGamePitch[dev][gid].rejected = true;
    }







    // sales revenue pending to be claimed
    // when players buys games they send crypto to this contract
    // developers can claim it later
    mapping(address => uint256) PendingSalesRevenue;
    
    // market listing and related functions
    // GID =====> Price
    mapping(uint256 => Listing) StoreListing;
    struct Listing {
        uint256 GID;
        string name;
        uint256 price;
        string URI;
        address publisher;
        bool live; // determines if the sales is alive
    }
    // called by admin to list game in store
    function ListNewGame(uint256 GID, string memory name, uint256 price, string memory desc, address publisher, bool live) OnlyAdmin public {
        StoreListing[GID] = Listing(GID, name, price, desc, publisher, live);
    }
    function IsListingAlive(uint256 GID) public view returns(bool) {
        return StoreListing[GID].live;
    }
    // purchase a listing
    function BuyGame(address player, uint256 GID) OnlyPlayer public payable {
        
        // check if game exist
        require(StoreListing[GID].live == true, "game not found" );

        // check if price match
        require(msg.value == StoreListing[GID].price , "amount send does not match amount required");


        // mint token to the player
        // increment the counter
        TokenIDs.increment();

        // get counter current number
        uint256 newID = TokenIDs.current();

        // mint the token to the player and set its uri
        _mint(player, newID);
        _setTokenURI(newID, StoreListing[GID].URI);

        // add token id under player token mapping
        UserLibrary[player].push(newID);
        PendingSalesRevenue[StoreListing[GID].publisher] += msg.value;
    }
    function WithdrawRevenue() OnlyDeveloper public {
        require(PendingSalesRevenue[msg.sender] > 0, "You have nothing to withdraw");

        // 98 percent goto developer and 2 percent goto platform
        uint256 revenue = PendingSalesRevenue[msg.sender] * (1 - (PlatformPercentage / 100)) ;
        uint fee = PendingSalesRevenue[msg.sender] * (PlatformPercentage / 100);

        // pay the developer and add revenue to tipjar
        payable(msg.sender).transfer(revenue);
        TipJar += fee;
    }






    // user owned tokens
    // (user address ==>> tokenID array)
    mapping(address => uint256[]) UserLibrary;
    // return user library array 
    function GetTokenArray(address addr) OnlyPlayer public view returns(uint256[] memory) {
        return(UserLibrary[addr]);
    }


    // player display name
    mapping(address => string) UserDisplayNames;
    function SetMyDisplayName(string memory name) public {
        UserDisplayNames[msg.sender] = name;
    }
    function GetMyDisplayName() public view returns(string memory){
        return UserDisplayNames[msg.sender];
    }




    // platform income
    uint256 private TipJar;
    function CheckTipJar() OnlyAdmin public view returns(uint256) {
        return TipJar;
    }

    function TouchTipJar() OnlyAdmin public {
        require(TipJar > 0, "Tip jar is empty");
        payable(owner).transfer(TipJar);
    }
}
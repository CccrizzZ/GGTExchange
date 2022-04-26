// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


// NFT for game ownership 
contract GGTimeEx is ERC721URIStorage {

    // owner address
    address public owner;

    // counter utility form erc721
    using Counters for Counters.Counter;

    // token id for game ownership token
    // is incremented when token minted
    Counters.Counter public TokenIDs;


    // game pitch id
    // is incremented when new game submitted
    Counters.Counter private GIDs;


    // royalties percentage to developer for P2P market 
    uint256 public constant RoyaltiesPercentage = 1;

    // platform percentage on game sales
    uint256 public constant PlatformPercentage = 2;




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
    mapping(address => Roles) AllUsers ;
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
    mapping(address => GamePitch[]) GamePitchMap;
    
    // array for all game pitch
    GamePitch[] AllGamePitch;
    // developer pitch data
    struct GamePitch {
        uint256 GID;
        string name;
        uint256 price;
        string URI;
        address publisher;
        bool approved;
        bool rejected;
    }
    function SubmitPitch(string memory name, uint256 price, string memory URI) OnlyDeveloper public returns(uint256) {
        
        // increment game id counter
        GIDs.increment();

        // get counter current number
        uint256 newID = GIDs.current();

        // store in game pitch mapping 
        GamePitchMap[msg.sender].push(GamePitch(newID, name, price, URI, msg.sender, false, false));

        // store in all game pitch array
        AllGamePitch.push(GamePitch(newID, name, price, URI, msg.sender, false, false));

        // return submitted gid
        return newID;
    }
    function ApproveGameByDevID(address dev, uint256 gid) OnlyAdmin public {

        // approve the pitch
        GamePitchMap[dev][gid].approved = true;

        // list pitch on market place
        ListNewGame(gid, GamePitchMap[dev][gid].name, GamePitchMap[dev][gid].price, GamePitchMap[dev][gid].URI, GamePitchMap[dev][gid].publisher, true);

    }
    function RejectGameByDevID(address dev, uint256 gid) OnlyAdmin public {
        GamePitchMap[dev][gid].rejected = true;
    }
    function GetMyGamePitch() OnlyDeveloper public view returns(GamePitch[] memory){
        return GamePitchMap[msg.sender];
    }






    
    // market listing and related functions
    // array of all game published
    Listing[] public StoreListing;

    // mapping of game id ==== listing
    mapping(uint256 => Listing) public GIDListing;

    // listing struct
    struct Listing {
        uint256 GID;
        string name;
        uint256 price;
        string URI;
        address publisher;
        bool live; // determines if the sales is alive
    }

    // return all store listings
    function GetAllStoreListing() public view returns(Listing[] memory){
        return StoreListing;
    }
    function IsLive(uint256 GID) public view returns(bool){
        return GIDListing[GID].live;
    }
    // called by admin to list game in store
    function ListNewGame(uint256 GID, string memory name, uint256 price, string memory URI, address publisher, bool live) OnlyAdmin public {
        
        // push into store listing
        StoreListing.push(Listing(GID, name, price, URI, publisher, live));

        // push into gid mapping
        GIDListing[GID] = Listing(GID, name, price, URI, publisher, live);
    }

    // purchase a listing
    function BuyGame(uint256 GID) OnlyPlayer public payable {

        // check if game exist
        require(GIDListing[GID].live == true, "game not found" );

        // check if price match
        require(msg.value == GIDListing[GID].price , "amount send does not match amount required");

        // increment the counter
        TokenIDs.increment();

        // get counter current number
        uint256 newTokenID = TokenIDs.current();

        // mint the token to the player 
        _mint(msg.sender, newTokenID);

        // set token uri
        _setTokenURI(newTokenID, GIDListing[GID].URI);

        // add revenue to publisher income
        PendingSalesRevenue[GIDListing[GID].publisher] += msg.value;

        // add token id under player token mapping
        AddToLibrary(msg.sender, newTokenID);

    }




    // developers unclaimed revenue
    mapping(address => uint256) PendingSalesRevenue;

    // developers withdraw income
    function WithdrawRevenue() OnlyDeveloper public {
        require(PendingSalesRevenue[msg.sender] > 0, "No income!");

        // 98 percent goto developer and 2 percent goto platform
        uint256 fee = PendingSalesRevenue[msg.sender] * PlatformPercentage / 100;
        uint256 revenue = PendingSalesRevenue[msg.sender] - fee;

        // pay the developer and add revenue to tipjar
        payable(msg.sender).transfer(revenue);
        TipJar += fee;

        // clear developer sales revenue
        PendingSalesRevenue[msg.sender] = 0;
    }

    function CheckUnclaimedRevenue() OnlyDeveloper public view returns(uint256) {
        return(PendingSalesRevenue[msg.sender]);
    }






    // P2P market listing
    // token id and price
    mapping(uint256 => P2PListing) public P2PStoreListing;


    // array for all p2p listings
    P2PListing[] public AllP2PListing;


    struct P2PListing {
        uint256 tokenID;
        uint256 price;
        address owner;
        bool sold;  // determines if the item is already sold
    }
    function PostP2PListing(uint256 tokenID, uint256 price) OnlyPlayer public {
        
        // seller must have the token
        require(ownerOf(tokenID) == msg.sender, "You do not own it");

        // store in mapping
        P2PStoreListing[tokenID] = P2PListing(tokenID, price, msg.sender, false);

        // store in array
        AllP2PListing.push(P2PListing(tokenID, price, msg.sender, false));

    }
    function PurchaseP2PListing(uint256 tokenID) OnlyPlayer public payable {

        // price must match the listing price
        require(msg.value == P2PStoreListing[tokenID].price, "Price must match the listing");

        // check if token sold
        require(P2PStoreListing[tokenID].sold == false, "Token Sold");

        // send moeny to token owner
        payable(ownerOf(tokenID)).transfer(msg.value);

        // send token to the buyer
        _transfer(P2PStoreListing[tokenID].owner, msg.sender, tokenID);

        // set sold to true
        P2PStoreListing[tokenID].sold = true;

        // push into user token array
        AddToLibrary(msg.sender ,tokenID);
    }
    function GetAllP2PListing() public view returns(P2PListing[] memory){
        return AllP2PListing;
    }
    function IsSold(uint256 tokenID) public view returns(bool) {
        return P2PStoreListing[tokenID].sold;
    }




    // user owned tokens
    // (user address ==>> tokenID array)
    mapping(address => uint256[]) UserLibrary;
    // return user library array 
    function GetPlayerLibrary(address user) OnlyAdmin public view returns(uint256[] memory) {
        return(UserLibrary[user]);
    }
    // return caller library array 
    function GetMyLibrary() OnlyPlayer public view returns(uint256[] memory) {
        return(UserLibrary[msg.sender]);
    }
    // add token under user name
    function AddToLibrary(address user, uint256 tokenID) private {
        UserLibrary[user].push(tokenID);
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
    
    // claim platform revenue
    function TouchTipJar() OnlyAdmin public {
        // require tipjar not empty
        require(TipJar > 0, "Tip jar is empty");
        
        // transfer
        payable(owner).transfer(TipJar);
        
        // clear tipjar
        TipJar = 0;
    }
}
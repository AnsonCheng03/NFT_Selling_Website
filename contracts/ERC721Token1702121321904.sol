// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.20;

//import "@openzeppelin/contracts@5.0.0/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract ERC721Token1702121321904 is ERC721URIStorage {
    address private _owner;
    uint private max_supply = 2;
    uint private max_mint = 1;
    uint private startId = 0;
    mapping(address => uint) private whitelistMinters; 

    constructor() ERC721("ERC721Token1702121321904", "ERC721") {
        _owner = msg.sender;
        whitelistMinters[msg.sender] = 1;
    }

    // only owner of the contract call whitelist an address for minting
    function whitelist(address addr, uint amount) external {
        require(msg.sender == _owner, "Only owner can call this function");                            
        require(startId+amount-1 < max_supply, "Max supply exceeded");         
        require(amount <= max_mint, "Max mint amount for an address is 2");          
        whitelistMinters[addr] = amount;                                                                                                                                  
    }

    function mint(string memory uri) external {
        require(whitelistMinters[msg.sender] > 0, "You are not a whitelisted minter");             
        _safeMint(msg.sender, startId);
        _setTokenURI(startId, uri);
        startId += 1;
        whitelistMinters[msg.sender] -= 1;
        if (whitelistMinters[msg.sender] > 0) {
            _safeMint(msg.sender, startId);
            _setTokenURI(startId, uri);
            startId += 1;
            whitelistMinters[msg.sender] -= 1;
        }                                                        
    }

    

    function checkRemainingSupply() public view returns (uint) {
        return max_supply - startId;
    }
}
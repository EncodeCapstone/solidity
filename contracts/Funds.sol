// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import {RewardToken} from "./Token.sol";

contract Funds is Ownable {
    uint256 public FundCounter; // Auto id counter
    RewardToken public rewardTokenContract; // Token contract

    struct Fund {
        uint256 fundID; // Unique identifier of fund
        string name; // Name of fund
        bool fundActive; // Whether funding is ongoing
        address fundOwner; // Owner of fund
        address receiver; // Receiver address of funds
        uint256 totalFunded; // Total funding received
        string description; // Fund description
        string ipfsUrl; // URL to the IPFS where the fund cover is stored
    }

    Fund[] public funds; // List of all funds
    mapping(address => uint256) private fundOwners; // Mapping of owner address to specific fund
    mapping(address => mapping(uint256 => uint256)) private funders; // Person x funds fundID y, z amount

    modifier onlyFundOwner(uint256 _fundID) {
        require(msg.sender == funds[_fundID].fundOwner, "Not the fund owner");
        _;
    }

    modifier onlyAdminOrFundOwner(uint256 _fundID) {
        require(msg.sender == funds[_fundID].fundOwner || msg.sender == owner(), "Not the right access");
        _;
    }

    modifier fundActive(uint256 _fundID) {
        require(funds[_fundID].fundActive, "Fund not open");
        _;
    }

    constructor() Ownable() {
        rewardTokenContract = new RewardToken("CHARITY", "TY");
        FundCounter = 0;
    }

    /// @dev Initializes new fund that is open for funding starting with 0 total funds and where msg.sender is the fund owner
    /// @param _name Name of fund
    /// @param _receiver Receiving address of funding for this fund
    /// @param _description Key description of what this fund is about
    function createfund(string memory _name, address _receiver, string memory _description, string memory _ipfsUrl) external {
        funds.push(Fund(FundCounter, _name, true, msg.sender, _receiver, 0, _description, _ipfsUrl));
        fundOwners[msg.sender] = FundCounter;
        FundCounter += 1;
    }

    /// @dev User donates a certain amount of ETH to fund, for which the same amount of reward tokens are minted to user
    /// @param _fundID Unique ID of fund
    function donateToFund(uint256 _fundID) public payable {
        Fund storage fund = funds[_fundID];
        fund.totalFunded += msg.value;
        funders[msg.sender][_fundID] += msg.value;
        rewardTokenContract.mint(msg.sender, msg.value);
    }

    /// @dev Ends the funding and sends the collected ETH to specific receiver address of fund
    /// @param _fundID Unique ID of fund
    function endFund(uint256 _fundID) external onlyAdminOrFundOwner(_fundID) fundActive(_fundID) {
        funds[_fundID].fundActive = false;
        withdrawFunding(_fundID);
    }

    /// @dev Ends the funding and sends the collected ETH to specific receiver address of fund
    /// @param _fundID Unique ID of fund
    function withdrawFunding(uint256 _fundID) internal {
        Fund storage fund = funds[_fundID];
        (bool sent, ) = fund.receiver.call{value: fund.totalFunded}("");
        require(sent, "Failed to send Ether");
    }

    /// @dev Gets total amount funded of specific user for specific fund
    /// @param funder Address of user
    /// @param _fundID Unique ID of fund
    function getFunderAmount(address funder, uint256 _fundID) external view onlyFundOwner(_fundID) returns (uint256) {
        require(funders[funder][_fundID] > 0, "Funder not found");
        return funders[funder][_fundID];
    }

    /// @dev Gets specific fund
    /// @param _fundID Unique ID of fund
    function getFunds(uint256 _fundID) external view returns(Fund memory) {
        return funds[_fundID];
    }

    /// @dev Gets IPFS URL of specific fund
    /// @param _fundID Unique ID of fund
    function getIPFS(uint256 _fundID) external view returns(string memory) {
        return funds[_fundID].ipfsUrl;
    }

    /// @dev Gets total amount funded of function caller for specific fund
    /// @param _fundID Unique ID of fund
    function getOwnFundingAmount(uint256 _fundID) external view returns (uint256) {
        require(funders[msg.sender][_fundID] > 0, "No funds found");
        return funders[msg.sender][_fundID];
    }

    /// @dev Gets total reward token balance of function caller
    function getTokenBalanceOf() external view returns (uint256) {
        return rewardTokenContract.balanceOf(msg.sender);
    } 
}
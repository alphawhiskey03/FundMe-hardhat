// SPDX-License-Identifier: MIT
//Pragma statements
pragma solidity ^0.8.8;

//imports
import "./PriceConverter.sol";

// This is used to console.log info from contract to the console while running test
import "hardhat/console.sol";

//interfaces and libraries if we have them

error FundMe__NotOwner();

/**
 * @title A contract for crowd funding
 * @author Vignesh s
 * @notice This is a tutorial contract to understand funding using contracts
 * @dev This implements price feeds as the library
 */

contract FundMe {
    // exmaple 50*10^17=5000000000000000000

    // Type Declarations
    using PriceConverter for uint256;

    // state variables
    uint256 public constant MINIMUM_USD = 50 * 1e17; // 1*10 **17
    // gas price with constant -21,393=0.000406467
    // has price without constnat- 23,515=0.000408785
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmtFunded;
    address private immutable i_owner;
    // immutable - 21508
    // non-immutable - 23644
    AggregatorV3Interface private s_priceFeed;

    // Modifiers and events(No events as of now)

    modifier onlyOwner() {
        // require(msg.sender == i_owner, "sender is not the owner");

        // the below method is more effecient as we dont need to save the error message string , saves gas
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    // Functions Order:
    //// constructor
    //// receive
    //// fallback
    //// external
    //// public
    //// internal
    //// private
    //// view / pure

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     * @notice This function funds this contract
     * @dev checks if the amount sent is greater than set Minimum amout and keeps tract of the funder addresses
     */

    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "must be greater than 50 dollars"
        );

        // This statement only works throught hardhat/console.sol
        // console.log("Transferring from %s", msg.sender);

        s_addressToAmtFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    /**
     * @notice This function withdraws the funds in the contract
     * @dev checks if the amount sent is greater than set Minimum amout and keeps tract of the funder addresses
     */

    function withdraw() public onlyOwner {
        for (uint256 i = 0; i < s_funders.length; i++) {
            address funder = s_funders[i];
            s_addressToAmtFunded[funder] = 0;
            // console.log(s_addressToAmtFunded[funder]);
        }

        s_funders = new address[](0);
        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        // the above function return callSuccess and bytes dataReturned
        require(callSuccess, "Transaction failed");
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            s_addressToAmtFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        // the above function return callSuccess and bytes dataReturned
        require(callSuccess, "Transaction failed");
    }

    // view / pure

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmtFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmtFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    // function getConversionRate() public view return
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        (, int price, , , ) = priceFeed.latestRoundData();
        // price is gonna be just with 8 deciamls so we are including another 10 decimal
        // so that it will be easy to multiply it with ethPrice
        return uint256(price * 1e10);
    }

    // function getOriginalPrice(AggregatorV3Interface priceFeed)
    //     internal
    //     view
    //     returns (uint256)
    // {
    //     (, int price, , , ) = priceFeed.latestRoundData();
    //     return uint256(price);
    // }

    function getConversionRate(
        uint256 ethereumAmt,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);

        // here ethereum Amt will be with with 18 decimals and ethPrice will be with another 18 decimal
        // so when we multiply we'll get a total of 36 decimal , to cut it down we are diving with 18 decimal
        // example (100093600*10^10*50000000000000000)/10^16=5004680000000000000

        uint256 ethAmtInUsed = (ethereumAmt * ethPrice) / 1e16;
        return ethAmtInUsed;
    }

    // function getDecimal(AggregatorV3Interface priceFeed)
    //     internal
    //     view
    //     returns (uint256)
    // {
    //     return priceFeed.decimals();
    // }
}

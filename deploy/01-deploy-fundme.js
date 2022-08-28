const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
// const { network } = require("hardhat");

// below the objects getNamedAccounts, deployement are extracted from hre {getNamedAccounts,deployments}=hre
module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy, log, get } = deployments;
  // below the deployer comes from the namedAccount section in hardhat.config
  // in rinkeby account array in network section 0th array index is deployer

  const { deployer } = await getNamedAccounts();
  // console.log(deployer);
  const chainName = network.name;
  // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  let ethUsdPriceFeedAddress;
  // console.log(networkConfig);
  // console.log(chainId);
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainName]["ethUsdPriceFeed"];
  }
  const args = [ethUsdPriceFeedAddress];

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args);
  }
  log("-----------------------------");
};

module.exports.tags = ["all", "fundme"];

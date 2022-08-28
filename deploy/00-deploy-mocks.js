const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  // below the deployer comes from the namedAccount section in hardhat.config
  // in rinkeby account array in network section 0th array index is deployer
  const {
    deployer,
    // user
  } = await getNamedAccounts();
  const chainId = network.config.chainId;
  // console.log(chainId);

  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    });
    log("Mocks deployed!");
    log("--------------------------");
  }
};

module.exports.tags = ["all", "mocks"];

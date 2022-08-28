const { getNamedAccounts, ethers } = require("hardhat");

const main = async () => {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  const transactionResponse = await fundMe.withdraw();
  console.log("withdrawing funds...");
  await transactionResponse.wait(1);
  console.log("funds withdrawn!");
};
main()
  .then(() => process.exit(0))
  .catch((err) => console.log(err));

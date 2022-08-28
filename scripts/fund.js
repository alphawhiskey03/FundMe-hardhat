const { getNamedAccounts, ethers } = require("hardhat");

const main = async () => {
  const { deployer } = getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("funding contract...");
  const transactionResponse = await fundMe.fund({
    value: ethers.utils.parseEther("0.1"),
  });
  await transactionResponse.wait(1);
  console.log("Funded the contract!");
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
  });

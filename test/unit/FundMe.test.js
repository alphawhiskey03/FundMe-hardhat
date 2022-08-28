const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function() {
      let fundMe;
      let deployer;
      let MockV3Aggregator;
      const sendValue = ethers.utils.parseEther("1");
      // const sendvalue1 = ethers.utils.parseUnits("1.0", "ether"); //can also be used
      // console.log(sendValue.toString());

      beforeEach(async function() {
        //   * if multiple tests use the same contract, the deployment will be executed once
        //  and each test will start with the exact same state
        // * Tests can use the hre.deployments.fixture function to run the deployment and snapshot
        //   it so that tests don't need to perform all the deployment transactions every time.
        // They can simply reuse the snapshot for every test

        await deployments.fixture(["all"]);

        deployer = (await getNamedAccounts()).deployer;

        // another way to get the accounts
        // get signers directly gets the accounts from the accounts array in hardhat.config
        // const accounts = ethers.getSigners();
        // const accountZero = accounts[0];

        // hardhat-deploy wraps ether with a function called getContract
        // getContract gets the most recent deployment of the mentioned contract
        // so for example whenever we call any function from fundMe it will be with the deployer account we've passed in.

        fundMe = await ethers.getContract("FundMe", deployer);
        MockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("contructor", async () => {
        it("sets aggregator address correctly", async () => {
          const response = await fundMe.getPriceFeed();
          assert(response, MockV3Aggregator.address);
        });
      });

      describe("Fund", async () => {
        it("Fails if you don't send 1 ether", async () => {
          // await fundMe.fund();
          await expect(fundMe.fund()).to.be.revertedWith(
            "must be greater than 50 dollars"
          );
        });
        it("Updates  the amount funded  data structure", async () => {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmtFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });
        it("Checking if address added to getFunder array", async () => {
          await fundMe.fund({ value: sendValue });

          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer);
        });
      });
      describe("withdraw", async () => {
        it("Withdraw ETH from a single founder", async () => {
          // Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          // Assert
          assert.equal(startingFundMeBalance.toString(), 0);

          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("Allows us to withdraw with multiple funders", async () => {
          //Arrange
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Act
          const transactionResponse = await fundMe.withdraw();
          const transactionRecipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionRecipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Assert
          // assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          for (let j = 1; j < 6; j++) {
            // console.log(await fundMe.getAddressToAmtFunded(accounts[j].address));
            assert.equal(
              await fundMe.getAddressToAmtFunded(accounts[j].address),
              0
            );
          }
        });

        it("Only owner", async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[2];
          const attackerConnectedContract = await fundMe.connect(attacker);
          // await attackerConnectedContract.withdraw();
          await expect(
            attackerConnectedContract.withdraw()
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
        });

        it("cheaper withdraw - multiple funders", async () => {
          //Arrange
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Act
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionRecipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionRecipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Assert
          // assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          for (let j = 1; j < 6; j++) {
            // console.log(await fundMe.getAddressToAmtFunded(accounts[j].address));
            assert.equal(
              await fundMe.getAddressToAmtFunded(accounts[j].address),
              0
            );
          }
        });
        it("cheaper withdraw - single fundersr", async () => {
          // Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Act
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          // Assert
          assert.equal(startingFundMeBalance.toString(), 0);

          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });
      });
    });

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Funds, Funds__factory } from "../typechain";

const PROJECT_NAME = "Game";
const PROJECT_DESCRIPTION = "This is to fund our game development";
const DONATION_VALUE = ethers.utils.parseEther("10");

describe("Funds contract", async () => {
  let contract: Funds;
  let deployer: SignerWithAddress;
  let projectOwner: SignerWithAddress;
  let donator: SignerWithAddress;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    [deployer, projectOwner, donator] = accounts;

    // Deploys funding contract
    const contractFactory = new Funds__factory(deployer);
    contract = await contractFactory.deploy();
    await contract.deployed();
    console.log(`\nCrowd funding project contract deployed at ${contract.address}\n`);

    // Creates a fund
    await contract.connect(projectOwner).createfund(PROJECT_NAME, projectOwner.address, PROJECT_DESCRIPTION);
  });

  describe("When a new fund is started", async () => {
    it("correctly creates a Fund object", async () => {
      let fund = await contract.getFunds(0);
      expect(fund[0]).to.equal(0); // Project ID
      expect(fund[1]).to.equal(PROJECT_NAME); // Project name
      expect(fund[2]).to.equal(true); // Project donations open
      expect(fund[3]).to.equal(projectOwner.address); // Project owner address
      expect(fund[4]).to.equal(projectOwner.address); // Donations receiver address
      expect(fund[5]).to.equal(0); // Total ETH donated
      expect(fund[6]).to.equal(PROJECT_DESCRIPTION); // Project description
    });

    it("is able to receive donations and updates balance correctly", async () => {
      await contract.connect(donator).donateToFund(0, { value: DONATION_VALUE });
      let fund = await contract.getFunds(0);
      expect(fund[5]).to.equal(DONATION_VALUE); // Total ETH donated
    });

    it("is able to send donations to receiver upon ending donations", async () => {
      await contract.connect(donator).donateToFund(0, { value: DONATION_VALUE });
      const projectOwnerBalanceBefore = await projectOwner.getBalance();
      const endFund = await contract.connect(projectOwner).endFund(0);
      const receipt = await endFund.wait();
      const gasUsage = receipt.gasUsed;
      const gasPrice = receipt.effectiveGasPrice;
      const gasCost = gasUsage.mul(gasPrice);
      let fund = await contract.getFunds(0);
      const projectOwnerBalanceAfter = await projectOwner.getBalance();
      expect(fund[2]).to.equal(false); // Project donations closed
      expect(projectOwnerBalanceAfter).to.equal(projectOwnerBalanceBefore.sub(gasCost).add(DONATION_VALUE)); // Receiver balance increased with the amount of ETH donated
    });
  });
});

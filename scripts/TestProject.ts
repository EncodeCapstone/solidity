import { ethers } from "hardhat";
import { ERC20__factory, Projects__factory } from "../typechain";

const TEST_MINT_VALUE = ethers.utils.parseEther("10");
const PROJECT_ID = 1;
const PROJECT_NAME = "Game";
const TARGET_BLOCK = 1;
const MIN_TOTAL_FUNDING = 1;
const MAX_TOTAL_FUNDING = 10;

const REWARD_TOKEN_NAME = "Game token";
const REWARD_TOKEN_SYMBOL = "GT";

async function main() {
  // ethers wallet PK to deploy to Goerli
  const accounts = await ethers.getSigners();
  const [deployer, projectOwner, funder] = accounts;

  const contractFactory = new Projects__factory(deployer);
  const contract = await contractFactory.deploy();
  await contract.deployed();
  console.log(`\nCrowd funding project contract deployed at ${contract.address}\n`);

  const rewardTokenFactory = new ERC20__factory(projectOwner);
  const rewardTokenContract = await rewardTokenFactory.deploy(REWARD_TOKEN_NAME, REWARD_TOKEN_SYMBOL);
  await rewardTokenContract.deployed();
  console.log(`Reward token contract deployed at ${contract.address}\n`);

  //   let projectOwnerTokenBalance = await contract.balanceOf(projectOwner.address);
  //   console.log(`The projectOwners starts with  ${projectOwnerTokenBalance} decimals of balance \n`);

  //   const mintTx = await contract.mint(projectOwner.address, TEST_MINT_VALUE);
  //   await mintTx.wait();

  //   projectOwnerTokenBalance = await contract.balanceOf(projectOwner.address);
  //   console.log(`The projectOwners balance after mint is ${projectOwnerTokenBalance} decimals of balance \n`);

  //   let votePower = await contract.getVotes(projectOwner.address);
  //   console.log(`The projectOwners vote power after mint is ${votePower} decimals of balance \n`);

  //   const delegateTx = await contract.connect(projectOwner).delegate(projectOwner.address);
  //   await delegateTx.wait();

  //   votePower = await contract.getVotes(projectOwner.address);
  //   console.log(`The projectOwners vote power after delegating voting is ${votePower} decimals of balance \n`);

  //   const transferTx = await contract.connect(projectOwner).transfer(other.address, TEST_MINT_VALUE.div(2));
  //   await transferTx.wait();

  //   const delegateOtherTx = await contract.connect(other).delegate(other.address);
  //   await delegateOtherTx.wait();

  //   votePower = await contract.getVotes(projectOwner.address);
  //   console.log(`The projectOwners vote power after transfer voting is ${votePower} decimals of balance \n`);
  //   let votePowerOther = await contract.getVotes(other.address);
  //   console.log(`The others vote power after transfer voting is ${votePowerOther} decimals of balance \n`);

  //   const currentBlock = await ethers.provider.getBlock("latest");
  //   for (let blockNumber = currentBlock.number - 1; blockNumber >= 0; blockNumber--) {
  //     const pastVotePower = await contract.getPastVotes(projectOwner.address, blockNumber);
  //     console.log(`At block ${blockNumber} the projectOwner had ${pastVotePower} decimals of balance \n`);
  //   }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "ethers";

import * as dotenv from "dotenv";
import { Funds, Funds__factory } from "../typechain";
dotenv.config();

// Deploys the funds contract to the Goerli network
async function main() {
  const provider = ethers.getDefaultProvider("goerli");
  console.log(process.env.PRIVATE_KEY);

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
  console.log(wallet);

  const signer = wallet.connect(provider);
  console.log((await signer.getBalance()).toString());

  let fundsContract: Funds;
  const fundsFactory = new Funds__factory(signer);
  fundsContract = await fundsFactory.deploy();
  await fundsContract.deployed();

  console.log("Deploying Funds contract");

  console.log(`Contract deployed at ${fundsContract.address}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

import * as dotenv from "dotenv";
dotenv.config();
import { Wallet } from "ethers";
import password from "@inquirer/password";
import { spawn } from "child_process";
import { config } from "hardhat";
import { deployYourContract } from "./deploy"; // Remove .ts extension

/**
 * Unencrypts the private key and runs the hardhat deploy command
 */
async function main() {
  const networkIndex = process.argv.indexOf("--network");
  const networkName = networkIndex !== -1 ? process.argv[networkIndex + 1] : config.defaultNetwork;
  
  if (networkName === "localNode" || networkName === "hardhat") {
    // Deploy command on the localhost network
    await deployYourContract();
    return;
  }
  
  const encryptedKey = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED;
  
  if (!encryptedKey) {
    console.log("🚫️ You don't have a deployer account. Run `yarn generate` or `yarn account:import` first");
    return;
  }
  
  const pass = await password({ message: "Enter password to decrypt private key:" });
  
  try {
    const wallet = await Wallet.fromEncryptedJson(encryptedKey, pass);
    process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY = wallet.privateKey; 
    
    // Deploy your contract
    await deployYourContract();
    
  } catch (e) {
    console.error("Failed to decrypt private key. Wrong password?");
    process.exit(1);
  }
}

main().catch(console.error);

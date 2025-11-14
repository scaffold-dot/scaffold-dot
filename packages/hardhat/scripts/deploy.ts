import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";
import YourContract from "../ignition/modules/YourContract";
import generateTsAbis from "./generateTsAbis";

// Export the main deployment functionality
export async function deployYourContract() {
  // Before deploy contract make sure that you remove deployments folder on ignition to deploy new contract address locally
  const deploymentsPath = path.join(__dirname, "../ignition/deployments");
  
  if (fs.existsSync(deploymentsPath)) {
    fs.rmSync(deploymentsPath, { recursive: true, force: true });
  }
  
  const { yourContract } = await (hre as any).ignition.deploy(YourContract);
  const contractAddress = await yourContract.getAddress();
  
  console.log(`YourContract deployed to: ${contractAddress}`);
  console.log('Writing abi to nextjs directory...');
  
  await generateTsAbis(hre, {
    YourContract: contractAddress
  });
  console.log('Done!');
  
  return {
    contract: yourContract,
    address: contractAddress
  };
}

// Keep the original script functionality for direct execution
async function main() {
  await deployYourContract();
}

// Only run main() if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

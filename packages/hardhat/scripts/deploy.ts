import hre from "hardhat";
import YourContract from "../ignition/modules/YourContract.ts";
import generateTsAbis from "./generateTsAbis.ts";

// Export the main deployment functionality
export async function deployYourContract() {
  const { yourContract } = await hre.ignition.deploy(YourContract);
  const contractAddress = await yourContract.getAddress();
  
  console.log(`YourContract deployed to: ${contractAddress}`);
  console.log('Writing abi to nextjs directory...');
  
  await generateTsAbis(hre, yourContract);
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

import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";
import generateTsAbis, { getAllContractArtifactsFromSolFile } from "./generateTsAbis";

/**
 * Get all available ignition modules by scanning the ignition/modules directory
 */
function getAvailableModules(): string[] {
  const modulesDir = path.join(__dirname, "../ignition/modules");
  if (!fs.existsSync(modulesDir)) {
    return [];
  }
  
  const files = fs.readdirSync(modulesDir, { withFileTypes: true });
  const modules = files
    .filter(dirent => dirent.isFile() && dirent.name.endsWith('.ts'))
    .map(dirent => dirent.name.replace('.ts', ''));
  
  return modules;
}

/**
 * Get all available contracts by scanning the contracts directory
 */
function getAvailableContracts(): string[] {
  const contractsDir = path.join(__dirname, "../contracts");
  if (!fs.existsSync(contractsDir)) {
    return [];
  }
  
  const files = fs.readdirSync(contractsDir, { withFileTypes: true });
  const contracts = files
    .filter(dirent => dirent.isFile() && dirent.name.endsWith('.sol'))
    .map(dirent => dirent.name.replace('.sol', ''));
  
  return contracts;
}

/**
 * Dynamically import an ignition module
 */
async function importIgnitionModule(moduleName: string) {
  try {
    const modulePath = path.join(__dirname, `../ignition/modules/${moduleName}.ts`);
    if (!fs.existsSync(modulePath)) {
      throw new Error(`Module ${moduleName} not found at ${modulePath}`);
    }
    // Dynamic import - Hardhat's TypeScript loader will handle the transpilation
    const module = await import(`../ignition/modules/${moduleName}`);
    return module.default || module;
  } catch (error) {
    console.error(`Failed to import module ${moduleName}:`, error);
    throw error;
  }
}

/**
 * Extract contract name from ignition module result
 * The contract name should match the .sol filename (e.g., Counter.sol → Counter)
 */
function extractContractNameFromModule(moduleName: string, moduleResult: any): string {
  // The module name matches the contract name (Counter.ts → Counter contract)
  // But we need to verify the contract was actually deployed
  const keys = Object.keys(moduleResult);
  if (keys.length === 0) {
    throw new Error(`Module ${moduleName} returned no contracts`);
  }
  
  // Use the module name as the contract name (it should match)
  // Module names are PascalCase (Counter, YourContract)
  return moduleName;
}

// Export the main deployment functionality - now deploys ALL contracts
export async function deployAllContracts() {
  // Log available modules and contracts for transparency
  const availableModules = getAvailableModules();
  const availableContracts = getAvailableContracts();
  
  console.log('📋 Available ignition modules:', availableModules.join(', '));
  console.log('📋 Available contracts:', availableContracts.join(', '));
  console.log('🚀 Deploying ALL contracts...\n');
  
  // Before deploy contract make sure that you remove deployments folder on ignition to deploy new contract address locally
  const deploymentsPath = path.join(__dirname, "../ignition/deployments");
  
  if (fs.existsSync(deploymentsPath)) {
    fs.rmSync(deploymentsPath, { recursive: true, force: true });
  }
  
  const deployedContracts: Record<string, string> = {};
  const deploymentResults: Record<string, any> = {};
  
  // Deploy each contract
  for (const contractName of availableContracts) {
    // Check if there's a matching ignition module
    if (!availableModules.includes(contractName)) {
      console.warn(`⚠️  Skipping ${contractName}: No matching ignition module found`);
      continue;
    }
    
    try {
      console.log(`\n📦 Deploying ${contractName}...`);
      
      // Check what artifacts exist for this contract's .sol file
      const solFileName = `${contractName}.sol`;
      const availableArtifacts = getAllContractArtifactsFromSolFile(solFileName);
      console.log(`   Found artifacts in ${solFileName}: ${availableArtifacts.join(', ') || 'none'}`);
      
      // Verify the contract we're deploying exists in artifacts
      if (!availableArtifacts.includes(contractName)) {
        console.warn(`   ⚠️  Warning: Contract "${contractName}" not found in artifacts!`);
        console.warn(`   Available artifacts: ${availableArtifacts.join(', ')}`);
      }
      
      // Dynamically import the ignition module
      const ignitionModule = await importIgnitionModule(contractName);
      
      // Deploy via ignition
      const deploymentResult = await (hre as any).ignition.deploy(ignitionModule);
      
      // Extract contract instance and address
      const contractKey = Object.keys(deploymentResult)[0];
      const contractInstance = deploymentResult[contractKey];
      const contractAddress = await contractInstance.getAddress();
      
      // Determine the actual contract name (might differ from module name)
      const actualContractName = extractContractNameFromModule(contractName, deploymentResult);
      
      console.log(`✅ ${actualContractName} deployed to: ${contractAddress}`);
      
      // Store deployment info
      deployedContracts[actualContractName] = contractAddress;
      deploymentResults[actualContractName] = contractInstance;
      
    } catch (error) {
      console.error(`❌ Failed to deploy ${contractName}:`, error);
      // Continue with other contracts even if one fails
    }
  }
  
  console.log('\n📝 Writing ABIs to nextjs directory...');
  await generateTsAbis(hre, deployedContracts);
  console.log('✨ Done! All contracts deployed and ABIs generated.');
  
  return deploymentResults;
}

export async function deployYourContract() {
  return await deployAllContracts();
}

// Keep the original script functionality for direct execution
async function main() {
  await deployYourContract();
}

// Only run main() if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

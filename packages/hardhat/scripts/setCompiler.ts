import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const CONFIG_PATH = path.join(__dirname, "../compiler.config.json");
const HARDHAT_DIR = path.join(__dirname, "..");

const VALID_COMPILERS = ["solc", "resolc"] as const;
type Compiler = (typeof VALID_COMPILERS)[number];

function readConfig(): { compiler: Compiler } {
  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeConfig(compiler: Compiler) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ compiler }, null, 2) + "\n");
}

function removeDir(dirPath: string) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`  Removed ${path.relative(HARDHAT_DIR, dirPath)}/`);
  }
}

function cleanArtifacts(newCompiler: Compiler) {
  console.log("\nCleaning stale build outputs...");

  if (newCompiler === "solc") {
    // Switching to solc — remove PolkaVM artifacts
    removeDir(path.join(HARDHAT_DIR, "artifacts-pvm"));
    removeDir(path.join(HARDHAT_DIR, "cache-pvm"));
  } else {
    // Switching to resolc — remove standard EVM artifacts
    removeDir(path.join(HARDHAT_DIR, "artifacts"));
    removeDir(path.join(HARDHAT_DIR, "cache"));
  }

  // Always remove stale deployment state
  removeDir(path.join(HARDHAT_DIR, "ignition", "deployments"));
}

async function promptCompiler(): Promise<Compiler> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log("\nSelect a compiler:\n");
    console.log("  1) solc    — Standard EVM compiler (recommended for production)");
    console.log("  2) resolc  — PolkaVM compiler (RISC-V bytecode)\n");

    rl.question("Enter choice (1 or 2): ", (answer) => {
      rl.close();
      const trimmed = answer.trim();
      if (trimmed === "1" || trimmed === "solc") {
        resolve("solc");
      } else if (trimmed === "2" || trimmed === "resolc") {
        resolve("resolc");
      } else {
        console.error(`Invalid choice: "${trimmed}". Expected 1, 2, solc, or resolc.`);
        process.exit(1);
      }
    });
  });
}

async function main() {
  const arg = process.argv[2];
  let newCompiler: Compiler;

  if (arg) {
    if (!VALID_COMPILERS.includes(arg as Compiler)) {
      console.error(`Invalid compiler: "${arg}". Valid options: ${VALID_COMPILERS.join(", ")}`);
      process.exit(1);
    }
    newCompiler = arg as Compiler;
  } else {
    newCompiler = await promptCompiler();
  }

  const current = readConfig();

  if (current.compiler === newCompiler) {
    console.log(`\nAlready using ${newCompiler}. No changes needed.`);
    return;
  }

  writeConfig(newCompiler);
  cleanArtifacts(newCompiler);

  console.log(`\nSwitched compiler: ${current.compiler} -> ${newCompiler}`);

  if (newCompiler === "solc") {
    console.log("\nUsing standard solc (EVM bytecode). Contracts will run on Polkadot Hub's REVM.");
  } else {
    console.log("\nUsing resolc (PolkaVM bytecode). Contracts will run on Polkadot Hub's PolkaVM.");
  }

  console.log("\nNext steps:");
  console.log("  yarn compile   # Recompile contracts");
  console.log("  yarn deploy    # Redeploy contracts");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

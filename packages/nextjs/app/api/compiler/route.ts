import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const configPath = path.join(process.cwd(), "../hardhat/compiler.config.json");
  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(raw);
    return NextResponse.json({ compiler: config.compiler });
  } catch {
    return NextResponse.json({ compiler: "solc" }); // default fallback
  }
}

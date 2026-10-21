import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const ROOT_DIR = path.resolve(process.cwd(), "../..");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool, arguments: args } = body;

    if (!tool) {
      return NextResponse.json({ error: "Missing tool name" }, { status: 400 });
    }

    const jsonArgs = JSON.stringify(args || {});

    // Appel direct via uv run python scripts/exec_tool.py
    const { stdout } = await execFileAsync(
      "uv",
      ["run", "python", "scripts/exec_tool.py", tool, jsonArgs],
      { cwd: ROOT_DIR }
    );

    const parsed = JSON.parse(stdout);
    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Execution error",
        stderr: error.stderr || null,
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const ROOT_DIR = path.resolve(process.cwd(), "../..");

// URL de l'API Render (définie dans Netlify via NEXT_PUBLIC_BACKEND_URL ou BACKEND_URL)
const REMOTE_BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool, arguments: args } = body;

    if (!tool) {
      return NextResponse.json({ error: "Missing tool name" }, { status: 400 });
    }

    // 1. Si déployé sur Netlify et que le backend Render est configuré, relayer la requête
    if (REMOTE_BACKEND_URL) {
      const targetUrl = `${REMOTE_BACKEND_URL.replace(/\/$/, "")}/api/execute`;
      try {
        const remoteRes = await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool, arguments: args }),
        });
        const remoteData = await remoteRes.json();
        return NextResponse.json(remoteData, { status: remoteRes.status });
      } catch (err: any) {
        return NextResponse.json(
          {
            error: `Échec d'appel au backend Render (${targetUrl}) : ${err.message}`,
          },
          { status: 502 }
        );
      }
    }

    // 2. Sinon, en développement local : appel direct Python
    const jsonArgs = JSON.stringify(args || {});
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

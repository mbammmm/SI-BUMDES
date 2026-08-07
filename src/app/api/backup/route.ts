import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

export const runtime = "nodejs";

export const maxDuration = 300;

const BACKUP_DIR = process.env.BACKUP_DIR || "/var/backups/si-bumdes";
const PROJECT_ROOT = path.resolve(process.cwd());

function execAsync(command: string, options: any): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let chunk = "";

    const { spawn } = require("child_process");
    const child = spawn(command, [], { ...options, shell: true });

    child.stdout?.on("data", (data: Buffer) => {
      chunk += data.toString();
      stdout += data.toString();
    });
    child.stderr?.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    child.on("error", reject);
    child.on("close", (code: number) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Process exited with code ${code}: ${stderr}`));
      }
    });

    if (options.timeout) {
      setTimeout(() => child.kill(), options.timeout);
    }
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "list") {
    try {
      if (!fs.existsSync(BACKUP_DIR)) {
        return NextResponse.json({ data: [], message: "Backup directory does not exist yet" });
      }

      const files = fs.readdirSync(BACKUP_DIR);
      const backups = files
        .filter((f) => f.startsWith("si-bumdes_backup_") && f.endsWith(".sql.gz"))
        .map((f) => {
          const filePath = path.join(BACKUP_DIR, f);
          const stat = fs.statSync(filePath);
          return {
            filename: f,
            path: filePath,
            size: stat.size,
            createdAt: stat.mtime.toISOString(),
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return NextResponse.json({ data: backups });
    } catch (error) {
      console.error("Error listing backups:", error);
      return NextResponse.json({ error: "Gagal memuat daftar backup" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const action = body.action || "create";

  if (action === "create") {
    try {
      const backupScript = path.join(PROJECT_ROOT, "scripts", "backup-db.sh");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const logFile = path.join(BACKUP_DIR, `api_backup_${timestamp}.log`);

      const command = `bash "${backupScript}" --no-cleanup 2>&1 | tee "${logFile}"`;

      const { stdout, stderr } = await execAsync(command, {
        cwd: PROJECT_ROOT,
        timeout: 120000,
      });

      if (stderr && !stderr.includes("warning")) {
        return NextResponse.json({ error: stderr }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Backup database berhasil dibuat",
        output: stdout,
      });
    } catch (error: any) {
      console.error("Backup error:", error);
      return NextResponse.json({
        error: "Gagal membuat backup database",
        details: error.message || String(error),
      }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => ({}));
  const filename = body.filename;

  if (!filename) {
    return NextResponse.json({ error: "Filename diperlukan" }, { status: 400 });
  }

  try {
    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File backup tidak ditemukan" }, { status: 404 });
    }

    fs.unlinkSync(filePath);

    return NextResponse.json({ success: true, message: "File backup berhasil dihapus" });
  } catch (error) {
    console.error("Delete backup error:", error);
    return NextResponse.json({ error: "Gagal menghapus backup" }, { status: 500 });
  }
}

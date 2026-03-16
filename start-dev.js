// start-dev.js — Universal dev launcher (ESM, works on Windows without PowerShell policy issues)
import { spawn } from "child_process";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isWin = process.platform === "win32";
const npm = isWin ? "npm.cmd" : "npm";
const python = isWin ? "python" : "python3";

function log(label, data) {
  process.stdout.write(`[${label}] ${data}`);
}

function spawnService(label, cmd, args, cwd) {
  console.log(`▶ Starting ${label}...`);
  const proc = spawn(cmd, args, { cwd, shell: true, stdio: ["ignore", "pipe", "pipe"] });

  proc.stdout.on("data", (d) => log(label, d));
  proc.stderr.on("data", (d) => log(label, d));

  proc.on("error", (err) => {
    if (err.code === "ENOENT") {
      console.error(`\n✗ [${label}] Command not found: "${cmd}"`);
      if (label === "ML Service") {
        console.error("  → Install Python and uvicorn: pip install uvicorn fastapi");
      } else {
        console.error("  → Make sure Node.js and npm are installed");
      }
    } else {
      console.error(`\n✗ [${label}] Error: ${err.message}`);
    }
  });

  proc.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`\n✗ [${label}] exited with code ${code}`);
      if (label === "ML Service") {
        console.error("  → Run: pip install -r ml_service/requirements.txt");
      }
    }
  });

  return proc;
}

const pyCmd = isWin ? "py" : "python3";

function startAll() {
  spawnService("Frontend",   npm,   ["run", "dev"],   join(__dirname));
  spawnService("Backend",    npm,   ["run", "start"], join(__dirname, "backend"));
  spawnService("ML Service", pyCmd, ["-m", "uvicorn", "main:app", "--reload", "--port", "8000"], join(__dirname, "ml_service"));

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  AgroWise Platform starting...");
  console.log("  Frontend   → http://localhost:5173");
  console.log("  Backend    → http://localhost:3000");
  console.log("  ML Service → http://localhost:8000");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Press Ctrl+C to stop all services.\n");
}

// Auto-train weather model if pkl is missing
const modelPath = join(__dirname, "ml_service", "models", "rainfall_model.pkl");
if (!existsSync(modelPath)) {
  console.log("⚠ rainfall_model.pkl not found — training weather model first...");
  const train = spawn(pyCmd, ["train_weather_model.py"], {
    cwd: join(__dirname, "ml_service"),
    shell: true,
    stdio: "inherit",
  });
  train.on("exit", (code) => {
    if (code === 0) console.log("✓ Weather model trained.\n");
    else console.error("✗ Training failed — ML service may not work correctly.\n");
    startAll();
  });
  train.on("error", () => {
    console.error("✗ Python not found. Install Python 3 and try again.\n");
    startAll();
  });
} else {
  startAll();
}

process.on("SIGINT", () => {
  console.log("\nShutting down...");
  process.exit(0);
});

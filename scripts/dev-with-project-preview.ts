import { execFileSync, spawn } from "node:child_process";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

function generateLocalPreview(localUrl: string): void {
  execFileSync(
    process.execPath,
    [
      path.join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs"),
      "scripts/generate-project-preview.ts",
      "--dev-url",
      localUrl,
    ],
    { stdio: "inherit", env: process.env },
  );
}

async function captureFromExistingServer(): Promise<boolean> {
  const localUrl = "http://127.0.0.1:3000/";

  try {
    const response = await fetch(localUrl, { signal: AbortSignal.timeout(2_000) });
    if (!response.ok) return false;

    console.info(`Reusing the running local development site at ${localUrl}`);
    generateLocalPreview(localUrl);
    return true;
  } catch {
    return false;
  }
}

function getPortFromArgs(args: string[]): number | null {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--port") {
      if (i + 1 < args.length) {
        const value = args[i + 1];
        const port = parseInt(value, 10);
        if (!isNaN(port)) {
          return port;
        }
      }
    } else if (args[i].startsWith("--port=")) {
      const value = args[i].split("=")[1];
      const port = parseInt(value, 10);
      if (!isNaN(port)) {
        return port;
      }
    }
  }
  return null;
}

async function waitForServer(url: string, child: ReturnType<typeof spawn>): Promise<void> {
  const deadline = Date.now() + 120_000;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Next.js dev server exited with code ${child.exitCode}.`);
    }

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }

    await delay(1_000);
  }

  throw new Error(`Next.js dev server did not respond at ${url} within 120 seconds.`);
}

async function startDevelopmentServer(): Promise<void> {
  if (await captureFromExistingServer()) return;

  const cliArgs = process.argv.slice(2);
  const cliPort = getPortFromArgs(cliArgs);
  const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : undefined;
  const port = cliPort !== null ? cliPort : envPort !== undefined ? envPort : 3000;
  const localUrl = `http://127.0.0.1:${port}/`;

  const nextCli = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  const child = spawn(
    process.execPath,
    [nextCli, "dev", "--hostname", "127.0.0.1", ...process.argv.slice(2)],
    { stdio: "inherit", env: process.env },
  );

  const childExit = new Promise<number>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      resolve(code ?? (signal ? 1 : 0));
    });
  });

  const stopChild = (signal: NodeJS.Signals) => {
    if (child.exitCode === null) child.kill(signal);
  };
  process.on("SIGINT", stopChild);
  process.on("SIGTERM", stopChild);

  try {
    await waitForServer(localUrl, child);
    console.info(`Capturing the local development site for the featured project: ${localUrl}`);
    generateLocalPreview(localUrl);
  } catch (error) {
    console.warn("Could not refresh the featured preview from the local development site.", error);
  }

  const exitCode = await childExit;
  process.removeListener("SIGINT", stopChild);
  process.removeListener("SIGTERM", stopChild);
  process.exitCode = exitCode;
}

void startDevelopmentServer().catch((error: unknown) => {
  console.error("Could not start the development server.", error);
  process.exitCode = 1;
});
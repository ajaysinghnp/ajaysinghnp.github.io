import { execFileSync, spawn } from "node:child_process";
import { createServer } from "node:net";
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

function getAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Could not determine a local development port."));
        return;
      }
      const { port } = address;
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
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

  const port = await getAvailablePort();
  const localUrl = `http://127.0.0.1:${port}/`;
  const nextCli = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  const child = spawn(
    process.execPath,
    [nextCli, "dev", "--hostname", "127.0.0.1", "--port", String(port), ...process.argv.slice(2)],
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

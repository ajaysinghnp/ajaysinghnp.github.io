import { execFileSync, spawn } from "node:child_process";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const port = 3100;
const localUrl = `http://127.0.0.1:${port}/`;
const existingUrl = "http://127.0.0.1:3000/";

const nextCli = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

const tsxCli = path.join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");

async function isServerReady(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(2_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer(child: ReturnType<typeof spawn>): Promise<void> {
  const deadline = Date.now() + 120_000;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Next.js preview server exited with code ${child.exitCode}.`);
    }

    if (await isServerReady(localUrl)) return;
    await delay(1_000);
  }

  throw new Error(`Next.js did not respond at ${localUrl} within 120 seconds.`);
}

async function stopServer(child: ReturnType<typeof spawn>): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return;

  const exited = new Promise<void>((resolve) => {
    child.once("exit", () => resolve());
  });

  child.kill("SIGTERM");

  await Promise.race([
    exited,
    delay(5_000).then(() => {
      if (child.exitCode === null) child.kill("SIGKILL");
    }),
  ]);
}

async function main(): Promise<void> {
  let server: ReturnType<typeof spawn> | undefined;
  let previewUrl: string;

  if (await isServerReady(existingUrl)) {
    previewUrl = existingUrl;
    console.info(`Reusing existing development server: ${previewUrl}`);
  } else {
    server = spawn(
      process.execPath,
      [nextCli, "dev", "--hostname", "127.0.0.1", "--port", String(port)],
      {
        stdio: "inherit",
        env: process.env,
      },
    );

    previewUrl = localUrl;

    try {
      await waitForServer(server);
    } catch (error) {
      await stopServer(server);
      throw error;
    }

    console.info(`Started temporary preview server: ${previewUrl}`);
  }

  try {
    execFileSync(
      process.execPath,
      [tsxCli, "scripts/generate-project-preview.ts", "--dev-url", previewUrl],
      {
        stdio: "inherit",
        env: process.env,
      },
    );
  } finally {
    if (server) await stopServer(server);
  }
}

main().catch((error: unknown) => {
  console.error("Failed to generate previews from the local application.", error);
  process.exitCode = 1;
});

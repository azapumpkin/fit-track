const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const config = require("./config");

let backendProcess;
let mainWindow;

const projectDirectory = path.join(__dirname, "..");

function getDatabaseUrl() {
  const databaseUrl = new URL(config.DATABASE_URL);

  // Supabase recommends the transaction-mode pooler for Prisma.
  databaseUrl.port = "6543";
  databaseUrl.searchParams.set("pgbouncer", "true");
  databaseUrl.searchParams.set("connection_limit", "1");
  databaseUrl.searchParams.set("connect_timeout", "10");
  databaseUrl.searchParams.set("pool_timeout", "10");

  return databaseUrl.toString();
}

function getAppPaths() {
  const resourcesDirectory = app.isPackaged
    ? process.resourcesPath
    : projectDirectory;

  return {
    backendDirectory: path.join(
      resourcesDirectory,
      "backend",
    ),
    frontendPath: app.isPackaged
      ? path.join(
          resourcesDirectory,
          "frontend",
          "index.html",
        )
      : path.join(
          resourcesDirectory,
          "frontend",
          "dist",
          "index.html",
        ),
  };
}

function startBackend() {
  const { backendDirectory } = getAppPaths();

  const backendPath = path.join(
    backendDirectory,
    "dist",
    "server.js",
  );

  console.log("Starting FitTrack backend...");
  console.log("Backend path:", backendPath);

  backendProcess = spawn(
    process.execPath,
    [backendPath],
    {
      cwd: backendDirectory,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        DATABASE_URL: getDatabaseUrl(),
        PORT: "3000",
      },
      stdio: "inherit",
    },
  );

  backendProcess.on("error", (error) => {
    console.error("Failed to start backend:", error);
  });

  backendProcess.on("exit", (code, signal) => {
    console.log(
      `Backend exited with code ${code}, signal ${signal}`,
    );
  });
}

async function waitForBackend() {
  const attempts = 30;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(
        "http://127.0.0.1:3000/api/health",
      );

      if (response.ok) {
        return;
      }
    } catch {
      // Backend may need a moment to start.
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 200);
    });
  }

  throw new Error(
    "FitTrack backend did not start on port 3000",
  );
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "FitTrack",
  });

  const { frontendPath } = getAppPaths();

  mainWindow.loadFile(frontendPath);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    startBackend();
    await waitForBackend();
    createWindow();
  } catch (error) {
    console.error(
      "Failed to initialise FitTrack:",
      error,
    );

    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", () => {
  if (backendProcess) {
    console.log("Stopping backend...");
    backendProcess.kill();
    backendProcess = null;
  }
});

app.on("window-all-closed", () => {
  // На macOS Electron продолжает работать,
  // даже когда все окна закрыты.
});

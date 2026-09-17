const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

let backendProcess;
let mainWindow;

function runDatabaseMigrations(databasePath) {
  const backendDirectory = path.join(
    process.resourcesPath,
    "backend",
  );

  const prismaCliPath = path.join(
    backendDirectory,
    "node_modules",
    "prisma",
    "build",
    "index.js",
  );

  console.log("Running database migrations...");

  const result = spawnSync(
    process.execPath,
    [
      prismaCliPath,
      "migrate",
      "deploy",
    ],
    {
      cwd: backendDirectory,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        DATABASE_URL: `file:${databasePath}`,
      },
      stdio: "inherit",
    },
  );

  if (result.error) {
    console.error(
      "Failed to run database migrations:",
      result.error,
    );

    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `Database migrations failed with exit code ${result.status}`,
    );
  }

  console.log(
    "Database migrations completed successfully.",
  );
}

function startBackend(databasePath) {
  const backendPath = path.join(
    process.resourcesPath,
    "backend",
    "dist",
    "server.js",
  );

  const backendDirectory = path.join(
    process.resourcesPath,
    "backend",
  );

  console.log("Starting backend...");
  console.log("Backend path:", backendPath);
  console.log("Database path:", databasePath);

  backendProcess = spawn(
    "/usr/local/bin/node",
    [backendPath],
    {
      cwd: backendDirectory,
      env: {
        ...process.env,
        DATABASE_URL: `file:${databasePath}`,
      },
      stdio: "inherit",
    },
  );

  backendProcess.on("error", (error) => {
    console.error(
      "Failed to start backend:",
      error,
    );
  });

  backendProcess.on("exit", (code, signal) => {
    console.log(
      `Backend exited with code ${code}, signal ${signal}`,
    );
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "FitTrack",
  });

  const frontendPath = path.join(
    process.resourcesPath,
    "frontend",
    "index.html",
  );

  mainWindow.loadFile(frontendPath);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  const databasePath = path.join(
    app.getPath("userData"),
    "fittrack.db",
  );

  try {
    runDatabaseMigrations(databasePath);
    startBackend(databasePath);
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
  // На macOS Electron обычно продолжает работать,
  // даже когда все окна закрыты.
});
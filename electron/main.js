const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let backendProcess;

function startBackend() {
  const backendPath = path.join(
    __dirname,
    "../backend/dist/server.js",
  );

  backendProcess = spawn(
    process.execPath,
    [backendPath],
    {
      cwd: path.join(__dirname, "../backend"),
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
      },
      stdio: "inherit",
    },
  );
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "FitTrack",
  });

  const frontendPath = path.join(
    __dirname,
    "../frontend/dist/index.html",
  );

  win.loadFile(frontendPath);
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    backendProcess.kill();
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const configPath = path.join(
  __dirname,
  "..",
  "electron",
  "config.js",
);

const config = require(configPath);

const prompt = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

prompt.stdoutMuted = false;
prompt._writeToOutput = function writeToOutput(text) {
  if (prompt.stdoutMuted) {
    prompt.output.write("*");
    return;
  }

  prompt.output.write(text);
};

process.stdout.write("Новый пароль Supabase: ");
prompt.stdoutMuted = true;

prompt.question("", (password) => {
  prompt.stdoutMuted = false;
  prompt.output.write("\n");
  prompt.close();

  if (!password) {
    console.error("Пароль не может быть пустым.");
    process.exitCode = 1;
    return;
  }

  const databaseUrl = new URL(config.DATABASE_URL);
  databaseUrl.password = password;

  const fileContents = [
    "module.exports = {",
    `  DATABASE_URL: ${JSON.stringify(databaseUrl.toString())},`,
    "};",
    "",
  ].join("\n");

  fs.writeFileSync(configPath, fileContents, {
    encoding: "utf8",
    mode: 0o600,
  });

  console.log("Пароль сохранён локально.");
});

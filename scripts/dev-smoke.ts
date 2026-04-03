import { spawnSync } from "node:child_process";

const command = "npm";
const args = ["run", "test", "--", "tests/smoke/routes.test.tsx"];

const result = spawnSync(command, args, { stdio: "inherit" });

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("Smoke routes verified");

import { existsSync } from "node:fs";
import * as fs from "node:fs/promises";
import * as util from "node:util";
import * as childProcess from "node:child_process";

if (existsSync("dist")) {
    await fs.rm("dist", { recursive: true });
}
await fs.mkdir("dist");

const exec = util.promisify(childProcess.exec);
await fs.copyFile("package.json", "./dist/package.json");
await fs.copyFile("LICENSE", "./dist/LICENSE");

await exec("pnpm dts-bundle-generator -o dist/index.d.ts --project ../../tsconfig.json --inline-declare-global ../../src/global.d.ts --no-check --sort --no-banner")
await exec('pnpm treetype def.tt dist/treetype.d.ts');
import * as childProcess from "node:child_process";
import { existsSync } from "node:fs";
import * as fs from "node:fs/promises";
import * as util from "node:util";

if (existsSync("dist")) {
    await fs.rm("dist", { recursive: true });
}
await fs.mkdir("dist");

const exec = util.promisify(childProcess.exec);
await fs.copyFile("package.json", "./dist/package.json");
await fs.copyFile("LICENSE", "./dist/LICENSE");

await exec("pnpm dts-bundle-generator -o dist/object.d.ts --project ../../tsconfig.json ../../src/lib/index.ts --no-check --sort");

await fs.writeFile("./dist/index.d.ts", `
declare global {
    var bunny: BunnyObject;
}

export type BunnyObject = typeof import("./object");
`.trim());

await exec("pnpm treetype def.tt dist/treetype.d.ts");

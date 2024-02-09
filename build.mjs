// eslint-disable-next-line simple-import-sort/imports
import swc from "@swc/core";
import { execSync } from "child_process";
import esbuild from "esbuild";
import { readFile } from "fs/promises";
import { createServer } from "http";
import { argv } from "process";

const isFlag = (s, l) => argv.slice(2).some(c => c === `-${s}` || c === `--${l}`);

const isRelease = isFlag("r", "release");
const shouldServe = isFlag("s", "serve");
const shouldWatch = isFlag("w", "watch");

// TODO: This does not change unless you re-execute the script
const timeHash = Number(new Date).toString(36);
const commitHash = execSync("git rev-parse --short HEAD").toString().trim();

try {
    const ctx = await esbuild.context({
        entryPoints: ["src/entry.js"],
        bundle: true,
        minify: isRelease,
        format: "iife",
        target: "esnext",
        supported: {
            // Hermes does not actually supports const and let, even though it syntactically
            // accepts it, but it's treated just like 'var' and causes issues
            "const-and-let": false
        },
        outfile: "dist/pyondetta.js",
        keepNames: true,
        define: {
            __vendettaIsDev: `${!isRelease}`,
            __vendettaVersion: `"${isRelease ? commitHash : timeHash}"`,
        },
        footer: {
            js: "//# sourceURL=pyondetta"
        },
        loader: { ".png": "dataurl" },
        legalComments: "none",
        alias: { 
            "@*": "src*",
            "@types": "src/def.d.ts"
        },
        plugins: [
            {
                name: "swc",
                setup(build) {
                    build.onLoad({ filter: /\.[jt]sx?/ }, async args => {
                        const result = await swc.transformFile(args.path, {
                            jsc: {
                                externalHelpers: true,
                            },
                            env: {
                                targets: "defaults",
                                include: [
                                    "transform-classes",
                                    "transform-arrow-functions",
                                    "transform-block-scoping"
                                ]
                            },
                        });

                        return { contents: result.code };
                    });
                }
            },
            {
                name: "buildLog",
                setup: async build => {
                    build.onStart(() => console.log(`Building with commit hash "${commitHash}", isRelease="${isRelease}", timeHash="${timeHash}"`));
                    build.onEnd(result => console.log(`Built with ${result.errors?.length} errors!`));
                }
            }
        ]
    });

    if (shouldWatch) {
        await ctx.watch();
        console.log("Watching...");
    }

    if (shouldServe) {
        await ctx.rebuild();

        const server = createServer(async (req, res) => {
            try {
                if (req.url === "/vendetta.js" || req.url === "/pyoncord.js" || req.url === "/pyondetta.js") {
                    await ctx.rebuild();
                    res.writeHead(200);
                    res.end(await readFile("./dist/pyondetta.js"), "utf-8");
                } else {
                    res.writeHead(404);
                    res.end();
                }
            } catch (error) {
                res.writeHead(500);
                res.end();
            }
        }).listen(4040);

        // @ts-ignore
        console.log(`Serving on port ${server.address()?.port}, CTRL+C to stop`);
    }

    if (!shouldServe && !shouldWatch) {
        ctx.rebuild();
        ctx.dispose();
    }
} catch (e) {
    console.error("Build failed...", e);
    process.exit(1);
}

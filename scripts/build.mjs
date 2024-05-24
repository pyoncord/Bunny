// @ts-nocheck
/* eslint-disable no-restricted-syntax */
import swc from "@swc/core";
import crypto from "crypto";
import { build } from "esbuild";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import yargs from "yargs-parser";

import { printBuildSuccess } from "./util.mjs";

const args = yargs(process.argv.slice(2));
const {
    "release-branch": releaseBranch,
    "build-minify": buildMinify
} = args;

let context = null;

const config = {
    entryPoints: ["src/entry.ts"],
    bundle: true,
    outfile: "dist/bunny.js",
    format: "iife",
    splitting: false,
    minify: false,
    external: [],
    supported: {
        // Hermes does not actually supports const and let, even though it syntactically
        // accepts it, but it's treated just like 'var' and causes issues
        "const-and-let": false
    },
    footer: {
        js: "//# sourceURL=bunny"
    },
    loader: {
        ".png": "dataurl"
    },
    define: {
        __DEV__: JSON.stringify(releaseBranch !== "main")
    },
    legalComments: "none",
    plugins: [
        {
            name: "runtimeGlobalAlias",
            setup: async build => {
                const globalMap = {
                    "react": "globalThis.React",
                    "react-native": "globalThis.ReactNative"
                };

                Object.keys(globalMap).forEach(key => {
                    const filter = new RegExp(`^${key}$`);
                    build.onResolve({ filter }, args => ({
                        namespace: "glob-" + key, path: args.path
                    }));
                    build.onLoad({ filter, namespace: "glob-" + key }, () => ({
                        // @ts-ignore
                        contents: `Object.defineProperty(module, 'exports', { get: () => ${globalMap[key]} })`,
                        resolveDir: "src",
                    }));
                });
            }
        },
        {
            name: "swc",
            setup(build) {
                build.onLoad({ filter: /\.[jt]sx?$/ }, async args => {
                    const result = await swc.transformFile(args.path, {
                        jsc: {
                            externalHelpers: true,
                            transform: {
                                constModules: {
                                    globals: {
                                        "bunny-build-info": {
                                            version: `"${context.hash}-${releaseBranch ?? "local"}"`
                                        }
                                    }
                                }
                            },
                        },
                        // https://github.com/facebook/hermes/blob/3815fec63d1a6667ca3195160d6e12fee6a0d8d5/doc/Features.md
                        // https://github.com/facebook/hermes/issues/696#issuecomment-1396235791
                        env: {
                            targets: "fully supports es6",
                            include: [
                                // Pretend that arrow functions are unsupported, since hermes does not support async arrow functions for some reason
                                "transform-arrow-functions",
                                "transform-block-scoping",
                                "transform-classes"
                            ],
                            exclude: [
                                "transform-parameters",
                                "transform-template-literals",
                                "transform-async-to-generator",
                                "transform-exponentiation-operator",
                                "transform-named-capturing-groups-regex",
                                "transform-nullish-coalescing-operator",
                                "transform-object-rest-spread",
                                "transform-optional-chaining"
                            ]
                        },
                    });

                    return { contents: result.code };
                });
            }
        }
    ]
};

export async function buildBundle() {
    context = {
        hash: crypto.randomBytes(8).toString("hex").slice(0, 7)
    };

    const initialStartTime = performance.now();
    await build(config);

    return {
        config,
        context,
        timeTook: performance.now() - initialStartTime
    };
}

const pathToThisFile = path.resolve(fileURLToPath(import.meta.url));
const pathPassedToNode = path.resolve(process.argv[1]);
const isThisFileBeingRunViaCLI = pathToThisFile.includes(pathPassedToNode);

if (isThisFileBeingRunViaCLI) {
    const { timeTook } = await buildBundle();

    printBuildSuccess(
        context.hash,
        releaseBranch,
        timeTook
    );

    if (buildMinify) {
        const bundleBuffer = await readFile(config.outfile);

        let { code } = await swc.minify(
            bundleBuffer.toString(),
            {
                compress: true,
                mangle: true,
            }
        );
        code += config.footer.js;

        const minFilePath = config.outfile.replace(/\.js$/, ".min.js");
        await writeFile(minFilePath, code);
    }
}

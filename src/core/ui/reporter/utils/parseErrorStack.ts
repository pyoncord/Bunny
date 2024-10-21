/**
 * MIT License
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 *  * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export type StackFrame = {
    column?: number,
    file?: string,
    lineNumber?: number,
    methodName: string,
    collapse?: boolean,
};

type HermesStackLocationNative = {
    readonly type: "NATIVE",
};

type HermesStackLocationSource = Readonly<{
    type: "SOURCE",
    sourceUrl: string,
    line1Based: number,
    column1Based: number,
}>;

type HermesStackLocationInternalBytecode = Readonly<{
    type: "INTERNAL_BYTECODE",
    sourceUrl: string,
    line1Based: number,
    virtualOffset0Based: number,
}>;

type HermesStackLocationBytecode = Readonly<{
    type: "BYTECODE",
    sourceUrl: string,
    line1Based: number,
    virtualOffset0Based: number,
}>;

type HermesStackLocation =
    | HermesStackLocationNative
    | HermesStackLocationSource
    | HermesStackLocationInternalBytecode
    | HermesStackLocationBytecode;

type HermesStackEntryFrame = Readonly<{
    type: "FRAME",
    location: HermesStackLocation,
    functionName: string,
}>;

type HermesStackEntrySkipped = Readonly<{
    type: "SKIPPED",
    count: number,
}>;

type HermesStackEntry = HermesStackEntryFrame | HermesStackEntrySkipped;

export type HermesParsedStack = Readonly<{
    message: string,
    entries: ReadonlyArray<HermesStackEntry>,
}>;

// Capturing groups:
// 1. function name
// 2. is this a native stack frame?
// 3. is this a bytecode address or a source location?
// 4. source URL (filename)
// 5. line number (1 based)
// 6. column number (1 based) or virtual offset (0 based)
const RE_FRAME =
    /^ {4}at (.+?)(?: \((native)\)?| \((address at )?(.*?):(\d+):(\d+)\))$/;

// Capturing groups:
// 1. count of skipped frames
const RE_SKIPPED = /^ {4}... skipping (\d+) frames$/;
const RE_COMPONENT_NO_STACK = /^ {4}at .*$/;

function isInternalBytecodeSourceUrl(sourceUrl: string): boolean {
    // See https://github.com/facebook/hermes/blob/3332fa020cae0bab751f648db7c94e1d687eeec7/lib/VM/Runtime.cpp#L1100
    return sourceUrl === "InternalBytecode.js";
}

function parseLine(line: string): HermesStackEntry | void {
    const asFrame = line.match(RE_FRAME);
    if (asFrame) {
        return {
            type: "FRAME",
            functionName: asFrame[1],
            location:
                asFrame[2] === "native"
                    ? { type: "NATIVE" }
                    : asFrame[3] === "address at "
                        ? isInternalBytecodeSourceUrl(asFrame[4])
                            ? {
                                type: "INTERNAL_BYTECODE",
                                sourceUrl: asFrame[4],
                                line1Based: Number.parseInt(asFrame[5], 10),
                                virtualOffset0Based: Number.parseInt(asFrame[6], 10),
                            }
                            : {
                                type: "BYTECODE",
                                sourceUrl: asFrame[4],
                                line1Based: Number.parseInt(asFrame[5], 10),
                                virtualOffset0Based: Number.parseInt(asFrame[6], 10),
                            }
                        : {
                            type: "SOURCE",
                            sourceUrl: asFrame[4],
                            line1Based: Number.parseInt(asFrame[5], 10),
                            column1Based: Number.parseInt(asFrame[6], 10),
                        },
        };
    }
    const asSkipped = line.match(RE_SKIPPED);
    if (asSkipped) {
        return {
            type: "SKIPPED",
            count: Number.parseInt(asSkipped[1], 10),
        };
    }
}

function parseHermesStack(stack: string): HermesParsedStack {
    const lines = stack.split(/\n/);
    let entries: Array<HermesStackEntryFrame | HermesStackEntrySkipped> = [];
    let lastMessageLine = -1;
    for (let i = 0; i < lines.length; ++i) {
        const line = lines[i];
        if (!line) {
            continue;
        }
        const entry = parseLine(line);
        if (entry) {
            entries.push(entry);
            continue;
        }
        if (RE_COMPONENT_NO_STACK.test(line)) {
            // Skip component stacks without source location.
            // TODO: This will not be displayed, not sure how to handle it.
            continue;
        }
        // No match - we're still in the message
        lastMessageLine = i;
        entries = [];
    }
    const message = lines.slice(0, lastMessageLine + 1).join("\n");
    return { message, entries };
}

function convertHermesStack(stack: HermesParsedStack): Array<StackFrame> {
    const frames: Array<StackFrame> = [];
    for (const entry of stack.entries) {
        if (entry.type !== "FRAME") {
            continue;
        }
        const { location, functionName } = entry;
        if (location.type === "NATIVE" || location.type === "INTERNAL_BYTECODE") {
            continue;
        }
        frames.push({
            methodName: functionName,
            file: location.sourceUrl,
            lineNumber: location.line1Based,
            column:
                location.type === "SOURCE"
                    ? location.column1Based - 1
                    : location.virtualOffset0Based,
        });
    }
    return frames;
}

export default function parseErrorStack(errorStack?: string): Array<StackFrame> {
    if (errorStack == null) {
        return [];
    }

    const parsedStack = Array.isArray(errorStack)
        ? errorStack
        : convertHermesStack(parseHermesStack(errorStack));

    return parsedStack;
}

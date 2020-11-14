const commonjs = require("@rollup/plugin-commonjs");
const multiInput = require("rollup-plugin-multi-input").default;
const nodeResolve = require("@rollup/plugin-node-resolve").default;

const globals = {
    "riot": "riot",
    "data-scroll-animation": "dataScrollAnimation"
};
const external = Object.keys(globals);

export default [
    {
        input: ["src/**/!(*.d.ts)"],
        external,
        plugins: [
            multiInput(),
            nodeResolve(),
            commonjs()
        ],
        output: {
            dir: "dist/amd",
            format: "amd"
        }
    },
    {
        input: ["src/**/!(*.d.ts)"],
        external,
        plugins: [
            multiInput(),
            nodeResolve(),
            commonjs()
        ],
        output: {
            dir: "dist/cjs",
            format: "cjs",
            exports: "auto"
        }
    },
    {
        input: ["src/**/!(*.d.ts)"],
        external,
        plugins: [
            multiInput(),
            nodeResolve(),
            commonjs()
        ],
        output: {
            dir: "dist/es",
            format: "es"
        }
    },
    {
        input: "src/index.js",
        plugins: [
            nodeResolve(),
            commonjs()
        ],
        output: {
            file: "dist/amd+libs.js",
            format: "amd"
        }
    },
    {
        input: "src/index.js",
        external,
        plugins: [
            nodeResolve(),
            commonjs()
        ],
        output: {
            file: "dist/amd.js",
            format: "amd"
        }
    },
    {
        input: "src/index.js",
        external,
        plugins: [
            nodeResolve(),
            commonjs()
        ],
        output: {
            name: "RM",
            file: "dist/umd.js",
            format: "umd",
            globals
        }
    },
    {
        input: "src/index.js",
        plugins: [
            nodeResolve(),
            commonjs()
        ],
        output: {
            name: "RM",
            file: "dist/umd+libs.js",
            format: "umd"
        }
    }
];
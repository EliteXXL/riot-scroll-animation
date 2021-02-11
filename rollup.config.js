const commonjs = require("@rollup/plugin-commonjs");
const nodeResolve = require("@rollup/plugin-node-resolve").default;

const globals = {
    "riot": "riot",
    "data-scroll-animation": "dataScrollAnimation"
};
const external = Object.keys(globals);

export default [
    {
        input: "src/index.js",
        external,
        plugins: [
            nodeResolve(),
            commonjs()
        ],
        output: [
            {
                file: "dist/index.es.js",
                format: "es"
            },
            {
                name: "riotScrollAnimation",
                file: "dist/index.js",
                format: "umd",
                globals
            }
        ]
    },
    {
        input: "src/index.js",
        plugins: [
            nodeResolve(),
            commonjs()
        ],
        output: [
            {
                name: "riotScrollAnimation",
                file: "dist/index+libs.js",
                format: "umd"
            }
        ]
    }
];
// @ts-check
// FIXME: import warning: `"type": "module"`
const path = require('path')
const ts = require('rollup-plugin-typescript2')
// import ts from "rollup-plugin-typescript2";
const json = require("@rollup/plugin-json")
// import json from "@rollup/plugin-json";
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')

const packageFormats = process.env.FORMATS && process.env.FORMATS.split(',')
const sourceMap = process.env.SOURCE_MAP
const target = process.env.TARGET

const packagesDir = path.resolve(__dirname, 'packages')
// 目标目录
const packageDir = path.resolve(packagesDir, process.env.TARGET)
const resolve = p => path.resolve(packageDir, p)
const pkg = require(resolve('package.json'))
const packageOptions = pkg.buildOptions
const name = packageOptions.name || path.basename(packageDir)

console.log(
    pkg
)

const outputConfigs = {
    'esm-bundler': {
        file: resolve(`dist/${name}.esm-bundler.js`),
        format: `es`
    },
    cjs: {
        file: resolve(`dist/${name}.cjs.js`),
        format: `cjs`
    },
    global: {
        file: resolve(`dist/${name}.global.js`),
        format: `iife`
    },
    // runtime-only builds, for main "vue" package only
    'esm-bundler-runtime': {
        file: resolve(`dist/${name}.runtime.esm-bundler.js`),
        format: `es`
    },
    'esm-browser-runtime': {
        file: resolve(`dist/${name}.runtime.esm-browser.js`),
        format: 'es'
    },
    'global-runtime': {
        file: resolve(`dist/${name}.runtime.global.js`),
        format: 'iife'
    }
}

// 决定打包format的格式
const packageConfigs = packageFormats || packageOptions.formats

console.log(outputConfigs)

function createConfig(format, output) {
    output.sourcemap = sourceMap
    output.exports = 'named'
    let external = []
    if (format === 'global') {
        output.name = pkg.buildOptions.name
    } else {
        // esm/cjs 不打包依赖
        external = [...Object.keys(pkg.dependencies)]
    }
    return {
        input: resolve('src/index.ts'),
        output,
        external,
        plugins: [
            json(),
            ts(), // ts 转 js
            commonjs,
            nodeResolve()
        ]
    }
}

module.exports = packageConfigs.map(format => createConfig(format, outputConfigs[format]))
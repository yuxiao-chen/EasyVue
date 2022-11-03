const minimist = require('minimist')
const execa =require('execa')

const args = minimist(process.argv.slice(2))

const target = args._.length ? args._[0] : 'reactivity'
const formats = args.f || 'global';
const sourceMap = args.s || false

// console.log(process.env)
console.log(target)

execa('rollup', [
    '-wc', // --watch --config
    '--environment',
    [
        `TARGET:${target}`,
        formats ? `FORMATS:${formats}` : ``,
        // buildTypes ? `TYPES:true` : ``,
        sourceMap ? `SOURCE_MAP:true` : ``
    ]
        .filter(Boolean)
        .join(',')
], {
    stdio: 'inherit' // 子进程输出在当前命令行
})
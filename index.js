'use strict'

const { ArgumentParser } = require('argparse')
const { version } = require('./package.json')

const perror = (message) => {
    const stackTrace = process.stack.slice()
    console.error(`error: ${message}`, stackTrace)
    process.exit(1)
}

const assert = (assertion) => {
    if (!assertion) {
        perror('assertion failed')
    }
}

class ArgParser {
    static #args = null

    static parse() {
        const parser = new ArgumentParser({ description: 'notion html export deobfuscator' })
        parser.add_argument('-v', '--version', { action: 'version', version })
        parser.add_argument('-z', '--zip', { help: 'zip output', action: 'store_true' })
        parser.add_argument('-s', '--style', { help: 'overwrite notions default css with custom css', action: 'store_true' })
        parser.add_argument('input', { help: 'path to .zip file containing html export' })
        ArgParser.#args = parser.parse_args()
    }

    static get_args() {
        assert(ArgParser.#args !== null)
        return ArgParser.#args
    }
}

async function main() {
    ArgParser.parse()
    console.log(ArgParser.get_args())
}
main()

'use strict'

const { ArgumentParser } = require('argparse')

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

    static getArgs() {
        assert(ArgParser.#args !== null)
        return ArgParser.#args
    }
    static parse() {
        const parser = new ArgumentParser({ description: 'notion html export deobfuscator' })
        parser.add_argument('-z', '--zip', { help: 'zip output after processing', action: 'store_true' })
        parser.add_argument('-s', '--style', { help: 'overwrite notions default styling with custom css', action: 'store_true' })
        parser.add_argument('input', { help: 'path to zip file containing the html export' })

        const inputPath = parser.parse_args().input
        ArgParser.#validateInputPath(inputPath)

        ArgParser.#args = parser.parse_args()
    }

    static #validateInputPath = (inputPath) => {
        assert(inputPath)
    }
}

async function main() {
    ArgParser.parse()
    console.log(ArgParser.getArgs())
}
main()

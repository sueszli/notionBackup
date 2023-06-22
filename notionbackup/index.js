import { log } from 'console'
import { ArgumentParser } from 'argparse'
import * as fs from 'fs'
import * as path from 'path'
import { extractZip } from 'extract-zip'

const perror = (message) => {
    assert(message && typeof message === 'string')
    const stackTrace = new Error().stack
    console.error(`error: ${message}\n`, stackTrace)
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
        assert(ArgParser.#args)
        return ArgParser.#args
    }

    static #validateInputPath = (inputPath) => {
        assert(inputPath && typeof inputPath === 'string')
        if (!fs.existsSync(inputPath)) {
            perror('input file does not exist')
        }
        if (!inputPath.endsWith('.zip')) {
            perror('input file is not a zip file')
        }
    }

    static parseArgs() {
        const parser = new ArgumentParser({ description: 'notion html export deobfuscator' })
        parser.add_argument('-s', '--style', { help: 'overwrite styling with custom css', action: 'store_true' })
        parser.add_argument('input', { help: 'path to zip file containing the html export' })
        const args = parser.parse_args()

        assert(args.input && typeof args.input === 'string')
        ArgParser.#validateInputPath(args.input)
        args.input = path.resolve(args.input)

        if (args.style) {
            perror('feature is not implemented yet')
        }

        ArgParser.#args = args
    }
}

class NotionBackup {
    static #outputDirPath = null

    static #initOutputDir() {
        const outerDirName = 'output'
        const outerDirPath = path.join(process.cwd(), outerDirName)
        if (!fs.existsSync(outerDirName)) {
            fs.mkdirSync(outerDirName)
        }

        const innerDirName = path.basename(ArgParser.getArgs().input).replace('.zip', '')
        const innerDirPath = path.join(outerDirPath, innerDirName)
        if (fs.existsSync(innerDirPath)) {
            log('cleaning up exisitng files in output directory')
        }
        fs.rmSync(innerDirPath, { recursive: true, force: true })
        fs.mkdirSync(innerDirPath)

        NotionBackup.#outputDirPath = innerDirPath
        log('initialized output directory')
    }

    static #copyToOutputDir() {
        assert(NotionBackup.#outputDirPath && typeof NotionBackup.#outputDirPath === 'string')

        const src = ArgParser.getArgs().input
        const dst = path.join(NotionBackup.#outputDirPath, path.basename(src))
        fs.copyFileSync(src, dst)
        log('copied input file to output directory')
    }

    static async #unzip() {
        assert(NotionBackup.#outputDirPath && typeof NotionBackup.#outputDirPath === 'string')

        const src = path.join(NotionBackup.#outputDirPath, path.basename(ArgParser.getArgs().input))
        const dst = NotionBackup.#outputDirPath
        await extractZip(src, { dir: dst })
    }

    static async run() {
        NotionBackup.#initOutputDir()
        NotionBackup.#copyToOutputDir()
        await NotionBackup.#unzip()
    }
}

async function main() {
    ArgParser.parseArgs()
    await NotionBackup.run()
}
main()

import { strict as assert } from 'node:assert'
import { log } from 'console'
import { ArgumentParser } from 'argparse'
import * as fs from 'fs'
import * as path from 'path'
import AdmZip from 'adm-zip'
import Piscina from 'piscina'

class ArgParser {
    static #args = null

    static getArgs() {
        assert(ArgParser.#args && typeof ArgParser.#args === 'object')
        return ArgParser.#args
    }

    static #validateInputPath = (inputPath) => {
        assert(inputPath && typeof inputPath === 'string')
        if (!fs.existsSync(inputPath)) {
            throw new Error('input file does not exist')
        }
        if (!inputPath.endsWith('.zip')) {
            throw new Error('input file is not a zip file')
        }
    }

    static parseArgs() {
        const parser = new ArgumentParser({ description: 'notion html export fixer' })
        parser.add_argument('input', { help: 'path to zip file containing the html export' })
        const args = parser.parse_args()

        assert(args.input && typeof args.input === 'string')
        ArgParser.#validateInputPath(args.input)
        args.input = path.resolve(args.input)

        ArgParser.#args = args
    }
}

class FileManager {
    static #outputDirPath = null

    static getOutputDirPath() {
        assert(FileManager.#outputDirPath && typeof FileManager.#outputDirPath === 'string')
        return FileManager.#outputDirPath
    }

    static #initOutputDir() {
        const outerDirName = 'output'
        const outerDirPath = path.join(process.cwd(), outerDirName)
        if (!fs.existsSync(outerDirName)) {
            fs.mkdirSync(outerDirName)
        }

        const innerDirName = path.basename(ArgParser.getArgs().input).replace('.zip', '')
        const innerDirPath = path.join(outerDirPath, innerDirName)
        fs.rmSync(innerDirPath, { recursive: true, force: true })
        fs.mkdirSync(innerDirPath)

        FileManager.#outputDirPath = innerDirPath
    }

    static #copyToOutputDir() {
        const src = ArgParser.getArgs().input
        const dst = path.join(FileManager.getOutputDirPath(), path.basename(src))
        fs.copyFileSync(src, dst)
    }

    static #unzip() {
        const src = path.join(FileManager.getOutputDirPath(), path.basename(ArgParser.getArgs().input))
        const dst = FileManager.getOutputDirPath()
        const zip = new AdmZip(src)
        zip.extractAllTo(dst)
        fs.rmSync(src)
    }

    static init() {
        FileManager.#initOutputDir()
        FileManager.#copyToOutputDir()
        FileManager.#unzip()
    }
}

class NotionBackup {
    static #getHtmlFiles = (dirPath) => {
        assert(dirPath && typeof dirPath === 'string')
        assert(fs.statSync(dirPath).isDirectory())
        const children = fs.readdirSync(dirPath).map((child) => path.join(dirPath, child))
        const subDirs = children.filter((child) => fs.statSync(child).isDirectory())
        const subFiles = children.filter((child) => fs.statSync(child).isFile())

        const recursiveSubFiles = subDirs.map((s) => NotionBackup.#getHtmlFiles(s)).flat()
        const files = [...subFiles, ...recursiveSubFiles]
        return files.filter((filePath) => filePath.endsWith('.html'))
    }

    static async run() {
        const htmlPaths = NotionBackup.#getHtmlFiles(FileManager.getOutputDirPath())

        const workerPath = path.join(process.cwd(), 'notionbackup', 'worker.js')
        const workerPool = new Piscina({ filename: workerPath })
        const promises = htmlPaths.map((htmlPath) => {
            return workerPool.run({ htmlPath })
        })
        await Promise.all(promises)
        workerPool.destroy()
    }
}

const BANNER =
    '    _   __      __  _                ____             __\n' +
    '   / | / /___  / /_(_)___  ____     / __ )____ ______/ /____  ______\n' +
    '  /  |/ / __ \\/ __/ / __ \\/ __ \\   / __  / __ `/ ___/ //_/ / / / __ \\\n' +
    ' / /|  / /_/ / /_/ / /_/ / / / /  / /_/ / /_/ / /__/ ,< / /_/ / /_/ /\n' +
    '/_/ |_/\\____/\\__/_/\\____/_/ /_/  /_____/\\__,_/\\___/_/|_|\\__,_/ .___/\n' +
    '                                                            /_/'
async function main() {
    console.clear()
    log(BANNER)

    console.time('execution time')
    ArgParser.parseArgs()
    FileManager.init()
    log('initialized output directory')

    await NotionBackup.run()
    console.timeEnd('execution time')
}
await main()

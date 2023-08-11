import { strict as assert } from 'node:assert'
import { log } from 'console'
import * as fs from 'fs'
import * as path from 'path'
import AdmZip from 'adm-zip'
import Piscina from 'piscina'

/*

TODO: 

- refactor project to start fresh
    - try to put worker threads in the same file as the main thread so you reduce the number of files

- feature: download javascript dependencies in output directory

- feature: upload to npm and turn into npx executable to call anywhere
    - zip output
    - put output in the same directory as input

- bugfix: check why math formulas look stretched after prettifying

- impovement: better multithreading - read into worker thread pools
    - https://snyk.io/blog/node-js-multithreading-with-worker-threads/
    - https://nodejs.org/api/worker_threads.html
    - https://nodejs.org/api/async_context.html#using-asyncresource-for-a-worker-thread-pool → use instead of a library

*/

class NotionBackup {
    static #getInputPath(): string {
        const args: string[] = process.argv.slice(2)
        assert(args.length === 1)
        const arg: string = args[0]
        assert(fs.existsSync(arg))
        assert(arg.endsWith('.zip'))
        return arg
    }

    static #getUnzippedInputPath(arg: string): string {
        // make './output' directory
        const outerDirName = 'output'
        if (!fs.existsSync(outerDirName)) {
            fs.mkdirSync(outerDirName)
        }
        // remove old './output/arg' directory
        const innerDirPath = path.join(process.cwd(), outerDirName, path.parse(arg).name)
        fs.rmSync(innerDirPath, { recursive: true, force: true })
        fs.mkdirSync(innerDirPath)

        // unzip 'arg' file into './output/arg' directory
        const zipFilePath = arg
        const unzipDirPath = innerDirPath
        const zip = new AdmZip(zipFilePath)
        zip.extractAllTo(unzipDirPath)

        return unzipDirPath
    }

    static #getHtmlFiles(dirPath: string): string[] {
        assert(fs.statSync(dirPath).isDirectory())

        const children = fs.readdirSync(dirPath).map((child) => path.join(dirPath, child))
        const subDirs = children.filter((child) => fs.statSync(child).isDirectory())

        const subFiles = children.filter((child) => fs.statSync(child).isFile())
        const recursiveSubFiles = subDirs.map((s) => NotionBackup.#getHtmlFiles(s)).flat()
        const allSubFiles = [...subFiles, ...recursiveSubFiles]
        return allSubFiles.filter((f) => f.endsWith('.html'))
    }

    static async run() {
        const inputPath = NotionBackup.#getInputPath()
        const unzippedInputPath = NotionBackup.#getUnzippedInputPath(inputPath)
        const htmlPaths = NotionBackup.#getHtmlFiles(unzippedInputPath)
        log(`found ${htmlPaths.length} html files to process concurrently`)

        // const workerPath = path.join(process.cwd(), 'notionbackup', 'worker.js')
        // const workerPool = new Piscina({ filename: workerPath })
        // const promises = htmlPaths.map((htmlPath) => {
        //     return workerPool.run({ htmlPath })
        // })
        // await Promise.all(promises)
        // workerPool.destroy()
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
    await NotionBackup.run()
    console.timeEnd('execution time')
}
main()

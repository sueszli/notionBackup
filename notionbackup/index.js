import { log } from 'console'
import { ArgumentParser } from 'argparse'
import * as fs from 'fs'
import * as path from 'path'
import AdmZip from 'adm-zip'
import jsdom from 'jsdom'
import prettier from 'prettier'

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

class Utils {
    static osWalk(dirPath) {
        assert(dirPath && typeof dirPath === 'string')
        assert(fs.statSync(dirPath).isDirectory())
        const children = fs.readdirSync(dirPath).map((child) => path.join(dirPath, child))
        const subDirs = children.filter((child) => fs.statSync(child).isDirectory())
        const subFiles = children.filter((child) => fs.statSync(child).isFile())
        return [...subFiles, ...subDirs.map((s) => Utils.osWalk(s)).flat()]
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
        parser.add_argument('input', { help: 'path to zip file containing the html export' })
        const args = parser.parse_args()

        assert(args.input && typeof args.input === 'string')
        ArgParser.#validateInputPath(args.input)
        args.input = path.resolve(args.input)

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
        fs.rmSync(innerDirPath, { recursive: true, force: true })
        fs.mkdirSync(innerDirPath)

        NotionBackup.#outputDirPath = innerDirPath
        log('initialized fresh output directory')
    }

    static #copyToOutputDir() {
        assert(NotionBackup.#outputDirPath && typeof NotionBackup.#outputDirPath === 'string')

        const src = ArgParser.getArgs().input
        const dst = path.join(NotionBackup.#outputDirPath, path.basename(src))
        fs.copyFileSync(src, dst)
        log('copied input file to output directory')
    }

    static #unzip() {
        assert(NotionBackup.#outputDirPath && typeof NotionBackup.#outputDirPath === 'string')

        const src = path.join(NotionBackup.#outputDirPath, path.basename(ArgParser.getArgs().input))
        const dst = NotionBackup.#outputDirPath
        const zip = new AdmZip(src)
        zip.extractAllTo(dst)
        fs.rmSync(src)
        log('unzipped input file')
    }

    static #fix() {
        assert(NotionBackup.#outputDirPath && typeof NotionBackup.#outputDirPath === 'string')
        const htmlPaths = Utils.osWalk(NotionBackup.#outputDirPath).filter((filePath) => filePath.endsWith('.html'))

        const injectCssPath = path.join(process.cwd(), 'notionBackup', 'inject.css')
        const injectCssStr = fs.readFileSync(injectCssPath, 'utf8')

        const getHtmlElementClassList = (elem) => {
            assert(elem && elem.hasAttribute('class'))
            const classList = elem
                .getAttribute('class')
                .split(' ')
                .filter((s) => s.trim())
            return classList
        }

        const promises = htmlPaths.map((htmlPath) => {
            const htmlStr = fs.readFileSync(htmlPath, 'utf8')
            const dom = new jsdom.JSDOM(htmlStr)
            const elems = dom.window.document.querySelectorAll('*')

            // remove ids
            elems.forEach((elem) => elem.removeAttribute('id'))

            // remove empty class attributes
            Array.from(elems)
                .filter((elem) => elem.hasAttribute('class'))
                .filter((elem) => getHtmlElementClassList(elem).length === 0)
                .forEach((elem) => elem.removeAttribute('class'))

            // fix anchors
            const anchorWrappers = Array.from(elems)
                .filter((elem) => elem.hasAttribute('class'))
                .filter((elem) => getHtmlElementClassList(elem).includes('source'))
            const anchors = anchorWrappers.map((wrapper) => wrapper.querySelector('a')).filter((anchor) => anchor)
            anchors.forEach((anchor) => {
                const hasHref = anchor.hasAttribute('href')
                if (!hasHref || !anchor.getAttribute('href')) {
                    log('found anchor block without href / with external href in :', htmlPath)
                    return
                }
                const link = anchor.getAttribute('href')
                if (link.startsWith('http')) {
                    log('found external link in :', htmlPath)
                    return
                }
                const filename = path.basename(link)
                anchor.textContent = filename
            })

            // add css injection
            const styleElem = dom.window.document.querySelector('style')
            styleElem.innerHTML = styleElem.innerHTML + '\n\n' + injectCssStr

            const optimizedHtmlStr = dom.serialize()
            fs.writeFileSync(htmlPath, optimizedHtmlStr)
        })
        Promise.all(promises)
        log('updated files')
    }

    static #format() {
        assert(NotionBackup.#outputDirPath && typeof NotionBackup.#outputDirPath === 'string')
        const htmlPaths = Utils.osWalk(NotionBackup.#outputDirPath).filter((filePath) => filePath.endsWith('.html'))

        const promises = htmlPaths.map((htmlPath) => {
            const uglyHtmlStr = fs.readFileSync(htmlPath, 'utf8')
            const prettyHtmlStr = prettier.format(uglyHtmlStr, {
                parser: 'html',
                tabWidth: 4,
                printWidth: 160,
                htmlWhitespaceSensitivity: 'ignore',
                bracketSameLine: true,
            })
            fs.writeFileSync(htmlPath, prettyHtmlStr)
        })
        Promise.all(promises)
        log('formatted html files')
    }

    static run() {
        NotionBackup.#initOutputDir()
        NotionBackup.#copyToOutputDir()
        NotionBackup.#unzip()
        NotionBackup.#fix()
        NotionBackup.#format()
    }
}

const BANNER =
    '    _   __      __  _                ____             __\n' +
    '   / | / /___  / /_(_)___  ____     / __ )____ ______/ /____  ______\n' +
    '  /  |/ / __ \\/ __/ / __ \\/ __ \\   / __  / __ `/ ___/ //_/ / / / __ \\\n' +
    ' / /|  / /_/ / /_/ / /_/ / / / /  / /_/ / /_/ / /__/ ,< / /_/ / /_/ /\n' +
    '/_/ |_/\\____/\\__/_/\\____/_/ /_/  /_____/\\__,_/\\___/_/|_|\\__,_/ .___/\n' +
    '                                                            /_/'
function main() {
    console.clear()
    log(BANNER)
    ArgParser.parseArgs()
    NotionBackup.run()
}
main()

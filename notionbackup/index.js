import { log } from 'console'
import { ArgumentParser } from 'argparse'
import * as fs from 'fs'
import * as path from 'path'
import AdmZip from 'adm-zip'
import jsdom from 'jsdom'
import css from 'css'
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
        parser.add_argument('-s', '--style', { help: 'make output prettier', action: 'store_true' })
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

    static #fixPreWrap() {
        const getFixedHtmlStr = (htmlStr) => {
            assert(htmlStr && typeof htmlStr === 'string')

            const dom = new jsdom.JSDOM(htmlStr)
            const styleElem = dom.window.document.querySelector('style')
            const styleContent = styleElem.innerHTML
            assert(styleContent)

            /*
            body {
                line-height: 1.5;
                white-space: pre-wrap; ⬅ change to 'normal'
            }
            */
            const cssObj = css.parse(styleContent)
            const isBodyRule = (rule) => rule.type === 'rule' && rule.selectors.includes('body') && rule.selectors.length === 1
            const numBodyRules = cssObj.stylesheet.rules.filter((rule) => isBodyRule(rule)).length
            if (numBodyRules !== 1) {
                perror('html does not match the expected format')
            }
            cssObj.stylesheet.rules
                .filter((rule) => isBodyRule(rule))
                .forEach((rule) => {
                    rule.declarations.forEach((declaration) => {
                        if (declaration.property === 'white-space') {
                            declaration.value = 'normal'
                        }
                    })
                })

            const newStyleContent = css.stringify(cssObj)
            styleElem.innerHTML = newStyleContent
            return dom.serialize()
        }

        assert(NotionBackup.#outputDirPath && typeof NotionBackup.#outputDirPath === 'string')
        const htmlPaths = Utils.osWalk(NotionBackup.#outputDirPath).filter((filePath) => filePath.endsWith('.html'))
        htmlPaths.forEach((htmlPath) => {
            const brokenHtmlStr = fs.readFileSync(htmlPath, 'utf8')
            const fixedHtmlStr = getFixedHtmlStr(brokenHtmlStr)
            fs.writeFileSync(htmlPath, fixedHtmlStr)
        })
        log("set pre-wrap to 'normal' in css")
    }

    static #optimizeHtml() {
        assert(NotionBackup.#outputDirPath && typeof NotionBackup.#outputDirPath === 'string')
        const htmlPaths = Utils.osWalk(NotionBackup.#outputDirPath).filter((filePath) => filePath.endsWith('.html'))

        htmlPaths.forEach((htmlPath) => {
            const htmlStr = fs.readFileSync(htmlPath, 'utf8')
            const dom = new jsdom.JSDOM(htmlStr)
            const elems = dom.window.document.querySelectorAll('*')

            // remove ids
            elems.forEach((elem) => elem.removeAttribute('id'))

            // remove empty class attributes
            Array.from(elems)
                .filter((elem) => elem.hasAttribute('class'))
                .filter((elem) => {
                    const classList = elem
                        .getAttribute('class')
                        .split(' ')
                        .filter((s) => s.trim())
                    return classList.length === 0
                })
                .forEach((elem) => elem.removeAttribute('class'))

            const optimizedHtmlStr = dom.serialize()
            fs.writeFileSync(htmlPath, optimizedHtmlStr)
        })
        log('removed ids and empty class attributes in html elements')
    }

    static #fixLinks() {
        assert(NotionBackup.#outputDirPath && typeof NotionBackup.#outputDirPath === 'string')
        const htmlPaths = Utils.osWalk(NotionBackup.#outputDirPath).filter((filePath) => filePath.endsWith('.html'))

        htmlPaths.forEach((htmlPath) => {
            const htmlStr = fs.readFileSync(htmlPath, 'utf8')
            const dom = new jsdom.JSDOM(htmlStr)
            const elems = dom.window.document.querySelectorAll('*')

            const anchorWrappers = Array.from(elems)
                .filter((elem) => elem.hasAttribute('class'))
                .filter((elem) => {
                    const classList = elem
                        .getAttribute('class')
                        .split(' ')
                        .filter((s) => s.trim())
                    return classList.includes('source')
                })
            const anchors = anchorWrappers.map((wrapper) => wrapper.querySelector('a')).filter((anchor) => anchor)

            anchors.forEach((anchor) => {
                const hasHref = anchor.hasAttribute('href')
                if (!hasHref) {
                    log('found anchor block with no href in :', htmlPath)
                    return
                }

                const href = anchor.getAttribute('href')
                if (href.startsWith('http')) {
                    log('found anchor block with external link in :', htmlPath)
                    return
                }
                const filename = path.basename(href)
                anchor.textContent = filename
            })

            const optimizedHtmlStr = dom.serialize()
            fs.writeFileSync(htmlPath, optimizedHtmlStr)
        })
        log('updated attachment links to the filename')
    }

    static #fixCallouts() {
        assert(NotionBackup.#outputDirPath && typeof NotionBackup.#outputDirPath === 'string')
        const htmlPaths = Utils.osWalk(NotionBackup.#outputDirPath).filter((filePath) => filePath.endsWith('.html'))

        htmlPaths.forEach((htmlPath) => {
            const htmlStr = fs.readFileSync(htmlPath, 'utf8')
            const dom = new jsdom.JSDOM(htmlStr)
            const elems = dom.window.document.querySelectorAll('*')

            const calloutFigures = Array.from(elems)
                .filter((elem) => elem.tagName.toLowerCase() === 'figure' && elem.hasAttribute('class'))
                .filter((elem) => elem.hasAttribute('class'))
                .filter((elem) => {
                    const classList = elem
                        .getAttribute('class')
                        .split(' ')
                        .filter((s) => s.trim())
                    return classList.includes('callout')
                })

            // set pre-wrap to normal
            calloutFigures.forEach((figure) => {
                const style = figure.getAttribute('style')
                assert(style.includes('white-space'))
                assert(style.includes('pre-wrap'))
                figure.setAttribute('style', style.replace('pre-wrap', 'normal'))
            })

            // remove styling for icon
            calloutFigures.forEach((figure) => {
                Array.from(figure.children)
                    .filter((child) => child.tagName.toLowerCase() === 'div')
                    .filter((child) => {
                        const spanChildren = Array.from(child.children).find((grandChild) => grandChild.tagName.toLowerCase() === 'span')
                        if (!spanChildren) {
                            return false
                        }
                        const classList = spanChildren
                            .getAttribute('class')
                            .split(' ')
                            .filter((s) => s.trim())
                        return classList.includes('icon')
                    })
                    .forEach((child) => child.removeAttribute('style'))
            })

            const optimizedHtmlStr = dom.serialize()
            fs.writeFileSync(htmlPath, optimizedHtmlStr)
        })
        log('fixed callout styles')
    }

    static #injectCss() {
        const injectCssPath = path.join(process.cwd(), 'notionBackup', 'inject.css')
        const injectCssStr = fs.readFileSync(injectCssPath, 'utf8')

        assert(NotionBackup.#outputDirPath && typeof NotionBackup.#outputDirPath === 'string')
        const htmlPaths = Utils.osWalk(NotionBackup.#outputDirPath).filter((filePath) => filePath.endsWith('.html'))
        htmlPaths.forEach((htmlPath) => {
            const htmlStr = fs.readFileSync(htmlPath, 'utf8')

            const dom = new jsdom.JSDOM(htmlStr)
            const styleElem = dom.window.document.querySelector('style')
            const styleContent = styleElem.innerHTML
            assert(styleContent)

            const newStyleContent = styleContent + '\n\n' + injectCssStr
            styleElem.innerHTML = newStyleContent

            const newHtmlStr = dom.serialize()
            fs.writeFileSync(htmlPath, newHtmlStr)
        })

        log('injected custom css')
    }

    static #format() {
        assert(NotionBackup.#outputDirPath && typeof NotionBackup.#outputDirPath === 'string')
        const htmlPaths = Utils.osWalk(NotionBackup.#outputDirPath).filter((filePath) => filePath.endsWith('.html'))

        htmlPaths.forEach((htmlPath) => {
            const uglyHtmlStr = fs.readFileSync(htmlPath, 'utf8')
            const prettierConfig = {
                parser: 'html',
                tabWidth: 4,
                printWidth: 160,
                htmlWhitespaceSensitivity: 'ignore',
                bracketSameLine: true,
            }
            const prettyHtmlStr = prettier.format(uglyHtmlStr, prettierConfig)
            fs.writeFileSync(htmlPath, prettyHtmlStr)
        })
        log('formatted html files')
    }

    static run() {
        NotionBackup.#initOutputDir()
        NotionBackup.#copyToOutputDir()
        NotionBackup.#unzip()
        NotionBackup.#fixPreWrap()
        NotionBackup.#optimizeHtml()

        if (ArgParser.getArgs().style) {
            NotionBackup.#fixLinks()
            NotionBackup.#fixCallouts()
            NotionBackup.#injectCss()
        }

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

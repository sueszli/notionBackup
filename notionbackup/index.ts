import { strict as assert } from 'node:assert'
import { log } from 'console'
import * as fs from 'fs'
import * as path from 'path'
import AdmZip from 'adm-zip'
import jsdom from 'jsdom'
import prettier from 'prettier'
import { randomUUID } from 'node:crypto'
import axios from 'axios'

/*

TODO: 

- feature: cache / download stuff
    - img
    - figure

- bugfix: add <prettier-ignore> before all figure blocks

- feature: upload to npm and turn into npx executable to call anywhere (process in the same directory as the input file)

*/

function getInputPath(): string {
    const args: string[] = process.argv.slice(2)
    assert(args.length === 1)
    const arg: string = args[0]
    assert(fs.existsSync(arg))
    assert(arg.endsWith('.zip'))
    return arg
}

function getUnzippedInputPath(arg: string): string {
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

function getHtmlFiles(dirPath: string): string[] {
    assert(fs.statSync(dirPath).isDirectory())

    const children = fs.readdirSync(dirPath).map((child) => path.join(dirPath, child))
    const subDirs = children.filter((child) => fs.statSync(child).isDirectory())

    const subFiles = children.filter((child) => fs.statSync(child).isFile())
    const recursiveSubFiles = subDirs.map((s) => getHtmlFiles(s)).flat()
    const allSubFiles = [...subFiles, ...recursiveSubFiles]
    return allSubFiles.filter((f) => f.endsWith('.html'))
}

function getElemClassArray(elem: Element) {
    const noClass = !elem.hasAttribute('class')
    if (noClass) {
        return []
    }
    return elem
        .getAttribute('class')
        .split(' ')
        .filter((s) => s.trim())
}

async function processHtml(htmlPath: string) {
    const htmlStr: string = fs.readFileSync(htmlPath, 'utf8')
    const dom: jsdom.JSDOM = new jsdom.JSDOM(htmlStr)
    const elems: Element[] = dom.window.document.querySelectorAll('*')

    // remove ids
    elems.forEach((elem) => elem.removeAttribute('id'))

    // remove empty class attributes
    Array.from(elems)
        .filter((elem) => getElemClassArray(elem).length === 0)
        .forEach((elem) => elem.removeAttribute('class'))

    // remove AWS name from asset links
    const anchorWrappers = Array.from(elems).filter((elem) => getElemClassArray(elem).includes('source'))
    const anchors: Element[] = anchorWrappers.map((wrapper) => wrapper.querySelector('a')).filter((anchor) => anchor)
    const isAsset = (anchor) => anchor.hasAttribute('href') && anchor.getAttribute('href') && !anchor.getAttribute('href').startsWith('http')
    anchors.filter(isAsset).forEach((anchor) => {
        const href: string = anchor.getAttribute('href')
        const filename: string = path.basename(href)
        anchor.textContent = filename
    })

    // create cache folder
    const cachePath = path.join(path.dirname(htmlPath), '.cache')
    if (!fs.existsSync(cachePath)) {
        fs.mkdirSync(cachePath)
    }

    // cache images
    const imgs = Array.from(elems).filter((elem) => elem.tagName.toLowerCase() === 'img')
    const tasks = imgs
        .filter((img) => img.hasAttribute('src'))
        .filter((img) => img.getAttribute('src').startsWith('http'))
        .map((img) => {
            const urlStr: string = img.getAttribute('src')
            const url = new URL(urlStr)

            const getUniqueFileName = (url: URL) => {
                let filename = path.basename(url.pathname)
                const filenameEnding = path.extname(filename)
                if (!filenameEnding) {
                    filename = filename + '.png'
                }
                return filename.split('.').slice(0, -1).join('.') + randomUUID() + filenameEnding
            }
            const downloadPath = path.join(cachePath, getUniqueFileName(url))

            return axios({
                method: 'get',
                url: urlStr,
                responseType: 'stream',
            }).then((response) => {
                response.data.pipe(fs.createWriteStream(downloadPath))
                const relativePath = path.relative(path.dirname(htmlPath), downloadPath)
                img.setAttribute('src', relativePath)
            })
        })
    await Promise.all(tasks)
    if (tasks.length > 0) log('cached:', tasks.length, 'images')

    // cache katex

    // add prettier-ignore for katex equations

    // inject custom css
    const cssInjection: string = fs.readFileSync(path.join(process.cwd(), 'notionbackup', 'injection.css'), 'utf8')
    const styleElem: Element = dom.window.document.querySelector('style')
    styleElem.innerHTML = styleElem.innerHTML + '\n\n' + cssInjection

    // prettify html
    const optimizedHtmlStr: string = dom.serialize()
    const prettyHtmlStr = prettier.format(optimizedHtmlStr, {
        parser: 'html',
        tabWidth: 4,
        printWidth: 160,
        htmlWhitespaceSensitivity: 'ignore',
        bracketSameLine: true,
    })

    fs.writeFileSync(htmlPath, prettyHtmlStr)
}

const BANNER =
    '    _   __      __  _                ____             __\n' +
    '   / | / /___  / /_(_)___  ____     / __ )____ ______/ /____  ______\n' +
    '  /  |/ / __ \\/ __/ / __ \\/ __ \\   / __  / __ `/ ___/ //_/ / / / __ \\\n' +
    ' / /|  / /_/ / /_/ / /_/ / / / /  / /_/ / /_/ / /__/ ,< / /_/ / /_/ /\n' +
    '/_/ |_/\\____/\\__/_/\\____/_/ /_/  /_____/\\__,_/\\___/_/|_|\\__,_/ .___/\n' +
    '                                                            /_/'
const main = async () => {
    console.clear()
    log(BANNER)

    console.time('execution time')

    const inputPath = getInputPath()
    const unzippedInputPath = getUnzippedInputPath(inputPath)
    const htmlPaths = getHtmlFiles(unzippedInputPath)

    for (const htmlPath of htmlPaths) {
        await processHtml(htmlPath)
        // log('processed:', path.basename(htmlPath))
    }
    console.timeEnd('execution time')
}
main()

import { strict as assert } from 'node:assert'
import { log } from 'console'
import * as fs from 'fs'
import * as path from 'path'
import AdmZip from 'adm-zip'
import workerpool from 'workerpool'
import jsdom from 'jsdom'
import prettier from 'prettier'

/*

TODO: 

- try to put worker threads in the same file as the main thread so you reduce the number of files

- feature: cache / download javascript dependencies in output directory

- feature: upload to npm and turn into npx executable to call anywhere (process in the same directory as the input file)

- bugfix: check why math formulas look stretched after prettifying

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

function workerProcessHtmlFile(htmlPath: string) {
    log('processing:', path.basename(htmlPath))

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
    log('processed:', path.basename(htmlPath))
}

const BANNER =
    '    _   __      __  _                ____             __\n' +
    '   / | / /___  / /_(_)___  ____     / __ )____ ______/ /____  ______\n' +
    '  /  |/ / __ \\/ __/ / __ \\/ __ \\   / __  / __ `/ ___/ //_/ / / / __ \\\n' +
    ' / /|  / /_/ / /_/ / /_/ / / / /  / /_/ / /_/ / /__/ ,< / /_/ / /_/ /\n' +
    '/_/ |_/\\____/\\__/_/\\____/_/ /_/  /_____/\\__,_/\\___/_/|_|\\__,_/ .___/\n' +
    '                                                            /_/'
const main = () => {
    console.clear()
    log(BANNER)

    console.time('execution time')

    const inputPath = getInputPath()
    const unzippedInputPath = getUnzippedInputPath(inputPath)
    const htmlPaths = getHtmlFiles(unzippedInputPath)
    log(`found ${htmlPaths.length} html files`)

    const pool = workerpool.pool()
    for (const htmlPath of htmlPaths) {
        workerProcessHtmlFile(htmlPath)
    }

    console.timeEnd('execution time')
}
main()

import { strict as assert } from 'node:assert'
import { log } from 'console'
import * as fs from 'fs'
import * as path from 'path'
import AdmZip from 'adm-zip'
import jsdom from 'jsdom'
import prettier from 'prettier'
import { randomUUID } from 'node:crypto'
import axios from 'axios'
import { Element } from 'dom'

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
    const classAttr = elem.getAttribute('class')
    if (!classAttr) {
        return []
    }
    return classAttr.split(' ').filter((s) => s.trim())
}

async function processHtml(htmlPath: string) {
    const htmlStr: string = fs.readFileSync(htmlPath, 'utf8')
    const dom: jsdom.JSDOM = new jsdom.JSDOM(htmlStr)
    const elems = dom.window.document.querySelectorAll('*')

    // remove ids
    elems.forEach((elem: Element) => elem.removeAttribute('id'))

    // remove empty class attributes
    Array.from(elems)
        .filter((elem: Element) => getElemClassArray(elem).length === 0)
        .forEach((elem: Element) => elem.removeAttribute('class'))

    // remove AWS name from asset links
    const anchorWrappers = Array.from(elems).filter((elem: Element) => getElemClassArray(elem).includes('source'))
    const anchors: (Element | null)[] = anchorWrappers.map((wrapper: Element) => wrapper.querySelector('a')).filter((anchor) => anchor)
    const isAsset = (anchor: Element | null) => anchor && anchor.hasAttribute('href') && anchor.getAttribute('href') && !anchor.getAttribute('href').startsWith('http')
    anchors.filter(isAsset).forEach((anchor) => {
        assert(anchor)
        const href: string | null = anchor.getAttribute('href')
        assert(href)
        const filename: string = path.basename(href)
        anchor.textContent = filename
    })

    // create cache folder
    const cachePath = path.join(path.dirname(htmlPath), '.cache')
    if (!fs.existsSync(cachePath)) {
        fs.mkdirSync(cachePath)
    }

    // cache images
    const imgs = Array.from(elems).filter((elem: Element) => elem.tagName.toLowerCase() === 'img')
    const externalImgs = imgs.filter((img: Element) => img.hasAttribute('src') && img.getAttribute('src')?.startsWith('http'))
    const tasks = externalImgs.map((img: Element) => {
        const urlStr: string | null = img.getAttribute('src')
        assert(urlStr)
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
    log('\t cached', tasks.length, 'images')

    // cache katex equations
    const equations = Array.from(elems)
        .filter((elem: Element) => elem.tagName.toLowerCase() === 'figure')
        .filter((elem: Element) => getElemClassArray(elem).includes('equation'))
    if (equations.length > 0) {
        const eqn: Element = equations[0]
        const styleElem: Element | null = eqn.querySelector('style')
        assert(styleElem)
        const styleStr = styleElem.innerHTML
        const urlStr = styleStr.split('url(')[1].split(')')[0].replace(/'/g, '')

        const url = new URL(urlStr)
        const filename = path.basename(url.pathname)
        assert(filename === 'katex.min.css')
        const downloadPath = path.join(cachePath, filename)

        const response = await axios({
            method: 'get',
            url: urlStr,
            responseType: 'stream',
        })
        response.data.pipe(fs.createWriteStream(downloadPath))
        styleElem.remove()

        const head = dom.window.document.querySelector('head')
        const linkElem = dom.window.document.createElement('link')
        linkElem.setAttribute('rel', 'stylesheet')
        linkElem.setAttribute('href', path.relative(path.dirname(htmlPath), downloadPath))
        assert(head)
        head.appendChild(linkElem)

        log('\t cached katex.min.css')
    }
    equations.forEach((eqn: Element) => {
        const comment = dom.window.document.createComment('prettier-ignore') // unfortunately doesn't work for a whole block
        assert(eqn.parentNode)
        eqn.parentNode.insertBefore(comment, eqn)
    })

    // inject custom css
    const cssInjection: string = fs.readFileSync(path.join(process.cwd(), 'injection.css'), 'utf8')
    const styleElem: Element | null = dom.window.document.querySelector('style')
    assert(styleElem)
    styleElem.innerHTML = styleElem.innerHTML + '\n\n' + cssInjection

    // prettify html
    const optimizedHtmlStr: string = dom.serialize()
    const prettyHtmlStr = await prettier.format(optimizedHtmlStr, {
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

    for (let i = 0; i < htmlPaths.length; i++) {
        const htmlPath = htmlPaths[i]
        const filename = path.basename(htmlPath)
        const progress = ((i + 1) / htmlPaths.length) * 100
        log('\x1b[32m%s\x1b[0m', `[${progress.toFixed(2)}%]`, filename)
        await processHtml(htmlPath)
    }
    console.timeEnd('execution time')
}
main()

import { strict as assert } from 'node:assert'
import jsdom from 'jsdom'
import prettier from 'prettier'
import { log } from 'console'
import * as fs from 'fs'
import * as path from 'path'

const getClassArray = (elem) => {
    assert(elem && typeof elem === 'object')
    const noClass = !elem.hasAttribute('class')
    if (noClass) {
        return []
    }
    return elem
        .getAttribute('class')
        .split(' ')
        .filter((s) => s.trim())
}

export default ({ htmlPath }) => {
    assert(htmlPath && typeof htmlPath === 'string')
    const htmlStr = fs.readFileSync(htmlPath, 'utf8')
    const dom = new jsdom.JSDOM(htmlStr)
    const elems = dom.window.document.querySelectorAll('*')

    // remove ids
    elems.forEach((elem) => elem.removeAttribute('id'))

    // remove empty class attributes
    Array.from(elems)
        .filter((elem) => getClassArray(elem).length === 0)
        .forEach((elem) => elem.removeAttribute('class'))

    // remove AWS name from asset links
    const anchorWrappers = Array.from(elems).filter((elem) => getClassArray(elem).includes('source'))
    const anchors = anchorWrappers.map((wrapper) => wrapper.querySelector('a')).filter((anchor) => anchor)
    const isAsset = (anchor) => anchor.hasAttribute('href') && anchor.getAttribute('href') && !anchor.getAttribute('href').startsWith('http')
    anchors.filter(isAsset).forEach((anchor) => {
        assert(anchor)
        const href = anchor.getAttribute('href')
        assert(href && typeof href === 'string')
        const filename = path.basename(href)
        anchor.textContent = filename
    })

    // add css injection
    const cssInjection = fs.readFileSync(path.join(process.cwd(), 'notionbackup', 'injection.css'), 'utf8')
    assert(cssInjection && typeof cssInjection === 'string')
    const styleElem = dom.window.document.querySelector('style')
    assert(styleElem)
    styleElem.innerHTML = styleElem.innerHTML + '\n\n' + cssInjection

    // prettify html
    const optimizedHtmlStr = dom.serialize()
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

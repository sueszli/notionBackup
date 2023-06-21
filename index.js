'use strict'

const { ArgumentParser } = require('argparse')
const { version } = require('./package.json')

class ArgParser {
    static #args = null

    static parse() {
        const parser = new ArgumentParser({
            description: 'A Notion HTML export enhancer',
        })

        parser.add_argument('-v', '--version', { action: 'version', version })
        parser.add_argument('-f', '--foo', { help: 'foo bar' })
        parser.add_argument('-b', '--bar', { help: 'bar foo' })
        parser.add_argument('--baz', { help: 'baz bar' })

        console.dir(parser.parse_args())
    }
}

ArgParser.parse()

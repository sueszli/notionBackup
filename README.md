```
    _   __      __  _                ____             __
   / | / /___  / /_(_)___  ____     / __ )____ ______/ /____  ______
  /  |/ / __ \/ __/ / __ \/ __ \   / __  / __ `/ ___/ //_/ / / / __ \
 / /|  / /_/ / /_/ / /_/ / / / /  / /_/ / /_/ / /__/ ,< / /_/ / /_/ /
/_/ |_/\____/\__/_/\____/_/ /_/  /_____/\__,_/\___/_/|_|\__,_/ .___/
                                                            /_/
make your html exports editable and fully offline – keep them forever.
```

just run this script on your exported HTML zip files from Notion:

```bash
# clone
git clone https://github.com/sueszli/notionBackup
cd notionBackup

# install dependencies
npm install npm@latest -g
npm install
clear

# show usage
node notionbackup --help

# test
node notionbackup ./demo/blog.zip
```

> keep in mind: once content leaves Notion, you can't bring it back. exported html can't be reimported into Notion or similar apps/editors that are as good as notion. exports are permanent choices.


<br><br>

## why this exists

there are 5 ways to back up your notion content:

| export type           | no data loss      | fully offline                  | editable      |
| --------------------- | ----------------- | ------------------------------ | ------------- |
| notion API (json)     | ❌                | ✅                             | ✅            |
| web scraping (html)   | ❌ (not reliable) | ❌ (depends on implementation) | ❌ (minified) |
| pdf                   | ❌                | ✅                             | ❌            |
| markdown              | ❌                | ✅                             | ✅            |
| html                  | ✅                | ❌ (CDN dependency)            | ❌ (minified) |
| _html + notionBackup_ | ✅                | ✅                             | ✅            |

_non-html exports:_ \
everything that isn't html is inherently lossy. this is because json, markdown and pdf can't express everything that html can (like toggles, nested blocks, etc).

_html exports:_ \
html exports are lossless but not editable (minified), require an internet connection (javascript CDN dependency for KaTeX) and have awkward styling thay makes them hard to read.

but this script fixes just that! it makes html exports fully local, editable and pretty.


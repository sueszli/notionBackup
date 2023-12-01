```
    _   __      __  _                ____             __
   / | / /___  / /_(_)___  ____     / __ )____ ______/ /____  ______
  /  |/ / __ \/ __/ / __ \/ __ \   / __  / __ `/ ___/ //_/ / / / __ \
 / /|  / /_/ / /_/ / /_/ / / / /  / /_/ / /_/ / /__/ ,< / /_/ / /_/ /
/_/ |_/\____/\__/_/\____/_/ /_/  /_____/\__,_/\___/_/|_|\__,_/ .___/
                                                            /_/
make your html exports editable, cache dependencies – keep them forever.
```

```bash
# clone
git clone https://github.com/sueszli/notionBackup
cd notionBackup

# install dependencies
npm install
npm upgrade
clear

# test
npx ts-node notionbackup.ts ./demo/blog.zip
npx ts-node notionbackup.ts ./demo/all\ blocks.zip
npx ts-node notionbackup.ts ./demo/full\ templates.zip
```

just run this script on your zipped `.html` exports from notion to check it out in action.

While exporting from notion select "HTML" as Export format, "Everything" in Include 
Content to also include images, "Include subpages" to include all subpages and also "Create folders for subpages" to get a better folder structure in the export.

<br><br>

## not convinced?

this tool makes your notion backups future-proof – and here's why.

here are all the ways you can export your data.

| export type           | no data loss      | fully offline                  | editable      |
| --------------------- | ----------------- | ------------------------------ | ------------- |
| notion API (json)     | ❌                | ✅                             | ✅            |
| web scraping (html)   | ❌ (unreliable)   | ❌ (depends on implementation) | ❌ (minified) |
| pdf                   | ❌                | ✅                             | ❌            |
| markdown              | ❌                | ✅                             | ✅            |
| html                  | ✅                | ❌ (CDN dependency)            | ❌ (minified) |
| _html + notionBackup_ | ✅                | ✅                             | ✅            |

we can cluster the export types in 2 groups:

_a) non-html exports:_

- everything that isn't html is inherently lossy. this is because json, markdown and pdf can't express everything that html can (like toggles, nested blocks, etc).

_b) html exports:_

- html exports are lossless but not editable (minified), require an internet connection (javascript CDN dependency for KaTeX) and are styled very awkwardly.

here's where this script comes in. it gives you the best of both worlds by fixing the downsides of html exports and provides you with a reliable way to back your data up.


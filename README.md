```
    _   __      __  _                ____             __
   / | / /___  / /_(_)___  ____     / __ )____ ______/ /____  ______
  /  |/ / __ \/ __/ / __ \/ __ \   / __  / __ `/ ___/ //_/ / / / __ \
 / /|  / /_/ / /_/ / /_/ / / / /  / /_/ / /_/ / /__/ ,< / /_/ / /_/ /
/_/ |_/\____/\__/_/\____/_/ /_/  /_____/\__,_/\___/_/|_|\__,_/ .___/
                                                            /_/
make your html exports editable and fully offline – keep them forever.
```

just run this script on your zipped `.html` exports from notion.

```bash
# clone
git clone https://github.com/sueszli/notionBackup
cd notionBackup

# install dependencies
curl -fsSL https://bun.sh/install | bash
bun install
clear

# test
bun run notionbackup.ts ./demo/blog.zip
bun run notionbackup.ts ./demo/all\ blocks.zip
bun run notionbackup.ts ./demo/full\ templates.zip
```

but keep in mind: once content leaves notion, you can't bring it back. exported html can't be reimported into notion or similar apps/editors that are as good as notion. exports are permanent choices.

<br>

---

<br>

still not convinced to use?

here's why this tool makes your notion-backups future-proof. there are 5 ways to back up your notion content – here's a comparison:

| export type           | no data loss      | fully offline                  | editable      |
| --------------------- | ----------------- | ------------------------------ | ------------- |
| notion API (json)     | ❌                | ✅                             | ✅            |
| web scraping (html)   | ❌ (not reliable) | ❌ (depends on implementation) | ❌ (minified) |
| pdf                   | ❌                | ✅                             | ❌            |
| markdown              | ❌                | ✅                             | ✅            |
| html                  | ✅                | ❌ (CDN dependency)            | ❌ (minified) |
| _html + notionBackup_ | ✅                | ✅                             | ✅            |

<br>

_non-html exports:_

- everything that isn't html is inherently lossy. this is because json, markdown and pdf can't express everything that html can (like toggles, nested blocks, etc).

_html exports:_

- html exports are lossless but not editable (minified), require an internet connection (javascript CDN dependency for KaTeX) and have awkward styling thay makes them hard to read.

but this script fixes just that! it makes html exports fully local, editable and pretty.

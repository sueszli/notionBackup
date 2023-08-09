```
    _   __      __  _                ____             __
   / | / /___  / /_(_)___  ____     / __ )____ ______/ /____  ______
  /  |/ / __ \/ __/ / __ \/ __ \   / __  / __ `/ ___/ //_/ / / / __ \
 / /|  / /_/ / /_/ / /_/ / / / /  / /_/ / /_/ / /__/ ,< / /_/ / /_/ /
/_/ |_/\____/\__/_/\____/_/ /_/  /_____/\__,_/\___/_/|_|\__,_/ .___/
                                                            /_/
Make your html exports readable, editable and fully offline – keep them forever.
```

```bash
# clone
git clone https://github.com/sueszli/notionBackup
cd notionBackup

# install dependencies
npm install npm@latest -g
npm install
clear

# show how to use
node notionbackup --help

# test
node notionbackup ./demo/blog.zip
```

<br><br>

| export type             | no data loss      | fully offline                  | editable      |
| ----------------------- | ----------------- | ------------------------------ | ------------- |
| notion API (json)       | ❌                | ✅                             | ✅            |
| web scraping (html)     | ❌ (not reliable) | ❌ (depends on implementation) | ❌ (minified) |
| pdf                     | ❌                | ✅                             | ❌            |
| markdown                | ❌                | ✅                             | ✅            |
| html                    | ✅                | ❌ (CDN dependency)            | ❌ (minified) |
|                         |                   |                                |               |
| **html + notionBackup** | ✅                | ✅                             | ✅            |


Notion is a cloud service. You don't own your data and they could pull the plug on you at any time or change their pricing model.

If you want to export your content to back up, you face some challenges:

- **Markdown exports:** lose data because markdown can't express everything that html can, like toggles, nested blocks, etc. Markdown is not good for exporting.

- **Html exports:** are minified, contain weird css and mess up latex equations because html needs the katex library to render them. This means that you need to format the html code, remove some css and cache the katex library locally for offline backups.

This tool helps you do just that: Fix your html exports.

You just need to:

- export your notion pages as html
- run the script on the export zip

Then your backup will be:

- formatted (easy to edit)
- styled (better than notion's default)
- offline ready (katex is cached locally) → _work in progress!_

But remember that **exports can't go back in:** once you leave notion, you can't return. You can't import your html exports to notion or any other note taking app or html editor that is as good as notion either. So exports are a final decision.

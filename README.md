```
    _   __      __  _                ____             __
   / | / /___  / /_(_)___  ____     / __ )____ ______/ /____  ______
  /  |/ / __ \/ __/ / __ \/ __ \   / __  / __ `/ ___/ //_/ / / / __ \
 / /|  / /_/ / /_/ / /_/ / / / /  / /_/ / /_/ / /__/ ,< / /_/ / /_/ /
/_/ |_/\____/\__/_/\____/_/ /_/  /_____/\__,_/\___/_/|_|\__,_/ .___/
                                                            /_/
future-proof your notion exports
```

notion's default html exports are the only way to get a lossless backup of your data. however, they are not editable, require an internet connection and are styled very differently from the notion web app.

this script fixes all of that by converting your html exports into an (1) editable, (2) fully offline and (3) notion-styled format.

<details>
  <summary> <i> learn more! </i> </summary>

| export type           | no data loss      | fully offline                  | editable      |
| --------------------- | ----------------- | ------------------------------ | ------------- |
| notion API (json)     | ❌                | ✅                             | ✅            |
| web scraping (html)   | ❌ (unreliable)   | ❌ (depends on implementation) | ❌ (minified) |
| pdf                   | ❌                | ✅                             | ❌            |
| markdown              | ❌                | ✅                             | ✅            |
| html                  | ✅                | ❌ (CDN dependency)            | ❌ (minified) |
| _html + notionBackup_ | ✅                | ✅                             | ✅            |

we can differentiate between two types of exports:

*a) non-html exports:* everything that isn't html is inherently lossy. this is because json, markdown and pdf can't express everything that html can (like toggles, nested blocks, etc).

*b) html exports:* html exports are lossless but not editable (minified), require an internet connection (javascript CDN dependency for KaTeX) and are styled very differently from the notion web app.

</details>

# usage

<!-- would be cool to have something like: pip install -e git+https://github.com/sueszli/notionBackup -->

when exporting from notion, remember to select "html" as the export format, enable the "everything" option, "include subpages" and also "create folders for subpages".

```bash
pip install -r requirements.txt

# demo
python notionbackup ./data/all-blocks.zip
python notionbackup ./data/blog.zip
python notionbackup ./data/full-templates.zip
```

```
    _   __      __  _                ____             __
   / | / /___  / /_(_)___  ____     / __ )____ ______/ /____  ______
  /  |/ / __ \/ __/ / __ \/ __ \   / __  / __ `/ ___/ //_/ / / / __ \
 / /|  / /_/ / /_/ / /_/ / / / /  / /_/ / /_/ / /__/ ,< / /_/ / /_/ /
/_/ |_/\____/\__/_/\____/_/ /_/  /_____/\__,_/\___/_/|_|\__,_/ .___/
                                                            /_/
```

Get the most out of your html exports. Unzip, unminify, beautify! 💄💋

<!-- todo: insert screenshot of final product here -->

let's explore different ways of backing up data from notion:

1. _webscraping is unreliable_

    due to limitations such as unscrapable fonts/assets, content variations, and frequent UI changes - i learned that after building [notionSnapshot](https://github.com/sueszli/notionSnapshot/).

2. _markdown export causes data loss_

    because markdown has no formatting options and fewer features than html.

    it's therefore smarter to export to html first and convert the html files to markdown later. this is possible even long after notion is gone.

3. _html export works well – but needs some tweaking!_

    the exported html files of notion are not updatable offline, as they are minified.

    they also style the majority of blocks awkwardly.

    this is where this tool comes in:

    - unzip html exported by notion app
    - prettify html files that are minified (see: https://stackoverflow.com/questions/76512571/how-to-unminify-format-html-without-changing-the-formatting)
    - fix css (ie. the code block font is too small) – i should take a closer look at the notionsnapshot exports
    - rewrite parts of html (ie. file names instead of file paths for assets)

<br>

### Check it out!

Just run the following bash script:

```bash
# clone
git clone https://github.com/sueszli/notionBackup
cd notionBackup

# install dependencies
npm install
clear

# run
node index.js

# example usage
node index.js ./demo/blog.zip
```

<br>

Note: This app enhances the html exports from the Notion app to back up your data. This ensures a reliable backup method, but it does not keep the original appearance of your Notion pages. If you prefer a more aesthetic backup option, you can try “[NotionSnapshot](https://github.com/sueszli/NotionSnapshot)”, which relies on web scraping.

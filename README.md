```
    _   __      __  _                ____             __
   / | / /___  / /_(_)___  ____     / __ )____ ______/ /____  ______
  /  |/ / __ \/ __/ / __ \/ __ \   / __  / __ `/ ___/ //_/ / / / __ \
 / /|  / /_/ / /_/ / /_/ / / / /  / /_/ / /_/ / /__/ ,< / /_/ / /_/ /
/_/ |_/\____/\__/_/\____/_/ /_/  /_____/\__,_/\___/_/|_|\__,_/ .___/
                                                            /_/

An enhancer for your Notion HTML exports.
Unzip, unminify, beautify - Keep forever!
```

<!-- todo: insert screenshot of final product here -->

<br>

Let's explore different ways to back up data from Notion:

1. Web scraping creates beautiful backups but is unreliable due to unscrapable fonts/assets, content variations, and UI changes (see: [notionSnapshot](https://github.com/sueszli/notionSnapshot/)). ❌

2. Exporting to markdown can result in data loss compared to HTML as it is not as expressive as HTML. You can convert HTML to markdown even without Notion. ❌

3. Exporting to HTML works well but requires some tweaking. The exported HTML differs from the Notion app and needs formatting, CSS fixes, and rewriting of file paths for assets. ✅

    <ins>This is where this tool comes in:</ins>

    - unzipping HTML exports
    - formatting minified HTML files (see: [Stack Overflow](https://stackoverflow.com/questions/76512571/how-to-unminify-format-html-without-changing-the-formatting))
    - fixing CSS issues (e.g., adjusting code block font size)
    - rewriting certain parts of the HTML (e.g., file names instead of file paths for assets)

<br><br>

## Check it out!

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

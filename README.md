```
    _   __      __  _                ____             __             
   / | / /___  / /_(_)___  ____     / __ )____ ______/ /____  ______ 
  /  |/ / __ \/ __/ / __ \/ __ \   / __  / __ `/ ___/ //_/ / / / __ \
 / /|  / /_/ / /_/ / /_/ / / / /  / /_/ / /_/ / /__/ ,< / /_/ / /_/ /
/_/ |_/\____/\__/_/\____/_/ /_/  /_____/\__,_/\___/_/|_|\__,_/ .___/ 
                                                            /_/      
```

<br><br><br>

# How to use

Before you begin, please note that this app uses the HTML exports from the notion app to back up your data. This ensures a reliable backup method, but it does not preserve the appearance of the notion page. If you prefer a more aesthetic backup option, you can try “[NotionSnapshot](https://github.com/sueszli/NotionSnapshot)”, which uses web scraping to download every notion page and its asset.
...

<br><br><br>

# Why to use

let's explore different ways of backing up data from notion:

1. _webscraping is unreliable_

   due to limitations such as unscrapable fonts/assets, content variations, and frequent UI changes (i learned that after building [notionSnapshot](https://github.com/sueszli/notionSnapshot/)).

2. _markdown export causes data loss_

   because markdown has no formatting options and fewer features than html.

   it's therefore smarter to export to html first and convert the html files to markdown later. this is possible even long after notion is gone.

3. _html export works well – but needs some tweaking!_
   
   this is where this tool comes in:
   
   - unzip html exported by notion app
   - prettify html files that are minified (see: https://stackoverflow.com/questions/76512571/how-to-unminify-format-html-without-changing-the-formatting)
   - fix css (ie. the code block font is too small)
   - rewrite parts of html (ie. file names instead of file paths for assets)

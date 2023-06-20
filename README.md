let's explore different ways of backing up data from notion:

1. _webscraping is unreliable_

   due to limitations such as unscrapable fonts/assets, content variations, and frequent UI changes (i learned that after building [notionSnapshot](https://github.com/sueszli/notionSnapshot/)).

2. _markdown export causes data loss_

   because markdown has no formatting options and fewer features than html.

   it's therefore smarter to export to html first and convert the html files to markdown later (this is possible even after notion is gone).

3. _html export works well – but needs some tweaking!_

   this is where this app comes in.

   the exported html files are minified and the css is very off (e.g. the code block font is too small).

<br><br><br>

## What will this app do?

this will be a simple desktop app:

1. you export your files on notion
2. you open the app and feed in your zip file
3. it unzips it, formats the html, updates the css and zips it back up again to ask you where to save it

   https://stackoverflow.com/questions/76512571/how-to-unminify-format-html-without-changing-the-formatting

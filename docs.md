## Why this project?

let's explore different ways of backing up data from notion:

1. _webscraping is unreliable_

   due to limitations such as unscrapable fonts/assets, content variations, and frequent UI changes (i learned that after building [notionSnapshot](https://github.com/sueszli/notionSnapshot/)).

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

<br><br>

## What's next?

turns out python sucks for this project. I'm going to rewrite this in node.js with typescript at some point.

(make sure not to delete the `./demo` folder, as it is expensive to upload again with git lfs)

- there are no good html formatters in python (in node.js, there is prettier)
- there are no good css parsers in python

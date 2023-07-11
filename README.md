```
    _   __      __  _                ____             __
   / | / /___  / /_(_)___  ____     / __ )____ ______/ /____  ______
  /  |/ / __ \/ __/ / __ \/ __ \   / __  / __ `/ ___/ //_/ / / / __ \
 / /|  / /_/ / /_/ / /_/ / / / /  / /_/ / /_/ / /__/ ,< / /_/ / /_/ /
/_/ |_/\____/\__/_/\____/_/ /_/  /_____/\__,_/\___/_/|_|\__,_/ .___/
                                                            /_/
Make your html exports readable, editable and fully offline – keep them forever.
```

<br><br>

## Notion: great writing experience, bad backup experience

with notion you don't have to think about anything other than writing. it's a great writing experience.

but there is one issue: you don't own your data and they could pull the plug on you at any time or change their pricing model.

and when you want to export your content, you have to think about a lot of things:

- **markdown exports:** unreliable because they omit data

  - data gets omitted because markdown is less expressive than the html used to store the data. it doesn't support toggle-able elements, nested paragraphs and other blocks. markdown therefore generally shouldn't be used for exporting.

  - if you still decide to use the markdown export feature, you also have to format your content manually because of the redundant `*` characters around bold and italic text.

- **html exports:** break latex equations

  - html can't natively render latex equations. notion uses the katex library for this. this means that you have to cache the katex javascript library that is downloaded via a CDN locally if you want to make truly offline backups of your files.
 
  - you have to also format the minified html code and remove css like `white-space: pre-wrap;`

- **exports can't be imported back in:** once you're out, you're out

  - you can't import your markdown or html exports back into notion and there are no other note taking apps / html editors that are as nice as notion either. once you export the pages it's a lot harder to edit them again. therefore exports are kind of a one-way street.

this tool is here to help you with all of that.

you just have to:

- export your notion pages as html
- run the script

and you will get zip file with all of your pages that are:

- formatted (which makes it editable again)
- styled (slight improvements over notion's default export styling)
- offline ready (katex is cached locally)

<br><br>


## Install

Run the bash script below to get started:

```bash
# clone
git clone https://github.com/sueszli/notionBackup
cd notionBackup

# install dependencies
npm install npm@latest -g
npm install
clear

# run
node notionbackup --help

# example usage
node notionbackup ./demo/blog.zip
```

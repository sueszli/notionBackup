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

## Why this tool?

Notion is a cloud service. Uou don't own your data and they could pull the plug on you at any time or change their pricing model.

If you want to export your content, you face some challenges:

- **markdown exports:** lose data because markdown can't express everything that html can, like toggles, nested blocks, etc. Markdown is not good for exporting.

- **html exports:** mess up latex equations because html needs the katex library to render them. You also need to cache the katex library locally for offline backups, format the html code and remove some css.

This tool helps you with these issues.

You just need to:

- export your notion pages as html
- run the script

And you will get a zip file with your pages that are:

- formatted (easy to edit)
- styled (better than notion's default)
- offline ready (katex is cached locally) → _work in progress!_

But remember that **exports can't go back in:** once you leave notion, you can't return. You can't import your html exports to notion or any other note taking app or html editor that is as good as notion either. So exports are a final decision.

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

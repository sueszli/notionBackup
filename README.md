```
    _   __      __  _                ____             __
   / | / /___  / /_(_)___  ____     / __ )____ ______/ /____  ______
  /  |/ / __ \/ __/ / __ \/ __ \   / __  / __ `/ ___/ //_/ / / / __ \
 / /|  / /_/ / /_/ / /_/ / / / /  / /_/ / /_/ / /__/ ,< / /_/ / /_/ /
/_/ |_/\____/\__/_/\____/_/ /_/  /_____/\__,_/\___/_/|_|\__,_/ .___/
                                                            /_/

A deobfuscator for Notion HTML exports.
Turn your exported files into editable and visually appealing pages – keep them forever.
```

<br>

Notion's HTML exports are minified and obfuscated – just look at this mess:

<img alt="obfuscated" src="https://github.com/sueszli/notionBackup/assets/61852663/7cb89455-db54-446f-a557-651470c9d629">

This project fixes just that and additionally makes the pages prettier by adding some styling.

<br>

## How to use

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

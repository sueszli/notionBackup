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

The HTML files exported through Notion are minified and therefore not editable.

Just look at this mess:

<img width="1261" alt="obfuscated" src="https://github.com/sueszli/notionBackup/assets/61852663/7cb89455-db54-446f-a557-651470c9d629">

This project is the solution you've been waiting for.

<br>

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

This project is a work in progress. Feel free to contribute or open an issue.

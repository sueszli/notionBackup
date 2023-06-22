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

The HTML files exported through Notion are minified and therefore not editable. This script formats them and optionally adds some CSS to make them look better.

<br>

Run the bash script below to get started:

```bash
# clone
git clone https://github.com/sueszli/notionBackup
cd notionBackup

# install dependencies
npm install
clear

# run
node notionbackup --help

# example usage
node notionbackup -o ./demo/blog.zip
```

This project is a work in progress. Feel free to contribute or open an issue.

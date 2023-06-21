```bash
# clone
git clone https://github.com/sueszli/notionBackup
cd notionBackup

# install dependencies
if command -v python3 &>/dev/null; then echo "Python 3 is installed."; else echo "Python 3 is not installed."; fi
python3 -m pip install --upgrade pip > /dev/null
pip3 install pipreqs > /dev/null && rm -rf requirements.txt > /dev/null && pipreqs . > /dev/null
pip3 install -r requirements.txt > /dev/null

# run
python3 notionbackup --help

# example usage
python3 notionbackup ./demo/blog.zip
```

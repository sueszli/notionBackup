# note: avoid lfs if possible. you will be charged for storage on github.

# install lfs (see: https://git-lfs.com/)
git lfs install

# track files
git lfs track "*.zip"
git add .gitattributes

# add and update
git add .
git commit -m "add files via GIT LFS"

# push (make sure to have enough space: https://github.com/settings/billing)
git lfs push --all origin main

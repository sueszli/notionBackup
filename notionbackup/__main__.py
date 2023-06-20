import argparse
import os
import sys
import shutil
from typing import Union
import zipfile
from bs4 import BeautifulSoup, Tag
import html5lib  # implicitly used by bs4
import cssutils

import logging

cssutils.log.setLevel(logging.CRITICAL)  # type: ignore


class ArgParser:
    _parsed_args: Union[argparse.Namespace, None] = None

    @staticmethod
    def get_args() -> argparse.Namespace:
        assert ArgParser._parsed_args is not None
        return ArgParser._parsed_args

    @staticmethod
    def parse() -> None:
        parser = argparse.ArgumentParser()
        parser.add_argument("-s", "--style", help="add additional css to make html prettier", action="store_true")
        parser.add_argument("-z", "--zip", help="zip output back up", action="store_true")
        parser.add_argument("input", help="input path of zip file or directory to enhance")
        args = parser.parse_args()
        ArgParser._validate_path(args.input)
        ArgParser._parsed_args = args

    @staticmethod
    def _validate_path(path: str) -> None:
        if not os.path.isfile(path):
            print("error: input file couldn't be found", file=sys.stderr)
            sys.exit(1)
        if not path.endswith(".zip"):
            print("error: input is not a zip file", file=sys.stderr)
            sys.exit(1)


class NotionBackup:
    output_dir: Union[str, None] = None

    @staticmethod
    def run() -> None:
        NotionBackup._init_output_dir()
        NotionBackup._unzip_input()
        NotionBackup._format_html()

    @staticmethod
    def _init_output_dir() -> None:
        base_dir: str = "./output"

        if os.path.exists(base_dir):
            shutil.rmtree(base_dir)
            print("deleted existing output directory")
        os.mkdir(base_dir)

        filename: str = os.path.basename(ArgParser.get_args().input)
        filename_without_ext: str = filename[:-4]
        os.mkdir(os.path.join(base_dir, filename_without_ext))
        NotionBackup.output_dir = os.path.join(base_dir, filename_without_ext)
        print("created: ", base_dir, "/", filename_without_ext, sep="")

        shutil.copy(ArgParser.get_args().input, os.path.join(NotionBackup.output_dir, filename))
        print("copied input to output directory")

    @staticmethod
    def _unzip_input() -> None:
        assert NotionBackup.output_dir is not None
        path = os.path.join(NotionBackup.output_dir, os.path.basename(ArgParser.get_args().input))
        with zipfile.ZipFile(path, "r") as zip_ref:
            zip_ref.extractall(NotionBackup.output_dir)
        os.remove(path)
        print("unzipped input in output directory")

    @staticmethod
    def _format_html() -> None:
        assert NotionBackup.output_dir is not None
        all_files = [os.path.join(root, file) for root, dirs, files in os.walk(NotionBackup.output_dir) for file in files]
        html_files = list(filter(lambda file: file.endswith(".html"), all_files))

        for file in html_files:
            soup = BeautifulSoup(open(file), "html5lib")
            assert soup.find_all("style").__len__() == 1
            style = soup.find_all("style")[0]
            assert isinstance(style, Tag)

            # see: https://developer.mozilla.org/en-US/docs/Web/CSS/white-space
            css = cssutils.parseString(style.string)
            style_rules = [rule for rule in css if rule.type == rule.STYLE_RULE]
            for rule in style_rules:
                is_body_rule = rule.selectorText == "body"
                is_pre_wrap_css = rule.style.getPropertyValue("white-space") == "pre-wrap"
                if is_body_rule and is_pre_wrap_css:
                    rule.style.setProperty("white-space", "normal")

            fixed_css = str(css.cssText)
            fixed_css = fixed_css.replace("\\n", "\n")
            fixed_css = fixed_css[:-1]
            fixed_css = fixed_css[2:]
            style.string = fixed_css

            pretty_html = str(soup.prettify())
            open(file, "w").write(pretty_html)
            print("formatted:", file)


BANNER_ASCII = """
    _   __      __  _                ____             __
   / | / /___  / /_(_)___  ____     / __ )____ ______/ /____  ______
  /  |/ / __ \\/ __/ / __ \\/ __ \\   / __  / __ `/ ___/ //_/ / / / __ \\
 / /|  / /_/ / /_/ / /_/ / / / /  / /_/ / /_/ / /__/ ,< / /_/ / /_/ /
/_/ |_/\\____/\\__/_/\\____/_/ /_/  /_____/\\__,_/\\___/_/|_|\\__,_/ .___/
                                                            /_/
"""

if __name__ == "__main__":
    os.system("clear")
    print(BANNER_ASCII)

    ArgParser.parse()
    NotionBackup.run()

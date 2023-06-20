import argparse
import os
import subprocess
import sys
from typing import Union


class DependencyManager:
    @staticmethod
    def run() -> None:
        if not os.name == "posix":
            print("error: detected non unix system")
            exit(1)
        python_version = subprocess.run(["python3", "--version"], capture_output=True).stdout.decode("utf-8")
        if not python_version.startswith("Python 3"):
            print("error: detected non python3 system")
            exit(1)

        os.system("python3 -m pip install --upgrade pip > /dev/null")
        os.system("pip3 install pipreqs > /dev/null && rm -rf requirements.txt > /dev/null && pipreqs . > /dev/null")
        os.system("pip3 install -r requirements.txt > /dev/null")


class ArgParser:
    _parsed_args: Union[argparse.Namespace, None] = None

    @staticmethod
    def get_args() -> argparse.Namespace:
        assert ArgParser._parsed_args is not None
        return ArgParser._parsed_args

    @staticmethod
    def parse() -> None:
        parser = argparse.ArgumentParser()
        parser.add_argument("-f", "--format", help="format html and fix css to make it editable", action="store_true")
        parser.add_argument("-s", "--style", help="add additional css to make html prettier", action="store_true")
        parser.add_argument("-z", "--zip", help="zip output back up", action="store_true")
        parser.add_argument("input", help="input path of zip file or directory to enhance")
        args = parser.parse_args()
        ArgParser._validate_path(args.input)
        ArgParser._parsed_args = args

    @staticmethod
    def _parseArguments() -> argparse.Namespace:
        parser = argparse.ArgumentParser()
        parser.add_argument("-f", "--format", help="format html and fix css to make it editable", action="store_true")
        parser.add_argument("-s", "--style", help="add additional css to make html prettier", action="store_true")
        parser.add_argument("-z", "--zip", help="zip output back up", action="store_true")
        parser.add_argument("input", help="input path of zip file or directory to enhance")
        args = parser.parse_args()
        ArgParser._validate_path(args.input)
        return args

    @staticmethod
    def _validate_path(path: str) -> None:
        if not os.path.isfile(path):
            print("error: input file couldn't be found", file=sys.stderr)
            sys.exit(1)
        if not path.endswith(".zip"):
            print("error: input is not a zip file", file=sys.stderr)
            sys.exit(1)


class NotionBackup:
    @staticmethod
    def run() -> None:
        if ArgParser.get_args().format:
            NotionBackup._format_html()
        if ArgParser.get_args().style:
            NotionBackup._style_html()
        if ArgParser.get_args().zip:
            NotionBackup._zip_output()

    @staticmethod
    def _format_html() -> None:
        pass

    @staticmethod
    def _style_html() -> None:
        pass

    @staticmethod
    def _zip_output() -> None:
        pass


BANNER_ASCII = """
    _   __      __  _                ____             __
   / | / /___  / /_(_)___  ____     / __ )____ ______/ /____  ______
  /  |/ / __ \\/ __/ / __ \\/ __ \\   / __  / __ `/ ___/ //_/ / / / __ \\
 / /|  / /_/ / /_/ / /_/ / / / /  / /_/ / /_/ / /__/ ,< / /_/ / /_/ /
/_/ |_/\\____/\\__/_/\\____/_/ /_/  /_____/\\__,_/\\___/_/|_|\\__,_/ .___/
                                                            /_/
"""

if __name__ == "__main__":
    print(BANNER_ASCII)
    # DependencyManager.run()
    ArgParser.parse()
    NotionBackup.run()

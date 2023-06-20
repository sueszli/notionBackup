import argparse
import os
import subprocess
import sys
import shutil
from typing import Union
import zipfile


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
    output_dir: Union[str, None] = None

    @staticmethod
    def run() -> None:
        NotionBackup._init_output_dir()
        NotionBackup._unzip_input()

        if ArgParser.get_args().format:
            NotionBackup._format_html()
        if ArgParser.get_args().style:
            NotionBackup._style_html()
        if ArgParser.get_args().zip:
            NotionBackup._zip_output()

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
        print("created %s/%s" % (base_dir, filename_without_ext))

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
    DependencyManager.run()

    os.system("clear")
    print(BANNER_ASCII)

    ArgParser.parse()
    NotionBackup.run()

# Getting Started

This guide walks you through the steps needed to get the Alan compiler and VM on your local machine. You can also:
- Read, edit and run any of the idiomatic [Alan examples](./advanced_examples.md)
- Read more about [Why we created Alan](https://alan-lang.org/why_alan.html)
- [Contribute to Alan](./contributing.md)

## Installation

For users on Windows, MacOS, and Ubuntu Linux with x86-64 processors, you can [download the Alan executable](https://github.com/alantech/alan/releases), extract it into your `$PATH`/`%PATH%` (eg `/usr/local/bin` on MacOS and Ubuntu, and `C:\Windows` on Windows if you don't want to add a new executable path to your environment variable), and you're ready to go!

For Linux:

```bash
wget https://github.com/alantech/alan/releases/download/v0.1.7/alan-ubuntu.tar.gz
tar -xzf alan-ubuntu.tar.gz
sudo mv alan /usr/local/bin/alan
```

For MacOS:

```bash
curl -OL https://github.com/alantech/alan/releases/download/v0.1.7/alan-macos.tar.gz
tar -xzf alan-macos.tar.gz
# sudo mkdir -p /usr/local/bin if the folder does not exist
sudo mv alan /usr/local/bin/alan
```

For Windows:

```ps1
Invoke-WebRequest -OutFile alan-windows.zip -Uri https://github.com/alantech/alan/releases/download/v0.1.7/alan-windows.zip
Expand-Archive -Path alan-windows.zip -DestinationPath C:\windows
```

### Source Installation

If you wish to contribute to Alan, or if your operating system and/or CPU architecture do not match the above, you'll need a development environment to build Alan locally:

* git (any recent version should work)
* Node.js >=10.20.1
* Rust >=1.45.0
* A complete C toolchain (gcc, clang, msvc)

Once those are installed, simply:

```bash
git clone https://github.com/alantech/alan
cd alan
make
sudo make install
```

## Writing a Hello, World! Example

After installation, first create a file named `hello_world.ln` and then write the following within it:

```rust,editable
import @std/app

on app.start {
  app.print("Hello, World!");
  emit app.exit 0;
}
```

Now compile the code to produce an AGC binary and then run it which prints `Hello, World!`:

```bash
alan compile hello_world.ln hello_world.agc
alan run hello_world.agc
```

If your binary output size is very large and you don't mind the slight increase in startup time, you can also compile to AGZ for a gzipped version of the binary that can also be run directly:

```bash
alan compile hello_world.ln hello_world.agz
alan run hello_world.agz
```

You can also run the source file directly:

```bash
alan hello_world.ln
```

which will internally compile the code then run it, but you have to pay the compilation costs on each run.

## Syntax Highlighting

We support syntax highlighting for [some](https://github.com/alantech/alan/issues/257) text editors and are actively working to add more. Contributions are most welcome.
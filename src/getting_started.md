# Getting Started

This definitely needs to be reworked. Copied from the old documentation. Not going to rework until we have this story completely straightened out, though.

## Dependencies

This project depends on `gradle` and `antlr v4` and is being developed on a Debian-based Linux distribution. To install the necessary dependencies, run:

```
> apt install gradle antlr4
```

If you wish to build the documentation, you also need `pandoc` and `xelatex`, and a simple:

```
> apt install pandoc texlive-xetex
```

should work.

## Build

Once the dependencies are installed, simply run:

```
> gradle build
```

To build the project.

For the documentation, run:

```
> gradle docs
```

## Install

Once the project is built, you can run:

```
> sudo gradle install
```

to install `alan`.

## Usage

To use the interpreter, use the `alan` command. It has two sub-commands at this moment `run` and `debug`, plus `help` to tell you this. The `debug` command prints out metadata about the file in question, how it tokenized and parsed the context, useful only while developing the language itself. Most usage is through the `run` sub-command, like so:

```
> alan run examples/hello_world.ln
```


# Getting Started

It is planned to have a web compiler in the future to automatically generate Javascript that can be evaluated and run, which would allow you to try out Alan with zero steps, but for now, you need to install it from source.

## Prerequisites

- Rust v1.76.0 or higher (recommend [rustup](https://rustup.rs/) to install this)
- Git ([Windows users should probably use this](https://git-scm.com/download/win), Mac and Linux users ought to know how to install git)

## Source Installation

Currently, the only way to install `alan` is to build it from source:

```bash title="Installation shell commands"
git clone https://github.com/alantech/alan
cd alan
cargo install --path .
```

## Usage

Let's make a Hello, World! program:

```bash title="Hello World shell commands"
echo 'export fn main = print("Hello, World!");' > hello_world.ln
alan compile hello_world.ln
./hello_world
```

This should print something like:

```
Done! Took 1.13sec
Hello, World!
```

The first line being the compiler telling you how long it took to build the program and the second line being the actual program output.

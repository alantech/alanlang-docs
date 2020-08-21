# Getting Started

This guide walks you through the steps needed to get the Alan compiler and runtimes on your local machine. To work on Alan itself, see [Contributing to Alan](./contributing.md). To learn more about Alan, see [Why we created Alan](https://alan-lang.org/why_alan.html).

## Installation

Node.js is required, with a minimum version of 10.20.1, to install `alan-compile`, run:

```bash
npm i -g alan-compile
```

Rust is required, with a minimum version of 1.41.1 to install `alan-runtime`, run:

```bash
cargo install alan-runtime
```

## Writing a Hello, World! Example

After installation, first create a file named `hello_world.ln` and then write the following within it:

```rust,editable
import @std/app

on app.start {
  app.print("Hello, World!")
  emit app.exit 0
}
```

Now run:

```bash
alan-compile hello_world.ln hello_world.agc
```

This will produce an AGC binary that can be run by the `alan-runtime` like this:

```bash
alan-runtime run hello_world.agc
```

which prints `Hello, World!`.
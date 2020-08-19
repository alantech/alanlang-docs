# Getting Started

This guide walks you through the steps needed to get the Alan compiler and runtimes on your local machine. To work on Alan itself, see [Contributing to Alan](./contributing.md).

## Prerequisites

As Alan is not self-hosting, other languages runtimes are necessary for the compiler and runtimes. For `alan-compile` and `alan-js-runtime` Node.js is required, with a minimum version of 10.20.1. For `alan-runtime` Rust is required, with a minimum version of 1.41.1.

## Installation

To install `alan-compile`, run:

```bash
npm i -g alan-compile
```

To install `alan-js-runtime`, run:

```bash
npm i -g alan-js-runtime
```

To install `alan-runtime`, run:

```bash
cargo install alan-runtime
```

## Writing a Hello, World! Example

Assuming you have installed all three components above, first create a file named `hello_world.ln` and then write the following within it:

```rust,editable
import @std/app

on app.start {
  app.print("Hello, World!")
  emit app.exit 0
}
```

Next run:

```bash
alan-compile hello_world.ln hello_world.js
```

This will produce a JS file that depends on the `alan-js-runtime`. With it globally installed, you can simply run:

```bash
node hello_world.js
```

which prints `Hello, World!`

Now run:

```bash
alan-compile hello_world.ln hello_world.agc
```

This will produce an AGC binary that can be run by the `alan-runtime` like this:

```bash
alan-runtime run hello_world.agc
```

which also prints `Hello, World!` but much faster. Performance varies, but as an example:

```bash
time node hello_world.js
Hello, World!

real    0m0.094s
user    0m0.075s
sys     0m0.021s
$> time alan-runtime run hello_world.agc
Hello, World!

real    0m0.008s
user    0m0.001s
sys     0m0.016s
```

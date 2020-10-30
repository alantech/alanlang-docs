# Transpile Alan to Javascript

Run Alan in the browser or Node.js.

## Prerequisites

For `alan-js-runtime` Node.js is required, with a minimum version of 10.20.1.

## Installation

To install `alan-js-runtime`, run:

```bash
npm i -g alan-js-runtime
```

## Writing a Hello, World! Example

Once everything is installed, first create a file named `hello_world.ln` and then write the following within it:

```rust,editable
import @std/app

on app.start {
  app.print("Hello, World!")
  emit app.exit 0
}
```

Next run:

```bash
alan compile hello_world.ln hello_world.js
```

This will produce a JS file that depends on the `alan-js-runtime`. If it is globally installed, you can simply run:

```bash
node hello_world.js
```

which prints `Hello, World!`
# Getting Started

This guide walks you through the steps needed to get the `alan` compiler and runtimes on your local machine. To work on `alan` itself, see [Contributing to `alan`](./contributing.md).

## Prerequisites

As `alan` is not self-hosting, other languages runtimes are necessary for the compiler and runtimes. For `alan-compile` and `alan-js-runtime` Node.js is required, with a minimum version of 10.20.1. For `alan-runtime` Rust is required, with a minimum version of 1.41.1.

## Installation

To install `alan-compile`, run:

```bash
npm i -g @alantech/alan-compiler
```

To install `alan-js-runtime`, run:

```bash
npm i -g @alantech/alan-js-runtime
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

### Comparing Hello, Worlds

If you peek at generated Javascript, you may think that comparison is unfair, when you see something like this being what it runs:

```js
const r = require('alan-js-runtime')
const _e332e563_7301_4665_ad53_9a3444ba5571 = "Hello, World!"
const _f0b689c1_4d9b_42c5_b134_1aec3e1fe535 = "\n"
const _59772927_cc4c_443d_9ad7_101e3d33f8e9 = 0
r.on('_start', async () => {
    const _f379f964_34d5_47f6_b674_8f5c6a79a8db = r.catstr(_e332e563_7301_4665_ad53_9a3444ba5571, _f0b689c1_4d9b_42c5_b134_1aec3e1fe535)
    r.emit('stdout', _f379f964_34d5_47f6_b674_8f5c6a79a8db)
    r.emit('exit', _59772927_cc4c_443d_9ad7_101e3d33f8e9)
  })
r.on('stdout', async (out) => {
    const _46c022ed_9427_4fcd_a73d_8c1fa6832984 = r.stdoutp(out)
  })
r.on('exit', async (status) => {
    const _47773080_2a4a_4c42_a54a_00acf2e42264 = r.exitop(status)
  })
r.emit('_start', undefined)
```

However the performance penalty of the compiler output and js-runtime is much less than you'd imagine.

If you write a `hello_world_native.js` file with the following contents:

```js
console.log("Hello, World!")
```

and then time that:

```bash
time node hello_world_native.js
Hello, World!

real    0m0.088s
user    0m0.074s
sys     0m0.016s
```

You see that the majority of time is spent on Node.js VM spinup and teardown, not parsing or running the code in this example.

This means `alan`'s runtime overhead is significantly lower than most other languages with runtimes. For example, Java with the following `HelloWorld.java`:

```java
public class HelloWorld {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}
```

produces a runtime of:

```bash
time java HelloWorld
Hello, World!

real    0m0.081s
user    0m0.081s
sys     0m0.039s
```

only a few milliseconds faster than Node.js despite not needing to parse the AST of the code to be run.

`alan`'s startup time compares more closely to statically-compiled languages like Rust, for example this `hello_world.rs` file:

```rust
fn main() {
  println!("Hello, World!");
}
```

produces a runtime of:

```bash
time ./hello_world 
Hello, World!

real    0m0.003s
user    0m0.003s
sys     0m0.001s
```

`alan` is still very young, so it will not win all of the performance benchmarks, but the language is designed to be able to get very close while being easier to work with than regular systems languages.

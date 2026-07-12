# Alan CLI

The `alan` command-line interface is your entry point for compiling, transpiling, testing, bundling, and formatting Alan programs.

## Prerequisites

- **Rust** (v1.92.0+) and **Cargo** — required for `compile`, `test`, and `to-rs`
- **Node.js** v22.0.0 or higher and a package manager — required for `bundle`, `to-js`, and `test --js`. The compiler prefers **pnpm** when available (it's faster than **npm** and **yarn**), then falls back to **yarn**, and finally **npm**.

You can install `alan` by building from source:

```bash
git clone https://github.com/alantech/alan
cd alan
cargo install --path alan
```

## Commands

### Default (run mode)

Running `alan` with only a source file and no subcommand compiles and executes the program on-the-fly:

```bash
alan [LN_FILE]
```

| Argument | Default | Description |
|---|---|---|
| `LN_FILE` | *(none)* | The `.ln` source file to compile and run |

This mode uses a fast, unoptimized compilation profile (`--profile interp`) to produce a native binary, runs it immediately, and deletes the binary when the program exits. Stdout and stderr are forwarded to the terminal, and the exit code is preserved.

```bash title="Run a program directly"
alan hello_world.ln
```

Source files with a shebang line can also be made directly executable:

```bash title="Shebang support"
#!/usr/bin/env alan
export fn main = print('Hello, World!');
```

```bash
chmod +x hello.ln && ./hello.ln
```

### `compile`

Compiles a `.ln` source file to a native executable.

```bash
alan compile [LN_FILE]
```

| Argument | Default | Description |
|---|---|---|
| `LN_FILE` | `./index.ln` | The `.ln` source file to compile |

The compiler transpiles the Alan source to Rust, then invokes `cargo build --release` to produce a native binary. The output executable is placed in the current directory, named after the source file (e.g. `hello_world.ln` produces `./hello_world`).

```bash title="Compile and run a program"
alan compile hello_world.ln
./hello_world
```

### `bundle`

Compiles a `.ln` source file to a self-contained JavaScript web bundle.

```bash
alan bundle [LN_FILE]
```

| Argument | Default | Description |
|---|---|---|
| `LN_FILE` | `./index.ln` | The `.ln` source file to compile |

The compiler transpiles to JavaScript, installs dependencies (using **pnpm** if available, otherwise **yarn**, otherwise **npm**), then bundles everything with Rollup (IIFE format, minified with Terser). The output is placed in the current directory as `<name>.js`. This JavaScript toolchain requires Node.js v22.0.0 or higher.

```bash title="Compile a web bundle"
alan bundle app.ln
# Produces app.js
```

### `test`

Compiles a `.ln` source file in test mode, runs it, and cleans up afterward.

```bash
alan test [LN_FILE...]
alan test --js [LN_FILE...]
```

| Argument | Default | Description |
|---|---|---|
| `LN_FILE...` | *(discover)* | One or more `.ln` source files to compile in test mode. When omitted, every `.ln` file under the current directory that exports a `fn{Test} main` entry point is discovered and run in sequence. |

| Flag | Description |
|---|---|
| `--js`, `-j` | Run tests via JavaScript (Node.js) instead of natively |

Without `--js`, the program is compiled to a native binary and executed. With `--js`, it is transpiled to JavaScript and executed with Node.js (v22.0.0 or higher). In both cases, the test artifact is deleted after the test completes.

```bash title="Run specific test files"
alan test my_project.ln
alan test foo.ln bar.ln baz.ln
alan test --js my_project.ln
```

When run with no target, `alan test` recursively searches the current directory for `.ln` files that export a test-only `main` (`export fn{Test} main` or `export{Test} fn main`) and runs each in sequence. The `target`, `node_modules`, `dependencies`, `.git`, and `.cargo` directories are skipped. When more than one test file is run—whether discovered or named explicitly—each is preceded by a `Testing ./path/to/file.ln...` line so the source of any failure is clear.

```bash title="Discover and run all tests under PWD"
alan test
```

During compilation, `ALAN_TARGET` is set to `test`, which makes the `Test` type evaluate to `true`. The easiest way to write test-only code is to use `fn{Test} main = ...` as the entry point.

### `to-rs`

Transpiles a `.ln` source file to Rust source code.

```bash
alan to-rs [LN_FILE]
```

| Argument | Default | Description |
|---|---|---|
| `LN_FILE` | `./index.ln` | The `.ln` source file to transpile |

Writes the generated Rust code to `<name>.rs` in the current directory. If the program has external dependencies, a `Cargo.toml` file is also generated.

```bash title="Transpile to Rust"
alan to-rs my_program.ln
# Produces my_program.rs (and Cargo.toml if deps exist)
```

### `to-js`

Transpiles a `.ln` source file to JavaScript source code.

```bash
alan to-js [LN_FILE]
```

| Argument | Default | Description |
|---|---|---|
| `LN_FILE` | `./index.ln` | The `.ln` source file to transpile |

Writes the generated JavaScript to `<name>.js` in the current directory. If the program has external dependencies, a `package.json` file is also generated.

```bash title="Transpile to JavaScript"
alan to-js my_program.ln
# Produces my_program.js (and package.json if deps exist)
```

### `fmt`

Formats `.ln` source files according to the canonical Alan style.

```bash
alan fmt FILE-or-DIR [FILE-or-DIR...]
alan fmt --check FILE-or-DIR...
```

| Argument | Description |
|---|---|
| `FILE-or-DIR...` | One or more `.ln` source files or directories to format. Directories are searched recursively for `.ln` files. |

| Flag | Description |
|---|---|
| `--check` | Check formatting without writing changes; exits with code 1 if any file differs |

```bash title="Format all .ln files in a directory"
alan fmt src/
```

```bash title="Format specific files"
alan fmt src/main.ln src/lib.ln
```

```bash title="Check formatting (CI/lint)"
alan fmt --check .
```

In `--check` mode, a colored unified diff is printed to stdout for each file that would be changed. The command exits with code 1 if any file needs formatting.

### `install`

Installs project dependencies defined in a `.dependencies.ln` file.

```bash
alan install [DEP_FILE]
```

| Argument | Default | Description |
|---|---|---|
| `DEP_FILE` | `./.dependencies.ln` | The install script for project dependencies |

!!! warning "Not yet implemented"
    This command is reserved for future use and currently returns an error.

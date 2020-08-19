### @std/cmd

Also very bare, only a single type `ExecRes`, and a function: `exec` with the signature:

```rust,ignore
type ExecRes {
  exitCode: int64
  stdout: string
  stderr: string
}
```

```rust,ignore
exec(string): ExecRes
```

It simply executes the provided shell string and returns the outputs from it.

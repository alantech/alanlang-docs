### @std/cmd

Also very bare, only a single type `ExecRes`, and a function: `exec` with the signature:

```alan
type ExecRes {
  exitCode: int64
  stdout: string
  stderr: string
}
```

```alan
exec(string): ExecRes
```

It simply executes the provided shell string and returns the outputs from it.

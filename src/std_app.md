### @std/app

There are three concepts currently in `app`, process start and exit management, `stdout` writing, and `stderr` writing.

If your application needs to trigger explicit execution on startup (eg, it's not a web server) then you would register a listener on the `start` event:

```alan
event start: void
```

When you want to terminate the process, you would emit an exit code at the `exit` event:

```alan
event exit: int8
```

To write to `stdout` you either directly emit strings to the `stdout` event:

```alan
event stdout: string
```

Or you can call `print` with any type that matches the `Stringifiable` interface:

```alan
fn print(Stringifiable): void
```

`print` automatically appends a newline character to the output.

To write to `stderr` you either directly emit strings to the `stderr` event:

```alan
event stderr: string
```

Or you can call `eprint` with any type that matches the `Stringifiable` interface:

```alan
fn eprint(Stringifiable): void
```

`eprint` automatically appends a newline character to the output.

Eventually process arguments and stdin will be accessible here, but this is not yet the case.

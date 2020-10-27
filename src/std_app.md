### @std/app

Currently very bare, only a single `print` function that takes all of the basic types and puts it on the console, and three events `start`, `exit`, and `stdout`. `start` intended to be handled by the user as it is automatically emitted *once* and `exit` to be emitted by the user when the program should finish. `stdout` is for more direct streaming of characters to standard out.

The formal declarations:

```alan
fn print(Stringifiable): void
```

```alan
event start: void
```

```alan
event exit: int8
```

```alan
event stdout: string
```


### @std/app

Currently very bare, only a single `print` function that takes all of the basic types and puts it on the console, and threeevents `start`, `exit`, and `stdout`. `start` intended to be handled by the user as it is automatically emitted *once* and `exit` to be emitted by the user when the program should finish. `stdout` is for more direct streaming of characters to standard out.

The formal declarations:

```rust,ignore
fn print(Stringifiable): void
```

```rust,ignore
event start: void
```

```rust,ignore
event exit: int8
```

```rust,ignore
event stdout: string
```


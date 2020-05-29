### @std/app*

Currently very bare, only a single `print` function that takes all of the basic types and puts it on the console, and two events `start` and `exit`, with `start` intended to be handled by the user as it is automatically emitted *once* by the interpreter and `exit` to be emitted by the user when the program should finish and is automatically handled by the interpreter to terminate the application.

The formal declarations:

`fn print(int8 | int16 | int32 | int64 | float32 | float64 | bool | string): void`

`event start: void`

`event exit: int8`

Eventually things like printing to `stderr` will be added, being able to print without an automatic newline attached, reading from `stdin` after I figure out how I want to expose that at all (since it has a non-deterministic time, I'm currently thinking it'll be an event you can listen to), and getting the `argv` array and `env` variables it was executed with in POSIX-like environments.

Almost *all* of these will be non-functional in the SaaS product, though (or perhaps should have mocks involved?) so I would prefer if most third-party libraries ignored them.

#### Proposed changes

Instead of making these non-functional in the SaaS product, they should just behave differently. `start` is only run once per cluster deploy, `exit` terminates the entire cluster. `print` will be reimplemented on top of events, as well.

New features:

`event stdout: string`

`event stderr: string`

`event stdin: string`

Process stdout/err/in are event sources (or sinks). In the OSS runtime they behave as expected, in the SaaS cluster they're used for logging to a dashbaord (and maybe even allowing a side-channel input in the same dashboard via `stdin`?)

`print` in this case becomes something like:

```
interface Stringifiable {
  toString(Stringifiable): string
}

fn print(val: Stringifiable) {
  emit stdout val + "\n"
}
```

Other metadata about the application in general ought to be accessed here. I don't have a full idea of what should be here, but getting stats on CPU usage, memory usage, file descriptors, event loop queue depth, etc.


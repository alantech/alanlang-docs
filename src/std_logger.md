### @std/logger*

Why `logger` when you already have `print`? For proper warning levels and so on. Each of the logger functions are wrappers around constructing a `Log` struct, a `log` event, and there is also a built-in `toString` function for it as well, so you can configure it to go to `stdout` with a simple:

```
on log print
```

Or not include that and instead have something else handle the logs for you (like going to LogDNA, Datadog, etc). List of potential events, types, and functions:

```
type Log {
  level: string // or an enum type? or an integer?
  message: string
  metadata: Map<string, Stringifiable> // took this from the Node loggers, not sure if desirable
}
```

`event log Log`

`fn toString(Log): string`

`fn debug(string, Map<string, Stringifiable>)` and `fn debug(string)`

`fn log(string, Map<string, Stringifiable>)` and `fn log(string)`

`fn warn(string, Map<string, Stringifiable>)` and `fn warn(string)`

`fn error(string, Map<string, Stringifiable>)` and `fn error(string)`

`fn fatal(string, Map<string, Stringifiable>)` and `fn fatal(string)`

The `toString` function simply converts the `Log` entry into a string. 

The logger functions automatically set the appropriate `level`, then set the message string and optionally metadata for the log. The `fatal` function also emits an `exit` event.


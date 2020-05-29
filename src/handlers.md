#### Handlers

Handlers are what are triggered by events emitted to the event loop. They are the functions that are at the root of all stacks in `alan`. Like many languages with event loops, multiple handlers can exist for a single event.

Event handler functions *must* always have a `void` return. From the perspective of the language, handlers are self-contained side-effects, because it is unclear where a returned value should even go.

Handlers can only be registered at the module level, not within a function. This is both to discourage abuse of the event loop and make sure that the potential workload on future events is knowable and known by all instances across a distributed cluster so execution planning can take that into consideration. 

For example, once compiled, the list of event handlers would be a static, known value, with known execution time ranges for each, and then the size of the event loop queue can be considered when determining the execution plans: should it focus on event throughput at the expense of latency, or optimize for event processing latency if there are extra resources available? The interpreter in its current state does none of this, but this is why it is designed the way it is.

The event handler syntax is relatively simple:

```
on eventName function
```

where `eventName` is the name of the event to register a handler for and `function` is either the name of a function, or an in-line defined function, eg:

```
on event fn namedHandler(argument: eventType) {
  ...
}
```

for a fully-named in-line defined function with an event payload. Without a payload, the argument list can be dropped:

```
on event fn namedHandler {
  ...
}
```

In both cases, the name is also optional because it is being registered immediately:

```
on event fn (argument: eventType) {
  ...
}
```

or

```
on event fn {
  ...
}
```

The latter purely-side-effect-only function can also omit the `fn` if desired as it is unambiguous in this context:

```
on event {
  ...
}
```

##### Special Events: @std/app.start, @std/app.exit, and @std/app.stdout

There are events that are particularly special for `alan`. The `start`, `exit`, and `stdout` events in the `@std/app` standard library module. They are separated from the built-ins because most modules should not need to ever touch them, but the root module of your project will.

When `alan` has finished loading your code and has the event loop set up, it emits a single `start` event (of type `void`). That should trigger a special function used to set up the rest of your program: loading configuration, starting up an http server, or what have you.

Once the event loop is running, it will run forever. Only if an `int8` value (the exit code, where 0 is successful and anything else is an error) is emitted to the `exit` event will the process tear itself down and terminate.

If you want to write raw text to `stdout` you can `emit` to a string to it (this is what the `print` function does, but with an appended newline character after converting your argument to a string).

This is why basically all of the small examples import these events from `@std/app`, but most modules in most larger projects never will.


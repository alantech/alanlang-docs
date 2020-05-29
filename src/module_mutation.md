#### Mutation

Sometimes a third-party library or even a module you have written yourself needs to have its behavior adjusted, and simply defining new functions to use in method syntax is not enough to accomplish it. This can often be with respect to complex integration tests where you want to demonstrate the whole path works, but then "plug up the ends" and prevent actual mutations to escape your test suite.

`alan` does not allow loops in the module dependency graph, it must be a directed acyclic graph, but it does have a special exception for a module attempting to import "itself." In this case, the module will instead "skip over" itself and look across the rest of the `modules` and `dependencies` elsewhere in the graph for what it should pull in. This allows for defining a wrapper module that can export the same (or different) types, functions, etc but with different behavior, something in between a mock and the real thing (or something that intercepts a logger and also attaches stats tracing to it, as an example where this could be used in production).

This would work similarly in that only code that sees the `modules` directory containing this wrapper module would get the behavior, so to do an integration test using it, you need to wrap (or just symlink if left unchanged) all modules involved in the integration test. A bit more difficult, but doable.


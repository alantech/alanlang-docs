#### Mutation and Permissions

Sometimes a third-party library or even a module you have written yourself needs to have its behavior adjusted, and simply defining new functions to use in method syntax is not enough to accomplish it. Perhaps you wish to modify the types involved or prevent an internal event from being registered.

`alan` does not allow loops in the module dependency graph, it must be a directed acyclic graph, but it does have a special exception for a module attempting to import "itself." In this case, the module will instead "skip over" itself and look across the rest of the `modules` and `dependencies` elsewhere in the graph for what it should pull in. This allows for defining a wrapper module that can export the same (or different) types, functions, etc but with different behavior, something in between a mock and the real thing (or something that intercepts a logger and also attaches stats tracing to it, as an example where this could be used in production).

This would work similarly in that only code that sees the `modules` directory containing this wrapper module would get the behavior, so to do an integration test using it, you need to wrap (or just symlink if left unchanged) all modules involved in the integration test.

This allows re-exporting the "same" module to your codebase after partial modification of it, and is even permitted on the standard library modules.

This mechanism can be used to deny third party libraries access to parts of the standard library you are not comfortable with. By simply creating a `modules` directory within the third-party dependency and then defining an `std/app.ln` file that re-exports non-functional versions of the types, functions, and events of the original standard library, you can prevent that library from being able to use standard library features you would not expect them to have access to. For instance, if you have imported a very popular utility library for, say, curve fitting. You would not expect it to want to have access to your filesystem or creating a child process, so you could inject nonfunctional mocks of `@std/fs` and `@std/cmd`.

It is intended to eventually make this kind of permissioning logic a built-in operation in the `@std/deps` standard library, but it is another piece of functionality that falls out of `alan`'s dependency resolution.

### @std/deps

This library provides code to manage the dependencies of an `alan` project.

It exports one event, `install` that scripts managing dependencies should use instead of `start`.

It also exports one function `add`, with the following signature:

```
add(string): void
```

This function takes the given string, treats it as a `git` URL and acquires the specified repository. Currently assumes a Github-like URL format ending with `accountName/projectName.git` and uses this namespacing to place the git repository into the project dependency tree such that it is accessible to import as `@accountName/projectName`.

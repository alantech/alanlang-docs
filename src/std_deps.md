### @std/deps

This library provides code to manage the dependencies of an Alan project.

It exports one event, `install` that scripts managing dependencies should use instead of `start`.

```alan
event install: void
```

It also exports two functions `add`, and `commit` with the following signature:

```
add(string): void
commit(): void
```

The `add` function takes the given string, treats it as a `git` URL and acquires the specified repository. Currently assumes a Github-like URL format ending with `accountName/projectName.git` and uses this namespacing to place the git repository into the project dependency tree such that it is accessible to import as `@accountName/projectName`. The `commit` function indicates that all changes to the dependency tree are done and allows the dependency management program to commit and close out.

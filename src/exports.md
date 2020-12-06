#### Exports

The `export` syntax can only be used at the module level, which means it is impossible to have non-deterministic exports. While this can be annoying with collating files that simply import files to only re-export all of their contents, it eliminates whole classes of ambiguity where certain functions, types, etc are only available depending on the state of the runtime environment.

Constants, types, functions, operators, events, and interfaces are exportable while event handlers are not. (However, importing a module that registers event handlers will cause a side-effect of including those event handlers in your application.)

This can either be done in-line with the declaration of the item in question:

```alan
export const foo: bool = true;
```

Or it can be done by referencing the name of the thing to be exported after it has been declared:

```alan
type Foo {
  bar: string,
  baz: bool
}

export Foo
```

Both styles produce identical results: the exported item is accessible both within the module and by any other module that imports it.


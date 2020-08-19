#### Imports

To import the exports of other modules, Alan provides two different syntaxes to select the exports to import. There are also two different syntaxes to identify the module you wish to import from. These two syntaxes are completely interchangeable leading to four different syntactic combinations.

##### Identifying Modules

Let's start with the module identifying syntax. That would be either:

```
./some/module
```

or:

```
@some/module
```

The first form begins with a `./` or a `../` and is a `relative import`. It simply traverses your filesystem and looks for the appropriate module, which would be named either `./some/module.ln` or `./some/module/index.ln`. The latter allows for simplifying transitions if a module has grown too big to be a single file, anymore, or for more advanced module mocking/intercepting that will be covered in more depth in the Modules section below.

The second form begins with an `@` and is a `named import`. It uses a more advanced search pattern that will be discussed in detail in the [Module Resolution](./module_resolution.md) section. This is useful for referencing third-party code and your own code that is a cross-cutting concern for many modules in your project, like a custom logging wrapper module.

##### Importing Modules

Once you've identified the module you want to import, now it's time to decide how you want to import it. There's the basic scoped import and the "plucking" unscoped import. These syntaxes are essentially lifted wholesale from Python:

```rust,ignore
import @std/http
import ./my/module as myModule
from @std/app import start, print as println, exit
```

Simply stating `import ./some/module` will automatically create a new variable named "module" (the text after the last slash, or after the `@` if no slashes at all).

The exported items are accessible with the conventional dot notation, like `module.someFunction()`.

Sometimes the automatically-generated import name is going to collide with another module, or sometimes you just don't think it's a descriptive name, so you have the option to rename it within your module using the `as newName` syntax.

If you write `from ./some/module import var1, var2, ...` you will pull the exported variable directly out of the export scope and place it within your module scope with that name, and you also have the option to ue the `as newName` syntax on any of these imports, as well.

That's it.

Those with experience in other module-based languages may be wondering where the `*` syntax is. That has been intentionally left out. It makes reading your own module more difficult as it can be unclear, especially when there are multiple `*` imports, where a specified name came from.

The exception is when a data structure and a collection of functions and operators that work on that data are bundled together. Needing to explicitly import each of those separately would be painful, so when importing an `interface`, if that module defines a type and all functions and operators needed for that type and also exports them, Alan will automatically pull those along as well in a quasi-Class-like fashion.

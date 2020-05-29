#### Imports

To import the exports of other modules, `alan` provides two different syntaxes to select the exports to import. There are also two different syntaxes to identify the module you wish to import from. These two syntaxes are completely interchangeable leading to four different syntactic combinations. This sounds more complicated than it actually is.

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

The second form begins with an `@` and is a `named import`. It uses a more advanced search pattern, searching the current directory and up recursively in the `modules` and `dependencies` directories for the specified module, where the module name at that point otherwise matches the relative path, so translated to `relative` it could look something like: `./modules/some/module.ln` or `../../dependencies/some/module/index.ln`.

The second form is useful for referencing third-party code and your own code that is a cross-cutting concern for many modules in your project, like a custom logging wrapper module. Placing these files in a root-level `modules` directory can let you easily reference them everywhere without needing to worry about where you currently are in the directory hierarchy and without needing to maintain it as a separate library in a separate repository and then published and available in a module registry (public or private) and then installed through the language package manager and updated after every update to the  as is the case if you want the same benefits in Node, Ruby, Python, etc.

##### Importing Modules

Once you've identified the module you want to import, now it's time to decide how you want to import it. There's the basic scoped import and the "plucking" unscoped import. These syntaxes are essentially lifted wholesale from Python:

```
import @std/http
import ./my/module as myModule
from @std/app import start, print as println, exit
```

Simply stating `import ./some/module` will automatically create a new variable named "module" (the text after the last slash, or after the `@` if no slashes at all).

The exported items are accessible with the conventional dot notation, like `module.someFunction()`.

Sometimes the automatically-generated import name is going to alias another module, or sometimes you just don't think it's a descriptive name, so you have the option to rename it within your module using the `as newName` syntax.

If you write `from ./some/module import var1, var2, ...` you will pull the exported variable directly out of the export scope and place it within your module scope with that name, and you also have the option to ue the `as newName` syntax on any of these imports, as well.

That's it.

Those with experience in other module-based languages may be wondering where the `*` syntax is. That has been intentionally left out. It makes reading your own module more difficult as it can be unclear, especially when there are multiple `*` imports, where a specified name came from.

The general effect of `*` imports (not needing to adjust the import statement when new features are added) can be achieved by using the scoped import form.

The advantage to those new to the language is immediate: *anything* they see in a module that is not explicitly defined was defined by the language, either as syntax or a built-in function/type/operator/etc, which will make looking up unknowns more fruitful for these users, and forces an explicit lookup location that's still useful for more advanced users.


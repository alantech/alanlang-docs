# An Overview of Alan

If you've written code in a popular, high-level typed programming language like [Typescript](https://www.typescriptlang.org/), [Swift](https://developer.apple.com/swift/), [Rust](https://www.rust-lang.org/), and to a less extent a class-based language like [C#](https://learn.microsoft.com/en-us/dotnet/csharp/), it should be pretty easy to get up-to-speed with Alan.

## Properties of the Language

Alan is strictly-typed, with a type system [based on the Curry-Howard correspondence](https://en.wikipedia.org/wiki/Curry%E2%80%93Howard_correspondence). This means values are not nullable by default, though you can explicitly add that back in with the `Maybe{T}` generic type (using Julia's generic syntax style to allow `<` and `>` to be used as operators in the type system, more on that later), or simply combine it with the Typescript-style `myType | void` enumeration.

### Memory

Memory allocation and deallocation is handled for you, and values are passed-by-reference to functions, though you can `var.clone()` any variable to make sure you're working with a separate copy.

### Functions

Functions are currently fully typed, with the form `fn optionalName (arg1: Type1, arg2: Type2) -> ReturnType`, while a function *type* for higher-order functions (functions that are passed other functions to call) is just the type portion: `(Type1, Type2) -> ReturnType`. It is intended for the return type to be inferrable, in the future, but this is not yet implemented.

### Variables

Variable declarations *are* type inferred, however. You can just `let foo = 5;` or `const bar = "bay";` and it will determine the correct type for the variable. Unlike most languages that have type inference for variables, there are no exceptions here: it will *always* infer the correct type for the variable. How? This is because Alan is not a true [Turing-complete](https://en.wikipedia.org/wiki/Turing_completeness) language.

### No Recursion / Unbounded Iteration

Alan does not allow recursive functions or types (though you are allowed to `bind` such things fromm the host language), and it only has guarded looping constructs, such as calling `map` on `Array`s, but no generalized `while` or `for` loops.

Because of this (and because bound functions and types are required to be fully typed on Alan's side), the impact on the typing of variable is fully discovered during compilation, so you never *need* to specify the type. You are allowed to do, so, though, as an assertion to the compiler to fail if the generated type does not match your expectations.

### Generic Types and Functions

Types and Functions can be generic, which allows the "realization" of the concrete type or function to happen later. Like Rust, these generic types and functions produce distinct types and functions afterwards, so a generic function operating on 100 different types in your codebase will generate 100 different functions in the resulting binary.

### Conditional Compilation / Generic Keywords

Unlike most languages, the top-level keywords in an Alan source file are optionally generic, accepting a compile-time boolean to determine whether or not they are actually evaluated during compilation. This is combined with compile-time types to access files and environment variables and perform comparisons within the type system to enable conditional compilation, such as `fn{Test} ...` to define a function that only exists when `alan test ...` is run, or `type{Windows} ...` to define a platform-specific variant of a type.

*All* top-level keywords have this feature, but the keywords within a function or type definition do not, but you can simply define the same function or type twice, once for the default and once for the optional variant, where the variant can override the default definition, based on the order it appears in the evaluation.

### Function (and Type) Dispatch

In Alan, duplicate definitions have a simple tie-breaker: the most recent definition (furthest down the source file) wins. So if you were to make a Windows-specific type or function, you would define it after you define the default case.

But what is considered a duplicate is more fine-grained than most languages. In most languages you can only define a specific function name once, but Alan's function dispatch also considers the input argument types when choosing a function to call, so you can define an `fn add(a: i64, b: i64) -> i64 ...` and an `fn add(a: i32, b: i32) -> i32` and they will not collide with each other, both can be used based on the input arguments given.

### Closure Functions

Closure functions exist in Alan, but with a slight twist: they enclose external variables, but the references to the enclosed variables are immutable. If you want to mutate the value you must first `clone` it, which then guarantees that it will not affect the value in the outer scope. This makes closures more "pure" and also makes it possible to use them in parallel algorithms, which you can explicitly opt into swapping `map` with `parmap`, and the intention is to *automatically* swap when the compiler can be *sure* there will be a performance benefit.

### Modules

Alan uses a module-style of code organization, with each source file being a different module, where these files are able to export values for use by other modules and import values from other modules. The module resolution logic of the Alan compiler makes defining overrides for your own dependencies simpler (more on that later), and combined with the conditional compilation above, it's trivial to swap out for mocks of your dependencies by having an `import{Test}` statement after your `import` statement.

### Methods and Operators as Syntactic Sugar

And that's it for the foundation of the language. The rest of the features of the language are simply syntactic sugar. When you call a function on a variable, you could call it as `foo(bar)` or `bar.foo()` or even `bar.foo` (because that function is effectively a property of the input variable, and this is actually how all struct-like variable properties are implemented under the hood, with the compiler then recognizing and rewriting back to the simple pointer offset arithmetic later).

If the `foo` function was bound to a prefix or postfix operator, say `@`, you could also call it as `@bar` or `bar@` and that will *also* call the function.

Two argument functions can be called with `foo(bar, baz)` or `bar.foo(baz)`, and if bound to an infix `@` as `bar @ baz`.

### Type Operators also Syntactic Sugar

Types work similarly. A type defined `Foo{T}` can be called as `Foo{Bar}` or it could be bound to a type prefix or postfix operator, say `@`, and become `@Bar` or `Bar@`. And a two-arg type `Foo{A, B}` can be called as `Foo{Bar, Baz}` or bound to an infix operator, say `@`, and become `Bar @ Baz`. There is no method syntax for types right now, but could easily be added if desired.

In fact, all of the type syntax is built on top of just this: `|` is just an operator for the `Either{A, B}` type to construct a [sum type](https://en.wikipedia.org/wiki/Tagged_union), and even `,` is an operator for the `Tuple{A, B}` type to construct a [product type](https://en.wikipedia.org/wiki/Product_type), etc.

### Type Constructors and Accessors are just Functions

When you want to construct a struct-like product type, such as:

```rs title="A simple product type"
type Foo =
  bar: i64,
  baz: string;
```

You simply use the type name as a function, with the arguments matching the types of the `Tuple`: `let foo = Foo(5, 'baz')`. To access the values out of it, the `Field` names are used, eg `foo.bar` or `baz(foo)` to access it.

For sum types such as:

```rs title="A simple sum type"
type Foo = i64 | string;
```

You construct it by passing one *or the other* value type: `let foo1 = Foo(5); let foo2 = Foo("baz");`. Then you can get the integer by calling `foo1.i64.getOrExit`.

This one is a bit more complicated. Since the type can be either an `i64` or a `string`, when you call the `i64` property it can't always return an `i64`. It instead returns an `i64?` (or `Maybe{i64}` or `i64 | void`). The `Maybe{T}` type has a `getOrExit` function that will return the wrapped value or terminate the program if it is not present.

You could also call `foo1.i64.getOr(3)` for a non-terminating call where you provide a default value if the desired value is not present, and you can call `foo1.i64.exists` to return a boolean `true` or `false` to decide whether or not `foo1` has an `i64` value or not, which you can use in a conditional statement, instead.

All of the foundational types produce constructors and accessors to work with them, and as they are all standard functions in the language, you can use them as methods or even operators in certain circumstances, eg `5?` immediately creates a `Maybe{i64}` with a value of `5` stored within it.

But what if you wanted to construct a type without giving it a name to call? The type operators overlap (significantly) with the normal operators within a function, so to eliminate the ambiguity, an inline-defined type needs to be wrapped with `{}` when constructing it, eg `{i64 | string}(5)` produces the same sum type with a value of `5`.

Generic types can be called without the outer `{}` if called by name instead of operator, eg `Array{i64}(1, 2, 3)` works and is equivalent to `{i64[]}(1, 2, 3)`.

Generic type constructor functions (as well as generic functions) can *sometimes* have their generic type inferred (only when the generic types can be inferred from the input argument types and do not depend on the return type). This is true for Arrays, so you could *also* just write `Array(1, 2, 3)` in this case.

### Syntax as Syntactic Sugar

Many other syntactic constructs in the language are also syntactic sugar.

Arrays can be defined with `[val1, val2, ...]` syntax instead of `Array{i64}(val1, val2, ...)`.

Arrays can be accessed with `myArray[myIndex]` in place of `myArray.get(myIndex)`. Unlike in Rust, these are identical so you will need to unwrap the `Maybe{T}` that it returns, but you can opt into the "crash on error" by slapping `.getOrExit` on the end.

This bracket accessor syntax works for three-or-more arguments, as well. A `myMatrix[row, col]` would be equivalent to `myMatrix.get(row, col)`, making matrix operations clearer and more idiomatic.

Re-assignment to a variable with `foo = bar` is equivalent to `foo.store(bar)`. (Not `set` so as not to be confused with the `Set` constructor function for sets. So the re-assignment could itself return a value, which could then be operated on, such as determining if the assignment actually succeeded with a `Fallible{T}` return type.

It is planned for conditionals to also have such syntactic sugar, with `if conditional { trueStatements; } else { falseStatements }` being transformed into `cond(conditional, fn { trueStatements; }, fn { falseStatements })` (with rewriting conditional returns to absorb the statements following the conditional in the non-return branch, as all functions in Alan *must* execute every statement). But for now there is only the set of `cond` functions you can call for conditional logic. (May or may not rename `cond` to `if`, as well.)

A `for .. in` syntax is *not* planned, because while it would still be controlled, it would heavily *imply* that mutation of the outer scope is allowed, which makes automatic parallelization of the loop impossible due to the state dependency between iterations that would fail when execution order is no longer guaranteed. It feels like a potential footgun for those familiar with other languages to have the syntax but have it work differently to the other languages, though with it being blocked at compile time, I am not 100% against it and could be convinced to add it.

### Extensible Syntax Behavior

Because the vast majority of syntax just boils down to function calls (operators, array accessors, conditionals), and functions are dispatched by name *and* argument types, it is easy to alter the *behavior* of the syntax as you see fit. If you want to make string concatenation use `+`, you just need to define `fn add(a: string, b: string) = a.concat(b);` and now any module *that has this in scope* will allow `'Hello, ' + "World!"` to *just work.*

Alan uses this for the GPGPU-related types. An `i32` is a 4-byte integer value, while a `gi32` is a complex type representing the AST to generate a WGSL shader. There are three `add` functions defined with that `gi32` type in mind. `fn add(a: gi32, b: gi32) -> gi32` to produce an updated shader AST combining the AST fragments of the other two `gi32`s, while `fn add(a: gi32, b: i32) -> gi32` and `fn add(a: i32, b: gi32) -> gi32` lets you seamlessly mix in some "normal" integers you computed on the CPU into the shader definition without needing to explicitly cast it.

### Minimized Extensibility Blast Radius

This is not such a big deal, but there's also extra functionality for `cond` to accept a `gbool` conditional type instead of just a `bool` type, and this one behaves very differently: At AST generation time, we can't know which path will be followed on the GPU; in fact, we probably want it to follow both paths across the entire set of data we're operating on depending on the particular value, so this `cond` evaluates both the true and false callbacks and returns a new AST node to produce the conditional we want the GPU to execute.

There is no ALGOL-like language (that I am aware of) that allows for this kind of extensibility to the *meaning* of the syntax. This kind of extensibility *can* be abused, but it is also the only way to truly integrate GPU and CPU computing seamlessly.

But unlike other languages that have attempted to allow this kind of extensibility, Alan keeps the "blast radius" much lower -- you have to opt-in to the behavior by either writing the function yourself or explicitly `import`ing the function that overrides the syntax behavior, so it's very clear to anyone reading the code what might be different from what you're expecting.

### Maximized Fluency

Unlike [prototype pollution](https://learn.snyk.io/lesson/prototype-pollution/) in Javascript, adding a new method to a type you're working with in the current source file has zero impact on what methods are available to that same type in a different file. There is no risk of accidentally altering the behavior of code far away from where the new behavior was added, but all of the benefits of being able to easily execute methods or access "properties" from a type that weren't included in the original definition as a developer persist, and the explicitness within the language's grammar about this makes figuring out what such-and-such method does trivial.

If you've defined a new type and want array accessor syntax to work for it, you just need to define a `get` function and then it just works. If you're a developer *looking* at array accessor syntax, you know you just need to find the `get` functions for that type to see what it's actually doing under-the-hood.

If you've created a union type, say `type maybeStrInt = string | i64 | void`, you've set the initial definition to `void` with a bare construction: `let myVal = maybeStrInt();` and later on you re-assign `myVal = 5;`, you know that the automatically-generatd `store` function for the `maybeStrInt` type defined the store functions of: `fn store(a: maybeStrInt, b: maybeStrInt)`, `fn store(a: maybeStrInt, b: string)`, `fn (a: maybeStrInt, b: i64)`, and `fn (a: maybeStrInt)` (last one for the `void` path) so you can easily update the value and have it auto-cast wrap into your type.

You can make the code as terse as you want, but you are required to leave an explicit declaration in your code somewhere such that anyone familiar with the small core of rules for Alan's syntax can see what you did, and these changes cannot infect any other source file without an explicit opt-in via an `import` statement at the top.

Teams can go as deep as they want on their own DSL without needing to worry much on getting new developers up to speed.

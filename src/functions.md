#### Functions

Functions are where actual work happens. There are built-in functions and user-defined functions. The user-defined functions consist of a sequence of statements composing other functions, operators, types, etc.

##### Function Declarations

Declaration of functions works like so:

```alan
// A named function with two arguments and a particular return type
fn functionName (firstArgument: argumentType, secondArgument: anotherType): returnType {
  ...statements...
}

// The return type can always be inferred in Alan so it is optional
fn functionName(firstArgument: argumentType, secondArgument: anotherType) {
  ...statements...
}

// This s a named function that does not return a value, so it has a return type of void
fn functionName (firstArgument: argumentType, secondArgument: anotherType): void {
  ...statements...
}

// If you have a named function with no return arguments but want to annotate the return type
// you must include empty parens when defining it
fn functionName (): returnType {
  ... statements...
}

// But if you do not care about annotating the return type, you can omit it and immediately start
// the open brace for the function
fn functionName {
  ...statements...
}

// If the function is a single statement that is returned, it can be written with a shorthand syntax
fn addOne(i: int64) = i + 1

// This syntax can be annotated with the return type, but that is unlikely to improve clarity
fn subtractOne(i: int64): int64 = i - 1

// Anonymous functions can only be used as an assignable value either to a variable
const anonymousFunction = fn (firstArg: argType, secondArg: anotherType): returnType {
  ...statements...
}

// Or being passed into a higher-order function
const doubled = someArray.map(fn (val: int64) = val * 2)

// In situations where a function takes no arguments and it is unambiguous, the function can be
// represented solely with the curly braces
on eventname {
  ...statements...
}

// Equivalent to:
on eventname fn (): void {
  ...statements...
}
```

##### Function Dispatch

Alan uses multiple dispatch for determining which function to use when a function name is called. This means that the argument types and count are taken into consideration. Multiple functions with the same name may be declared as long as the argument types and/or counts are different between them. For example:

```alan
fn someFn (arg1: string, arg2: bool): string {
  ...
}

fn someFn (arg1: int64, arg2: float64): int64 {
  ...
}
```

If you provide a `string` and `bool` to `someFn` it will use the first definition, and if provided an `int64` and `float64` it will use the second, while if you use any other combination of argument types or number of arguments, it will fail to compile.

##### Function Type

A function's type is simply `function` right now. The compiler will complain if the provided function's argument signature does not match the types the higher-order function expects, but it is not clearly documented by the type signature, itself. It is intended to expand this to use a syntax allowing more precise argument matching when passing functions to higher-order functions, so the user can know what arguments and return type their function is expected to have. This type syntax is proposed to look like:

```
fn (firstType, secondType): returnType
```

Essentially the argument list with only the types specified and the return type. In this case, the parenthesis and `void` would be required to prevent ambiguity (and keep it easier to follow), so a side-effect-only function type would look like this:

```
fn (): void
```

Because type names are specified in very specific situations, the extra colon and space in the type name should not be unambiguous to the compiler.

##### Function Calls

One of the kinds of statements you can write inside of a function is a function call. There are actually two syntaxes for function calls, standard form and method form.

Standard form looks like this:

```alan
add(3, 2)
```

while method form looks like this:

```alan
3.add(2)
```

Method form allows you to pull the first argument out of the function and treat the function call like an Object-Oriented Language's method syntax. This allows method chaining, which can be much more legible when the output of one function is the input of the next, without requiring a custom chaining syntax that some functional languages have adopted (eg `|>` in F#). Eg, `3.add(2).mul(5).mod(3)` is equivalent to `mod(mul(add(3, 2), 5), 3)`.


#### Functions

Functions are where actual work happens. There are built-in functions and user-defined functions. The user-defined functions consist of a sequence of statements composing other functions, operators, types, etc.

##### Function Declarations

Declaration of functions works like so:

```
fn functionName (firstArgument: argumentType, secondArgument: anotherType): returnType {
  ...statements...
}
```

This is a named function with a name, some arguments, and a return type.

```
fn functionName (firstArgument: argumentType, secondArgument: anotherType): void {
  ...statements...
}
```

This is a named function that does not return any value.

```
fn functionName (): returnType {
  ... statements...
}
```

This is a named function that takes no arguments but returns a value.

```
fn functionName {
  ...statements...
}
```

This is a named function that takes no arguments and returns no value. (So side-effects only.)

```
const anonymousFunction = fn (firstArg: argType, secondArg: anotherType): returnType {
  ...statements...
}
```

This is an anonymous function that takes arguments and returns a value. Anonymous functions can only be assigned to variables or immediately passed to other syntax that takes a function (event handlers, conditionals, or as an argument to another function).

```
const anonymousArglessFunction = fn (): returnType {
  ...statements...
```

This is an anonymous function that takes no arguments and returns a value.

```
const anonymousSideEffectFunction = fn {
  ...statements...
```

This is an anonymous function that takes no arguments and returns no value (side-effect only).

```
on eventname {
  ...statements...
}
```

When an anonymous, argumentless, no-return function is defined inline with event handlers or conditionals, it is unambiguous to omit the `fn` so it is allowed in these conditions.

##### Function Dispatch

When determining which function to use in a function call (more on calls later), the argument types and count are taken into consideration. Multiple functions with the same name may be declared as long as the argument types and/or counts are different between them. For example:

```
fn someFn (arg1: string, arg2: bool): string {
  ...
}

fn someFn (arg1: int64, arg2: bool): int64 {
  ...
}
```

If you provide a `string` to `someFn` it will use the first definition, and if provided an `int64` it will use the second.

This means it is possible to alias/replace even built-in functions within your module scope. **This is dangerous.** If you are not aware that, for instance, the `+` operator is also called `add` as a function, and define your own `add` function that works on numbers, you'll find things are very broken. I think I will add warnings or errors on aliasing built-in functions (where the original can no longer be accessed because it perfectly matches the type signatures), but currently you're on your own here.

##### Function -arity

`alan`'s interpreter has the ability to use functions with `n`-arity, functions where the last argument is actually treated as an array of an arbitrary length of the same type. This is used to implement the `concat` built-in function, allowing an arbitrary number of `string`s to be concatenated together. The syntax in the language does not allow that *yet* as it depends on the `Array` special type to be fully functional, first. Eventually, the expected syntax will look something like this:

```
fn narityFunction(arg1: type1, ...arg2: Array<type2>): returnType {
  ...statements...
}
```

where the last argument is allowed to have the `...` syntax to indicate that the function should expect 0 or more of these elements in the call and automatically box them into an array of that type (or if the last element provided *is* an array of that type, just use it as-is).

##### Function Type

A function's type is simply `function` right now. It is intended to expand this to use a syntax allowing more precise argument matching when passing functions to higher-order functions, so the user can know what arguments and return type their function is expected to have. This type syntax would look like:

```
(firstType, secondType): returnType
```

Essentially the argument list with only the types specified and the return type. In this case, the parenthesis and `void` would be required to prevent ambiguity (and keep it easier to follow), so a side-effect-only function type would look like this:

```
(): void
```

Because type names are specified in very specific situations, the extra colon and space in the type name should not be unambiguous to the interpreter.

##### Function Calls

One of the kinds of statements you can write inside of a function is a function call. There are actually two syntaxes for function calls, standard form and method form.

Standard form looks like this:

```
add(3, 2)
```

while method form looks like this:

```
3.add(2)
```

Method form allows you to pull the first argument out of the function and treat the function call like an Object-Oriented Language's method syntax. This allows method chaining, which can be much more legible when the output of one function is the input of the next, without requiring a custom chaining syntax that some functional languages have adopted (eg `|>` in F#). Eg, `3.add(2).mul(5).mod(3)` is equivalent to `mod(mul(add(3, 2), 5), 3)`.


# Learn Alan

Let's go through some examples of Alan code, starting from the classic `"Hello, World!"` to advanced types and GPGPU computing.

## Hello, World!

In Alan, you write to the terminal with `print`, and the entry point to all Alan programs is a function named `main` that must be `export`ed so it is public and callable. It can look like this:

```rs
export fn main() {
  print("Hello, World!");
}
```

The function takes no arguments and we didn't declare what it returns, but we could have declared that it returned nothing by instead writing:

```rs
export fn main() -> void {
  print("Hello, World!");
}
```

`void` is itself a simple alias for `()` - a grouping of nothing, which coincidentally is what the arguments were, making this the same thing:

```rs
export fn main() -> () {
  print("Hello, World!");
}
```

When a function takes no input and returns no output (making it a purely side-effect function), we can elide all of that type information and just write:

```rs
export fn main {
  print("Hello, World!");
}
```

And when a function consists of a single statement, we can state that the function is equal to that statement, and we can reduce it to just:

```rs
export fn main = print("Hello, World!");
```

Which is the version of the `"Hello, World!"` program included in the [Getting Started](getting_started/index.md) guide.

## Method and Property Syntax

In Alan, there are no methods on classes or properties on types. There are only functions. But you can choose to use any function with method syntax if that improves the legibility, and certain functions can be used with property syntax, which is a special case of method syntax.

Method syntax allows you to specify the first argument, followed by a dot (`.`), then followed by the function name and parenthesis.

```rs
export fn main {
  "Hello, World!".print();
}
```

If there's more than one argument to a function, the remaining arguments are included in the parenthesis.

```rs
export fn main {
  1.add(2).print(); // Prints 3
}
```

When the function takes a single argument, it may also be used in property syntax, where the parenthesis are elided.

```rs
export fn main = "Hello, World!".print;
```

This makes more sense for the accessor functions on your types, but can also be useful to allow a "property" to continue to exist for a type even when the value is no longer directly stored in the type.

## Variables

In Alan, variables are declared with `let` and `const`. `let` variables may have their value changed, while `const` variables are immutable the moment they are assigned. This means `let` variables can be re-assigned, while `const` cannot.

```rs
export fn main {
  let message = "Hello, World!"; // Ok
  print(message); // Prints Hello, World!
  const response = "Hello to you, developer!"; // Ok
  print(response); // Prints Hello to you, developer!
  message = "Goodbye, World!"; // Ok
  print(message); // Prints Goodbye, World!
  response = "Goodbye, developer!"; // Compiler error
  ...
```

!!! tip

    For developers coming from Javascript, the behavior of `const` is stricter. Even if you don't re-assign the variable but instead just wish to mutate it, like `pop`ing a value off of an array, a variable defined `const` will fail to compile in that situation.

There is a built-in `clone` function in Alan that lets you make a copy of *any* variable, so if you find yourself wanting to mutate a value that was provided as a `const`, you can simply `let` assign its `clone`.

```rs
let myMutableVariable = myConstant.clone();
```

## Primitive Types

Alan has many built-in types, but a few of them are considered "primitive." These are types that have a special representation in the language itself: `int`, `float`, `bool`, `string`, and `void`.

!!! note

    `int` and `float` are currently actually `i64` and `f64`. It is planned to have automatic coercion of the integer and float syntactic constructs into the "best" int and float type as determined by type inference, but this has not yet been done. They are always automatically coerced to their 64-bit representations and the user must explicitly cast to a smaller type if desired.

### Integers

Integers in Alan have several different valid representations: Base 10, Base 2, Base 8, and Base 16.

Base 10 are simply the regular 10 digits, `0..9` in any order desired.

```rs
let five = 5;
```

Base 2, 8, and 16 require a leading `0` followed by `b`, `o`, and `x`, respectively, and then the digits involved.

```rs
let two     = 0b10;
let eight   = 0o10;
let sixteen = 0x10;
```

For all of the integer types, underscores are allowed to be inserted to act as separators for easier reading of the numbers:

```rs
let million = 1_000_000;
let lakh = 1_00_000;
```

Alan doesn't care where the understores are inserted, so place them anywhere that makes sense to you. The only restriction is that you can't have a leading underscore.

Because the other base types are generally used when doing bitwise arithmetic, they do not have a negative representation, only base-10 has this syntactic feature:

```rs
let negative_five = -5;
```

### Floats

Floating-point numbers have two representations: Decimal and Scientific Notation.

```rs
let decimal    = 12.34;
let scientific = 1.234e1;
```

In scientific notation, the `e` separates the base number from the exponent in the formula `base * 10^exponent`, and is conventionally written with a singular digit followed by the decimal point then followed by the remaining digits.

Both decimal and scientific notation allow for negative numbers, while scientific notation also allows for negative exponents.

```rs
let decimal    = -0.02;
let scientific = -2e-2;
```

### Booleans

Booleans are simply the bare keywords `true` and `false`. Other types do not automatically coerce into booleans, so there's no "truthy" `0` is `false`, `>=1` is `true` kind of behavior in the language. (At least, by default. More on that later.)

### Strings

Strings in Alan can be written with either single-quotes (`'`) or double-quotes (`"`), escaping is done with backslash (`\`) so you can still write a single-quote in a single-quoted string with (`\'`) and vice-versa for double-quotes (`\"`). Therefore to write a backslash you need two of them (`\\`).

This should feel familiar for many developers out there, but what may be less familiar is that all strings are multi-line, so:

```rs
"Hello,
World!"
```

is valid. You can still write `\n` instead of a literal newline if that makes the string look nicer to you, but it isn't necessary.

### Void

The `void` type represents nothing (but it likes to stare). It's not useful on its own, but can be made useful in conjunction with sum types (more on that later). It's also an alias for `()`, an empty tuple (more on tuples later).

Suffice it to say, you're not likely to work with the `void` type *directly*, but it's very useful in keeping bugs out of your code.

## Type Aliases

Types are defined similarly to single-statement functions, but with `type` instead of `fn`.

```rs
type Foo = i64;
```

This is the simplest type definition in Alan, a type alias. It provides **zero** type safety guards over using the original type that is aliased. The compiler strips all aliasing when checking whether or not an input value can be passed to the function in a function call, so only use them if it is more convenient in your code or clearer to read.

They do become more convenient when defining your own types, though.

## Product Types (Tuples and Structs)

Product Types let you group multiple values together and pass them around together in your code.

### Tuples

The simplest is a tuple.

```rs
type myTuple = i64, string;
```

!!! note

    All type statements in Alan are resolved into a functional style. `type myTuple = i64, string;` can also be written as `type myTuple = Tuple{i64, string};` The `,` symbol, except within the generic argument parameterization, is a **type operator** for the `Tuple{A, B}` type function.

    You can define your own type functions (AKA generic types) and type operators to extend type system, but be careful about legibility of the resulting code.

When you define types in Alan, constructor and accessor functions are created automatically for you to create types and retrieve values from them. `myTuple` automatically defines a constructor function named `myTuple`, and accessor functions `0` and `1` to access the individual elements of the tuple.

You can use the `myTuple` type like this:

```rs
type myTuple = i64, string;

export fn main {
  let testTuple = myTuple(1, "test");
  testTuple.0.print; // Prints 1
  testTuple.1.print; // Prints test
}
```

!!! note

    The grammar of Alan disallows defining a function that starts with a number to avoid ambiguity with numeric constants, which makes tuple accessor functions special. That makes them the only functions that can *only* be called with accessor syntax, as calling them as regular functions is similarly ambiguous.

This also demonstrates why type aliases are simply *aliases* and not explicitly used for type checking, as tuples can be anonymously constructed:

```rs
export fn main {
  let testTuple = (1, "test"); // Constructs an identical type as `myTuple`
  testTuple.0.print; // Prints 1
  testTuple.1.print; // Prints test
}
```

!!! note

    This syntax is not *yet* implemented, but intended to be implemented before Alan v0.2.0 releases. TODO: Delete this note!

### Structs

Structs are the same as tuples, except they have names for the different sub-types that you can use to access them. A simple struct is defined as:

```rs
type myStruct = foo: i64, bar: string;
```

Statements (both type statements and function statements) are allowed to be multi-line, so this can also be written as:

```rs
type myStruct =
  foo: i64,
  bar: string;
```

You can then use the `myStruct` type like this:

```rs
export fn main {
  let testStruct = myStruct(1, "test");
  testStruct.foo.print; // Prints 1
  testStruct.bar.print; // Prints test
}
```

As you can see, construction of the type is identical, while property accessing now goes by the field names for each struct type.

!!! note

    The `myStruct` function that the compiler generates names the first and second argument `foo` and `bar`, respectively, and it is intended in a future release of Alan to allow calling functions where arguments are passed in any order, labeled by the argument names. This would allow struct-like constructor functions to be called like:

    ```rs
    let testStruct = myStruct(
      foo: 1,
      bar: "test",
    );
    ```

    which would be more familiar for users coming from other languages and more forgiving of argument order.

### Structuples?

The field names in structs are just a syntactic sugar. You may also still access the values with the tuple-specific numeric property accessors.

```rs
type myStruct = foo: i64, bar: string;

export fn main {
  let testStruct = myStruct(1, "test");
  testStruct.foo.print; // Prints 1
  testStruct.1.print; // Prints test
}
```

You can also mix-and-match labeling fields in your "struct."

```rs
type myStructTupleHybrid = i64, bar: string;

export fn main {
  let testHybrid = myStructTupleHybrid(1, "test");
  test.0.print; // Prints 1
  test.bar.print: // Prints test
}
```

Under the hood, they all become tuples and the field names are just syntactic sugar for you.

!!! question "Why's it called a 'Product Type'?"

    If you consider a type as a Set of all possible values, then a `bool` is a Set of two possible values: `true`, and `false`.

    It then follows that a tuple `bool, bool` has four possible values: `true, true`, `true, false`, `false, true`, and `false, false`. Then a tuple `bool, bool, bool` has eight possible values, etc. So tuples and structs are larger Sets whose sizes are the products (multiplications) of the sizes of all of the input Sets.

### Anonymous Type Construction

Struct-style syntax shows how type aliases make it more convenient to use them. If we didn't have the aliasing mechanism, we would need to include the full definition of the struct on every construction. The following is valid (but awkward) syntax to do so:

```rs
export fn main {
  let myAwkwardStruct = {foo: i64, bar: string}(1, "test");
  myAwkwardStruct.foo.print; // Prints 1
  myAwkwardStruct.bar.print; // Prints test
}
```

You can directly construct a type definition by wrapping it in curly braces (`{}`). This may be useful for a type you want to keep fully internal to a function definition and not ever share it at all with any other code in your codebase, but is more likely to be used to allow you to construct a generic type inside a generic function. (More on that, later.)

## Sum Types (Type Unions, Maybe, Fallible, and Tagged Unions)

Sum Types let you define values that are one of set of potential values.

### Type Unions

The simplest version is a type union.

```rs
type intOrString = i64 | string;
```

!!! note

    Equivalent to `type intOrString = Either{i64, string};`

This type differs from the product types in that it creates multiple constructor functions. In this case two of them, one for each constituent type:

```rs
type intOrString = i64 | string;

export fn main {
  let mightBeInt = intOrString(5);
  let mightBeStr = intOrString('test');
}
```

Both constructor functions get the same name as the type while the function dispatch logic figures out which one to call based on the input type provided. If you provide a value that doesn't match any of the constituent types, it will fail to compile.

```rs
type intOrString = i64 | string;

export fn main {
  let mightBeBool = intOrString(true); // Fails to compile
}
```

But if you want, you can make a custom constructor function for any type that converts into the type, by just defining that function.

```rs
type intOrString = i64 | string;

fn intOrString(b: bool) -> intOrString = b.string.intOrString;

export fn main {
  let mightBeBool = intOrString(true); // Now works
}
```

It also creates two accessor functions, one for each constituent type:

```rs
type intOrString = i64 | string;

export fn main {
  let mightBeInt = intOrString(5);
  let mightBeStr = intOrString('test');
  mightBeInt.i64.exists.print; // Prints true
  mightBeInt.string.exists.print; // Prints false
  mightBeStr.i64.exists.print; // Prints false
  mightBeStr.string.exists.print; // Prints true
}
```

The accessor functions get the names of the types, but they don't return that type *directly*. The actual stored value may or may not be the type you're requesting, so what it returns instead is a `Maybe{T}` type.

### The Maybe Type

You can create your own `Maybe` type easily by just adding a `?` to the end of the type.

```rs
type maybeInt = i64?;
```

It's short enough that *maybe* you'll choose to just use it anonymously when you need it.

```rs
export fn main {
  let maybeVal = {i64?}(5);
  ...
```

This type is actually just

```rs
type Maybe{T} = Either{T, ()};
```

making it another type union, but it has a few special functions for it that make it possible to actually acquire the inner value and not iterate through an infinite set of property accessors that return new `Maybe{T}` values. These are `exists`, `getOr`, and `getOrExit`.

* `exists` returns a boolean telling you whether or not the `Maybe` has an actual value, and is the one used in the examples above.
* `getOrExit` returns the value within the `Maybe` *or* it immediately shuts down the program. Only use this if you're absolutely certain of the consequences.
* `getOr` is a function that takes two arguments, the `Maybe` and a default value if there's no value inside. This is the safer option to take, but only if your code can actually deal with a default value correctly.

Replacing the `exists` in the prior example with `getOr` calls gives us:

```rs
type intOrString = i64 | string;

export fn main {
  let mightBeInt = intOrString(5);
  let mightBeStr = intOrString('test');
  mightBeInt.i64.getOr(3).print; // Prints 5
  mightBeInt.string.getOr('value').print; // Prints value
  mightBeStr.i64.getOr(3).print; // Prints 3
  mightBeStr.string.getOr('value').print; // Prints test
}
```

### The Fallible Type

There is a type that is closely related to the `Maybe` type, but is *slightly* different. That's the `Fallible{T}` type.

It's defined as:

```rs
type Fallible{T} = Either{T, Error};
```

and has the same three functions, `exists`, `getOr`, and `getOrExit`, but also the `Error` accessor function. It's useful when you have an operation that should *normally* do the right thing, but *could* fail, and that you may want to get the details of why it failed.

You can construct a fallible type with a postfix `!` on the base type name.

```rs
export fn main {
  let usuallyInt = {i64!}(5);
  ...
```

Some of the built-in functions return `Fallible{T}` values, such as the integer construction functions when accepting a `string` as the input type. `i32("blargh")` should not return a valid integer.

### Tagged Unions

As Structs are to Tuples, so Tagged Unions are to Type Unions. Field names on sum types are also allowed, and they affect the constructor and accessor behavior. They also let us distinguish between `i64` and... `i64`.

```rs
type intInput = computed: i64 | parsed: i64 | gigo: string;
```

Here we have a type representing an integer input, perhaps from an old-school web form. We distinguish between values that were computed server-side from values parsed from the client side and... other values that weren't parseable.

We can access the inner types by the field names, `computed`, `parsed`, and `gigo`, and they'll return `Maybe{i64}` and `Maybe{string}`, depending on which one is called.

But we can't have the constructor function just be `fn intInput(i64) -> intInput` and `fn intInput(string) -> intInput`. Which `i64` would we be assigning to?

In this situation, we need to re-apply the field name within the constructor function call, eg:

```rs
let value = intInput({computed: i64}(5));
```

This is a bit awkward looking, but works. Type aliases can help here, though.

```rs
type computed = computed: i64;
type parsed = parsed: i64;
type gigo = gigo: string;
type intInput = computed | parsed | gigo;

export fn main {
  let value = intInput(computed(5));
}
```

Giving the labeled types their own alias then lets us use it in the type union and use each piece as a constructor function makes this more ergonomic to use at the cost of more type definitions.

This also demonstrates how tagged unions in Alan are equivalent to single-value product types.

!!! question "Why's it called a 'Sum Type'?"

    Similar to the reasoning behind Product Types, a Sum type is composed of multiple Sets, but the allowed value can only be from one of the Sets at a time. So a `bool` is a set of two possible values: `true`, and `false`, while a `u8` is the set of all natural numbers from `0` to `255` (256 in total), so a type `bool | u8` would be 2 + 256 = 258 distinct values.

## Buffer Types

A Buffer Type is a special version of a Tuple, where every element is exactly the same type. It let's you save some typing.

```rs
type fiveInts = i64[5]; // Equivalent to Buffer{i64, 5}
```

This produces two different types of constructor functions as well as the integer-ordered property accessors. One constructor function requires an argument value for each location, and the other takes a single value and assigns it to every location.

```rs
let individual = {i64[5]}(1, 2, 3, 4, 5);
let collective = {i64[5]}(6);

individual.0; // 1
individual.1; // 2
collective.2; // 6
...
```

Because all of the types are the same, you may also use the array accessor syntax to get the value, which allows you to choose the value at runtime. Because the computed value may be out-of-bounds, this syntax returns a `Maybe`-wrapped output instead of the bare value.

```rs
let individual = {i64[5]}(1, 2, 3, 4, 5);
individual[0]; // Maybe{i64}(1)
individual[1]; // Maybe{i64}(2)
individual[6]; // Maybe{i64}(void)
individual[someOtherIntVariable]; // Maybe{i64}
```

To access the value you'll need to call `getOr` or `getOrExit` like with any `Maybe` type.

!!! note

    The Array Accessor syntax is syntactic sugar on a call to the function `get`, where the first argument is the variable the accessor syntax is applied to, and the contents of the accessor syntax are the remaining arguments.

    This means `buf[idx]` is equivalent to `buf.get(idx)` or `get(buf, idx)`, and `matrix[row, col]` is equivalent to `matrix.get(row, col)`.

## Array Types

An Array type is like a Buffer type in that all elements of an array are the same type, but the size of the array is not known at compile time and can even change during run time. Arrays can be constructed with any number of arguments, as the constructor function is variadic, but values can only be accessed with the array accessor syntax.

Arrays may also be constructed with the array constructor syntax, which elides the need to specify the array type (it is inferred from its contents).

```rs
type manyInts = i64[]; // Equivalent to Array{i64}

export fn main {
  let vals = manyInts(1, 2, 5);
  let betterVals = [1, 2, 3];
  betterVals[0]; // Maybe{i64}(1)
  betterVals[3]; // Maybe{i64}(void)
}
```

## Set Types

A Set type is like an Array type, but each element in a set type is unique. Unlike arrays there is no specific ordering so you can't access values directly, but you can convert a Set into an Array if you need to iterate through all of its values. You can also convert an Array into a Set during Set construction.

```rs
export fn main {
  let uniqueFibonacci = Set{i64}([1, 1, 2, 3, 5, 8]);
  uniqueFibonacci.Array.print; // Prints [1, 2, 3, 5, 8] but maybe not in that order
}
```

## Dictionary Types

A Dictionary Type lets you create a mapping of keys to values. You can use array accessor syntax to get a value when providing they key. You can also convert it into an Array of tuples of key-value pairs to iterate over. Unlike Sets, Dictionaries maintain their insertion order when converted back into an Array.

The constructor function needs the key and value type defined, but if you construct it with an initial key-value pair, they can be inferred.

```rs
export fn main {
  let myDict = Dict("test", 1); // Equivalent to Dict{string, i64}("test", 1)
  myDict["test"]; // Maybe{i64}(1)
  myDict["huh?"]; // Maybe{i64}(void)
  myDict.Array; // [("test", 1)]
}
```

## The GBuffer and GPGPU Types

In Alan, there's one more buffer-like type, the `GBuffer{T}` types. This type is constructed from either a `Buffer` or `Array`. The type sits in-between the two in that its length is not known at compile time, but it cannot be changed once constructed. This represents a block of memory on the GPU, which you can set at construction time (from a buffer or array).

!!! note

    Right now, this type isn't properly generic, but will be before the release of Alan 0.2.0. TODO: Delete this note.

This type cannot be accessed directly at all, it must be explicitly `read` back into an array before it can be accessed, but it can be included in a `GPGPU` execution plan and mutated by that GPGPU compute. The `GPGPU` type can be worked with directly, but most of the time is hidden behind functions that manipulate the `GBuffer` type.

```rs
export fn main {
  GBuffer([1, 2, 3, 4])
    .map(fn (val: gi32) -> gi32 = val * 2)
    .read
    .print; // Prints [2, 4, 6, 8]
}
```

Here we also see both higher-order functions (passing functions to other functions) and the GPU primitive types, which are conceptually identical to the actual primitive types, but are not accessible in normal CPU compute (as they represent work on the GPU) and are much narrower in scope (only booleans and 32-bit integers and floats as primitive types).

## Higher-Order Functions and Generic Functions

You can create functions that accept other functions as an argument and then call it in the course of its operation to create re-usable patterns of behavior that you can then use in other situations.

TO BE CONTINUED...

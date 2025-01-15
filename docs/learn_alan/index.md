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

## Mutable Arguments

Relatedly, when you pass variables to a function in Alan, that function can declare whether or not it wants to mutate the variable while running. In that case, either a bare value needs to be passed in at this point (and the mutation ignored), or the variable passed in *must* be a `let` variable, not a `const`.

By default all functions in Alan get their own copies of the variables passed in, so if they mutate it but do not return that mutation, the mutation is lost after the function call is complete.

If you want that mutation to persist past the function call and don't want to make it the return value, you must declare that you are mutating the original variable by wrapping the variable's type in `Mut{T}`.

```rs
fn increment(a: Mut{i64}, b: i64) {
  a = a.clone() + b;
}

export fn main {
  let five = 3;
  five.print;
  five.increment(2);
  five.print;
}
```

which will print 3, followed by 5. In this example, `i64` is the "primitive type" of the integers, and `Mut{i64}` is a realized "generic type" indicating that we want to be able to mutate the integer that was passed into our function. We'll go over all of these, starting with primitive types.

!!! note

    Arguments in Alan are *conceptually* [call-by-value](https://en.wikipedia.org/wiki/Evaluation_strategy#Call_by_value) by default, though it passes immutable references (`&`) when compiling via Rust rather than full copies of the data. If the variable is mutated within that scope then it will make a copy of that variable via `clone` instead of producing a compiler error as Rust would do in a similar circumstance. All arguments to a function are treated as if they were `let` bound.

    When `Mut{T}` is applied to an argument it switches semantically to [call-by-reference](https://en.wikipedia.org/wiki/Evaluation_strategy#Call_by_reference), using a mutable reference (`&mut`) when compiling via Rust.

    Alan does not generate functions that take ownership of the provided argument like Rust does, primarily because this concept is foreign to most developers, but the function binding logic does support calling functions implemented in Rust that do this via the `Own{T}` generic type. Under the hood it is calling `clone` for you automatically to prevent an unexpected semantic drift, though that may be optimized away if you never use that variable again in a future version of the compiler.

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

## Generic Types

Generic types are types that take other types as arguments to produce a new type.

As we saw in a previous example, there's a type called `Mut{T}` that takes one argument, `T`, which produces a new type indicating that we want changes to this type to be reflected in the original variable that was passed in.

There are many built-in generic types that have particular meanings, from which you can assemble the type you need to store your data, and the most common of these are covered below.

But before we get to those, we need to introduce one more concept. If you needed to write the generic type invocation every time you need that type it would be very cumbersome to manage, which is where type aliases come in.

## Type Aliases

Types are defined similarly to single-statement functions, but with `type` instead of `fn`.

```rs
type Foo = i64;
```

This is the simplest type definition in Alan, a type alias. It provides **zero** type safety guards over using the original type that is aliased. The compiler strips all aliasing when checking whether or not an input value can be passed to the function in a function call, so only use them if it is more convenient in your code or clearer to read.

Similarly, you can define your own generic type like this:

```rs
type Bar{T} = T;
```

which is similarly reduced back to whatever type `T` you passed into the `Bar` generic type, adding nothing on its own to the type safety of your code.

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

### Type Properties

Similarly to how you can access tuple fields by number and struct fields by name, you can do the same thing with the product type itself to access the sub-types from it.

So using the hybrid type as an example:

```rs
type myStructTupleHybrid = i64, bar: string;

type firstField = myStructTupleHybrid.0; // Equivalent to `i64`
type secondField = myStructTupleHybrid.bar; // Equivalent to `string`
```

This may not seem useful, and in this example it is more verbose than the actual types involved, but it can be useful when working with generic types, covered later.

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
// For most functions, you don't need to specify the return type. This also works:
// fn intOrString(b: bool) = b.string.intOrString;

export fn main {
  let mightBeBool = intOrString(true); // Now works
}
```

It also creates two accessor functions, one for each constituent type:

```rs
type intOrString = i64 | string;

export fn main {
  let mightBeInt = intOrString(5);
  mightBeInt.i64.exists.print; // Prints true
  mightBeInt.string.exists.print; // Prints false

  let mightBeStr = intOrString('test');
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
  mightBeInt.i64.getOr(3).print; // Prints 5
  mightBeInt.string.getOr('value').print; // Prints value

  let mightBeStr = intOrString('test');
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

### Type Properties (Again)

As with product types, sum types can also have their sub-types accessed via properties, both numeric, and when possible, by field name.

Returning to the first tagged union example, we can see how this works:


```rs
type intInput = computed: i64 | parsed: i64 | gigo: string;

type firstField = intInput.computed; // Resolves to `i64`
type secondField = intInput.1; // Resolves to `parsed: i64`
type secondFieldName = intInput.1.0 // Resolves to `"parsed"`
type secondFieldType = intInput.1.1 // Resolves to `i64`
```

There is a slight difference when accessing by field name versus a numeric index. When you access by field name, it grabs the type within the field definition, but when you access by numeric index it returns it with the field still attached if there is such a thing. You can then separately access the field's name and underlying type with `.0` and `.1` on that, respectively.

This can be useful when introspecting a generic type provided to you, perhaps for debugging purposes.

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

!!! note

    The Array Accessor syntax is syntactic sugar on a call to the function `get`, where the first argument is the variable the accessor syntax is applied to, and the contents of the accessor syntax are the remaining arguments.

    This means `buf[idx]` is equivalent to `buf.get(idx)` or `get(buf, idx)`, and `matrix[col, row]` is equivalent to `matrix.get(col, row)`.

To access the value you'll need to call `getOr` or `getOrExit` like with any `Maybe` type.

You can also use the array assignment syntax to update a value.

```rs
let count = {i64[3]}(1, 2, 5);
count[2] = 3;
count.print; // Prints [1, 2, 3]
```

!!! note

    This is syntactic sugar for the `store` function. If you want to confirm that the assignment actually works, you can call that function and check it's return value.

    ```rs
    let count = {i64[3]}(1, 2, 3);
    count.store(5, 5).Error.exists.print; // Prints true, it failed to store a value out-of-bounds
    ```

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

Arrays can be altered with the array assignment syntax just like buffers:

```rs
let count = [1, 2, 5];
count[2] = 3;
count.print; // Prints [1, 2, 3]
```

You similarly can't `store` values out-of-bounds for an array. If you wish to grow the array, you should `push` the new value onto the array rather than attempting to write to a non-existent index.

```rs
let count = [1, 2, 3];
count.store(5, 5).Error.exists.print; // Prints true, 5 is out-of-bounds for the array and the value was not stored.
```

## Set Types

A Set type is like an Array type, but each element in a set type is unique. Unlike arrays there is no specific ordering so you can't access values directly, but you can convert a Set into an Array if you need to iterate through all of its values. You can also convert an Array into a Set during Set construction.

```rs
export fn main {
  let uniqueFibonacci = Set{i64}([1, 1, 2, 3, 5, 8]);
  uniqueFibonacci.Array.print; // Prints [1, 2, 3, 5, 8] but maybe not in that order
}
```

Sets can have new values added to them with the `store` function.

```rs
uniqueFibonacci.store(13);
```

!!! note

    Because the two-argument `store` function is bound to `=`, you can *technically* add new values to a Set with just `setName = newValue`, but this is super confusing, so don't do that.

## Dictionary Types

A Dictionary Type lets you create a mapping of keys to values. You can use array accessor syntax to get a value by providing the key. You can also convert it into an Array of Tuples of key-value pairs to iterate over. Unlike Sets, Dictionaries maintain their insertion order when converted back into an Array.

The constructor function needs the key and value type defined, but if you construct it with an initial key-value pair, they can be inferred.

```rs
export fn main {
  let myDict = Dict("test", 1); // Equivalent to Dict{string, i64}("test", 1)
  myDict["test"]; // Maybe{i64}(1)
  myDict["huh?"]; // Maybe{i64}(void)
  myDict.Array; // [("test", 1)]
}
```

New values can be inserted into dictionaries with the array assignment syntax.

```rs
let myDict = Dict{string, i64}();
myDict["test"] = 1;
myDict.Array; // [("test", 1)]
```

!!! note

    Calls to `store` *always* succeed for Dictionaries, so there is no need to check.

## The GBuffer and GPGPU Types

In Alan, there's one more buffer-like type, the `GBuffer{T}` types. This type is constructed from either a `Buffer` or `Array`. The type sits in-between the two in that its length is not known at compile time, but it cannot be changed once constructed. This represents a block of memory on the GPU, which you can set at construction time (from a buffer or array).

!!! note

    Right now, this type isn't properly generic, but will be before the release of Alan 0.2.0. TODO: Delete this note.

This type cannot be accessed directly at all, it must be explicitly `read` back into an array before it can be accessed, but it can be included in a `GPGPU` execution plan and mutated by that GPGPU compute. The `GPGPU` type can be worked with directly, but most of the time is hidden behind functions that manipulate the `GBuffer` type.

```rs
export fn main {
  GBuffer([1, 2, 3, 4])
    .map(fn (val: gi32) = val * 2)
    .read
    .print; // Prints [2, 4, 6, 8]
}
```

Here we also see both higher-order functions (passing functions to other functions) and the GPU primitive types, which are conceptually identical to the actual primitive types, but are not accessible in normal CPU compute (as they represent work on the GPU) and are much narrower in scope (only booleans and 32-bit integers and floats as primitive types).

## Higher-Order Functions and Generic Functions

### Higher-Order Functions

You can create functions that accept other functions as an argument and then call it in the course of its operation to create re-usable patterns of behavior that you can then use in other situations.

Just the type portion of the function definition needs to be provided.

```rs
// "Doubles" the string by concatenating it to itself
fn doublestring(s: string) = s.concat(s);

// Accepts a function that transforms a string and then returns a
// string that documents that change
fn stringChanger(s: string, changer: (string) -> string) {
  return s.concat(" becomes ").concat(changer(s));
}

export fn main {
  // Calling `doublestring`
  let danceName = doublestring("can");
  // Call `stringChanger` with a string and the `doublestring` function
  stringChanger("can", doublestring).print;
  // Call `stringChanger` with a string and a closure function that
  // encloses the `danceName` variable defined above
  stringChanger(
    "a person",
    fn (s: string) = s
      .concat(" who can dance the ")
      .concat(danceName)
      .concat(" through practice")
  ).print;
}
```

We can now pass in the `foostring` function as well as an anonymous closure function that uses the `changed` variable itself to produce a new output. The full output of this example when compiled and run looks like:

```
$ alan compile changer.ln
Done! Took 0.67sec
$ ./changer
can becomes cancan
a person becomes a person who can dance the cancan through practice
```

The same `stringChanger` function produced different outputs based on the behavior of the function it was provided.

Note that the function definitions *usually* skipped the `->` symbol and return type, leaving it up to the compiler to infer the return type of the function involved. In this example this was done in every situation Alan can infer the return type, while the singular place it remains is where it's always required: when defining the kind of function a higher-order function takes as an input.

### Function Type Digression

The type for a function is defined with `I -> O` where the input type `I` turns into the output type `O`. Input *type*? Shouldn't that be types, for each argument?

Well, for Alan, the traditional way you write a set of arguments and their types is *identical* to a struct-style tuple. A struct is a singular type, and constructing a tuple is *identical* to calling a function with a set of arguments matching the tuple args, because they are literally the same thing in Alan.

This also means that, while definitely not recommended, if you wanted to do [Go-style error handling](https://go.dev/doc/tutorial/handle-errors) by returning a tuple of `(value, error)` and then manually check if the error actually exists, you could define a function like:

```rs
fn goStyleIntParse(s: string) {
  let result = s.i64;
  return {i64, Error?}(result.i64.getOr(0), result.Error);
}
```

And now you need to manually check if the `Error` exists in the output tuple before you can safely use the `i64`. But if you ever have a *legitimate* reason to return multiple values from a single function, it's perfectly possible.

The reverse is also true, *anything* can be the input side of things, but how do you even access the values if you didn't give them field names? We can't *exactly* use the `0`, `1`, etc of tuple accessor syntax because they can't be properties of anything, so the compromise in this case is to prefix `arg` on these tuple names.

```rs
fn lazyFooString(string) -> string = "foo".concat(arg0);
// fn lazyFooString(string) = "foo".concat(arg0);

export fn main {
  "bar".lazyFooString.print; // Prints foobar
}
```

You don't *technically* need the parens in the definition, either. You can just put in some whitespace after the name to make it unambiguous.

```rs
fn lazyFooString string -> string = "foo".concat(arg0);
fn lazyFooString string = "foo".concat(arg0);

export fn main {
  "bar".lazyFooString.print; // Prints foobar
}
```

It's just conventional to have parens because that's what the majority of popular programming languages do.

### Generic Functions

Generic Functions are functions where the types of data they're operating on aren't known at the time the function is written. They are often most useful in conjunction with Higher-Order Functions, where the function passed to the generic function determines the output type involved. You specify names for the unknown types inside of `{}` just after the function name.

```rs
fn fma{T, U}(arr: Array{T}, f: T -> bool, m: T -> U, r: (U, U) -> U) -> U? {
  return arr.filter(f).map(m).reduce(r);
}
```

This function takes an array of any type `T`, first filters out irrelevant parts with a filter function `f` that takes `T` and returns a `bool` to determine if it stays or goes. Then it passes it to a map function `m` that takes type `T` and converts it into type `U`, and finally gives it to the reducer function `r` that takes two values of type `U` and returns a singular `U`. The output of this whole chain is a `Maybe` type, specifically `U?`, because the input array might be empty. The final return type is optional, but is less "obvious" with this code, so is good to include for better clarity for this function. It also acts as a safeguard -- the compiler will fail to compile your code if the annotated return type does not match the return type it infers, which can help prevent unexpected changes in behavior when refactoring your codebase.

By convention, the type variables in generic functions (and generic types) are written with singular uppercase letters to make them stand out from normal variables and types.

### Default Value Digression

We didn't use the generic types anywhere but in the type of the function, but suppose `U` has a default constructor function that can be called without any arguments. We could then get a default value to fall back on and eliminate the `Maybe` from the return type signature here.

```rs
fn fma{T, U}(arr: Array{T}, f: T -> bool, m: T -> U, r: (U, U) -> U) -> U {
  return arr.filter(f).map(m).reduce(r).getOr({U}());
}
```

We can get a reference to whatever the actual type ends up being by wrapping it in `{}` within the body, and then we immediately invoke it with the parens `()` afterwards.

Default values can often be dangerous in a production system because they can hide a mistake in the code where a value was not initialized correctly, so the vast majority of types in Alan do not support it (the `Maybe` type is the exception. `Maybe{i64}()` produces a `Maybe`-wrapped `void` value). But you can easily add that to the language, scoped to just the source file you're currently working in, by defining a zero-arg constructor function for any type. Eg:

```rs
fn i64 = 0;
```

Now this type has a zero-arg constructor, so if we wanted to use `fma` to return, say, the total length of all captial words in a string, we could do something like:

```rs
fn capcount(s: string) = s.split(" ").fma(fn (s: string) = s < "a", len, add);

export fn main {
  "Hello there! How are you doing this fine Monday morning?".capcount.print; // Prints 14
  "foo bar baz".capcount.print; // Prints 0
}
```

Assuming the default `i64` constructor function and the more recent `fma` definition are already defined.

We use string ordering to figure out which strings begin with capital letters (because their first character is earlier in ASCII and unicode ordering than the lowercase letters) and keep only those, then we compute the `len` of each substring, then we add them together, and finally print the output number. Because `i64` now has a default constructor, even when we called it a second time with only lowercase words, we'll get the expected value of `0` in this situation.

## Compile-Time Computation, Conditional Types, and Conditional Compilation

As was shown with `Buffer`s when defining the size of buffer instances, the type system can work with constant primitive types. The type system includes integers, floats, booleans, and strings. These types can also be manipulated at compile time to generate the actual value to use.

### Compile-Time Computation

While declaring a buffer of `i64[1 + 2]` will give you a buffer of three elements, that's not *generally* useful. (Though sometimes you do want to include a bunch of explicit arithmetic to show where some constant value came from.) This feature is more meant for use with generic types. For instance, the `concat` function for buffers has a type signature of:

```rs
export fn concat{T, S, N}(a: Buffer{T, S}, b: Buffer{T, N}) -> Buffer{T, S + N} {
  ...
```

The output buffer length is computed from the lengths of the two input buffers.

Beyond addition there are all of the arithmetic operations, as well as the comparison operators (`<`, `<=`, `>`, `>=`, `==`, `!=`), and so on.

There are also some special compile-time types to provide data at compile-time that may be useful.

* `Env{K}` returns the string environment variable for the given string key (or aborts compilation if not present)
* `FileStr{F}` returns the contents of a file as a string for a given file path (or aborts compilation)
* `If{C, A, B}` resolves as type `A` if `C` is `true`, and as `B` if `C` is false.

### Conditional Types

The `If{C, A, B}` type is the primary conditional type in Alan, letting you choose which type to actually resolve as. This could be for a variety of reasons; automatically swapping between `Buffer`, `Array`, or `GBuffer` based on the size of the data to be processed, or swapping out filesystem type depending on the operating system you're running on.

For example, a `Path` type could be defined like:

```rs
type Path =
  hasDrives: If{Windows, true, false},
  separator: If{Windows, "\\", "/"},
  path: string;
```

When a field in a product type resolves to a constant type value, Alan removes it from the actual product type that is constructed but keeps the accessor function for it that returns the primitive type with that value, and the compiler converts any calls to that function directly into the constant in the code, making it effectively zero-cost to "annotate" your types with metadata that can be determined at compile-time for all instances of that type.

This usually only applies for things like the target operation system, processor architecture, or build type (test, debug, release), but there's no restriction on what it can be used for.

### Tagged Types Digression

An internal type for implementing the GPU types, `WgpuType{N}`, is used with `N` being the `wgsl` name of the type (which differs from the Alan name for the type) and is a constant string. Eg:

```rs
type gu32 = WgpuType{"u32"};
```

This isn't conditional, but allows the type to be "tagged" with metadata to use at run time.

### Conditional Compilation

`If{C, A, B}` is useful in combination with the `Env{K}` type to have features enabled or disabled during compilation, but when the type or function they're associated with differs significantly, sprinkling conditionals everywhere can make your code harder to read, so Alan has a unique feature (as far as we're aware) to allow top-level *keywords* to be optionally generic, accepting a single compile-time boolean type as the argument to determine whether or not to include it in the compilation process at all.

The `Path` example *could* be written as:


```rs
type Path = hasDrives: false, separator: "/", path: string;
type{Windows} Path = hasDrive: true, separator "\\", path: string;
```

Here we're relying on the "last definition wins" tiebreaker for identical definitions. For non-Windows platforms the first `Path` is the only one so it sticks around, while on Windows, both are defined but the Windows-specific one is defined second so it overrides the first definition.

But this works any keyword in the top-level of the source file, so `fn{Test}` defines a function that only exists during testing, `export{Windows}` exports something only for the Windows platform, etc.

Conditional compilation in Alan simply requires tagging the code that you want to be compiled only in certain circumstances with the condition that it should be compiled. That's it.

## Operators and Type Operators

It has been alluded to in prior sections that operators are just functions and type operators are just generic types (aka type functions), and that is the case.

Alan defines a mapping of certain operator symbols to certain functions and type operator symbols to certain generic types, so `1 + 2` inside of a function is equivalent to `add(1, 2)` and the same inside of a type is equivalent to `Add{1, 2}`.

There is also a defined precedence between operators, so multiplying `*` is converted to a functional form before adding `+`.

Specifically, multiplying is given a precedence of `4` and adding a precedence of `3`. When processing a statement (type or function), the statement is scanned for the highest precedence operator, with ties resolving to the left-most operator, then converting it and the surrounding sub-statement segments into a function call, and repeating the process until only function calls remain in the statement.

<figure markdown="span">
  !["It's all function calls?" "Always has been"](../assets/always_has_been.jpg)
  <figcaption><h6>You can faintly hear mad cackling coming from the old <a href="https://en.wikipedia.org/wiki/Symbolics">Symbolics</a> headquarters...</h6></figcaption>
</figure>

Operators can only be one or two argument functions (or generic types). For two arguments, the operator is an `infix` operator placed between its two operands, while for one argument, the operator may be bound as a `prefix` or `postfix` operator. Prefix operators come before the value they operate on, eg `-x` maps to `neg(x)`, and postfix operators come after the value they operate on, eg `i64?` maps to `Maybe{i64}`.

### Augmenting Operators

As operators and type operators simply map to functions and generic types (type functions), you can augment the behavior of an operator by defining a new function with the same name as one of the operators' mapped function names, but for a new type.

In standard Alan, the following doesn't compile:

```fn
export fn main {
  print("Hello, " + "World!");
}
```

But it can be made to work pretty easily:

```fn
fn add(a: string, b: string) = a.concat(b);

export fn main {
  print("Hello, " + "World!");
}
```

!!! note

    This pattern of string construction is generally frowned upon nowadays, primarily because in Javascript and other dynamic languages it leads to weird math errors where `"Hello" + 2` works, though even with the augmentation described above that would still fail to compile in Alan.

    But the other reason why is because it requires a lot of memory allocation and memory copying that template-based string construction avoids, making the template-based approach faster for all but the most trivial of examples.

This behavior is more useful for your own custom types, for instance:

```rs
type Vec{T, L} = If{
  L < 5,
  T[L],
  Fail{"Vector CPU extensions only work for vectors of length 4 or less"}};
```

A wrapper around a buffer type constrained to lengths 1-4 that you then execute specialized functions on would be nicer to work with if you can use arithmetic operators on it for parallelized addition, multiplication, etc.

Just defining:

```rs
fn add{T, L}(a: Vec{T, L}, b: Vec{T, L}) -> Vec{T, L} {
  ...
```

will then include this function in the set the `+` operator could resolve to.

The other way operators can be augmented is by altering the function they bind to and/or the precedence they're set at.

!!! warning

    While this change will only be visible within the specific file you've made this alteration to or any other file that `import`s this change, changing the precedence or binding of an operator can be **VERY** confusing to anyone reading the code in your file. Do not do this lightly.

The syntax to alter an operator is:

```rs
infix <fnName> as <symbol> precedence <N>;
prefix <fnName> as <symbol> precedence <N>;
postfix <fnName> as <symbol> precedence <N>;
```

So we can drop the precedence of the prefix negation operator (`-`) by writing:

```rs
prefix neg as - precedence 0;
```

Or change the infix addition operator (`+`) to `concat` by writing:

```rs
infix concat as + precedence 3;
```

The syntax for type operators is identical, except that it is preceded by the `type` keyword:

```rs
type infix <typeName> as <symbol> precedence <N>;
type prefix <typeName> as <symbol> precedence <N>;
type postfix <typeName> as <symbol> precedence <N>;
```

So you could swap the precedence of the `Function` and `Tuple` type operators by writing:

```rs
type infix Function as -> precedence 0;
type infix Tuple as , precedence 3;
```

This would let you define a function that takes multiple arguments *without* needing to group those arguments with parenthesis:

```rs
foo: i64, bar: bool -> string
```

But then requires you to wrap the entirety of the function type in parenthesis when using it as a type within a higher-order function:

```rs
fn someFn normalArg: i64, fnArg: (foo: i64, bar: bool -> string) -> string[]
```

This looks weird and produces surprising syntax, so you **really** shouldn't do this.

### Defining New Operators

But this same syntax can be used for defining *new* operators, which is more acceptable, especially if your code is defining a DSL that makes sense for your particular use-case and the developers you are collaborating with.

Returning to the vector example, instead of defining an `add` function and using `+`, we could do what Julia does where there's a `.+` operator that does piecewise addition.

Then we just need to define the `piecewiseAdd` function:

```rs
fn piecewiseAdd{T, L}(a: Vec{T, L}, b: Vec{T, L}) -> Vec{T, L} {
  ...
```

And create the `.+` operator:

```rs
infix piecewiseAdd as .+ precedence 3;
```

And we can now `vec1 .+ vec2` in our code. The benefits here are:

1. Those who are familiar with the dotted-operator DSL from Julia can immediately understand that this is a piecewise addition between vectors or matrices, aiding our comprehension.
2. Those who are *not* familiar with this syntax immediately know this is doing something non-standard, but can search for the text `.+ precedence` in the code to find the definition of this operator and then see what function is bound to the operator so they can then read up on what it's actually doing, as the mechanism for defining an operator is standardized. (And a language server could automatically figure this out for them and allow a go-to-definition for the operator.)

## Binding Functions and Types from Rust (or Javascript)

!!! note

    Currently only Rust binding exists and that's what the documentation currently covers, but before Alan v0.2.0 it is intended to modify the binding syntax to also define bindings for Javascript

Beyond defining functions and types in Alan, you may also bind functions and types to Rust functions and types. This binding process trusts you completely that the binding has been specified correctly, so be sure that you're doing so.

### Binding Functions

The two function syntaxes we have covered up until now are the single-statement and multi-statement syntaxes.

```rs
fn foo(a: i64, b: i64, c: i64) = a * b + c;
fn bar(a: i64, b: i64, c: i64) {
  const d = a * b;
  const e = a * c;
  return a + b + c + d + e;
}
```

But there is a third syntax:

```rs
fn baz "baz" :: (i64, i64, i64) -> i64;
```

The `::` symbol is an alias for the `Call{N, F}` type, specifying a function call with the Rust function name as a string on the left, and the function type that it represents on the right. This `Call` type doesn't have any properties, but defines a single "constructor" function that takes the input specified and returns the output. This is used in conjunction with the function declaration syntax to give this "constructor" an easy-to-use name.

!!! note

    The `Call{N, F}` type requires a fully-defined function type, including the return type, for any function being bound from Rust (or Javascript in the future). Alan's type inference cannot operate on a language it wasn't designed for, so it must be told all of the necessary information ahead of time to work.

In fact, you could use this syntax with any type that produces an automatically-defined constructor function, so if you wanted to create an alias for a struct, but only when constructing it, you could do so:

```rs
type Record = value: string, count: i64;

fn r Record;
```

This will produce a function `r` that takes a `string` and `i64` and generates a `Record` object. It's essentially shorthand for:

```rs
fn r (v: string, c: i64) = Record(v, c);
```

which reduces some redundant syntax, but also eliminates the wrapper function from the call stack.

You can bind more than just Rust functions as Alan functions. Since functions in Alan are also methods, properties, and operators, these concepts in Rust are also bindable as functions (which you can then use as methods or properties automatically and can rebind to an operator if desired).

```rs
fn add Infix{"+"} :: (f32, f32) -> f32;
```

This defines an `add` function for 32-bit floats, being bound to Rust's `+` operator *and* that function name `and` being bound to `+` within Alan.

In Alan, values are passed by reference to functions, but in Rust, you can call functions in different ways, such as passing ownership to the function, passing a mutable reference, or simply dereferencing a reference. Therefore, you can annotate the function type for these bound functions, operators, etc, with `Own{T}`, `Deref{T}`, etc.

```rs
fn eq Infix{"=="} :: (Deref{i8}, Deref{i8}) -> bool;
```

This defines an `eq` function for 8-bit integers, binding it to Rust's `==` operator, but indicating to Alan that it should dereference the arguments when passing them to the operator. These various generic types allow you to annotate the binding, eliminating the need for writing wrapper functions in Rust.

!!! note

    Currently you can bind standard library functions and a set of blessed third-party Rust libraries only. Before release this syntax will be extended to allow you to specify packages you wish to install from Cargo during the build process.

    At the same time as this syntax change, binding Javascript functions will also be added to allow compiling to Javascript for use in the browser, which will similarly allow you to specify NPM packages to include in the build process.

### Binding Types

Similarly, binding types is done with the `Binds{T, ...}` type.

```rs
type Foo = Binds{"Foo"};
type Bar{A, B} = Binds{"Bar", A, B}; // Becomes Bar<A, B> in Rust
```

Bound types are different from normal Alan types in that *zero* constructor and accessor functions are automatically defined for them. It is up to you `Call` Rust functions that create and work with this type.

!!! warning

    In Alan, it is assumed that **all** types can be `clone`d and `hash`ed, and the Alan compiler will generate code with that assumption. It is **highly** recommended that types that can't be cloned are wrapped in `Rc<T>` or `Arc<T>` during the binding, and types that can't be hashed should be wrapped with the [New Type Idiom](https://doc.rust-lang.org/rust-by-example/generics/new_types.html) and then [`impl` the `Hash`](https://doc.rust-lang.org/stable/std/hash/trait.Hash.html#implementing-hash) and [the `PartialEq` and `Eq`](https://doc.rust-lang.org/std/cmp/trait.PartialEq.html#how-can-i-implement-partialeq) traits. If you need to do both, put the `Rc<T>` wrapping within the New Type wrapper.

Bound functions and types are tricky to work with, but provide a zero-cost FFI to the existing Rust (and eventually Javascript) ecosystem of libraries. The syntax is pretty simple, but leaves correctness up to you, so tread lightly if you need it!

!!! note

    When multiple target languages are supported in Alan, there will be global boolean type constants `Rs` and `Js` that you can use with conditional compilation to choose which `type` or `fn` definition is actually selected, eg:

    ```rs
    type{Rs} i32 = Binds{"i32"};
    type{Js} i32 = Binds{"Number"};
    ```

    Libraries in Alan that need to bind into the target language **should**, if at all possible, have a binding for both target languages, but if they can't, or it doesn't make sense to (eg, process control access in Javascript or DOM access in Rust), then it would be best to implement a poison pill like this to block compilation in the wrong target language:

    ```rs
    type{Rs} Dom = Fail{"This library can only be used when compiled to Javascript, as Rust does not have a DOM."}
    ```

## Conditional Statements

Currently in Alan, Conditional statements are implemented solely with the `if` functions, which take a boolean and one or two functions that take zero arguments and optionally return a value.

If you provide just one function, it is run only if the condition is `true` and its return value is passed back through the `if` function wrapped in a `Maybe{T}` that you then need to check the value of.

If you provide two functions, the first is run when `true` and the second is run when `false`. Both functions *must* return the same type, and the `if` function returns the value from either branch for you.

Before Alan v0.2.0 is released a "normal-looking" conditional syntax is planned, allowing for early returns and etc, and will actually be implemented via rewriting your code to use the `if` function, instead, but this has not yet been done.

## Interfaces (AKA Types of Types)

Currently, when you pass "bad" types into generic functions or generic types that won't actually work, it will fail to compile as one would expect, but it fails deeper into the compilation and the resulting error message from the compiler is confusing.

It is planned to allow generic types and generic functions to specify type constraints. These type constraints can be the names of generic types that the type must be constructed from *or* an `interface` type that declares a set of function types indicating how the type can be operated on, allowing a type-safe kind of "duck typing."

## Importing from Files and Libraries

In many languages, importing from other files and libraries is done with a special syntax, and this syntax is often a preamble placed at the beginning of a source file. This is true of Rust, Java, C#, Python, and modern module-aware Javascript, amongst many others. This general approach is the default across many languages.

C is an example of a language that differs in this regard as importing is done through trickery in the C preprocessor, conditionally including the source of another file, usually a "header" file that simply declares the C functions that exist in another file that will be linked into the library or binary to be generated. Essentially, there is no such thing as modules in the language itself; it's just a construct within the preprocessor to order the source into one long set of source code to actually compile. Pre-module-aware Javascript was similar, and this is the second most common way for languages to "deal" with importing -- make it the developer's problem to handle.

Alan differs from both of these. The authors of Alan have not seen the approach chosen in any other language, though it is most similar to Lisp: importing is done through the type system. There are 5 types involved in importing code from other files:

```ln
Import{N, D}
From{D}
Dependency{N, V}
Rust{D}
Node{D}
```

Of these, the first three have operators binding them.

```rs
N <- D
<-- D
N @ V
```

The `Import{N, D}`, or `N <- D` type imports the named type or function from the specified dependency. The `N` parameter must resolve into a string, while the `D` parameter may be a string, a `Dependency{N, V}`, `Rust{D}` or `Node{D}`.

When `D` is a string, it is treated as a path to another file on the filesystem. If the path is a relative path, it is relative to the current file. If it's an absolute path, the root of the path is anchored in the path where the `alan` command was invoked. Relative paths can also only reach within the filesystem tree contained by the path the `alan` command was invoked, to reduce/eliminate certain security vulnerabilities during compilation and to prevent accidentally writing code that is not properly encapsulated.

!!! warning

    Passing a `Dpendency{N, V}` *directly* to an `Import{N, D}` is not yet implemented as the finer details of libraries have not yet been fleshed out.

When `D` is `Rust{D}` or `Node{D}`, this indicates that the dependency is a native one to the Rust or Node.js platform, respectively, and this `D` *must* resolve to a `Dependency{N, V}` type. When done this way, `N` is the name of the module in `Cargo` or `NPM`, and `V` is the version, by default. However, `V` could also be the URL to a git repository, and that URL may have a `#` followed by a branch/tag name to specify the particular branch or tag to check out.

When compiling natively, only `Rust{D}` may be used, and when bundling for the browser, only `Node{D}` may be used. Usage of the wrong native dependency type is an immediate compilation failure. Fortunately you can easily mask one or the other with conditional compilation and the built-in `Rs` and `Js` boolean type values.

If the `Import{N, D}` is a type, you can make use of it in your own code by simply assigning it to an alias, eg:

```rs
type foo = Import{"foo", "./foo.ln"};
```

Similarly, as functions can be defined solely from a type, if `foo` were a function instead of a type, you could do:

```rs
fn foo Import{"foo", "./foo.ln"};
```

Importing in Alan requires explicitly declaring whether the value being imported is a function or a type, making the code more self-documenting when it is read later.

!!! note

    There currently is no way to import operators or type operators, though this is intended to be implemented in the future. It has been a lower priority since operators and type operators are simple declarative statements so copy-pasting isn't too terrible.

The `Import{N, D}` syntax is shorter with the `<-` operator syntax:

```rs
type foo "foo" <- "./foo.ln";
fn foo "foo" <- "./foo.ln";
```

This makes renaming types and functions from other files simply choosing a different name for the alias:

```rs
type foofoo "foo" <- "./foo.ln";
fn foofoo "foo" <- "./foo.ln";
```

But for *most* use-cases, this feels redundant with the `foo "foo"` repetition, so the special `From{D}` type was defined:

```rs
type foo = From{"./foo.ln"};
fn foo = From{"./foo.ln"};
```

```rs
type foo <-- "./foo.ln";
fn foo <-- "./foo.ln";
```

!!! note

    This is intended to be just `<-` once disambiguating infix and prefix types of the same type symbol works.

It has a little bit of compile-time magic built into it, grabbing the name of the type or function it is being assigned *to* and transforming it into an `Import` of that name and the specified dependency.

!!! warning

    If `From{D}` is unable to find the type or function name, the `From` type instead becomes a compilation failure and the explicit `Import` syntax is required instead.

    This is possible if you use an imported type as part of a sum or product type directly,

    ```rs
    type myTuple = string, From{"./foo.ln"}; // What type do you mean?
    ```

    or if you are calling a function from another by defining the function type implicitly

    ```rs
    fn getFoo(foo: string) {
      {From{"./foo.ln"}}(foo); // What function do you mean?
    }
    ```

It could feel tedious to specify the import path or dependency name and version for every type and function you are importing, but you can simply assign the dependency a type alias to deal with it.

The root scope includes a shim library for both Rust and Javascript to support the built-in functionality of the language that are assigned to the `RootBacking` name.

```rs
type{Rs} RootBacking = Rust{"alan_std" @ "https://github.com/alantech/alan.git"};
type{Js} RootBacking = Node{"alan_std" @ "https://github.com/alantech/alan.git"};
```

This is then used with the import syntax in built-in types:

```rs
type{Rs} Error = Binds{"alan_std::AlanError" <- RootBacking};
type{Js} Error = Binds{"alan_std.AlanError" <- RootBacking};
```

and functions:

```rs
fn{Rs} storageBuffer "alan_std::storage_buffer_type" <- RootBacking :: () -> BufferUsages;
fn{Js} storageBuffer "alan_std.storageBufferType" <- RootBacking :: () -> BufferUsages;
```

!!! note

    Remember, because these are native function imports, Alan can't automatically figure out the type signature, so it needs to be wrapped in a `Call{N, F}`, which is the `::` operator. The type operator precedence order is defined such that no grouping parens are needed for this.

By being baked into the type system itself, it can be extended naturally. You can make the module or function being imported be defined by a compile-time environment variable, for example, to provide compile-time options similar in concept to Rust features.

It is also intended to eventually add a capabilities system to the import logic, preventing libraries from having access to the filesystem, or sockets, etc, to improve security, which will be done via other built-in types, but this has not been fleshed out, yet.

## Testing your Code

The `Test` type exists to determine if your code is being compiled and run with `alan test`. You can use in during conditional compilation to define a `main` function that only exists during testing.

```rs
export fn{Test} main {
  ...
```

This `Test` type also gates the existence of a built-in test suite for Alan. It consists of a `Testing` type used to set up a series of tests and support functions that create, mutate, and consume it.

`describe` is the first function and it creates a top-level group for tests. There are several variants for better ergonomics, but at its core it takes a string describing the subject of a group of tests and returns a `Testing` object. It may be chained fluently or be provided a closure function.

`it` is the next function. It takes a `Testing` object returned by a `describe` and specified a singular test topic, then returns the `Testing` object. It may also be chained fluently or be provided a closure function.

`assert` is the third function. It takes a `Testing` object from an `it` as well as a comparison function, followed by two values to be compared against. Generally the first of these two arguments is the "actual" value computed during the test by your code, while the last argument is the "expected" value that has been hardwired in your test suite.

`report` is the final function. It takes a `Testing` object and generates the test report, with color coding (red for failure, green for success, yellow for in-progress) and Unicode symbols (❎ for failure, ✅ for success, and •︎ for in-progress) to indicate test outcomes.

At the moment, the test suite will early-exit on the first failure, but it's intended to make that optional in the future. Much (but not all) of Alan's features are [tested using this test suite](https://github.com/alantech/alan/blob/main/alan/test.ln). That is currently the best source to understand its usage, but here's a trivial Alan app that only does something when you run `alan test` on it:

```rs
export fn getFoo = "foo";
export fn makeFooish (s: string) = getFoo().concat(s);

export fn{Test} main {
  describe("Foo")
    .it("getFoo")
      .assert(eq, getFoo(), "foo")
    .it("makeFooish", fn (test: Mut{Testing}) {
      let bar = "bar";
      let bbb = bar.repeat(3);
      test
        .assert(eq, makeFooish(bar), "foobar")
        .assert(eq, makeFooish(bbb), "foobarbarbar");
    })
    .report;
}
```

Note that the closure function specifies the type as `Mut{Testing}` because the original `Testing` value is being mutated within the function and isn't returned back.

The test suite being defined in a conditonally-compiled `main` function makes it an executable only during tests, while not a compilation target under normal circumstances, which makes it possible to define the test suite for a library in the same file as the library rather than require a separate file, which is useful for unit tests.

It is planned to eventually have `alan test` with no compilation target provided to recursively search all `.ln` files in the `PWD` for files that have `export fn{Test} main` and run these tests sequentially.

It is already possible to both `alan test foo.ln` and `alan test --js foo.ln` to execute the test suite both natively and inside of Node.js. This is planned to eventually move to testing within a headless browser once the headless browsers support WebGPU so the GPGPU logic can be tested in the browser context as well, but for now GPGPU testing must be done only natively (or with a very complicated setup on supported operating systems implemented in the Alan monorepo involving Node, Chrome, and Rust simultaneously, but only on MacOS).

## Want to Learn More?

Every feature of the Alan language has now been covered. If you want to learn more, take a look at the [built-in types, functions, and operators](./built_ins.md) and the [standard library](./standard_library.md).

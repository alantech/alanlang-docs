#### Built-in Types

The built-in types for Alan are:

* `void`
* `int8`
* `int16`
* `int32`
* `int64` or `int`
* `float32` or `float`
* `float64`
* `bool`
* `string`
* `function`
* `Array<V>`
* `HashMap<K, V>`
* `KeyVal<K, V>`
* `Error`
* `Maybe<T>`
* `Result<T>`
* `Either<T, U>`

The `int64` and `float64` types are special among the numeric types, as these are the types that any numeric constant will be represented as, depending on whether or not it has a decimal. They have been given aliases of `int` and `float` respectively for that reason.

Built-in types divide into a few categories: basic types, strings, and special types.

##### Basic Types

Basic types include integers (`int8`, `int16`, `int32`, and `int64`), floating point numbers (`float32` and `float64`), booleans (`bool`), and the `void` (no value) type. The numbers refer to the number of bits consumed by the basic type. There are currently no unsigned variants of the integer types, though that may change if there is demand for it.

The four "main" basic types (`int64`, `float64`, `bool` and `void`) have constant representations that you can easily type. The non-64-bit numeric types are considered specialized types and are discouraged (the runtime does not take advantage of the potential space optimizations they provide to keep the internal memory addressing system simpler), so constants for those types must be explicitly casted using the `to<Type>` functions discussed in the [Type Coersion](./type_coersion.md) section.

The integers have basic base-10 integer form as well as hexadecimal form. Binary and Octal forms are not implemented but that may change if there is demand for it.

```alan
const base10 = 12345
const base16 = 0xabcde
```

The floating point numbers have only basic base-10 with a decimal point form, no scientific notation form yet, but that may change if there is demand for it.

```alan
const floating = 1.2345
```

Booleans are represented by the keywords `true` and `false`. `void` has no representation beyond `void`. It can't be assigned to, and is meant to represent functions that return nothing.

```alan
const boolean = true
const someVoid = void
```

The basic types are included in the root scope and never need to be explicitly defined, they always exist.

##### Strings

Strings (`string`) are a bit beyond the basic type. From the perspective of the user of Alan they are `utf-8` byte arrays (multi-byte code points increase the string length by 2 or 3, not 1). If there is significant demand for it, string length checks and other operations will be switched to the codepoint model versus the byte array model.

Strings are defined by wrapping double or single quotes (`"` or `'`) around text. They work identically to Javascript strings, with the same sorts of C-style escape codes. Within the runtime, however, they are represented as Pascal strings with a 64-bit header, which makes certain operations faster than their C-string counterparts (particularly length checking, which is O(1)) but means 8 extra bytes are required for each string versus C-string's traditional 1 extra byte, so lots of small strings will consume more memory.

```alan
const myString = "My string's string"
const myOtherString = 'My other string\'s string'
```

Strings are also included in the root scope and never need to be explicitly defined.
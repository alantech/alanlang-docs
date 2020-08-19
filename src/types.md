#### Types

There are two major categories of types in Alan: built-in types and user-defined types. User-defined types are similar to `struct`s in C as they are simply named compound types made up of other user-defined types or built-in types. They can also be only partially-defined as generic types, more on that later.

Built-in types also divide into a few categories: basic types, strings, and special types.

##### Basic Types

Basic types include integers (`int8`, `int16`, `int32`, and `int64`), floating point numbers (`float32` and `float64`), booleans (`bool`), and the `void` (no value) type. The numbers refer to the number of bits consumed by the basic type. There are currently no unsigned variants of the integer types, though that may change if there is demand for it.

The four "main" basic types (`int64`, `float64`, `bool` and `void`) have constant representations that you can easily type. The non-64-bit numeric types are considered specialized types and are discouraged (the runtime does not take advantage of the potential space optimizations they provide to keep the internal memory addressing system simpler), so constants for those types must be explicitly casted using the `to<Type>` functions discussed in the [Built-ins](./built_ins.md) section.

The integers have basic base-10 integer form as well as hexadecimal form. Binary and Octal forms are not implemented but that may change if there is demand for it.

```rust,ignore
const base10 = 12345
const base16 = 0xabcde
```

The floating point numbers have only basic base-10 with a decimal point form, no scientific notation form yet, but that may change if there is demand for it.

```rust,ignore
const floating = 1.2345
```

Booleans are represented by the keywords `true` and `false`. `void` has no representation beyond `void`. It can't be assigned to, and is meant to represent functions that return nothing.

```rust,ignore
const boolean = true
const someVoid = void
```

The basic types are included in the root scope and never need to be explicitly defined, they always exist.

##### Strings

Strings (`string`) are a bit beyond the basic type. From the perspective of the user of Alan they are `utf-8` byte arrays (multi-byte code points increase the string length by 2 or 3, not 1). If there is significant demand for it, string length checks and other operations will be switched to the codepoint model versus the byte array model.

Strings are defined by wrapping double or single quotes (`"` or `'`) around text. They work identically to Javascript strings, with the same sorts of C-style escape codes. Within the runtime, however, they are represented as Pascal strings with a 64-bit header, which makes certain operations faster than their C-string counterparts (particularly length checking, which is O(1)) but means 8 extra bytes are required for each string versus C-string's traditional 1 extra byte, so lots of small strings will consume more memory.

```rust,ignore
const myString = "My string's string"
const myOtherString = 'My other string\'s string'
```

Strings are also included in the root scope and never need to be explicitly defined.

##### User-Defined Types

User-defined types must be declared by the user and they follow the following syntax:

```rust,ignore
type typename {
  propertyName: propertyType
  otherProperty: otherType
}
```

The syntax to construct a new instance of a user type is as follows:

```rust,ignore
const myVal: typename = new typename {
  propertyName = propertyValue
  otherProperty = otherValue
}
```

The redundant `typename` in that example will also eventually be eliminated by type inference, reducing it to just:

```rust,ignore
const myVal = new typename {
  propertyName = propertyValue
  otherProperty = otherValue
}
```

User-defined types have another interesting feature: they can be generic. That means one or more of the actual sub-types used by the type is not yet defined, but will be "solidified" later on with the creation of a new type based on it.

Generic types look like this:

```rust,ignore
type typename<A, B> {
  propertyName: A
  otherProperty: B
}
```

Where later on you can "solidify" that type either by creating an alias with the types filled in:

```rust,ignore
type typenameIntStr = typename<int64, string>
```

or just declaring a variable that uses a "solidified" type:

```rust,ignore
let myVar = new typename<bool, float64> {
  propertyName = true
  otherProperty = 0.0
}
```

Functions cannot operate on Generic types directly, but they can work on Generics that have been "solidified" with interfaces. More on this in the [Interfaces](./interfaces.md) section.

##### Special Types

In a language with no looping or recursion, every function has a predictable runtime, but they also can't do very much, as evidenced by the limited utility of [eBPF](http://www.brendangregg.com/ebpf.html) (but also the lack of an issue with it running in kernel-space). It is essentially impossible to implement any real computing algorithms yourself.

But if there were the right built-in primitives with the right built-in functionality, you could combine them to create the algorithms you need without the looping construct. The special built-in types are covered in depth in [Built-ins](./built_ins.md), but they can be used within your own types like any other.

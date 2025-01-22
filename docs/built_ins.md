# Built-ins

The Built-in Types, Functions, and Operators that are automatically available in every Alan module.

## Types

There are two kinds of built-in types: intrinsic types and constructed types. The intrinsic types are the types declared to exist by the Alan compiler and are interpreted by it to produce the types (and automatically generated functions) that you actually use in your code.

In some ways, the intrinsic types are a kind of compile-time interpreted language that directs the compiler and generating types is a side-effect. There are more of these intrinsic types than you might expect because of compile-time computation and the necessity to bridge the Alan type system to the Rust (and sorta Javascript) type system.

Of these intrinsic types, there is a core that you should be aware of, and secondary ones only necessary for writing your own bindings into the host language or for more complex types, and even of the core you should be aware of, they are often syntactic concepts in other languages that are part of the type system, here.

The constructed types are those that are built on top of these intrinsic types and there are many of these that you might have expected to be intrinsic that are constructed, including all of the *run-time* integers, floats, bools, and strings.

### Intrinsic Types

There are a few sub-groups we can divide the intrinsic types into: the meta types, the host types, the type types, and the compute types.

#### Meta Types

The Meta types are types that are generally not used directly, but represent features of the language syntax itself.

* `Type` is the first and most core type in the language. It isn't used directly, but holds onto the name and actual type when you use the `type typename = typdef;` syntax.
* `Generic` is similar to `Type` in that it is not used directly, but is used when you use the `type typename{genericarg1, genericarg2} = genericdef;` syntax to define a generic type.
* `Int` is also not used directly, but represents any integer value in the type system itself, such as the length of a fixed-length buffer type.
* `Float` is also not used directly, but represents floating-point numbers in the type system. This has not actually been used in the language, yet.
* `Bool` is also not used directly but represents `true` an `false` in the type system. It is used quite a bit for conditional compilation.
* `String` is also not used directly be represents string values in the type system. It is useful for compile-time environmental variable compilation configuration and embedding the contents of a text file into the code. It has also been used as a way to provide a "tag" to a generic type that functions accepting that generic type can use to alter their behavior at runtime.
* `Group{G}` is a type that represents parenthesis `()` in the type system syntax. It can be used outside of that, but it is kinda pointless to do so.
* `Function{I, O}` is the only meta type that can and is used directly in several cases, most commonly when writing a function that accepts another function as an argument, *but* it is also automatically constructed when you write a function.
* `AnyOf{A, B, ...}` is a type where all types within *can* be computed and it is up to the compiler to choose the one to use. It is generally used internally during automatic generic argument inference of function calls, and is intended to be used for integer type inference in the future.

#### Host Types

The Host types are types that are involved in bridging Alan to the host language, allowing you to call native functions, declare native types, and require native 3rd party libraries.

* `Binds{T, ...}` is the first built-in type that you *do* use directly. It's a generic type whose first argument is the string name of the type in the host language (Rust or Javascript) that you are compiling to. Extra arguments to the generic type are the types to provide to the generic arguments of the type assuming it is a generic type.
* `Call{N, F}` takes a "callable" type as the first argument and a `Function{I, O}` declaration on how to "call" it as the second type. A `String` refers to a standard function, while rest of the "callable" types are defined below.
* `Infix{O}` is the first "callable" type. It takes a `String` representation of an infix operator in the host language, which the compiler will turn into `(A op B)`, with `A` and `B` being the two arguments (it will be a compile-time error if the `Function{I, O}` does not specify exactly two arguments) and `op` is the operator symbol. Parentheses are always used to avoid needing to clarify operator precedence rules in the host language.
* `Prefix{O}` is the next "callable" type. It takes a `String` representation of a prefix operator in the host language, which the compiler will turn into `(op A)`, with `A` bing the singular argument (which will compile-time fail if the `Function{I, O}` is not a single-argument function) and `op` is the operator symbol. Parentheses are always used to avoid needing to clarify operator precedence rules in the host language.
* `Method{F}` is another "callable" type. It takes a `String` representation of a method call. The first argument of the `Function{I, O}` is the variable the method will be called on, and all remaining arguments are the arguments of the method call. It is a compile-time error if the `Function{I, O}` definition does not include any input types.
* `Property{P}` is another "callable" type. It takes a `String` representation of the property name to call. The first and only allowed argument of the `Function{I, O}` definition is the variable the property will be accessed from.
* `Cast{T}` is a Rust-only "callable" type that is used for type casting from one type to another. The `Function{I, O}` must have only one input type and that input type must similarly be specially marked as `Own{T}` or `Deref{T}` for the `Cast{T}` to function correctly.
* `Own{T}` is a Rust-only, function-argument-only type that indicates that the function should take full ownership of the variable away from the calling function. Alan does not have an ownership model, and while it will be able to determine if the variable is never used again and optimize the implementation of these calls in the future, right now what this means is that the Alan compiler will `.clone()` the argument and then pass that to the function, so try to avoid this when possible.
* `Deref{T}` is a Rust-only, function-argument-only type that indicates that the function should derefernce the referenced variable (all arguments in Alan are pass-by-reference by default). This avoids the `.clone()`, but many types cannot be safely de-referenced like this. Alan will trust you that it is safe to do this, and may generate invalid Rust code, so also try to avoid this when possible.
* `Mut{T}` is a function-argument-only type that indicates that the argument will be mutated by the function in question. This is actually the only function-argument-only type that is also used in pure Alan code to indicate that the passed in argument may be mutated by the function body. (It can also be specified on Javascript functions for documentation purposes, but all arguments in Javascript are actually mutable references).
* `Dependency{N, V}` is a type used to define a 3rd party dependency, with `N` *usually* being the name of the dependency and `V` *usually* being the version of the dependency, but the specific meanings depend on the type the dependency type is embedded within.
* `Rust{D}` is a wrapper around the `Dependency{N, V}` type indicating that this is a native Rust dependency. If it is present when compiling to Javascript, it will cause a compilation error. The dependency's `N` is a string that specifies the name of the Rust crate, and `V` is either a Cargo version or a `git` URL to get the crate. Unlike in the standard `Cargo.toml` format, appending a hashtag (`#`) followed by a string you can specify the branch, tag, or commit SHA that should be checked out from the `git` URL.
* `Node{D}` is a wrapper around the `Dependency{N, V}` type indicating that it is a Node.js dependency. The dependency's `N` is a string that specifes the name of the Node module, and `V` is either an NPM version or a `git` URL to get the module. Similarly to the `Rust{D}` logic for `git` URLs, the hashtag (`#`) approach may also be used to determine the branch, tag, or commit SHA to use.
* `Import{N, D}` pulls the named resource `N` from the dependency `D`. If `D` is a `String`, then it is assumed to be the filename of an Alan source file, which is then loaded and the `N` resource is extracted from it. If it is a bare `Dependency{N, V}` that is assumed to be an Alan dependency, which currently fails because dependency resolution for Alan has not yet been defined. If it is a `Rust{D}` dependency, then the `N` value is assumed to exist in the Rust crate specified, and similarly if it is a `Node{D}`, the `N` value is assumed to exist in the Node module. There is no checking done for this declaration, so invalide code may be generated if this is incorrect.
* `From{D}` is a "magic" alternative to `Import{N, D}` that automatically figures out the `N` value that should be used based on the context in which it is invoked. Specifically if you are using the `type typename = ...` syntax or the `fn funcname ...` syntax, it will extract `typename` or `funcname` for you and then invoke `Import{N, D}` with it. Any other usage will result in a compile-time error.

#### Type types

The "Type" types are the types that are used to describe and build your own types out of other types. There are only surprisingly few of them.

* `Tuple{A, ...}` defines a tuple type, AKA a [product type](https://en.wikipedia.org/wiki/Product_type), a type where all sub-types must have a value defined for. The sub-values defined in the tuple are accessed with `.0`, `.1`, etc with the number corresponding to its location in the tuple.
* `Field{L, V}` defines a field type, which is a label `L` which must be a `String` and the value type `V`. Combine this with the `Tuple{A, ...}` type to get classic C-style structs. These fields may be accessed either with the numeric index *or* `.fieldname`.
* `Either{A, ..}` defines an either type, AKA a [sum type](https://en.wikipedia.org/wiki/Tagged_union), a type where only one sub-type is defined at a time. This can be paired with the `Field{L, V}` type to get a Tagged Union. The access is the same as with tuples (`.0`, etc or `.fieldname`) but as the value may not exist a special `Maybe{T}` type is returned (which is actually `Either{T, ()}`) that has special functions to inspect and access.
* `Buffer{T, S}` defines a buffer type, a fixed-length array where all values are of type `T` and there are an `Int` `S` number of entries in the buffer. It works similarly to a `Tuple` where all subtypes are the same type, except you also gain access to array access syntax since the return type is guaranteed to match in all cases. Using the `.0`, etc syntax checks the index at compile-time, so the value `T` type is accessed directly, while using the array access syntax `[0]`, where the number can be specified at runtime, returns a `Maybe{T}` that must be checked if it exists before being used.
* `Array{T}` defines an array type, which is a variable-length array where all values are of type `T`. It may only use array access syntax to access the values, so all values are extracted as `Maybe{T}`.

#### Compute types

The Compute types are types that compute some value based on the input types given to them. Currently, Alan allows for conditional compile-time execution but it does not support loops at compile-time. This may change in the future, but it will certainly be done in a way to prevent infinite looping if added (the type system is pretty expressive, already, and an actual type generated by looping may be too difficult to understand).

* `Prop{T, P}` extracts the sub-type from a `Tuple{A, ...}` or `Either{A, ...}` (in the `T` generic argument) by specifying the numeric integer index in the `P` generic argument, or if the desired type is wrapped in a `Field{L, V}` by setting `P` to the `String` matching the `L` generic argument to get the `V` value type. It is partway between a "Type" type and a Compute type as it returns the sub-type tree that is to be selected, but it is a compile-time failure if that is not possible, making it a compute type in that sense, and it is generally only useful for more complex generic functions.
* `Len{A}` extracts the length of the inner type as an `Int`. For `Buffer`, `Tuple`, and `Either` this extracts the number of elements defined by the type. For `Array` this is a compile-time failure, and for everything else it is `1`.
* `Size{T}` returns the size of the type in bytes if possible, and a compile-time failure otherwise. It currently fails in some situations that it should be able to calculate a value, so it would be best to avoid it when possible.
* `FileStr{F}` returns a `String` of the file specified in the `F` argument, useful for embedding large text strings in the code in a legible way. If the file doesn't exist, this is a compile-time failure.
* `Concat{A, B}` returns the `String` concatenation of two other `String`s, and fails if they are not a `String`.
* `Env{K}` reads the environment variable `K` at compile-time and returns the value as a `String`. It is a compile-time failure if the value does not exist.
* `EnvExists{K}` returns a `Bool` indicating if the environment variable key exists.
* `Fail{M}` defines a failure type. The `M` must be a `String` that is the failure message. If this type is ever evaluated this message is emitted by the compiler for the developer. It is therefore only useful within conditional types.
* `If{C, A, B}` is a conditional type. `C` must be a `Bool` while `A` and `B` can be any type. `A` is selected if `C` is `true`, otherwise `B` is selected.
* `If{C, T}` is a variant of the conditional type above, except it expects a two-element `Tuple` instead of two distinct types. The zero index element of the `Tuple` is the `true` path, and the one index element is the `false` path.
* `Env{K, D}` a variant of the `Env` type that accepts a default `String` as a second argument in case the `K` key does not exist. Logically equivalent to `type Env{K, D} = If{EnvExists{K}, Env{K}, D};` but a limitation in the compiler prevents overloading an intrinsic type with a user-defined type, so it is provided as another intrinsic type at the moment.
* `Neg{A}` negates the provided value. It may only be an `Int` or a `Float`. All other types are a compile-time error.
* `Add{A, B}` adds `A` to `B`. They must both be `Int` or `Float`. Any other type or a mismatch of types is a compile-time failure.
* `Sub{A, B}` subtracts `B` from `A`. They must both be `Int` or `Float`. Any other type or a mismatch of types is a compile-time failure.
* `Mul{A, B}` multiplies `A` and `B`. They must both be `Int` or `Float`. Any other type or a mismatch of types is a compile-time failure.
* `Div{A, B}` divides `A` by `B`. They must both be `Int` or `Float`. Any other type or a mismatch of types is a compile-time failure.
* `Mod{A, B}` performs the modulus (remainder) of `A` by `B`. They must both be `Int` only. Any other type is a compile-time failure.
* `Pow{A, B}` raises `A` to the power of `B`. They must both be `Int` or both be `Float`. Any other type or a mismatch of types is a compile-time failure.
* `Min{A, B}` returns the minimum of `A` and `B`. They must both be `Int` or both be `Float`. Any other type or a mismatch of types is a compile-time failure.
* `Max{A, B}` returns the maximum of `A` and `B`. They must both be `Int` or both be `Float`. Any other type or a mismatch of types is a compile-time failure.
* `Not{A}` performs a boolean or bitwise NOT. `A` must be `Int` or `Bool`. Any other type is a compile-time failure.
* `And{A, B}` performs a boolean or bitwise AND. They must both be `Int` or both be `Bool`. Any other type or a mismatch of types is a compile-time failure.
* `Or{A, B}` performs a boolean or bitwise OR. They must both be `Int` or both be `Bool`. Any other type or a mismatch of types is a compile-time failure.
* `Xor{A, B}` performs a boolean or bitwise XOR. They must both be `Int` or both be `Bool`. Any other type or a mismatch of types is a compile-time failure.
* `Nand{A, B}` performs a boolean or bitwise NAND. They must both be `Int` or both be `Bool`. Any other type or a mismatch of types is a compile-time failure.
* `Nor{A, B}` performs a boolean or bitwise NOR. They must both be `Int` or both be `Bool`. Any other type or a mismatch of types is a compile-time failure.
* `Xnor{A, B}` performs a boolean or bitwise XNOR. They must both be `Int` or both be `Bool`. Any other type or a mismatch of types is a compile-time failure.
* `Eq{A, B}` returns a `Bool` if `A` and `B` are the same. Only returns `true` if both are the same `Int`, `Float`, `Bool`, or `String` value, `false` otherwise.
* `Neq{A, B}` returns a `Bool` if `A` and `B` are the not the same. Only returns `false` if both are the `Int`, `Float`, `Bool`, or `String` values that differ, `true` otherwise.
* `Lt{A, B}` returns `true` if both are `Int` or `Float` and `A` is less than `B`, returns `false` otherwise.
* `Lte{A, B}` returns `true` if both are `Int` or `Float` and `A` is less than or equal to `B`, returns `false` otherwise.
* `Gt{A, B}` returns `true` if both are `Int` or `Float` and `A` is greater than `B`, returns `false` otherwise.
* `Gte{A, B}` returns `true` if both are `Int` or `Float` and `A` is greater than or equal to `B`, returns `false` otherwise.

### Constructed Types

Beyond the "Type" types above, the majority of the "every day useful" types are constructed types in Alan. This will be broken into a few categories: Configuration types, Optional types, Primitive types, Utility types, and GPGPU types. This is the order these different types are defined within the root scope definition (because believe it or not, the Primitive types can't be bound without the Configuration types already defined, for instance).

#### Configuration Types

* `Test` is a `Bool` that indicates whether or not the program is being compiled as a test.
* `Release` is a `Bool` that indicates whether or not the program is being compiled as a release build.
* `Debug` is a `Bool` that indicates whether or not the program is being compiled as a debug build. (Currently, this is unused. You can't make a `Debug` build, yet.)
* `Rs` is a `Bool` that indicates if the host language is Rust or not.
* `Js` is a `Bool` that indicates if the host language is Javascript or not. (Currently always the inverse of `Rs`, but if more target languages are added, not always the case, so this is included for completeness.)
* `Lin` is a `Bool` that indicates if the target platform is Linux.
* `Win` is a `Bool` that indicates if the target platform is Windows.
* `Mac` is a `Bool` that indicates if the target platform is MacOS.
* `Browser` is a `Bool` that indicates if the target platform is a web browser. (Currently always the same as `Js`, but that may not always be true in the future.)
* `RootBacking` is the reference to Alan standard library support library for the host language you are targeting. Everything within it *should* be bound for you already, so it should simply be an implementation detail.

#### Optional Types

* `void` is an alias for `()`, a group of nothing, and defines a type that has no value.
* `Self{T}` is an alias for `T`, allowing for an operator that should have zero impact on the resulting output (and is used to provide a cleaner-looking operator syntax for the `Buffer{T, S}` type.
* `Error` is the special error type for Alan. Rather than go with the overly complicated conversion of error types in Rust in order to bubble up errors through your API, this singular `Error` type works more like Javascript's `Error`. It is planned to provide a mechanism to attach metadata to the `Error` beyond the basic error message, but this has not been fleshed out, yet.
* `Fallible{T}` is `T | Error`. It's similar in concept to `Result<T, E>` in Rust, but the error type cannot be chosen, it is always `Error`. There are special built-in functions to work with this type.
* `Maybe{T}` is `T | ()`. It is similar in concept to `Option<T>` in Rust. There are special built-in functions to work with this type (and most are identical to those for `Fallible{T}`).

#### Primitive Types

* `f32` constructs a 32-bit IEEE-754 floating point number.
* `f64` constructs a 64-bit IEEE-754 floating point number.
* `u8` constructs an 8-bit unsigned integer. (0 to 255)
* `u16` constructs a 16-bit unsigned integer. (0 to 65_535)
* `u32` constructs a 32-bit unsigned integer. (0 to 4_294_967_295)
* `u64` constructs a 64-bit unsigned integer. (0 to 18_446_744_073_709_551_615)
* `i8` constructs an 8-bit signed integer. (-128 to 127)
* `i16` constructs a 16-bit signed integer. (-32_768 to 32_767)
* `i32` constructs a 32-bit signed integer. (-2_147_483_648 to 2_147_483_647)
* `i64` constructs a 64-bit signed integer. (-9_223_372_036_854_775_808 to 9_223_372_036_854_775_807)
* `string` constructs a UTF-8 string. (Note: `String` is a compile-time string, while `string` is a run-time string. The default constructor function for a `String` produces a `string`.)
* `bool` constructs a boolean. (Note: `Bool` is a compile-time boolean, while `bool` is a run-time boolean. The default constructor function for a `Bool` produces a `bool`.)

#### Utility Types

* `ExitCode` is a special type that the `main` function may return to indicate a non-successful execution to the parent process.
* `Instant` and `Duration` are bound from Rust when compiling to Rust to allow for performance checking at run-time in Rust. `Performance` is similarly bound when compiling to Javascript for those purposes there. These types are not unified, but a small collection of functions with very similar calling structure allows one set or the other to be used efficiently in your code.
* `uuid` provides a UUIDv4 type. (v4 is the correct choice for a UUID the vast majority of the time. If you *really* need a different kind, you need to BYOB.)
* `Dict{K, V}` is a dictionary type. It maintains key insertion order when serialized to an `Array{(K, V)}` or similar.
* `Set{V}` is a set type. It does not maintain insertion order.
* `Tree{T}` is a tree type. It allows recursive-like data structures without an actually recursive type.
* `Node{T}` is a node type. It represents a singular node within a tree.
* `Testing` is a special type that only exists when `Test` is true, and is used for defining a test suite to execute during the test.

#### GPGPU Types

* `BufferUsages` is a type indicating how a GPU Buffer's memory may be accessed. The vast majority of the time you will not need to use this directly, but it is available for unusual needs.
* `GBuffer` is the GPU Buffer type. It represents a block of memory and currently is not a generic type, though it should be. (This is one of the last blockers of Alan v0.2.0 being released.) It it somewhere in between an `Array{T}` and `Buffer{T, S}`: it is sized at run-time, but once created its size may not be altered.
* `GPGPU` is a type representing work to do on the GPU. It can be constructed manually but is meant to be handled by other built-in functions, instead.
* `WgpuType{N}` is a meta-type for defining an AST node for the various primitive GPU types. By being a singular generic type the primary `GPGPU` constructor function `build` can accept any of them and successfully build WGSL shadercode that eventually produces the desired value of the desired type.
* `WgpuTypeMap` is a currently-unused mapping of GPU internal primitive types to CPU primitive types.
* `gu32` is a GPU 32-bit unsigned integer.
* `gi32` is a GPU 32-bit signed integer.
* `gf32` is a GPU 32-bit IEEE-754 floating point number.
* `gbool` is a GPU boolean.
* `gvec2u` is a 2-element unsigned integer vector.
* `gvec2i` is a 2-element signed integer vector.
* `gvec2f` is a 2-element floating point vector.
* `gvec2b` is a 2-element boolean vector.
* `gvec3u` is a 3-element unsigned integer vector.
* `gvec3i` is a 3-element signed integer vector.
* `gvec3f` is a 3-element floating point vector.
* `gvec3b` is a 3-element boolean vector.
* `gvec4u` is a 4-element unsigned integer vector.
* `gvec4i` is a 4-element signed integer vector.
* `gvec4f` is a 4-element floating point vector.
* `gvec4b` is a 4-element boolean vector.
* `gmat2x2f` is a 2x2 matrix (all matrices are floating point in WGSL)
* `gmat2x3f` is a 2x3 matrix.
* `gmat2x4f` is a 2x4 matrix.
* `gmat3x2f` is a 3x2 matrix.
* `gmat3x3f` is a 3x3 matrix.
* `gmat3x4f` is a 3x4 matrix.
* `gmat4x2f` is a 4x2 matrix.
* `gmat4x3f` is a 4x3 matrix.
* `gmat4x4f` is a 4x4 matrix.
* `Window` is a special type for configuring a window for rendering to the screen (rather than doing GPGPU work).
* `Frame` is a special type for accessing the context on the GPU for the rendering of an individual frame to render.

## Type Operators

Many, but not all, of the built-in types are bound to operators in the type system. Some of these, like `Tuple{A, ...}`, become symbols you don't normally expect of operators (in this case, it becomes `,`). Operators also have a precedence level. In Alan the higher the precedence number, the more "greedy" it is, so multiplication has a higher precedence level than addition, for example. Tie-breaker precedence is left-to-right evaluation.

Alan has a special type operator syntax so you can declare new operators for the type system and specify the precedence they should take; but these *cannot* be exported out of your module, they need to be re-declared in any file you wish to use the custom type operator, but this isn't a huge burden as they are all one-line, top-level statements and deviation from the standard type syntax should be explicit, anyways.

This means the only type operator precedence table you need to know is the one baked into the root scope of every module, listed below:

| Type         | -fix    | Symbol | Precedence |
| :----------- | :------ | :----: | ---------: |
| `Self`       | Postfix | `]`    | 11         |
| `Prop`       | Infix   | `.`    | 6          |
| `Array`      | Postfix | `[]`   | 5          |
| `Fallible`   | Postfix | `!`    | 5          |
| `Maybe`      | Postfix | `?`    | 5          |
| `Not`        | Prefix  | `~`    | 5          |
| `Pow`        | Infix   | `**`   | 5          |
| `And`        | Infix   | `&&`   | 4          |
| `Div`        | Infix   | `/`    | 4          |
| `Function`   | Infix   | `->`   | 4          |
| `Mod`        | Infix   | `%`    | 4          |
| `Mul`        | Infix   | `*`    | 4          |
| `Nand`       | Infix   | `!&`   | 4          |
| `Add`        | Infix   | `+`    | 3          |
| `Nor`        | Infix   | `!|`   | 3          |
| `Or`         | Infix   | `||`   | 3          |
| `Sub`        | Infix   | `-`    | 3          |
| `Xnor`       | Infix   | `!^`   | 3          |
| `Xor`        | Infix   | `^`    | 3          |
| `Buffer`     | Infix   | `[`    | 2          |
| `Dependency` | Infix   | `@`    | 1          |
| `Eq`         | Infix   | `==`   | 1          |
| `Field`      | Infix   | `:`    | 1          |
| `Gt`         | Infix   | `>`    | 1          |
| `Gte`        | Infix   | `>=`   | 1          |
| `If`         | Infix   | `:?`   | 1          |
| `Lt`         | Infix   | `<`    | 1          |
| `Lte`        | Infix   | `<=`   | 1          |
| `Neq`        | Infix   | `!=`   | 1          |
| `AnyOf`      | Infix   | `&`    | 0          |
| `Call`       | Infix   | `::`   | 0          |
| `Either`     | Infix   | `|`    | 0          |
| `From`       | Prefix  | `<--`  | 0          |
| `Import`     | Infix   | `<-`   | 0          |
| `Tuple`      | Infix   | `,`    | 0          |


## Functions

Functions in Alan work a bit differently than in most programming languages. Function dispatch is based on both the function name and the arguments (number and type) they are called with. This way you can have both `add(i16, i16)` and `add(f32, f32)` and they do not overwrite each other.

Generic functions also automatically attempt to infer their generic arguments at the callsite (which is doable *if* the generic arguments are all used in the input arguments of the function, not if any of them only exist in the output), so an `add{T}(T, T)` will also match for a call to an `add` function.

How does Alan decide which function is the "best" to use if multiple match? The other way Alan differs from most languages is that function definition order matters, so the most-recently-defined matching function wins.

So you can define a generic function that should work for all types you care about, but then afterwards define specialized functions for particular types where optimizations are possible and as they were defined later, code that follows after that definition will prefer the specialized versions over the generic version.

This influences the order in which explicit functions are defined in Alan's root scope; the generic functions that apply as broadly as possible are first, and specialized functions follow.

Explicit functions? That's the third way that Alan differs from most languages. In most languages types and very rigid, and certain kinds of types get certain language constructs, such as accessing properties from a struct. In Alan *all* of this is done with functions. A property access is simply taking a value of one type in and returning a value of a different type; it just happens to be a sub-type of the original type from the language's perspective. So instead in Alan all single-argument functions can be called with property syntax.

So therefore when you define a new type, you're *also* implicitly defining a set of functions that work with that type to be able to access sub-types, construct the type, etc.

This is only not true when you bind a native type. Alan has no idea what can be done with a bound native type, so you must also define all of the function calls that will work with that native type. Because the primitive types in Alan are all bound to the host language for better performance, there are several explicit functions to be described that would be implicitly defined otherwise.

For clarity, the table of functions will be broken up into broad categories, and whether or not it is explicit or implicit will be called out, however, implicit functions from the root scope are only involving the `Tree{T}`, `Node{T}` and some of the GPGPU types, and even there explicit constructor and accessor functions have been defined for easier use of them. Because of this, most tables will not have an `Is Explicit` column, and when that is so, you can assume that they *all* are.

### Functions for (potentially) every type

| Name       | Type               | Description                |
| :--------- | :----------------- | :---------------------------------------------------------- |
| `clone{T}` | `T -> T`           | Creates a copy of the data                                  |
| `void{T}`  | `T -> void`        | Consumes a value, useful for one-line side-effect functions |
| `void`     | `() -> void`       | Explicitly returns nothing                                  |
| `store{T}` | `(Mut{T}, T) -> T` | Replaces the first arg with the second, returning the first |


### Fallbile, Maybe, and Either functions

| Name          | Type                | Description                                     | Explicit |
| :------------ | :------------------ | :---------------------------------------------- | :------: |
| `Maybe{T}`    | `T -> T?`           | Wraps a value in a `Maybe{T}`                   | ❌       |
| `Maybe{T}`    | `() -> T?`          | Wraps a `void` in a `Maybe{T}`                  | ❌       |
| `Maybe{T}`    | `T! -> T?`          | Converts a `Fallible` into a `Maybe`            | ✅       |
| `Fallible{T}` | `T -> T!`           | Wraps a value in a `Fallible{T}`                | ❌       |
| `Fallible{T}` | `Error -> T!`       | Wraps an `Error` in a `Fallible{T}`             | ❌       |
| `Fallible{T}` | `(T?, Error) -> T!` | Converts a `Maybe` into a `Fallible`            | ✅       |
| `getOr{T, U}` | `(U, T) -> T`       | Converts a value of type `U` to `T` or defaults | ✅       |
| `getOr{T}`    | `(T?, T) -> T`      | Unwraps a `Maybe{T}` or returns a default `T`   | ✅       |
| `getOr{T}`    | `(T!, T) -> T`      | Unwraps a `Fallible{T}` or returns a default `T`| ✅       |
| `getOrExit{T}`| `T! -> T`           | Unwraps a `Fallible{T}` or halts the program    | ✅       |
| `getOrExit{T}`| `T? -> T`           | Unwraps a `Maybe{T}` or halts the program       | ✅       |
| `Error{T}`    | `string -> T!`      | Turns an error message into a `Fallible{T}`     | ✅       |
| `Error`       | `string -> Error`   | Turns an error message into an `Error`          | ✅       |
| `exists{T}`   | `T? -> bool`        | Returns whether a `Maybe{T}` has a value        | ✅       |
| `string`      | `Error -> string`   | Returns the error message from the `Error`      | ✅       |

### Primitive type casting functions

| Name   | Type             | Description                                                        |
| :----- | :--------------- | :----------------------------------------------------------------- |
| `f32`  | `i8 -> f32`      | Casts the `i8` integer into an `f32`                               |
| `f32`  | `i16 -> f32`     | Casts the `i16` integer into an `f32`                              |
| `f32`  | `i32 -> f32`     | Casts the `i32` integer into an `f32`                              |
| `f32`  | `i64 -> f32`     | Casts the `i64` integer into an `f32`                              |
| `f32`  | `u8 -> f32`      | Casts the `u8` integer into an `f32`                               |
| `f32`  | `u16 -> f32`     | Casts the `u16` integer into an `f32`                              |
| `f32`  | `u32 -> f32`     | Casts the `u32` integer into an `f32`                              |
| `f32`  | `u64 -> f32`     | Casts the `u64` integer into an `f32`                              |
| `f32`  | `f32 -> f32`     | Returns the original `f32` back                                    |
| `f32`  | `f64 -> f32`     | Casts the `f64` float into an `f32`                                |
| `f32`  | `string -> f32!` | Parses the `string` for an `f32`, returns `f32!` in case it cannot |
| `f64`  | `i8 -> f64`      | Casts the `i8` integer into an `f64`                               |
| `f64`  | `i16 -> f64`     | Casts the `i16` integer into an `f64`                              |
| `f64`  | `i32 -> f64`     | Casts the `i32` integer into an `f64`                              |
| `f64`  | `i64 -> f64`     | Casts the `i64` integer into an `f64`                              |
| `f64`  | `u8 -> f64`      | Casts the `u8` integer into an `f64`                               |
| `f64`  | `u16 -> f64`     | Casts the `u16` integer into an `f64`                              |
| `f64`  | `u32 -> f64`     | Casts the `u32` integer into an `f64`                              |
| `f64`  | `u64 -> f64`     | Casts the `u64` integer into an `f64`                              |
| `f64`  | `f32 -> f64`     | Casts the `f32` float into an `f64`                                |
| `f64`  | `f64 -> f64`     | Returns the original `f64` back                                    |
| `f64`  | `string -> f64!` | Parses the `string` for an `f64`, returns `f64!` in case it cannot |
| `u8`   | `i8 -> u8`       | Casts the `i8` integer into a `u8`                                 |
| `u8`   | `i16 -> u8`      | Casts the `i16` integer into a `u8`                                |
| `u8`   | `i32 -> u8`      | Casts the `i32` integer into a `u8`                                |
| `u8`   | `i64 -> u8`      | Casts the `i64` integer into a `u8`                                |
| `u8`   | `u8 -> u8`       | Returns the original `u8` back                                     |
| `u8`   | `u16 -> u8`      | Casts the `u16` itneger into a `u8`                                |
| `u8`   | `u32 -> u8`      | Casts the `u32` integer into a `u8`                                |
| `u8`   | `u64 -> u8`      | Casts the `u64` integer into a `u8`                                |
| `u8`   | `f32 -> u8`      | Casts the `f32` float into a `u8`                                  |
| `u8`   | `f64 -> u8`      | Casts the `f64` float into a `u8`                                  |
| `u8`   | `string -> u8!`  | Parses the `string` for a `u8`, returns `u8!` in case it cannot    |
| `u16`  | `i8 -> u16`      | Casts the `i8` integer into a `u16`                                |
| `u16`  | `i16 -> u16`     | Casts the `i16` integer into a `u16`                               |
| `u16`  | `i32 -> u16`     | Casts the `i32` integer into a `u16`                               |
| `u16`  | `i64 -> u16`     | Casts the `i64` integer into a `u16`                               |
| `u16`  | `u8 -> u16`      | Casts the `u8` itneger into a `u16`                                |
| `u16`  | `u16 -> u16`     | Returns the original `u16` back                                    |
| `u16`  | `u32 -> u16`     | Casts the `u32` integer into a `u16`                               |
| `u16`  | `u64 -> u16`     | Casts the `u64` integer into a `u16`                               |
| `u16`  | `f32 -> u16`     | Casts the `f32` float into a `u16`                                 |
| `u16`  | `f64 -> u16`     | Casts the `f64` float into a `u16`                                 |
| `u16`  | `string -> u16!` | Parses the `string` for a `u16`, returns `u16!` in case it cannot  |
| `u32`  | `i8 -> u32`      | Casts the `i8` integer into a `u32`                                |
| `u32`  | `i16 -> u32`     | Casts the `i16` integer into a `u32`                               |
| `u32`  | `i32 -> u32`     | Casts the `i32` integer into a `u32`                               |
| `u32`  | `i64 -> u32`     | Casts the `i64` integer into a `u32`                               |
| `u32`  | `u8 -> u32`      | Casts the `u8` itneger into a `u32`                                |
| `u32`  | `u16 -> u32`     | Casts the `u16` integer into a `u32`                               |
| `u32`  | `u32 -> u32`     | Returns the original `u32` back                                    |
| `u32`  | `u64 -> u32`     | Casts the `u64` integer into a `u32`                               |
| `u32`  | `f32 -> u32`     | Casts the `f32` float into a `u32`                                 |
| `u32`  | `f64 -> u32`     | Casts the `f64` float into a `u32`                                 |
| `u32`  | `string -> u32!` | Parses the `string` for a `u32`, returns `u32!` in case it cannot  |
| `u64`  | `i8 -> u64`      | Casts the `i8` integer into a `u64`                                |
| `u64`  | `i16 -> u64`     | Casts the `i16` integer into a `u64`                               |
| `u64`  | `i32 -> u64`     | Casts the `i32` integer into a `u64`                               |
| `u64`  | `i64 -> u64`     | Casts the `i64` integer into a `u64`                               |
| `u64`  | `u8 -> u64`      | Casts the `u8` itneger into a `u64`                                |
| `u64`  | `u16 -> u64`     | Casts the `u16` integer into a `u64`                               |
| `u64`  | `u32 -> u64`     | Casts the `u32` integer into a `u64`                               |
| `u64`  | `u64 -> u64`     | Returns the original `u64` back                                    |
| `u64`  | `f32 -> u64`     | Casts the `f32` float into a `u64`                                 |
| `u64`  | `f64 -> u64`     | Casts the `f64` float into a `u64`                                 |
| `u64`  | `string -> u64!` | Parses the `string` for a `u64`, returns `u64!` in case it cannot  |
| `i8`   | `i8 -> i8`       | Returns the original `i8` back                                     |
| `i8`   | `i16 -> i8`      | Casts the `i16` integer into a `i8`                                |
| `i8`   | `i32 -> i8`      | Casts the `i32` integer into a `i8`                                |
| `i8`   | `i64 -> i8`      | Casts the `i64` integer into a `i8`                                |
| `i8`   | `u8 -> i8`       | Casts the `u8` integer into a `i8`                                 |
| `i8`   | `u16 -> i8`      | Casts the `u16` itneger into a `i8`                                |
| `i8`   | `u32 -> i8`      | Casts the `u32` integer into a `i8`                                |
| `i8`   | `u64 -> i8`      | Casts the `u64` integer into a `i8`                                |
| `i8`   | `f32 -> i8`      | Casts the `f32` float into a `i8`                                  |
| `i8`   | `f64 -> i8`      | Casts the `f64` float into a `i8`                                  |
| `i8`   | `string -> i8!`  | Parses the `string` for a `i8`, returns `i8!` in case it cannot    |
| `i16`  | `i8 -> i16`      | Casts the `i8` integer into a `i16`                                |
| `i16`  | `i16 -> i16`     | Returns the original `i16` back                                    |
| `i16`  | `i32 -> i16`     | Casts the `i32` integer into a `i16`                               |
| `i16`  | `i64 -> i16`     | Casts the `i64` integer into a `i16`                               |
| `i16`  | `u8 -> i16`      | Casts the `u8` integer into a `i16`                                |
| `i16`  | `u16 -> i16`     | Casts the `u16` itneger into a `i16`                               |
| `i16`  | `u32 -> i16`     | Casts the `u32` integer into a `i16`                               |
| `i16`  | `u64 -> i16`     | Casts the `u64` integer into a `i16`                               |
| `i16`  | `f32 -> i16`     | Casts the `f32` float into a `i16`                                 |
| `i16`  | `f64 -> i16`     | Casts the `f64` float into a `i16`                                 |
| `i16`  | `string -> i16!` | Parses the `string` for a `i16`, returns `i16!` in case it cannot  |
| `i32`  | `i8 -> i32`      | Casts the `i8` integer into a `i32`                                |
| `i32`  | `i16 -> i32`     | Casts the `i16` integer into a `i32`                               |
| `i32`  | `i32 -> i32`     | Returns the original `i32` back                                    |
| `i32`  | `i64 -> i32`     | Casts the `i64` integer into a `i32`                               |
| `i32`  | `u8 -> i32`      | Casts the `u8` integer into a `i32`                                |
| `i32`  | `u16 -> i32`     | Casts the `u16` itneger into a `i32`                               |
| `i32`  | `u32 -> i32`     | Casts the `u32` integer into a `i32`                               |
| `i32`  | `u64 -> i32`     | Casts the `u64` integer into a `i32`                               |
| `i32`  | `f32 -> i32`     | Casts the `f32` float into a `i32`                                 |
| `i32`  | `f64 -> i32`     | Casts the `f64` float into a `i32`                                 |
| `i32`  | `string -> i32!` | Parses the `string` for a `i32`, returns `i32!` in case it cannot  |
| `i64`  | `i8 -> i64`      | Casts the `i8` integer into a `i64`                                |
| `i64`  | `i16 -> i64`     | Casts the `i16` integer into a `i64`                               |
| `i64`  | `i32 -> i64`     | Casts the `i32` integer into a `i64`                               |
| `i64`  | `i64 -> i64`     | Returns the original `i64` back                                    |
| `i64`  | `u8 -> i64`      | Casts the `u8` integer into a `i64`                                |
| `i64`  | `u16 -> i64`     | Casts the `u16` itneger into a `i64`                               |
| `i64`  | `u32 -> i64`     | Casts the `u32` integer into a `i64`                               |
| `i64`  | `u64 -> i64`     | Casts the `u64` integer into a `i64`                               |
| `i64`  | `f32 -> i64`     | Casts the `f32` float into a `i64`                                 |
| `i64`  | `f64 -> i64`     | Casts the `f64` float into a `i64`                                 |
| `i64`  | `string -> i64!` | Parses the `string` for a `i64`, returns `i64!` in case it cannot  |
| `bool` | `i8 -> bool`     | Casts the `i8` to a `bool`                                         |
| `bool` | `i16 -> bool`    | Casts the `i16` to a `bool`                                        |
| `bool` | `i32 -> bool`    | Casts the `i32` to a `bool`                                        |
| `bool` | `i64 -> bool`    | Casts the `i64` to a `bool`                                        |
| `bool` | `u8 -> bool`     | Casts the `u8` to a `bool`                                         |
| `bool` | `u16 -> bool`    | Casts the `u16` to a `bool`                                        |
| `bool` | `u32 -> bool`    | Casts the `u32` to a `bool`                                        |
| `bool` | `u64 -> bool`    | Casts the `u64` to a `bool`                                        |
| `bool` | `f32 -> bool`    | Casts the `f32` to a `bool`                                        |
| `bool` | `f64 -> bool`    | Casts the `f64` to a `bool`                                        |
| `bool` | `string -> bool` | Casts the `string` to a `bool` (`'true'` is `true`, else `false`)  |

### Bitcasting functions

| Name    | Type         | Description                        |
| :------ | :----------- | :--------------------------------- |
| `asU8`  | `u8 -> u8`   | Returns the original value         |
| `asU8`  | `i8 -> u8`   | Returns the `i8` byte as a `u8`    |
| `asU16` | `u16 -> u16` | Returns the original value         |
| `asU16` | `i16 -> u16` | Returns the `i16` byte as a `u16`  |
| `asU32` | `u32 -> u32` | Returns the original value         |
| `asU32` | `i32 -> u32` | Returns the `i32` byte as a `u32`  |
| `asU32` | `f32 -> u32` | Returns the `f32` byte as a `u32`  |
| `asU64` | `u64 -> u64` | Returns the original value         |
| `asU64` | `i64 -> u64` | Returns the `i64` byte as a `u64`  |
| `asU64` | `f64 -> u64` | Returns the `f64` byte as a `u64`  |
| `asI8`  | `u8 -> i8`   | Returns the `u8` byte as an `i8`   |
| `asI8`  | `i8 -> i8`   | Returns the original value         |
| `asI16` | `u16 -> i16` | Returns the `u16` byte as an `i16` |
| `asI16` | `i16 -> i16` | Returns the original value         |
| `asI32` | `u32 -> i32` | Returns the `u32` byte as an `i32` |
| `asI32` | `i32 -> i32` | Returns the original value         |
| `asI32` | `f32 -> i32` | Returns the `f32` byte as an `i32` |
| `asI64` | `u64 -> i64` | Returns the `u64` byte as an `i64` |
| `asI64` | `i64 -> i64` | Returns the original value         |
| `asI64` | `f64 -> i64` | Returns the `f64` byte as an `i64` |
| `asF32` | `u32 -> f32` | Returns the `u32` byte as an `f32` |
| `asF32` | `i32 -> f32` | Returns the `i32` byte as an `f32` |
| `asF32` | `f32 -> f32` | Returns the original value         |
| `asF64` | `u64 -> f64` | Returns the `u64` byte as an `f64` |
| `asF64` | `i64 -> f64` | Returns the `i64` byte as an `f64` |
| `asF64` | `f64 -> f64` | Returns the original value         |

### Boolean-related functions

| Name    | Type                               | Description                                                   |
| :------ | :--------------------------------- | :------------------------------------------------------------ |
| `and`   | `(bool, bool) -> bool`             | Boolean AND (`true` if both inputs `true`)                    |
| `or`    | `(bool, bool) -> bool`             | Boolean OR  (`true` if any input `true`)                      |
| `xor`   | `(bool, bool) -> bool`             | Boolean XOR (`true` if only one input `true`)                 |
| `not`   | `bool -> bool`                     | Boolean NOT (flips `true` and `false`)                        |
| `nand`  | `(bool, bool) -> bool`             | Boolean NAND (`true` if any input `false`)                    |
| `nor`   | `(bool, bool) -> bool`             | Boolean NOR (`true` if both inputs `false`)                   |
| `xnor`  | `(bool, bool) -> bool`             | Boolean XNOR (`true` if both inputs the same)                 |
| `eq`    | `(bool, bool) -> bool`             | Equals (`true` if both inputs the same, see `xnor`)           |
| `neq`   | `(bool, bool) -> bool`             | Not Equals (`true` if both inputs differ, see `xor`)          |
| `if{T}` | `(bool, T) -> T?`                  | Returns a `Maybe{T}` that has the specified value or not      |
| `if{T}` | `(bool, T, T) -> T`                | Returns the first or second `T` depending on the `bool`       |
| `if{T}` | `(bool, () -> T) -> T?`            | Returns a `Maybe{T}` that may have the output of the callback |
| `if{T}` | `(bool, () -> T, () -> T) -> T`    | Returns the first or second `T` function result               |
| `if`    | `(bool, () -> ()) -> ()`           | Runs the side-effect function only if `true`                  |
| `if`    | `(bool, () -> (), () -> ()) -> ()` | Runs either the first or second side-effect function          |

### Float-related functions

| Name          | Type                     | Description                                                              |
| :------------ | :----------------------- | :----------------------------------------------------------------------- |
| `add`         | `(f32, f32) -> f32`      | Adds two `f32`s together                                                 |
| `sub`         | `(f32, f32) -> f32`      | Subtracts two `f32`s                                                     |
| `mul`         | `(f32, f32) -> f32`      | Multiplies two `f32`s                                                    |
| `div`         | `(f32, f32) -> f32`      | Divides two `f32`s                                                       |
| `sqrt`        | `f32 -> f32`             | Returns the square root of an `f32`                                      |
| `pow`         | `(f32, f32) -> f32`      | Raises the first `f32` to the power of the second                        |
| `abs`         | `f32 -> f32`             | Returns the positive version of the `f32`                                |
| `neg`         | `f32 -> f32`             | Multiplies the `f32` by `-1`                                             |
| `eq`          | `(f32, f32) -> bool`     | Returns `true` if the two `f32`s are equal                               |
| `neq`         | `(f32, f32) -> bool`     | Returns `true` if the two `f32`s are not equal                           |
| `lt`          | `(f32, f32) -> bool`     | Returns `true` if the first `f32` is less than the second                |
| `lte`         | `(f32, f32) -> bool`     | Returns `true` if the first `f32` is less than or equal to the second    |
| `gt`          | `(f32, f32) -> bool`     | Returns `true` if the first `f32` is greater than the second             |
| `gte`         | `(f32, f32) -> bool`     | Returns `true` if the first `f32` is greater than or equal to the second |
| `min`         | `(f32, f32) -> f32`      | Returns the smaller `f32`                                                |
| `max`         | `(f32, f32) -> f32`      | Returns the larger `f32`                                                 |
| `clamp`       | `(f32, f32, f32) -> f32` | Clamps the first `f32` to be above the second and below the third        |
| `saturate`    | `f32 -> f32`             | Clamps the `f32` between `0` and `1`                                     |
| `floor`       | `f32 -> f32`             | Rounds the `f32` down to the nearest integer                             |
| `ceil`        | `f32 -> f32`             | Rounds the `f32` up to the nearest integer                               |
| `acos`        | `f32 -> f32`             | Calculates the arccosine of the `f32`                                    |
| `acosh`       | `f32 -> f32`             | Calculates the hyperbolic arccosine of the `f32`                         |
| `asin`        | `f32 -> f32`             | Calculates the arcsine of the `f32`                                      |
| `asinh`       | `f32 -> f32`             | Calculates the hyperbolic arcsine of the `f32`                           |
| `atan`        | `f32 -> f32`             | Calculates the arctangent of the `f32`                                   |
| `atan2`       | `(f32, f32) -> f32`      | Calculates the arctangent of the two sides defined by the `f32`s         |
| `cos`         | `f32 -> f32`             | Calculates the cosine of the `f32`                                       |
| `cosh`        | `f32 -> f32`             | Calculates the hyperbolic cosine of the `f32`                            |
| `sin`         | `f32 -> f32`             | Calculates the sine of the `f32`                                         |
| `sinh`        | `f32 -> f32`             | Calculates the hyperbolic sine of the `f32`                              |
| `tan`         | `f32 -> f32`             | Calculates the tangent of the `f32`                                      |
| `tanh`        | `f32 -> f32`             | Calculates the hyperbolic tangent of the `f32`                           |
| `exp`         | `f32 -> f32`             | Raises `e` to the power of the `f32`                                     |
| `ln`          | `f32 -> f32`             | Calculates the natural log of the `f32`                                  |
| `log2`        | `f32 -> f32`             | Calculates the log base 2 of the `f32`                                   |
| `log10`       | `f32 -> f32`             | Calculates the log base 10 of the `f32`                                  |
| `sec`         | `f32 -> f32`             | Calculates the secant of the `f32`                                       |
| `csc`         | `f32 -> f32`             | Calculates the cosecant of the `f32`                                     |
| `cot`         | `f32 -> f32`             | Calculates the cotangent of the `f32`                                    |
| `asec`        | `f32 -> f32`             | Calculates the arcsecant of the `f32`                                    |
| `acsc`        | `f32 -> f32`             | Calculates the arccosecant of the `f32`                                  |
| `acot`        | `f32 -> f32`             | Calculates the arccotangent of the `f32`                                 |
| `sech`        | `f32 -> f32`             | Calculates the hyperbolic secant of the `f32`                            |
| `csch`        | `f32 -> f32`             | Calculates the hyperbolic cosecant of the `f32`                          |
| `coth`        | `f32 -> f32`             | Calculates the hyperbolic cotangent of the `f32`                         |
| `asech`       | `f32 -> f32`             | Calculates the hyperbolic arcsecant of the `f32`                         |
| `acsch`       | `f32 -> f32`             | Calculates the hyperbolic arccosecant of the `f32`                       |
| `acoth`       | `f32 -> f32`             | Calculates the hyperbolic arccotangent of the `f32`                      |
| `round`       | `f32 -> f32`             | Rounds the number to the nearest integer, ties break even                |
| `magnitude`   | `f32 -> f32`             | Returns the positive version of the `f32`                                |
| `inverseSqrt` | `f32 -> f32`             | Calculates the inverse square root (`1/sqrt(x)`) of the `f32`            |
| `fma`         | `(f32, f32, f32) -> f32` | Calculates the fused multiply-add of the three `f32`s                    |
| `fract`       | `f32 -> f32`             | Calculates the fractional component of the `f32`                         |
| `add`         | `(f64, f64) -> f64`      | Adds two `f64`s together                                                 |
| `sub`         | `(f64, f64) -> f64`      | Subtracts two `f64`s                                                     |
| `mul`         | `(f64, f64) -> f64`      | Multiplies two `f64`s                                                    |
| `div`         | `(f64, f64) -> f64`      | Divides two `f64`s                                                       |
| `sqrt`        | `f64 -> f64`             | Returns the square root of an `f64`                                      |
| `pow`         | `(f64, f64) -> f64`      | Raises the first `f64` to the power of the second                        |
| `abs`         | `f64 -> f64`             | Returns the positive version of the `f64`                                |
| `neg`         | `f64 -> f64`             | Multiplies the `f64` by `-1`                                             |
| `eq`          | `(f64, f64) -> bool`     | Returns `true` if the two `f64`s are equal                               |
| `neq`         | `(f64, f64) -> bool`     | Returns `true` if the two `f64`s are not equal                           |
| `lt`          | `(f64, f64) -> bool`     | Returns `true` if the first `f64` is less than the second                |
| `lte`         | `(f64, f64) -> bool`     | Returns `true` if the first `f64` is less than or equal to the second    |
| `gt`          | `(f64, f64) -> bool`     | Returns `true` if the first `f64` is greater than the second             |
| `gte`         | `(f64, f64) -> bool`     | Returns `true` if the first `f64` is greater than or equal to the second |
| `min`         | `(f64, f64) -> f64`      | Returns the smaller `f64`                                                |
| `max`         | `(f64, f64) -> f64`      | Returns the larger `f64`                                                 |
| `clamp`       | `(f64, f64, f64) -> f64` | Clamps the first `f64` to be above the second and below the third        |
| `saturate`    | `f64 -> f64`             | Clamps the `f64` between `0` and `1`                                     |
| `floor`       | `f64 -> f64`             | Rounds the `f64` down to the nearest integer                             |
| `ceil`        | `f64 -> f64`             | Rounds the `f64` up to the nearest integer                               |
| `acos`        | `f64 -> f64`             | Calculates the arccosine of the `f64`                                    |
| `acosh`       | `f64 -> f64`             | Calculates the hyperbolic arccosine of the `f64`                         |
| `asin`        | `f64 -> f64`             | Calculates the arcsine of the `f64`                                      |
| `asinh`       | `f64 -> f64`             | Calculates the hyperbolic arcsine of the `f64`                           |
| `atan`        | `f64 -> f64`             | Calculates the arctangent of the `f64`                                   |
| `atan2`       | `(f64, f64) -> f64`      | Calculates the arctangent of the two sides defined by the `f64`s         |
| `cos`         | `f64 -> f64`             | Calculates the cosine of the `f64`                                       |
| `cosh`        | `f64 -> f64`             | Calculates the hyperbolic cosine of the `f64`                            |
| `sin`         | `f64 -> f64`             | Calculates the sine of the `f64`                                         |
| `sinh`        | `f64 -> f64`             | Calculates the hyperbolic sine of the `f64`                              |
| `tan`         | `f64 -> f64`             | Calculates the tangent of the `f64`                                      |
| `tanh`        | `f64 -> f64`             | Calculates the hyperbolic tangent of the `f64`                           |
| `exp`         | `f64 -> f64`             | Raises `e` to the power of the `f64`                                     |
| `ln`          | `f64 -> f64`             | Calculates the natural log of the `f64`                                  |
| `log2`        | `f64 -> f64`             | Calculates the log base 2 of the `f64`                                   |
| `log10`       | `f64 -> f64`             | Calculates the log base 10 of the `f64`                                  |
| `sec`         | `f64 -> f64`             | Calculates the secant of the `f64`                                       |
| `csc`         | `f64 -> f64`             | Calculates the cosecant of the `f64`                                     |
| `cot`         | `f64 -> f64`             | Calculates the cotangent of the `f64`                                    |
| `asec`        | `f64 -> f64`             | Calculates the arcsecant of the `f64`                                    |
| `acsc`        | `f64 -> f64`             | Calculates the arccosecant of the `f64`                                  |
| `acot`        | `f64 -> f64`             | Calculates the arccotangent of the `f64`                                 |
| `sech`        | `f64 -> f64`             | Calculates the hyperbolic secant of the `f64`                            |
| `csch`        | `f64 -> f64`             | Calculates the hyperbolic cosecant of the `f64`                          |
| `coth`        | `f64 -> f64`             | Calculates the hyperbolic cotangent of the `f64`                         |
| `asech`       | `f64 -> f64`             | Calculates the hyperbolic arcsecant of the `f64`                         |
| `acsch`       | `f64 -> f64`             | Calculates the hyperbolic arccosecant of the `f64`                       |
| `acoth`       | `f64 -> f64`             | Calculates the hyperbolic arccotangent of the `f64`                      |
| `round`       | `f64 -> f64`             | Rounds the number to the nearest integer, ties break even                |
| `magnitude`   | `f64 -> f64`             | Returns the positive version of the `f64`                                |
| `inverseSqrt` | `f64 -> f64`             | Calculates the inverse square root (`1/sqrt(x)`) of the `f64`            |
| `fma`         | `(f64, f64, f64) -> f64` | Calculates the fused multiply-add of the three `f64`s                    |
| `fract`       | `f64 -> f64`             | Calculates the fractional component of the `f64`                         |

### Unsigned Integer-related functions

| Name          | Type                          | Description                                                                                                  |
| :------------ | :---------------------------- | :----------------------------------------------------------------------------------------------------------- |
| `add`         | `(u8, u8) -> u8`              | Adds two `u8`s together. Wraps on overflow                                                                   |
| `sub`         | `(u8, u8) -> u8`              | Subtracts two `u8`s. Wraps on overflow                                                                       |
| `mul`         | `(u8, u8) -> u8`              | Multiplies two `u8`s. Wraps on overflow                                                                      |
| `div`         | `(u8, u8) -> u8`              | Divides two `u8`s. Wraps on overflow                                                                         |
| `mod`         | `(u8, u8) -> u8`              | Returns the modulus (remainder) of the first `u8` divided by the second                                      |
| `pow`         | `(u8, u8) -> u8`              | Raises the first `u8` to the power of the second                                                             |
| `and`         | `(u8, u8) -> u8`              | Performs the bitwise AND operation                                                                           |
| `or`          | `(u8, u8) -> u8`              | Performs the bitwise OR operation                                                                            |
| `xor`         | `(u8, u8) -> u8`              | Performs the bitwise XOR operation                                                                           |
| `not`         | `u8 -> u8`                    | Performs the bitwise NOT operation                                                                           |
| `nand`        | `(u8, u8) -> u8`              | Performs the bitwise NAND operation                                                                          |
| `nor`         | `(u8, u8) -> u8`              | Performs the bitwise NOR operation                                                                           |
| `xnor`        | `(u8, u8) -> u8`              | Performs the bitwise XNOR operation                                                                          |
| `eq`          | `(u8, u8) -> bool`            | Returns `true` if both `u8`s are the same                                                                    |
| `neq`         | `(u8, u8) -> bool`            | Returns `true` if both `u8`s differ                                                                          |
| `lt`          | `(u8, u8) -> bool`            | Returns `true` if the first `u8` is less than the second                                                     |
| `lte`         | `(u8, u8) -> bool`            | Returns `true` if the first `u8` is less than or equal to the second                                         |
| `gt`          | `(u8, u8) -> bool`            | Returns `true` if the first `u8` is greater than the second                                                  |
| `gte`         | `(u8, u8) -> bool`            | Returns `true` if the first `u8` is greater than or equal to the second                                      |
| `min`         | `(u8, u8) -> u8`              | Returns the smaller `u8`                                                                                     |
| `max`         | `(u8, u8) -> u8`              | Returns the larger `u8`                                                                                      |
| `clamp`       | `(u8, u8, u8) -> u8`          | Clamps the first `u8` to be above the second and below the third                                             |
| `shl`         | `(u8, u8) -> u8`              | Shifts the first `u8` left the number of places specified by the second                                      |
| `shr`         | `(u8, u8) -> u8`              | Shifts the first `u8` right the number of places specified by the second                                     |
| `wrl`         | `(u8, u8) -> u8`              | Wrapping shifts the first `u8` left the number of place specified by the second                              |
| `wrr`         | `(u8, u8) -> u8`              | Wrapping shifts the first `u8` right the number of place specified by the second                             |
| `clz`         | `u8 -> u8`                    | Returns the number of leading zeroes for the `u8`                                                            |
| `ones`        | `u8 -> u8`                    | Returns the number of one bits in the `u8`                                                                   |
| `ctz`         | `u8 -> u8`                    | Returns the number of trailing zeroes for the `u8`                                                           |
| `reverseBits` | `u8 -> u8`                    | Returns the `u8` with its bits in reverse order                                                              |
| `extractBits` | `(u8, u8, u8) -> u8`          | From the first `u8`, start at the bit specified by the second extract to the third                           |
| `insertBits`  | `(u8, u8, u8, u8) -> u8`      | Into the first `u8` insert bits from the second starting at the bit specified by the third until the fourth  |
| `add`         | `(u16, u16) -> u16`           | Adds two `u16`s together. Wraps on overflow                                                                  |
| `sub`         | `(u16, u16) -> u16`           | Subtracts two `u16`s. Wraps on overflow                                                                      |
| `mul`         | `(u16, u16) -> u16`           | Multiplies two `u16`s. Wraps on overflow                                                                     |
| `div`         | `(u16, u16) -> u16`           | Divides two `u16`s. Wraps on overflow                                                                        |
| `mod`         | `(u16, u16) -> u16`           | Returns the modulus (remainder) of the first `u16` divided by the second                                     |
| `pow`         | `(u16, u16) -> u16`           | Raises the first `u16` to the power of the second                                                            |
| `and`         | `(u16, u16) -> u16`           | Performs the bitwise AND operation                                                                           |
| `or`          | `(u16, u16) -> u16`           | Performs the bitwise OR operation                                                                            |
| `xor`         | `(u16, u16) -> u16`           | Performs the bitwise XOR operation                                                                           |
| `not`         | `u16 -> u16`                  | Performs the bitwise NOT operation                                                                           |
| `nand`        | `(u16, u16) -> u16`           | Performs the bitwise NAND operation                                                                          |
| `nor`         | `(u16, u16) -> u16`           | Performs the bitwise NOR operation                                                                           |
| `xnor`        | `(u16, u16) -> u16`           | Performs the bitwise XNOR operation                                                                          |
| `eq`          | `(u16, u16) -> bool`          | Returns `true` if both `u16`s are the same                                                                   |
| `neq`         | `(u16, u16) -> bool`          | Returns `true` if both `u16`s differ                                                                         |
| `lt`          | `(u16, u16) -> bool`          | Returns `true` if the first `u16` is less than the second                                                    |
| `lte`         | `(u16, u16) -> bool`          | Returns `true` if the first `u16` is less than or equal to the second                                        |
| `gt`          | `(u16, u16) -> bool`          | Returns `true` if the first `u16` is greater than the second                                                 |
| `gte`         | `(u16, u16) -> bool`          | Returns `true` if the first `u16` is greater than or equal to the second                                     |
| `min`         | `(u16, u16) -> u16`           | Returns the smaller `u16`                                                                                    |
| `max`         | `(u16, u16) -> u16`           | Returns the larger `u16`                                                                                     |
| `clamp`       | `(u16, u16, u16) -> u16`      | Clamps the first `u16` to be above the second and below the third                                            |
| `shl`         | `(u16, u16) -> u16`           | Shifts the first `u16` left the number of places specified by the second                                     |
| `shr`         | `(u16, u16) -> u16`           | Shifts the first `u16` right the number of places specified by the second                                    |
| `wrl`         | `(u16, u16) -> u16`           | Wrapping shifts the first `u16` left the number of place specified by the second                             |
| `wrr`         | `(u16, u16) -> u16`           | Wrapping shifts the first `u16` right the number of place specified by the second                            |
| `clz`         | `u16 -> u16`                  | Returns the number of leading zeroes for the `u16`                                                           |
| `ones`        | `u16 -> u16`                  | Returns the number of one bits in the `u16`                                                                  |
| `ctz`         | `u16 -> u16`                  | Returns the number of trailing zeroes for the `u16`                                                          |
| `reverseBits` | `u16 -> u16`                  | Returns the `u16` with its bits in reverse order                                                             |
| `extractBits` | `(u16, u16, u16) -> u16`      | From the first `u16`, start at the bit specified by the second extract to the third                          |
| `insertBits`  | `(u16, u16, u16, u16) -> u16` | Into the first `u16` insert bits from the second starting at the bit specified by the third until the fourth |
| `add`         | `(u32, u32) -> u32`           | Adds two `u32`s together. Wraps on overflow                                                                  |
| `sub`         | `(u32, u32) -> u32`           | Subtracts two `u32`s. Wraps on overflow                                                                      |
| `mul`         | `(u32, u32) -> u32`           | Multiplies two `u32`s. Wraps on overflow                                                                     |
| `div`         | `(u32, u32) -> u32`           | Divides two `u32`s. Wraps on overflow                                                                        |
| `mod`         | `(u32, u32) -> u32`           | Returns the modulus (remainder) of the first `u32` divided by the second                                     |
| `pow`         | `(u32, u32) -> u32`           | Raises the first `u32` to the power of the second                                                            |
| `and`         | `(u32, u32) -> u32`           | Performs the bitwise AND operation                                                                           |
| `or`          | `(u32, u32) -> u32`           | Performs the bitwise OR operation                                                                            |
| `xor`         | `(u32, u32) -> u32`           | Performs the bitwise XOR operation                                                                           |
| `not`         | `u32 -> u32`                  | Performs the bitwise NOT operation                                                                           |
| `nand`        | `(u32, u32) -> u32`           | Performs the bitwise NAND operation                                                                          |
| `nor`         | `(u32, u32) -> u32`           | Performs the bitwise NOR operation                                                                           |
| `xnor`        | `(u32, u32) -> u32`           | Performs the bitwise XNOR operation                                                                          |
| `eq`          | `(u32, u32) -> bool`          | Returns `true` if both `u32`s are the same                                                                   |
| `neq`         | `(u32, u32) -> bool`          | Returns `true` if both `u32`s differ                                                                         |
| `lt`          | `(u32, u32) -> bool`          | Returns `true` if the first `u32` is less than the second                                                    |
| `lte`         | `(u32, u32) -> bool`          | Returns `true` if the first `u32` is less than or equal to the second                                        |
| `gt`          | `(u32, u32) -> bool`          | Returns `true` if the first `u32` is greater than the second                                                 |
| `gte`         | `(u32, u32) -> bool`          | Returns `true` if the first `u32` is greater than or equal to the second                                     |
| `min`         | `(u32, u32) -> u32`           | Returns the smaller `u32`                                                                                    |
| `max`         | `(u32, u32) -> u32`           | Returns the larger `u32`                                                                                     |
| `clamp`       | `(u32, u32, u32) -> u32`      | Clamps the first `u32` to be above the second and below the third                                            |
| `shl`         | `(u32, u32) -> u32`           | Shifts the first `u32` left the number of places specified by the second                                     |
| `shr`         | `(u32, u32) -> u32`           | Shifts the first `u32` right the number of places specified by the second                                    |
| `wrl`         | `(u32, u32) -> u32`           | Wrapping shifts the first `u32` left the number of place specified by the second                             |
| `wrr`         | `(u32, u32) -> u32`           | Wrapping shifts the first `u32` right the number of place specified by the second                            |
| `clz`         | `u32 -> u32`                  | Returns the number of leading zeroes for the `u32`                                                           |
| `ones`        | `u32 -> u32`                  | Returns the number of one bits in the `u32`                                                                  |
| `ctz`         | `u32 -> u32`                  | Returns the number of trailing zeroes for the `u32`                                                          |
| `reverseBits` | `u32 -> u32`                  | Returns the `u32` with its bits in reverse order                                                             |
| `extractBits` | `(u32, u32, u32) -> u32`      | From the first `u32`, start at the bit specified by the second extract to the third                          |
| `insertBits`  | `(u32, u32, u32, u32) -> u32` | Into the first `u32` insert bits from the second starting at the bit specified by the third until the fourth |
| `add`         | `(u64, u64) -> u64`           | Adds two `u64`s together. Wraps on overflow                                                                  |
| `sub`         | `(u64, u64) -> u64`           | Subtracts two `u64`s. Wraps on overflow                                                                      |
| `mul`         | `(u64, u64) -> u64`           | Multiplies two `u64`s. Wraps on overflow                                                                     |
| `div`         | `(u64, u64) -> u64`           | Divides two `u64`s. Wraps on overflow                                                                        |
| `mod`         | `(u64, u64) -> u64`           | Returns the modulus (remainder) of the first `u64` divided by the second                                     |
| `pow`         | `(u64, u64) -> u64`           | Raises the first `u64` to the power of the second                                                            |
| `and`         | `(u64, u64) -> u64`           | Performs the bitwise AND operation                                                                           |
| `or`          | `(u64, u64) -> u64`           | Performs the bitwise OR operation                                                                            |
| `xor`         | `(u64, u64) -> u64`           | Performs the bitwise XOR operation                                                                           |
| `not`         | `u64 -> u64`                  | Performs the bitwise NOT operation                                                                           |
| `nand`        | `(u64, u64) -> u64`           | Performs the bitwise NAND operation                                                                          |
| `nor`         | `(u64, u64) -> u64`           | Performs the bitwise NOR operation                                                                           |
| `xnor`        | `(u64, u64) -> u64`           | Performs the bitwise XNOR operation                                                                          |
| `eq`          | `(u64, u64) -> bool`          | Returns `true` if both `u64`s are the same                                                                   |
| `neq`         | `(u64, u64) -> bool`          | Returns `true` if both `u64`s differ                                                                         |
| `lt`          | `(u64, u64) -> bool`          | Returns `true` if the first `u64` is less than the second                                                    |
| `lte`         | `(u64, u64) -> bool`          | Returns `true` if the first `u64` is less than or equal to the second                                        |
| `gt`          | `(u64, u64) -> bool`          | Returns `true` if the first `u64` is greater than the second                                                 |
| `gte`         | `(u64, u64) -> bool`          | Returns `true` if the first `u64` is greater than or equal to the second                                     |
| `min`         | `(u64, u64) -> u64`           | Returns the smaller `u64`                                                                                    |
| `max`         | `(u64, u64) -> u64`           | Returns the larger `u64`                                                                                     |
| `clamp`       | `(u64, u64, u64) -> u64`      | Clamps the first `u64` to be above the second and below the third                                            |
| `shl`         | `(u64, u64) -> u64`           | Shifts the first `u64` left the number of places specified by the second                                     |
| `shr`         | `(u64, u64) -> u64`           | Shifts the first `u64` right the number of places specified by the second                                    |
| `wrl`         | `(u64, u64) -> u64`           | Wrapping shifts the first `u64` left the number of place specified by the second                             |
| `wrr`         | `(u64, u64) -> u64`           | Wrapping shifts the first `u64` right the number of place specified by the second                            |
| `clz`         | `u64 -> u64`                  | Returns the number of leading zeroes for the `u64`                                                           |
| `ones`        | `u64 -> u64`                  | Returns the number of one bits in the `u64`                                                                  |
| `ctz`         | `u64 -> u64`                  | Returns the number of trailing zeroes for the `u64`                                                          |
| `reverseBits` | `u64 -> u64`                  | Returns the `u64` with its bits in reverse order                                                             |
| `extractBits` | `(u64, u64, u64) -> u64`      | From the first `u64`, start at the bit specified by the second extract to the third                          |
| `insertBits`  | `(u64, u64, u64, u64) -> u64` | Into the first `u64` insert bits from the second starting at the bit specified by the third until the fourth |

### Signed Integer-related functions

| Name          | Type                          | Description                                                                                                  |
| :------------ | :---------------------------- | :----------------------------------------------------------------------------------------------------------- |
| `add`         | `(i8, i8) -> i8`              | Adds two `i8`s together. Wraps on overflow                                                                   |
| `sub`         | `(i8, i8) -> i8`              | Subtracts two `i8`s. Wraps on overflow                                                                       |
| `mul`         | `(i8, i8) -> i8`              | Multiplies two `i8`s. Wraps on overflow                                                                      |
| `div`         | `(i8, i8) -> i8`              | Divides two `i8`s. Wraps on overflow                                                                         |
| `mod`         | `(i8, i8) -> i8`              | Returns the modulus (remainder) of the first `i8` divided by the second                                      |
| `pow`         | `(i8, i8) -> i8`              | Raises the first `i8` to the power of the second                                                             |
| `abs`         | `i8 -> i8`                    | Returns the positive version of the `i8`                                                                     |
| `neg`         | `i8 -> i8`                    | Multiplies the `i8` by `-1`                                                                                  |
| `and`         | `(i8, i8) -> i8`              | Performs the bitwise AND operation                                                                           |
| `or`          | `(i8, i8) -> i8`              | Performs the bitwise OR operation                                                                            |
| `xor`         | `(i8, i8) -> i8`              | Performs the bitwise XOR operation                                                                           |
| `not`         | `i8 -> i8`                    | Performs the bitwise NOT operation                                                                           |
| `nand`        | `(i8, i8) -> i8`              | Performs the bitwise NAND operation                                                                          |
| `nor`         | `(i8, i8) -> i8`              | Performs the bitwise NOR operation                                                                           |
| `xnor`        | `(i8, i8) -> i8`              | Performs the bitwise XNOR operation                                                                          |
| `eq`          | `(i8, i8) -> bool`            | Returns `true` if both `i8`s are the same                                                                    |
| `neq`         | `(i8, i8) -> bool`            | Returns `true` if both `i8`s differ                                                                          |
| `lt`          | `(i8, i8) -> bool`            | Returns `true` if the first `i8` is less than the second                                                     |
| `lte`         | `(i8, i8) -> bool`            | Returns `true` if the first `i8` is less than or equal to the second                                         |
| `gt`          | `(i8, i8) -> bool`            | Returns `true` if the first `i8` is greater than the second                                                  |
| `gte`         | `(i8, i8) -> bool`            | Returns `true` if the first `i8` is greater than or equal to the second                                      |
| `min`         | `(i8, i8) -> i8`              | Returns the smaller `i8`                                                                                     |
| `max`         | `(i8, i8) -> i8`              | Returns the larger `i8`                                                                                      |
| `clamp`       | `(i8, i8, i8) -> i8`          | Clamps the first `i8` to be above the second and below the third                                             |
| `shl`         | `(i8, i8) -> i8`              | Shifts the first `i8` left the number of places specified by the second                                      |
| `shr`         | `(i8, i8) -> i8`              | Shifts the first `i8` right the number of places specified by the second                                     |
| `wrl`         | `(i8, i8) -> i8`              | Wrapping shifts the first `i8` left the number of place specified by the second                              |
| `wrr`         | `(i8, i8) -> i8`              | Wrapping shifts the first `i8` right the number of place specified by the second                             |
| `clz`         | `i8 -> i8`                    | Returns the number of leading zeroes for the `i8`                                                            |
| `ones`        | `i8 -> i8`                    | Returns the number of one bits in the `i8`                                                                   |
| `ctz`         | `i8 -> i8`                    | Returns the number of trailing zeroes for the `i8`                                                           |
| `reverseBits` | `i8 -> i8`                    | Returns the `i8` with its bits in reverse order                                                              |
| `extractBits` | `(i8, i8, i8) -> i8`          | From the first `i8`, start at the bit specified by the second extract to the third                           |
| `insertBits`  | `(i8, i8, i8, i8) -> i8`      | Into the first `i8` insert bits from the second starting at the bit specified by the third until the fourth  |
| `add`         | `(i16, i16) -> i16`           | Adds two `i16`s together. Wraps on overflow                                                                  |
| `sub`         | `(i16, i16) -> i16`           | Subtracts two `i16`s. Wraps on overflow                                                                      |
| `mul`         | `(i16, i16) -> i16`           | Multiplies two `i16`s. Wraps on overflow                                                                     |
| `div`         | `(i16, i16) -> i16`           | Divides two `i16`s. Wraps on overflow                                                                        |
| `mod`         | `(i16, i16) -> i16`           | Returns the modulus (remainder) of the first `i16` divided by the second                                     |
| `pow`         | `(i16, i16) -> i16`           | Raises the first `i16` to the power of the second                                                            |
| `abs`         | `i16 -> i16`                  | Returns the positive version of the `i16`                                                                    |
| `neg`         | `i16 -> i16`                  | Multiplies the `i16` by `-1`                                                                                 |
| `and`         | `(i16, i16) -> i16`           | Performs the bitwise AND operation                                                                           |
| `or`          | `(i16, i16) -> i16`           | Performs the bitwise OR operation                                                                            |
| `xor`         | `(i16, i16) -> i16`           | Performs the bitwise XOR operation                                                                           |
| `not`         | `i16 -> i16`                  | Performs the bitwise NOT operation                                                                           |
| `nand`        | `(i16, i16) -> i16`           | Performs the bitwise NAND operation                                                                          |
| `nor`         | `(i16, i16) -> i16`           | Performs the bitwise NOR operation                                                                           |
| `xnor`        | `(i16, i16) -> i16`           | Performs the bitwise XNOR operation                                                                          |
| `eq`          | `(i16, i16) -> bool`          | Returns `true` if both `i16`s are the same                                                                   |
| `neq`         | `(i16, i16) -> bool`          | Returns `true` if both `i16`s differ                                                                         |
| `lt`          | `(i16, i16) -> bool`          | Returns `true` if the first `i16` is less than the second                                                    |
| `lte`         | `(i16, i16) -> bool`          | Returns `true` if the first `i16` is less than or equal to the second                                        |
| `gt`          | `(i16, i16) -> bool`          | Returns `true` if the first `i16` is greater than the second                                                 |
| `gte`         | `(i16, i16) -> bool`          | Returns `true` if the first `i16` is greater than or equal to the second                                     |
| `min`         | `(i16, i16) -> i16`           | Returns the smaller `i16`                                                                                    |
| `max`         | `(i16, i16) -> i16`           | Returns the larger `i16`                                                                                     |
| `clamp`       | `(i16, i16, i16) -> i16`      | Clamps the first `i16` to be above the second and below the third                                            |
| `shl`         | `(i16, i16) -> i16`           | Shifts the first `i16` left the number of places specified by the second                                     |
| `shr`         | `(i16, i16) -> i16`           | Shifts the first `i16` right the number of places specified by the second                                    |
| `wrl`         | `(i16, i16) -> i16`           | Wrapping shifts the first `i16` left the number of place specified by the second                             |
| `wrr`         | `(i16, i16) -> i16`           | Wrapping shifts the first `i16` right the number of place specified by the second                            |
| `clz`         | `i16 -> i16`                  | Returns the number of leading zeroes for the `i16`                                                           |
| `ones`        | `i16 -> i16`                  | Returns the number of one bits in the `i16`                                                                  |
| `ctz`         | `i16 -> i16`                  | Returns the number of trailing zeroes for the `i16`                                                          |
| `reverseBits` | `i16 -> i16`                  | Returns the `i16` with its bits in reverse order                                                             |
| `extractBits` | `(i16, i16, i16) -> i16`      | From the first `i16`, start at the bit specified by the second extract to the third                          |
| `insertBits`  | `(i16, i16, i16, i16) -> i16` | Into the first `i16` insert bits from the second starting at the bit specified by the third until the fourth |
| `add`         | `(i32, i32) -> i32`           | Adds two `i32`s together. Wraps on overflow                                                                  |
| `sub`         | `(i32, i32) -> i32`           | Subtracts two `i32`s. Wraps on overflow                                                                      |
| `mul`         | `(i32, i32) -> i32`           | Multiplies two `i32`s. Wraps on overflow                                                                     |
| `div`         | `(i32, i32) -> i32`           | Divides two `i32`s. Wraps on overflow                                                                        |
| `mod`         | `(i32, i32) -> i32`           | Returns the modulus (remainder) of the first `i32` divided by the second                                     |
| `pow`         | `(i32, i32) -> i32`           | Raises the first `i32` to the power of the second                                                            |
| `abs`         | `i32 -> i32`                  | Returns the positive version of the `i32`                                                                    |
| `neg`         | `i32 -> i32`                  | Multiplies the `i32` by `-1`                                                                                 |
| `and`         | `(i32, i32) -> i32`           | Performs the bitwise AND operation                                                                           |
| `or`          | `(i32, i32) -> i32`           | Performs the bitwise OR operation                                                                            |
| `xor`         | `(i32, i32) -> i32`           | Performs the bitwise XOR operation                                                                           |
| `not`         | `i32 -> i32`                  | Performs the bitwise NOT operation                                                                           |
| `nand`        | `(i32, i32) -> i32`           | Performs the bitwise NAND operation                                                                          |
| `nor`         | `(i32, i32) -> i32`           | Performs the bitwise NOR operation                                                                           |
| `xnor`        | `(i32, i32) -> i32`           | Performs the bitwise XNOR operation                                                                          |
| `eq`          | `(i32, i32) -> bool`          | Returns `true` if both `i32`s are the same                                                                   |
| `neq`         | `(i32, i32) -> bool`          | Returns `true` if both `i32`s differ                                                                         |
| `lt`          | `(i32, i32) -> bool`          | Returns `true` if the first `i32` is less than the second                                                    |
| `lte`         | `(i32, i32) -> bool`          | Returns `true` if the first `i32` is less than or equal to the second                                        |
| `gt`          | `(i32, i32) -> bool`          | Returns `true` if the first `i32` is greater than the second                                                 |
| `gte`         | `(i32, i32) -> bool`          | Returns `true` if the first `i32` is greater than or equal to the second                                     |
| `min`         | `(i32, i32) -> i32`           | Returns the smaller `i32`                                                                                    |
| `max`         | `(i32, i32) -> i32`           | Returns the larger `i32`                                                                                     |
| `clamp`       | `(i32, i32, i32) -> i32`      | Clamps the first `i32` to be above the second and below the third                                            |
| `shl`         | `(i32, i32) -> i32`           | Shifts the first `i32` left the number of places specified by the second                                     |
| `shr`         | `(i32, i32) -> i32`           | Shifts the first `i32` right the number of places specified by the second                                    |
| `wrl`         | `(i32, i32) -> i32`           | Wrapping shifts the first `i32` left the number of place specified by the second                             |
| `wrr`         | `(i32, i32) -> i32`           | Wrapping shifts the first `i32` right the number of place specified by the second                            |
| `clz`         | `i32 -> i32`                  | Returns the number of leading zeroes for the `i32`                                                           |
| `ones`        | `i32 -> i32`                  | Returns the number of one bits in the `i32`                                                                  |
| `ctz`         | `i32 -> i32`                  | Returns the number of trailing zeroes for the `i32`                                                          |
| `reverseBits` | `i32 -> i32`                  | Returns the `i32` with its bits in reverse order                                                             |
| `extractBits` | `(i32, i32, i32) -> i32`      | From the first `i32`, start at the bit specified by the second extract to the third                          |
| `insertBits`  | `(i32, i32, i32, i32) -> i32` | Into the first `i32` insert bits from the second starting at the bit specified by the third until the fourth |
| `add`         | `(i64, i64) -> i64`           | Adds two `i64`s together. Wraps on overflow                                                                  |
| `sub`         | `(i64, i64) -> i64`           | Subtracts two `i64`s. Wraps on overflow                                                                      |
| `mul`         | `(i64, i64) -> i64`           | Multiplies two `i64`s. Wraps on overflow                                                                     |
| `div`         | `(i64, i64) -> i64`           | Divides two `i64`s. Wraps on overflow                                                                        |
| `mod`         | `(i64, i64) -> i64`           | Returns the modulus (remainder) of the first `i64` divided by the second                                     |
| `pow`         | `(i64, i64) -> i64`           | Raises the first `i64` to the power of the second                                                            |
| `abs`         | `i64 -> i64`                  | Returns the positive version of the `i64`                                                                    |
| `neg`         | `i64 -> i64`                  | Multiplies the `i64` by `-1`                                                                                 |
| `and`         | `(i64, i64) -> i64`           | Performs the bitwise AND operation                                                                           |
| `or`          | `(i64, i64) -> i64`           | Performs the bitwise OR operation                                                                            |
| `xor`         | `(i64, i64) -> i64`           | Performs the bitwise XOR operation                                                                           |
| `not`         | `i64 -> i64`                  | Performs the bitwise NOT operation                                                                           |
| `nand`        | `(i64, i64) -> i64`           | Performs the bitwise NAND operation                                                                          |
| `nor`         | `(i64, i64) -> i64`           | Performs the bitwise NOR operation                                                                           |
| `xnor`        | `(i64, i64) -> i64`           | Performs the bitwise XNOR operation                                                                          |
| `eq`          | `(i64, i64) -> bool`          | Returns `true` if both `i64`s are the same                                                                   |
| `neq`         | `(i64, i64) -> bool`          | Returns `true` if both `i64`s differ                                                                         |
| `lt`          | `(i64, i64) -> bool`          | Returns `true` if the first `i64` is less than the second                                                    |
| `lte`         | `(i64, i64) -> bool`          | Returns `true` if the first `i64` is less than or equal to the second                                        |
| `gt`          | `(i64, i64) -> bool`          | Returns `true` if the first `i64` is greater than the second                                                 |
| `gte`         | `(i64, i64) -> bool`          | Returns `true` if the first `i64` is greater than or equal to the second                                     |
| `min`         | `(i64, i64) -> i64`           | Returns the smaller `i64`                                                                                    |
| `max`         | `(i64, i64) -> i64`           | Returns the larger `i64`                                                                                     |
| `clamp`       | `(i64, i64, i64) -> i64`      | Clamps the first `i64` to be above the second and below the third                                            |
| `shl`         | `(i64, i64) -> i64`           | Shifts the first `i64` left the number of places specified by the second                                     |
| `shr`         | `(i64, i64) -> i64`           | Shifts the first `i64` right the number of places specified by the second                                    |
| `wrl`         | `(i64, i64) -> i64`           | Wrapping shifts the first `i64` left the number of place specified by the second                             |
| `wrr`         | `(i64, i64) -> i64`           | Wrapping shifts the first `i64` right the number of place specified by the second                            |
| `clz`         | `i64 -> i64`                  | Returns the number of leading zeroes for the `i64`                                                           |
| `ones`        | `i64 -> i64`                  | Returns the number of one bits in the `i64`                                                                  |
| `ctz`         | `i64 -> i64`                  | Returns the number of trailing zeroes for the `i64`                                                          |
| `reverseBits` | `i64 -> i64`                  | Returns the `i64` with its bits in reverse order                                                             |
| `extractBits` | `(i64, i64, i64) -> i64`      | From the first `i64`, start at the bit specified by the second extract to the third                          |
| `insertBits`  | `(i64, i64, i64, i64) -> i64` | Into the first `i64` insert bits from the second starting at the bit specified by the third until the fourth |

### String-related functions

| Name      | Type                                 | Description                                                                        |
| :-------- | :----------------------------------- | :--------------------------------------------------------------------------------- |
| `string`  | `f32 -> string`                      | Converts the `f32` to a `string`                                                   |
| `string`  | `f64 -> string`                      | Converts the `f64` to a `string`                                                   |
| `string`  | `u8 -> string`                       | Converts the `u8` to a `string`                                                    |
| `string`  | `u16 -> string`                      | Converts the `u16` to a `string`                                                   |
| `string`  | `u32 -> string`                      | Converts the `u32` to a `string`                                                   |
| `string`  | `u64 -> string`                      | Converts the `u64` to a `string`                                                   |
| `string`  | `i8 -> string`                       | Converts the `i8` to a `string`                                                    |
| `string`  | `i16 -> string`                      | Converts the `i16` to a `string`                                                   |
| `string`  | `i32 -> string`                      | Converts the `i32` to a `string`                                                   |
| `string`  | `i64 -> string`                      | Converts the `i64` to a `string`                                                   |
| `string`  | `(f32, i64) -> string`               | Converts the `f32` to a string with the number of decimals specified by the `i64`  |
| `string`  | `(f64, i64) -> string`               | Converts the `f64` to a string with the number of decimals specified by the `i64`  |
| `string`  | `bool -> string`                     | Converts the `bool` to a `string`                                                  |
| `string`  | `string -> string`                   | Returns the original `string`                                                      |
| `concat`  | `(string, string) -> string`         | Concatenates the two `string`s into a new `string`                                 |
| `repeat`  | `(string, i64) -> string`            | Repeats the `string` the number of times specified by the `i64`                    |
| `replace` | `(string, string, string) -> string` | Replaces instances of the second `string` with the third in the first              |
| `split`   | `(string, string) -> string[]`       | Splits the first `string` by the second, returning an array of smaller `string`s   |
| `len`     | `string -> i64`                      | Returns the length of the `string`                                                 |
| `get`     | `(string, i64) -> string!`           | Returns the character in the `string` at the index specified by the `i64` or fails |
| `trim`    | `string -> string`                   | Removes whitespace from the beginning and end of the `string`                      |
| `index`   | `(string, string) -> i64!`           | Returns the index where the second `string` starts in the first or fails           |
| `eq`      | `(string, string) -> bool`           | Returns `true` if the two `string`s are the same                                   |
| `neq`     | `(string, string) -> bool`           | Returns `true` if the two `string`s differ                                         |
| `lt`      | `(string, string) -> bool`           | Returns `true` if the first `string` sorts earlier than the second                 |
| `lte`     | `(string, string) -> bool`           | Returns `true` if the two `strings`s are the same or the first sorts earlier       |
| `gt`      | `(string, string) -> bool`           | Returns `true` if the first `string` sorts later than the second                   |
| `gte`     | `(string, string) -> bool`           | Returns `true` if the two `string`s are the same or the first sorts later          |
| `min`     | `(string, string) -> string`         | Returns the `string` that sorts earlier                                            |
| `max`     | `(string, string) -> string`         | Returns the `string` that sorts later                                              |
| `join`    | `(string[], string) -> string`       | Joins the array of `string[]`s by the `string` into a new `string`                 |
| `join{S}` | `(string[S], string) -> string`      | Joins the buffer of `string[S]`s by the `string` into a new `string`               |

### Array-related functions

| Name           | Type                               | Description                                                                                                                              | Explicit |
| :------------- | :--------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| `Array{T}`     | `(T, ...) -> T[]`                  | Built-in Array constructor function. Can also be written `[T, ...]`                                                                      | ❌       |
| `len{T}`       | `T[] -> i64`                       | Returns the number of elements in the `Array{T}`                                                                                         | ✅       |
| `get{T}`       | `(T[], i64) -> T?`                 | Returns the value at the index specified by the `i64`, otherwise `void`. May also be written `arr[idx]`                                  | ✅       |
| `push{T}`      | `(Mut{T[]}, T) -> ()`              | Appends the provided `T` to the end of the `T[]`                                                                                         | ✅       |
| `pop{T}`       | `Mut{T[]} -> T?`                   | Removes the last `T` from the `T[]` and returns it, or `void` if empty                                                                   | ✅       |
| `map{T, U}`    | `(T[], T -> U) -> U[]`             | Creates a new `U[]` array by calling the `T -> U` function on each of `T[]`'s elements                                                   | ✅       |
| `map{T, U}`    | `(T[], (T, i64) -> U) -> U[]`      | Creates a new `U[]` array by calling the `(T, i64) -> U` function on each of `T[]`'s elements with its index                             | ✅       |
| `parmap{T, U}` | `(T[], T -> U) -> U[]`             | (Rust-only for now) Creates a new `U[]` by dividing `T[]` across all CPU cores and running in parallel                                   | ✅       |
| `filter{T}`    | `(T[], T -> bool) -> T[]`          | Creates a new array including only the elements that evaluated to `true` when passed to the `T -> bool` function                         | ✅       |
| `filter{T}`    | `(T[], (T, i64) -> bool) -> T[]`   | Creates a new array including only the elements that evaluated to `true` when passed with their index to the `(T, i64) -> bool` function | ✅       |
| `reduce{T}`    | `(T[], (T, T) -> T) -> T?`         | Combines the elements of `T[]` into a singular `T` using the `(T, T) -> T` function. Returns `void` if empty                             | ✅       |
| `reduce{T}`    | `(T[], (T, T, i64) -> T) -> T?`    | Combines the elements of `T[]` into a singular `T` using the `(T, T, i64) -> T` function and element indexes. Returns `void` if empty    | ✅       |
| `reduce{T, U}` | `(T[], U, (U, T) -> U) -> U`       | Combines the elements of `T[]` into a singular `U` using the `(U, T) -> U` function and an initial `U` value                             | ✅       |
| `reduce{T, U}` | `(T[], U, (U, T, i64) -> U) -> U`  | Combines the elements of `T[]` into a singular `U` using the `(U, T, i64) -> U` function, element indexes, and an initial `U` value      | ✅       |
| `concat{T}`    | `(T[], T[]) -> T[]`                | Concatenates two `T[]` arrays into a new `T[]` array                                                                                     | ✅       |
| `append{T}`    | `(Mut{T[]}, T[]) -> ()`            | Appends the contents of the second `T[]` into the first. Mutates the first but does not change the second                                | ✅       |
| `filled{T}`    | `(T, i64) -> T[]`                  | Creates a `T[]` with the number of elements specified by the `i64` all with the value specified by the `T`                               | ✅       |
| `has{T}`       | `(T[], T) -> bool`                 | Returns `true` if the value in `T` exists within the `T[]`                                                                               | ✅       |
| `has{T}`       | `(T[], T -> bool) -> bool`         | Returns `true` if any value in `T[]` returns `true` when passed to the `T -> bool` function                                              | ✅       |
| `find{T}`      | `(T[], T -> bool) -> T?`           | Returns the first `T` from the `T[]` that returns `true` when passed to the `T -> bool` function. Otherwise returns `void`               | ✅       |
| `index{T}`     | `(T[], T) -> i64?`                 | Returns the first index that the `T` value is found in the `T[]`. Otherwise returns `void`                                               | ✅       |
| `index{T}`     | `(T[], T -> bool) -> i64?`         | Returns the first index that returns `true` when the `T` value is passed to the `T -> bool` function. Otherwise returns `void`           | ✅       |
| `index{T}`     | `(T[], (T, i64) -> bool) -> i64?`  | Returns the first index that returns `true` when the `T` value and index is passed to the `(T, i64) -> bool` function. Otherwise `void`  | ✅       |
| `every{T}`     | `(T[], T -> bool) -> bool`         | Returns `true` if every element in the `T[]` returns `true` when passed to the `T -> bool` function                                      | ✅       |
| `some{T}`      | `(T[], T -> bool) -> bool`         | Returns `true` if any element in the `T[]` returns `true` when passed to the `T -> bool` function                                        | ✅       |
| `repeat{T}`    | `(T[], i64) -> T[]`                | Returns a new `T[]` that is the original `T[]` appended to itself the number of times specified by the `i64`                             | ✅       |
| `store{T}`     | `(Mut{T[]}, i64, T) -> void!`      | Stores the `T` in the specified index (shifting later values forward). Returns an Error if the array is too small. AKA `arr[idx] = val`  | ✅       |
| `delete{T}`    | `(Mut{T[]}, i64) -> T!`            | Deletes the `T` at the index specified in the `i64` from the `T[]` and returns it. If the index does not exist, it returns an `Error`    | ✅       |
| `last{T}`      | `T[] -> T?`                        | Returns the last `T` value in the `T[]` without mutating it. If the array is empty it returns `void`                                     | ✅       |
| `swap{T}`      | `(Mut{T[]}, i64, i64) -> void!`    | Swaps the values at the two specified indexes. Returns an `Error` if either index is invalid                                             | ✅       |
| `sort{T}`      | `(Mut{T[]}, (T, T) -> i8) -> void` | Sorts the array using the provided sorting function. `0` means the elements are equal, negative for keep the order, positive for flip    | ✅       |
| `sort{T}`      | `Mut{T[]} -> void`                 | Sorts the array using the `T` type's built-in ordering logic. Requires `eq` and `lt` to have been implemented for the type               | ✅       |
| `magnitude`    | `f32[] -> f32`                     | Computes the magnitude of a vector represented by the array                                                                              | ✅       |
| `magnitude`    | `f64[] -> f64`                     | Computes the magnitude of a vector represented by the array                                                                              | ✅       |
| `normalize`    | `f32[] -> f32[]`                   | Converts the vector represented by the array into a unit vector (magnitude of `1`)                                                       | ✅       |
| `normalize`    | `f64[] -> f64[]`                   | Converts the vector represented by the array into a unit vector (magnitude of `1`)                                                       | ✅       |
| `inverseSqrt`  | `f32[] -> f32[]`                   | Calculates the inverse square root for all elements of the array                                                                         | ✅       |
| `inverseSqrt`  | `f64[] -> f64[]`                   | Calculates the inverse square root for all elements of the array                                                                         | ✅       |
| `fma`          | `(f32[], f32[], f32[]) -> f32[]!`  | Calculates the fused multiply add operation for all three arrays. Returns an `Error` if any of the array lengths do not match            | ✅       |
| `fma`          | `(f64[], f64[], f64[]) -> f64[]!`  | Calculates the fused multiply add operation for all three arrays. Returns an `Error` if any of the array lengths do not match            | ✅       |
| `fract`        | `f32[] -> f32[]`                   | Returns the fractional component of each `f32` element in the array                                                                      | ✅       |
| `fract`        | `f64[] -> f64[]`                   | Returns the fractional component of each `f64` element in the array                                                                      | ✅       |

### Buffer-related functions

| Name                   | Type                                 | Description                                                                                                                                   | Explicit |
| :--------------------- | :----------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| `Buffer{T, S}`         | `T -> T[S]`                          | Creates a fixed buffer with all `S` elements set to the `T` value                                                                             | ❌       |
| `Buffer{T, S}`         | `(T, ...) -> T[S]`                   | Creates a fixed buffer with the `T` values set. Argument length must match buffer size                                                        | ❌       |
| `.0, .1, etc`          | `T[S] -> T`                          | Explicit property-based buffer value lookups guaranteed to return the value, as it is a compile-time failure to access out-of-bounds indexes  | ❌       |
| `get{T, S}`            | `(T[S], i64) -> T?`                  | Returns the value at the specified index, or `void` if out-of-bounds. Can also be written `buf[idx]`                                          | ✅       |
| `map{T, S, U}`         | `(T[S], T -> U) -> U[S]`             | Maps the elements of the `T[S]` buffer into a `U[S]` buffer using the `T -> U` function                                                       | ✅       |
| `map{T, S, U}`         | `(T[S], (T, i64) -> U) -> U[S]`      | Maps the elements and indexes of the `T[S]` buffer into a `U[S]` buffer using the `(T, i64) -> U` function                                    | ✅       |
| `reduce{T, S}`         | `(T[S], (T, T) -> T) -> T?`          | Combines the `T[S]` elements into a singular `T` value. Returns `void` if `S` is `0`                                                          | ✅       |
| `reduce{T, S, U}`      | `(T[S], U, (U, T) -> U) -> U`        | Combines the `T[S]` elements and an initial `U` value into a new `U` value                                                                    | ✅       |
| `has{T, S}`            | `(T[S], T) -> bool`                  | Returns `true` if the `T` value is anywhere within the `T[S]` buffer                                                                          | ✅       |
| `has{T, S}`            | `(T[S], T -> bool) -> bool`          | Returns `true` if any `T` value in the `T[S]` returns `true` when passed to the `T -> bool` function                                          | ✅       |
| `find{T, S}`           | `(T[S], T -> bool) -> T?`            | Returns the first `T` value that returns `true` when passed to the `T -> bool` function. Returns `void otherwise                              | ✅       |
| `every{T, S}`          | `(T[S], T -> bool) -> bool`          | Returns `true` if every `T` value returns `true` when passed to the `T -> bool` function                                                      | ✅       |
| `concatInner{T, S, N}` | `(Mut{T[S + N]}, T[S], T[N]) -> ()`  | Replaces the values in `T[S + N]` with the values in `T[S]` and `T[N]`. Likely won't be used directly                                         | ✅       |
| `concat{T, S, N}`      | `(T[S], T[N]) -> T[S + N]`           | Concatenates two buffers together, creating a new buffer with a fixed length derived from the input buffer lengths                            | ✅       |
| `repeat{T, S}`         | `(T[S], i64) -> T[]`                 | Repeats the input buffer the number of times specified in the `i64` into a new `T[]`. Length is determined at runtime so it must be an array  | ✅       |
| `store{T, S}`          | `(Mut{T[S]}, i64, T) -> T!`          | Stores the new `T` value in the index specified by the `i64` into the `T[S]`. As buffers do not grow, it returns the old value, or an `Error` | ✅       |
| `cross`                | `(f32[3], f32[3]) -> f32[3]`         | Computes the cross product of two 3-element vectors                                                                                           | ✅       |
| `cross`                | `(f64[3], f64[3]) -> f64[3]`         | Computes the cross product of two 3-element vectors                                                                                           | ✅       |
| `dot{I}`               | `(I[2], I[2]) -> I`                  | Computes the dot product of the 2-element vectors. `I` must implement `add` and `mul`                                                         | ✅       |
| `dot{I}`               | `(I[3], I[3]) -> I`                  | Computes the dot product of the 3-element vectors. `I` must implement `add` and `mul`                                                         | ✅       |
| `dot{I}`               | `(I[4], I[4]) -> I`                  | Computes the dot product of the 4-element vectors. `I` must implement `add` and `mul`                                                         | ✅       |
| `swap{T, S}`           | `(Mut{T[S]}, i64, i64) -> void!`     | Swaps the values at the two specified indexes. Returns an `Error` if either index is out-of-bounds                                            | ✅       |
| `sort{T, S}`           | `(Mut{T[S]}, (T, T) -> i8) -> ()`    | Sorts the buffer using the provided sorting function. `0` means the elements are equal, negative for keeping the order, positive for swap     | ✅       |
| `sort{T, S}`           | `Mut{T[S]} -> void`                  | Sorts the buffer using the `T` type's built-in ordering logic. Requires `eq` and `lt` to have been implemented for the type                   | ✅       |
| `magnitude{S}`         | `f32[S] -> f32`                      | Computes the magnitude of the vector represented by the `f32[S]`                                                                              | ✅       |
| `magnitude{S}`         | `f64[S] -> f64`                      | Computes the magnitude of the vector represented by the `f64[S]`                                                                              | ✅       |
| `normalize{S}`         | `f32[S] -> f32[S]`                   | Converts the vector represented by the buffer into a unit vector (magnitude of `1`)                                                           | ✅       |
| `normalize{S}`         | `f64[S] -> f64[S]`                   | Converts the vector represented by the buffer into a unit vector (magnitude of `1`)                                                           | ✅       |
| `inverseSqrt{S}`       | `f32[S] -> f32[S]`                   | Calculates the inverse square root for all elements of the buffer                                                                             | ✅       |
| `inverseSqrt{S}`       | `f64[S] -> f64[S]`                   | Calculates the inverse square root for all elements of the buffer                                                                             | ✅       |
| `fma{S}`               | `(f32[S], f32[S], f32[S]) -> f32[S]` | Calculates the fused multiply add operation for all three buffers                                                                             | ✅       |
| `fma{S}`               | `(f64[S], f64[S], f64[S]) -> f64[S]` | Calculates the fused multiply add operation for all three buffers                                                                             | ✅       |
| `fract{S}`             | `f32[S] -> f32[S]`                   | Returns the fractional component of each `f32` element in the array                                                                           | ✅       |
| `fract{S}`             | `f64[S] -> f64[S]`                   | Returns the fractional component of each `f64` element in the array                                                                           | ✅       |
| `determinant{T}`       | `T[4] -> T`                          | Calculates the determinant of a 2x2 matrix. `T` must implement `add`, `sub`, and `mul`                                                        | ✅       |
| `determinant{T}`       | `T[9] -> T`                          | Calculates the determinant of a 3x3 matrix. `T` must implement `add`, `sub`, and `mul`                                                        | ✅       |
| `determinant{T}`       | `T[16] -> T`                         | Calculates the determinant of a 4x4 matrix. `T` must implement `add`, `sub`, and `mul`                                                        | ✅       |

### Dictionary-related functions

| Name           | Type                                     | Description                                                                                                    |
| :------------- | :--------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| `Dict{K, V}`   | `() -> Dict{K, V}`                       | Constructs a new dictionary                                                                                    |
| `Dict{K, V}`   | `(K, V) -> Dict{K, V}`                   | Constructs a new dictionary with an inital key-value pair                                                      |
| `Dict{K, V}`   | `Array{(K, V)} -> Dict{K, V}`            | Construct a new dictionary from an array of key-value tuples                                                   |
| `has{K, V}`    | `(Dict{K, V}, K) -> bool`                | Returns `true` if the `K` value is used as a key                                                               |
| `get{K, V}`    | `(Dict{K, V}, K) -> V?`                  | Returns the value if the `K` value is used as a key, otherwise returns `void`. Can also be written `dict[key]` |
| `store{K, V}`  | `(Mut{Dict{K, V}}, K, V) -> void`        | Stores the value `V` referenceable by the key `K`. Can also be written `dict[key] = val`                       |
| `len{K, V}`    | `Dict{K, V} -> i64`                      | Returns the number of key-value pairs in the dictionary                                                        |
| `keys{K, V}`   | `Dict{K, V} -> K[]`                      | Returns an array of all of the keys in the dictionary. The array is in insertion order                         |
| `vals{K, V}`   | `Dict{K, V} -> V[]`                      | Returns an array of all of the values in the dictionary. The array is in insertion order                       |
| `Array{K, V}`  | `Dict{K, V} -> Array{(K, V)}`            | Returns an array of all key-value pairs in the dictionary as tuples. The array is in insertion order           |
| `concat{K, V}` | `(Dict{K, V}, Dict{K, V}) -> Dict{K, V}` | Returns a new dictionary that is the concatenation of the two input dictionaries                               |

### Set-related functions

| Name                     | Type                              | Description                                                                                                            |
| :----------------------- | :-------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| `Set{V}`                 | `() -> Set{V}`                    | Constructs a new set                                                                                                   |
| `Set{V}`                 | `V -> Set{V}`                     | Constructs a new set with an initial value                                                                             |
| `Set{V}`                 | `V[] -> Set{V}`                   | Constructs a new set from an array of values                                                                           |
| `store{V}`               | `(Mut{Set{V}}, V) -> ()`          | Stores the value `V` in the set. Can be written as `set = val` but please don't                                        |
| `has{V}`                 | `(Set{V}, V) -> bool`             | Returns `true` if the value `V` is in the set                                                                          |
| `len{V}`                 | `Set{V} -> i64`                   | Returns the number of values in the set                                                                                |
| `Array{V}`               | `Set{V} -> V[]`                   | Returns an array of values in the set. No guarantee on ordering                                                        |
| `union{V}`               | `(Set{V}, Set{V}) -> Set{V}`      | Returns a new set that is the union of the input sets (all values from both sets, deduplicated)                        |
| `or{V}`                  | `(Set{V}, Set{V}) -> Set{V}`      | An alias for `union{V}` (for binding to the `||` operator)                                                             |
| `intersect{V}`           | `(Set{V}, Set{V}) -> Set{V}`      | Returns a new set that is the intersection of the input sets (only values in both sets)                                |
| `and{V}`                 | `(Set{V}, Set{V}) -> Set{V}`      | An alias for `intersect{V}` (for binding to the `&&` operator)                                                         |
| `difference{V}`          | `(Set{V}, Set{V}) -> Set{V}`      | Returns a new set that is the difference of the input sets (only values only in the first set)                         |
| `div{V}`                 | `(Set{V}, Set{V}) -> Set{V}`      | An alias for `difference{V}` (for binding to the `/` operator)                                                         |
| `symmetricDifference{V}` | `(Set{V}, Set{V}) -> Set{V}`      | Returns a new set that is the symmetric difference of the input sets (all values from both sets, except those in both) |
| `xor{V}`                 | `(Set{V}, Set{V}) -> Set{V}`      | An alias for `symmetricDifference{V}` (for binding to the `^` operator)                                                |
| `product{V}`             | `(Set{V}, Set{V}) -> Set{(V, V)}` | Returns a new set that is the product of the input sets (tuples of all values from each set paired together)           |
| `mul{V}`                 | `(Set{V}, Set{V}) -> Set{(V, V)}` | An alias for `product{V}` (for binding to the `*` operator)                                                            |

### Tree-related functions

| Name           | Type                                                          | Description                                                                                                                   | Explicit |
| :------------- | :------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------- | :------: |
| `Tree{T}`      | `(Array{T}, Array{Maybe{i64}}, Array{Array{i64}}) -> Tree{T}` | Constructs a new tree by manually defining its internals. You probably don't want this                                        | ❌       |
| `Node{T}`      | `(i64, Tree{T}) -> Node{T}`                                   | Constructs a new node by manually specifying the node id and the tree it references. You probably don't want this             | ❌       |
| `Tree{T}`      | `T -> Tree{T}`                                                | Constructs a new tree with the provided `T` value as the root node                                                            | ✅       |
| `Tree{T}`      | `Node{T} -> Tree{T}`                                          | Returns the tree the node is associated with                                                                                  | ✅       |
| `rootNode{T}`  | `Tree{T} -> Node{T}`                                          | Returns the root node of the provided tree                                                                                    | ✅       |
| `len{T}`       | `Tree{T} -> i64`                                              | Returns the number of nodes in the tree                                                                                       | ✅       |
| `Node{T}`      | `(Tree{T}, i64) -> Node{T}?`                                  | Constructs a new node for the specified node id, but will return `void` if the node id doesn't exist                          | ✅       |
| `parent{T}`    | `Node{T} -> Node{T}?`                                         | Returns the parent node of the current node, or `void` if the current node is the root node                                   | ✅       |
| `children{T}`  | `Node{T} -> Node{T}[]`                                        | Returns an array of nodes that are children of the current node                                                               | ✅       |
| `children{T}`  | `Tree{T} -> Node{T}[]`                                        | Returns an array of nodes that are children of the root node of the tree                                                      | ✅       |
| `addChild{T}`  | `(Node{T}, T) -> Node{T}`                                     | Adds the provided `T` as a child of the provided node, returning the new node for that value                                  | ✅       |
| `addChild{T}`  | `(Node{T}, Tree{T}) -> Node{T}`                               | Adds the provided tree as a child of the provided node, returning the new node that represents the root node of the tree      | ✅       |
| `addChild{T}`  | `(Tree{T}, T) -> Node{T}`                                     | Adds the provided `T` as a child of the root node of the provided tree, returning the new node for that value                 | ✅       |
| `getOr{T}`     | `(Node{T}, T) -> T`                                           | Returns the value the node points to or the default `T` value provided if the node is invalid                                 | ✅       |
| `Array{T}`     | `Tree{T} -> Array{Node{T}}`                                   | Returns an array of all nodes in the tree                                                                                     | ✅       |
| `map{T, U}`    | `(Tree{T}, Node{T} -> Node{U}) -> Tree{U}`                    | Maps a tree from type `T` to `U` using a function that converts from one node type to the other                               | ✅       |
| `map{T, U}`    | `(Tree{T}, (Node{T}, i64) -> Node{U}) -> Tree{U}`             | Maps a tree from type `T` to `U` using a function that converts from one node type (and node id) to the other                 | ✅       |
| `every{T}`     | `(Tree{T}, Node{T} -> bool) -> bool`                          | Returns `true` if every node in the tree returns `true` when passed to the provided function                                  | ✅       |
| `some{T}`      | `(Tree{T}, Node{T} -> bool) -> bool`                          | Returns `true` if any node in the tree returns `true` when passed to the provided function                                    | ✅       |
| `reduce{T}`    | `(Tree{T}, (Node{T}, Node{T}) -> Node{T}) -> Node{T}?`        | Reduces the entire tree to a singular node using the provided function, or `void` if the tree is empty                        | ✅       |
| `reduce{T}`    | `(Tree{T}, (Node{T}, Node{T}, i64) -> Node{T}) -> Node{T}?`   | Reduces the entire tree to a singular node using the provided function and node index, or `void` if the tree is empty         | ✅       |
| `reduce{T, U}` | `(Tree{T}, U, (U, Node{T}) -> U) -> U`                        | Reduces the entire tree to a singular `U` value, or returns the initial `U` value if the tree is empty                        | ✅       |
| `reduce{T, U}` | `(Tree{T}, U, (U, Node{T}, i64) -> U) -> U`                   | Reduces the entire tree to a singular `U` value using the node indexes, or returns the initial `U` value if the tree is empty | ✅       |
| `find{T}`      | `(Tree{T}, Node{T} -> bool) -> Node{T}?`                      | Finds the first node in the tree that returns `true` when passed to the provided function, otherwise `void`                   | ✅       |

### Thread-related functions

| Name   | Type        | Description                                                         |
| :----- | :---------- | :------------------------------------------------------------------ |
| `wait` | `i64 -> ()` | Sleeps the current thread for the specified number of milliseconds. |

### Time-related functions

| Name      | Type                  | Description                                                                             |
| :-------- | :-------------------- | :-------------------------------------------------------------------------------------- |
| `now`     | `() -> Instant`       | Returns a representation of the current time (opaque, Rust-only)                        |
| `now`     | `() -> Performance`   | Returns a representation of the curent time (opaque, Javascript-only)                   |
| `elapsed` | `Instant -> Duration` | Calculates the delta between the tagged time and now (opaque, Rust-only)                |
| `elasped` | `Performance -> f64`  | Calculates the delta between the tagged time and now (`f64` seconds, Javascript-only)   |
| `f64`     | `Duration -> f64`     | Converts the opaque duration into an `f64` in seconds, (Rust-only)                      |

### Uuid-related functions

| Name     | Type             | Description                                 |
| :------- | :--------------- | :------------------------------------------ |
| `uuid`   | `() -> uuid`     | Generates a new UUID (opaque)               |
| `string` | `uuid -> string` | Creates a string representation of the UUID |

### GPU-related functions

| Name             | Type                                               | Description                                                                                                                                                                                                |
| :--------------- | :------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mapReadBuffer`  | `() -> BufferUsages`                               | Returns the buffer usages needed for a GPU -> CPU read buffer                                                                                                                                              |
| `mapWriteBuffer` | `() -> BufferUsages`                               | Returns the buffer usages needed for a CPU -> GPU write buffer                                                                                                                                             |
| `storageBuffer`  | `() -> BufferUsages`                               | Returns the buffer usages needed for a GPU-only read/write storage buffer                                                                                                                                  |
| `GBuffer{T}`     | `(BufferUsages, T[]) -> GBuffer`                   | Constructs a buffer on the GPU using the provided array as data                                                                                                                                            |
| `GBuffer{T}`     | `(BufferUsages, i64) -> GBuffer`                   | Constructs an empty buffer on the GPU using the `i64` as the size in bytes                                                                                                                                 |
| `GBuffer{T}`     | `T[] -> GBuffer`                                   | Constructs a storage buffer using the provided array as data                                                                                                                                               |
| `GBuffer{T}`     | `i64 -> GBuffer`                                   | Constructs an empty storage buffer on the GPU using the `i64` as the size in bytes                                                                                                                         |
| `cpulen`         | `GBuffer -> i64`                                   | Returns the size in bytes of the buffer. CPU-only, not GPGPU                                                                                                                                               |
| `id`             | `GBuffer -> string`                                | Returns a unique ID string for the buffer                                                                                                                                                                  |
| `GPGPU`          | `(string, Array{Array{GBuffer}}, i64[3]) -> GPGPU` | Constructs a representation of `GPGPU` work to be done. The `string` is the WGSL shader code working on the provided buffers executing with the number of X, Y, and Z workgroups specified in the `i64[3]` |
| `GPGPU`          | `(string, GBuffer) -> GPGPU`                       | Constructs a representation of `GPGPU` work to be done. The `string` is the WGSL shader code using the singular buffer. The set of workgroups is automatically derived from the buffer size                |
| `run`            | `Mut{GPGPU} -> ()`                                 | Runs the representation of `GPGPU` work. Mutates the underlying buffers (by design) and compiles the shader code, if necessary, and caches it                                                              |
| `run`            | `Mut{GPGPU[]} -> ()`                               | Runs the array of `GPGPU` work sequentially on the GPU. Mutates the underlying buffers (by design) and compiles the shader code, if necessary, and caches it                                               |
| `shader`         | `GPGPU -> string`                                  | Extracts the shader code from the `GPGPU` value                                                                                                                                                            |
| `read{T}`        | `GBuffer -> T[]`                                   | Reads the data stored in the GPU buffer as an array of `T` values                                                                                                                                          |
| `replace{T}`     | `(GBuffer, T[]) -> ()!`                            | Replaces the data stored in the GPU buffer with the array of `T` values. Returns an `Error` if unsuccessful                                                                                                |

### Ergonomic GPGPU functions

| Name          | Type                                                             | Description                                                                                                                                                                                                                                                                                                                                                 | Explicit |
| :------------ | :--------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| `WgpuType{N}` | `(N, string, Dict{string, string}, Set{GBuffer}) -> WgpuType{N}` | Manually construct a WGSL value for any type of data. `N` must be a compile-time `String` representing the WGSL type, the `string` is the name of the value, `Dict{string, string}` is the set of value-definition pairs needed to create the value, and `Set{GBuffer}` is the set of GPU buffers needed to create it. You probably won't use this directly | ❌       |
| `build{N}`    | `N -> GPGPU`                                                     | Builds a representation of `GPGPU` work to be done. The `N` type must be derived from the `WgpuType{N}` for it to work. The dictionary of value definitions is used to construct a compute shader to generate the value represented by the `string`, and the set of GPU buffers is turned into an array of GPU buffers for the shader to use                | ✅       |
| `build{N}`    | `N[] -> GPGPU`                                                   | Builds a representation of `GPGPU` work to be done. The `N` type must be derived from the `WgpuType{N}` for it to work. This variant allows for multiple values to be calculated within a single shader (generally assignments to the GPU buffers to cause side-effects since they cannot by definition explicitly depend on each other )                   | ✅       |

### GPGPU Primitive Type functions

| Name                      | Type                                                    | Description                                                                                                     | Explicit |
| :------------------------ | :------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------- | :------: |
| `gu32`                    | `(string, Dict{string, string}, Set{GBuffer}) -> gu32`  | Manually construct a GPU `u32` value. You probably won't use this directly                                      | ❌       |
| `gi32`                    | `(string, Dict{string, string}, Set{GBuffer}) -> gi32`  | Manually construct a GPU `i32` value. You probably won't use this directly                                      | ❌       |
| `gf32`                    | `(string, Dict{string, string}, Set{GBuffer}) -> gf32`  | Manually construct a GPU `f32` value. You probably won't use this directly                                      | ❌       |
| `gbool`                   | `(string, Dict{string, string}, Set{GBuffer}) -> gbool` | Manually construct a GPU `bool` value. You probably won't use this directly                                     | ❌       |
| `gPrimitiveConvert{I, O}` | `I -> O`                                                | Manually construct a GPU type cast from the input type to the output type. You probably won't use this directly | ✅       |
| `gu32`                    | `u32 -> gu32`                                           | Converts a `u32` into a GPU `u32`                                                                               | ✅       |
| `gu32`                    | `gu32 -> gu32`                                          | Returns the original value back                                                                                 | ✅       |
| `gu32`                    | `gi32 -> gu32`                                          | Converts a `gi32` to a `gu32`                                                                                   | ✅       |
| `gu32`                    | `gf32 -> gu32`                                          | Converts a `gf32` to a `gu32`                                                                                   | ✅       |
| `gu32`                    | `gbool -> gu32`                                         | Converts a `gbool` to a `gu32`                                                                                  | ✅       |
| `gu32{T}`                 | `T -> gu32`                                             | Converts the input type into a `u32` and then converts that into a `gu32`                                       | ✅       |
| `gi32`                    | `i32 -> gi32`                                           | Converts a `i32` into a GPU `i32`                                                                               | ✅       |
| `gi32`                    | `gu32 -> gi32`                                          | Converts a `gu32` to a `gi32`                                                                                   | ✅       |
| `gi32`                    | `gi32 -> gi32`                                          | Returns the original value back                                                                                 | ✅       |
| `gi32`                    | `gf32 -> gi32`                                          | Converts a `gf32` to a `gi32`                                                                                   | ✅       |
| `gi32`                    | `gbool -> gi32`                                         | Converts a `gbool` to a `gi32`                                                                                  | ✅       |
| `gi32{T}`                 | `T -> gi32`                                             | Converts the input type into a `i32` and then converts that into a `gi32`                                       | ✅       |
| `gf32`                    | `f32 -> gf32`                                           | Converts a `f32` into a GPU `f32`                                                                               | ✅       |
| `gf32`                    | `gu32 -> gf32`                                          | Converts a `gu32` to a `gf32`                                                                                   | ✅       |
| `gf32`                    | `gi32 -> gf32`                                          | Converts a `gi32` to a `gf32`                                                                                   | ✅       |
| `gf32`                    | `gf32 -> gf32`                                          | Returns the original value back                                                                                 | ✅       |
| `gf32`                    | `gbool -> gf32`                                         | Converts a `gbool` to a `gf32`                                                                                  | ✅       |
| `gf32{T}`                 | `T -> gf32`                                             | Converts the input type into a `f32` and then converts that into a `gf32`                                       | ✅       |
| `gbool`                   | `bool -> gbool`                                         | Converts a `bool` into a GPU `bool`                                                                             | ✅       |
| `gbool`                   | `gu32 -> gbool`                                         | Converts a `gu32` to a `gbool`                                                                                  | ✅       |
| `gbool`                   | `gi32 -> gbool`                                         | Converts a `gi32` to a `gbool`                                                                                  | ✅       |
| `gbool`                   | `gf32 -> gbool`                                         | Converts a `gf32` to a `gbool`                                                                                  | ✅       |
| `gbool`                   | `gbool -> gbool`                                        | Returns the original value back                                                                                 | ✅       |
| `gbool{T}`                | `T -> gbool`                                            | Converts the input type into a `bool` and then converts that into a `gbool`                                     | ✅       |
| `len`                     | `GBuffer -> gu32`                                       | Returns the length of the specified GPU buffer as a `gu32` to use in GPGPU computation                          | ✅       |

### GPGPU Vector Constructor functions

| Name                   | Type                                                     | Description                                                                                                                                            | Explicit |
| :--------------------- | :------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| `gvec2u`               | `(string, Dict{string, string}, Set{GBuffer}) -> gvec2u` | Manually construct a GPU 2-element `u32` vector. You probably won't use this directly                                                                  | ❌       |
| `gvec2i`               | `(string, Dict{string, string}, Set{GBuffer}) -> gvec2u` | Manually construct a GPU 2-element `i32` vector. You probably won't use this directly                                                                  | ❌       |
| `gvec2f`               | `(string, Dict{string, string}, Set{GBuffer}) -> gvec2u` | Manually construct a GPU 2-element `f32` vector. You probably won't use this directly                                                                  | ❌       |
| `gvec2b`               | `(string, Dict{string, string}, Set{GBuffer}) -> gvec2u` | Manually construct a GPU 2-element `bool` vector. You probably won't use this directly                                                                 | ❌       |
| `gvec3u`               | `(string, Dict{string, string}, Set{GBuffer}) -> gvec3u` | Manually construct a GPU 3-element `u32` vector. You probably won't use this directly                                                                  | ❌       |
| `gvec3i`               | `(string, Dict{string, string}, Set{GBuffer}) -> gvec3u` | Manually construct a GPU 3-element `i32` vector. You probably won't use this directly                                                                  | ❌       |
| `gvec3f`               | `(string, Dict{string, string}, Set{GBuffer}) -> gvec3u` | Manually construct a GPU 3-element `f32` vector. You probably won't use this directly                                                                  | ❌       |
| `gvec3b`               | `(string, Dict{string, string}, Set{GBuffer}) -> gvec3u` | Manually construct a GPU 3-element `bool` vector. You probably won't use this directly                                                                 | ❌       |
| `gvec4u`               | `(string, Dict{string, string}, Set{GBuffer}) -> gvec4u` | Manually construct a GPU 4-element `u32` vector. You probably won't use this directly                                                                  | ❌       |
| `gvec4i`               | `(string, Dict{string, string}, Set{GBuffer}) -> gvec4u` | Manually construct a GPU 4-element `i32` vector. You probably won't use this directly                                                                  | ❌       |
| `gvec4f`               | `(string, Dict{string, string}, Set{GBuffer}) -> gvec4u` | Manually construct a GPU 4-element `f32` vector. You probably won't use this directly                                                                  | ❌       |
| `gvec4b`               | `(string, Dict{string, string}, Set{GBuffer}) -> gvec4u` | Manually construct a GPU 4-element `bool` vector. You probably won't use this directly                                                                 | ❌       |
| `gvec2Primitive{I, O}` | `(I, I) -> O`                                            | Manually construct a GPU type cast from the input types into the output type. You probably won't use this directly                                     | ✅       |
| `gvec2u`               | `() -> gvec2u`                                           | Returns a default GPU 2-element `u32` vector                                                                                                           | ✅       |
| `gvec2u`               | `(gu32, gu32) -> gvec2u`                                 | Constructs a GPU 2-element `u32` vector with GPU `u32` values                                                                                          | ✅       |
| `gvec2u{T}`            | `(T, T) -> gvec2u`                                       | Converts the provided values into GPU `u32` values and then constructs a GPU 2-element `u32` vector                                                    | ✅       |
| `gvec2u{T}`            | `T -> gvec2u`                                            | Converts the provided value into a GPU `u32` value and the constructs a GPU 2-element `u32` vector with both values set to this value                  | ✅       |
| `gvec2i`               | `() -> gvec2i`                                           | Returns a default GPU 2-element `i32` vector                                                                                                           | ✅       |
| `gvec2i`               | `(gi32, gi32) -> gvec2i`                                 | Constructs a GPU 2-element `i32` vector with GPU `i32` values                                                                                          | ✅       |
| `gvec2i{T}`            | `(T, T) -> gvec2i`                                       | Converts the provided values into GPU `i32` values and then constructs a GPU 2-element `i32` vector                                                    | ✅       |
| `gvec2i{T}`            | `T -> gvec2i`                                            | Converts the provided value into a GPU `i32` value and the constructs a GPU 2-element `i32` vector with both values set to this value                  | ✅       |
| `gvec2f`               | `() -> gvec2f`                                           | Returns a default GPU 2-element `f32` vector                                                                                                           | ✅       |
| `gvec2f`               | `(gf32, gf32) -> gvec2f`                                 | Constructs a GPU 2-element `f32` vector with GPU `f32` values                                                                                          | ✅       |
| `gvec2f{T}`            | `(T, T) -> gvec2f`                                       | Converts the provided values into GPU `f32` values and then constructs a GPU 2-element `f32` vector                                                    | ✅       |
| `gvec2f{T}`            | `T -> gvec2f`                                            | Converts the provided value into a GPU `f32` value and the constructs a GPU 2-element `f32` vector with both values set to this value                  | ✅       |
| `gvec2b`               | `() -> gvec2b`                                           | Returns a default GPU 2-element `bool` vector                                                                                                          | ✅       |
| `gvec2b`               | `(gbool, gbool) -> gvec2b`                               | Constructs a GPU 2-element `bool` vector with GPU `bool` values                                                                                        | ✅       |
| `gvec2b{T}`            | `(T, T) -> gvec2b`                                       | Converts the provided values into GPU `bool` values and then constructs a GPU 2-element `bool` vector                                                  | ✅       |
| `gvec2b{T}`            | `T -> gvec2b`                                            | Converts the provided value into a GPU `bool` value and the constructs a GPU 2-element `bool` vector with both values set to this value                | ✅       |
| `gvec3Primitive{I, O}` | `(I, I, I) -> O`                                         | Manually construct a GPU type cast from the input types into the output type. You probably won't use this directly                                     | ✅       |
| `gvec3u`               | `() -> gvec3u`                                           | Returns a default GPU 3-element `u32` vector                                                                                                           | ✅       |
| `gvec3u`               | `(gu32, gu32, gu32) -> gvec3u`                           | Constructs a GPU 3-element `u32` vector with GPU `u32` values                                                                                          | ✅       |
| `gvec3u{T}`            | `(T, T, T) -> gvec3u`                                    | Converts the provided values into GPU `u32` values and then constructs a GPU 3-element `u32` vector                                                    | ✅       |
| `gvec3u{T}`            | `T -> gvec3u`                                            | Converts the provided value into a GPU `u32` value and the constructs a GPU 3-element `u32` vector with all values set to this value                   | ✅       |
| `gvec3i`               | `() -> gvec3i`                                           | Returns a default GPU 3-element `i32` vector                                                                                                           | ✅       |
| `gvec3i`               | `(gi32, gi32, gi32) -> gvec3i`                           | Constructs a GPU 3-element `i32` vector with GPU `i32` values                                                                                          | ✅       |
| `gvec3i{T}`            | `(T, T, T) -> gvec3i`                                    | Converts the provided values into GPU `i32` values and then constructs a GPU 3-element `i32` vector                                                    | ✅       |
| `gvec3i{T}`            | `T -> gvec3i`                                            | Converts the provided value into a GPU `i32` value and the constructs a GPU 3-element `i32` vector with all values set to this value                   | ✅       |
| `gvec3f`               | `() -> gvec3f`                                           | Returns a default GPU 3-element `f32` vector                                                                                                           | ✅       |
| `gvec3f`               | `(gf32, gf32, gf32) -> gvec3f`                           | Constructs a GPU 3-element `f32` vector with GPU `f32` values                                                                                          | ✅       |
| `gvec3f{T}`            | `(T, T, T) -> gvec3f`                                    | Converts the provided values into GPU `f32` values and then constructs a GPU 3-element `f32` vector                                                    | ✅       |
| `gvec3f{T}`            | `T -> gvec3f`                                            | Converts the provided value into a GPU `f32` value and the constructs a GPU 3-element `f32` vector with all values set to this value                   | ✅       |
| `gvec3b`               | `() -> gvec3b`                                           | Returns a default GPU 3-element `bool` vector                                                                                                          | ✅       |
| `gvec3b`               | `(gbool, gbool, gbool) -> gvec3b`                        | Constructs a GPU 3-element `bool` vector with GPU `bool` values                                                                                        | ✅       |
| `gvec3b{T}`            | `(T, T, T) -> gvec3b`                                    | Converts the provided values into GPU `bool` values and then constructs a GPU 3-element `bool` vector                                                  | ✅       |
| `gvec3b{T}`            | `T -> gvec3b`                                            | Converts the provided value into a GPU `bool` value and the constructs a GPU 3-element `bool` vector with all values set to this value                 | ✅       |
| `gvec4Primitive{I, O}` | `(I, I, I, I) -> O`                                      | Manually construct a GPU type cast from the input types into the output type. You probably won't use this directly                                     | ✅       |
| `gvec4u`               | `() -> gvec4u`                                           | Returns a default GPU 4-element `u32` vector                                                                                                           | ✅       |
| `gvec4u`               | `(gu32, gu32, gu32, gu32) -> gvec4u`                     | Constructs a GPU 4-element `u32` vector with GPU `u32` values                                                                                          | ✅       |
| `gvec4u{T}`            | `(T, T, T, T) -> gvec4u`                                 | Converts the provided values into GPU `u32` values and then constructs a GPU 4-element `u32` vector                                                    | ✅       |
| `gvec4u{T}`            | `T -> gvec4u`                                            | Converts the provided value into a GPU `u32` value and the constructs a GPU 4-element `u32` vector with all values set to this value                   | ✅       |
| `gvec4i`               | `() -> gvec4i`                                           | Returns a default GPU 4-element `i32` vector                                                                                                           | ✅       |
| `gvec4i`               | `(gi32, gi32, gi32, gi32) -> gvec4i`                     | Constructs a GPU 4-element `i32` vector with GPU `i32` values                                                                                          | ✅       |
| `gvec4i{T}`            | `(T, T, T, T) -> gvec4i`                                 | Converts the provided values into GPU `i32` values and then constructs a GPU 4-element `i32` vector                                                    | ✅       |
| `gvec4i{T}`            | `T -> gvec4i`                                            | Converts the provided value into a GPU `i32` value and the constructs a GPU 4-element `i32` vector with all values set to this value                   | ✅       |
| `gvec4f`               | `() -> gvec4f`                                           | Returns a default GPU 4-element `f32` vector                                                                                                           | ✅       |
| `gvec4f`               | `(gf32, gf32, gf32, gf32) -> gvec4f`                     | Constructs a GPU 4-element `f32` vector with GPU `f32` values                                                                                          | ✅       |
| `gvec4f{T}`            | `(T, T, T, T) -> gvec4f`                                 | Converts the provided values into GPU `f32` values and then constructs a GPU 4-element `f32` vector                                                    | ✅       |
| `gvec4f{T}`            | `T -> gvec4f`                                            | Converts the provided value into a GPU `f32` value and the constructs a GPU 4-element `f32` vector with all values set to this value                   | ✅       |
| `gvec4b`               | `() -> gvec4b`                                           | Returns a default GPU 4-element `bool` vector                                                                                                          | ✅       |
| `gvec4b`               | `(gbool, gbool, gbool, gbool) -> gvec4b`                 | Constructs a GPU 4-element `bool` vector with GPU `bool` values                                                                                        | ✅       |
| `gvec4b{T}`            | `(T, T, T, T) -> gvec4b`                                 | Converts the provided values into GPU `bool` values and then constructs a GPU 4-element `bool` vector                                                  | ✅       |
| `gvec4b{T}`            | `T -> gvec4b`                                            | Converts the provided value into a GPU `bool` value and the constructs a GPU 4-element `bool` vector with all values set to this value                 | ✅       |
| `gFor`                 | `(u32, u32, u32) -> gvec3u`                              | Constructs the special global invocation id. This special type can only be constructed CPU side and read GPU side. Used for compute shader parallelism | ✅       |
| `gFor{T}`              | `(T, T, T) -> gvec3u`                                    | Converts the `T` values to `u32` and constructs a global invocation id                                                                                 | ✅       |
| `gFor{T}`              | `(T, T) -> gvec3u`                                       | Converts the `T` values to `u32` and constructs a global invocation id. The `Z` value is set to `1`                                                    | ✅       |
| `gFor{T}`              | `T -> gvec3u`                                            | Converts the `T` value to `u32` and constructs a global invocation id. The `Y` and `Z` values are set to `1`                                           | ✅       |

### GPGPU Matrix Constructor functions

| Name          | Type                                                                                                           | Description                                                               | Explicit |
| :------------ | :------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ | :------: |
| `gmat2x2f`    | `(string, Dict{string, string}, Set{GBuffer}) -> gmat2x2f`                                                     | Manually construct a GPU 2x2 matrix. You probably won't use this directly | ❌       |
| `gmat2x3f`    | `(string, Dict{string, string}, Set{GBuffer}) -> gmat2x2f`                                                     | Manually construct a GPU 2x3 matrix. You probably won't use this directly | ❌       |
| `gmat2x4f`    | `(string, Dict{string, string}, Set{GBuffer}) -> gmat2x2f`                                                     | Manually construct a GPU 2x4 matrix. You probably won't use this directly | ❌       |
| `gmat3x2f`    | `(string, Dict{string, string}, Set{GBuffer}) -> gmat3x2f`                                                     | Manually construct a GPU 3x2 matrix. You probably won't use this directly | ❌       |
| `gmat3x3f`    | `(string, Dict{string, string}, Set{GBuffer}) -> gmat3x2f`                                                     | Manually construct a GPU 3x3 matrix. You probably won't use this directly | ❌       |
| `gmat3x4f`    | `(string, Dict{string, string}, Set{GBuffer}) -> gmat3x2f`                                                     | Manually construct a GPU 3x4 matrix. You probably won't use this directly | ❌       |
| `gmat4x2f`    | `(string, Dict{string, string}, Set{GBuffer}) -> gmat4x2f`                                                     | Manually construct a GPU 4x2 matrix. You probably won't use this directly | ❌       |
| `gmat4x3f`    | `(string, Dict{string, string}, Set{GBuffer}) -> gmat4x2f`                                                     | Manually construct a GPU 4x3 matrix. You probably won't use this directly | ❌       |
| `gmat4x4f`    | `(string, Dict{string, string}, Set{GBuffer}) -> gmat4x2f`                                                     | Manually construct a GPU 4x4 matrix. You probably won't use this directly | ❌       |
| `gmat2x2f`    | `() -> gmat2x2f`                                                                                               | Returns a default GPU 2x2 matrix                                          | ✅       |
| `gmat2x2f`    | `(gvec2f, gvec2f) -> gmat2x2f`                                                                                 | Returns a GPU 2x2 matrix assembled from two vector columns                | ✅       |
| `gmat2x2f{I}` | `(I, I, I, I) -> gmat2x2f`                                                                                     | Converts the input values to `gf32` and stores them column by column      | ✅       |
| `gmat2x2f`    | `(gf32, gf32, gf32, gf32) -> gmat2x2f`                                                                         | Returns a GPU 2x2 matrix assembled from `gf32` values in column order     | ✅       |
| `gmat2x3f`    | `() -> gmat2x3f`                                                                                               | Returns a default GPU 2x3 matrix                                          | ✅       |
| `gmat2x3f`    | `(gvec3f, gvec3f) -> gmat2x3f`                                                                                 | Returns a GPU 2x3 matrix assembled from two vector columns                | ✅       |
| `gmat2x3f{I}` | `(I, I, I, I, I, I) -> gmat2x3f`                                                                               | Converts the input values to `gf32` and stores them column by column      | ✅       |
| `gmat2x3f`    | `(gf32, gf32, gf32, gf32, gf32, gf32) -> gmat2x3f`                                                             | Returns a GPU 2x3 matrix assembled from `gf32` values in column order     | ✅       |
| `gmat2x4f`    | `() -> gmat2x4f`                                                                                               | Returns a default GPU 2x4 matrix                                          | ✅       |
| `gmat2x4f`    | `(gvec4f, gvec4f) -> gmat2x4f`                                                                                 | Returns a GPU 2x4 matrix assembled from two vector columns                | ✅       |
| `gmat2x4f{I}` | `(I, I, I, I, I, I, I, I) -> gmat2x4f`                                                                         | Converts the input values to `gf32` and stores them column by column      | ✅       |
| `gmat2x4f`    | `(gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32) -> gmat2x4f`                                                 | Returns a GPU 2x4 matrix assembled from `gf32` values in column order     | ✅       |
| `gmat3x2f`    | `() -> gmat3x2f`                                                                                               | Returns a default GPU 3x2 matrix                                          | ✅       |
| `gmat3x2f`    | `(gvec2f, gvec2f, gvec2f) -> gmat3x2f`                                                                         | Returns a GPU 3x2 matrix assembled from three vector columns              | ✅       |
| `gmat3x2f{I}` | `(I, I, I, I, I, I) -> gmat3x2f`                                                                               | Converts the input values to `gf32` and stores them column by column      | ✅       |
| `gmat3x2f`    | `(gf32, gf32, gf32, gf32, gf32, gf32) -> gmat3x2f`                                                             | Returns a GPU 3x2 matrix assembled from `gf32` values in column order     | ✅       |
| `gmat3x3f`    | `() -> gmat3x3f`                                                                                               | Returns a default GPU 3x3 matrix                                          | ✅       |
| `gmat3x3f`    | `(gvec3f, gvec3f, gvec3f) -> gmat3x3f`                                                                         | Returns a GPU 3x3 matrix assembled from three vector columns              | ✅       |
| `gmat3x3f{I}` | `(I, I, I, I, I, I, I, I, I) -> gmat3x3f`                                                                      | Converts the input values to `gf32` and stores them column by column      | ✅       |
| `gmat3x3f`    | `(gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32) -> gmat3x3f`                                           | Returns a GPU 3x3 matrix assembled from `gf32` values in column order     | ✅       |
| `gmat3x4f`    | `() -> gmat3x4f`                                                                                               | Returns a default GPU 3x4 matrix                                          | ✅       |
| `gmat3x4f`    | `(gvec4f, gvec4f, gvec4f) -> gmat3x4f`                                                                         | Returns a GPU 3x4 matrix assembled from three vector columns              | ✅       |
| `gmat3x4f{I}` | `(I, I, I, I, I, I, I, I, I, I, I, I) -> gmat3x4f`                                                             | Converts the input values to `gf32` and stores them column by column      | ✅       |
| `gmat3x4f`    | `(gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32) -> gmat3x4f`                         | Returns a GPU 3x4 matrix assembled from `gf32` values in column order     | ✅       |
| `gmat4x2f`    | `() -> gmat4x2f`                                                                                               | Returns a default GPU 4x2 matrix                                          | ✅       |
| `gmat4x2f`    | `(gvec2f, gvec2f, gvec2f, gvec2f) -> gmat4x2f`                                                                 | Returns a GPU 4x2 matrix assembled from four vector columns               | ✅       |
| `gmat4x2f{I}` | `(I, I, I, I, I, I, I, I) -> gmat4x2f`                                                                         | Converts the input values to `gf32` and stores them column by column      | ✅       |
| `gmat4x2f`    | `(gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32) -> gmat4x2f`                                                 | Returns a GPU 4x2 matrix assembled from `gf32` values in column order     | ✅       |
| `gmat4x3f`    | `() -> gmat4x3f`                                                                                               | Returns a default GPU 4x3 matrix                                          | ✅       |
| `gmat4x3f`    | `(gvec3f, gvec3f, gvec3f, gvec3f) -> gmat4x3f`                                                                 | Returns a GPU 4x3 matrix assembled from four vector columns               | ✅       |
| `gmat4x3f{I}` | `(I, I, I, I, I, I, I, I, I, I, I, I) -> gmat4x3f`                                                             | Converts the input values to `gf32` and stores them column by column      | ✅       |
| `gmat4x3f`    | `(gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32) -> gmat4x3f`                         | Returns a GPU 4x3 matrix assembled from `gf32` values in column order     | ✅       |
| `gmat4x4f`    | `() -> gmat4x4f`                                                                                               | Returns a default GPU 4x4 matrix                                          | ✅       |
| `gmat4x4f`    | `(gvec4f, gvec4f, gvec4f, gvec4f) -> gmat4x4f`                                                                 | Returns a GPU 4x4 matrix assembled from four vector columns               | ✅       |
| `gmat4x4f{I}` | `(I, I, I, I, I, I, I, I, I, I, I, I, I, I, I, I) -> gmat4x4f`                                                 | Converts the input values to `gf32` and stores them column by column      | ✅       |
| `gmat4x4f`    | `(gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32, gf32) -> gmat4x4f` | Returns a GPU 4x4 matrix assembled from `gf32` values in column order     | ✅       |

### GPGPU Accessor functions

| Name      | Type                         | Description                                                                                               |
| :-------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------- |
| `x`       | `gvec2u -> gu32`             | Accesses the first `u32` value from the 2-element vector                                                  |
| `y`       | `gvec2u -> gu32`             | Accesses the second `u32` value from the 2-element vector                                                 |
| `i`       | `gvec2u -> gu32`             | Accesses the first `u32` value from the 2-element vector                                                  |
| `j`       | `gvec2u -> gu32`             | Accesses the second `u32` value from the 2-element vector                                                 |
| `r`       | `gvec2u -> gu32`             | Accesses the first `u32` value from the 2-element vector                                                  |
| `g`       | `gvec2u -> gu32`             | Accesses the second `u32` value from the 2-element vector                                                 |
| `gvec22u` | `(gvec2u, string) -> gvec2u` | Manually construct a method intended to reorder the vector. You probably won't use this directly          |
| `xy`      | `gvec2u -> gvec2u`           | Returns the original 2-element vector                                                                     |
| `yx`      | `gvec2u -> gvec2u`           | Reverses the order of the 2-element vector                                                                |
| `ij`      | `gvec2u -> gvec2u`           | Returns the original 2-element vector                                                                     |
| `ji`      | `gvec2u -> gvec2u`           | Reverses the order of the 2-element vector                                                                |
| `rg`      | `gvec2u -> gvec2u`           | Returns the original 2-element vector                                                                     |
| `gr`      | `gvec2u -> gvec2u`           | Reverses the order of the 2-element vector                                                                |
| `x`       | `gvec2i -> gi32`             | Accesses the first `i32` value from the 2-element vector                                                  |
| `y`       | `gvec2i -> gi32`             | Accesses the second `i32` value from the 2-element vector                                                 |
| `i`       | `gvec2i -> gi32`             | Accesses the first `i32` value from the 2-element vector                                                  |
| `j`       | `gvec2i -> gi32`             | Accesses the second `i32` value from the 2-element vector                                                 |
| `r`       | `gvec2i -> gi32`             | Accesses the first `i32` value from the 2-element vector                                                  |
| `g`       | `gvec2i -> gi32`             | Accesses the second `i32` value from the 2-element vector                                                 |
| `gvec22i` | `(gvec2i, string) -> gvec2i` | Manually construct a method intended to reorder the vector. You probably won't use this directly          |
| `xy`      | `gvec2i -> gvec2i`           | Returns the original 2-element vector                                                                     |
| `yx`      | `gvec2i -> gvec2i`           | Reverses the order of the 2-element vector                                                                |
| `ij`      | `gvec2i -> gvec2i`           | Returns the original 2-element vector                                                                     |
| `ji`      | `gvec2i -> gvec2i`           | Reverses the order of the 2-element vector                                                                |
| `rg`      | `gvec2i -> gvec2i`           | Returns the original 2-element vector                                                                     |
| `gr`      | `gvec2i -> gvec2i`           | Reverses the order of the 2-element vector                                                                |
| `x`       | `gvec2f -> gf32`             | Accesses the first `f32` value from the 2-element vector                                                  |
| `y`       | `gvec2f -> gf32`             | Accesses the second `f32` value from the 2-element vector                                                 |
| `i`       | `gvec2f -> gf32`             | Accesses the first `f32` value from the 2-element vector                                                  |
| `j`       | `gvec2f -> gf32`             | Accesses the second `f32` value from the 2-element vector                                                 |
| `r`       | `gvec2f -> gf32`             | Accesses the first `f32` value from the 2-element vector                                                  |
| `g`       | `gvec2f -> gf32`             | Accesses the second `f32` value from the 2-element vector                                                 |
| `gvec22f` | `(gvec2f, string) -> gvec2f` | Manually construct a method intended to reorder the vector. You probably won't use this directly          |
| `xy`      | `gvec2f -> gvec2f`           | Returns the original 2-element vector                                                                     |
| `yx`      | `gvec2f -> gvec2f`           | Reverses the order of the 2-element vector                                                                |
| `ij`      | `gvec2f -> gvec2f`           | Returns the original 2-element vector                                                                     |
| `ji`      | `gvec2f -> gvec2f`           | Reverses the order of the 2-element vector                                                                |
| `rg`      | `gvec2f -> gvec2f`           | Returns the original 2-element vector                                                                     |
| `gr`      | `gvec2f -> gvec2f`           | Reverses the order of the 2-element vector                                                                |
| `x`       | `gvec2b -> gbool`            | Accesses the first `bool` value from the 2-element vector                                                 |
| `y`       | `gvec2b -> gbool`            | Accesses the second `bool` value from the 2-element vector                                                |
| `i`       | `gvec2b -> gbool`            | Accesses the first `bool` value from the 2-element vector                                                 |
| `j`       | `gvec2b -> gbool`            | Accesses the second `bool` value from the 2-element vector                                                |
| `r`       | `gvec2b -> gbool`            | Accesses the first `bool` value from the 2-element vector                                                 |
| `g`       | `gvec2b -> gbool`            | Accesses the second `bool` value from the 2-element vector                                                |
| `gvec22b` | `(gvec2b, string) -> gvec2b` | Manually construct a method intended to reorder the vector. You probably won't use this directly          |
| `xy`      | `gvec2b -> gvec2b`           | Returns the original 2-element vector                                                                     |
| `yx`      | `gvec2b -> gvec2b`           | Reverses the order of the 2-element vector                                                                |
| `ij`      | `gvec2b -> gvec2b`           | Returns the original 2-element vector                                                                     |
| `ji`      | `gvec2b -> gvec2b`           | Reverses the order of the 2-element vector                                                                |
| `rg`      | `gvec2b -> gvec2b`           | Returns the original 2-element vector                                                                     |
| `gr`      | `gvec2b -> gvec2b`           | Reverses the order of the 2-element vector                                                                |
| `x`       | `gvec3u -> gu32`             | Accesses value 0 from the 3-element vector                                                                |
| `y`       | `gvec3u -> gu32`             | Accesses value 1 from the 3-element vector                                                                |
| `z`       | `gvec3u -> gu32`             | Accesses value 2 from the 3-element vector                                                                |
| `i`       | `gvec3u -> gu32`             | Accesses value 0 from the 3-element vector                                                                |
| `j`       | `gvec3u -> gu32`             | Accesses value 1 from the 3-element vector                                                                |
| `k`       | `gvec3u -> gu32`             | Accesses value 2 from the 3-element vector                                                                |
| `r`       | `gvec3u -> gu32`             | Accesses value 0 from the 3-element vector                                                                |
| `g`       | `gvec3u -> gu32`             | Accesses value 1 from the 3-element vector                                                                |
| `b`       | `gvec3u -> gu32`             | Accesses value 2 from the 3-element vector                                                                |
| `gvec32u` | `(gvec3u, string) -> gvec2u` | Manually constructs a method intended to extract a 2-element vector. You probably won't use this directly |
| `xy`      | `gvec3u -> gvec2u`           | Returns a vector using the `[0, 1]` elements                                                              |
| `yx`      | `gvec3u -> gvec2u`           | Returns a vector using the `[1, 0]` elements                                                              |
| `xz`      | `gvec3u -> gvec2u`           | Returns a vector using the `[0, 2]` elements                                                              |
| `zx`      | `gvec3u -> gvec2u`           | Returns a vector using the `[2, 0]` elements                                                              |
| `yz`      | `gvec3u -> gvec2u`           | Returns a vector using the `[1, 2]` elements                                                              |
| `zy`      | `gvec3u -> gvec2u`           | Returns a vector using the `[2, 1]` elements                                                              |
| `ij`      | `gvec3u -> gvec2u`           | Returns a vector using the `[0, 1]` elements                                                              |
| `ji`      | `gvec3u -> gvec2u`           | Returns a vector using the `[1, 0]` elements                                                              |
| `ik`      | `gvec3u -> gvec2u`           | Returns a vector using the `[0, 2]` elements                                                              |
| `ki`      | `gvec3u -> gvec2u`           | Returns a vector using the `[2, 0]` elements                                                              |
| `jk`      | `gvec3u -> gvec2u`           | Returns a vector using the `[1, 2]` elements                                                              |
| `kj`      | `gvec3u -> gvec2u`           | Returns a vector using the `[2, 1]` elements                                                              |
| `rg`      | `gvec3u -> gvec2u`           | Returns a vector using the `[0, 1]` elements                                                              |
| `gr`      | `gvec3u -> gvec2u`           | Returns a vector using the `[1, 0]` elements                                                              |
| `rb`      | `gvec3u -> gvec2u`           | Returns a vector using the `[0, 2]` elements                                                              |
| `br`      | `gvec3u -> gvec2u`           | Returns a vector using the `[2, 0]` elements                                                              |
| `gb`      | `gvec3u -> gvec2u`           | Returns a vector using the `[1, 2]` elements                                                              |
| `bg`      | `gvec3u -> gvec2u`           | Returns a vector using the `[2, 1]` elements                                                              |
| `gvec33u` | `(gvec3u, string) -> gvec2u` | Manually construct a method intended to reorder the vector. You probably won't use this directly          |
| `xyz`     | `gvec3u -> gvec3u`           | Returns the original 3-element vector                                                                     |
| `xzy`     | `gvec3u -> gvec3u`           | Returns a vector using `[0, 2, 1]` ordering                                                               |
| `yxz`     | `gvec3u -> gvec3u`           | Returns a vector using `[1, 0, 2]` ordering                                                               |
| `yzx`     | `gvec3u -> gvec3u`           | Returns a vector using `[1, 2, 0]` ordering                                                               |
| `zxy`     | `gvec3u -> gvec3u`           | Returns a vector using `[2, 0, 1]` ordering                                                               |
| `zyx`     | `gvec3u -> gvec3u`           | Returns a vector using `[2, 1, 0]` ordering                                                               |
| `ijk`     | `gvec3u -> gvec3u`           | Returns the original 3-element vector                                                                     |
| `ikj`     | `gvec3u -> gvec3u`           | Returns a vector using `[0, 2, 1]` ordering                                                               |
| `jik`     | `gvec3u -> gvec3u`           | Returns a vector using `[1, 0, 2]` ordering                                                               |
| `jki`     | `gvec3u -> gvec3u`           | Returns a vector using `[1, 2, 0]` ordering                                                               |
| `kij`     | `gvec3u -> gvec3u`           | Returns a vector using `[2, 0, 1]` ordering                                                               |
| `kji`     | `gvec3u -> gvec3u`           | Returns a vector using `[2, 1, 0]` ordering                                                               |
| `rgb`     | `gvec3u -> gvec3u`           | Returns the original 3-element vector                                                                     |
| `rbg`     | `gvec3u -> gvec3u`           | Returns a vector using `[0, 2, 1]` ordering                                                               |
| `grb`     | `gvec3u -> gvec3u`           | Returns a vector using `[1, 0, 2]` ordering                                                               |
| `gbr`     | `gvec3u -> gvec3u`           | Returns a vector using `[1, 2, 0]` ordering                                                               |
| `brg`     | `gvec3u -> gvec3u`           | Returns a vector using `[2, 0, 1]` ordering                                                               |
| `bgr`     | `gvec3u -> gvec3u`           | Returns a vector using `[2, 1, 0]` ordering                                                               |
| `x`       | `gvec3i -> gi32`             | Accesses value 0 from the 3-element vector                                                                |
| `y`       | `gvec3i -> gi32`             | Accesses value 1 from the 3-element vector                                                                |
| `z`       | `gvec3i -> gi32`             | Accesses value 2 from the 3-element vector                                                                |
| `i`       | `gvec3i -> gi32`             | Accesses value 0 from the 3-element vector                                                                |
| `j`       | `gvec3i -> gi32`             | Accesses value 1 from the 3-element vector                                                                |
| `k`       | `gvec3i -> gi32`             | Accesses value 2 from the 3-element vector                                                                |
| `r`       | `gvec3i -> gi32`             | Accesses value 0 from the 3-element vector                                                                |
| `g`       | `gvec3i -> gi32`             | Accesses value 1 from the 3-element vector                                                                |
| `b`       | `gvec3i -> gi32`             | Accesses value 2 from the 3-element vector                                                                |
| `gvec32i` | `(gvec3i, string) -> gvec2i` | Manually constructs a method intended to extract a 2-element vector. You probably won't use this directly |
| `xy`      | `gvec3i -> gvec2i`           | Returns a vector using the `[0, 1]` elements                                                              |
| `yx`      | `gvec3i -> gvec2i`           | Returns a vector using the `[1, 0]` elements                                                              |
| `xz`      | `gvec3i -> gvec2i`           | Returns a vector using the `[0, 2]` elements                                                              |
| `zx`      | `gvec3i -> gvec2i`           | Returns a vector using the `[2, 0]` elements                                                              |
| `yz`      | `gvec3i -> gvec2i`           | Returns a vector using the `[1, 2]` elements                                                              |
| `zy`      | `gvec3i -> gvec2i`           | Returns a vector using the `[2, 1]` elements                                                              |
| `ij`      | `gvec3i -> gvec2i`           | Returns a vector using the `[0, 1]` elements                                                              |
| `ji`      | `gvec3i -> gvec2i`           | Returns a vector using the `[1, 0]` elements                                                              |
| `ik`      | `gvec3i -> gvec2i`           | Returns a vector using the `[0, 2]` elements                                                              |
| `ki`      | `gvec3i -> gvec2i`           | Returns a vector using the `[2, 0]` elements                                                              |
| `jk`      | `gvec3i -> gvec2i`           | Returns a vector using the `[1, 2]` elements                                                              |
| `kj`      | `gvec3i -> gvec2i`           | Returns a vector using the `[2, 1]` elements                                                              |
| `rg`      | `gvec3i -> gvec2i`           | Returns a vector using the `[0, 1]` elements                                                              |
| `gr`      | `gvec3i -> gvec2i`           | Returns a vector using the `[1, 0]` elements                                                              |
| `rb`      | `gvec3i -> gvec2i`           | Returns a vector using the `[0, 2]` elements                                                              |
| `br`      | `gvec3i -> gvec2i`           | Returns a vector using the `[2, 0]` elements                                                              |
| `gb`      | `gvec3i -> gvec2i`           | Returns a vector using the `[1, 2]` elements                                                              |
| `bg`      | `gvec3i -> gvec2i`           | Returns a vector using the `[2, 1]` elements                                                              |
| `gvec33i` | `(gvec3i, string) -> gvec2i` | Manually construct a method intended to reorder the vector. You probably won't use this directly          |
| `xyz`     | `gvec3i -> gvec3i`           | Returns the original 3-element vector                                                                     |
| `xzy`     | `gvec3i -> gvec3i`           | Returns a vector using `[0, 2, 1]` ordering                                                               |
| `yxz`     | `gvec3i -> gvec3i`           | Returns a vector using `[1, 0, 2]` ordering                                                               |
| `yzx`     | `gvec3i -> gvec3i`           | Returns a vector using `[1, 2, 0]` ordering                                                               |
| `zxy`     | `gvec3i -> gvec3i`           | Returns a vector using `[2, 0, 1]` ordering                                                               |
| `zyx`     | `gvec3i -> gvec3i`           | Returns a vector using `[2, 1, 0]` ordering                                                               |
| `ijk`     | `gvec3i -> gvec3i`           | Returns the original 3-element vector                                                                     |
| `ikj`     | `gvec3i -> gvec3i`           | Returns a vector using `[0, 2, 1]` ordering                                                               |
| `jik`     | `gvec3i -> gvec3i`           | Returns a vector using `[1, 0, 2]` ordering                                                               |
| `jki`     | `gvec3i -> gvec3i`           | Returns a vector using `[1, 2, 0]` ordering                                                               |
| `kij`     | `gvec3i -> gvec3i`           | Returns a vector using `[2, 0, 1]` ordering                                                               |
| `kji`     | `gvec3i -> gvec3i`           | Returns a vector using `[2, 1, 0]` ordering                                                               |
| `rgb`     | `gvec3i -> gvec3i`           | Returns the original 3-element vector                                                                     |
| `rbg`     | `gvec3i -> gvec3i`           | Returns a vector using `[0, 2, 1]` ordering                                                               |
| `grb`     | `gvec3i -> gvec3i`           | Returns a vector using `[1, 0, 2]` ordering                                                               |
| `gbr`     | `gvec3i -> gvec3i`           | Returns a vector using `[1, 2, 0]` ordering                                                               |
| `brg`     | `gvec3i -> gvec3i`           | Returns a vector using `[2, 0, 1]` ordering                                                               |
| `bgr`     | `gvec3i -> gvec3i`           | Returns a vector using `[2, 1, 0]` ordering                                                               |
| `x`       | `gvec3f -> gf32`             | Accesses value 0 from the 3-element vector                                                                |
| `y`       | `gvec3f -> gf32`             | Accesses value 1 from the 3-element vector                                                                |
| `z`       | `gvec3f -> gf32`             | Accesses value 2 from the 3-element vector                                                                |
| `i`       | `gvec3f -> gf32`             | Accesses value 0 from the 3-element vector                                                                |
| `j`       | `gvec3f -> gf32`             | Accesses value 1 from the 3-element vector                                                                |
| `k`       | `gvec3f -> gf32`             | Accesses value 2 from the 3-element vector                                                                |
| `r`       | `gvec3f -> gf32`             | Accesses value 0 from the 3-element vector                                                                |
| `g`       | `gvec3f -> gf32`             | Accesses value 1 from the 3-element vector                                                                |
| `b`       | `gvec3f -> gf32`             | Accesses value 2 from the 3-element vector                                                                |
| `gvec32f` | `(gvec3f, string) -> gvec2f` | Manually constructs a method intended to extract a 2-element vector. You probably won't use this directly |
| `xy`      | `gvec3f -> gvec2f`           | Returns a vector using the `[0, 1]` elements                                                              |
| `yx`      | `gvec3f -> gvec2f`           | Returns a vector using the `[1, 0]` elements                                                              |
| `xz`      | `gvec3f -> gvec2f`           | Returns a vector using the `[0, 2]` elements                                                              |
| `zx`      | `gvec3f -> gvec2f`           | Returns a vector using the `[2, 0]` elements                                                              |
| `yz`      | `gvec3f -> gvec2f`           | Returns a vector using the `[1, 2]` elements                                                              |
| `zy`      | `gvec3f -> gvec2f`           | Returns a vector using the `[2, 1]` elements                                                              |
| `ij`      | `gvec3f -> gvec2f`           | Returns a vector using the `[0, 1]` elements                                                              |
| `ji`      | `gvec3f -> gvec2f`           | Returns a vector using the `[1, 0]` elements                                                              |
| `ik`      | `gvec3f -> gvec2f`           | Returns a vector using the `[0, 2]` elements                                                              |
| `ki`      | `gvec3f -> gvec2f`           | Returns a vector using the `[2, 0]` elements                                                              |
| `jk`      | `gvec3f -> gvec2f`           | Returns a vector using the `[1, 2]` elements                                                              |
| `kj`      | `gvec3f -> gvec2f`           | Returns a vector using the `[2, 1]` elements                                                              |
| `rg`      | `gvec3f -> gvec2f`           | Returns a vector using the `[0, 1]` elements                                                              |
| `gr`      | `gvec3f -> gvec2f`           | Returns a vector using the `[1, 0]` elements                                                              |
| `rb`      | `gvec3f -> gvec2f`           | Returns a vector using the `[0, 2]` elements                                                              |
| `br`      | `gvec3f -> gvec2f`           | Returns a vector using the `[2, 0]` elements                                                              |
| `gb`      | `gvec3f -> gvec2f`           | Returns a vector using the `[1, 2]` elements                                                              |
| `bg`      | `gvec3f -> gvec2f`           | Returns a vector using the `[2, 1]` elements                                                              |
| `gvec33f` | `(gvec3f, string) -> gvec2f` | Manually construct a method intended to reorder the vector. You probably won't use this directly          |
| `xyz`     | `gvec3f -> gvec3f`           | Returns the original 3-element vector                                                                     |
| `xzy`     | `gvec3f -> gvec3f`           | Returns a vector using `[0, 2, 1]` ordering                                                               |
| `yxz`     | `gvec3f -> gvec3f`           | Returns a vector using `[1, 0, 2]` ordering                                                               |
| `yzx`     | `gvec3f -> gvec3f`           | Returns a vector using `[1, 2, 0]` ordering                                                               |
| `zxy`     | `gvec3f -> gvec3f`           | Returns a vector using `[2, 0, 1]` ordering                                                               |
| `zyx`     | `gvec3f -> gvec3f`           | Returns a vector using `[2, 1, 0]` ordering                                                               |
| `ijk`     | `gvec3f -> gvec3f`           | Returns the original 3-element vector                                                                     |
| `ikj`     | `gvec3f -> gvec3f`           | Returns a vector using `[0, 2, 1]` ordering                                                               |
| `jik`     | `gvec3f -> gvec3f`           | Returns a vector using `[1, 0, 2]` ordering                                                               |
| `jki`     | `gvec3f -> gvec3f`           | Returns a vector using `[1, 2, 0]` ordering                                                               |
| `kij`     | `gvec3f -> gvec3f`           | Returns a vector using `[2, 0, 1]` ordering                                                               |
| `kji`     | `gvec3f -> gvec3f`           | Returns a vector using `[2, 1, 0]` ordering                                                               |
| `rgb`     | `gvec3f -> gvec3f`           | Returns the original 3-element vector                                                                     |
| `rbg`     | `gvec3f -> gvec3f`           | Returns a vector using `[0, 2, 1]` ordering                                                               |
| `grb`     | `gvec3f -> gvec3f`           | Returns a vector using `[1, 0, 2]` ordering                                                               |
| `gbr`     | `gvec3f -> gvec3f`           | Returns a vector using `[1, 2, 0]` ordering                                                               |
| `brg`     | `gvec3f -> gvec3f`           | Returns a vector using `[2, 0, 1]` ordering                                                               |
| `bgr`     | `gvec3f -> gvec3f`           | Returns a vector using `[2, 1, 0]` ordering                                                               |
| `x`       | `gvec3b -> gbool`            | Accesses value 0 from the 3-element vector                                                                |
| `y`       | `gvec3b -> gbool`            | Accesses value 1 from the 3-element vector                                                                |
| `z`       | `gvec3b -> gbool`            | Accesses value 2 from the 3-element vector                                                                |
| `i`       | `gvec3b -> gbool`            | Accesses value 0 from the 3-element vector                                                                |
| `j`       | `gvec3b -> gbool`            | Accesses value 1 from the 3-element vector                                                                |
| `k`       | `gvec3b -> gbool`            | Accesses value 2 from the 3-element vector                                                                |
| `r`       | `gvec3b -> gbool`            | Accesses value 0 from the 3-element vector                                                                |
| `g`       | `gvec3b -> gbool`            | Accesses value 1 from the 3-element vector                                                                |
| `b`       | `gvec3b -> gbool`            | Accesses value 2 from the 3-element vector                                                                |
| `gvec32b` | `(gvec3b, string) -> gvec2b` | Manually constructs a method intended to extract a 2-element vector. You probably won't use this directly |
| `xy`      | `gvec3b -> gvec2b`           | Returns a vector using the `[0, 1]` elements                                                              |
| `yx`      | `gvec3b -> gvec2b`           | Returns a vector using the `[1, 0]` elements                                                              |
| `xz`      | `gvec3b -> gvec2b`           | Returns a vector using the `[0, 2]` elements                                                              |
| `zx`      | `gvec3b -> gvec2b`           | Returns a vector using the `[2, 0]` elements                                                              |
| `yz`      | `gvec3b -> gvec2b`           | Returns a vector using the `[1, 2]` elements                                                              |
| `zy`      | `gvec3b -> gvec2b`           | Returns a vector using the `[2, 1]` elements                                                              |
| `ij`      | `gvec3b -> gvec2b`           | Returns a vector using the `[0, 1]` elements                                                              |
| `ji`      | `gvec3b -> gvec2b`           | Returns a vector using the `[1, 0]` elements                                                              |
| `ik`      | `gvec3b -> gvec2b`           | Returns a vector using the `[0, 2]` elements                                                              |
| `ki`      | `gvec3b -> gvec2b`           | Returns a vector using the `[2, 0]` elements                                                              |
| `jk`      | `gvec3b -> gvec2b`           | Returns a vector using the `[1, 2]` elements                                                              |
| `kj`      | `gvec3b -> gvec2b`           | Returns a vector using the `[2, 1]` elements                                                              |
| `rg`      | `gvec3b -> gvec2b`           | Returns a vector using the `[0, 1]` elements                                                              |
| `gr`      | `gvec3b -> gvec2b`           | Returns a vector using the `[1, 0]` elements                                                              |
| `rb`      | `gvec3b -> gvec2b`           | Returns a vector using the `[0, 2]` elements                                                              |
| `br`      | `gvec3b -> gvec2b`           | Returns a vector using the `[2, 0]` elements                                                              |
| `gb`      | `gvec3b -> gvec2b`           | Returns a vector using the `[1, 2]` elements                                                              |
| `bg`      | `gvec3b -> gvec2b`           | Returns a vector using the `[2, 1]` elements                                                              |
| `gvec33b` | `(gvec3b, string) -> gvec2b` | Manually construct a method intended to reorder the vector. You probably won't use this directly          |
| `xyz`     | `gvec3b -> gvec3b`           | Returns the original 3-element vector                                                                     |
| `xzy`     | `gvec3b -> gvec3b`           | Returns a vector using `[0, 2, 1]` ordering                                                               |
| `yxz`     | `gvec3b -> gvec3b`           | Returns a vector using `[1, 0, 2]` ordering                                                               |
| `yzx`     | `gvec3b -> gvec3b`           | Returns a vector using `[1, 2, 0]` ordering                                                               |
| `zxy`     | `gvec3b -> gvec3b`           | Returns a vector using `[2, 0, 1]` ordering                                                               |
| `zyx`     | `gvec3b -> gvec3b`           | Returns a vector using `[2, 1, 0]` ordering                                                               |
| `ijk`     | `gvec3b -> gvec3b`           | Returns the original 3-element vector                                                                     |
| `ikj`     | `gvec3b -> gvec3b`           | Returns a vector using `[0, 2, 1]` ordering                                                               |
| `jik`     | `gvec3b -> gvec3b`           | Returns a vector using `[1, 0, 2]` ordering                                                               |
| `jki`     | `gvec3b -> gvec3b`           | Returns a vector using `[1, 2, 0]` ordering                                                               |
| `kij`     | `gvec3b -> gvec3b`           | Returns a vector using `[2, 0, 1]` ordering                                                               |
| `kji`     | `gvec3b -> gvec3b`           | Returns a vector using `[2, 1, 0]` ordering                                                               |
| `rgb`     | `gvec3b -> gvec3b`           | Returns the original 3-element vector                                                                     |
| `rbg`     | `gvec3b -> gvec3b`           | Returns a vector using `[0, 2, 1]` ordering                                                               |
| `grb`     | `gvec3b -> gvec3b`           | Returns a vector using `[1, 0, 2]` ordering                                                               |
| `gbr`     | `gvec3b -> gvec3b`           | Returns a vector using `[1, 2, 0]` ordering                                                               |
| `brg`     | `gvec3b -> gvec3b`           | Returns a vector using `[2, 0, 1]` ordering                                                               |
| `bgr`     | `gvec3b -> gvec3b`           | Returns a vector using `[2, 1, 0]` ordering                                                               |
| `x`       | `gvec4u -> gu32`             | Accesses value 0 from the 4-element vector                                                                |
| `y`       | `gvec4u -> gu32`             | Accesses value 1 from the 4-element vector                                                                |
| `z`       | `gvec4u -> gu32`             | Accesses value 2 from the 4-element vector                                                                |
| `w`       | `gvec4u -> gu32`             | Accesses value 3 from the 4-element vector                                                                |
| `i`       | `gvec4u -> gu32`             | Accesses value 0 from the 4-element vector                                                                |
| `j`       | `gvec4u -> gu32`             | Accesses value 1 from the 4-element vector                                                                |
| `k`       | `gvec4u -> gu32`             | Accesses value 2 from the 4-element vector                                                                |
| `l`       | `gvec4u -> gu32`             | Accesses value 3 from the 4-element vector                                                                |
| `r`       | `gvec4u -> gu32`             | Accesses value 0 from the 4-element vector                                                                |
| `g`       | `gvec4u -> gu32`             | Accesses value 1 from the 4-element vector                                                                |
| `b`       | `gvec4u -> gu32`             | Accesses value 2 from the 4-element vector                                                                |
| `a`       | `gvec4u -> gu32`             | Accesses value 3 from the 4-element vector                                                                |
| `gvec42u` | `(gvec4u, string) -> gvec2u` | Manually constructs a method intended to extract a 2-element vector. You probably won't use this directly |
| `xy`      | `gvec4u -> gvec2u`           | Returns a vector using the `[0, 1]` elements                                                              |
| `yx`      | `gvec4u -> gvec2u`           | Returns a vector using the `[1, 0]` elements                                                              |
| `xz`      | `gvec4u -> gvec2u`           | Returns a vector using the `[0, 2]` elements                                                              |
| `zx`      | `gvec4u -> gvec2u`           | Returns a vector using the `[2, 0]` elements                                                              |
| `xw`      | `gvec4u -> gvec2u`           | Returns a vector using the `[0, 3]` elements                                                              |
| `wx`      | `gvec4u -> gvec2u`           | Returns a vector using the `[3, 0]` elements                                                              |
| `yz`      | `gvec4u -> gvec2u`           | Returns a vector using the `[1, 2]` elements                                                              |
| `zy`      | `gvec4u -> gvec2u`           | Returns a vector using the `[2, 1]` elements                                                              |
| `yw`      | `gvec4u -> gvec2u`           | Returns a vector using the `[1, 3]` elements                                                              |
| `wy`      | `gvec4u -> gvec2u`           | Returns a vector using the `[3, 1]` elements                                                              |
| `zw`      | `gvec4u -> gvec2u`           | Returns a vector using the `[2, 3]` elements                                                              |
| `wz`      | `gvec4u -> gvec2u`           | Returns a vector using the `[3, 2]` elements                                                              |
| `ij`      | `gvec4u -> gvec2u`           | Returns a vector using the `[0, 1]` elements                                                              |
| `ji`      | `gvec4u -> gvec2u`           | Returns a vector using the `[1, 0]` elements                                                              |
| `ik`      | `gvec4u -> gvec2u`           | Returns a vector using the `[0, 2]` elements                                                              |
| `ki`      | `gvec4u -> gvec2u`           | Returns a vector using the `[2, 0]` elements                                                              |
| `il`      | `gvec4u -> gvec2u`           | Returns a vector using the `[0, 3]` elements                                                              |
| `li`      | `gvec4u -> gvec2u`           | Returns a vector using the `[3, 0]` elements                                                              |
| `jk`      | `gvec4u -> gvec2u`           | Returns a vector using the `[1, 2]` elements                                                              |
| `kj`      | `gvec4u -> gvec2u`           | Returns a vector using the `[2, 1]` elements                                                              |
| `jl`      | `gvec4u -> gvec2u`           | Returns a vector using the `[1, 3]` elements                                                              |
| `lj`      | `gvec4u -> gvec2u`           | Returns a vector using the `[3, 1]` elements                                                              |
| `kl`      | `gvec4u -> gvec2u`           | Returns a vector using the `[2, 3]` elements                                                              |
| `lk`      | `gvec4u -> gvec2u`           | Returns a vector using the `[3, 2]` elements                                                              |
| `rg`      | `gvec4u -> gvec2u`           | Returns a vector using the `[0, 1]` elements                                                              |
| `gr`      | `gvec4u -> gvec2u`           | Returns a vector using the `[1, 0]` elements                                                              |
| `rb`      | `gvec4u -> gvec2u`           | Returns a vector using the `[0, 2]` elements                                                              |
| `br`      | `gvec4u -> gvec2u`           | Returns a vector using the `[2, 0]` elements                                                              |
| `ra`      | `gvec4u -> gvec2u`           | Returns a vector using the `[0, 3]` elements                                                              |
| `ar`      | `gvec4u -> gvec2u`           | Returns a vector using the `[3, 0]` elements                                                              |
| `gb`      | `gvec4u -> gvec2u`           | Returns a vector using the `[1, 2]` elements                                                              |
| `bg`      | `gvec4u -> gvec2u`           | Returns a vector using the `[2, 1]` elements                                                              |
| `ga`      | `gvec4u -> gvec2u`           | Returns a vector using the `[1, 3]` elements                                                              |
| `ag`      | `gvec4u -> gvec2u`           | Returns a vector using the `[3, 1]` elements                                                              |
| `ba`      | `gvec4u -> gvec2u`           | Returns a vector using the `[2, 3]` elements                                                              |
| `ab`      | `gvec4u -> gvec2u`           | Returns a vector using the `[3, 2]` elements                                                              |
| `gvec43u` | `(gvec4u, string) -> gvec3u` | Manually constructs a method intended to extract a 3-element vector. You probably won't use this directly |
| `xyz`     | `gvec4u -> gvec3u`           | Returns a vector using the `[0, 1, 2]` elements                                                           |
| `xyw`     | `gvec4u -> gvec3u`           | Returns a vector using the `[0, 1, 3]` elements                                                           |
| `xzy`     | `gvec4u -> gvec3u`           | Returns a vector using the `[0, 2, 1]` elements                                                           |
| `xzw`     | `gvec4u -> gvec3u`           | Returns a vector using the `[0, 2, 3]` elements                                                           |
| `xwy`     | `gvec4u -> gvec3u`           | Returns a vector using the `[0, 3, 1]` elements                                                           |
| `xwz`     | `gvec4u -> gvec3u`           | Returns a vector using the `[0, 3, 2]` elements                                                           |
| `yxz`     | `gvec4u -> gvec3u`           | Returns a vector using the `[1, 0, 2]` elements                                                           |
| `yxw`     | `gvec4u -> gvec3u`           | Returns a vector using the `[1, 0, 3]` elements                                                           |
| `yzx`     | `gvec4u -> gvec3u`           | Returns a vector using the `[1, 2, 0]` elements                                                           |
| `yzw`     | `gvec4u -> gvec3u`           | Returns a vector using the `[1, 2, 3]` elements                                                           |
| `ywx`     | `gvec4u -> gvec3u`           | Returns a vector using the `[1, 3, 0]` elements                                                           |
| `ywz`     | `gvec4u -> gvec3u`           | Returns a vector using the `[1, 3, 2]` elements                                                           |
| `zxy`     | `gvec4u -> gvec3u`           | Returns a vector using the `[2, 0, 1]` elements                                                           |
| `zxw`     | `gvec4u -> gvec3u`           | Returns a vector using the `[2, 0, 3]` elements                                                           |
| `zyx`     | `gvec4u -> gvec3u`           | Returns a vector using the `[2, 1, 0]` elements                                                           |
| `zyw`     | `gvec4u -> gvec3u`           | Returns a vector using the `[2, 1, 3]` elements                                                           |
| `zwx`     | `gvec4u -> gvec3u`           | Returns a vector using the `[2, 3, 0]` elements                                                           |
| `zwy`     | `gvec4u -> gvec3u`           | Returns a vector using the `[2, 3, 1]` elements                                                           |
| `wxy`     | `gvec4u -> gvec3u`           | Returns a vector using the `[3, 0, 1]` elements                                                           |
| `wxz`     | `gvec4u -> gvec3u`           | Returns a vector using the `[3, 0, 2]` elements                                                           |
| `wyx`     | `gvec4u -> gvec3u`           | Returns a vector using the `[3, 1, 0]` elements                                                           |
| `wyz`     | `gvec4u -> gvec3u`           | Returns a vector using the `[3, 1, 2]` elements                                                           |
| `wzx`     | `gvec4u -> gvec3u`           | Returns a vector using the `[3, 2, 0]` elements                                                           |
| `wzy`     | `gvec4u -> gvec3u`           | Returns a vector using the `[3, 2, 1]` elements                                                           |
| `ijk`     | `gvec4u -> gvec3u`           | Returns a vector using the `[0, 1, 2]` elements                                                           |
| `ijl`     | `gvec4u -> gvec3u`           | Returns a vector using the `[0, 1, 3]` elements                                                           |
| `ikj`     | `gvec4u -> gvec3u`           | Returns a vector using the `[0, 2, 1]` elements                                                           |
| `ikl`     | `gvec4u -> gvec3u`           | Returns a vector using the `[0, 2, 3]` elements                                                           |
| `ilj`     | `gvec4u -> gvec3u`           | Returns a vector using the `[0, 3, 1]` elements                                                           |
| `ilk`     | `gvec4u -> gvec3u`           | Returns a vector using the `[0, 3, 2]` elements                                                           |
| `jik`     | `gvec4u -> gvec3u`           | Returns a vector using the `[1, 0, 2]` elements                                                           |
| `jil`     | `gvec4u -> gvec3u`           | Returns a vector using the `[1, 0, 3]` elements                                                           |
| `jki`     | `gvec4u -> gvec3u`           | Returns a vector using the `[1, 2, 0]` elements                                                           |
| `jkl`     | `gvec4u -> gvec3u`           | Returns a vector using the `[1, 2, 3]` elements                                                           |
| `jli`     | `gvec4u -> gvec3u`           | Returns a vector using the `[1, 3, 0]` elements                                                           |
| `jlk`     | `gvec4u -> gvec3u`           | Returns a vector using the `[1, 3, 2]` elements                                                           |
| `kij`     | `gvec4u -> gvec3u`           | Returns a vector using the `[2, 0, 1]` elements                                                           |
| `kil`     | `gvec4u -> gvec3u`           | Returns a vector using the `[2, 0, 3]` elements                                                           |
| `kji`     | `gvec4u -> gvec3u`           | Returns a vector using the `[2, 1, 0]` elements                                                           |
| `kjl`     | `gvec4u -> gvec3u`           | Returns a vector using the `[2, 1, 3]` elements                                                           |
| `kli`     | `gvec4u -> gvec3u`           | Returns a vector using the `[2, 3, 0]` elements                                                           |
| `klj`     | `gvec4u -> gvec3u`           | Returns a vector using the `[2, 3, 1]` elements                                                           |
| `lij`     | `gvec4u -> gvec3u`           | Returns a vector using the `[3, 0, 1]` elements                                                           |
| `lik`     | `gvec4u -> gvec3u`           | Returns a vector using the `[3, 0, 2]` elements                                                           |
| `lji`     | `gvec4u -> gvec3u`           | Returns a vector using the `[3, 1, 0]` elements                                                           |
| `ljk`     | `gvec4u -> gvec3u`           | Returns a vector using the `[3, 1, 2]` elements                                                           |
| `lki`     | `gvec4u -> gvec3u`           | Returns a vector using the `[3, 2, 0]` elements                                                           |
| `lkj`     | `gvec4u -> gvec3u`           | Returns a vector using the `[3, 2, 1]` elements                                                           |
| `rgb`     | `gvec4u -> gvec3u`           | Returns a vector using the `[0, 1, 2]` elements                                                           |
| `rga`     | `gvec4u -> gvec3u`           | Returns a vector using the `[0, 1, 3]` elements                                                           |
| `rbg`     | `gvec4u -> gvec3u`           | Returns a vector using the `[0, 2, 1]` elements                                                           |
| `rba`     | `gvec4u -> gvec3u`           | Returns a vector using the `[0, 2, 3]` elements                                                           |
| `rag`     | `gvec4u -> gvec3u`           | Returns a vector using the `[0, 3, 1]` elements                                                           |
| `rab`     | `gvec4u -> gvec3u`           | Returns a vector using the `[0, 3, 2]` elements                                                           |
| `grb`     | `gvec4u -> gvec3u`           | Returns a vector using the `[1, 0, 2]` elements                                                           |
| `gra`     | `gvec4u -> gvec3u`           | Returns a vector using the `[1, 0, 3]` elements                                                           |
| `gbr`     | `gvec4u -> gvec3u`           | Returns a vector using the `[1, 2, 0]` elements                                                           |
| `gba`     | `gvec4u -> gvec3u`           | Returns a vector using the `[1, 2, 3]` elements                                                           |
| `gar`     | `gvec4u -> gvec3u`           | Returns a vector using the `[1, 3, 0]` elements                                                           |
| `gab`     | `gvec4u -> gvec3u`           | Returns a vector using the `[1, 3, 2]` elements                                                           |
| `brg`     | `gvec4u -> gvec3u`           | Returns a vector using the `[2, 0, 1]` elements                                                           |
| `bra`     | `gvec4u -> gvec3u`           | Returns a vector using the `[2, 0, 3]` elements                                                           |
| `bgr`     | `gvec4u -> gvec3u`           | Returns a vector using the `[2, 1, 0]` elements                                                           |
| `bgr`     | `gvec4u -> gvec3u`           | Returns a vector using the `[2, 1, 3]` elements                                                           |
| `bar`     | `gvec4u -> gvec3u`           | Returns a vector using the `[2, 3, 0]` elements                                                           |
| `bag`     | `gvec4u -> gvec3u`           | Returns a vector using the `[2, 3, 1]` elements                                                           |
| `arg`     | `gvec4u -> gvec3u`           | Returns a vector using the `[3, 0, 1]` elements                                                           |
| `arb`     | `gvec4u -> gvec3u`           | Returns a vector using the `[3, 0, 2]` elements                                                           |
| `agr`     | `gvec4u -> gvec3u`           | Returns a vector using the `[3, 1, 0]` elements                                                           |
| `agb`     | `gvec4u -> gvec3u`           | Returns a vector using the `[3, 1, 2]` elements                                                           |
| `abr`     | `gvec4u -> gvec3u`           | Returns a vector using the `[3, 2, 0]` elements                                                           |
| `abg`     | `gvec4u -> gvec3u`           | Returns a vector using the `[3, 2, 1]` elements                                                           |
| `gvec44u` | `(gvec4u, string) -> gvec4u` | Manually constructs a method intended to extract a 4-element vector. You probably won't use this directly |
| `xyzw`    | `gvec4u -> gvec4u`           | Returns the original 4-element vector                                                                     |
| `xywz`    | `gvec4u -> gvec4u`           | Returns a vector using `[0, 1, 3, 2]` ordering                                                            |
| `xzyw`    | `gvec4u -> gvec4u`           | Returns a vector using `[0, 2, 1, 3]` ordering                                                            |
| `xzwy`    | `gvec4u -> gvec4u`           | Returns a vector using `[0, 2, 3, 1]` ordering                                                            |
| `xwyz`    | `gvec4u -> gvec4u`           | Returns a vector using `[0, 3, 1, 2]` ordering                                                            |
| `xwzy`    | `gvec4u -> gvec4u`           | Returns a vector using `[0, 3, 2, 1]` ordering                                                            |
| `yxzw`    | `gvec4u -> gvec4u`           | Returns a vector using `[1, 0, 2, 3]` ordering                                                            |
| `yxwz`    | `gvec4u -> gvec4u`           | Returns a vector using `[1, 0, 3, 2]` ordering                                                            |
| `yzxw`    | `gvec4u -> gvec4u`           | Returns a vector using `[1, 2, 0, 3]` ordering                                                            |
| `yzwx`    | `gvec4u -> gvec4u`           | Returns a vector using `[1, 2, 3, 0]` ordering                                                            |
| `ywxz`    | `gvec4u -> gvec4u`           | Returns a vector using `[1, 3, 0, 2]` ordering                                                            |
| `ywzx`    | `gvec4u -> gvec4u`           | Returns a vector using `[1, 3, 2, 0]` ordering                                                            |
| `zxyw`    | `gvec4u -> gvec4u`           | Returns a vector using `[2, 0, 1, 3]` ordering                                                            |
| `zxwy`    | `gvec4u -> gvec4u`           | Returns a vector using `[2, 0, 3, 1]` ordering                                                            |
| `zyxw`    | `gvec4u -> gvec4u`           | Returns a vector using `[2, 1, 0, 3]` ordering                                                            |
| `zywx`    | `gvec4u -> gvec4u`           | Returns a vector using `[2, 1, 3, 0]` ordering                                                            |
| `zwxy`    | `gvec4u -> gvec4u`           | Returns a vector using `[2, 3, 0, 1]` ordering                                                            |
| `zwyx`    | `gvec4u -> gvec4u`           | Returns a vector using `[2, 3, 1, 0]` ordering                                                            |
| `wxyz`    | `gvec4u -> gvec4u`           | Returns a vector using `[3, 0, 1, 2]` ordering                                                            |
| `wxzy`    | `gvec4u -> gvec4u`           | Returns a vector using `[3, 0, 2, 1]` ordering                                                            |
| `wyxz`    | `gvec4u -> gvec4u`           | Returns a vector using `[3, 1, 0, 2]` ordering                                                            |
| `wyzx`    | `gvec4u -> gvec4u`           | Returns a vector using `[3, 1, 2, 0]` ordering                                                            |
| `wzxy`    | `gvec4u -> gvec4u`           | Returns a vector using `[3, 2, 0, 1]` ordering                                                            |
| `wzyx`    | `gvec4u -> gvec4u`           | Returns a vector using `[3, 2, 1, 0]` ordering                                                            |
| `ijkl`    | `gvec4u -> gvec4u`           | Returns the original 4-element vector                                                                     |
| `ijlk`    | `gvec4u -> gvec4u`           | Returns a vector using `[0, 1, 3, 2]` ordering                                                            |
| `ikjl`    | `gvec4u -> gvec4u`           | Returns a vector using `[0, 2, 1, 3]` ordering                                                            |
| `iklj`    | `gvec4u -> gvec4u`           | Returns a vector using `[0, 2, 3, 1]` ordering                                                            |
| `iljk`    | `gvec4u -> gvec4u`           | Returns a vector using `[0, 3, 1, 2]` ordering                                                            |
| `ilkj`    | `gvec4u -> gvec4u`           | Returns a vector using `[0, 3, 2, 1]` ordering                                                            |
| `jikl`    | `gvec4u -> gvec4u`           | Returns a vector using `[1, 0, 2, 3]` ordering                                                            |
| `jilk`    | `gvec4u -> gvec4u`           | Returns a vector using `[1, 0, 3, 2]` ordering                                                            |
| `jkil`    | `gvec4u -> gvec4u`           | Returns a vector using `[1, 2, 0, 3]` ordering                                                            |
| `jkli`    | `gvec4u -> gvec4u`           | Returns a vector using `[1, 2, 3, 0]` ordering                                                            |
| `jlik`    | `gvec4u -> gvec4u`           | Returns a vector using `[1, 3, 0, 2]` ordering                                                            |
| `jlki`    | `gvec4u -> gvec4u`           | Returns a vector using `[1, 3, 2, 0]` ordering                                                            |
| `kijl`    | `gvec4u -> gvec4u`           | Returns a vector using `[2, 0, 1, 3]` ordering                                                            |
| `kilj`    | `gvec4u -> gvec4u`           | Returns a vector using `[2, 0, 3, 1]` ordering                                                            |
| `kjil`    | `gvec4u -> gvec4u`           | Returns a vector using `[2, 1, 0, 3]` ordering                                                            |
| `kjli`    | `gvec4u -> gvec4u`           | Returns a vector using `[2, 1, 3, 0]` ordering                                                            |
| `klij`    | `gvec4u -> gvec4u`           | Returns a vector using `[2, 3, 0, 1]` ordering                                                            |
| `klji`    | `gvec4u -> gvec4u`           | Returns a vector using `[2, 3, 1, 0]` ordering                                                            |
| `lijk`    | `gvec4u -> gvec4u`           | Returns a vector using `[3, 0, 1, 2]` ordering                                                            |
| `likj`    | `gvec4u -> gvec4u`           | Returns a vector using `[3, 0, 2, 1]` ordering                                                            |
| `ljik`    | `gvec4u -> gvec4u`           | Returns a vector using `[3, 1, 0, 2]` ordering                                                            |
| `ljki`    | `gvec4u -> gvec4u`           | Returns a vector using `[3, 1, 2, 0]` ordering                                                            |
| `lkij`    | `gvec4u -> gvec4u`           | Returns a vector using `[3, 2, 0, 1]` ordering                                                            |
| `lkji`    | `gvec4u -> gvec4u`           | Returns a vector using `[3, 2, 1, 0]` ordering                                                            |
| `rgba`    | `gvec4u -> gvec4u`           | Returns the original 4-element vector                                                                     |
| `rgab`    | `gvec4u -> gvec4u`           | Returns a vector using `[0, 1, 3, 2]` ordering                                                            |
| `rbga`    | `gvec4u -> gvec4u`           | Returns a vector using `[0, 2, 1, 3]` ordering                                                            |
| `rbag`    | `gvec4u -> gvec4u`           | Returns a vector using `[0, 2, 3, 1]` ordering                                                            |
| `ragb`    | `gvec4u -> gvec4u`           | Returns a vector using `[0, 3, 1, 2]` ordering                                                            |
| `rabg`    | `gvec4u -> gvec4u`           | Returns a vector using `[0, 3, 2, 1]` ordering                                                            |
| `grba`    | `gvec4u -> gvec4u`           | Returns a vector using `[1, 0, 2, 3]` ordering                                                            |
| `grab`    | `gvec4u -> gvec4u`           | Returns a vector using `[1, 0, 3, 2]` ordering                                                            |
| `gbra`    | `gvec4u -> gvec4u`           | Returns a vector using `[1, 2, 0, 3]` ordering                                                            |
| `gbar`    | `gvec4u -> gvec4u`           | Returns a vector using `[1, 2, 3, 0]` ordering                                                            |
| `garb`    | `gvec4u -> gvec4u`           | Returns a vector using `[1, 3, 0, 2]` ordering                                                            |
| `gabr`    | `gvec4u -> gvec4u`           | Returns a vector using `[1, 3, 2, 0]` ordering                                                            |
| `brga`    | `gvec4u -> gvec4u`           | Returns a vector using `[2, 0, 1, 3]` ordering                                                            |
| `brag`    | `gvec4u -> gvec4u`           | Returns a vector using `[2, 0, 3, 1]` ordering                                                            |
| `bgra`    | `gvec4u -> gvec4u`           | Returns a vector using `[2, 1, 0, 3]` ordering                                                            |
| `bgar`    | `gvec4u -> gvec4u`           | Returns a vector using `[2, 1, 3, 0]` ordering                                                            |
| `barg`    | `gvec4u -> gvec4u`           | Returns a vector using `[2, 3, 0, 1]` ordering                                                            |
| `bagr`    | `gvec4u -> gvec4u`           | Returns a vector using `[2, 3, 1, 0]` ordering                                                            |
| `argb`    | `gvec4u -> gvec4u`           | Returns a vector using `[3, 0, 1, 2]` ordering                                                            |
| `arbg`    | `gvec4u -> gvec4u`           | Returns a vector using `[3, 0, 2, 1]` ordering                                                            |
| `agrb`    | `gvec4u -> gvec4u`           | Returns a vector using `[3, 1, 0, 2]` ordering                                                            |
| `agbr`    | `gvec4u -> gvec4u`           | Returns a vector using `[3, 1, 2, 0]` ordering                                                            |
| `abrg`    | `gvec4u -> gvec4u`           | Returns a vector using `[3, 2, 0, 1]` ordering                                                            |
| `abgr`    | `gvec4u -> gvec4u`           | Returns a vector using `[3, 2, 1, 0]` ordering                                                            |
| `x`       | `gvec4i -> gi32`             | Accesses value 0 from the 4-element vector                                                                |
| `y`       | `gvec4i -> gi32`             | Accesses value 1 from the 4-element vector                                                                |
| `z`       | `gvec4i -> gi32`             | Accesses value 2 from the 4-element vector                                                                |
| `w`       | `gvec4i -> gi32`             | Accesses value 3 from the 4-element vector                                                                |
| `i`       | `gvec4i -> gi32`             | Accesses value 0 from the 4-element vector                                                                |
| `j`       | `gvec4i -> gi32`             | Accesses value 1 from the 4-element vector                                                                |
| `k`       | `gvec4i -> gi32`             | Accesses value 2 from the 4-element vector                                                                |
| `l`       | `gvec4i -> gi32`             | Accesses value 3 from the 4-element vector                                                                |
| `r`       | `gvec4i -> gi32`             | Accesses value 0 from the 4-element vector                                                                |
| `g`       | `gvec4i -> gi32`             | Accesses value 1 from the 4-element vector                                                                |
| `b`       | `gvec4i -> gi32`             | Accesses value 2 from the 4-element vector                                                                |
| `a`       | `gvec4i -> gi32`             | Accesses value 3 from the 4-element vector                                                                |
| `gvec42i` | `(gvec4i, string) -> gvec2i` | Manually constructs a method intended to extract a 2-element vector. You probably won't use this directly |
| `xy`      | `gvec4i -> gvec2i`           | Returns a vector using the `[0, 1]` elements                                                              |
| `yx`      | `gvec4i -> gvec2i`           | Returns a vector using the `[1, 0]` elements                                                              |
| `xz`      | `gvec4i -> gvec2i`           | Returns a vector using the `[0, 2]` elements                                                              |
| `zx`      | `gvec4i -> gvec2i`           | Returns a vector using the `[2, 0]` elements                                                              |
| `xw`      | `gvec4i -> gvec2i`           | Returns a vector using the `[0, 3]` elements                                                              |
| `wx`      | `gvec4i -> gvec2i`           | Returns a vector using the `[3, 0]` elements                                                              |
| `yz`      | `gvec4i -> gvec2i`           | Returns a vector using the `[1, 2]` elements                                                              |
| `zy`      | `gvec4i -> gvec2i`           | Returns a vector using the `[2, 1]` elements                                                              |
| `yw`      | `gvec4i -> gvec2i`           | Returns a vector using the `[1, 3]` elements                                                              |
| `wy`      | `gvec4i -> gvec2i`           | Returns a vector using the `[3, 1]` elements                                                              |
| `zw`      | `gvec4i -> gvec2i`           | Returns a vector using the `[2, 3]` elements                                                              |
| `wz`      | `gvec4i -> gvec2i`           | Returns a vector using the `[3, 2]` elements                                                              |
| `ij`      | `gvec4i -> gvec2i`           | Returns a vector using the `[0, 1]` elements                                                              |
| `ji`      | `gvec4i -> gvec2i`           | Returns a vector using the `[1, 0]` elements                                                              |
| `ik`      | `gvec4i -> gvec2i`           | Returns a vector using the `[0, 2]` elements                                                              |
| `ki`      | `gvec4i -> gvec2i`           | Returns a vector using the `[2, 0]` elements                                                              |
| `il`      | `gvec4i -> gvec2i`           | Returns a vector using the `[0, 3]` elements                                                              |
| `li`      | `gvec4i -> gvec2i`           | Returns a vector using the `[3, 0]` elements                                                              |
| `jk`      | `gvec4i -> gvec2i`           | Returns a vector using the `[1, 2]` elements                                                              |
| `kj`      | `gvec4i -> gvec2i`           | Returns a vector using the `[2, 1]` elements                                                              |
| `jl`      | `gvec4i -> gvec2i`           | Returns a vector using the `[1, 3]` elements                                                              |
| `lj`      | `gvec4i -> gvec2i`           | Returns a vector using the `[3, 1]` elements                                                              |
| `kl`      | `gvec4i -> gvec2i`           | Returns a vector using the `[2, 3]` elements                                                              |
| `lk`      | `gvec4i -> gvec2i`           | Returns a vector using the `[3, 2]` elements                                                              |
| `rg`      | `gvec4i -> gvec2i`           | Returns a vector using the `[0, 1]` elements                                                              |
| `gr`      | `gvec4i -> gvec2i`           | Returns a vector using the `[1, 0]` elements                                                              |
| `rb`      | `gvec4i -> gvec2i`           | Returns a vector using the `[0, 2]` elements                                                              |
| `br`      | `gvec4i -> gvec2i`           | Returns a vector using the `[2, 0]` elements                                                              |
| `ra`      | `gvec4i -> gvec2i`           | Returns a vector using the `[0, 3]` elements                                                              |
| `ar`      | `gvec4i -> gvec2i`           | Returns a vector using the `[3, 0]` elements                                                              |
| `gb`      | `gvec4i -> gvec2i`           | Returns a vector using the `[1, 2]` elements                                                              |
| `bg`      | `gvec4i -> gvec2i`           | Returns a vector using the `[2, 1]` elements                                                              |
| `ga`      | `gvec4i -> gvec2i`           | Returns a vector using the `[1, 3]` elements                                                              |
| `ag`      | `gvec4i -> gvec2i`           | Returns a vector using the `[3, 1]` elements                                                              |
| `ba`      | `gvec4i -> gvec2i`           | Returns a vector using the `[2, 3]` elements                                                              |
| `ab`      | `gvec4i -> gvec2i`           | Returns a vector using the `[3, 2]` elements                                                              |
| `gvec43i` | `(gvec4i, string) -> gvec3i` | Manually constructs a method intended to extract a 3-element vector. You probably won't use this directly |
| `xyz`     | `gvec4i -> gvec3i`           | Returns a vector using the `[0, 1, 2]` elements                                                           |
| `xyw`     | `gvec4i -> gvec3i`           | Returns a vector using the `[0, 1, 3]` elements                                                           |
| `xzy`     | `gvec4i -> gvec3i`           | Returns a vector using the `[0, 2, 1]` elements                                                           |
| `xzw`     | `gvec4i -> gvec3i`           | Returns a vector using the `[0, 2, 3]` elements                                                           |
| `xwy`     | `gvec4i -> gvec3i`           | Returns a vector using the `[0, 3, 1]` elements                                                           |
| `xwz`     | `gvec4i -> gvec3i`           | Returns a vector using the `[0, 3, 2]` elements                                                           |
| `yxz`     | `gvec4i -> gvec3i`           | Returns a vector using the `[1, 0, 2]` elements                                                           |
| `yxw`     | `gvec4i -> gvec3i`           | Returns a vector using the `[1, 0, 3]` elements                                                           |
| `yzx`     | `gvec4i -> gvec3i`           | Returns a vector using the `[1, 2, 0]` elements                                                           |
| `yzw`     | `gvec4i -> gvec3i`           | Returns a vector using the `[1, 2, 3]` elements                                                           |
| `ywx`     | `gvec4i -> gvec3i`           | Returns a vector using the `[1, 3, 0]` elements                                                           |
| `ywz`     | `gvec4i -> gvec3i`           | Returns a vector using the `[1, 3, 2]` elements                                                           |
| `zxy`     | `gvec4i -> gvec3i`           | Returns a vector using the `[2, 0, 1]` elements                                                           |
| `zxw`     | `gvec4i -> gvec3i`           | Returns a vector using the `[2, 0, 3]` elements                                                           |
| `zyx`     | `gvec4i -> gvec3i`           | Returns a vector using the `[2, 1, 0]` elements                                                           |
| `zyw`     | `gvec4i -> gvec3i`           | Returns a vector using the `[2, 1, 3]` elements                                                           |
| `zwx`     | `gvec4i -> gvec3i`           | Returns a vector using the `[2, 3, 0]` elements                                                           |
| `zwy`     | `gvec4i -> gvec3i`           | Returns a vector using the `[2, 3, 1]` elements                                                           |
| `wxy`     | `gvec4i -> gvec3i`           | Returns a vector using the `[3, 0, 1]` elements                                                           |
| `wxz`     | `gvec4i -> gvec3i`           | Returns a vector using the `[3, 0, 2]` elements                                                           |
| `wyx`     | `gvec4i -> gvec3i`           | Returns a vector using the `[3, 1, 0]` elements                                                           |
| `wyz`     | `gvec4i -> gvec3i`           | Returns a vector using the `[3, 1, 2]` elements                                                           |
| `wzx`     | `gvec4i -> gvec3i`           | Returns a vector using the `[3, 2, 0]` elements                                                           |
| `wzy`     | `gvec4i -> gvec3i`           | Returns a vector using the `[3, 2, 1]` elements                                                           |
| `ijk`     | `gvec4i -> gvec3i`           | Returns a vector using the `[0, 1, 2]` elements                                                           |
| `ijl`     | `gvec4i -> gvec3i`           | Returns a vector using the `[0, 1, 3]` elements                                                           |
| `ikj`     | `gvec4i -> gvec3i`           | Returns a vector using the `[0, 2, 1]` elements                                                           |
| `ikl`     | `gvec4i -> gvec3i`           | Returns a vector using the `[0, 2, 3]` elements                                                           |
| `ilj`     | `gvec4i -> gvec3i`           | Returns a vector using the `[0, 3, 1]` elements                                                           |
| `ilk`     | `gvec4i -> gvec3i`           | Returns a vector using the `[0, 3, 2]` elements                                                           |
| `jik`     | `gvec4i -> gvec3i`           | Returns a vector using the `[1, 0, 2]` elements                                                           |
| `jil`     | `gvec4i -> gvec3i`           | Returns a vector using the `[1, 0, 3]` elements                                                           |
| `jki`     | `gvec4i -> gvec3i`           | Returns a vector using the `[1, 2, 0]` elements                                                           |
| `jkl`     | `gvec4i -> gvec3i`           | Returns a vector using the `[1, 2, 3]` elements                                                           |
| `jli`     | `gvec4i -> gvec3i`           | Returns a vector using the `[1, 3, 0]` elements                                                           |
| `jlk`     | `gvec4i -> gvec3i`           | Returns a vector using the `[1, 3, 2]` elements                                                           |
| `kij`     | `gvec4i -> gvec3i`           | Returns a vector using the `[2, 0, 1]` elements                                                           |
| `kil`     | `gvec4i -> gvec3i`           | Returns a vector using the `[2, 0, 3]` elements                                                           |
| `kji`     | `gvec4i -> gvec3i`           | Returns a vector using the `[2, 1, 0]` elements                                                           |
| `kjl`     | `gvec4i -> gvec3i`           | Returns a vector using the `[2, 1, 3]` elements                                                           |
| `kli`     | `gvec4i -> gvec3i`           | Returns a vector using the `[2, 3, 0]` elements                                                           |
| `klj`     | `gvec4i -> gvec3i`           | Returns a vector using the `[2, 3, 1]` elements                                                           |
| `lij`     | `gvec4i -> gvec3i`           | Returns a vector using the `[3, 0, 1]` elements                                                           |
| `lik`     | `gvec4i -> gvec3i`           | Returns a vector using the `[3, 0, 2]` elements                                                           |
| `lji`     | `gvec4i -> gvec3i`           | Returns a vector using the `[3, 1, 0]` elements                                                           |
| `ljk`     | `gvec4i -> gvec3i`           | Returns a vector using the `[3, 1, 2]` elements                                                           |
| `lki`     | `gvec4i -> gvec3i`           | Returns a vector using the `[3, 2, 0]` elements                                                           |
| `lkj`     | `gvec4i -> gvec3i`           | Returns a vector using the `[3, 2, 1]` elements                                                           |
| `rgb`     | `gvec4i -> gvec3i`           | Returns a vector using the `[0, 1, 2]` elements                                                           |
| `rga`     | `gvec4i -> gvec3i`           | Returns a vector using the `[0, 1, 3]` elements                                                           |
| `rbg`     | `gvec4i -> gvec3i`           | Returns a vector using the `[0, 2, 1]` elements                                                           |
| `rba`     | `gvec4i -> gvec3i`           | Returns a vector using the `[0, 2, 3]` elements                                                           |
| `rag`     | `gvec4i -> gvec3i`           | Returns a vector using the `[0, 3, 1]` elements                                                           |
| `rab`     | `gvec4i -> gvec3i`           | Returns a vector using the `[0, 3, 2]` elements                                                           |
| `grb`     | `gvec4i -> gvec3i`           | Returns a vector using the `[1, 0, 2]` elements                                                           |
| `gra`     | `gvec4i -> gvec3i`           | Returns a vector using the `[1, 0, 3]` elements                                                           |
| `gbr`     | `gvec4i -> gvec3i`           | Returns a vector using the `[1, 2, 0]` elements                                                           |
| `gba`     | `gvec4i -> gvec3i`           | Returns a vector using the `[1, 2, 3]` elements                                                           |
| `gar`     | `gvec4i -> gvec3i`           | Returns a vector using the `[1, 3, 0]` elements                                                           |
| `gab`     | `gvec4i -> gvec3i`           | Returns a vector using the `[1, 3, 2]` elements                                                           |
| `brg`     | `gvec4i -> gvec3i`           | Returns a vector using the `[2, 0, 1]` elements                                                           |
| `bra`     | `gvec4i -> gvec3i`           | Returns a vector using the `[2, 0, 3]` elements                                                           |
| `bgr`     | `gvec4i -> gvec3i`           | Returns a vector using the `[2, 1, 0]` elements                                                           |
| `bgr`     | `gvec4i -> gvec3i`           | Returns a vector using the `[2, 1, 3]` elements                                                           |
| `bar`     | `gvec4i -> gvec3i`           | Returns a vector using the `[2, 3, 0]` elements                                                           |
| `bag`     | `gvec4i -> gvec3i`           | Returns a vector using the `[2, 3, 1]` elements                                                           |
| `arg`     | `gvec4i -> gvec3i`           | Returns a vector using the `[3, 0, 1]` elements                                                           |
| `arb`     | `gvec4i -> gvec3i`           | Returns a vector using the `[3, 0, 2]` elements                                                           |
| `agr`     | `gvec4i -> gvec3i`           | Returns a vector using the `[3, 1, 0]` elements                                                           |
| `agb`     | `gvec4i -> gvec3i`           | Returns a vector using the `[3, 1, 2]` elements                                                           |
| `abr`     | `gvec4i -> gvec3i`           | Returns a vector using the `[3, 2, 0]` elements                                                           |
| `abg`     | `gvec4i -> gvec3i`           | Returns a vector using the `[3, 2, 1]` elements                                                           |
| `gvec44i` | `(gvec4i, string) -> gvec4i` | Manually constructs a method intended to extract a 4-element vector. You probably won't use this directly |
| `xyzw`    | `gvec4i -> gvec4i`           | Returns the original 4-element vector                                                                     |
| `xywz`    | `gvec4i -> gvec4i`           | Returns a vector using `[0, 1, 3, 2]` ordering                                                            |
| `xzyw`    | `gvec4i -> gvec4i`           | Returns a vector using `[0, 2, 1, 3]` ordering                                                            |
| `xzwy`    | `gvec4i -> gvec4i`           | Returns a vector using `[0, 2, 3, 1]` ordering                                                            |
| `xwyz`    | `gvec4i -> gvec4i`           | Returns a vector using `[0, 3, 1, 2]` ordering                                                            |
| `xwzy`    | `gvec4i -> gvec4i`           | Returns a vector using `[0, 3, 2, 1]` ordering                                                            |
| `yxzw`    | `gvec4i -> gvec4i`           | Returns a vector using `[1, 0, 2, 3]` ordering                                                            |
| `yxwz`    | `gvec4i -> gvec4i`           | Returns a vector using `[1, 0, 3, 2]` ordering                                                            |
| `yzxw`    | `gvec4i -> gvec4i`           | Returns a vector using `[1, 2, 0, 3]` ordering                                                            |
| `yzwx`    | `gvec4i -> gvec4i`           | Returns a vector using `[1, 2, 3, 0]` ordering                                                            |
| `ywxz`    | `gvec4i -> gvec4i`           | Returns a vector using `[1, 3, 0, 2]` ordering                                                            |
| `ywzx`    | `gvec4i -> gvec4i`           | Returns a vector using `[1, 3, 2, 0]` ordering                                                            |
| `zxyw`    | `gvec4i -> gvec4i`           | Returns a vector using `[2, 0, 1, 3]` ordering                                                            |
| `zxwy`    | `gvec4i -> gvec4i`           | Returns a vector using `[2, 0, 3, 1]` ordering                                                            |
| `zyxw`    | `gvec4i -> gvec4i`           | Returns a vector using `[2, 1, 0, 3]` ordering                                                            |
| `zywx`    | `gvec4i -> gvec4i`           | Returns a vector using `[2, 1, 3, 0]` ordering                                                            |
| `zwxy`    | `gvec4i -> gvec4i`           | Returns a vector using `[2, 3, 0, 1]` ordering                                                            |
| `zwyx`    | `gvec4i -> gvec4i`           | Returns a vector using `[2, 3, 1, 0]` ordering                                                            |
| `wxyz`    | `gvec4i -> gvec4i`           | Returns a vector using `[3, 0, 1, 2]` ordering                                                            |
| `wxzy`    | `gvec4i -> gvec4i`           | Returns a vector using `[3, 0, 2, 1]` ordering                                                            |
| `wyxz`    | `gvec4i -> gvec4i`           | Returns a vector using `[3, 1, 0, 2]` ordering                                                            |
| `wyzx`    | `gvec4i -> gvec4i`           | Returns a vector using `[3, 1, 2, 0]` ordering                                                            |
| `wzxy`    | `gvec4i -> gvec4i`           | Returns a vector using `[3, 2, 0, 1]` ordering                                                            |
| `wzyx`    | `gvec4i -> gvec4i`           | Returns a vector using `[3, 2, 1, 0]` ordering                                                            |
| `ijkl`    | `gvec4i -> gvec4i`           | Returns the original 4-element vector                                                                     |
| `ijlk`    | `gvec4i -> gvec4i`           | Returns a vector using `[0, 1, 3, 2]` ordering                                                            |
| `ikjl`    | `gvec4i -> gvec4i`           | Returns a vector using `[0, 2, 1, 3]` ordering                                                            |
| `iklj`    | `gvec4i -> gvec4i`           | Returns a vector using `[0, 2, 3, 1]` ordering                                                            |
| `iljk`    | `gvec4i -> gvec4i`           | Returns a vector using `[0, 3, 1, 2]` ordering                                                            |
| `ilkj`    | `gvec4i -> gvec4i`           | Returns a vector using `[0, 3, 2, 1]` ordering                                                            |
| `jikl`    | `gvec4i -> gvec4i`           | Returns a vector using `[1, 0, 2, 3]` ordering                                                            |
| `jilk`    | `gvec4i -> gvec4i`           | Returns a vector using `[1, 0, 3, 2]` ordering                                                            |
| `jkil`    | `gvec4i -> gvec4i`           | Returns a vector using `[1, 2, 0, 3]` ordering                                                            |
| `jkli`    | `gvec4i -> gvec4i`           | Returns a vector using `[1, 2, 3, 0]` ordering                                                            |
| `jlik`    | `gvec4i -> gvec4i`           | Returns a vector using `[1, 3, 0, 2]` ordering                                                            |
| `jlki`    | `gvec4i -> gvec4i`           | Returns a vector using `[1, 3, 2, 0]` ordering                                                            |
| `kijl`    | `gvec4i -> gvec4i`           | Returns a vector using `[2, 0, 1, 3]` ordering                                                            |
| `kilj`    | `gvec4i -> gvec4i`           | Returns a vector using `[2, 0, 3, 1]` ordering                                                            |
| `kjil`    | `gvec4i -> gvec4i`           | Returns a vector using `[2, 1, 0, 3]` ordering                                                            |
| `kjli`    | `gvec4i -> gvec4i`           | Returns a vector using `[2, 1, 3, 0]` ordering                                                            |
| `klij`    | `gvec4i -> gvec4i`           | Returns a vector using `[2, 3, 0, 1]` ordering                                                            |
| `klji`    | `gvec4i -> gvec4i`           | Returns a vector using `[2, 3, 1, 0]` ordering                                                            |
| `lijk`    | `gvec4i -> gvec4i`           | Returns a vector using `[3, 0, 1, 2]` ordering                                                            |
| `likj`    | `gvec4i -> gvec4i`           | Returns a vector using `[3, 0, 2, 1]` ordering                                                            |
| `ljik`    | `gvec4i -> gvec4i`           | Returns a vector using `[3, 1, 0, 2]` ordering                                                            |
| `ljki`    | `gvec4i -> gvec4i`           | Returns a vector using `[3, 1, 2, 0]` ordering                                                            |
| `lkij`    | `gvec4i -> gvec4i`           | Returns a vector using `[3, 2, 0, 1]` ordering                                                            |
| `lkji`    | `gvec4i -> gvec4i`           | Returns a vector using `[3, 2, 1, 0]` ordering                                                            |
| `rgba`    | `gvec4i -> gvec4i`           | Returns the original 4-element vector                                                                     |
| `rgab`    | `gvec4i -> gvec4i`           | Returns a vector using `[0, 1, 3, 2]` ordering                                                            |
| `rbga`    | `gvec4i -> gvec4i`           | Returns a vector using `[0, 2, 1, 3]` ordering                                                            |
| `rbag`    | `gvec4i -> gvec4i`           | Returns a vector using `[0, 2, 3, 1]` ordering                                                            |
| `ragb`    | `gvec4i -> gvec4i`           | Returns a vector using `[0, 3, 1, 2]` ordering                                                            |
| `rabg`    | `gvec4i -> gvec4i`           | Returns a vector using `[0, 3, 2, 1]` ordering                                                            |
| `grba`    | `gvec4i -> gvec4i`           | Returns a vector using `[1, 0, 2, 3]` ordering                                                            |
| `grab`    | `gvec4i -> gvec4i`           | Returns a vector using `[1, 0, 3, 2]` ordering                                                            |
| `gbra`    | `gvec4i -> gvec4i`           | Returns a vector using `[1, 2, 0, 3]` ordering                                                            |
| `gbar`    | `gvec4i -> gvec4i`           | Returns a vector using `[1, 2, 3, 0]` ordering                                                            |
| `garb`    | `gvec4i -> gvec4i`           | Returns a vector using `[1, 3, 0, 2]` ordering                                                            |
| `gabr`    | `gvec4i -> gvec4i`           | Returns a vector using `[1, 3, 2, 0]` ordering                                                            |
| `brga`    | `gvec4i -> gvec4i`           | Returns a vector using `[2, 0, 1, 3]` ordering                                                            |
| `brag`    | `gvec4i -> gvec4i`           | Returns a vector using `[2, 0, 3, 1]` ordering                                                            |
| `bgra`    | `gvec4i -> gvec4i`           | Returns a vector using `[2, 1, 0, 3]` ordering                                                            |
| `bgar`    | `gvec4i -> gvec4i`           | Returns a vector using `[2, 1, 3, 0]` ordering                                                            |
| `barg`    | `gvec4i -> gvec4i`           | Returns a vector using `[2, 3, 0, 1]` ordering                                                            |
| `bagr`    | `gvec4i -> gvec4i`           | Returns a vector using `[2, 3, 1, 0]` ordering                                                            |
| `argb`    | `gvec4i -> gvec4i`           | Returns a vector using `[3, 0, 1, 2]` ordering                                                            |
| `arbg`    | `gvec4i -> gvec4i`           | Returns a vector using `[3, 0, 2, 1]` ordering                                                            |
| `agrb`    | `gvec4i -> gvec4i`           | Returns a vector using `[3, 1, 0, 2]` ordering                                                            |
| `agbr`    | `gvec4i -> gvec4i`           | Returns a vector using `[3, 1, 2, 0]` ordering                                                            |
| `abrg`    | `gvec4i -> gvec4i`           | Returns a vector using `[3, 2, 0, 1]` ordering                                                            |
| `abgr`    | `gvec4i -> gvec4i`           | Returns a vector using `[3, 2, 1, 0]` ordering                                                            |
| `x`       | `gvec4f -> gf32`             | Accesses value 0 from the 4-element vector                                                                |
| `y`       | `gvec4f -> gf32`             | Accesses value 1 from the 4-element vector                                                                |
| `z`       | `gvec4f -> gf32`             | Accesses value 2 from the 4-element vector                                                                |
| `w`       | `gvec4f -> gf32`             | Accesses value 3 from the 4-element vector                                                                |
| `i`       | `gvec4f -> gf32`             | Accesses value 0 from the 4-element vector                                                                |
| `j`       | `gvec4f -> gf32`             | Accesses value 1 from the 4-element vector                                                                |
| `k`       | `gvec4f -> gf32`             | Accesses value 2 from the 4-element vector                                                                |
| `l`       | `gvec4f -> gf32`             | Accesses value 3 from the 4-element vector                                                                |
| `r`       | `gvec4f -> gf32`             | Accesses value 0 from the 4-element vector                                                                |
| `g`       | `gvec4f -> gf32`             | Accesses value 1 from the 4-element vector                                                                |
| `b`       | `gvec4f -> gf32`             | Accesses value 2 from the 4-element vector                                                                |
| `a`       | `gvec4f -> gf32`             | Accesses value 3 from the 4-element vector                                                                |
| `gvec42f` | `(gvec4f, string) -> gvec2f` | Manually constructs a method intended to extract a 2-element vector. You probably won't use this directly |
| `xy`      | `gvec4f -> gvec2f`           | Returns a vector using the `[0, 1]` elements                                                              |
| `yx`      | `gvec4f -> gvec2f`           | Returns a vector using the `[1, 0]` elements                                                              |
| `xz`      | `gvec4f -> gvec2f`           | Returns a vector using the `[0, 2]` elements                                                              |
| `zx`      | `gvec4f -> gvec2f`           | Returns a vector using the `[2, 0]` elements                                                              |
| `xw`      | `gvec4f -> gvec2f`           | Returns a vector using the `[0, 3]` elements                                                              |
| `wx`      | `gvec4f -> gvec2f`           | Returns a vector using the `[3, 0]` elements                                                              |
| `yz`      | `gvec4f -> gvec2f`           | Returns a vector using the `[1, 2]` elements                                                              |
| `zy`      | `gvec4f -> gvec2f`           | Returns a vector using the `[2, 1]` elements                                                              |
| `yw`      | `gvec4f -> gvec2f`           | Returns a vector using the `[1, 3]` elements                                                              |
| `wy`      | `gvec4f -> gvec2f`           | Returns a vector using the `[3, 1]` elements                                                              |
| `zw`      | `gvec4f -> gvec2f`           | Returns a vector using the `[2, 3]` elements                                                              |
| `wz`      | `gvec4f -> gvec2f`           | Returns a vector using the `[3, 2]` elements                                                              |
| `ij`      | `gvec4f -> gvec2f`           | Returns a vector using the `[0, 1]` elements                                                              |
| `ji`      | `gvec4f -> gvec2f`           | Returns a vector using the `[1, 0]` elements                                                              |
| `ik`      | `gvec4f -> gvec2f`           | Returns a vector using the `[0, 2]` elements                                                              |
| `ki`      | `gvec4f -> gvec2f`           | Returns a vector using the `[2, 0]` elements                                                              |
| `il`      | `gvec4f -> gvec2f`           | Returns a vector using the `[0, 3]` elements                                                              |
| `li`      | `gvec4f -> gvec2f`           | Returns a vector using the `[3, 0]` elements                                                              |
| `jk`      | `gvec4f -> gvec2f`           | Returns a vector using the `[1, 2]` elements                                                              |
| `kj`      | `gvec4f -> gvec2f`           | Returns a vector using the `[2, 1]` elements                                                              |
| `jl`      | `gvec4f -> gvec2f`           | Returns a vector using the `[1, 3]` elements                                                              |
| `lj`      | `gvec4f -> gvec2f`           | Returns a vector using the `[3, 1]` elements                                                              |
| `kl`      | `gvec4f -> gvec2f`           | Returns a vector using the `[2, 3]` elements                                                              |
| `lk`      | `gvec4f -> gvec2f`           | Returns a vector using the `[3, 2]` elements                                                              |
| `rg`      | `gvec4f -> gvec2f`           | Returns a vector using the `[0, 1]` elements                                                              |
| `gr`      | `gvec4f -> gvec2f`           | Returns a vector using the `[1, 0]` elements                                                              |
| `rb`      | `gvec4f -> gvec2f`           | Returns a vector using the `[0, 2]` elements                                                              |
| `br`      | `gvec4f -> gvec2f`           | Returns a vector using the `[2, 0]` elements                                                              |
| `ra`      | `gvec4f -> gvec2f`           | Returns a vector using the `[0, 3]` elements                                                              |
| `ar`      | `gvec4f -> gvec2f`           | Returns a vector using the `[3, 0]` elements                                                              |
| `gb`      | `gvec4f -> gvec2f`           | Returns a vector using the `[1, 2]` elements                                                              |
| `bg`      | `gvec4f -> gvec2f`           | Returns a vector using the `[2, 1]` elements                                                              |
| `ga`      | `gvec4f -> gvec2f`           | Returns a vector using the `[1, 3]` elements                                                              |
| `ag`      | `gvec4f -> gvec2f`           | Returns a vector using the `[3, 1]` elements                                                              |
| `ba`      | `gvec4f -> gvec2f`           | Returns a vector using the `[2, 3]` elements                                                              |
| `ab`      | `gvec4f -> gvec2f`           | Returns a vector using the `[3, 2]` elements                                                              |
| `gvec43f` | `(gvec4f, string) -> gvec3f` | Manually constructs a method intended to extract a 3-element vector. You probably won't use this directly |
| `xyz`     | `gvec4f -> gvec3f`           | Returns a vector using the `[0, 1, 2]` elements                                                           |
| `xyw`     | `gvec4f -> gvec3f`           | Returns a vector using the `[0, 1, 3]` elements                                                           |
| `xzy`     | `gvec4f -> gvec3f`           | Returns a vector using the `[0, 2, 1]` elements                                                           |
| `xzw`     | `gvec4f -> gvec3f`           | Returns a vector using the `[0, 2, 3]` elements                                                           |
| `xwy`     | `gvec4f -> gvec3f`           | Returns a vector using the `[0, 3, 1]` elements                                                           |
| `xwz`     | `gvec4f -> gvec3f`           | Returns a vector using the `[0, 3, 2]` elements                                                           |
| `yxz`     | `gvec4f -> gvec3f`           | Returns a vector using the `[1, 0, 2]` elements                                                           |
| `yxw`     | `gvec4f -> gvec3f`           | Returns a vector using the `[1, 0, 3]` elements                                                           |
| `yzx`     | `gvec4f -> gvec3f`           | Returns a vector using the `[1, 2, 0]` elements                                                           |
| `yzw`     | `gvec4f -> gvec3f`           | Returns a vector using the `[1, 2, 3]` elements                                                           |
| `ywx`     | `gvec4f -> gvec3f`           | Returns a vector using the `[1, 3, 0]` elements                                                           |
| `ywz`     | `gvec4f -> gvec3f`           | Returns a vector using the `[1, 3, 2]` elements                                                           |
| `zxy`     | `gvec4f -> gvec3f`           | Returns a vector using the `[2, 0, 1]` elements                                                           |
| `zxw`     | `gvec4f -> gvec3f`           | Returns a vector using the `[2, 0, 3]` elements                                                           |
| `zyx`     | `gvec4f -> gvec3f`           | Returns a vector using the `[2, 1, 0]` elements                                                           |
| `zyw`     | `gvec4f -> gvec3f`           | Returns a vector using the `[2, 1, 3]` elements                                                           |
| `zwx`     | `gvec4f -> gvec3f`           | Returns a vector using the `[2, 3, 0]` elements                                                           |
| `zwy`     | `gvec4f -> gvec3f`           | Returns a vector using the `[2, 3, 1]` elements                                                           |
| `wxy`     | `gvec4f -> gvec3f`           | Returns a vector using the `[3, 0, 1]` elements                                                           |
| `wxz`     | `gvec4f -> gvec3f`           | Returns a vector using the `[3, 0, 2]` elements                                                           |
| `wyx`     | `gvec4f -> gvec3f`           | Returns a vector using the `[3, 1, 0]` elements                                                           |
| `wyz`     | `gvec4f -> gvec3f`           | Returns a vector using the `[3, 1, 2]` elements                                                           |
| `wzx`     | `gvec4f -> gvec3f`           | Returns a vector using the `[3, 2, 0]` elements                                                           |
| `wzy`     | `gvec4f -> gvec3f`           | Returns a vector using the `[3, 2, 1]` elements                                                           |
| `ijk`     | `gvec4f -> gvec3f`           | Returns a vector using the `[0, 1, 2]` elements                                                           |
| `ijl`     | `gvec4f -> gvec3f`           | Returns a vector using the `[0, 1, 3]` elements                                                           |
| `ikj`     | `gvec4f -> gvec3f`           | Returns a vector using the `[0, 2, 1]` elements                                                           |
| `ikl`     | `gvec4f -> gvec3f`           | Returns a vector using the `[0, 2, 3]` elements                                                           |
| `ilj`     | `gvec4f -> gvec3f`           | Returns a vector using the `[0, 3, 1]` elements                                                           |
| `ilk`     | `gvec4f -> gvec3f`           | Returns a vector using the `[0, 3, 2]` elements                                                           |
| `jik`     | `gvec4f -> gvec3f`           | Returns a vector using the `[1, 0, 2]` elements                                                           |
| `jil`     | `gvec4f -> gvec3f`           | Returns a vector using the `[1, 0, 3]` elements                                                           |
| `jki`     | `gvec4f -> gvec3f`           | Returns a vector using the `[1, 2, 0]` elements                                                           |
| `jkl`     | `gvec4f -> gvec3f`           | Returns a vector using the `[1, 2, 3]` elements                                                           |
| `jli`     | `gvec4f -> gvec3f`           | Returns a vector using the `[1, 3, 0]` elements                                                           |
| `jlk`     | `gvec4f -> gvec3f`           | Returns a vector using the `[1, 3, 2]` elements                                                           |
| `kij`     | `gvec4f -> gvec3f`           | Returns a vector using the `[2, 0, 1]` elements                                                           |
| `kil`     | `gvec4f -> gvec3f`           | Returns a vector using the `[2, 0, 3]` elements                                                           |
| `kji`     | `gvec4f -> gvec3f`           | Returns a vector using the `[2, 1, 0]` elements                                                           |
| `kjl`     | `gvec4f -> gvec3f`           | Returns a vector using the `[2, 1, 3]` elements                                                           |
| `kli`     | `gvec4f -> gvec3f`           | Returns a vector using the `[2, 3, 0]` elements                                                           |
| `klj`     | `gvec4f -> gvec3f`           | Returns a vector using the `[2, 3, 1]` elements                                                           |
| `lij`     | `gvec4f -> gvec3f`           | Returns a vector using the `[3, 0, 1]` elements                                                           |
| `lik`     | `gvec4f -> gvec3f`           | Returns a vector using the `[3, 0, 2]` elements                                                           |
| `lji`     | `gvec4f -> gvec3f`           | Returns a vector using the `[3, 1, 0]` elements                                                           |
| `ljk`     | `gvec4f -> gvec3f`           | Returns a vector using the `[3, 1, 2]` elements                                                           |
| `lki`     | `gvec4f -> gvec3f`           | Returns a vector using the `[3, 2, 0]` elements                                                           |
| `lkj`     | `gvec4f -> gvec3f`           | Returns a vector using the `[3, 2, 1]` elements                                                           |
| `rgb`     | `gvec4f -> gvec3f`           | Returns a vector using the `[0, 1, 2]` elements                                                           |
| `rga`     | `gvec4f -> gvec3f`           | Returns a vector using the `[0, 1, 3]` elements                                                           |
| `rbg`     | `gvec4f -> gvec3f`           | Returns a vector using the `[0, 2, 1]` elements                                                           |
| `rba`     | `gvec4f -> gvec3f`           | Returns a vector using the `[0, 2, 3]` elements                                                           |
| `rag`     | `gvec4f -> gvec3f`           | Returns a vector using the `[0, 3, 1]` elements                                                           |
| `rab`     | `gvec4f -> gvec3f`           | Returns a vector using the `[0, 3, 2]` elements                                                           |
| `grb`     | `gvec4f -> gvec3f`           | Returns a vector using the `[1, 0, 2]` elements                                                           |
| `gra`     | `gvec4f -> gvec3f`           | Returns a vector using the `[1, 0, 3]` elements                                                           |
| `gbr`     | `gvec4f -> gvec3f`           | Returns a vector using the `[1, 2, 0]` elements                                                           |
| `gba`     | `gvec4f -> gvec3f`           | Returns a vector using the `[1, 2, 3]` elements                                                           |
| `gar`     | `gvec4f -> gvec3f`           | Returns a vector using the `[1, 3, 0]` elements                                                           |
| `gab`     | `gvec4f -> gvec3f`           | Returns a vector using the `[1, 3, 2]` elements                                                           |
| `brg`     | `gvec4f -> gvec3f`           | Returns a vector using the `[2, 0, 1]` elements                                                           |
| `bra`     | `gvec4f -> gvec3f`           | Returns a vector using the `[2, 0, 3]` elements                                                           |
| `bgr`     | `gvec4f -> gvec3f`           | Returns a vector using the `[2, 1, 0]` elements                                                           |
| `bgr`     | `gvec4f -> gvec3f`           | Returns a vector using the `[2, 1, 3]` elements                                                           |
| `bar`     | `gvec4f -> gvec3f`           | Returns a vector using the `[2, 3, 0]` elements                                                           |
| `bag`     | `gvec4f -> gvec3f`           | Returns a vector using the `[2, 3, 1]` elements                                                           |
| `arg`     | `gvec4f -> gvec3f`           | Returns a vector using the `[3, 0, 1]` elements                                                           |
| `arb`     | `gvec4f -> gvec3f`           | Returns a vector using the `[3, 0, 2]` elements                                                           |
| `agr`     | `gvec4f -> gvec3f`           | Returns a vector using the `[3, 1, 0]` elements                                                           |
| `agb`     | `gvec4f -> gvec3f`           | Returns a vector using the `[3, 1, 2]` elements                                                           |
| `abr`     | `gvec4f -> gvec3f`           | Returns a vector using the `[3, 2, 0]` elements                                                           |
| `abg`     | `gvec4f -> gvec3f`           | Returns a vector using the `[3, 2, 1]` elements                                                           |
| `gvec44f` | `(gvec4f, string) -> gvec4f` | Manually constructs a method intended to extract a 4-element vector. You probably won't use this directly |
| `xyzw`    | `gvec4f -> gvec4f`           | Returns the original 4-element vector                                                                     |
| `xywz`    | `gvec4f -> gvec4f`           | Returns a vector using `[0, 1, 3, 2]` ordering                                                            |
| `xzyw`    | `gvec4f -> gvec4f`           | Returns a vector using `[0, 2, 1, 3]` ordering                                                            |
| `xzwy`    | `gvec4f -> gvec4f`           | Returns a vector using `[0, 2, 3, 1]` ordering                                                            |
| `xwyz`    | `gvec4f -> gvec4f`           | Returns a vector using `[0, 3, 1, 2]` ordering                                                            |
| `xwzy`    | `gvec4f -> gvec4f`           | Returns a vector using `[0, 3, 2, 1]` ordering                                                            |
| `yxzw`    | `gvec4f -> gvec4f`           | Returns a vector using `[1, 0, 2, 3]` ordering                                                            |
| `yxwz`    | `gvec4f -> gvec4f`           | Returns a vector using `[1, 0, 3, 2]` ordering                                                            |
| `yzxw`    | `gvec4f -> gvec4f`           | Returns a vector using `[1, 2, 0, 3]` ordering                                                            |
| `yzwx`    | `gvec4f -> gvec4f`           | Returns a vector using `[1, 2, 3, 0]` ordering                                                            |
| `ywxz`    | `gvec4f -> gvec4f`           | Returns a vector using `[1, 3, 0, 2]` ordering                                                            |
| `ywzx`    | `gvec4f -> gvec4f`           | Returns a vector using `[1, 3, 2, 0]` ordering                                                            |
| `zxyw`    | `gvec4f -> gvec4f`           | Returns a vector using `[2, 0, 1, 3]` ordering                                                            |
| `zxwy`    | `gvec4f -> gvec4f`           | Returns a vector using `[2, 0, 3, 1]` ordering                                                            |
| `zyxw`    | `gvec4f -> gvec4f`           | Returns a vector using `[2, 1, 0, 3]` ordering                                                            |
| `zywx`    | `gvec4f -> gvec4f`           | Returns a vector using `[2, 1, 3, 0]` ordering                                                            |
| `zwxy`    | `gvec4f -> gvec4f`           | Returns a vector using `[2, 3, 0, 1]` ordering                                                            |
| `zwyx`    | `gvec4f -> gvec4f`           | Returns a vector using `[2, 3, 1, 0]` ordering                                                            |
| `wxyz`    | `gvec4f -> gvec4f`           | Returns a vector using `[3, 0, 1, 2]` ordering                                                            |
| `wxzy`    | `gvec4f -> gvec4f`           | Returns a vector using `[3, 0, 2, 1]` ordering                                                            |
| `wyxz`    | `gvec4f -> gvec4f`           | Returns a vector using `[3, 1, 0, 2]` ordering                                                            |
| `wyzx`    | `gvec4f -> gvec4f`           | Returns a vector using `[3, 1, 2, 0]` ordering                                                            |
| `wzxy`    | `gvec4f -> gvec4f`           | Returns a vector using `[3, 2, 0, 1]` ordering                                                            |
| `wzyx`    | `gvec4f -> gvec4f`           | Returns a vector using `[3, 2, 1, 0]` ordering                                                            |
| `ijkl`    | `gvec4f -> gvec4f`           | Returns the original 4-element vector                                                                     |
| `ijlk`    | `gvec4f -> gvec4f`           | Returns a vector using `[0, 1, 3, 2]` ordering                                                            |
| `ikjl`    | `gvec4f -> gvec4f`           | Returns a vector using `[0, 2, 1, 3]` ordering                                                            |
| `iklj`    | `gvec4f -> gvec4f`           | Returns a vector using `[0, 2, 3, 1]` ordering                                                            |
| `iljk`    | `gvec4f -> gvec4f`           | Returns a vector using `[0, 3, 1, 2]` ordering                                                            |
| `ilkj`    | `gvec4f -> gvec4f`           | Returns a vector using `[0, 3, 2, 1]` ordering                                                            |
| `jikl`    | `gvec4f -> gvec4f`           | Returns a vector using `[1, 0, 2, 3]` ordering                                                            |
| `jilk`    | `gvec4f -> gvec4f`           | Returns a vector using `[1, 0, 3, 2]` ordering                                                            |
| `jkil`    | `gvec4f -> gvec4f`           | Returns a vector using `[1, 2, 0, 3]` ordering                                                            |
| `jkli`    | `gvec4f -> gvec4f`           | Returns a vector using `[1, 2, 3, 0]` ordering                                                            |
| `jlik`    | `gvec4f -> gvec4f`           | Returns a vector using `[1, 3, 0, 2]` ordering                                                            |
| `jlki`    | `gvec4f -> gvec4f`           | Returns a vector using `[1, 3, 2, 0]` ordering                                                            |
| `kijl`    | `gvec4f -> gvec4f`           | Returns a vector using `[2, 0, 1, 3]` ordering                                                            |
| `kilj`    | `gvec4f -> gvec4f`           | Returns a vector using `[2, 0, 3, 1]` ordering                                                            |
| `kjil`    | `gvec4f -> gvec4f`           | Returns a vector using `[2, 1, 0, 3]` ordering                                                            |
| `kjli`    | `gvec4f -> gvec4f`           | Returns a vector using `[2, 1, 3, 0]` ordering                                                            |
| `klij`    | `gvec4f -> gvec4f`           | Returns a vector using `[2, 3, 0, 1]` ordering                                                            |
| `klji`    | `gvec4f -> gvec4f`           | Returns a vector using `[2, 3, 1, 0]` ordering                                                            |
| `lijk`    | `gvec4f -> gvec4f`           | Returns a vector using `[3, 0, 1, 2]` ordering                                                            |
| `likj`    | `gvec4f -> gvec4f`           | Returns a vector using `[3, 0, 2, 1]` ordering                                                            |
| `ljik`    | `gvec4f -> gvec4f`           | Returns a vector using `[3, 1, 0, 2]` ordering                                                            |
| `ljki`    | `gvec4f -> gvec4f`           | Returns a vector using `[3, 1, 2, 0]` ordering                                                            |
| `lkij`    | `gvec4f -> gvec4f`           | Returns a vector using `[3, 2, 0, 1]` ordering                                                            |
| `lkji`    | `gvec4f -> gvec4f`           | Returns a vector using `[3, 2, 1, 0]` ordering                                                            |
| `rgba`    | `gvec4f -> gvec4f`           | Returns the original 4-element vector                                                                     |
| `rgab`    | `gvec4f -> gvec4f`           | Returns a vector using `[0, 1, 3, 2]` ordering                                                            |
| `rbga`    | `gvec4f -> gvec4f`           | Returns a vector using `[0, 2, 1, 3]` ordering                                                            |
| `rbag`    | `gvec4f -> gvec4f`           | Returns a vector using `[0, 2, 3, 1]` ordering                                                            |
| `ragb`    | `gvec4f -> gvec4f`           | Returns a vector using `[0, 3, 1, 2]` ordering                                                            |
| `rabg`    | `gvec4f -> gvec4f`           | Returns a vector using `[0, 3, 2, 1]` ordering                                                            |
| `grba`    | `gvec4f -> gvec4f`           | Returns a vector using `[1, 0, 2, 3]` ordering                                                            |
| `grab`    | `gvec4f -> gvec4f`           | Returns a vector using `[1, 0, 3, 2]` ordering                                                            |
| `gbra`    | `gvec4f -> gvec4f`           | Returns a vector using `[1, 2, 0, 3]` ordering                                                            |
| `gbar`    | `gvec4f -> gvec4f`           | Returns a vector using `[1, 2, 3, 0]` ordering                                                            |
| `garb`    | `gvec4f -> gvec4f`           | Returns a vector using `[1, 3, 0, 2]` ordering                                                            |
| `gabr`    | `gvec4f -> gvec4f`           | Returns a vector using `[1, 3, 2, 0]` ordering                                                            |
| `brga`    | `gvec4f -> gvec4f`           | Returns a vector using `[2, 0, 1, 3]` ordering                                                            |
| `brag`    | `gvec4f -> gvec4f`           | Returns a vector using `[2, 0, 3, 1]` ordering                                                            |
| `bgra`    | `gvec4f -> gvec4f`           | Returns a vector using `[2, 1, 0, 3]` ordering                                                            |
| `bgar`    | `gvec4f -> gvec4f`           | Returns a vector using `[2, 1, 3, 0]` ordering                                                            |
| `barg`    | `gvec4f -> gvec4f`           | Returns a vector using `[2, 3, 0, 1]` ordering                                                            |
| `bagr`    | `gvec4f -> gvec4f`           | Returns a vector using `[2, 3, 1, 0]` ordering                                                            |
| `argb`    | `gvec4f -> gvec4f`           | Returns a vector using `[3, 0, 1, 2]` ordering                                                            |
| `arbg`    | `gvec4f -> gvec4f`           | Returns a vector using `[3, 0, 2, 1]` ordering                                                            |
| `agrb`    | `gvec4f -> gvec4f`           | Returns a vector using `[3, 1, 0, 2]` ordering                                                            |
| `agbr`    | `gvec4f -> gvec4f`           | Returns a vector using `[3, 1, 2, 0]` ordering                                                            |
| `abrg`    | `gvec4f -> gvec4f`           | Returns a vector using `[3, 2, 0, 1]` ordering                                                            |
| `abgr`    | `gvec4f -> gvec4f`           | Returns a vector using `[3, 2, 1, 0]` ordering                                                            |
| `x`       | `gvec4b -> gbool`            | Accesses value 0 from the 4-element vector                                                                |
| `y`       | `gvec4b -> gbool`            | Accesses value 1 from the 4-element vector                                                                |
| `z`       | `gvec4b -> gbool`            | Accesses value 2 from the 4-element vector                                                                |
| `w`       | `gvec4b -> gbool`            | Accesses value 3 from the 4-element vector                                                                |
| `i`       | `gvec4b -> gbool`            | Accesses value 0 from the 4-element vector                                                                |
| `j`       | `gvec4b -> gbool`            | Accesses value 1 from the 4-element vector                                                                |
| `k`       | `gvec4b -> gbool`            | Accesses value 2 from the 4-element vector                                                                |
| `l`       | `gvec4b -> gbool`            | Accesses value 3 from the 4-element vector                                                                |
| `r`       | `gvec4b -> gbool`            | Accesses value 0 from the 4-element vector                                                                |
| `g`       | `gvec4b -> gbool`            | Accesses value 1 from the 4-element vector                                                                |
| `b`       | `gvec4b -> gbool`            | Accesses value 2 from the 4-element vector                                                                |
| `a`       | `gvec4b -> gbool`            | Accesses value 3 from the 4-element vector                                                                |
| `gvec42b` | `(gvec4b, string) -> gvec2b` | Manually constructs a method intended to extract a 2-element vector. You probably won't use this directly |
| `xy`      | `gvec4b -> gvec2b`           | Returns a vector using the `[0, 1]` elements                                                              |
| `yx`      | `gvec4b -> gvec2b`           | Returns a vector using the `[1, 0]` elements                                                              |
| `xz`      | `gvec4b -> gvec2b`           | Returns a vector using the `[0, 2]` elements                                                              |
| `zx`      | `gvec4b -> gvec2b`           | Returns a vector using the `[2, 0]` elements                                                              |
| `xw`      | `gvec4b -> gvec2b`           | Returns a vector using the `[0, 3]` elements                                                              |
| `wx`      | `gvec4b -> gvec2b`           | Returns a vector using the `[3, 0]` elements                                                              |
| `yz`      | `gvec4b -> gvec2b`           | Returns a vector using the `[1, 2]` elements                                                              |
| `zy`      | `gvec4b -> gvec2b`           | Returns a vector using the `[2, 1]` elements                                                              |
| `yw`      | `gvec4b -> gvec2b`           | Returns a vector using the `[1, 3]` elements                                                              |
| `wy`      | `gvec4b -> gvec2b`           | Returns a vector using the `[3, 1]` elements                                                              |
| `zw`      | `gvec4b -> gvec2b`           | Returns a vector using the `[2, 3]` elements                                                              |
| `wz`      | `gvec4b -> gvec2b`           | Returns a vector using the `[3, 2]` elements                                                              |
| `ij`      | `gvec4b -> gvec2b`           | Returns a vector using the `[0, 1]` elements                                                              |
| `ji`      | `gvec4b -> gvec2b`           | Returns a vector using the `[1, 0]` elements                                                              |
| `ik`      | `gvec4b -> gvec2b`           | Returns a vector using the `[0, 2]` elements                                                              |
| `ki`      | `gvec4b -> gvec2b`           | Returns a vector using the `[2, 0]` elements                                                              |
| `il`      | `gvec4b -> gvec2b`           | Returns a vector using the `[0, 3]` elements                                                              |
| `li`      | `gvec4b -> gvec2b`           | Returns a vector using the `[3, 0]` elements                                                              |
| `jk`      | `gvec4b -> gvec2b`           | Returns a vector using the `[1, 2]` elements                                                              |
| `kj`      | `gvec4b -> gvec2b`           | Returns a vector using the `[2, 1]` elements                                                              |
| `jl`      | `gvec4b -> gvec2b`           | Returns a vector using the `[1, 3]` elements                                                              |
| `lj`      | `gvec4b -> gvec2b`           | Returns a vector using the `[3, 1]` elements                                                              |
| `kl`      | `gvec4b -> gvec2b`           | Returns a vector using the `[2, 3]` elements                                                              |
| `lk`      | `gvec4b -> gvec2b`           | Returns a vector using the `[3, 2]` elements                                                              |
| `rg`      | `gvec4b -> gvec2b`           | Returns a vector using the `[0, 1]` elements                                                              |
| `gr`      | `gvec4b -> gvec2b`           | Returns a vector using the `[1, 0]` elements                                                              |
| `rb`      | `gvec4b -> gvec2b`           | Returns a vector using the `[0, 2]` elements                                                              |
| `br`      | `gvec4b -> gvec2b`           | Returns a vector using the `[2, 0]` elements                                                              |
| `ra`      | `gvec4b -> gvec2b`           | Returns a vector using the `[0, 3]` elements                                                              |
| `ar`      | `gvec4b -> gvec2b`           | Returns a vector using the `[3, 0]` elements                                                              |
| `gb`      | `gvec4b -> gvec2b`           | Returns a vector using the `[1, 2]` elements                                                              |
| `bg`      | `gvec4b -> gvec2b`           | Returns a vector using the `[2, 1]` elements                                                              |
| `ga`      | `gvec4b -> gvec2b`           | Returns a vector using the `[1, 3]` elements                                                              |
| `ag`      | `gvec4b -> gvec2b`           | Returns a vector using the `[3, 1]` elements                                                              |
| `ba`      | `gvec4b -> gvec2b`           | Returns a vector using the `[2, 3]` elements                                                              |
| `ab`      | `gvec4b -> gvec2b`           | Returns a vector using the `[3, 2]` elements                                                              |
| `gvec43b` | `(gvec4b, string) -> gvec3b` | Manually constructs a method intended to extract a 3-element vector. You probably won't use this directly |
| `xyz`     | `gvec4b -> gvec3b`           | Returns a vector using the `[0, 1, 2]` elements                                                           |
| `xyw`     | `gvec4b -> gvec3b`           | Returns a vector using the `[0, 1, 3]` elements                                                           |
| `xzy`     | `gvec4b -> gvec3b`           | Returns a vector using the `[0, 2, 1]` elements                                                           |
| `xzw`     | `gvec4b -> gvec3b`           | Returns a vector using the `[0, 2, 3]` elements                                                           |
| `xwy`     | `gvec4b -> gvec3b`           | Returns a vector using the `[0, 3, 1]` elements                                                           |
| `xwz`     | `gvec4b -> gvec3b`           | Returns a vector using the `[0, 3, 2]` elements                                                           |
| `yxz`     | `gvec4b -> gvec3b`           | Returns a vector using the `[1, 0, 2]` elements                                                           |
| `yxw`     | `gvec4b -> gvec3b`           | Returns a vector using the `[1, 0, 3]` elements                                                           |
| `yzx`     | `gvec4b -> gvec3b`           | Returns a vector using the `[1, 2, 0]` elements                                                           |
| `yzw`     | `gvec4b -> gvec3b`           | Returns a vector using the `[1, 2, 3]` elements                                                           |
| `ywx`     | `gvec4b -> gvec3b`           | Returns a vector using the `[1, 3, 0]` elements                                                           |
| `ywz`     | `gvec4b -> gvec3b`           | Returns a vector using the `[1, 3, 2]` elements                                                           |
| `zxy`     | `gvec4b -> gvec3b`           | Returns a vector using the `[2, 0, 1]` elements                                                           |
| `zxw`     | `gvec4b -> gvec3b`           | Returns a vector using the `[2, 0, 3]` elements                                                           |
| `zyx`     | `gvec4b -> gvec3b`           | Returns a vector using the `[2, 1, 0]` elements                                                           |
| `zyw`     | `gvec4b -> gvec3b`           | Returns a vector using the `[2, 1, 3]` elements                                                           |
| `zwx`     | `gvec4b -> gvec3b`           | Returns a vector using the `[2, 3, 0]` elements                                                           |
| `zwy`     | `gvec4b -> gvec3b`           | Returns a vector using the `[2, 3, 1]` elements                                                           |
| `wxy`     | `gvec4b -> gvec3b`           | Returns a vector using the `[3, 0, 1]` elements                                                           |
| `wxz`     | `gvec4b -> gvec3b`           | Returns a vector using the `[3, 0, 2]` elements                                                           |
| `wyx`     | `gvec4b -> gvec3b`           | Returns a vector using the `[3, 1, 0]` elements                                                           |
| `wyz`     | `gvec4b -> gvec3b`           | Returns a vector using the `[3, 1, 2]` elements                                                           |
| `wzx`     | `gvec4b -> gvec3b`           | Returns a vector using the `[3, 2, 0]` elements                                                           |
| `wzy`     | `gvec4b -> gvec3b`           | Returns a vector using the `[3, 2, 1]` elements                                                           |
| `ijk`     | `gvec4b -> gvec3b`           | Returns a vector using the `[0, 1, 2]` elements                                                           |
| `ijl`     | `gvec4b -> gvec3b`           | Returns a vector using the `[0, 1, 3]` elements                                                           |
| `ikj`     | `gvec4b -> gvec3b`           | Returns a vector using the `[0, 2, 1]` elements                                                           |
| `ikl`     | `gvec4b -> gvec3b`           | Returns a vector using the `[0, 2, 3]` elements                                                           |
| `ilj`     | `gvec4b -> gvec3b`           | Returns a vector using the `[0, 3, 1]` elements                                                           |
| `ilk`     | `gvec4b -> gvec3b`           | Returns a vector using the `[0, 3, 2]` elements                                                           |
| `jik`     | `gvec4b -> gvec3b`           | Returns a vector using the `[1, 0, 2]` elements                                                           |
| `jil`     | `gvec4b -> gvec3b`           | Returns a vector using the `[1, 0, 3]` elements                                                           |
| `jki`     | `gvec4b -> gvec3b`           | Returns a vector using the `[1, 2, 0]` elements                                                           |
| `jkl`     | `gvec4b -> gvec3b`           | Returns a vector using the `[1, 2, 3]` elements                                                           |
| `jli`     | `gvec4b -> gvec3b`           | Returns a vector using the `[1, 3, 0]` elements                                                           |
| `jlk`     | `gvec4b -> gvec3b`           | Returns a vector using the `[1, 3, 2]` elements                                                           |
| `kij`     | `gvec4b -> gvec3b`           | Returns a vector using the `[2, 0, 1]` elements                                                           |
| `kil`     | `gvec4b -> gvec3b`           | Returns a vector using the `[2, 0, 3]` elements                                                           |
| `kji`     | `gvec4b -> gvec3b`           | Returns a vector using the `[2, 1, 0]` elements                                                           |
| `kjl`     | `gvec4b -> gvec3b`           | Returns a vector using the `[2, 1, 3]` elements                                                           |
| `kli`     | `gvec4b -> gvec3b`           | Returns a vector using the `[2, 3, 0]` elements                                                           |
| `klj`     | `gvec4b -> gvec3b`           | Returns a vector using the `[2, 3, 1]` elements                                                           |
| `lij`     | `gvec4b -> gvec3b`           | Returns a vector using the `[3, 0, 1]` elements                                                           |
| `lik`     | `gvec4b -> gvec3b`           | Returns a vector using the `[3, 0, 2]` elements                                                           |
| `lji`     | `gvec4b -> gvec3b`           | Returns a vector using the `[3, 1, 0]` elements                                                           |
| `ljk`     | `gvec4b -> gvec3b`           | Returns a vector using the `[3, 1, 2]` elements                                                           |
| `lki`     | `gvec4b -> gvec3b`           | Returns a vector using the `[3, 2, 0]` elements                                                           |
| `lkj`     | `gvec4b -> gvec3b`           | Returns a vector using the `[3, 2, 1]` elements                                                           |
| `rgb`     | `gvec4b -> gvec3b`           | Returns a vector using the `[0, 1, 2]` elements                                                           |
| `rga`     | `gvec4b -> gvec3b`           | Returns a vector using the `[0, 1, 3]` elements                                                           |
| `rbg`     | `gvec4b -> gvec3b`           | Returns a vector using the `[0, 2, 1]` elements                                                           |
| `rba`     | `gvec4b -> gvec3b`           | Returns a vector using the `[0, 2, 3]` elements                                                           |
| `rag`     | `gvec4b -> gvec3b`           | Returns a vector using the `[0, 3, 1]` elements                                                           |
| `rab`     | `gvec4b -> gvec3b`           | Returns a vector using the `[0, 3, 2]` elements                                                           |
| `grb`     | `gvec4b -> gvec3b`           | Returns a vector using the `[1, 0, 2]` elements                                                           |
| `gra`     | `gvec4b -> gvec3b`           | Returns a vector using the `[1, 0, 3]` elements                                                           |
| `gbr`     | `gvec4b -> gvec3b`           | Returns a vector using the `[1, 2, 0]` elements                                                           |
| `gba`     | `gvec4b -> gvec3b`           | Returns a vector using the `[1, 2, 3]` elements                                                           |
| `gar`     | `gvec4b -> gvec3b`           | Returns a vector using the `[1, 3, 0]` elements                                                           |
| `gab`     | `gvec4b -> gvec3b`           | Returns a vector using the `[1, 3, 2]` elements                                                           |
| `brg`     | `gvec4b -> gvec3b`           | Returns a vector using the `[2, 0, 1]` elements                                                           |
| `bra`     | `gvec4b -> gvec3b`           | Returns a vector using the `[2, 0, 3]` elements                                                           |
| `bgr`     | `gvec4b -> gvec3b`           | Returns a vector using the `[2, 1, 0]` elements                                                           |
| `bgr`     | `gvec4b -> gvec3b`           | Returns a vector using the `[2, 1, 3]` elements                                                           |
| `bar`     | `gvec4b -> gvec3b`           | Returns a vector using the `[2, 3, 0]` elements                                                           |
| `bag`     | `gvec4b -> gvec3b`           | Returns a vector using the `[2, 3, 1]` elements                                                           |
| `arg`     | `gvec4b -> gvec3b`           | Returns a vector using the `[3, 0, 1]` elements                                                           |
| `arb`     | `gvec4b -> gvec3b`           | Returns a vector using the `[3, 0, 2]` elements                                                           |
| `agr`     | `gvec4b -> gvec3b`           | Returns a vector using the `[3, 1, 0]` elements                                                           |
| `agb`     | `gvec4b -> gvec3b`           | Returns a vector using the `[3, 1, 2]` elements                                                           |
| `abr`     | `gvec4b -> gvec3b`           | Returns a vector using the `[3, 2, 0]` elements                                                           |
| `abg`     | `gvec4b -> gvec3b`           | Returns a vector using the `[3, 2, 1]` elements                                                           |
| `gvec44b` | `(gvec4b, string) -> gvec4b` | Manually constructs a method intended to extract a 4-element vector. You probably won't use this directly |
| `xyzw`    | `gvec4b -> gvec4b`           | Returns the original 4-element vector                                                                     |
| `xywz`    | `gvec4b -> gvec4b`           | Returns a vector using `[0, 1, 3, 2]` ordering                                                            |
| `xzyw`    | `gvec4b -> gvec4b`           | Returns a vector using `[0, 2, 1, 3]` ordering                                                            |
| `xzwy`    | `gvec4b -> gvec4b`           | Returns a vector using `[0, 2, 3, 1]` ordering                                                            |
| `xwyz`    | `gvec4b -> gvec4b`           | Returns a vector using `[0, 3, 1, 2]` ordering                                                            |
| `xwzy`    | `gvec4b -> gvec4b`           | Returns a vector using `[0, 3, 2, 1]` ordering                                                            |
| `yxzw`    | `gvec4b -> gvec4b`           | Returns a vector using `[1, 0, 2, 3]` ordering                                                            |
| `yxwz`    | `gvec4b -> gvec4b`           | Returns a vector using `[1, 0, 3, 2]` ordering                                                            |
| `yzxw`    | `gvec4b -> gvec4b`           | Returns a vector using `[1, 2, 0, 3]` ordering                                                            |
| `yzwx`    | `gvec4b -> gvec4b`           | Returns a vector using `[1, 2, 3, 0]` ordering                                                            |
| `ywxz`    | `gvec4b -> gvec4b`           | Returns a vector using `[1, 3, 0, 2]` ordering                                                            |
| `ywzx`    | `gvec4b -> gvec4b`           | Returns a vector using `[1, 3, 2, 0]` ordering                                                            |
| `zxyw`    | `gvec4b -> gvec4b`           | Returns a vector using `[2, 0, 1, 3]` ordering                                                            |
| `zxwy`    | `gvec4b -> gvec4b`           | Returns a vector using `[2, 0, 3, 1]` ordering                                                            |
| `zyxw`    | `gvec4b -> gvec4b`           | Returns a vector using `[2, 1, 0, 3]` ordering                                                            |
| `zywx`    | `gvec4b -> gvec4b`           | Returns a vector using `[2, 1, 3, 0]` ordering                                                            |
| `zwxy`    | `gvec4b -> gvec4b`           | Returns a vector using `[2, 3, 0, 1]` ordering                                                            |
| `zwyx`    | `gvec4b -> gvec4b`           | Returns a vector using `[2, 3, 1, 0]` ordering                                                            |
| `wxyz`    | `gvec4b -> gvec4b`           | Returns a vector using `[3, 0, 1, 2]` ordering                                                            |
| `wxzy`    | `gvec4b -> gvec4b`           | Returns a vector using `[3, 0, 2, 1]` ordering                                                            |
| `wyxz`    | `gvec4b -> gvec4b`           | Returns a vector using `[3, 1, 0, 2]` ordering                                                            |
| `wyzx`    | `gvec4b -> gvec4b`           | Returns a vector using `[3, 1, 2, 0]` ordering                                                            |
| `wzxy`    | `gvec4b -> gvec4b`           | Returns a vector using `[3, 2, 0, 1]` ordering                                                            |
| `wzyx`    | `gvec4b -> gvec4b`           | Returns a vector using `[3, 2, 1, 0]` ordering                                                            |
| `ijkl`    | `gvec4b -> gvec4b`           | Returns the original 4-element vector                                                                     |
| `ijlk`    | `gvec4b -> gvec4b`           | Returns a vector using `[0, 1, 3, 2]` ordering                                                            |
| `ikjl`    | `gvec4b -> gvec4b`           | Returns a vector using `[0, 2, 1, 3]` ordering                                                            |
| `iklj`    | `gvec4b -> gvec4b`           | Returns a vector using `[0, 2, 3, 1]` ordering                                                            |
| `iljk`    | `gvec4b -> gvec4b`           | Returns a vector using `[0, 3, 1, 2]` ordering                                                            |
| `ilkj`    | `gvec4b -> gvec4b`           | Returns a vector using `[0, 3, 2, 1]` ordering                                                            |
| `jikl`    | `gvec4b -> gvec4b`           | Returns a vector using `[1, 0, 2, 3]` ordering                                                            |
| `jilk`    | `gvec4b -> gvec4b`           | Returns a vector using `[1, 0, 3, 2]` ordering                                                            |
| `jkil`    | `gvec4b -> gvec4b`           | Returns a vector using `[1, 2, 0, 3]` ordering                                                            |
| `jkli`    | `gvec4b -> gvec4b`           | Returns a vector using `[1, 2, 3, 0]` ordering                                                            |
| `jlik`    | `gvec4b -> gvec4b`           | Returns a vector using `[1, 3, 0, 2]` ordering                                                            |
| `jlki`    | `gvec4b -> gvec4b`           | Returns a vector using `[1, 3, 2, 0]` ordering                                                            |
| `kijl`    | `gvec4b -> gvec4b`           | Returns a vector using `[2, 0, 1, 3]` ordering                                                            |
| `kilj`    | `gvec4b -> gvec4b`           | Returns a vector using `[2, 0, 3, 1]` ordering                                                            |
| `kjil`    | `gvec4b -> gvec4b`           | Returns a vector using `[2, 1, 0, 3]` ordering                                                            |
| `kjli`    | `gvec4b -> gvec4b`           | Returns a vector using `[2, 1, 3, 0]` ordering                                                            |
| `klij`    | `gvec4b -> gvec4b`           | Returns a vector using `[2, 3, 0, 1]` ordering                                                            |
| `klji`    | `gvec4b -> gvec4b`           | Returns a vector using `[2, 3, 1, 0]` ordering                                                            |
| `lijk`    | `gvec4b -> gvec4b`           | Returns a vector using `[3, 0, 1, 2]` ordering                                                            |
| `likj`    | `gvec4b -> gvec4b`           | Returns a vector using `[3, 0, 2, 1]` ordering                                                            |
| `ljik`    | `gvec4b -> gvec4b`           | Returns a vector using `[3, 1, 0, 2]` ordering                                                            |
| `ljki`    | `gvec4b -> gvec4b`           | Returns a vector using `[3, 1, 2, 0]` ordering                                                            |
| `lkij`    | `gvec4b -> gvec4b`           | Returns a vector using `[3, 2, 0, 1]` ordering                                                            |
| `lkji`    | `gvec4b -> gvec4b`           | Returns a vector using `[3, 2, 1, 0]` ordering                                                            |
| `rgba`    | `gvec4b -> gvec4b`           | Returns the original 4-element vector                                                                     |
| `rgab`    | `gvec4b -> gvec4b`           | Returns a vector using `[0, 1, 3, 2]` ordering                                                            |
| `rbga`    | `gvec4b -> gvec4b`           | Returns a vector using `[0, 2, 1, 3]` ordering                                                            |
| `rbag`    | `gvec4b -> gvec4b`           | Returns a vector using `[0, 2, 3, 1]` ordering                                                            |
| `ragb`    | `gvec4b -> gvec4b`           | Returns a vector using `[0, 3, 1, 2]` ordering                                                            |
| `rabg`    | `gvec4b -> gvec4b`           | Returns a vector using `[0, 3, 2, 1]` ordering                                                            |
| `grba`    | `gvec4b -> gvec4b`           | Returns a vector using `[1, 0, 2, 3]` ordering                                                            |
| `grab`    | `gvec4b -> gvec4b`           | Returns a vector using `[1, 0, 3, 2]` ordering                                                            |
| `gbra`    | `gvec4b -> gvec4b`           | Returns a vector using `[1, 2, 0, 3]` ordering                                                            |
| `gbar`    | `gvec4b -> gvec4b`           | Returns a vector using `[1, 2, 3, 0]` ordering                                                            |
| `garb`    | `gvec4b -> gvec4b`           | Returns a vector using `[1, 3, 0, 2]` ordering                                                            |
| `gabr`    | `gvec4b -> gvec4b`           | Returns a vector using `[1, 3, 2, 0]` ordering                                                            |
| `brga`    | `gvec4b -> gvec4b`           | Returns a vector using `[2, 0, 1, 3]` ordering                                                            |
| `brag`    | `gvec4b -> gvec4b`           | Returns a vector using `[2, 0, 3, 1]` ordering                                                            |
| `bgra`    | `gvec4b -> gvec4b`           | Returns a vector using `[2, 1, 0, 3]` ordering                                                            |
| `bgar`    | `gvec4b -> gvec4b`           | Returns a vector using `[2, 1, 3, 0]` ordering                                                            |
| `barg`    | `gvec4b -> gvec4b`           | Returns a vector using `[2, 3, 0, 1]` ordering                                                            |
| `bagr`    | `gvec4b -> gvec4b`           | Returns a vector using `[2, 3, 1, 0]` ordering                                                            |
| `argb`    | `gvec4b -> gvec4b`           | Returns a vector using `[3, 0, 1, 2]` ordering                                                            |
| `arbg`    | `gvec4b -> gvec4b`           | Returns a vector using `[3, 0, 2, 1]` ordering                                                            |
| `agrb`    | `gvec4b -> gvec4b`           | Returns a vector using `[3, 1, 0, 2]` ordering                                                            |
| `agbr`    | `gvec4b -> gvec4b`           | Returns a vector using `[3, 1, 2, 0]` ordering                                                            |
| `abrg`    | `gvec4b -> gvec4b`           | Returns a vector using `[3, 2, 0, 1]` ordering                                                            |
| `abgr`    | `gvec4b -> gvec4b`           | Returns a vector using `[3, 2, 1, 0]` ordering                                                            |
| `get`     | `(GBuffer, gu32) -> gi32`    | Returns a value from the GPU buffer as a `gi32`                                                           |
| `get`     | `(GBuffer, gi32) -> gi32`    | Returns a value from the GPU buffer as a `gi32`                                                           |
| `get`     | `(GBuffer, i64) -> gi32`     | Returns a value from the GPU buffer as a `gi32`                                                           |
| `store`   | `(gi32, gi32) -> gi32`       | Replaces the first value with the second value                                                            |

### GPGPU Math functions

| Name                  | Type                                 | Description                                                                                                                                            |
| :-------------------- | :----------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gneg{I}`             | `I -> I`                             | Manually constructs a negation of the provided variable. You probably won't use this directly                                                          |
| `neg`                 | `gi32 -> gi32`                       | Negates the `gi32`                                                                                                                                     |
| `neg`                 | `gf32 -> gf32`                       | Negates the `gf32`                                                                                                                                     |
| `neg`                 | `gvec2i -> gvec2i`                   | Negates each element of the `gvec2i`                                                                                                                   |
| `neg`                 | `gvec2f -> gvec2f`                   | Negates each element of the `gvec2f`                                                                                                                   |
| `neg`                 | `gvec3i -> gvec3i`                   | Negates each element of the `gvec3i`                                                                                                                   |
| `neg`                 | `gvec3f -> gvec3f`                   | Negates each element of the `gvec3f`                                                                                                                   |
| `neg`                 | `gvec4i -> gvec4i`                   | Negates each element of the `gvec4i`                                                                                                                   |
| `neg`                 | `gvec4f -> gvec4f`                   | Negates each element of the `gvec4f`                                                                                                                   |
| `gabs{I}`             | `I -> I`                             | Manually constructs an absolute value of the provided variable. You probably won't use this directly                                                   |
| `abs`                 | `gi32 -> gi32`                       | Computes the absolute value of the `gi32`                                                                                                              |
| `abs`                 | `gf32 -> gf32`                       | Computes the absolute value of the `gf32`                                                                                                              |
| `abs`                 | `gvec2i -> gvec2i`                   | Computes the absolute value of each element of the `gvec2i`                                                                                            |
| `abs`                 | `gvec2f -> gvec2f`                   | Computes the absolute value of each element of the `gvec2f`                                                                                            |
| `abs`                 | `gvec3i -> gvec3i`                   | Computes the absolute value of each element of the `gvec3i`                                                                                            |
| `abs`                 | `gvec3f -> gvec3f`                   | Computes the absolute value of each element of the `gvec3f`                                                                                            |
| `abs`                 | `gvec4i -> gvec4i`                   | Computes the absolute value of each element of the `gvec4i`                                                                                            |
| `abs`                 | `gvec4f -> gvec4f`                   | Computes the absolute value of each element of the `gvec4f`                                                                                            |
| `gclz{I}`             | `I -> I`                             | Manually constructs a count-leading-zeroes call on the provided variable. You probably won't use this directly                                         |
| `clz`                 | `gi32 -> gi32`                       | Computes the leading zeroes of the `gi32`                                                                                                              |
| `clz`                 | `gu32 -> gu32`                       | Computes the leading zeroes of the `gu32`                                                                                                              |
| `clz`                 | `gvec2i -> gvec2i`                   | Computes the leading zeroes of each element of the `gvec2i`                                                                                            |
| `clz`                 | `gvec2u -> gvec2u`                   | Computes the leading zeroes of each element of the `gvec2u`                                                                                            |
| `clz`                 | `gvec3i -> gvec3i`                   | Computes the leading zeroes of each element of the `gvec3i`                                                                                            |
| `clz`                 | `gvec3u -> gvec3u`                   | Computes the leading zeroes of each element of the `gvec3u`                                                                                            |
| `clz`                 | `gvec4i -> gvec4i`                   | Computes the leading zeroes of each element of the `gvec4i`                                                                                            |
| `clz`                 | `gvec4u -> gvec4u`                   | Computes the leading zeroes of each element of the `gvec4u`                                                                                            |
| `gones{I}`            | `I -> I`                             | Manually constructs a count-one-bits call on the provided variable. You probably won't use this directly                                               |
| `ones`                | `gi32 -> gi32`                       | Computes the count of one bits of the `gi32`                                                                                                           |
| `ones`                | `gu32 -> gu32`                       | Computes the count of one bits of the `gu32`                                                                                                           |
| `ones`                | `gvec2i -> gvec2i`                   | Computes the count of one bits of each element of the `gvec2i`                                                                                         |
| `ones`                | `gvec2u -> gvec2u`                   | Computes the count of one bits of each element of the `gvec2u`                                                                                         |
| `ones`                | `gvec3i -> gvec3i`                   | Computes the count of one bits of each element of the `gvec3i`                                                                                         |
| `ones`                | `gvec3u -> gvec3u`                   | Computes the count of one bits of each element of the `gvec3u`                                                                                         |
| `ones`                | `gvec4i -> gvec4i`                   | Computes the count of one bits of each element of the `gvec4i`                                                                                         |
| `ones`                | `gvec4u -> gvec4u`                   | Computes the count of one bits of each element of the `gvec4u`                                                                                         |
| `gctz{I}`             | `I -> I`                             | Manually constructs a count-trailing-zeroes call on the provided variable. You probably won't use this directly                                        |
| `ctz`                 | `gi32 -> gi32`                       | Computes the trailing zeroes of the `gi32`                                                                                                             |
| `ctz`                 | `gu32 -> gu32`                       | Computes the trailing zeroes of the `gu32`                                                                                                             |
| `ctz`                 | `gvec2i -> gvec2i`                   | Computes the trailing zeroes of each element of the `gvec2i`                                                                                           |
| `ctz`                 | `gvec2u -> gvec2u`                   | Computes the trailing zeroes of each element of the `gvec2u`                                                                                           |
| `ctz`                 | `gvec3i -> gvec3i`                   | Computes the trailing zeroes of each element of the `gvec3i`                                                                                           |
| `ctz`                 | `gvec3u -> gvec3u`                   | Computes the trailing zeroes of each element of the `gvec3u`                                                                                           |
| `ctz`                 | `gvec4i -> gvec4i`                   | Computes the trailing zeroes of each element of the `gvec4i`                                                                                           |
| `ctz`                 | `gvec4u -> gvec4u`                   | Computes the trailing zeroes of each element of the `gvec4u`                                                                                           |
| `gReverseBits{I}`     | `I -> I`                             | Manually constructs a reverse-bits call on the provided variable. You probably won't use this directly                                                 |
| `reverseBits`         | `gi32 -> gi32`                       | Reverses the bits of the `gi32`                                                                                                                        |
| `reverseBits`         | `gu32 -> gu32`                       | Reverses the bits of the `gu32`                                                                                                                        |
| `reverseBits`         | `gvec2i -> gvec2i`                   | Reverses the bits of each element of the `gvec2i`                                                                                                      |
| `reverseBits`         | `gvec2u -> gvec2u`                   | Reverses the bits of each element of the `gvec2u`                                                                                                      |
| `reverseBits`         | `gvec3i -> gvec3i`                   | Reverses the bits of each element of the `gvec3i`                                                                                                      |
| `reverseBits`         | `gvec3u -> gvec3u`                   | Reverses the bits of each element of the `gvec3u`                                                                                                      |
| `reverseBits`         | `gvec4i -> gvec4i`                   | Reverses the bits of each element of the `gvec4i`                                                                                                      |
| `reverseBits`         | `gvec4u -> gvec4u`                   | Reverses the bits of each element of the `gvec4u`                                                                                                      |
| `gExtractBits{I}`     | `(I, gu32, gu32) -> I`               | Manually constructs an extract-bits call on the provided variable. You probably won't use this directly                                                |
| `extractBits{A, B}`   | `(gu32, A, B) -> gu32`               | Extracts the bits from the `gu32`                                                                                                                      |
| `extractBits{A, B}`   | `(gvec2u, A, B) -> gvec2u`           | Extracts the bits from each element of the `gvec2u`                                                                                                    |
| `extractBits{A, B}`   | `(gvec3u, A, B) -> gvec3u`           | Extracts the bits from each element of the `gvec3u`                                                                                                    |
| `extractBits{A, B}`   | `(gvec4u, A, B) -> gvec4u`           | Extracts the bits from each element of the `gvec4u`                                                                                                    |
| `gInsertBits{I}`      | `(I, I, `gu32`, gu32`) -> I`         | Manually constructs an insert-bits call on the provided variable. You probably won't use this directly                                                 |
| `insertBits{A, B, C}` | `(gu32, A, B, C) -> gu32`            | Inserts `C` number of bits in `A` at offset `B` into the `gu32`                                                                                        |
| `insertBits{A, B, C}` | `(gi32, A, B, C) -> gi32`            | Inserts `C` number of bits in `A` at offset `B` into the `gi32`                                                                                        |
| `insertBits{A, B, C}` | `(gvec2u, A, B, C) -> gvec2u`        | Inserts `C` number of bits in `A` at offset `B` into the `gvec2u`                                                                                      |
| `insertBits{A, B, C}` | `(gvec2i, A, B, C) -> gvec2i`        | Inserts `C` number of bits in `A` at offset `B` into the `gvec2i`                                                                                      |
| `insertBits{A, B, C}` | `(gvec3u, A, B, C) -> gvec3u`        | Inserts `C` number of bits in `A` at offset `B` into the `gvec3u`                                                                                      |
| `insertBits{A, B, C}` | `(gvec3i, A, B, C) -> gvec3i`        | Inserts `C` number of bits in `A` at offset `B` into the `gvec3i`                                                                                      |
| `insertBits{A, B, C}` | `(gvec4u, A, B, C) -> gvec4u`        | Inserts `C` number of bits in `A` at offset `B` into the `gvec4u`                                                                                      |
| `insertBits{A, B, C}` | `(gvec4i, A, B, C) -> gvec4i`        | Inserts `C` number of bits in `A` at offset `B` into the `gvec4i`                                                                                      |
| `cross`               | `(gvec3f, gvec3f) -> gvec3f`         | Computes the cross product of two 3-element floating point vectors                                                                                     |
| `gTranspose{I, O}`    | `I -> O`                             | Manually constructs a matrix transpose call on the provided variable. You probably won't use this directly                                             |
| `transpose`           | `gmat2x2f -> gmat2x2f`               | Transposes a 2x2 matrix into a 2x2 matrix                                                                                                              |
| `transpose`           | `gmat2x3f -> gmat3x2f`               | Transposes a 2x3 matrix into a 3x2 matrix                                                                                                              |
| `transpose`           | `gmat2x4f -> gmat4x2f`               | Transposes a 2x4 matrix into a 4x2 matrix                                                                                                              |
| `transpose`           | `gmat3x2f -> gmat2x3f`               | Transposes a 3x2 matrix into a 2x3 matrix                                                                                                              |
| `transpose`           | `gmat3x3f -> gmat3x3f`               | Transposes a 3x3 matrix into a 3x3 matrix                                                                                                              |
| `transpose`           | `gmat3x4f -> gmat4x3f`               | Transposes a 3x4 matrix into a 4x3 matrix                                                                                                              |
| `transpose`           | `gmat4x2f -> gmat2x4f`               | Transposes a 4x2 matrix into a 2x4 matrix                                                                                                              |
| `transpose`           | `gmat4x3f -> gmat3x4f`               | Transposes a 4x3 matrix into a 3x4 matrix                                                                                                              |
| `transpose`           | `gmat4x4f -> gmat4x4f`               | Transposes a 4x4 matrix into a 4x4 matrix                                                                                                              |
| `gdot{I, O}`          | `(I, I) -> O`                        | Manually constructs a vector dot product on the provided variables. You probably won't use this directly                                               |
| `dot`                 | `(gvec2f, gvec2f) -> gf32`           | Computes the dot product of two 2-element `f32` vectors                                                                                                |
| `dot`                 | `(gvec3f, gvec3f) -> gf32`           | Computes the dot product of two 3-element `f32` vectors                                                                                                |
| `dot`                 | `(gvec4f, gvec4f) -> gf32`           | Computes the dot product of two 4-element `f32` vectors                                                                                                |
| `dot`                 | `(gvec2u, gvec2u) -> gu32`           | Computes the dot product of two 2-element `u32` vectors                                                                                                |
| `dot`                 | `(gvec3u, gvec3u) -> gu32`           | Computes the dot product of two 3-element `u32` vectors                                                                                                |
| `dot`                 | `(gvec4u, gvec4u) -> gu32`           | Computes the dot product of two 4-element `u32` vectors                                                                                                |
| `dot`                 | `(gvec2i, gvec2i) -> gi32`           | Computes the dot product of two 2-element `i32` vectors                                                                                                |
| `dot`                 | `(gvec3i, gvec3i) -> gi32`           | Computes the dot product of two 3-element `i32` vectors                                                                                                |
| `dot`                 | `(gvec4i, gvec4i) -> gi32`           | Computes the dot product of two 4-element `i32` vectors                                                                                                |
| `gMagnitude{I}`       | `I -> gf32`                          | Manually constructs a magnitude call on the provided variable. You probably won't use this directly                                                    |
| `magnitude`           | `gf32 -> gf32`                       | Computes the magnitude of an `f32` (essentially the same as an absolute value call)                                                                    |
| `magnitude`           | `gvec2f -> gf32`                     | Computes the magnitude of a 2-element vector                                                                                                           |
| `magnitude`           | `gvec3f -> gf32`                     | Computes the magnitude of a 3-element vector                                                                                                           |
| `magnitude`           | `gvec4f -> gf32`                     | Computes the magnitude of a 4-element vector                                                                                                           |
| `gInverseSqrt{I}`     | `I -> I`                             | Manually constructs an inverse square root call on the provided variable. You probably won't use this directly                                         |
| `inverseSqrt`         | `gf32 -> gf32`                       | Computes the inverse square root of an `f32`                                                                                                           |
| `inverseSqrt`         | `gvec2f -> gvec2f`                   | Computes the inverse square root on each element of a 2-element vector                                                                                 |
| `inverseSqrt`         | `gvec3f -> gvec3f`                   | Computes the inverse square root on each element of a 3-element vector                                                                                 |
| `inverseSqrt`         | `gvec4f -> gvec4f`                   | Computes the inverse square root on each element of a 4-element vector                                                                                 |
| `gNormalize{I}`       | `I -> I`                             | Manually constructs a normalize call on the provided variable. You probably won't use this directly                                                    |
| `normalize`           | `gvec2f -> gvec2f`                   | Normalizes the 2-element vector                                                                                                                        |
| `normalize`           | `gvec3f -> gvec3f`                   | Normalizes the 3-element vector                                                                                                                        |
| `normalize`           | `gvec4f -> gvec4f`                   | Normalizes the 4-element vector                                                                                                                        |
| `gRound{I}`           | `I -> I`                             | Manually constructs a round call on the provided variable. You probably won't use this directly                                                        |
| `round`               | `gf32 -> gf32`                       | Rounds the `f32` (ties break even)                                                                                                                     |
| `round`               | `gvec2f -> gvec2f`                   | Rounds each element of a 2-element vector                                                                                                              |
| `round`               | `gvec3f -> gvec3f`                   | Rounds each element of a 3-element vector                                                                                                              |
| `round`               | `gvec4f -> gvec4f`                   | Rounds each element of a 4-element vector                                                                                                              |
| `gFma{I}`             | `(I, I, I) -> I`                     | Manually constructs a fused multiply add call on the provided variable. You probably won't use this directly                                           |
| `fma`                 | `(gf32, gf32, gf32) -> gf32`         | Computes a fused multiply add on the provided `f32` values                                                                                             |
| `fma`                 | `(gvec2f, gvec2f, gvec2f) -> gvec2f` | Computes a fused multiply add piecewise on the provided 2-element vectors                                                                              |
| `fma`                 | `(gvec3f, gvec3f, gvec3f) -> gvec3f` | Computes a fused multiply add piecewise on the provided 3-element vectors                                                                              |
| `fma`                 | `(gvec4f, gvec4f, gvec4f) -> gvec4f` | Computes a fused multiply add piecewise on the provided 4-element vectors                                                                              |
| `gFract{I}`           | `I -> I`                             | Manually constructs a fractional call on the provided values. You probably won't use this directly                                                     |
| `fract`               | `gf32 -> gf32`                       | Returns the fractional portion of the `f32` value                                                                                                      |
| `fract`               | `gvec2f -> gvec2f`                   | Returns the fractional portion of the 2-element vector piecewise                                                                                       |
| `fract`               | `gvec3f -> gvec3f`                   | Returns the fractional portion of the 3-element vector piecewise                                                                                       |
| `fract`               | `gvec4f -> gvec4f`                   | Returns the fractional portion of the 4-element vector piecewise                                                                                       |
| `gDeterminant{I}`     | `I -> gf32`                          | Manually constructs a determinant call on the provided values. You probably won't use this directly                                                    |
| `determinant`         | `gmat2x2f -> gf32`                   | Returns the determinant of a 2x2 matrix                                                                                                                |
| `determinant`         | `gmat3x3f -> gf32`                   | Returns the determinant of a 3x3 matrix                                                                                                                |
| `determinant`         | `gmat4x4f -> gf32`                   | Returns the determinant of a 4x4 matrix                                                                                                                |
| `gadd{A, B}`          | `(A, B) -> A`                        | Manually constructs an addition operation on the provided values. You probably won't use this directly                                                 |
| `add`                 | `(gu32, gu32) -> gu32`               | Returns the addition of two `gu32` values                                                                                                              |
| `add{T}`              | `(gu32, T) -> gu32`                  | Casts the second value to `gu32` and adds it to the first                                                                                              |
| `add{T}`              | `(T, gu32) -> gu32`                  | Casts the first value to `gu32` and adds it to the first                                                                                               |
| `add`                 | `(gi32, gi32) -> gi32`               | Returns the addition of two `gi32` values                                                                                                              |
| `add{T}`              | `(gi32, T) -> gi32`                  | Casts the second value to `gi32` and adds it to the first                                                                                              |
| `add{T}`              | `(T, gi32) -> gi32`                  | Casts the first value to `gi32` and adds it to the first                                                                                               |
| `add`                 | `(gf32, gf32) -> gf32`               | Returns the addition of two `gf32` values                                                                                                              |
| `add{T}`              | `(gf32, T) -> gf32`                  | Casts the second value to `gf32` and adds it to the first                                                                                              |
| `add{T}`              | `(T, gf32) -> gf32`                  | Casts the first value to `gf32` and adds it to the first                                                                                               |
| `add`                 | `(gvec2u, gvec2u) -> gvec2u`         | Piecewise adds the two vectors together                                                                                                                |
| `add`                 | `(gvec2u, gu32) -> gvec2u`           | Adds the `gu32` to each element of the vector                                                                                                          |
| `add`                 | `(gu32, gvec2u) -> gvec2u`           | Adds the `gu32` to each element of the vector                                                                                                          |
| `add`                 | `(gvec2i, gvec2i) -> gvec2i`         | Piecewise adds the two vectors together                                                                                                                |
| `add`                 | `(gvec2i, gi32) -> gvec2i`           | Adds the `gi32` to each element of the vector                                                                                                          |
| `add`                 | `(gi32, gvec2i) -> gvec2i`           | Adds the `gi32` to each element of the vector                                                                                                          |
| `add`                 | `(gvec2f, gvec2f) -> gvec2f`         | Piecewise adds the two vectors together                                                                                                                |
| `add`                 | `(gvec2f, gf32) -> gvec2f`           | Adds the `gf32` to each element of the vector                                                                                                          |
| `add`                 | `(gf32, gvec2f) -> gvec2f`           | Adds the `gf32` to each element of the vector                                                                                                          |
| `add`                 | `(gvec3u, gvec3u) -> gvec3u`         | Piecewise adds the two vectors together                                                                                                                |
| `add`                 | `(gvec3u, gu32) -> gvec3u`           | Adds the `gu32` to each element of the vector                                                                                                          |
| `add`                 | `(gu32, gvec3u) -> gvec3u`           | Adds the `gu32` to each element of the vector                                                                                                          |
| `add`                 | `(gvec3i, gvec3i) -> gvec3i`         | Piecewise adds the two vectors together                                                                                                                |
| `add`                 | `(gvec3i, gi32) -> gvec3i`           | Adds the `gi32` to each element of the vector                                                                                                          |
| `add`                 | `(gi32, gvec3i) -> gvec3i`           | Adds the `gi32` to each element of the vector                                                                                                          |
| `add`                 | `(gvec3f, gvec3f) -> gvec3f`         | Piecewise adds the two vectors together                                                                                                                |
| `add`                 | `(gvec3f, gf32) -> gvec3f`           | Adds the `gf32` to each element of the vector                                                                                                          |
| `add`                 | `(gf32, gvec3f) -> gvec3f`           | Adds the `gf32` to each element of the vector                                                                                                          |
| `add`                 | `(gvec4u, gvec4u) -> gvec4u`         | Piecewise adds the two vectors together                                                                                                                |
| `add`                 | `(gvec4u, gu32) -> gvec4u`           | Adds the `gu32` to each element of the vector                                                                                                          |
| `add`                 | `(gu32, gvec4u) -> gvec4u`           | Adds the `gu32` to each element of the vector                                                                                                          |
| `add`                 | `(gvec4i, gvec4i) -> gvec4i`         | Piecewise adds the two vectors together                                                                                                                |
| `add`                 | `(gvec4i, gi32) -> gvec4i`           | Adds the `gi32` to each element of the vector                                                                                                          |
| `add`                 | `(gi32, gvec4i) -> gvec4i`           | Adds the `gi32` to each element of the vector                                                                                                          |
| `add`                 | `(gvec4f, gvec4f) -> gvec4f`         | Piecewise adds the two vectors together                                                                                                                |
| `add`                 | `(gvec4f, gf32) -> gvec4f`           | Adds the `gf32` to each element of the vector                                                                                                          |
| `add`                 | `(gf32, gvec4f) -> gvec4f`           | Adds the `gf32` to each element of the vector                                                                                                          |
| `add`                 | `(gmat2x2f, gmat2x2f) -> gmat2x2f`   | Piecewise adds the two matrices together                                                                                                               |
| `add`                 | `(gmat2x3f, gmat2x3f) -> gmat2x3f`   | Piecewise adds the two matrices together                                                                                                               |
| `add`                 | `(gmat2x4f, gmat2x4f) -> gmat2x4f`   | Piecewise adds the two matrices together                                                                                                               |
| `add`                 | `(gmat3x2f, gmat3x2f) -> gmat3x2f`   | Piecewise adds the two matrices together                                                                                                               |
| `add`                 | `(gmat3x3f, gmat3x3f) -> gmat3x3f`   | Piecewise adds the two matrices together                                                                                                               |
| `add`                 | `(gmat3x4f, gmat3x4f) -> gmat3x4f`   | Piecewise adds the two matrices together                                                                                                               |
| `add`                 | `(gmat4x2f, gmat4x2f) -> gmat4x2f`   | Piecewise adds the two matrices together                                                                                                               |
| `add`                 | `(gmat4x3f, gmat4x3f) -> gmat4x3f`   | Piecewise adds the two matrices together                                                                                                               |
| `add`                 | `(gmat4x4f, gmat4x4f) -> gmat4x4f`   | Piecewise adds the two matrices together                                                                                                               |
| `gSub{A, B}`          | `(A, B) -> A`                        | Manually constructs a subtraction operation on the provided values, producing the first type as output. You probably won't use this directly           |
| `gSubRev{A, B}`       | `(A, B) -> B`                        | Manually constructs a subtraction operation on the provided values, producing the second type as output. You probably won't use this directly          |
| `sub`                 | `(gu32, gu32) -> gu32`               | Subtracts the `gu32` from each other                                                                                                                   |
| `sub{T}`              | `(gu32, T) -> gu32`                  | Casts the second value to `gu32` and subtracts it from the first                                                                                       |
| `sub{T}`              | `(T, gu32) -> gu32`                  | Casts the first value to `gu32` and subtracts the second from it                                                                                       |
| `sub`                 | `(gi32, gi32) -> gi32`               | Subtracts the `gi32` from each other                                                                                                                   |
| `sub{T}`              | `(gi32, T) -> gi32`                  | Casts the second value to `gi32` and subtracts it from the first                                                                                       |
| `sub{T}`              | `(T, gi32) -> gi32`                  | Casts the first value to `gi32` and subtracts the second from it                                                                                       |
| `sub`                 | `(gf32, gf32) -> gf32`               | Subtracts the `gf32` from each other                                                                                                                   |
| `sub{T}`              | `(gf32, T) -> gf32`                  | Casts the second value to `gf32` and subtracts it from the first                                                                                       |
| `sub{T}`              | `(T, gf32) -> gf32`                  | Casts the first value to `gf32` and subtracts the second from it                                                                                       |
| `sub`                 | `(gvec2u, gvec2u) -> gvec2u`         | Piecewise subtracts the elements of the two vectors                                                                                                    |
| `sub`                 | `(gvec2u, gu32) -> gvec2u`           | Subtracts the `gu32` from each element of the vector                                                                                                   |
| `sub`                 | `(gu32, gvec2u) -> gvec2u`           | Subtracts each element of the vector from the `gu32`                                                                                                   |
| `sub`                 | `(gvec2i, gvec2i) -> gvec2i`         | Piecewise subtracts the elements of the two vectors                                                                                                    |
| `sub`                 | `(gvec2i, gi32) -> gvec2i`           | Subtracts the `gi32` from each element of the vector                                                                                                   |
| `sub`                 | `(gi32, gvec2i) -> gvec2i`           | Subtracts each element of the vector from the `gi32`                                                                                                   |
| `sub`                 | `(gvec2f, gvec2f) -> gvec2f`         | Piecewise subtracts the elements of the two vectors                                                                                                    |
| `sub`                 | `(gvec2f, gf32) -> gvec2f`           | Subtracts the `gf32` from each element of the vector                                                                                                   |
| `sub`                 | `(gf32, gvec2f) -> gvec2f`           | Subtracts each element of the vector from the `gf32`                                                                                                   |
| `sub`                 | `(gvec3u, gvec3u) -> gvec3u`         | Piecewise subtracts the elements of the two vectors                                                                                                    |
| `sub`                 | `(gvec3u, gu32) -> gvec3u`           | Subtracts the `gu32` from each element of the vector                                                                                                   |
| `sub`                 | `(gu32, gvec3u) -> gvec3u`           | Subtracts each element of the vector from the `gu32`                                                                                                   |
| `sub`                 | `(gvec3i, gvec3i) -> gvec3i`         | Piecewise subtracts the elements of the two vectors                                                                                                    |
| `sub`                 | `(gvec3i, gi32) -> gvec3i`           | Subtracts the `gi32` from each element of the vector                                                                                                   |
| `sub`                 | `(gi32, gvec3i) -> gvec3i`           | Subtracts each element of the vector from the `gi32`                                                                                                   |
| `sub`                 | `(gvec3f, gvec3f) -> gvec3f`         | Piecewise subtracts the elements of the two vectors                                                                                                    |
| `sub`                 | `(gvec3f, gf32) -> gvec3f`           | Subtracts the `gf32` from each element of the vector                                                                                                   |
| `sub`                 | `(gf32, gvec3f) -> gvec3f`           | Subtracts each element of the vector from the `gf32`                                                                                                   |
| `sub`                 | `(gvec4u, gvec4u) -> gvec4u`         | Piecewise subtracts the elements of the two vectors                                                                                                    |
| `sub`                 | `(gvec4u, gu32) -> gvec4u`           | Subtracts the `gu32` from each element of the vector                                                                                                   |
| `sub`                 | `(gu32, gvec4u) -> gvec4u`           | Subtracts each element of the vector from the `gu32`                                                                                                   |
| `sub`                 | `(gvec4i, gvec4i) -> gvec4i`         | Piecewise subtracts the elements of the two vectors                                                                                                    |
| `sub`                 | `(gvec4i, gi32) -> gvec4i`           | Subtracts the `gi32` from each element of the vector                                                                                                   |
| `sub`                 | `(gi32, gvec4i) -> gvec4i`           | Subtracts each element of the vector from the `gi32`                                                                                                   |
| `sub`                 | `(gvec4f, gvec4f) -> gvec4f`         | Piecewise subtracts the elements of the two vectors                                                                                                    |
| `sub`                 | `(gvec4f, gf32) -> gvec4f`           | Subtracts the `gf32` from each element of the vector                                                                                                   |
| `sub`                 | `(gf32, gvec4f) -> gvec4f`           | Subtracts each element of the vector from the `gf32`                                                                                                   |
| `sub`                 | `(gmat2x2f, gmat2x2f) -> gmat2x2f`   | Piecewise subtracts the two matrices together                                                                                                          |
| `sub`                 | `(gmat2x3f, gmat2x3f) -> gmat2x3f`   | Piecewise subtracts the two matrices together                                                                                                          |
| `sub`                 | `(gmat2x4f, gmat2x4f) -> gmat2x4f`   | Piecewise subtracts the two matrices together                                                                                                          |
| `sub`                 | `(gmat3x2f, gmat3x2f) -> gmat3x2f`   | Piecewise subtracts the two matrices together                                                                                                          |
| `sub`                 | `(gmat3x3f, gmat3x3f) -> gmat3x3f`   | Piecewise subtracts the two matrices together                                                                                                          |
| `sub`                 | `(gmat3x4f, gmat3x4f) -> gmat3x4f`   | Piecewise subtracts the two matrices together                                                                                                          |
| `sub`                 | `(gmat4x2f, gmat4x2f) -> gmat4x2f`   | Piecewise subtracts the two matrices together                                                                                                          |
| `sub`                 | `(gmat4x3f, gmat4x3f) -> gmat4x3f`   | Piecewise subtracts the two matrices together                                                                                                          |
| `sub`                 | `(gmat4x4f, gmat4x4f) -> gmat4x4f`   | Piecewise subtracts the two matrices together                                                                                                          |
| `gmul{A, B, C}`       | `(A, B) -> C`                        | Manually constructs a multiplication operation on the provided values. You probably won't use this directly                                            |
| `gmul{A, B}`          | `(A, B) -> A`                        | Manually constructs a multiplication operation on the provided values, producing the first type as output. You probably won't use this directly        |
| `mul`                 | `(gu32, gu32) -> gu32`               | Multiplies the `gu32` values together                                                                                                                  |
| `mul{T}`              | `(gu32, T) -> gu32`                  | Casts the second value to `gu32` and multiplies it to the first                                                                                        |
| `mul{T}`              | `(T, gu32) -> gu32`                  | Casts the first value to `gu32` and multiplies it to the second                                                                                        |
| `mul`                 | `(gi32, gi32) -> gi32`               | Multiplies the `gi32` values together                                                                                                                  |
| `mul{T}`              | `(gi32, T) -> gi32`                  | Casts the second value to `gi32` and multiplies it to the first                                                                                        |
| `mul{T}`              | `(T, gi32) -> gi32`                  | Casts the first value to `gi32` and multiplies it to the second                                                                                        |
| `mul`                 | `(gf32, gf32) -> gf32`               | Multiplies the `gf32` values together                                                                                                                  |
| `mul{T}`              | `(gf32, T) -> gf32`                  | Casts the second value to `gf32` and multiplies it to the first                                                                                        |
| `mul{T}`              | `(T, gf32) -> gf32`                  | Casts the first value to `gf32` and multiplies it to the second                                                                                        |
| `mul`                 | `(gvec2u, gvec2u) -> gvec2u`         | Piecewise multiplies the two vectors together                                                                                                          |
| `mul`                 | `(gvec2u, gu32) -> gvec2u`           | Multiplies the `gu32` to each element of the vector                                                                                                    |
| `mul`                 | `(gu32, gvec2u) -> gvec2u`           | Multiplies the `gu32` to each element of the vector                                                                                                    |
| `mul`                 | `(gvec2i, gvec2i) -> gvec2i`         | Piecewise multiplies the two vectors together                                                                                                          |
| `mul`                 | `(gvec2i, gi32) -> gvec2i`           | Multiplies the `gi32` to each element of the vector                                                                                                    |
| `mul`                 | `(gi32, gvec2i) -> gvec2i`           | Multiplies the `gi32` to each element of the vector                                                                                                    |
| `mul`                 | `(gvec2f, gvec2f) -> gvec2f`         | Piecewise multiplies the two vectors together                                                                                                          |
| `mul`                 | `(gvec2f, gf32) -> gvec2f`           | Multiplies the `gf32` to each element of the vector                                                                                                    |
| `mul`                 | `(gf32, gvec2f) -> gvec2f`           | Multiplies the `gf32` to each element of the vector                                                                                                    |
| `mul`                 | `(gvec3u, gvec3u) -> gvec3u`         | Piecewise multiplies the two vectors together                                                                                                          |
| `mul`                 | `(gvec3u, gu32) -> gvec3u`           | Multiplies the `gu32` to each element of the vector                                                                                                    |
| `mul`                 | `(gu32, gvec3u) -> gvec3u`           | Multiplies the `gu32` to each element of the vector                                                                                                    |
| `mul`                 | `(gvec3i, gvec3i) -> gvec3i`         | Piecewise multiplies the two vectors together                                                                                                          |
| `mul`                 | `(gvec3i, gi32) -> gvec3i`           | Multiplies the `gi32` to each element of the vector                                                                                                    |
| `mul`                 | `(gi32, gvec3i) -> gvec3i`           | Multiplies the `gi32` to each element of the vector                                                                                                    |
| `mul`                 | `(gvec3f, gvec3f) -> gvec3f`         | Piecewise multiplies the two vectors together                                                                                                          |
| `mul`                 | `(gvec3f, gf32) -> gvec3f`           | Multiplies the `gf32` to each element of the vector                                                                                                    |
| `mul`                 | `(gf32, gvec3f) -> gvec3f`           | Multiplies the `gf32` to each element of the vector                                                                                                    |
| `mul`                 | `(gvec4u, gvec4u) -> gvec4u`         | Piecewise multiplies the two vectors together                                                                                                          |
| `mul`                 | `(gvec4u, gu32) -> gvec4u`           | Multiplies the `gu32` to each element of the vector                                                                                                    |
| `mul`                 | `(gu32, gvec4u) -> gvec4u`           | Multiplies the `gu32` to each element of the vector                                                                                                    |
| `mul`                 | `(gvec4i, gvec4i) -> gvec4i`         | Piecewise multiplies the two vectors together                                                                                                          |
| `mul`                 | `(gvec4i, gi32) -> gvec4i`           | Multiplies the `gi32` to each element of the vector                                                                                                    |
| `mul`                 | `(gi32, gvec4i) -> gvec4i`           | Multiplies the `gi32` to each element of the vector                                                                                                    |
| `mul`                 | `(gvec4f, gvec4f) -> gvec4f`         | Piecewise multiplies the two vectors together                                                                                                          |
| `mul`                 | `(gvec4f, gf32) -> gvec4f`           | Multiplies the `gf32` to each element of the vector                                                                                                    |
| `mul`                 | `(gf32, gvec4f) -> gvec4f`           | Multiplies the `gf32` to each element of the vector                                                                                                    |
| `mul`                 | `(gmat2x2f, gf32) -> gmat2x2f`       | Piecewise multiplies the matrix with the `gf32` value                                                                                                  |
| `mul`                 | `(gf32, gmat2x2f) -> gmat2x2f`       | Piecewise multiplies the matrix with the `gf32` value                                                                                                  |
| `mul`                 | `(gmat2x2f, gvec2f) -> gvec2f`       | Multiplies the 2x2 matrix with the 2-element vector (acting as a 1x2 matrix) to produce a 2-element vector (acting as a 1x2 matrix)                    |
| `mul`                 | `(gvec2f, gmat2x2f) -> gvec2f`       | Multiplies the 2-element vector (acting as a 2x1 matrix) with a 2x2 matrix to produce a 2-element vector (acting as a 2x1 matrix)                      |
| `mul`                 | `(gmat2x2f, gmat2x2f) -> gmat2x2f`   | Multiplies the two 2x2 matrices together                                                                                                               |
| `mul`                 | `(gmat2x2f, gmat3x2f) -> gmat3x2f`   | Multiplies the 2x2 matrix to a 3x2 matrix producing a 3x2 matrix                                                                                       |
| `mul`                 | `(gmat2x2f, gmat4x2f) -> gmat4x2f`   | Multiplies the 2x2 matrix to a 4x2 matrix producing a 4x2 matrix                                                                                       |
| `mul`                 | `(gmat2x3f, gf32) -> gmat2x3f`       | Piecewise multiplies the matrix with the `gf32` value                                                                                                  |
| `mul`                 | `(gf32, gmat2x3f) -> gmat2x3f`       | Piecewise multiplies the matrix with the `gf32` value                                                                                                  |
| `mul`                 | `(gmat2x3f, gvec2f) -> gvec3f`       | Multiplies the 2x3 matrix with the 2-element vector (acting as a 1x2 matrix) to produce a 3-element vector (acting as a 1x3 matrix)                    |
| `mul`                 | `(gvec3f, gmat2x3f) -> gvec2f`       | Multiplies the 3-element vector (acting as a 3x1 matrix) with a 2x3 matrix to produce a 2-element vector (acting as a 2x1 matrix)                      |
| `mul`                 | `(gmat2x3f, gmat2x2f) -> gmat2x3f`   | Multiplies the 2x3 matrix to a 2x2 matrix producing a 2x3 matrix                                                                                       |
| `mul`                 | `(gmat2x3f, gmat3x2f) -> gmat3x3f`   | Multiplies the 2x3 matrix to a 3x2 matrix producing a 3x3 matrix                                                                                       |
| `mul`                 | `(gmat2x3f, gmat4x2f) -> gmat4x3f`   | Multiplies the 2x3 matrix to a 4x2 matrix producing a 4x3 matrix                                                                                       |
| `mul`                 | `(gmat2x4f, gf32) -> gmat2x4f`       | Piecewise multiplies the matrix with the `gf32` value                                                                                                  |
| `mul`                 | `(gf32, gmat2x4f) -> gmat2x4f`       | Piecewise multiplies the matrix with the `gf32` value                                                                                                  |
| `mul`                 | `(gmat2x4f, gvec2f) -> gvec4f`       | Multiplies the 2x4 matrix with the 2-element vector (acting as a 1x2 matrix) to produce a 4-element vector (acting as a 1x4 matrix)                    |
| `mul`                 | `(gvec4f, gmat2x4f) -> gvec2f`       | Multiplies the 4-element vector (acting as a 4x1 matrix) with a 2x4 matrix to produce a 2-element vector (acting as a 2x1 matrix)                      |
| `mul`                 | `(gmat2x4f, gmat2x2f) -> gmat2x4f`   | Multiplies the 2x4 matrix to a 2x2 matrix producing a 2x4 matrix                                                                                       |
| `mul`                 | `(gmat2x4f, gmat3x2f) -> gmat3x4f`   | Multiplies the 2x4 matrix to a 3x2 matrix producing a 3x4 matrix                                                                                       |
| `mul`                 | `(gmat2x4f, gmat4x2f) -> gmat4x4f`   | Multiplies the 2x4 matrix to a 4x2 matrix producing a 4x4 matrix                                                                                       |
| `mul`                 | `(gmat3x2f, gf32) -> gmat3x2f`       | Piecewise multiplies the matrix with the `gf32` value                                                                                                  |
| `mul`                 | `(gf32, gmat3x2f) -> gmat3x2f`       | Piecewise multiplies the matrix with the `gf32` value                                                                                                  |
| `mul`                 | `(gmat3x2f, gvec3f) -> gvec2f`       | Multiplies the 3x2 matrix with the 3-element vector (acting as a 1x3 matrix) to produce a 2-element vector (acting as a 1x2 matrix)                    |
| `mul`                 | `(gvec2f, gmat3x2f) -> gvec3f`       | Multiplies the 2-element vector (acting as a 2x1 matrix) with a 3x2 matrix to produce a 3-element vector (acting as a 3x1 matrix)                      |
| `mul`                 | `(gmat3x2f, gmat2x3f) -> gmat2x2f`   | Multiplies the 3x2 matrix to a 2x3 matrix producing a 2x2 matrix                                                                                       |
| `mul`                 | `(gmat3x2f, gmat3x3f) -> gmat3x2f`   | Multiplies the 3x2 matrix to a 3x3 matrix producing a 3x2 matrix                                                                                       |
| `mul`                 | `(gmat3x2f, gmat4x3f) -> gmat4x2f`   | Multiplies the 3x2 matrix to a 4x3 matrix producing a 4x2 matrix                                                                                       |
| `mul`                 | `(gmat3x3f, gf32) -> gmat3x3f`       | Piecewise multiplies the matrix with the `gf32` value                                                                                                  |
| `mul`                 | `(gf32, gmat3x3f) -> gmat3x3f`       | Piecewise multiplies the matrix with the `gf32` value                                                                                                  |
| `mul`                 | `(gmat3x3f, gvec3f) -> gvec2f`       | Multiplies the 3x3 matrix with the 3-element vector (acting as a 1x3 matrix) to produce a 3-element vector (acting as a 1x3 matrix)                    |
| `mul`                 | `(gvec3f, gmat3x3f) -> gvec3f`       | Multiplies the 3-element vector (acting as a 3x1 matrix) with a 3x3 matrix to produce a 3-element vector (acting as a 3x1 matrix)                      |
| `mul`                 | `(gmat3x3f, gmat2x3f) -> gmat2x3f`   | Multiplies the 3x3 matrix to a 2x3 matrix producing a 2x3 matrix                                                                                       |
| `mul`                 | `(gmat3x3f, gmat3x3f) -> gmat3x3f`   | Multiplies the 3x3 matrices together                                                                                                                   |
| `mul`                 | `(gmat3x3f, gmat4x3f) -> gmat4x3f`   | Multiplies the 3x3 matrix to a 4x3 matrix producing a 4x3 matrix                                                                                       |
| `mul`                 | `(gmat3x4f, gf32) -> gmat3x4f`       | Piecewise multiplies the matrix with the `gf32` value                                                                                                  |
| `mul`                 | `(gf32, gmat3x4f) -> gmat3x4f`       | Piecewise multiplies the matrix with the `gf32` value                                                                                                  |
| `mul`                 | `(gmat3x4f, gvec3f) -> gvec4f`       | Multiplies the 3x4 matrix with the 3-element vector (acting as a 1x3 matrix) to produce a 4-element vector (acting as a 1x4 matrix)                    |
| `mul`                 | `(gvec4f, gmat3x4f) -> gvec3f`       | Multiplies the 4-element vector (acting as a 4x1 matrix) with a 3x4 matrix to produce a 3-element vector (acting as a 3x1 matrix)                      |
| `mul`                 | `(gmat3x4f, gmat2x3f) -> gmat2x4f`   | Multiplies the 3x4 matrix to a 2x3 matrix producing a 2x4 matrix                                                                                       |
| `mul`                 | `(gmat3x4f, gmat3x3f) -> gmat3x4f`   | Multiplies the 3x4 matrix to a 3x3 matrix producing a 3x4 matrix                                                                                       |
| `mul`                 | `(gmat3x4f, gmat4x3f) -> gmat4x4f`   | Multiplies the 3x4 matrix to a 4x3 matrix producing a 4x4 matrix                                                                                       |
| `mul`                 | `(gmat4x2f, gf32) -> gmat4x2f`       | Piecewise multiplies the matrix with the `gf32` value                                                                                                  |
| `mul`                 | `(gf32, gmat4x2f) -> gmat4x2f`       | Piecewise multiplies the matrix with the `gf32` value                                                                                                  |
| `mul`                 | `(gmat4x2f, gvec4f) -> gvec2f`       | Multiplies the 4x2 matrix with the 4-element vector (acting as a 1x4 matrix) to produce a 2-element vector (acting as a 1x2 matrix)                    |
| `mul`                 | `(gvec2f, gmat4x2f) -> gvec4f`       | Multiplies the 2-element vector (acting as a 2x1 matrix) with a 4x2 matrix to produce a 4-element vector (acting as a 4x1 matrix)                      |
| `mul`                 | `(gmat4x2f, gmat2x4f) -> gmat2x2f`   | Multiplies the 4x2 matrix to a 2x4 matrix producing a 2x2 matrix                                                                                       |
| `mul`                 | `(gmat4x2f, gmat3x4f) -> gmat3x2f`   | Multiplies the 4x2 matrix to a 3x4 matrix producing a 3x2 matrix                                                                                       |
| `mul`                 | `(gmat4x2f, gmat4x4f) -> gmat4x2f`   | Multiplies the 4x2 matrix to a 4x4 matrix producing a 4x2 matrix                                                                                       |
| `mul`                 | `(gmat4x3f, gf32) -> gmat4x3f`       | Piecewise multiplies the matrix with the `gf32` value                                                                                                  |
| `mul`                 | `(gf32, gmat4x3f) -> gmat4x3f`       | Piecewise multiplies the matrix with the `gf32` value                                                                                                  |
| `mul`                 | `(gmat4x3f, gvec4f) -> gvec3f`       | Multiplies the 4x3 matrix with the 4-element vector (acting as a 1x4 matrix) to produce a 3-element vector (acting as a 1x3 matrix)                    |
| `mul`                 | `(gvec3f, gmat4x3f) -> gvec4f`       | Multiplies the 3-element vector (acting as a 3x1 matrix) with a 4x3 matrix to produce a 4-element vector (acting as a 4x1 matrix)                      |
| `mul`                 | `(gmat4x3f, gmat2x4f) -> gmat2x3f`   | Multiplies the 4x3 matrix to a 2x4 matrix producing a 2x3 matrix                                                                                       |
| `mul`                 | `(gmat4x3f, gmat3x4f) -> gmat3x3f`   | Multiplies the 4x3 matrix to a 3x4 matrix producing a 3x3 matrix                                                                                       |
| `mul`                 | `(gmat4x3f, gmat4x4f) -> gmat4x3f`   | Multiplies the 4x3 matrix to a 4x4 matrix producing a 4x3 matrix                                                                                       |
| `mul`                 | `(gmat4x4f, gf32) -> gmat4x4f`       | Piecewise multiplies the matrix with the `gf32` value                                                                                                  |
| `mul`                 | `(gf32, gmat4x4f) -> gmat4x4f`       | Piecewise multiplies the matrix with the `gf32` value                                                                                                  |
| `mul`                 | `(gmat4x4f, gvec4f) -> gvec4f`       | Multiplies the 4x4 matrix with the 4-element vector (acting as a 1x4 matrix) to produce a 4-element vector (acting as a 1x4 matrix)                    |
| `mul`                 | `(gvec4f, gmat4x4f) -> gvec4f`       | Multiplies the 4-element vector (acting as a 4x1 matrix) with a 4x4 matrix to produce a 4-element vector (acting as a 4x1 matrix)                      |
| `mul`                 | `(gmat4x4f, gmat2x4f) -> gmat2x4f`   | Multiplies the 4x4 matrix to a 2x4 matrix producing a 2x4 matrix                                                                                       |
| `mul`                 | `(gmat4x4f, gmat3x4f) -> gmat3x4f`   | Multiplies the 4x4 matrix to a 3x4 matrix producing a 3x4 matrix                                                                                       |
| `mul`                 | `(gmat4x4f, gmat4x4f) -> gmat4x4f`   | Multiplies the 4x4 matrices together                                                                                                                   |
| `gDiv{A, B}`          | `(A, B) -> A`                        | Manually constructs a division operation on the provided values, producing the first type as output. You probably won't use this directly              |
| `gDivRev{A, B}`       | `(A, B) -> B`                        | Manually constructs a division operation on the provided values, producing the second type as output. You probably won't use this directly             |
| `div`                 | `(gu32, gu32) -> gu32`               | Divides the `gu32` values                                                                                                                              |
| `div{T}`              | `(gu32, T) -> gu32`                  | Casts the second value to `gu32` and divides the first with it                                                                                         |
| `div{T}`              | `(T, gu32) -> gu32`                  | Casts the first value to `gu32` and divides it with the second                                                                                         |
| `div`                 | `(gi32, gi32) -> gi32`               | Divides the `gi32` values                                                                                                                              |
| `div{T}`              | `(gi32, T) -> gi32`                  | Casts the second value to `gi32` and divides the first with it                                                                                         |
| `div{T}`              | `(T, gi32) -> gi32`                  | Casts the first value to `gi32` and divides it with the second                                                                                         |
| `div`                 | `(gf32, gf32) -> gf32`               | Divides the `gf32` values                                                                                                                              |
| `div{T}`              | `(gf32, T) -> gf32`                  | Casts the second value to `gf32` and divides the first with it                                                                                         |
| `div{T}`              | `(T, gf32) -> gf32`                  | Casts the first value to `gf32` and divides it with the second                                                                                         |
| `div`                 | `(gvec2u, gvec2u) -> gvec2u`         | Piecewise divides the two vectors                                                                                                                      |
| `div`                 | `(gvec2u, gu32) -> gvec2u`           | Divides the each element of the vector by the `gu32`                                                                                                   |
| `div`                 | `(gu32, gvec2u) -> gvec2u`           | Divides the `gu32` by each element of the vector                                                                                                       |
| `div`                 | `(gvec2i, gvec2i) -> gvec2i`         | Piecewise divides the two vectors                                                                                                                      |
| `div`                 | `(gvec2i, gi32) -> gvec2i`           | Divides the each element of the vector by the `gi32`                                                                                                   |
| `div`                 | `(gi32, gvec2i) -> gvec2i`           | Divides the `gi32` by each element of the vector                                                                                                       |
| `div`                 | `(gvec2f, gvec2f) -> gvec2f`         | Piecewise divides the two vectors                                                                                                                      |
| `div`                 | `(gvec2f, gf32) -> gvec2f`           | Divides the each element of the vector by the `gf32`                                                                                                   |
| `div`                 | `(gf32, gvec2f) -> gvec2f`           | Divides the `gf32` by each element of the vector                                                                                                       |
| `div`                 | `(gvec3u, gvec3u) -> gvec3u`         | Piecewise divides the two vectors                                                                                                                      |
| `div`                 | `(gvec3u, gu32) -> gvec3u`           | Divides the each element of the vector by the `gu32`                                                                                                   |
| `div`                 | `(gu32, gvec3u) -> gvec3u`           | Divides the `gu32` by each element of the vector                                                                                                       |
| `div`                 | `(gvec3i, gvec3i) -> gvec3i`         | Piecewise divides the two vectors                                                                                                                      |
| `div`                 | `(gvec3i, gi32) -> gvec3i`           | Divides the each element of the vector by the `gi32`                                                                                                   |
| `div`                 | `(gi32, gvec3i) -> gvec3i`           | Divides the `gi32` by each element of the vector                                                                                                       |
| `div`                 | `(gvec3f, gvec3f) -> gvec3f`         | Piecewise divides the two vectors                                                                                                                      |
| `div`                 | `(gvec3f, gf32) -> gvec3f`           | Divides the each element of the vector by the `gf32`                                                                                                   |
| `div`                 | `(gf32, gvec3f) -> gvec3f`           | Divides the `gf32` by each element of the vector                                                                                                       |
| `div`                 | `(gvec4u, gvec4u) -> gvec4u`         | Piecewise divides the two vectors                                                                                                                      |
| `div`                 | `(gvec4u, gu32) -> gvec4u`           | Divides the each element of the vector by the `gu32`                                                                                                   |
| `div`                 | `(gu32, gvec4u) -> gvec4u`           | Divides the `gu32` by each element of the vector                                                                                                       |
| `div`                 | `(gvec4i, gvec4i) -> gvec4i`         | Piecewise divides the two vectors                                                                                                                      |
| `div`                 | `(gvec4i, gi32) -> gvec4i`           | Divides the each element of the vector by the `gi32`                                                                                                   |
| `div`                 | `(gi32, gvec4i) -> gvec4i`           | Divides the `gi32` by each element of the vector                                                                                                       |
| `div`                 | `(gvec4f, gvec4f) -> gvec4f`         | Piecewise divides the two vectors                                                                                                                      |
| `div`                 | `(gvec4f, gf32) -> gvec4f`           | Divides the each element of the vector by the `gf32`                                                                                                   |
| `div`                 | `(gf32, gvec4f) -> gvec4f`           | Divides the `gf32` by each element of the vector                                                                                                       |
| `gMod{A, B}`          | `(A, B) -> A`                        | Manually constructs a modulus (remainder) operation on the provided values, producing the first type as output. You probably won't use this directly   |
| `gModRev{A, B}`       | `(A, B) -> B`                        | Manually constructs a modulus (remainder) operation on the provided values, producing the second type as output. You probably won't use this directly  |
| `mod`                 | `(gu32, gu32) -> gu32`               | Divides the `gu32` values and returns the remainder                                                                                                    |
| `mod{T}`              | `(gu32, T) -> gu32`                  | Casts the second value to `gu32` and divides the first with it, returning the remainder                                                                |
| `mod{T}`              | `(T, gu32) -> gu32`                  | Casts the first value to `gu32` and divides it with the second, returning the remainder                                                                |
| `mod`                 | `(gi32, gi32) -> gi32`               | Divides the `gi32` values and returns the remainder                                                                                                    |
| `mod{T}`              | `(gi32, T) -> gi32`                  | Casts the second value to `gi32` and divides the first with it, returning the remainder                                                                |
| `mod{T}`              | `(T, gi32) -> gi32`                  | Casts the first value to `gi32` and divides it with the second, returning the remainder                                                                |
| `mod`                 | `(gf32, gf32) -> gf32`               | Divides the `gf32` values and returns the remainder                                                                                                    |
| `mod{T}`              | `(gf32, T) -> gf32`                  | Casts the second value to `gf32` and divides the first with it, returning the remainder                                                                |
| `mod{T}`              | `(T, gf32) -> gf32`                  | Casts the first value to `gf32` and divides it with the second, returning the remainder                                                                |
| `mod`                 | `(gvec2u, gvec2u) -> gvec2u`         | Piecewise divides the two vectors, returning the remainder                                                                                             |
| `mod`                 | `(gvec2u, gu32) -> gvec2u`           | Divides the each element of the vector by the `gu32`, returning the remainder                                                                          |
| `mod`                 | `(gu32, gvec2u) -> gvec2u`           | Divides the `gu32` by each element of the vector, returning the remainder                                                                              |
| `mod`                 | `(gvec2i, gvec2i) -> gvec2i`         | Piecewise divides the two vectors, returning the remainder                                                                                             |
| `mod`                 | `(gvec2i, gi32) -> gvec2i`           | Divides the each element of the vector by the `gi32`, returning the remainder                                                                          |
| `mod`                 | `(gi32, gvec2i) -> gvec2i`           | Divides the `gi32` by each element of the vector, returning the remainder                                                                              |
| `mod`                 | `(gvec2f, gvec2f) -> gvec2f`         | Piecewise divides the two vectors, returning the remainder                                                                                             |
| `mod`                 | `(gvec2f, gf32) -> gvec2f`           | Divides the each element of the vector by the `gf32`, returning the remainder                                                                          |
| `mod`                 | `(gf32, gvec2f) -> gvec2f`           | Divides the `gf32` by each element of the vector, returning the remainder                                                                              |
| `mod`                 | `(gvec3u, gvec3u) -> gvec3u`         | Piecewise divides the two vectors, returning the remainder                                                                                             |
| `mod`                 | `(gvec3u, gu32) -> gvec3u`           | Divides the each element of the vector by the `gu32`, returning the remainder                                                                          |
| `mod`                 | `(gu32, gvec3u) -> gvec3u`           | Divides the `gu32` by each element of the vector, returning the remainder                                                                              |
| `mod`                 | `(gvec3i, gvec3i) -> gvec3i`         | Piecewise divides the two vectors, returning the remainder                                                                                             |
| `mod`                 | `(gvec3i, gi32) -> gvec3i`           | Divides the each element of the vector by the `gi32`, returning the remainder                                                                          |
| `mod`                 | `(gi32, gvec3i) -> gvec3i`           | Divides the `gi32` by each element of the vector, returning the remainder                                                                              |
| `mod`                 | `(gvec3f, gvec3f) -> gvec3f`         | Piecewise divides the two vectors, returning the remainder                                                                                             |
| `mod`                 | `(gvec3f, gf32) -> gvec3f`           | Divides the each element of the vector by the `gf32`, returning the remainder                                                                          |
| `mod`                 | `(gf32, gvec3f) -> gvec3f`           | Divides the `gf32` by each element of the vector, returning the remainder                                                                              |
| `mod`                 | `(gvec4u, gvec4u) -> gvec4u`         | Piecewise divides the two vectors, returning the remainder                                                                                             |
| `mod`                 | `(gvec4u, gu32) -> gvec4u`           | Divides the each element of the vector by the `gu32`, returning the remainder                                                                          |
| `mod`                 | `(gu32, gvec4u) -> gvec4u`           | Divides the `gu32` by each element of the vector, returning the remainder                                                                              |
| `mod`                 | `(gvec4i, gvec4i) -> gvec4i`         | Piecewise divides the two vectors, returning the remainder                                                                                             |
| `mod`                 | `(gvec4i, gi32) -> gvec4i`           | Divides the each element of the vector by the `gi32`, returning the remainder                                                                          |
| `mod`                 | `(gi32, gvec4i) -> gvec4i`           | Divides the `gi32` by each element of the vector, returning the remainder                                                                              |
| `mod`                 | `(gvec4f, gvec4f) -> gvec4f`         | Piecewise divides the two vectors, returning the remainder                                                                                             |
| `mod`                 | `(gvec4f, gf32) -> gvec4f`           | Divides the each element of the vector by the `gf32`, returning the remainder                                                                          |
| `mod`                 | `(gf32, gvec4f) -> gvec4f`           | Divides the `gf32` by each element of the vector, returning the remainder                                                                              |
| `gpow{A, B}`          | `(A, B) -> A`                        | Manually constructs a power operation on the provided values, producing the first type as output. You probably won't use this directly                 |
| `pow`                 | `(gf32, gf32) -> gf32`               | Raises the first `gf32` to the power of the second                                                                                                     |
| `pow{T}`              | `(gf32, T) -> gf32`                  | Casts the second value to `gf32` and raises the first to the power of it                                                                               |
| `pow{T}`              | `(T, gf32) -> gf32`                  | Casts the first value to `gf32` and raises it to the power of the second                                                                               |
| `pow`                 | `(gvec2f, gvec2f) -> gvec2f`         | Piecewise raises the elements of the first vector to the power of the elements of the second                                                           |
| `pow{T}`              | `(gvec2f, T) -> gvec2f`              | Casts the second value to a vector and piecewise raises the elements of the first vector to the power of the elements of the second                    |
| `pow{T}`              | `(T, gvec2f) -> gvec2f`              | Casts the first value to a vector and piecewise raises the elements of the first vector to the power of the elements of the second                     |
| `pow`                 | `(gvec3f, gvec3f) -> gvec3f`         | Piecewise raises the elements of the first vector to the power of the elements of the second                                                           |
| `pow{T}`              | `(gvec3f, T) -> gvec3f`              | Casts the second value to a vector and piecewise raises the elements of the first vector to the power of the elements of the second                    |
| `pow{T}`              | `(T, gvec3f) -> gvec3f`              | Casts the first value to a vector and piecewise raises the elements of the first vector to the power of the elements of the second                     |
| `pow`                 | `(gvec4f, gvec4f) -> gvec4f`         | Piecewise raises the elements of the first vector to the power of the elements of the second                                                           |
| `pow{T}`              | `(gvec4f, T) -> gvec4f`              | Casts the second value to a vector and piecewise raises the elements of the first vector to the power of the elements of the second                    |
| `pow{T}`              | `(T, gvec4f) -> gvec4f`              | Casts the first value to a vector and piecewise raises the elements of the first vector to the power of the elements of the second                     |
| `gmin{I}`             | `(I, I) -> I`                        | Manually constructs a min call on the provided values. You probably won't use this directly                                                            |
| `min`                 | `(gf32, gf32) -> gf32`               | Returns the smaller of the two values                                                                                                                  |
| `min{A}`              | `(A, gf32) -> gf32`                  | Casts the first value to `gf32` and returns the smaller of the two values                                                                              |
| `min{B}`              | `(gf32, B) -> gf32`                  | Casts the second value to `gf32` and returns the smaller of the two values                                                                             |
| `min`                 | `(gu32, gu32) -> gu32`               | Returns the smaller of the two values                                                                                                                  |
| `min{A}`              | `(A, gu32) -> gu32`                  | Casts the first value to `gu32` and returns the smaller of the two values                                                                              |
| `min{B}`              | `(gu32, B) -> gu32`                  | Casts the second value to `gu32` and returns the smaller of the two values                                                                             |
| `min`                 | `(gi32, gi32) -> gi32`               | Returns the smaller of the two values                                                                                                                  |
| `min{A}`              | `(A, gi32) -> gi32`                  | Casts the first value to `gi32` and returns the smaller of the two values                                                                              |
| `min{B}`              | `(gi32, B) -> gi32`                  | Casts the second value to `gi32` and returns the smaller of the two values                                                                             |
| `gmax{I}`             | `(I, I) -> I`                        | Manually constructs a max call on the provided values. You probably won't use this directly                                                            |
| `max`                 | `(gf32, gf32) -> gf32`               | Returns the smaller of the two values                                                                                                                  |
| `max{A}`              | `(A, gf32) -> gf32`                  | Casts the first value to `gf32` and returns the smaller of the two values                                                                              |
| `max{B}`              | `(gf32, B) -> gf32`                  | Casts the second value to `gf32` and returns the smaller of the two values                                                                             |
| `max`                 | `(gu32, gu32) -> gu32`               | Returns the smaller of the two values                                                                                                                  |
| `max{A}`              | `(A, gu32) -> gu32`                  | Casts the first value to `gu32` and returns the smaller of the two values                                                                              |
| `max{B}`              | `(gu32, B) -> gu32`                  | Casts the second value to `gu32` and returns the smaller of the two values                                                                             |
| `max`                 | `(gi32, gi32) -> gi32`               | Returns the smaller of the two values                                                                                                                  |
| `max{A}`              | `(A, gi32) -> gi32`                  | Casts the first value to `gi32` and returns the smaller of the two values                                                                              |
| `max{B}`              | `(gi32, B) -> gi32`                  | Casts the second value to `gi32` and returns the smaller of the two values                                                                             |
| `gsqrt{I}`            | `I -> I`                             | Manually constructs a square root call on the provided value. You probably won't use this directly                                                     |
| `sqrt`                | `gf32 -> gf32`                       | Returns the square root of the value                                                                                                                   |
| `sqrt`                | `gvec2f -> gvec2f`                   | Returns the square root of each element of the vector                                                                                                  |
| `sqrt`                | `gvec3f -> gvec3f`                   | Returns the square root of each element of the vector                                                                                                  |
| `sqrt`                | `gvec4f -> gvec4f`                   | Returns the square root of each element of the vector                                                                                                  |
| `gacos{I}`            | `I -> I`                             | Manually constructs an arccosine call on the provided value. You probably won't use this directly                                                      |
| `acos`                | `gf32 -> gf32`                       | Returns the arccosine of the value                                                                                                                     |
| `acos`                | `gvec2f -> gvec2f`                   | Returns the arccosine of each element of the vector                                                                                                    |
| `acos`                | `gvec3f -> gvec3f`                   | Returns the arccosine of each element of the vector                                                                                                    |
| `acos`                | `gvec4f -> gvec4f`                   | Returns the arccosine of each element of the vector                                                                                                    |
| `gacosh{I}`           | `I -> I`                             | Manually constructs a hyperbolic arccosine call on the provided value. You probably won't use this directly                                            |
| `acosh`               | `gf32 -> gf32`                       | Returns the hyperbolic arccosine of the value                                                                                                          |
| `acosh`               | `gvec2f -> gvec2f`                   | Returns the hyperbolic arccosine of each element of the vector                                                                                         |
| `acosh`               | `gvec3f -> gvec3f`                   | Returns the hyperbolic arccosine of each element of the vector                                                                                         |
| `acosh`               | `gvec4f -> gvec4f`                   | Returns the hyperbolic arccosine of each element of the vector                                                                                         |
| `gasin{I}`            | `I -> I`                             | Manually constructs an arcsine call on the provided value. You probably won't use this directly                                                        |
| `asin`                | `gf32 -> gf32`                       | Returns the arcsine of the value                                                                                                                       |
| `asin`                | `gvec2f -> gvec2f`                   | Returns the arcsine of each element of the vector                                                                                                      |
| `asin`                | `gvec3f -> gvec3f`                   | Returns the arcsine of each element of the vector                                                                                                      |
| `asin`                | `gvec4f -> gvec4f`                   | Returns the arcsine of each element of the vector                                                                                                      |
| `gasinh{I}`           | `I -> I`                             | Manually constructs a hyperbolic arcsine call on the provided value. You probably won't use this directly                                              |
| `asinh`               | `gf32 -> gf32`                       | Returns the hyperbolic arcsine of the value                                                                                                            |
| `asinh`               | `gvec2f -> gvec2f`                   | Returns the hyperbolic arcsine of each element of the vector                                                                                           |
| `asinh`               | `gvec3f -> gvec3f`                   | Returns the hyperbolic arcsine of each element of the vector                                                                                           |
| `asinh`               | `gvec4f -> gvec4f`                   | Returns the hyperbolic arcsine of each element of the vector                                                                                           |
| `gatan{I}`            | `I -> I`                             | Manually constructs an arctangent call on the provided value. You probably won't use this directly                                                     |
| `atan`                | `gf32 -> gf32`                       | Returns the arctangent of the value                                                                                                                    |
| `atan`                | `gvec2f -> gvec2f`                   | Returns the arctangent of each element of the vector                                                                                                   |
| `atan`                | `gvec3f -> gvec3f`                   | Returns the arctangent of each element of the vector                                                                                                   |
| `atan`                | `gvec4f -> gvec4f`                   | Returns the arctangent of each element of the vector                                                                                                   |
| `gatanh{I}`           | `I -> I`                             | Manually constructs a hyperbolic arctangent call on the provided value. You probably won't use this directly                                           |
| `atanh`               | `gf32 -> gf32`                       | Returns the hyperbolic arctangent of the value                                                                                                         |
| `atanh`               | `gvec2f -> gvec2f`                   | Returns the hyperbolic arctangent of each element of the vector                                                                                        |
| `atanh`               | `gvec3f -> gvec3f`                   | Returns the hyperbolic arctangent of each element of the vector                                                                                        |
| `atanh`               | `gvec4f -> gvec4f`                   | Returns the hyperbolic arctangent of each element of the vector                                                                                        |
| `gatan2{A, B}`        | `(A, B) -> A`                        | Manually constructs an atan2 operation on the provided values, producing the first type as output. You probably won't use this directly                |
| `atan2`               | `(gf32, gf32) -> gf32`               | Calculates the arctangent from the X and Y dimensions                                                                                                  |
| `atan2{T}`            | `(gf32, T) -> gf32`                  | Casts the second value to `gf32` and calculates the arctangent from the X and Y dimensions                                                             |
| `atan2{T}`            | `(T, gf32) -> gf32`                  | Casts the first value to `gf32` and calculates the arctangent from the X and Y dimensions                                                              |
| `atan2`               | `(gvec2f, gvec2f) -> gvec2f`         | Piecewise calculates the arctangent from the two vectors as the X and Y dimensions, respectively                                                       |
| `atan2{T}`            | `(gvec2f, T) -> gvec2f`              | Casts the second value to a vector and piecewise calculates the arctangent from the two vectors as the X and Y dimensions, respectively                |
| `atan2{T}`            | `(T, gvec2f) -> gvec2f`              | Casts the first value to a vector and piecewise calculates the arctangent from the two vectors as the X and Y dimensions, respectively                 |
| `atan2`               | `(gvec3f, gvec3f) -> gvec3f`         | Piecewise calculates the arctangent from the two vectors as the X and Y dimensions, respectively                                                       |
| `atan2{T}`            | `(gvec3f, T) -> gvec3f`              | Casts the second value to a vector and piecewise calculates the arctangent from the two vectors as the X and Y dimensions, respectively                |
| `atan2{T}`            | `(T, gvec3f) -> gvec3f`              | Casts the first value to a vector and piecewise calculates the arctangent from the two vectors as the X and Y dimensions, respectively                 |
| `atan2`               | `(gvec4f, gvec4f) -> gvec4f`         | Piecewise calculates the arctangent from the two vectors as the X and Y dimensions, respectively                                                       |
| `atan2{T}`            | `(gvec4f, T) -> gvec4f`              | Casts the second value to a vector and piecewise calculates the arctangent from the two vectors as the X and Y dimensions, respectively                |
| `atan2{T}`            | `(T, gvec4f) -> gvec4f`              | Casts the first value to a vector and piecewise calculates the arctangent from the two vectors as the X and Y dimensions, respectively                 |
| `gfloor{I}`           | `I -> I`                             | Manually constructs a floor call on the provided value. You probably won't use this directly                                                           |
| `floor`               | `gf32 -> gf32`                       | Returns the floor (integer component) of the value                                                                                                     |
| `floor`               | `gvec2f -> gvec2f`                   | Returns the floor (integer component) of each element of the vector                                                                                    |
| `floor`               | `gvec3f -> gvec3f`                   | Returns the floor (integer component) of each element of the vector                                                                                    |
| `floor`               | `gvec4f -> gvec4f`                   | Returns the floor (integer component) of each element of the vector                                                                                    |
| `gceil{I}`            | `I -> I`                             | Manually constructs a ceil call on the provided value. You probably won't use this directly                                                            |
| `ceil`                | `gf32 -> gf32`                       | Returns the ceil (next integer) of the value                                                                                                           |
| `ceil`                | `gvec2f -> gvec2f`                   | Returns the ceil (next integer) of each element of the vector                                                                                          |
| `ceil`                | `gvec3f -> gvec3f`                   | Returns the ceil (next integer) of each element of the vector                                                                                          |
| `ceil`                | `gvec4f -> gvec4f`                   | Returns the ceil (next integer) of each element of the vector                                                                                          |
| `gclamp{I}`           | `(I, I, I) -> I`                     | Manually constructs a clamp call on the provided values. You probably won't use this directly                                                          |
| `clamp`               | `(gf32, gf32, gf32) -> gf32`         | Clamps the first value to be greater than or equal to the second and less than or equal to the third                                                   |
| `clamp{T}`            | `(gf32, T, T) -> gf32`               | Casts the clamp values to `gf32` and clamps the first value to be greater than or equal to the second and less than or equal to the third              |
| `clamp{T}`            | `(gf32, gf32, T) -> gf32`            | Casts the last value to `gf32` and clamps the first value to be greater than or equal to the second and less than or equal to the third                |
| `clamp{T}`            | `(gf32, T, gf32) -> gf32`            | Casts the second value to `gf32` and clamps the first value to be greater than or equal to the second and less than or equal to the third              |
| `clamp`               | `(gvec2f, gvec2f, gvec2f) -> gvec2f` | Piecewise clamps the first vector to be greater than or equal to the second and less than or equal to the third                                        |
| `clamp{T}`            | `(gvec2f, T, T) -> gvec2f`           | Casts the clamp values to `gvec2f` and piecewise clamps the first vector to be greater than or equal to the second and less than or equal to the third |
| `clamp{T}`            | `(gvec2f, gvec2f, T) -> gvec2f`      | Casts the last value to `gvec2f` and piecewise clamps the first vector to be greater than or equal to the second and less than or equal to the third   |
| `clamp{T}`            | `(gvec2f, T, gvec2f) -> gvec2f`      | Casts the second value to `gvec2f` and piecewise clamps the first vector to be greater than or equal to the second and less than or equal to the third |
| `clamp`               | `(gvec3f, gvec3f, gvec3f) -> gvec3f` | Piecewise clamps the first vector to be greater than or equal to the second and less than or equal to the third                                        |
| `clamp{T}`            | `(gvec3f, T, T) -> gvec3f`           | Casts the clamp values to `gvec3f` and piecewise clamps the first vector to be greater than or equal to the second and less than or equal to the third |
| `clamp{T}`            | `(gvec3f, gvec3f, T) -> gvec3f`      | Casts the last value to `gvec3f` and piecewise clamps the first vector to be greater than or equal to the second and less than or equal to the third   |
| `clamp{T}`            | `(gvec3f, T, gvec3f) -> gvec3f`      | Casts the second value to `gvec3f` and piecewise clamps the first vector to be greater than or equal to the second and less than or equal to the third |
| `clamp`               | `(gvec4f, gvec4f, gvec4f) -> gvec4f` | Piecewise clamps the first vector to be greater than or equal to the second and less than or equal to the third                                        |
| `clamp{T}`            | `(gvec4f, T, T) -> gvec4f`           | Casts the clamp values to `gvec4f` and piecewise clamps the first vector to be greater than or equal to the second and less than or equal to the third |
| `clamp{T}`            | `(gvec4f, gvec4f, T) -> gvec4f`      | Casts the last value to `gvec4f` and piecewise clamps the first vector to be greater than or equal to the second and less than or equal to the third   |
| `clamp{T}`            | `(gvec4f, T, gvec4f) -> gvec4f`      | Casts the second value to `gvec4f` and piecewise clamps the first vector to be greater than or equal to the second and less than or equal to the third |
| `gsaturate{I}`        | `I -> I`                             | Manually constructs a saturate call on the provided value. You probably won't use this directly                                                        |
| `saturate`            | `gf32 -> gf32`                       | Returns the saturate (clamp between 0 and 1) of the value                                                                                              |
| `saturate`            | `gvec2f -> gvec2f`                   | Returns the saturate (clamp between 0 and 1) of each element of the vector                                                                             |
| `saturate`            | `gvec3f -> gvec3f`                   | Returns the saturate (clamp between 0 and 1) of each element of the vector                                                                             |
| `saturate`            | `gvec4f -> gvec4f`                   | Returns the saturate (clamp between 0 and 1) of each element of the vector                                                                             |
| `gexp{I}`             | `I -> I`                             | Manually constructs an exp call on the provided value. You probably won't use this directly                                                            |
| `exp`                 | `gf32 -> gf32`                       | Returns the exp (`e ** x`) of the value                                                                                                                |
| `exp`                 | `gvec2f -> gvec2f`                   | Returns the exp (`e ** x`) of each element of the vector                                                                                               |
| `exp`                 | `gvec3f -> gvec3f`                   | Returns the exp (`e ** x`) of each element of the vector                                                                                               |
| `exp`                 | `gvec4f -> gvec4f`                   | Returns the exp (`e ** x`) of each element of the vector                                                                                               |
| `gln{I}`              | `I -> I`                             | Manually constructs a ln call on the provided value. You probably won't use this directly                                                              |
| `ln`                  | `gf32 -> gf32`                       | Returns the ln (natural log) of the value                                                                                                              |
| `ln`                  | `gvec2f -> gvec2f`                   | Returns the ln (natural log) of each element of the vector                                                                                             |
| `ln`                  | `gvec3f -> gvec3f`                   | Returns the ln (natural log) of each element of the vector                                                                                             |
| `ln`                  | `gvec4f -> gvec4f`                   | Returns the ln (natural log) of each element of the vector                                                                                             |
| `glog2{I}`            | `I -> I`                             | Manually constructs a log2 call on the provided value. You probably won't use this directly                                                            |
| `log2`                | `gf32 -> gf32`                       | Returns the log2 (log base 2) of the value                                                                                                             |
| `log2`                | `gvec2f -> gvec2f`                   | Returns the log2 (log base 2) of each element of the vector                                                                                            |
| `log2`                | `gvec3f -> gvec3f`                   | Returns the log2 (log base 2) of each element of the vector                                                                                            |
| `log2`                | `gvec4f -> gvec4f`                   | Returns the log2 (log base 2) of each element of the vector                                                                                            |
| `glog10{I}`           | `I -> I`                             | Manually constructs a log10 call on the provided value. You probably won't use this directly                                                           |
| `log10`               | `gf32 -> gf32`                       | Returns the log10 (log base 10) of the value                                                                                                           |
| `log10`               | `gvec2f -> gvec2f`                   | Returns the log10 (log base 10) of each element of the vector                                                                                          |
| `log10`               | `gvec3f -> gvec3f`                   | Returns the log10 (log base 10) of each element of the vector                                                                                          |
| `log10`               | `gvec4f -> gvec4f`                   | Returns the log10 (log base 10) of each element of the vector                                                                                          |
| `gcos{I}`             | `I -> I`                             | Manually constructs a cosine call on the provided value. You probably won't use this directly                                                          |
| `cos`                 | `gf32 -> gf32`                       | Returns the cosine of the value                                                                                                                        |
| `cos`                 | `gvec2f -> gvec2f`                   | Returns the cosine of each element of the vector                                                                                                       |
| `cos`                 | `gvec3f -> gvec3f`                   | Returns the cosine of each element of the vector                                                                                                       |
| `cos`                 | `gvec4f -> gvec4f`                   | Returns the cosine of each element of the vector                                                                                                       |
| `gcosh{I}`            | `I -> I`                             | Manually constructs a hyperbolic cosine call on the provided value. You probably won't use this directly                                               |
| `cosh`                | `gf32 -> gf32`                       | Returns the hyperbolic cosine of the value                                                                                                             |
| `cosh`                | `gvec2f -> gvec2f`                   | Returns the hyperbolic cosine of each element of the vector                                                                                            |
| `cosh`                | `gvec3f -> gvec3f`                   | Returns the hyperbolic cosine of each element of the vector                                                                                            |
| `cosh`                | `gvec4f -> gvec4f`                   | Returns the hyperbolic cosine of each element of the vector                                                                                            |
| `gsin{I}`             | `I -> I`                             | Manually constructs a sine call on the provided value. You probably won't use this directly                                                            |
| `sin`                 | `gf32 -> gf32`                       | Returns the sine of the value                                                                                                                          |
| `sin`                 | `gvec2f -> gvec2f`                   | Returns the sine of each element of the vector                                                                                                         |
| `sin`                 | `gvec3f -> gvec3f`                   | Returns the sine of each element of the vector                                                                                                         |
| `sin`                 | `gvec4f -> gvec4f`                   | Returns the sine of each element of the vector                                                                                                         |
| `gsinh{I}`            | `I -> I`                             | Manually constructs a hyperbolic sine call on the provided value. You probably won't use this directly                                                 |
| `sinh`                | `gf32 -> gf32`                       | Returns the hyperbolic sine of the value                                                                                                               |
| `sinh`                | `gvec2f -> gvec2f`                   | Returns the hyperbolic sine of each element of the vector                                                                                              |
| `sinh`                | `gvec3f -> gvec3f`                   | Returns the hyperbolic sine of each element of the vector                                                                                              |
| `sinh`                | `gvec4f -> gvec4f`                   | Returns the hyperbolic sine of each element of the vector                                                                                              |
| `gtan{I}`             | `I -> I`                             | Manually constructs a tangent call on the provided value. You probably won't use this directly                                                         |
| `tan`                 | `gf32 -> gf32`                       | Returns the tangent of the value                                                                                                                       |
| `tan`                 | `gvec2f -> gvec2f`                   | Returns the tangent of each element of the vector                                                                                                      |
| `tan`                 | `gvec3f -> gvec3f`                   | Returns the tangent of each element of the vector                                                                                                      |
| `tan`                 | `gvec4f -> gvec4f`                   | Returns the tangent of each element of the vector                                                                                                      |
| `gtanh{I}`            | `I -> I`                             | Manually constructs a hyperbolic tangent call on the provided value. You probably won't use this directly                                              |
| `tanh`                | `gf32 -> gf32`                       | Returns the hyperbolic tangent of the value                                                                                                            |
| `tanh`                | `gvec2f -> gvec2f`                   | Returns the hyperbolic tangent of each element of the vector                                                                                           |
| `tanh`                | `gvec3f -> gvec3f`                   | Returns the hyperbolic tangent of each element of the vector                                                                                           |
| `tanh`                | `gvec4f -> gvec4f`                   | Returns the hyperbolic tangent of each element of the vector                                                                                           |
| `sec`                 | `gf32 -> gf32`                       | Returns the secant of the value                                                                                                                        |
| `sec`                 | `gvec2f -> gvec2f`                   | Returns the secant of each element of the vector                                                                                                       |
| `sec`                 | `gvec3f -> gvec3f`                   | Returns the secant of each element of the vector                                                                                                       |
| `sec`                 | `gvec4f -> gvec4f`                   | Returns the secant of each element of the vector                                                                                                       |
| `csc`                 | `gf32 -> gf32`                       | Returns the cosecant of the value                                                                                                                      |
| `csc`                 | `gvec2f -> gvec2f`                   | Returns the cosecant of each element of the vector                                                                                                     |
| `csc`                 | `gvec3f -> gvec3f`                   | Returns the cosecant of each element of the vector                                                                                                     |
| `csc`                 | `gvec4f -> gvec4f`                   | Returns the cosecant of each element of the vector                                                                                                     |
| `cot`                 | `gf32 -> gf32`                       | Returns the cotangent of the value                                                                                                                     |
| `cot`                 | `gvec2f -> gvec2f`                   | Returns the cotangent of each element of the vector                                                                                                    |
| `cot`                 | `gvec3f -> gvec3f`                   | Returns the cotangent of each element of the vector                                                                                                    |
| `cot`                 | `gvec4f -> gvec4f`                   | Returns the cotangent of each element of the vector                                                                                                    |
| `asec`                | `gf32 -> gf32`                       | Returns the arcsecant of the value                                                                                                                     |
| `asec`                | `gvec2f -> gvec2f`                   | Returns the arcsecant of each element of the vector                                                                                                    |
| `asec`                | `gvec3f -> gvec3f`                   | Returns the arcsecant of each element of the vector                                                                                                    |
| `asec`                | `gvec4f -> gvec4f`                   | Returns the arcsecant of each element of the vector                                                                                                    |
| `acsc`                | `gf32 -> gf32`                       | Returns the arccosecant of the value                                                                                                                   |
| `acsc`                | `gvec2f -> gvec2f`                   | Returns the arccosecant of each element of the vector                                                                                                  |
| `acsc`                | `gvec3f -> gvec3f`                   | Returns the arccosecant of each element of the vector                                                                                                  |
| `acsc`                | `gvec4f -> gvec4f`                   | Returns the arccosecant of each element of the vector                                                                                                  |
| `acot`                | `gf32 -> gf32`                       | Returns the arccotangent of the value                                                                                                                  |
| `acot`                | `gvec2f -> gvec2f`                   | Returns the arccotangent of each element of the vector                                                                                                 |
| `acot`                | `gvec3f -> gvec3f`                   | Returns the arccotangent of each element of the vector                                                                                                 |
| `acot`                | `gvec4f -> gvec4f`                   | Returns the arccotangent of each element of the vector                                                                                                 |
| `sech`                | `gf32 -> gf32`                       | Returns the hyperbolic secant of the value                                                                                                             |
| `sech`                | `gvec2f -> gvec2f`                   | Returns the hyperbolic secant of each element of the vector                                                                                            |
| `sech`                | `gvec3f -> gvec3f`                   | Returns the hyperbolic secant of each element of the vector                                                                                            |
| `sech`                | `gvec4f -> gvec4f`                   | Returns the hyperbolic secant of each element of the vector                                                                                            |
| `csch`                | `gf32 -> gf32`                       | Returns the hyperbolic cosecant of the value                                                                                                           |
| `csch`                | `gvec2f -> gvec2f`                   | Returns the hyperbolic cosecant of each element of the vector                                                                                          |
| `csch`                | `gvec3f -> gvec3f`                   | Returns the hyperbolic cosecant of each element of the vector                                                                                          |
| `csch`                | `gvec4f -> gvec4f`                   | Returns the hyperbolic cosecant of each element of the vector                                                                                          |
| `coth`                | `gf32 -> gf32`                       | Returns the hyperbolic cotangent of the value                                                                                                          |
| `coth`                | `gvec2f -> gvec2f`                   | Returns the hyperbolic cotangent of each element of the vector                                                                                         |
| `coth`                | `gvec3f -> gvec3f`                   | Returns the hyperbolic cotangent of each element of the vector                                                                                         |
| `coth`                | `gvec4f -> gvec4f`                   | Returns the hyperbolic cotangent of each element of the vector                                                                                         |
| `asech`               | `gf32 -> gf32`                       | Returns the hyperbolic arcsecant of the value                                                                                                          |
| `asech`               | `gvec2f -> gvec2f`                   | Returns the hyperbolic arcsecant of each element of the vector                                                                                         |
| `asech`               | `gvec3f -> gvec3f`                   | Returns the hyperbolic arcsecant of each element of the vector                                                                                         |
| `asech`               | `gvec4f -> gvec4f`                   | Returns the hyperbolic arcsecant of each element of the vector                                                                                         |
| `acsch`               | `gf32 -> gf32`                       | Returns the hyperbolic arccosecant of the value                                                                                                        |
| `acsch`               | `gvec2f -> gvec2f`                   | Returns the hyperbolic arccosecant of each element of the vector                                                                                       |
| `acsch`               | `gvec3f -> gvec3f`                   | Returns the hyperbolic arccosecant of each element of the vector                                                                                       |
| `acsch`               | `gvec4f -> gvec4f`                   | Returns the hyperbolic arccosecant of each element of the vector                                                                                       |
| `acoth`               | `gf32 -> gf32`                       | Returns the hyperbolic arccotangent of the value                                                                                                       |
| `acoth`               | `gvec2f -> gvec2f`                   | Returns the hyperbolic arccotangent of each element of the vector                                                                                      |
| `acoth`               | `gvec3f -> gvec3f`                   | Returns the hyperbolic arccotangent of each element of the vector                                                                                      |
| `acoth`               | `gvec4f -> gvec4f`                   | Returns the hyperbolic arccotangent of each element of the vector                                                                                      |

### GPGPU Comparison functions

| Name         | Type                         | Description                                                                                                     |
| :----------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| `geq{I, O}`  | `(I, I) -> O`                | Manually constructs an equality check on the provided inputs. You probably won't use this directly              |
| `eq`         | `(gu32, gu32) -> gbool`      | Returns `true` if the two `gu32`s are the same                                                                  |
| `eq{T}`      | `(gu32, T) -> gbool`         | Casts the second value to `gu32` and returns `true` if it is the same as the first value                        |
| `eq{T}`      | `(T, gu32) -> gbool`         | Casts the first value to `gu32` and returns `true` if it is the same as the second value                        |
| `eq`         | `(gi32, gi32) -> gbool`      | Returns `true` if the two `gi32`s are the same                                                                  |
| `eq{T}`      | `(gi32, T) -> gbool`         | Casts the second value to `gi32` and returns `true` if it is the same as the first value                        |
| `eq{T}`      | `(T, gi32) -> gbool`         | Casts the first value to `gi32` and returns `true` if it is the same as the second value                        |
| `eq`         | `(gf32, gf32) -> gbool`      | Returns `true` if the two `gf32`s are the same                                                                  |
| `eq{T}`      | `(gf32, T) -> gbool`         | Casts the second value to `gf32` and returns `true` if it is the same as the first value                        |
| `eq{T}`      | `(T, gf32) -> gbool`         | Casts the first value to `gf32` and returns `true` if it is the same as the second value                        |
| `eq`         | `(gbool, gbool) -> gbool`    | Returns `true` if the two `gbool`s are the same                                                                 |
| `eq{T}`      | `(gbool, T) -> gbool`        | Casts the second value to `gbool` and returns `true` if it is the same as the first value                       |
| `eq{T}`      | `(T, gbool) -> gbool`        | Casts the first value to `gbool` and returns `true` if it is the same as the second value                       |
| `eq{T}`      | `(gvec2u, gvec2u) -> gvec2b` | Piecewise checks equality of the two vectors and stores the result as a new boolean vector                      |
| `eq{T}`      | `(gvec2i, gvec2i) -> gvec2b` | Piecewise checks equality of the two vectors and stores the result as a new boolean vector                      |
| `eq{T}`      | `(gvec2f, gvec2f) -> gvec2b` | Piecewise checks equality of the two vectors and stores the result as a new boolean vector                      |
| `eq{T}`      | `(gvec2b, gvec2b) -> gvec2b` | Piecewise checks equality of the two vectors and stores the result as a new boolean vector                      |
| `eq{T}`      | `(gvec3u, gvec3u) -> gvec3b` | Piecewise checks equality of the two vectors and stores the result as a new boolean vector                      |
| `eq{T}`      | `(gvec3i, gvec3i) -> gvec3b` | Piecewise checks equality of the two vectors and stores the result as a new boolean vector                      |
| `eq{T}`      | `(gvec3f, gvec3f) -> gvec3b` | Piecewise checks equality of the two vectors and stores the result as a new boolean vector                      |
| `eq{T}`      | `(gvec3b, gvec3b) -> gvec3b` | Piecewise checks equality of the two vectors and stores the result as a new boolean vector                      |
| `eq{T}`      | `(gvec4u, gvec4u) -> gvec4b` | Piecewise checks equality of the two vectors and stores the result as a new boolean vector                      |
| `eq{T}`      | `(gvec4i, gvec4i) -> gvec4b` | Piecewise checks equality of the two vectors and stores the result as a new boolean vector                      |
| `eq{T}`      | `(gvec4f, gvec4f) -> gvec4b` | Piecewise checks equality of the two vectors and stores the result as a new boolean vector                      |
| `eq{T}`      | `(gvec4b, gvec4b) -> gvec4b` | Piecewise checks equality of the two vectors and stores the result as a new boolean vector                      |
| `gneq{I, O}` | `(I, I) -> O`                | Manually constructs an inequality check on the provided inputs. You probably won't use this directly            |
| `neq`        | `(gu32, gu32) -> gbool`      | Returns `true` if the two `gu32`s are different                                                                 |
| `neq{T}`     | `(gu32, T) -> gbool`         | Casts the second value to `gu32` and returns `true` if it is different to the first value                       |
| `neq{T}`     | `(T, gu32) -> gbool`         | Casts the first value to `gu32` and returns `true` if it is different to the second value                       |
| `neq`        | `(gi32, gi32) -> gbool`      | Returns `true` if the two `gi32`s are different                                                                 |
| `neq{T}`     | `(gi32, T) -> gbool`         | Casts the second value to `gi32` and returns `true` if it is different to the first value                       |
| `neq{T}`     | `(T, gi32) -> gbool`         | Casts the first value to `gi32` and returns `true` if it is different to the second value                       |
| `neq`        | `(gf32, gf32) -> gbool`      | Returns `true` if the two `gf32`s are different                                                                 |
| `neq{T}`     | `(gf32, T) -> gbool`         | Casts the second value to `gf32` and returns `true` if it is different to the first value                       |
| `neq{T}`     | `(T, gf32) -> gbool`         | Casts the first value to `gf32` and returns `true` if it is different to the second value                       |
| `neq`        | `(gbool, gbool) -> gbool`    | Returns `true` if the two `gbool`s are different                                                                |
| `neq{T}`     | `(gbool, T) -> gbool`        | Casts the second value to `gbool` and returns `true` if it is different to the first value                      |
| `neq{T}`     | `(T, gbool) -> gbool`        | Casts the first value to `gbool` and returns `true` if it is different to the second value                      |
| `neq{T}`     | `(gvec2u, gvec2u) -> gvec2b` | Piecewise checks inequality of the two vectors and stores the result as a new boolean vector                    |
| `neq{T}`     | `(gvec2i, gvec2i) -> gvec2b` | Piecewise checks inequality of the two vectors and stores the result as a new boolean vector                    |
| `neq{T}`     | `(gvec2f, gvec2f) -> gvec2b` | Piecewise checks inequality of the two vectors and stores the result as a new boolean vector                    |
| `neq{T}`     | `(gvec2b, gvec2b) -> gvec2b` | Piecewise checks inequality of the two vectors and stores the result as a new boolean vector                    |
| `neq{T}`     | `(gvec3u, gvec3u) -> gvec3b` | Piecewise checks inequality of the two vectors and stores the result as a new boolean vector                    |
| `neq{T}`     | `(gvec3i, gvec3i) -> gvec3b` | Piecewise checks inequality of the two vectors and stores the result as a new boolean vector                    |
| `neq{T}`     | `(gvec3f, gvec3f) -> gvec3b` | Piecewise checks inequality of the two vectors and stores the result as a new boolean vector                    |
| `neq{T}`     | `(gvec3b, gvec3b) -> gvec3b` | Piecewise checks inequality of the two vectors and stores the result as a new boolean vector                    |
| `neq{T}`     | `(gvec4u, gvec4u) -> gvec4b` | Piecewise checks inequality of the two vectors and stores the result as a new boolean vector                    |
| `neq{T}`     | `(gvec4i, gvec4i) -> gvec4b` | Piecewise checks inequality of the two vectors and stores the result as a new boolean vector                    |
| `neq{T}`     | `(gvec4f, gvec4f) -> gvec4b` | Piecewise checks inequality of the two vectors and stores the result as a new boolean vector                    |
| `neq{T}`     | `(gvec4b, gvec4b) -> gvec4b` | Piecewise checks inequality of the two vectors and stores the result as a new boolean vector                    |
| `glt{I, O}`  | `(I, I) -> O`                | Manually constructs a less than check on the provided inputs. You probably won't use this directly              |
| `lt`         | `(gu32, gu32) -> gbool`      | Returns `true` if the first `gu32` is less than the second                                                      |
| `lt{T}`      | `(gu32, T) -> gbool`         | Casts the second value to `gu32` and returns `true` if the first is less than it                                |
| `lt{T}`      | `(T, gu32) -> gbool`         | Casts the first value to `gu32` and returns `true` if it is less than the second                                |
| `lt`         | `(gi32, gi32) -> gbool`      | Returns `true` if the first `gi32` is less than the second                                                      |
| `lt{T}`      | `(gi32, T) -> gbool`         | Casts the second value to `gi32` and returns `true` if the first is less than it                                |
| `lt{T}`      | `(T, gi32) -> gbool`         | Casts the first value to `gi32` and returns `true` if it is less than the second                                |
| `lt`         | `(gf32, gf32) -> gbool`      | Returns `true` if the first `gf32` is less than the second                                                      |
| `lt{T}`      | `(gf32, T) -> gbool`         | Casts the second value to `gf32` and returns `true` if the first is less than it                                |
| `lt{T}`      | `(T, gf32) -> gbool`         | Casts the first value to `gf32` and returns `true` if it is less than the second                                |
| `lt{T}`      | `(gvec2u, gvec2u) -> gvec2b` | Piecewise checks if the elements of the first vector are less than the second                                   |
| `lt{T}`      | `(gvec2i, gvec2i) -> gvec2b` | Piecewise checks if the elements of the first vector are less than the second                                   |
| `lt{T}`      | `(gvec2f, gvec2f) -> gvec2b` | Piecewise checks if the elements of the first vector are less than the second                                   |
| `lt{T}`      | `(gvec3u, gvec3u) -> gvec3b` | Piecewise checks if the elements of the first vector are less than the second                                   |
| `lt{T}`      | `(gvec3i, gvec3i) -> gvec3b` | Piecewise checks if the elements of the first vector are less than the second                                   |
| `lt{T}`      | `(gvec3f, gvec3f) -> gvec3b` | Piecewise checks if the elements of the first vector are less than the second                                   |
| `lt{T}`      | `(gvec4u, gvec4u) -> gvec4b` | Piecewise checks if the elements of the first vector are less than the second                                   |
| `lt{T}`      | `(gvec4i, gvec4i) -> gvec4b` | Piecewise checks if the elements of the first vector are less than the second                                   |
| `lt{T}`      | `(gvec4f, gvec4f) -> gvec4b` | Piecewise checks if the elements of the first vector are less than the second                                   |
| `glte{I, O}` | `(I, I) -> O`                | Manually constructs a less than or equals check on the provided inputs. You probably won't use this directly    |
| `lte`        | `(gu32, gu32) -> gbool`      | Returns `true` if the first `gu32` is less than or equal to the second                                          |
| `lte{T}`     | `(gu32, T) -> gbool`         | Casts the second value to `gu32` and returns `true` if the first is less than or equal to it                    |
| `lte{T}`     | `(T, gu32) -> gbool`         | Casts the first value to `gu32` and returns `true` if it is less than or equal to the second                    |
| `lte`        | `(gi32, gi32) -> gbool`      | Returns `true` if the first `gi32` is less than or equal to the second                                          |
| `lte{T}`     | `(gi32, T) -> gbool`         | Casts the second value to `gi32` and returns `true` if the first is less than or equal to it                    |
| `lte{T}`     | `(T, gi32) -> gbool`         | Casts the first value to `gi32` and returns `true` if it is less than or equal to the second                    |
| `lte`        | `(gf32, gf32) -> gbool`      | Returns `true` if the first `gf32` is less than or equal to the second                                          |
| `lte{T}`     | `(gf32, T) -> gbool`         | Casts the second value to `gf32` and returns `true` if the first is less than or equal to it                    |
| `lte{T}`     | `(T, gf32) -> gbool`         | Casts the first value to `gf32` and returns `true` if it is less than or equal to the second                    |
| `lte{T}`     | `(gvec2u, gvec2u) -> gvec2b` | Piecewise checks if the elements of the first vector are less than or equal to the second                       |
| `lte{T}`     | `(gvec2i, gvec2i) -> gvec2b` | Piecewise checks if the elements of the first vector are less than or equal to the second                       |
| `lte{T}`     | `(gvec2f, gvec2f) -> gvec2b` | Piecewise checks if the elements of the first vector are less than or equal to the second                       |
| `lte{T}`     | `(gvec3u, gvec3u) -> gvec3b` | Piecewise checks if the elements of the first vector are less than or equal to the second                       |
| `lte{T}`     | `(gvec3i, gvec3i) -> gvec3b` | Piecewise checks if the elements of the first vector are less than or equal to the second                       |
| `lte{T}`     | `(gvec3f, gvec3f) -> gvec3b` | Piecewise checks if the elements of the first vector are less than or equal to the second                       |
| `lte{T}`     | `(gvec4u, gvec4u) -> gvec4b` | Piecewise checks if the elements of the first vector are less than or equal to the second                       |
| `lte{T}`     | `(gvec4i, gvec4i) -> gvec4b` | Piecewise checks if the elements of the first vector are less than or equal to the second                       |
| `lte{T}`     | `(gvec4f, gvec4f) -> gvec4b` | Piecewise checks if the elements of the first vector are less than or equal to the second                       |
| `ggt{I, O}`  | `(I, I) -> O`                | Manually constructs a greater than check on the provided inputs. You probably won't use this directly           |
| `gt`         | `(gu32, gu32) -> gbool`      | Returns `true` if the first `gu32` is greater than the second                                                   |
| `gt{T}`      | `(gu32, T) -> gbool`         | Casts the second value to `gu32` and returns `true` if the first is greater than it                             |
| `gt{T}`      | `(T, gu32) -> gbool`         | Casts the first value to `gu32` and returns `true` if it is greater than the second                             |
| `gt`         | `(gi32, gi32) -> gbool`      | Returns `true` if the first `gi32` is greater than the second                                                   |
| `gt{T}`      | `(gi32, T) -> gbool`         | Casts the second value to `gi32` and returns `true` if the first is greater than it                             |
| `gt{T}`      | `(T, gi32) -> gbool`         | Casts the first value to `gi32` and returns `true` if it is greater than the second                             |
| `gt`         | `(gf32, gf32) -> gbool`      | Returns `true` if the first `gf32` is greater than the second                                                   |
| `gt{T}`      | `(gf32, T) -> gbool`         | Casts the second value to `gf32` and returns `true` if the first is greater than it                             |
| `gt{T}`      | `(T, gf32) -> gbool`         | Casts the first value to `gf32` and returns `true` if it is greater than the second                             |
| `gt{T}`      | `(gvec2u, gvec2u) -> gvec2b` | Piecewise checks if the elements of the first vector are greater than the second                                |
| `gt{T}`      | `(gvec2i, gvec2i) -> gvec2b` | Piecewise checks if the elements of the first vector are greater than the second                                |
| `gt{T}`      | `(gvec2f, gvec2f) -> gvec2b` | Piecewise checks if the elements of the first vector are greater than the second                                |
| `gt{T}`      | `(gvec3u, gvec3u) -> gvec3b` | Piecewise checks if the elements of the first vector are greater than the second                                |
| `gt{T}`      | `(gvec3i, gvec3i) -> gvec3b` | Piecewise checks if the elements of the first vector are greater than the second                                |
| `gt{T}`      | `(gvec3f, gvec3f) -> gvec3b` | Piecewise checks if the elements of the first vector are greater than the second                                |
| `gt{T}`      | `(gvec4u, gvec4u) -> gvec4b` | Piecewise checks if the elements of the first vector are greater than the second                                |
| `gt{T}`      | `(gvec4i, gvec4i) -> gvec4b` | Piecewise checks if the elements of the first vector are greater than the second                                |
| `gt{T}`      | `(gvec4f, gvec4f) -> gvec4b` | Piecewise checks if the elements of the first vector are greater than the second                                |
| `ggte{I, O}` | `(I, I) -> O`                | Manually constructs a greater than or equals check on the provided inputs. You probably won't use this directly |
| `gte`        | `(gu32, gu32) -> gbool`      | Returns `true` if the first `gu32` is greater than or equal to the second                                       |
| `gte{T}`     | `(gu32, T) -> gbool`         | Casts the second value to `gu32` and returns `true` if the first is greater than or equal to it                 |
| `gte{T}`     | `(T, gu32) -> gbool`         | Casts the first value to `gu32` and returns `true` if it is greater than or equal to the second                 |
| `gte`        | `(gi32, gi32) -> gbool`      | Returns `true` if the first `gi32` is greater than or equal to the second                                       |
| `gte{T}`     | `(gi32, T) -> gbool`         | Casts the second value to `gi32` and returns `true` if the first is greater than or equal to it                 |
| `gte{T}`     | `(T, gi32) -> gbool`         | Casts the first value to `gi32` and returns `true` if it is greater than or equal to the second                 |
| `gte`        | `(gf32, gf32) -> gbool`      | Returns `true` if the first `gf32` is greater than or equal to the second                                       |
| `gte{T}`     | `(gf32, T) -> gbool`         | Casts the second value to `gf32` and returns `true` if the first is greater than or equal to it                 |
| `gte{T}`     | `(T, gf32) -> gbool`         | Casts the first value to `gf32` and returns `true` if it is greater than or equal to the second                 |
| `gte{T}`     | `(gvec2u, gvec2u) -> gvec2b` | Piecewise checks if the elements of the first vector are greater than or equal to the second                    |
| `gte{T}`     | `(gvec2i, gvec2i) -> gvec2b` | Piecewise checks if the elements of the first vector are greater than or equal to the second                    |
| `gte{T}`     | `(gvec2f, gvec2f) -> gvec2b` | Piecewise checks if the elements of the first vector are greater than or equal to the second                    |
| `gte{T}`     | `(gvec3u, gvec3u) -> gvec3b` | Piecewise checks if the elements of the first vector are greater than or equal to the second                    |
| `gte{T}`     | `(gvec3i, gvec3i) -> gvec3b` | Piecewise checks if the elements of the first vector are greater than or equal to the second                    |
| `gte{T}`     | `(gvec3f, gvec3f) -> gvec3b` | Piecewise checks if the elements of the first vector are greater than or equal to the second                    |
| `gte{T}`     | `(gvec4u, gvec4u) -> gvec4b` | Piecewise checks if the elements of the first vector are greater than or equal to the second                    |
| `gte{T}`     | `(gvec4i, gvec4i) -> gvec4b` | Piecewise checks if the elements of the first vector are greater than or equal to the second                    |
| `gte{T}`     | `(gvec4f, gvec4f) -> gvec4b` | Piecewise checks if the elements of the first vector are greater than or equal to the second                    |

### GPGPU Conditional functions

| Name    | Type                             | Description                                                                                                                     |
| :------ | :------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| `if{T}` | `(gbool, () -> T, () -> T) -> T` | Conditionally executes either the first or second function depending on the `gbool` value, returning the output of the function |
| `if{T}` | `(gbool, T, T) -> T`             | Conditionally returns either the first or second value depending on the `gbool` value                                           |

### GPGPU Boolean and Bitwise functions

TODO

### GPGPU Bitcasting functions

TODO

### CPU and GPGPU miscellaneous Vector functions

TODO

### GBuffer-specific functions

TODO

### GPU rendering-related functions

TODO

### Process Exit-related functions

| Name       | Type              | Description                                                               |
| :--------- | :---------------- | :------------------------------------------------------------------------ |
| `ExitCode` | `u8 -> ExitCode`  | Converts a `u8` into an exit code. `u8` directly maps to POSIX exit codes |
| `ExitCode` | `u16 -> ExitCode` | Converts a `u16` into an exit code. Only the first 8-bits are used        |
| `ExitCode` | `u32 -> ExitCode` | Converts a `u32` into an exit code. Only the first 8-bits are used        |
| `ExitCode` | `u64 -> ExitCode` | Converts a `u64` into an exit code. Only the first 8-bits are used        |
| `ExitCode` | `i8 -> ExitCode`  | Converts a `i8` into an exit code. Only the first 7-bits are used         |
| `ExitCode` | `i16 -> ExitCode` | Converts a `i16` into an exit code. Only the first 8-bits are used        |
| `ExitCode` | `i32 -> ExitCode` | Converts a `i32` into an exit code. Only the first 8-bits are used        |
| `ExitCode` | `i64 -> ExitCode` | Converts a `i64` into an exit code. Only the first 8-bits are used        |

### Stdout/stderr-related functions

| Name        | Type           | Description                                                                                               |
| :---------- | :------------- | :-------------------------------------------------------------------------------------------------------- |
| `print{T}`  | `T -> ()`      | Converts the provided value into a string representation and feeds it to `stdout` with a newline appended |
| `eprint{T}` | `T -> ()`      | Converts the provided value into a string representation and feeds it to `stderr` with a newline appended |
| `stdout`    | `string -> ()` | Writes a raw string to `stdout` without any mutation                                                      |
| `stderr`    | `string -> ()` | Writes a raw string to `stderr` without any mutation                                                      |

### Testing-related functions

!!! note

    The testing functions only exist when running `alan test sourcefile.ln`. Under normal compilation these do not exist. The intention is to allow code to have a different behavior when compiled as a test and not require a separate set of test files.

| Name        | Type                                               | Description                                                                                                                | Explicit |
| :---------- | :------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- | :------: |
| `Testing`   | `Array{string} -> Testing`                         | Manual construction of a `Testing` type                                                                                    | ❌       |
| `Testing`   | `() -> Testing`                                    | The normal way to initialize a new `Testing` type                                                                          | ✅       |
| `describe`  | `string -> Testing`                                | Construction of a `Testing` type by a fluent describe block                                                                | ✅       |
| `describe`  | `(string, Testing -> ()) -> Testing`               | Construction of a `Testing` type by a callback-style describe block                                                        | ✅       |
| `describe`  | `(string, Testing -> Testing) -> Testing`          | Construction of a `Testing` type by a one-liner callback-style describe block                                              | ✅       |
| `describe`  | `(Testing, string) -> Testing`                     | Adding a new fluent describe block to a `Testing` value                                                                    | ✅       |
| `describe`  | `(Testing, string, Testing -> ()) -> Testing`      | Adding a new callback-style describe block to a `Testing` value                                                            | ✅       |
| `describe`  | `(Testing, string, Testing -> Testing) -> Testing` | Adding a new one-liner callback-style describe block to a `Testing` value                                                  | ✅       |
| `it`        | `(Testing, string) -> Testing`                     | Adding a new fluent it block to a `Testing` value                                                                          | ✅       |
| `it`        | `(Testing, string, Testing -> ()) -> Testing`      | Adding a new callback-style it block to a `Testing` value                                                                  | ✅       |
| `it`        | `(Testing, string, Testing -> Testing) -> Testing` | Adding a new one-liner call-back style it block to a `Testing` value                                                       | ✅       |
| `assert{T}` | `(Testing, (T, T) -> bool, T, T) -> Testing`       | Adding an assertion to the `Testing` value. Second arg is the comparator fn for the actual (3rd) and expected (4th) values | ✅       |
| `report`    | `Testing -> ()`                                    | Report the result of the test                                                                                              | ✅       |

## Operators

TODO

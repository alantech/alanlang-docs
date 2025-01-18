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

| Name          | Type                          | Description                                                                         |
| :------------ | :---------------------------- | :---------------------------------------------------------------------------------- |
| `add`         | `(u8, u8) -> u8`              | Adds two `u8`s together. Wraps on overflow                                          |
| `sub`         | `(u8, u8) -> u8`              | Subtracts two `u8`s. Wraps on overflow                                              |
| `mul`         | `(u8, u8) -> u8`              | Multiplies two `u8`s. Wraps on overflow                                             |
| `div`         | `(u8, u8) -> u8`              | Divides two `u8`s. Wraps on overflow                                                |
| `mod`         | `(u8, u8) -> u8`              | Returns the modulus (remainder) of the first `u8` divided by the second             |
| `pow`         | `(u8, u8) -> u8`              | Raises the first `u8` to the power of the second                                    |
| `and`         | `(u8, u8) -> u8`              | Performs the bitwise AND operation                                                  |
| `or`          | `(u8, u8) -> u8`              | Performs the bitwise OR operation                                                   |
| `xor`         | `(u8, u8) -> u8`              | Performs the bitwise XOR operation                                                  |
| `not`         | `u8 -> u8`                    | Performs the bitwise NOT operation                                                  |
| `nand`        | `(u8, u8) -> u8`              | Performs the bitwise NAND operation                                                 |
| `nor`         | `(u8, u8) -> u8`              | Performs the bitwise NOR operation                                                  |
| `xnor`        | `(u8, u8) -> u8`              | Performs the bitwise XNOR operation                                                 |
| `eq`          | `(u8, u8) -> bool`            | Returns `true` if both `u8`s are the same                                           |
| `neq`         | `(u8, u8) -> bool`            | Returns `true` if both `u8`s differ                                                 |
| `lt`          | `(u8, u8) -> bool`            | Returns `true` if the first `u8` is less than the second                            |
| `lte`         | `(u8, u8) -> bool`            | Returns `true` if the first `u8` is less than or equal to the second                |
| `gt`          | `(u8, u8) -> bool`            | Returns `true` if the first `u8` is greater than the second                         |
| `gte`         | `(u8, u8) -> bool`            | Returns `true` if the first `u8` is greater than or equal to the second             |
| `min`         | `(u8, u8) -> u8`              | Returns the smaller `u8`                                                            |
| `max`         | `(u8, u8) -> u8`              | Returns the larger `u8`                                                             |
| `clamp`       | `(u8, u8, u8) -> u8`          | Clamps the first `u8` to be above the second and below the third                    |
| `shl`         | `(u8, u8) -> u8`              | Shifts the first `u8` left the number of places specified by the second             |
| `shr`         | `(u8, u8) -> u8`              | Shifts the first `u8` right the number of places specified by the second            |
| `wrl`         | `(u8, u8) -> u8`              | Wrapping shifts the first `u8` left the number of place specified by the second     |
| `wrr`         | `(u8, u8) -> u8`              | Wrapping shifts the first `u8` right the number of place specified by the second    |
| `clz`         | `u8 -> u8`                    | Returns the number of leading zeroes for the `u8`                                   |
| `ones`        | `u8 -> u8`                    | Returns the number of one bits in the `u8`                                          |
| `ctz`         | `u8 -> u8`                    | Returns the number of trailing zeroes for the `u8`                                  |
| `reverseBits` | `u8 -> u8`                    | Returns the `u8` with its bits in reverse order                                     |
| `extractBits` | `(u8, u8, u8) -> u8`          | From the first `u8`, start at the bit specified by the second extract to the third  |
| `insertBits`  | `(u8, u8, u8, u8) -> u8`      | Into the first `u8` insert bits from the second starting at the bit specified by the third until the fourth |
| `add`         | `(u16, u16) -> u16`           | Adds two `u16`s together. Wraps on overflow                                         |
| `sub`         | `(u16, u16) -> u16`           | Subtracts two `u16`s. Wraps on overflow                                             |
| `mul`         | `(u16, u16) -> u16`           | Multiplies two `u16`s. Wraps on overflow                                            |
| `div`         | `(u16, u16) -> u16`           | Divides two `u16`s. Wraps on overflow                                               |
| `mod`         | `(u16, u16) -> u16`           | Returns the modulus (remainder) of the first `u16` divided by the second            |
| `pow`         | `(u16, u16) -> u16`           | Raises the first `u16` to the power of the second                                   |
| `and`         | `(u16, u16) -> u16`           | Performs the bitwise AND operation                                                  |
| `or`          | `(u16, u16) -> u16`           | Performs the bitwise OR operation                                                   |
| `xor`         | `(u16, u16) -> u16`           | Performs the bitwise XOR operation                                                  |
| `not`         | `u16 -> u16`                  | Performs the bitwise NOT operation                                                  |
| `nand`        | `(u16, u16) -> u16`           | Performs the bitwise NAND operation                                                 |
| `nor`         | `(u16, u16) -> u16`           | Performs the bitwise NOR operation                                                  |
| `xnor`        | `(u16, u16) -> u16`           | Performs the bitwise XNOR operation                                                 |
| `eq`          | `(u16, u16) -> bool`          | Returns `true` if both `u16`s are the same                                          |
| `neq`         | `(u16, u16) -> bool`          | Returns `true` if both `u16`s differ                                                |
| `lt`          | `(u16, u16) -> bool`          | Returns `true` if the first `u16` is less than the second                           |
| `lte`         | `(u16, u16) -> bool`          | Returns `true` if the first `u16` is less than or equal to the second               |
| `gt`          | `(u16, u16) -> bool`          | Returns `true` if the first `u16` is greater than the second                        |
| `gte`         | `(u16, u16) -> bool`          | Returns `true` if the first `u16` is greater than or equal to the second            |
| `min`         | `(u16, u16) -> u16`           | Returns the smaller `u16`                                                           |
| `max`         | `(u16, u16) -> u16`           | Returns the larger `u16`                                                            |
| `clamp`       | `(u16, u16, u16) -> u16`      | Clamps the first `u16` to be above the second and below the third                   |
| `shl`         | `(u16, u16) -> u16`           | Shifts the first `u16` left the number of places specified by the second            |
| `shr`         | `(u16, u16) -> u16`           | Shifts the first `u16` right the number of places specified by the second           |
| `wrl`         | `(u16, u16) -> u16`           | Wrapping shifts the first `u16` left the number of place specified by the second    |
| `wrr`         | `(u16, u16) -> u16`           | Wrapping shifts the first `u16` right the number of place specified by the second   |
| `clz`         | `u16 -> u16`                  | Returns the number of leading zeroes for the `u16`                                  |
| `ones`        | `u16 -> u16`                  | Returns the number of one bits in the `u16`                                         |
| `ctz`         | `u16 -> u16`                  | Returns the number of trailing zeroes for the `u16`                                 |
| `reverseBits` | `u16 -> u16`                  | Returns the `u16` with its bits in reverse order                                    |
| `extractBits` | `(u16, u16, u16) -> u16`      | From the first `u16`, start at the bit specified by the second extract to the third |
| `insertBits`  | `(u16, u16, u16, u16) -> u16` | Into the first `u16` insert bits from the second starting at the bit specified by the third until the fourth |
| `add`         | `(u32, u32) -> u32`           | Adds two `u32`s together. Wraps on overflow                                         |
| `sub`         | `(u32, u32) -> u32`           | Subtracts two `u32`s. Wraps on overflow                                             |
| `mul`         | `(u32, u32) -> u32`           | Multiplies two `u32`s. Wraps on overflow                                            |
| `div`         | `(u32, u32) -> u32`           | Divides two `u32`s. Wraps on overflow                                               |
| `mod`         | `(u32, u32) -> u32`           | Returns the modulus (remainder) of the first `u32` divided by the second            |
| `pow`         | `(u32, u32) -> u32`           | Raises the first `u32` to the power of the second                                   |
| `and`         | `(u32, u32) -> u32`           | Performs the bitwise AND operation                                                  |
| `or`          | `(u32, u32) -> u32`           | Performs the bitwise OR operation                                                   |
| `xor`         | `(u32, u32) -> u32`           | Performs the bitwise XOR operation                                                  |
| `not`         | `u32 -> u32`                  | Performs the bitwise NOT operation                                                  |
| `nand`        | `(u32, u32) -> u32`           | Performs the bitwise NAND operation                                                 |
| `nor`         | `(u32, u32) -> u32`           | Performs the bitwise NOR operation                                                  |
| `xnor`        | `(u32, u32) -> u32`           | Performs the bitwise XNOR operation                                                 |
| `eq`          | `(u32, u32) -> bool`          | Returns `true` if both `u32`s are the same                                          |
| `neq`         | `(u32, u32) -> bool`          | Returns `true` if both `u32`s differ                                                |
| `lt`          | `(u32, u32) -> bool`          | Returns `true` if the first `u32` is less than the second                           |
| `lte`         | `(u32, u32) -> bool`          | Returns `true` if the first `u32` is less than or equal to the second               |
| `gt`          | `(u32, u32) -> bool`          | Returns `true` if the first `u32` is greater than the second                        |
| `gte`         | `(u32, u32) -> bool`          | Returns `true` if the first `u32` is greater than or equal to the second            |
| `min`         | `(u32, u32) -> u32`           | Returns the smaller `u32`                                                           |
| `max`         | `(u32, u32) -> u32`           | Returns the larger `u32`                                                            |
| `clamp`       | `(u32, u32, u32) -> u32`      | Clamps the first `u32` to be above the second and below the third                   |
| `shl`         | `(u32, u32) -> u32`           | Shifts the first `u32` left the number of places specified by the second            |
| `shr`         | `(u32, u32) -> u32`           | Shifts the first `u32` right the number of places specified by the second           |
| `wrl`         | `(u32, u32) -> u32`           | Wrapping shifts the first `u32` left the number of place specified by the second    |
| `wrr`         | `(u32, u32) -> u32`           | Wrapping shifts the first `u32` right the number of place specified by the second   |
| `clz`         | `u32 -> u32`                  | Returns the number of leading zeroes for the `u32`                                  |
| `ones`        | `u32 -> u32`                  | Returns the number of one bits in the `u32`                                         |
| `ctz`         | `u32 -> u32`                  | Returns the number of trailing zeroes for the `u32`                                 |
| `reverseBits` | `u32 -> u32`                  | Returns the `u32` with its bits in reverse order                                    |
| `extractBits` | `(u32, u32, u32) -> u32`      | From the first `u32`, start at the bit specified by the second extract to the third |
| `insertBits`  | `(u32, u32, u32, u32) -> u32` | Into the first `u32` insert bits from the second starting at the bit specified by the third until the fourth |
| `add`         | `(u64, u64) -> u64`           | Adds two `u64`s together. Wraps on overflow                                         |
| `sub`         | `(u64, u64) -> u64`           | Subtracts two `u64`s. Wraps on overflow                                             |
| `mul`         | `(u64, u64) -> u64`           | Multiplies two `u64`s. Wraps on overflow                                            |
| `div`         | `(u64, u64) -> u64`           | Divides two `u64`s. Wraps on overflow                                               |
| `mod`         | `(u64, u64) -> u64`           | Returns the modulus (remainder) of the first `u64` divided by the second            |
| `pow`         | `(u64, u64) -> u64`           | Raises the first `u64` to the power of the second                                   |
| `and`         | `(u64, u64) -> u64`           | Performs the bitwise AND operation                                                  |
| `or`          | `(u64, u64) -> u64`           | Performs the bitwise OR operation                                                   |
| `xor`         | `(u64, u64) -> u64`           | Performs the bitwise XOR operation                                                  |
| `not`         | `u64 -> u64`                  | Performs the bitwise NOT operation                                                  |
| `nand`        | `(u64, u64) -> u64`           | Performs the bitwise NAND operation                                                 |
| `nor`         | `(u64, u64) -> u64`           | Performs the bitwise NOR operation                                                  |
| `xnor`        | `(u64, u64) -> u64`           | Performs the bitwise XNOR operation                                                 |
| `eq`          | `(u64, u64) -> bool`          | Returns `true` if both `u64`s are the same                                          |
| `neq`         | `(u64, u64) -> bool`          | Returns `true` if both `u64`s differ                                                |
| `lt`          | `(u64, u64) -> bool`          | Returns `true` if the first `u64` is less than the second                           |
| `lte`         | `(u64, u64) -> bool`          | Returns `true` if the first `u64` is less than or equal to the second               |
| `gt`          | `(u64, u64) -> bool`          | Returns `true` if the first `u64` is greater than the second                        |
| `gte`         | `(u64, u64) -> bool`          | Returns `true` if the first `u64` is greater than or equal to the second            |
| `min`         | `(u64, u64) -> u64`           | Returns the smaller `u64`                                                           |
| `max`         | `(u64, u64) -> u64`           | Returns the larger `u64`                                                            |
| `clamp`       | `(u64, u64, u64) -> u64`      | Clamps the first `u64` to be above the second and below the third                   |
| `shl`         | `(u64, u64) -> u64`           | Shifts the first `u64` left the number of places specified by the second            |
| `shr`         | `(u64, u64) -> u64`           | Shifts the first `u64` right the number of places specified by the second           |
| `wrl`         | `(u64, u64) -> u64`           | Wrapping shifts the first `u64` left the number of place specified by the second    |
| `wrr`         | `(u64, u64) -> u64`           | Wrapping shifts the first `u64` right the number of place specified by the second   |
| `clz`         | `u64 -> u64`                  | Returns the number of leading zeroes for the `u64`                                  |
| `ones`        | `u64 -> u64`                  | Returns the number of one bits in the `u64`                                         |
| `ctz`         | `u64 -> u64`                  | Returns the number of trailing zeroes for the `u64`                                 |
| `reverseBits` | `u64 -> u64`                  | Returns the `u64` with its bits in reverse order                                    |
| `extractBits` | `(u64, u64, u64) -> u64`      | From the first `u64`, start at the bit specified by the second extract to the third |
| `insertBits`  | `(u64, u64, u64, u64) -> u64` | Into the first `u64` insert bits from the second starting at the bit specified by the third until the fourth |

### Signed Integer-related functions

| Name          | Type                          | Description                                                                         |
| :------------ | :---------------------------- | :---------------------------------------------------------------------------------- |
| `add`         | `(i8, i8) -> i8`              | Adds two `i8`s together. Wraps on overflow                                          |
| `sub`         | `(i8, i8) -> i8`              | Subtracts two `i8`s. Wraps on overflow                                              |
| `mul`         | `(i8, i8) -> i8`              | Multiplies two `i8`s. Wraps on overflow                                             |
| `div`         | `(i8, i8) -> i8`              | Divides two `i8`s. Wraps on overflow                                                |
| `mod`         | `(i8, i8) -> i8`              | Returns the modulus (remainder) of the first `i8` divided by the second             |
| `pow`         | `(i8, i8) -> i8`              | Raises the first `i8` to the power of the second                                    |
| `abs`         | `i8 -> i8`                    | Returns the positive version of the `i8`                                            |
| `neg`         | `i8 -> i8`                    | Multiplies the `i8` by `-1`                                                         |
| `and`         | `(i8, i8) -> i8`              | Performs the bitwise AND operation                                                  |
| `or`          | `(i8, i8) -> i8`              | Performs the bitwise OR operation                                                   |
| `xor`         | `(i8, i8) -> i8`              | Performs the bitwise XOR operation                                                  |
| `not`         | `i8 -> i8`                    | Performs the bitwise NOT operation                                                  |
| `nand`        | `(i8, i8) -> i8`              | Performs the bitwise NAND operation                                                 |
| `nor`         | `(i8, i8) -> i8`              | Performs the bitwise NOR operation                                                  |
| `xnor`        | `(i8, i8) -> i8`              | Performs the bitwise XNOR operation                                                 |
| `eq`          | `(i8, i8) -> bool`            | Returns `true` if both `i8`s are the same                                           |
| `neq`         | `(i8, i8) -> bool`            | Returns `true` if both `i8`s differ                                                 |
| `lt`          | `(i8, i8) -> bool`            | Returns `true` if the first `i8` is less than the second                            |
| `lte`         | `(i8, i8) -> bool`            | Returns `true` if the first `i8` is less than or equal to the second                |
| `gt`          | `(i8, i8) -> bool`            | Returns `true` if the first `i8` is greater than the second                         |
| `gte`         | `(i8, i8) -> bool`            | Returns `true` if the first `i8` is greater than or equal to the second             |
| `min`         | `(i8, i8) -> i8`              | Returns the smaller `i8`                                                            |
| `max`         | `(i8, i8) -> i8`              | Returns the larger `i8`                                                             |
| `clamp`       | `(i8, i8, i8) -> i8`          | Clamps the first `i8` to be above the second and below the third                    |
| `shl`         | `(i8, i8) -> i8`              | Shifts the first `i8` left the number of places specified by the second             |
| `shr`         | `(i8, i8) -> i8`              | Shifts the first `i8` right the number of places specified by the second            |
| `wrl`         | `(i8, i8) -> i8`              | Wrapping shifts the first `i8` left the number of place specified by the second     |
| `wrr`         | `(i8, i8) -> i8`              | Wrapping shifts the first `i8` right the number of place specified by the second    |
| `clz`         | `i8 -> i8`                    | Returns the number of leading zeroes for the `i8`                                   |
| `ones`        | `i8 -> i8`                    | Returns the number of one bits in the `i8`                                          |
| `ctz`         | `i8 -> i8`                    | Returns the number of trailing zeroes for the `i8`                                  |
| `reverseBits` | `i8 -> i8`                    | Returns the `i8` with its bits in reverse order                                     |
| `extractBits` | `(i8, i8, i8) -> i8`          | From the first `i8`, start at the bit specified by the second extract to the third  |
| `insertBits`  | `(i8, i8, i8, i8) -> i8`      | Into the first `i8` insert bits from the second starting at the bit specified by the third until the fourth |
| `add`         | `(i16, i16) -> i16`           | Adds two `i16`s together. Wraps on overflow                                         |
| `sub`         | `(i16, i16) -> i16`           | Subtracts two `i16`s. Wraps on overflow                                             |
| `mul`         | `(i16, i16) -> i16`           | Multiplies two `i16`s. Wraps on overflow                                            |
| `div`         | `(i16, i16) -> i16`           | Divides two `i16`s. Wraps on overflow                                               |
| `mod`         | `(i16, i16) -> i16`           | Returns the modulus (remainder) of the first `i16` divided by the second            |
| `pow`         | `(i16, i16) -> i16`           | Raises the first `i16` to the power of the second                                   |
| `abs`         | `i16 -> i16`                  | Returns the positive version of the `i16`                                           |
| `neg`         | `i16 -> i16`                  | Multiplies the `i16` by `-1`                                                        |
| `and`         | `(i16, i16) -> i16`           | Performs the bitwise AND operation                                                  |
| `or`          | `(i16, i16) -> i16`           | Performs the bitwise OR operation                                                   |
| `xor`         | `(i16, i16) -> i16`           | Performs the bitwise XOR operation                                                  |
| `not`         | `i16 -> i16`                  | Performs the bitwise NOT operation                                                  |
| `nand`        | `(i16, i16) -> i16`           | Performs the bitwise NAND operation                                                 |
| `nor`         | `(i16, i16) -> i16`           | Performs the bitwise NOR operation                                                  |
| `xnor`        | `(i16, i16) -> i16`           | Performs the bitwise XNOR operation                                                 |
| `eq`          | `(i16, i16) -> bool`          | Returns `true` if both `i16`s are the same                                          |
| `neq`         | `(i16, i16) -> bool`          | Returns `true` if both `i16`s differ                                                |
| `lt`          | `(i16, i16) -> bool`          | Returns `true` if the first `i16` is less than the second                           |
| `lte`         | `(i16, i16) -> bool`          | Returns `true` if the first `i16` is less than or equal to the second               |
| `gt`          | `(i16, i16) -> bool`          | Returns `true` if the first `i16` is greater than the second                        |
| `gte`         | `(i16, i16) -> bool`          | Returns `true` if the first `i16` is greater than or equal to the second            |
| `min`         | `(i16, i16) -> i16`           | Returns the smaller `i16`                                                           |
| `max`         | `(i16, i16) -> i16`           | Returns the larger `i16`                                                            |
| `clamp`       | `(i16, i16, i16) -> i16`      | Clamps the first `i16` to be above the second and below the third                   |
| `shl`         | `(i16, i16) -> i16`           | Shifts the first `i16` left the number of places specified by the second            |
| `shr`         | `(i16, i16) -> i16`           | Shifts the first `i16` right the number of places specified by the second           |
| `wrl`         | `(i16, i16) -> i16`           | Wrapping shifts the first `i16` left the number of place specified by the second    |
| `wrr`         | `(i16, i16) -> i16`           | Wrapping shifts the first `i16` right the number of place specified by the second   |
| `clz`         | `i16 -> i16`                  | Returns the number of leading zeroes for the `i16`                                  |
| `ones`        | `i16 -> i16`                  | Returns the number of one bits in the `i16`                                         |
| `ctz`         | `i16 -> i16`                  | Returns the number of trailing zeroes for the `i16`                                 |
| `reverseBits` | `i16 -> i16`                  | Returns the `i16` with its bits in reverse order                                    |
| `extractBits` | `(i16, i16, i16) -> i16`      | From the first `i16`, start at the bit specified by the second extract to the third |
| `insertBits`  | `(i16, i16, i16, i16) -> i16` | Into the first `i16` insert bits from the second starting at the bit specified by the third until the fourth |
| `add`         | `(i32, i32) -> i32`           | Adds two `i32`s together. Wraps on overflow                                         |
| `sub`         | `(i32, i32) -> i32`           | Subtracts two `i32`s. Wraps on overflow                                             |
| `mul`         | `(i32, i32) -> i32`           | Multiplies two `i32`s. Wraps on overflow                                            |
| `div`         | `(i32, i32) -> i32`           | Divides two `i32`s. Wraps on overflow                                               |
| `mod`         | `(i32, i32) -> i32`           | Returns the modulus (remainder) of the first `i32` divided by the second            |
| `pow`         | `(i32, i32) -> i32`           | Raises the first `i32` to the power of the second                                   |
| `abs`         | `i32 -> i32`                  | Returns the positive version of the `i32`                                           |
| `neg`         | `i32 -> i32`                  | Multiplies the `i32` by `-1`                                                        |
| `and`         | `(i32, i32) -> i32`           | Performs the bitwise AND operation                                                  |
| `or`          | `(i32, i32) -> i32`           | Performs the bitwise OR operation                                                   |
| `xor`         | `(i32, i32) -> i32`           | Performs the bitwise XOR operation                                                  |
| `not`         | `i32 -> i32`                  | Performs the bitwise NOT operation                                                  |
| `nand`        | `(i32, i32) -> i32`           | Performs the bitwise NAND operation                                                 |
| `nor`         | `(i32, i32) -> i32`           | Performs the bitwise NOR operation                                                  |
| `xnor`        | `(i32, i32) -> i32`           | Performs the bitwise XNOR operation                                                 |
| `eq`          | `(i32, i32) -> bool`          | Returns `true` if both `i32`s are the same                                          |
| `neq`         | `(i32, i32) -> bool`          | Returns `true` if both `i32`s differ                                                |
| `lt`          | `(i32, i32) -> bool`          | Returns `true` if the first `i32` is less than the second                           |
| `lte`         | `(i32, i32) -> bool`          | Returns `true` if the first `i32` is less than or equal to the second               |
| `gt`          | `(i32, i32) -> bool`          | Returns `true` if the first `i32` is greater than the second                        |
| `gte`         | `(i32, i32) -> bool`          | Returns `true` if the first `i32` is greater than or equal to the second            |
| `min`         | `(i32, i32) -> i32`           | Returns the smaller `i32`                                                           |
| `max`         | `(i32, i32) -> i32`           | Returns the larger `i32`                                                            |
| `clamp`       | `(i32, i32, i32) -> i32`      | Clamps the first `i32` to be above the second and below the third                   |
| `shl`         | `(i32, i32) -> i32`           | Shifts the first `i32` left the number of places specified by the second            |
| `shr`         | `(i32, i32) -> i32`           | Shifts the first `i32` right the number of places specified by the second           |
| `wrl`         | `(i32, i32) -> i32`           | Wrapping shifts the first `i32` left the number of place specified by the second    |
| `wrr`         | `(i32, i32) -> i32`           | Wrapping shifts the first `i32` right the number of place specified by the second   |
| `clz`         | `i32 -> i32`                  | Returns the number of leading zeroes for the `i32`                                  |
| `ones`        | `i32 -> i32`                  | Returns the number of one bits in the `i32`                                         |
| `ctz`         | `i32 -> i32`                  | Returns the number of trailing zeroes for the `i32`                                 |
| `reverseBits` | `i32 -> i32`                  | Returns the `i32` with its bits in reverse order                                    |
| `extractBits` | `(i32, i32, i32) -> i32`      | From the first `i32`, start at the bit specified by the second extract to the third |
| `insertBits`  | `(i32, i32, i32, i32) -> i32` | Into the first `i32` insert bits from the second starting at the bit specified by the third until the fourth |
| `add`         | `(i64, i64) -> i64`           | Adds two `i64`s together. Wraps on overflow                                         |
| `sub`         | `(i64, i64) -> i64`           | Subtracts two `i64`s. Wraps on overflow                                             |
| `mul`         | `(i64, i64) -> i64`           | Multiplies two `i64`s. Wraps on overflow                                            |
| `div`         | `(i64, i64) -> i64`           | Divides two `i64`s. Wraps on overflow                                               |
| `mod`         | `(i64, i64) -> i64`           | Returns the modulus (remainder) of the first `i64` divided by the second            |
| `pow`         | `(i64, i64) -> i64`           | Raises the first `i64` to the power of the second                                   |
| `abs`         | `i64 -> i64`                  | Returns the positive version of the `i64`                                           |
| `neg`         | `i64 -> i64`                  | Multiplies the `i64` by `-1`                                                        |
| `and`         | `(i64, i64) -> i64`           | Performs the bitwise AND operation                                                  |
| `or`          | `(i64, i64) -> i64`           | Performs the bitwise OR operation                                                   |
| `xor`         | `(i64, i64) -> i64`           | Performs the bitwise XOR operation                                                  |
| `not`         | `i64 -> i64`                  | Performs the bitwise NOT operation                                                  |
| `nand`        | `(i64, i64) -> i64`           | Performs the bitwise NAND operation                                                 |
| `nor`         | `(i64, i64) -> i64`           | Performs the bitwise NOR operation                                                  |
| `xnor`        | `(i64, i64) -> i64`           | Performs the bitwise XNOR operation                                                 |
| `eq`          | `(i64, i64) -> bool`          | Returns `true` if both `i64`s are the same                                          |
| `neq`         | `(i64, i64) -> bool`          | Returns `true` if both `i64`s differ                                                |
| `lt`          | `(i64, i64) -> bool`          | Returns `true` if the first `i64` is less than the second                           |
| `lte`         | `(i64, i64) -> bool`          | Returns `true` if the first `i64` is less than or equal to the second               |
| `gt`          | `(i64, i64) -> bool`          | Returns `true` if the first `i64` is greater than the second                        |
| `gte`         | `(i64, i64) -> bool`          | Returns `true` if the first `i64` is greater than or equal to the second            |
| `min`         | `(i64, i64) -> i64`           | Returns the smaller `i64`                                                           |
| `max`         | `(i64, i64) -> i64`           | Returns the larger `i64`                                                            |
| `clamp`       | `(i64, i64, i64) -> i64`      | Clamps the first `i64` to be above the second and below the third                   |
| `shl`         | `(i64, i64) -> i64`           | Shifts the first `i64` left the number of places specified by the second            |
| `shr`         | `(i64, i64) -> i64`           | Shifts the first `i64` right the number of places specified by the second           |
| `wrl`         | `(i64, i64) -> i64`           | Wrapping shifts the first `i64` left the number of place specified by the second    |
| `wrr`         | `(i64, i64) -> i64`           | Wrapping shifts the first `i64` right the number of place specified by the second   |
| `clz`         | `i64 -> i64`                  | Returns the number of leading zeroes for the `i64`                                  |
| `ones`        | `i64 -> i64`                  | Returns the number of one bits in the `i64`                                         |
| `ctz`         | `i64 -> i64`                  | Returns the number of trailing zeroes for the `i64`                                 |
| `reverseBits` | `i64 -> i64`                  | Returns the `i64` with its bits in reverse order                                    |
| `extractBits` | `(i64, i64, i64) -> i64`      | From the first `i64`, start at the bit specified by the second extract to the third |
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

TODO

### Dictionary-related functions

TODO

### Set-related functions

TODO

### Tree-related functions

TODO

### Thread-related functions

TODO

### Time-related functions

TODO

### Uuid-related functions

TODO

### GPU-related functions

TODO

### Bitcasting functions

TODO

### Process Exit-related functions

TODO

### Stdout/stderr-related functions

TODO

### Testing-related functions

TODO

## Operators

TODO

#### Types

There are two major categories of types in `alan`: built-in types and user-defined types. User-defined types are similar to `struct`s in C as they are simply named compound types made up of other user-defined types or built-in types.

Built-in types also divide into a few categories: basic types, strings, and special types.

##### Basic Types

Basic types include integers (`int8`, `int16`, `int32`, and `int64`), floating point numbers (`float32` and `float64`), booleans (`bool`), and the `void` (no value) type. The numbers refer to the number of bits consumed by the basic type, and because of the limitations of the JVM, there are no unsigned variants (it's possible, but it'll be difficult and slow -- I'll eventually have to fix this, but I'm hoping I can do it by just rewriting on top of LLVM when the actual compiler gets started).

The basic types all have in-line constant representations.

The integers have basic base-10 integer form as well as hexadecimal form supported right now. Eventually binary and octal will also be supported but that is not yet implemented.

The floating point numbers have only basic base-10 with a decimal point form, no scientific notation form yet, but that will also be implemented in the future.

Booleans are represented by the keywords `true` and `false`. `void` has no representation beyond `void`. It can't be assigned to, and is meant to represent when functions return nothing.

The basic types are included in the root scope and never need to be explicitly defined, they always exist.

##### Strings

Strings (`string`) are a bit beyond the basic type. Traditionally they can be thought of as a byte array, but UTF codepoints make that representation not manageable. From the perspective of the user of `alan` they are `utf-8` codepoints (as that is what the parser reads the files as), from the perspective of the `alan` interpreter they are `utf-16` codepoints, and from the perspective of conversion of the string into bytes, that is undefined because I haven't built that yet. ;)

Strings are defined by wrapping double or single quotes (`"` or `'`) around text. Right now they are very primitive and don't understand escape codes so it is impossible to define a string that uses both single and double quotes internally, along with unprintable characters, but based on my reading of the parser they should handle multi-line strings just fine? All of this is subject to change as the parser and interpreter (and eventually compiler) are polished up.

Strings are also included in the root scope and never need to be explicitly defined.

##### User-Defined Types

User-defined types must be declared by the user (er, duh?), and they follow the following syntax:

```
type typename {
  propertyName: propertyType
  otherProperty: otherType
}
```

There is currently no syntax to define a user-defined type constant (so they can't be used as constants, yet), but the intended syntax that will eventually be implemented looks like the following:

```
const myVal: typename = new typename {
  propertyName: propertyValue
  otherProperty: otherValue
}
```

The redundant `typename` in that example will also eventually be eliminated by type inference, reducing it to just:

```
const myVal = new typename {
  propertyName: propertyValue
  otherProperty: otherValue
}
```

User-defined types have another interesting feature: they can be generic. That means one or more of the actual sub-types used by the type is not yet defined, but will be "solidified" later on with the creation of a new type based on it.

Generic types look like this:

```
type typename<A, B> {
  propertyName: A
  otherProperty: B
}
```

Where later on you can "solidify" that type either by creating an alias with the types filled in:

```
type typenameIntStr = typename<int64, string>
```

or just declaring a variable that uses a "solidified" type:

```
let myVar: typename<bool, float64>
```

However, until interfaces are implemented, you cannot write functions that operate on generic types, because there is no guarantee that the type it solidifies into has the necessary primitives to operate on, so generic types are mostly an oddity used to make the special types possible until that is added.

##### Special Types: Arrays, Maps, and Trees (and Sets?)

In a language with no looping or recursion, every function has a predictable runtime, but they also can't do very much, as evidenced by the limited utility of eBPF (but also the lack of an issue with it running in kernel-space). It is essentially impossible to implement any real computing algorithms yourself.

But if there were the right built-in primitives with the right built-in functionality, you could combine them to create the algorithms you need without the looping construct. This is the purpose of the special types, Arrays, Maps, and Trees. They are special-cased generic types that come with built-in functions to perform all of the various transforms one would want, taking functions to perform the tasks.

`Array<V>`, `Tree<V>`, (and `Set<V>`) are singly-generic while `Map<K, V>` has two generic types. They function almost identically to the built-in generic types from Java of a similar name, but it is `alan`'s job to determine the correct way to realize them: whether the `Array` is a `LinkedList` or `ArrayList` (hint: it's gonna be a hybrid, but mostly `ArrayList`), and whether to shard the data across threads to run in parallel or just stick with sequential because the scatter-gather synchronization costs are too high.

Still working on this part, but it's what will make the language bearable, and coming from JavaScript will likely not impact your idiomatic style much at all.


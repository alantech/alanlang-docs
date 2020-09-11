#### Built-in Interfaces

There are a few built-in [interfaces](../interfaces.md) meant for working with several built-in types and functions.

```alan
// An empty interface, it can match any value, but you can only accept it and pass it along to
// something else. Useful for logical "glue" functions like `pair`, `cond`, `map`, `reduce`, etc.
interface any {}
```

```alan
// A second empty interface, useful to allow functions to declare that it accepts two arguments of
// any kind and they don't need to match each other.
interface anythingElse {}
```

```alan
// An interface that restricts valid types to only those that can be converted into strings. Useful
// for printing.
interface Stringifiable {
  toString(Stringifiable): string
}
```

```alan
// An interface that determines if a type is hashable and comparable. Used by HashMap for the keys.
interface Hashable {
  toHash(Hashable): int64
  eq(Hashable, Hashable): bool
}
```
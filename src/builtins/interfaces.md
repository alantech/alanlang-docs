#### Built-in Interfaces

There are a few built-in [interfaces](../interfaces.md) meant for working with several built-in types and functions.

##### any

```alan
// An empty interface, it can match any value, but you can only accept it and pass it along to
// something else. Useful for logical "glue" functions like `pair`, `cond`, `map`, `reduce`, etc.
interface any {}
```

##### anythingElse

```alan
// A second empty interface, useful to allow functions to declare that it accepts two arguments of
// any kind and they don't need to match each other.
interface anythingElse {}
```

##### Stringifiable

```alan
// An interface that restricts valid types to only those that can be converted into strings. Useful
// for printing.
interface Stringifiable {
  toString(Stringifiable): string,
}
```

#### Orderable
```alan
// An interface that restricts valid types to only those that can be ordered versus each other. This
// is used for the `min` and `max` functions. Will later also be used for Array sorting.
interface Orderable {
  lt(Orderable, Orderable): bool,
  lte(Orderable, Orderable): bool,
  gt(Orderable, Orderable): bool,
  gte(Orderable, Orderable): bool,
}
```

##### Hashable

```alan
// An interface that determines if a type is hashable and comparable. Used by HashMap for the keys.
// Due to how `toHash` is implemented, the true constraint is only if `eq` has been implemented.
interface Hashable {
  toHash(Hashable): int64,
  eq(Hashable, Hashable): bool,
}
```

##### canFloat64

```alan
// An interface that determines if the type can be converted to a float64. Used for the `float` type
// alias.
interface canFloat64 {
  toFloat64(canFloat64): float64,
}
```

##### canInt64

```alan
// An interface that determines if the type can be converted to an int64. Used for the `int` type
// alias.
interface canInt64 {
  toInt64(canInt64): int64,
}
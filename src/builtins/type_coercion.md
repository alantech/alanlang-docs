#### Type Coercion

##### toFloat or toFloat64

```alan
// Converts the built-in basic types to 64-bit floats which are the default numeric float type
toFloat(int8): float     // toFloat64(int8): float64
toFloat(int16): float    // toFloat64(int16): float64
toFloat(int32): float    // toFloat64(int32): float64
toFloat(int64): float    // toFloat64(int64): float64
toFloat(float32): float  // toFloat64(float32): float64
toFloat(float): float    // toFloat64(float64): float64
toFloat(bool): float     // toFloat64(bool): float64
toFloat(string): float   // toFloat64(string): float64
```

##### toFloat32

```alan
// Converts the built-in basic types to 32-bit floats
toFloat32(int8): float32
toFloat32(int16): float32
toFloat32(int32): float32
toFloat32(int64): float32
toFloat32(float32): float32
toFloat32(float64): float32
toFloat32(bool): float32
toFloat32(string): float32
```

##### toInt or toInt64

```alan
// Converts the built-in basic types to 64-bit integers which are the default numeric int type
toInt(int8): int         // toInt64(int8): int64
toInt(int16): int        // toInt64(int16): int64
toInt(int32): int        // toInt64(int32): int64
toInt(int): int          // toInt64(int64): int64
toInt(float32): int      // toInt64(float32): int64
toInt(float64): int      // toInt64(float64): int64
toInt(bool): int         // toInt64(bool): int64
toInt(string): int       // toInt64(string): int64
```

##### toInt32

```alan
// Converts the built-in basic types to 32-bit integers
toInt32(int8): int32
toInt32(int16): int32
toInt32(int32): int32
toInt32(int64): int32
toInt32(float32): int32
toInt32(float64): int32
toInt32(bool): int32
toInt32(string): int32
```

##### toInt16

```alan
// Converts the built-in basic types to 16-bit integers
toInt16(int8): int16
toInt16(int16): int16
toInt16(int32): int16
toInt16(int64): int16
toInt16(float32): int16
toInt16(float64): int16
toInt16(bool): int16
toInt16(string): int16
```

##### toInt8

```alan
// Converts the built-in basic types to 8-bit integers
toInt8(int8): int8
toInt8(int16): int8
toInt8(int32): int8
toInt8(int64): int8
toInt8(float32): int8
toInt8(float64): int8
toInt8(bool): int8
toInt8(string): int8
```

##### toBool

```alan
// Converts the built-in basic types to booleans
toBool(int8): bool
toBool(int16): bool
toBool(int32): bool
toBool(int64): bool
toBool(float32): bool
toBool(float64): bool
toBool(bool): bool
toBool(string): bool
```

##### toString

```alan
// Converts the built-in types to strings
toString(int8): string
toString(int16): string
toString(int32): string
toString(int64): string
toString(float32): string
toString(float64): string
toString(bool): string
toString(string): string
toString(Error): string
toString(Result<Stringifiable>): string
```

These coercions will not fail. When converting down into an integer of a smaller bitsize, numbers larger than that integer's `INT_MAX` are pegged at `INT_MAX`, smaller than `INT_MIN` pegged at `INT_MIN` and `NaN` or strings that aren't actually integers are converted to `0`. This may be changed to a `Result` type that requires a user-defined default value on failure. `Result` types wrapping a type that can also be converted to a string directly, with either the string version of the result, or the error message.

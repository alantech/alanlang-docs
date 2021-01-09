#### Comparators

Comparator functions accept Result-wrapped values, but they consume them and always return a true or false. If either value to be compared is an error, the comparators will return false, modeled after IEEE Floating Point NaN comparison behavior.

##### eq

```alan
// Checks if the two values are equal
eq(int8, int8): bool
eq(Result<int8>, int8): bool
eq(int8, Result<int8>): bool
eq(Result<int8>, Result<int8>): bool
eq(int16, int16): bool
eq(Result<int16>, int16): bool
eq(int16, Result<int16>): bool
eq(Result<int16>, Result<int16>): bool
eq(int32, int32): bool
eq(Result<int32>, int32): bool
eq(int32, Result<int32>): bool
eq(Result<int32>, Result<int32>): bool
eq(int64, int64): bool
eq(Result<int64>, int64): bool
eq(int64, Result<int64>): bool
eq(Result<int64>, Result<int64>): bool
eq(float32, float32): bool
eq(Result<float32>, float32): bool
eq(float32, Result<float32>): bool
eq(Result<float32>, Result<float32>): bool
eq(float64, float64): bool
eq(Result<float64>, float64): bool
eq(float64, Result<float64>): bool
eq(Result<float64>, Result<float64>): bool
eq(string, string): bool
eq(Result<string>, string): bool
eq(string, Result<string>): bool
eq(Result<string>, Result<string>): bool
eq(bool, bool): bool
eq(Result<bool>, bool): bool
eq(bool, Result<bool>): bool
eq(Result<bool>, Result<bool>): bool
```

##### neq

```alan
// Checks if the two values are not equal
neq(int8, int8): bool
neq(Result<int8>, int8): bool
neq(int8, Result<int8>): bool
neq(Result<int8>, Result<int8>): bool
neq(int16, int16): bool
neq(Result<int16>, int16): bool
neq(int16, Result<int16>): bool
neq(Result<int16>, Result<int16>): bool
neq(int32, int32): bool
neq(Result<int32>, int32): bool
neq(int32, Result<int32>): bool
neq(Result<int32>, Result<int32>): bool
neq(int64, int64): bool
neq(Result<int64>, int64): bool
neq(int64, Result<int64>): bool
neq(Result<int64>, Result<int64>): bool
neq(float32, float32): bool
neq(Result<float32>, float32): bool
neq(float32, Result<float32>): bool
neq(Result<float32>, Result<float32>): bool
neq(float64, float64): bool
neq(Result<float64>, float64): bool
neq(float64, Result<float64>): bool
neq(Result<float64>, Result<float64>): bool
neq(string, string): bool
neq(Result<string>, string): bool
neq(string, Result<string>): bool
neq(Result<string>, Result<string>): bool
neq(bool, bool): bool
neq(Result<bool>, bool): bool
neq(bool, Result<bool>): bool
neq(Result<bool>, Result<bool>): bool
```

##### lt

```alan
// Checks if the first value is less than the second
lt(int8, int8): bool
lt(Result<int8>, int8): bool
lt(int8, Result<int8>): bool
lt(Result<int8>, Result<int8>): bool
lt(int16, int16): bool
lt(Result<int16>, int16): bool
lt(int16, Result<int16>): bool
lt(Result<int16>, Result<int16>): bool
lt(int32, int32): bool
lt(Result<int32>, int32): bool
lt(int32, Result<int32>): bool
lt(Result<int32>, Result<int32>): bool
lt(int64, int64): bool
lt(Result<int64>, int64): bool
lt(int64, Result<int64>): bool
lt(Result<int64>, Result<int64>): bool
lt(float32, float32): bool
lt(Result<float32>, float32): bool
lt(float32, Result<float32>): bool
lt(Result<float32>, Result<float32>): bool
lt(float64, float64): bool
lt(Result<float64>, float64): bool
lt(float64, Result<float64>): bool
lt(Result<float64>, Result<float64>): bool
lt(string, string): bool
lt(Result<string>, string): bool
lt(string, Result<string>): bool
lt(Result<string>, Result<string>): bool
lt(bool, bool): bool
lt(Result<bool>, bool): bool
lt(bool, Result<bool>): bool
lt(Result<bool>, Result<bool>): bool
```

##### lte

```alan
// Checks if the first value is less than or equal to the second
lte(int8, int8): bool
lte(Result<int8>, int8): bool
lte(int8, Result<int8>): bool
lte(Result<int8>, Result<int8>): bool
lte(int16, int16): bool
lte(Result<int16>, int16): bool
lte(int16, Result<int16>): bool
lte(Result<int16>, Result<int16>): bool
lte(int32, int32): bool
lte(Result<int32>, int32): bool
lte(int32, Result<int32>): bool
lte(Result<int32>, Result<int32>): bool
lte(int64, int64): bool
lte(Result<int64>, int64): bool
lte(int64, Result<int64>): bool
lte(Result<int64>, Result<int64>): bool
lte(float32, float32): bool
lte(Result<float32>, float32): bool
lte(float32, Result<float32>): bool
lte(Result<float32>, Result<float32>): bool
lte(float64, float64): bool
lte(Result<float64>, float64): bool
lte(float64, Result<float64>): bool
lte(Result<float64>, Result<float64>): bool
lte(string, string): bool
lte(Result<string>, string): bool
lte(string, Result<string>): bool
lte(Result<string>, Result<string>): bool
lte(bool, bool): bool
lte(Result<bool>, bool): bool
lte(bool, Result<bool>): bool
lte(Result<bool>, Result<bool>): bool
```

##### gt

```alan
// Checks if the first value is greater than the second
gt(int8, int8): bool
gt(Result<int8>, int8): bool
gt(int8, Result<int8>): bool
gt(Result<int8>, Result<int8>): bool
gt(int16, int16): bool
gt(Result<int16>, int16): bool
gt(int16, Result<int16>): bool
gt(Result<int16>, Result<int16>): bool
gt(int32, int32): bool
gt(Result<int32>, int32): bool
gt(int32, Result<int32>): bool
gt(Result<int32>, Result<int32>): bool
gt(int64, int64): bool
gt(Result<int64>, int64): bool
gt(int64, Result<int64>): bool
gt(Result<int64>, Result<int64>): bool
gt(float32, float32): bool
gt(Result<float32>, float32): bool
gt(float32, Result<float32>): bool
gt(Result<float32>, Result<float32>): bool
gt(float64, float64): bool
gt(Result<float64>, float64): bool
gt(float64, Result<float64>): bool
gt(Result<float64>, Result<float64>): bool
gt(string, string): bool
gt(Result<string>, string): bool
gt(string, Result<string>): bool
gt(Result<string>, Result<string>): bool
gt(bool, bool): bool
gt(Result<bool>, bool): bool
gt(bool, Result<bool>): bool
gt(Result<bool>, Result<bool>): bool
```

##### gte

```alan
// Checks if the first value is greater than or equal to the second
gte(int8, int8): bool
gte(Result<int8>, int8): bool
gte(int8, Result<int8>): bool
gte(Result<int8>, Result<int8>): bool
gte(int16, int16): bool
gte(Result<int16>, int16): bool
gte(int16, Result<int16>): bool
gte(Result<int16>, Result<int16>): bool
gte(int32, int32): bool
gte(Result<int32>, int32): bool
gte(int32, Result<int32>): bool
gte(Result<int32>, Result<int32>): bool
gte(int64, int64): bool
gte(Result<int64>, int64): bool
gte(int64, Result<int64>): bool
gte(Result<int64>, Result<int64>): bool
gte(float32, float32): bool
gte(Result<float32>, float32): bool
gte(float32, Result<float32>): bool
gte(Result<float32>, Result<float32>): bool
gte(float64, float64): bool
gte(Result<float64>, float64): bool
gte(float64, Result<float64>): bool
gte(Result<float64>, Result<float64>): bool
gte(string, string): bool
gte(Result<string>, string): bool
gte(string, Result<string>): bool
gte(Result<string>, Result<string>): bool
gte(bool, bool): bool
gte(Result<bool>, bool): bool
gte(bool, Result<bool>): bool
gte(Result<bool>, Result<bool>): bool
```
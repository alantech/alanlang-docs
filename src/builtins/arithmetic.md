#### Arithmetic

Most arithmetic functions can fail by overflowing, underflowing, or dividing by zero, so these functions return Result-wrapped values instead of bare values in case of such failure. For convenience, all arithmetic functions can also accept result-wrapped values, and if the value is an error, it passes it through for consumption elsewhere.

##### add

```alan
// Adds two numbers
add(int8, int8): Result<int8>
add(Result<int8>, int8): Result<int8>
add(int8, Result<int8>): Result<int8>
add(Result<int8>, Result<int8>): Result<int8>
add(int16, int16): Result<int16>
add(Result<int16>, int16): Result<int16>
add(int16, Result<int16>): Result<int16>
add(Result<int16>, Result<int16>): Result<int16>
add(int32, int32): Result<int32>
add(Result<int32>, int32): Result<int32>
add(int32, Result<int32>): Result<int32>
add(Result<int32>, Result<int32>): Result<int32>
add(int64, int64): Result<int64>
add(Result<int64>, int64): Result<int64>
add(int64, Result<int64>): Result<int64>
add(Result<int64>, Result<int64>): Result<int64>
add(float32, float32): Result<float32>
add(Result<float32>, float32): Result<float32>
add(float32, Result<float32>): Result<float32>
add(Result<float32>, Result<float32>): Result<float32>
add(float64, float64): Result<float64>
add(Result<float64>, float64): Result<float64>
add(float64, Result<float64>): Result<float64>
add(Result<float64>, Result<float64>): Result<float64>
```

##### sub

```alan
// Subtracts two numbers
sub(int8, int8): Result<int8>
sub(Result<int8>, int8): Result<int8>
sub(int8, Result<int8>): Result<int8>
sub(Result<int8>, Result<int8>): Result<int8>
sub(int16, int16): Result<int16>
sub(Result<int16>, int16): Result<int16>
sub(int16, Result<int16>): Result<int16>
sub(Result<int16>, Result<int16>): Result<int16>
sub(int32, int32): Result<int32>
sub(Result<int32>, int32): Result<int32>
sub(int32, Result<int32>): Result<int32>
sub(Result<int32>, Result<int32>): Result<int32>
sub(int64, int64): Result<int64>
sub(Result<int64>, int64): Result<int64>
sub(int64, Result<int64>): Result<int64>
sub(Result<int64>, Result<int64>): Result<int64>
sub(float32, float32): Result<float32>
sub(Result<float32>, float32): Result<float32>
sub(float32, Result<float32>): Result<float32>
sub(Result<float32>, Result<float32>): Result<float32>
sub(float64, float64): Result<float64>
sub(Result<float64>, float64): Result<float64>
sub(float64, Result<float64>): Result<float64>
sub(Result<float64>, Result<float64>): Result<float64>
```

##### negate

```alan
// Negates the number
negate(int8): int8
negate(Result<int8>): Result<int8>
negate(int16): int16
negate(Result<int16>): Result<int16>
negate(int32): int32
negate(Result<int32>): Result<int32>
negate(int64): int64
negate(Result<int64>): Result<int64>
negate(float32): float32
negate(Result<float32>): Result<float32>
negate(float64): float64
negate(Result<float64>): Result<float64>
```

##### abs

```alan
// Returns the absolute value of the number
abs(int8): int8
abs(Result<int8>): Result<int8>
abs(int16): int16
abs(Result<int16>): Result<int16>
abs(int32): int32
abs(Result<int32>): Result<int32>
abs(int64): int64
abs(Result<int64>): Result<int64>
abs(float32): float32
abs(Result<float32>): Result<float32>
abs(float64): float64
abs(Result<float64>): Result<float64>
```

##### mul

```alan
// Multiplies two numbers
mul(int8, int8): Result<int8>
mul(Result<int8>, int8): Result<int8>
mul(int8, Result<int8>): Result<int8>
mul(Result<int8>, Result<int8>): Result<int8>
mul(int16, int16): Result<int16>
mul(Result<int16>, int16): Result<int16>
mul(int16, Result<int16>): Result<int16>
mul(Result<int16>, Result<int16>): Result<int16>
mul(int32, int32): Result<int32>
mul(Result<int32>, int32): Result<int32>
mul(int32, Result<int32>): Result<int32>
mul(Result<int32>, Result<int32>): Result<int32>
mul(int64, int64): Result<int64>
mul(Result<int64>, int64): Result<int64>
mul(int64, Result<int64>): Result<int64>
mul(Result<int64>, Result<int64>): Result<int64>
mul(float32, float32): Result<float32>
mul(Result<float32>, float32): Result<float32>
mul(float32, Result<float32>): Result<float32>
mul(Result<float32>, Result<float32>): Result<float32>
mul(float64, float64): Result<float64>
mul(Result<float64>, float64): Result<float64>
mul(float64, Result<float64>): Result<float64>
mul(Result<float64>, Result<float64>): Result<float64>
```

##### div

```alan
// Divides two numbers
div(int8, int8): Result<int8>
div(Result<int8>, int8): Result<int8>
div(int8, Result<int8>): Result<int8>
div(Result<int8>, Result<int8>): Result<int8>
div(int16, int16): Result<int16>
div(Result<int16>, int16): Result<int16>
div(int16, Result<int16>): Result<int16>
div(Result<int16>, Result<int16>): Result<int16>
div(int32, int32): Result<int32>
div(Result<int32>, int32): Result<int32>
div(int32, Result<int32>): Result<int32>
div(Result<int32>, Result<int32>): Result<int32>
div(int64, int64): Result<int64>
div(Result<int64>, int64): Result<int64>
div(int64, Result<int64>): Result<int64>
div(Result<int64>, Result<int64>): Result<int64>
div(float32, float32): Result<float32>
div(Result<float32>, float32): Result<float32>
div(float32, Result<float32>): Result<float32>
div(Result<float32>, Result<float32>): Result<float32>
div(float64, float64): Result<float64>
div(Result<float64>, float64): Result<float64>
div(float64, Result<float64>): Result<float64>
div(Result<float64>, Result<float64>): Result<float64>
```

##### pow

```alan
// Raises the first number to the power of the second number
pow(int8, int8): Result<int8>
pow(Result<int8>, int8): Result<int8>
pow(int8, Result<int8>): Result<int8>
pow(Result<int8>, Result<int8>): Result<int8>
pow(int16, int16): Result<int16>
pow(Result<int16>, int16): Result<int16>
pow(int16, Result<int16>): Result<int16>
pow(Result<int16>, Result<int16>): Result<int16>
pow(int32, int32): Result<int32>
pow(Result<int32>, int32): Result<int32>
pow(int32, Result<int32>): Result<int32>
pow(Result<int32>, Result<int32>): Result<int32>
pow(int64, int64): Result<int64>
pow(Result<int64>, int64): Result<int64>
pow(int64, Result<int64>): Result<int64>
pow(Result<int64>, Result<int64>): Result<int64>
pow(float32, float32): Result<float32>
pow(Result<float32>, float32): Result<float32>
pow(float32, Result<float32>): Result<float32>
pow(Result<float32>, Result<float32>): Result<float32>
pow(float64, float64): Result<float64>
pow(Result<float64>, float64): Result<float64>
pow(float64, Result<float64>): Result<float64>
pow(Result<float64>, Result<float64>): Result<float64>
```

##### mod

```alan
// Returns the modulus (remainder) of an integer division
mod(int8, int8): int8
mod(Result<int8>, int8): Result<int8>
mod(int8, Result<int8>): Result<int8>
mod(Result<int8>, Result<int8>): Result<int8>
mod(int16, int16): int16
mod(Result<int16>, int16): Result<int16>
mod(int16, Result<int16>): Result<int16>
mod(Result<int16>, Result<int16>): Result<int16>
mod(int32, int32): int32
mod(Result<int32>, int32): Result<int32>
mod(int32, Result<int32>): Result<int32>
mod(Result<int32>, Result<int32>): Result<int32>
mod(int64, int64): int64
mod(Result<int64>, int64): Result<int64>
mod(int64, Result<int64>): Result<int64>
mod(Result<int64>, Result<int64>): Result<int64>
```

##### sqrt

```alan
// Returns the square root of a number
sqrt(float32): float32
sqrt(Result<float32>): Result<float32>
sqrt(float64): float64
sqrt(Result<float64>): Result<float64>
```

##### min

```alan
// Returns the smallest of two numbers
// `Orderable` is an interface indicating that it has the less than / greater than, etc operators
min(Orderable, Orderable): Orderable
```

##### max

```alan
// Returns the largest of two numbers
// `Orderable` is an interface indicating that it has the less than / greater than, etc operators
max(Orderable, Orderable): Orderable
```

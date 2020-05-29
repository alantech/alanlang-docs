### @std/stats*

Not yet built, but statistical functions, including random number generators and timing/sampling functionality would live here along with `mean`, `median`, `mode`, `stddev`, `round`, etc.

`round` could have multiple forms, like `round(float32): int32` that rounds to the nearest integer while `round(float32, float32): float32` could round to the nearest step size defined in the second argument, eg `round(3.14, 0.1) == 3.1` and `round(123, 5) == 125`.


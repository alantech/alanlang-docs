#### Logical and Bitwise

Logical and bitwise operations cannot fail, but they accept Result-wrapped values and will pass through an error, if any, or will themselves wrap their result. This allows mixing arithmetic operations with logical and bitwise operations without constant re-casting.

##### and

```alan
// Return the logical or bitwise `and`
and(int8, int8): int8
and(Result<int8>, int8): Result<int8>
and(int8, Result<int8>): Result<int8>
and(Result<int8>, Result<int8>): Result<int8>
and(int16, int16): int16
and(Result<int16>, int16): Result<int16>
and(int16, Result<int16>): Result<int16>
and(Result<int16>, Result<int16>): Result<int16>
and(int32, int32): int32
and(Result<int32>, int32): Result<int32>
and(int32, Result<int32>): Result<int32>
and(Result<int32>, Result<int32>): Result<int32>
and(int64, int64): int64
and(Result<int64>, int64): Result<int64>
and(int64, Result<int64>): Result<int64>
and(Result<int64>, Result<int64>): Result<int64>
and(bool, bool): bool
and(Result<bool>, bool): Result<bool>
and(bool, Result<bool>): Result<bool>
and(Result<bool>, Result<bool>): Result<bool>
```

##### or

```alan
// Return the logical or bitwise `or`
or(int8, int8): int8
or(Result<int8>, int8): Result<int8>
or(int8, Result<int8>): Result<int8>
or(Result<int8>, Result<int8>): Result<int8>
or(int16, int16): int16
or(Result<int16>, int16): Result<int16>
or(int16, Result<int16>): Result<int16>
or(Result<int16>, Result<int16>): Result<int16>
or(int32, int32): int32
or(Result<int32>, int32): Result<int32>
or(int32, Result<int32>): Result<int32>
or(Result<int32>, Result<int32>): Result<int32>
or(int64, int64): int64
or(Result<int64>, int64): Result<int64>
or(int64, Result<int64>): Result<int64>
or(Result<int64>, Result<int64>): Result<int64>
or(bool, bool): bool
or(Result<bool>, bool): Result<bool>
or(bool, Result<bool>): Result<bool>
or(Result<bool>, Result<bool>): Result<bool>
```

##### boolor

```alan
// An alias for `or` only for the logical (boolean) version, meant for the `||` operator
boolor(bool, bool): bool
boolor(Result<bool>, bool): Result<bool>
boolor(bool, Result<bool>): Result<bool>
boolor(Result<bool>, Result<bool>): Result<bool>
```

##### xor

```alan
// Return the logical or bitwise `xor`
xor(int8, int8): int8
xor(Result<int8>, int8): Result<int8>
xor(int8, Result<int8>): Result<int8>
xor(Result<int8>, Result<int8>): Result<int8>
xor(int16, int16): int16
xor(Result<int16>, int16): Result<int16>
xor(int16, Result<int16>): Result<int16>
xor(Result<int16>, Result<int16>): Result<int16>
xor(int32, int32): int32
xor(Result<int32>, int32): Result<int32>
xor(int32, Result<int32>): Result<int32>
xor(Result<int32>, Result<int32>): Result<int32>
xor(int64, int64): int64
xor(Result<int64>, int64): Result<int64>
xor(int64, Result<int64>): Result<int64>
xor(Result<int64>, Result<int64>): Result<int64>
xor(bool, bool): bool
xor(Result<bool>, bool): Result<bool>
xor(bool, Result<bool>): Result<bool>
xor(Result<bool>, Result<bool>): Result<bool>
```

##### not

```alan
// Return the logical or bitwise `not`
not(int8): int8
not(Result<int8>): Result<int8>
not(int16): int16
not(Result<int16>): Result<int16>
not(int32): int32
not(Result<int32>): Result<int32>
not(int64): int64
not(Result<int64>): Result<int64>
not(bool): bool
not(Result<bool>): Result<bool>
```

##### nand

```alan
// Return the logical or bitwise `nand`
nand(int8, int8): int8
nand(Result<int8>, int8): Result<int8>
nand(int8, Result<int8>): Result<int8>
nand(Result<int8>, Result<int8>): Result<int8>
nand(int16, int16): int16
nand(Result<int16>, int16): Result<int16>
nand(int16, Result<int16>): Result<int16>
nand(Result<int16>, Result<int16>): Result<int16>
nand(int32, int32): int32
nand(Result<int32>, int32): Result<int32>
nand(int32, Result<int32>): Result<int32>
nand(Result<int32>, Result<int32>): Result<int32>
nand(int64, int64): int64
nand(Result<int64>, int64): Result<int64>
nand(int64, Result<int64>): Result<int64>
nand(Result<int64>, Result<int64>): Result<int64>
nand(bool, bool): bool
nand(Result<bool>, bool): Result<bool>
nand(bool, Result<bool>): Result<bool>
nand(Result<bool>, Result<bool>): Result<bool>
```

##### nor

```alan
// Return the logical or bitwise `nor`
nor(int8, int8): int8
nor(Result<int8>, int8): Result<int8>
nor(int8, Result<int8>): Result<int8>
nor(Result<int8>, Result<int8>): Result<int8>
nor(int16, int16): int16
nor(Result<int16>, int16): Result<int16>
nor(int16, Result<int16>): Result<int16>
nor(Result<int16>, Result<int16>): Result<int16>
nor(int32, int32): int32
nor(Result<int32>, int32): Result<int32>
nor(int32, Result<int32>): Result<int32>
nor(Result<int32>, Result<int32>): Result<int32>
nor(int64, int64): int64
nor(Result<int64>, int64): Result<int64>
nor(int64, Result<int64>): Result<int64>
nor(Result<int64>, Result<int64>): Result<int64>
nor(bool, bool): bool
nor(Result<bool>, bool): Result<bool>
nor(bool, Result<bool>): Result<bool>
nor(Result<bool>, Result<bool>): Result<bool>
```

##### xnor

```alan
// Return the logical or bitwise `xnor`
xnor(int8, int8): int8
xnor(Result<int8>, int8): Result<int8>
xnor(int8, Result<int8>): Result<int8>
xnor(Result<int8>, Result<int8>): Result<int8>
xnor(int16, int16): int16
xnor(Result<int16>, int16): Result<int16>
xnor(int16, Result<int16>): Result<int16>
xnor(Result<int16>, Result<int16>): Result<int16>
xnor(int32, int32): int32
xnor(Result<int32>, int32): Result<int32>
xnor(int32, Result<int32>): Result<int32>
xnor(Result<int32>, Result<int32>): Result<int32>
xnor(int64, int64): int64
xnor(Result<int64>, int64): Result<int64>
xnor(int64, Result<int64>): Result<int64>
xnor(Result<int64>, Result<int64>): Result<int64>
xnor(bool, bool): bool
xnor(Result<bool>, bool): Result<bool>
xnor(bool, Result<bool>): Result<bool>
xnor(Result<bool>, Result<bool>): Result<bool>
```
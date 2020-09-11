
#### HashMap Manipulation

##### toHash

```alan
// Converts a value into a hash using the xxh64 (https://cyan4973.github.io/xxHash/) algorithm.
// No user code ever has to overload the `toHash` function with their own implementation, but it is
// required that the `eq` function is for user-defined types to check for hash collisions.
toHash(any): int64
toHash(int8): int64
toHash(int16): int64
toHash(int32): int64
toHash(float32): int64
toHash(float64): int64
toHash(bool): int64
```

##### keyVal

```alan
// Takes a HashMap and returns an Array of KeyVal pairs
keyVal(HashMap<Hashable, any>): Array<KeyVal<Hashable, any>>
```

##### keys

```alan
// Takes a HashMap and returns an Array of keys
keys(HashMap<Hashable, any>): Array<Hashable>
```

##### values

```alan
// Takes a HashMap and returns an Array of values
values(HashMap<Hashable, any>: Array<any>
```

##### length

```alan
// Takes a HashMap and returns the number of KeyVal pairs contained
length(HashMap<Hashable, any>): int64
```

##### set

```alan
// Sets a key-value pair in the HashMap and returns the HashMap for chaining
set(HashMap<Hashable, any>, Hashable, any): HashMap<Hashable, any>
```

##### get

```alan
// Gets the value for a given key or an error
get(HashMap<Hashable,any>, Hashable): Result<any>
```

##### newHashMap

```alan
// Creates a new HashMap object with the first key-val pair and a decently-sized set of defaults for
// the indexing
newHashMap(Hashable, any): HashMap<Hashable, any>
```

##### toHashMap

```alan
// The inverse of `keyVal`, takes an `Array<KeyVal<Hashable, any>>` and reindexes it as HashMap
toHashMap(Array<KeyVal<Hashable, any>>): HashMap<Hashable, any>
```

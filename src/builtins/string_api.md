#### String Manipulation

##### concat

```alan
// Concatenate two strings together
concat(string, string): string
```

##### split

```alan
// Splits the first string into an array of strings divided by the second delimiter string
split(string, string): Array<string>
```

##### repeat

```alan
// Repeats the contents of the string `n` times (so `repeat("hello", 1)` returns `"hello"`)
repeat(string, int8): string
repeat(string, int16): string
repeat(string, int32): string
repeat(string, int64): string
```

##### template

```alan
// Takes a string template and a HashMap of string keys to string values to substitute in
template(string, HashMap<string, string>): string
```

##### matches

```alan
// Check if the first string matches the regular expression defined by the second string
matches(string, string): bool
```

##### index

```alan
// Returns the location of the second string within the first string as a Result, or errors
index(string, string): Result<int64>
```

##### length

```alan
// Returns the length of the string (as a byte array, not UTF codepoints)
length(string): int64
```

##### trim

```alan
// Removes the whitespace on either end of the string
trim(string): string
```
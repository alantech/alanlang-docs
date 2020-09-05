### Built-ins

All module-based languages have some things that are included without specifically importing anything. Some keep it to a minimum (Java) and some have a pretty high rate of inclusion (Python). Alan biases more towards the Python end of the spectrum. Concepts and functionality common across many modules should not be manually imported all of the time, especially with the requirement that imports are fully qualified to improve legibility.

The built-ins for Alan all involve the built-in types and the functions and operators to manipulate them.

#### Built-in Types

The built-in [types](./types.md) for Alan are:

* `void`
* `int8`
* `int16`
* `int32`
* `int64`
* `float32`
* `float64`
* `bool`
* `string`
* `function`
* `Array<V>`
* `HashMap<K, V>`
* `KeyVal<K, V>`
* `Error`
* `Maybe<T>`
* `Result<T>`
* `Either<T, U>`

The `int64` and `float64` types are special among the numeric types, as these are the types that any numeric constant will be represented as, depending on whether or not it has a decimal. They have been given aliases of `int` and `float` respectively for that reason.

#### Built-in Interfaces

There are a few built-in [interfaces](./interfaces.md) meant for working with several built-in types and functions.

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

#### Built-in Functions

The [function](./functions.md) signatures will be written in the form `functionName(argumentType, argumentType): returnType` with a brief description above each. These functions will be grouped into general categories, such as type coersion, arithmetic, etc. Because of [multiple dispatch](./functions.md#function-dispatch) you may see the same function name repeated multiple times, while other times you may see the use of the `any` interface for a function that operates on multiple types. When you see multiple dispatch being used with specific types, that means there's an optimized implementation for that specific type, while the use of the `any` interface means that this was not done (many times because it was not necessary).

##### Type Coersion

```alan
// Converts the built-in basic types to 64-bit floats
toFloat64(int8): float64
toFloat64(int16): float64
toFloat64(int32): float64
toFloat64(int64): float64
toFloat64(float32): float64
toFloat64(float64): float64
toFloat64(bool): float64
toFloat64(string): float64
```

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

```alan
// Converts the built-in basic types to 64-bit integers
toInt64(int8): int64
toInt64(int16): int64
toInt64(int32): int64
toInt64(int64): int64
toInt64(float32): int64
toInt64(float64): int64
toInt64(bool): int64
toInt64(string): int64
```

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

These coersions will not fail. When converting down into an integer of a smaller bitsize, numbers larger than that integer's `INT_MAX` are pegged at `INT_MAX`, smaller than `INT_MIN` pegged at `INT_MIN` and `NaN` or strings that aren't actually integers are converted to `0`. This may be changed to a `Result` type that requires a user-defined default value on failure. `Result` types wrapping a type that can also be converted to a string directly, with either the string version of the result, or the error message.

##### Arithmetic

```alan
// Adds two numbers
add(int8, int8): int8
add(int16, int16): int16
add(int32, int32): int32
add(int64, int64): int64
add(float32, float32): float32
add(float64, float64): float64
```

```alan
// Subtracts two numbers
sub(int8, int8): int8
sub(int16, int16): int16
sub(int32, int32): int32
sub(int64, int64): int64
sub(float32, float32): float32
sub(float64, float64): float64
```

```alan
// Negates the number
negate(int8, int8): int8
negate(int16, int16): int16
negate(int32, int32): int32
negate(int64, int64): int64
negate(float32, float32): float32
negate(float64, float64): float64
```

```alan
// Returns the absolute value of the number
abs(int8, int8): int8
abs(int16, int16): int16
abs(int32, int32): int32
abs(int64, int64): int64
abs(float32, float32): float32
abs(float64, float64): float64
```

```alan
// Multiplies two numbers
mul(int8, int8): int8
mul(int16, int16): int16
mul(int32, int32): int32
mul(int64, int64): int64
mul(float32, float32): float32
mul(float64, float64): float64
```

```alan
// Divides two numbers
div(int8, int8): int8
div(int16, int16): int16
div(int32, int32): int32
div(int64, int64): int64
div(float32, float32): float32
div(float64, float64): float64
```

```alan
// Raises the first number to the power of the second number
pow(int8, int8): int8
pow(int16, int16): int16
pow(int32, int32): int32
pow(int64, int64): int64
pow(float32, float32): float32
pow(float64, float64): float64
```

```alan
// Returns the modulus (remainder) of an integer division
mod(int8, int8): int8
mod(int16, int16): int16
mod(int32, int32): int32
mod(int64, int64): int64
```

```alan
// Returns the square root of a number
sqrt(float32): float32
sqrt(float64): float64
```

##### Logical and Bitwise

```alan
// Return the logical or bitwise `and`
and(int8, int8): int8
and(int16, int16): int16
and(int32, int32): int32
and(int64, int64): int64
and(bool, bool): bool
```

```alan
// Return the logical or bitwise `or`
or(int8, int8): int8
or(int16, int16): int16
or(int32, int32): int32
or(int64, int64): int64
or(bool, bool): bool
```

```alan
// Return the logical or bitwise `xor`
xor(int8, int8): int8
xor(int16, int16): int16
xor(int32, int32): int32
xor(int64, int64): int64
xor(bool, bool): bool
```

```alan
// Return the logical or bitwise `not`
not(int8): int8
not(int16): int16
not(int32): int32
not(int64): int64
not(bool): bool
```

```alan
// Return the logical or bitwise `nand`
nand(int8, int8): int8
nand(int16, int16): int16
nand(int32, int32): int32
nand(int64, int64): int64
nand(bool, bool): bool
```

```alan
// Return the logical or bitwise `nor`
nor(int8, int8): int8
nor(int16, int16): int16
nor(int32, int32): int32
nor(int64, int64): int64
nor(bool, bool): bool
```

```alan
// Return the logical or bitwise `xnor`
xnor(int8, int8): int8
xnor(int16, int16): int16
xnor(int32, int32): int32
xnor(int64, int64): int64
xnor(bool, bool): bool
```

##### Comparators

```alan
// Checks if the two values are equal
eq(int8, int8): bool
eq(int16, int16): bool
eq(int32, int32): bool
eq(int64, int64): bool
eq(float32, float32): bool
eq(float64, float64): bool
eq(string, string): bool
eq(bool, bool): bool
```

```alan
// Checks if the two values are not equal
neq(int8, int8): bool
neq(int16, int16): bool
neq(int32, int32): bool
neq(int64, int64): bool
neq(float32, float32): bool
neq(float64, float64): bool
neq(string, string): bool
neq(bool, bool): bool
```

```alan
// Checks if the first value is less than the second
lt(int8, int8): bool
lt(int16, int16): bool
lt(int32, int32): bool
lt(int64, int64): bool
lt(float32, float32): bool
lt(float64, float64): bool
lt(string, string): bool
```

```alan
// Checks if the first value is less than or equal to the second
lte(int8, int8): bool
lte(int16, int16): bool
lte(int32, int32): bool
lte(int64, int64): bool
lte(float32, float32): bool
lte(float64, float64): bool
lte(string, string): bool
```

```alan
// Checks if the first value is greater than the second
gt(int8, int8): bool
gt(int16, int16): bool
gt(int32, int32): bool
gt(int64, int64): bool
gt(float32, float32): bool
gt(float64, float64): bool
gt(string, string): bool
```

```alan
// Checks if the first value is greater than or equal to the second
gte(int8, int8): bool
gte(int16, int16): bool
gte(int32, int32): bool
gte(int64, int64): bool
gte(float32, float32): bool
gte(float64, float64): bool
gte(string, string): bool
```

##### Wait functions

```alan
// Waits the specified number of milliseconds and then continues execution
wait(int8): void
wait(int16): void
wait(int32): void
wait(int64): void
```

##### String Manipulation

```alan
// Concatenate two strings together
concat(string, string): string
```

```alan
// Splits the first string into an array of strings divided by the second delimiter string
split(string, string): Array<string>
```

```alan
// Repeats the contents of the string `n` times (so `repeat("hello", 1)` returns `"hello"`)
repeat(string, int8): string
repeat(string, int16): string
repeat(string, int32): string
repeat(string, int64): string
```

```alan
// Takes a string template and a HashMap of string keys to string values to substitute in
template(string, HashMap<string, string>): string
```

```alan
// Check if the first string matches the regular expression defined by the second string
matches(string, string): bool
```

```alan
// Returns the location of the second string within the first string as a Result, or errors
index(string, string): Result<int64>
```

```alan
// Returns the length of the string (as a byte array, not UTF codepoints)
length(string): int64
```

```alan
// Removes the whitespace on either end of the string
trim(string): string
```

##### Array Manipulation

```alan
// Concatenate two arrays into a new array containing the values of both
concat(Array<any>, Array<any>): Array<any>
```

```alan
// Create a new array with the contents of the original array repeated `n` times
repeat(Array<any>, int8): Array<any>
repeat(Array<any>, int16): Array<any>
repeat(Array<any>, int32): Array<any>
repeat(Array<any>, int64): Array<any>
```

```alan
// Find the index of the specified value in the array in a Result, or errors
index(Array<any>, any): Result<int64>
index(Array<int8>, int8): Result<int64>
index(Array<int16>, int16): Result<int64>
index(Array<int32>, int32): Result<int64>
index(Array<int64>, int64): Result<int64>
index(Array<float32>, float32): Result<int64>
index(Array<float64>, float64): Result<int64>
index(Array<bool>, bool): Result<int64>
```

```alan
// Returns true if the array has the specified value or false otherwise
has(Array<any>, any): bool
has(Array<int8>, int8): bool 
has(Array<int16>, int16): bool
has(Array<int32>, int32): bool 
has(Array<int64>, int64): bool
has(Array<float32>, float32): bool
has(Array<float64>, float64): bool
has(Array<bool>, bool): bool
```

```alan
// Push a value into the array and return the updated array
push(Array<any>, any): Array<any>
push(Array<int8>, int8): Array<int8>
push(Array<int16>, int16): Array<int16>
push(Array<int32>, int32): Array<int32>
push(Array<int64>, int64): Array<int64>
push(Array<float32>, float32): Array<float32>
push(Array<float64>, float64): Array<float64>
push(Array<bool>, bool): Array<bool>
```

```alan
// Pop a value from an array and return that value wrapped in a result (or an error result)
pop(Array<any>): Result<any>
```

```alan
// Execute the provided side-effect function on each element of the array
each(Array<any>, function): void // Parallel if possible and worthwhile
eachLin(Array<any>, function): void // Forced linear execution
```

```alan
// Execute the provided converter function on each element of the array and return a new array
map(Array<any>, function): Array<anythingElse> // Parallel if possible and worthwhile
mapLin(Array<any>, function): Array<anythingElse> // Forced linear execution
```

```alan
// Execute the combining function on the array and return the new value
// The two argument reduce functions reduce into the same type as the input, while the
// three and four argument reduce functions reduce into a new type. The three argument reduce
// function is sequential and only requires an initial value to kick off the reduction, while the
// four argument reducer requires one function and an initial value to kick off the reduction into
// the new type, and then it requires a second function that reduces the new type into itself to
// merge the various threads of execution back together.
reduce(Array<any>, function): any // Forced linear execution
reducePar(Array<any>, function): any // Parallel if possible and worthwhile
reduce(Array<any>, function, anythingElse): anythingElse // Forced linear execution
reducePar(Array<any>, function, function, anythingElse): anythingElse // Parallel if possible and worthwhile
```

```alan
// Execute the filtering function on the array and return a new array with the allowed values
filter(Array<any>, function): Array<any> // Parallel if possible and worthwhile
```

```alan
// Execute the comparison function on the array and return the first element that passes the check,
// or an error
find(Array<any>, function): Result<any> // Parallel if possible and worthwhile
findLin(Array<any>, function): Result<any> // Forced linear execution
```

```alan
// Execute the comparison function on the array and return `true` if all elements pass the check
every(Array<any>, function): bool // Parallel if possible and worthwhile
everyLin(Array<any>, function): bool // Forced linear execution
```

```alan
// Execute the comparison function on the array and return `true` if any element passes the check
some(Array<any>, function): bool // Parallel if possible and worthwhile
someLin(Array<any>, function): bool // Forced linear execution
```

```alan
// Take an array of strings and merge them into one string separated by the separator string. The
// inverse of the `split` function
join(Array<string>, string): string
```

```alan
// Override the value of an array element with a new value
set(Array<any>, int64, any): Result<Array<any>>
set(Array<int8>, int64, int8): Result<Array<int8>>
set(Array<int16>, int64, int16): Result<Array<int16>>
set(Array<int32>, int64, int32): Result<Array<int32>>
set(Array<int64>, int64, int64): Result<Array<int64>>
set(Array<float32>, int64, float32): Result<Array<float32>>
set(Array<float64>, int64, float64): Result<Array<float64>>
set(Array<bool>, int64, bool): Result<Array<bool>>
```

##### HashMap Manipulation

```alan
// Converts a value into a hash using the [xxh64](https://cyan4973.github.io/xxHash/) algorithm.
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

```alan
// Takes a HashMap and returns an Array of KeyVal pairs
keyVal(HashMap<Hashable, any>): Array<KeyVal<Hashable, any>>
```

```alan
// Takes a HashMap and returns an Array of keys
keys(HashMap<Hashable, any>): Array<Hashable>
```

```alan
// Takes a HashMap and returns an Array of values
values(HashMap<Hashable, any>: Array<any>
```

```alan
// Takes a HashMap and returns the number of KeyVal pairs contained
length(HashMap<Hashable, any>): int64
```

```alan
// Sets a key-value pair in the HashMap and returns the HashMap for chaining
set(HashMap<Hashable, any>, Hashable, any): HashMap<Hashable, any>
```

```alan
// Gets the value for a given key or an error
get(HashMap<Hashable,any>, Hashable): Result<any>
```

```alan
// Creates a new HashMap object with the first key-val pair and a decently-sized set of defaults for
// the indexing
newHashMap(Hashable, any): HashMap<Hashable, any>
```

```alan
// The inverse of `keyVal`, takes an `Array<KeyVal<Hashable, any>>` and reindexes it as HashMap
toHashMap(Array<KeyVal<Hashable, any>>): HashMap<Hashable, any>
```

##### "Ternary" Functions

```alan
// Takes two values of the same type and returns an array of those two values
pair(any, any): Array<any>
```

```alan
// Takes a boolean and an array of two values and returns the first value on `true` and the second
// on `false`
cond(bool, Array<any>): any
```

```alan
// Takes a boolean and a function and conditionally executes that function if the bool is `true`
cond(bool, function): void
```

##### Clone Functions

```alan
// Explicitly duplicates the provided value and returns it, useful when you don't want to mutate
// the original value
clone(any): any
clone(Array<any>): Array<any>
clone(void): void
clone(int8): int8
clone(int16): int16
clone(int32): int32
clone(int64): int64
clone(float32): float32
clone(float64): float64
clone(bool): bool
clone(string): string
```

##### Error, Maybe, Result, and Either Functions

```alan
// Returns a non-error error object
noerr(): Error
```

```alan
// Wraps a given value into a Maybe type
some(any): Maybe<any>
```

```alan
// Creates an unassigned Maybe type
none(): Maybe<void>
```

```alan
// Determines if the Maybe has a value
isSome(Maybe<any>): bool
```

```alan
// Determines if the Maybe has no value
isNone(Maybe<any>): bool
```

```alan
// Returns the Maybe's value, or the default value if there is no value
getOr(Maybe<any>, any): any
```

```alan
// Creates a Result with a value
ok(any): Result<any>
```

```alan
// Creates a Result with an Error
err(string): Result<any>
```

```alan
// Checks if the Result has a value
isOk(Result<any>): bool
```

```alan
// Checks if the Result has an Error
isErr(Result<any>): bool
```

```alan
// Gets the Result's value or default if it is an Error
getOr(Result<any>, any): any
```

```alan
// Gets the Result's Error or default if it is a value
getErr(Result<any>, Error): Error
```

```alan
// Creates an Either with the main (first) type set
main(any): Either<any, void>
```

```alan
// Creates and Either with the alternative (second) type set
alt(any): Either<void, any>
```

```alan
// Checks if the Either's main type is set
isMain(Either<any, anythingElse>): bool
```

```alan
// Checks if the Either's alt type is set
isAlt(Either<any, anythingElse>): bool
```

```alan
// Gets the main type or the default if it is the alt type
getMainOr(Either<any, anythingElse>, any): any
```

```alan
// Gets the alt type or the default if it is the main type
getAltOr(Either<any, anythingElse>, anythingElse): anythingElse
```

#### Built-in Operators

As [operators](./operators.md) in Alan are simply aliases for functions with a precedence value associated, all of the following operators have their underlying implementation defined above.

<table>
  <thead>
    <tr>
      <td>Operator</td><td>Infix/Prefix</td><td>Precedence</td><td>Function</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>?</code></td><td>infix</td><td>0</td><td>cond</td>
    </tr>
    <tr>
      <td><code>==</code></td><td>infix</td><td>1</td><td>eq</td>
    </tr>
    <tr>
      <td><code>!=</code></td><td>infix</td><td>1</td><td>neq</td>
    </tr>
    <tr>
      <td><code><</code></td><td>infix</td><td>1</td><td>lt</td>
    </tr>
    <tr>
      <td><code><=</code></td><td>infix</td><td>1</td><td>lte</td>
    </tr>
    <tr>
      <td><code>></code></td><td>infix</td><td>1</td><td>gt</td>
    </tr>
    <tr>
      <td><code>>=</code></td><td>infix</td><td>1</td><td>gte</td>
    </tr>
    <tr>
      <td><code>~</code></td><td>infix</td><td>1</td><td>matches</td>
    </tr>
    <tr>
      <td><code>@</code></td><td>infix</td><td>1</td><td>index</td>
    </tr>
    <tr>
      <td><code>-</code></td><td>prefix</td><td>1</td><td>negate</td>
    </tr>
    <tr>
      <td><code>+</code></td><td>infix</td><td>2</td><td>add</td>
    </tr>
    <tr>
      <td><code>+</code></td><td>infix</td><td>2</td><td>concat</td>
    </tr>
    <tr>
      <td><code>-</code></td><td>infix</td><td>2</td><td>sub</td>
    </tr>
    <tr>
      <td><code>|</code></td><td>infix</td><td>2</td><td>or</td>
    </tr>
    <tr>
      <td><code>||</code></td><td>infix</td><td>2</td><td>or</td>
    </tr>
    <tr>
      <td><code>^</code></td><td>infix</td><td>2</td><td>xor</td>
    </tr>
    <tr>
      <td><code>!|</code></td><td>infix</td><td>2</td><td>nor</td>
    </tr>
    <tr>
      <td><code>!^</code></td><td>infix</td><td>2</td><td>xnor</td>
    </tr>
    <tr>
      <td><code>|</code></td><td>infix</td><td>2</td><td>getOr</td>
    </tr>
    <tr>
      <td><code>||</code></td><td>infix</td><td>2</td><td>getOr</td>
    </tr>
    <tr>
      <td><code>*</code></td><td>infix</td><td>3</td><td>mul</td>
    </tr>
    <tr>
      <td><code>*</code></td><td>infix</td><td>3</td><td>repeat</td>
    </tr>
    <tr>
      <td><code>/</code></td><td>infix</td><td>3</td><td>div</td>
    </tr>
    <tr>
      <td><code>/</code></td><td>infix</td><td>3</td><td>split</td>
    </tr>
    <tr>
      <td><code>%</code></td><td>infix</td><td>3</td><td>mod</td>
    </tr>
    <tr>
      <td><code>%</code></td><td>infix</td><td>3</td><td>template</td>
    </tr>
    <tr>
      <td><code>&</code></td><td>infix</td><td>3</td><td>and</td>
    </tr>
    <tr>
      <td><code>&&</code></td><td>infix</td><td>3</td><td>and</td>
    </tr>
    <tr>
      <td><code>!&</code></td><td>infix</td><td>3</td><td>nand</td>
    </tr>
    <tr>
      <td><code>**</code></td><td>infix</td><td>4</td><td>pow</td>
    </tr>
    <tr>
      <td><code>!</code></td><td>prefix</td><td>4</td><td>not</td>
    </tr>
    <tr>
      <td><code>#</code></td><td>prefix</td><td>4</td><td>length</td>
    </tr>
    <tr>
      <td><code>`</code></td><td>prefix</td><td>4</td><td>trim</td>
    </tr>
    <tr>
      <td><code>:</code></td><td>infix</td><td>5</td><td>pair</td>
    </tr>
    <tr>
      <td><code>:</code></td><td>infix</td><td>6</td><td>push</td>
    </tr>
  </tbody>
</table>

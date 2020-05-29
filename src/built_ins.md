### Built-ins (included without import)

All module-based languages have some things that are included without specifically importing anything. Some keep it to a minimum (Java) and some have a pretty high rate of inclusion (Python). `alan` biases more towards the Python end of the spectrum. Concepts and functionality common across many modules should not be manually imported all of the time, especially with the requirement that imports are fully qualified to improve legibility.

The built-ins for `alan` all involve the built-in types and the functions and operators to manipulate them.

#### Built-in Types

The built-in types for `alan` are:

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
* `operator`
* `Array<V>`
* `Map<K, V>`
* `KeyVal<K, V>`
* `Tree<V>`

(At the time of writing, the Tree type is not functional)

There are no unsigned integers at this time due to the lack of such a primitive in Java. They will be added at some point in the future.

The `int64` and `float64` types are special among the numeric types, as these are the types that any numeric constant will be represented as, depending on whether or not it has a decimal.

#### Built-in Variable

There is *one* special built-in variable in the language, `_`. It is of type `void` and is used to throw away a value you don't want to save. This is only necessary if you have an operator-containing statement you wish to run but not pass to a function or anything else. This is a very esoteric need, since you could use the function form of one of the operators, but this can be desirable in certain situations.

#### Built-in Interfaces

There are a few built-in interfaces meant for working with several built-in types and functions.

* `any` (an empty interface, it can match any value, but you can only accept it and pass it along to something else. Useful for logical "glue" functions like pair, cond, map, reduce, etc.)
* `Array<any>` (an array of some kind of value)
* `Stringifiable` (an interface with the single function definition of `fn toString(Stringifiable): string` to indicate that this type can be converted to a string)

#### Built-in Functions

The function signatures will be written in the form `functionName(argumentType, argumentType): returnType` and then a brief description of each will be listed below it. These functions will be grouped into general categories, such as type coersion, arithmetic, etc.

##### Type Coersion

* `toFloat64(int8 | int16 | int32 | int64 | float32 | float64 | bool | string): float64`
  Converts the provided value into a 64-bit floating point representation. `bool` becomes `1.0` or `0.0` while `string` is parsed as a floating point number.
* `toFloat64(int8 | int16 | int32 | int64 | float32 | float64 | bool | string): float32`
  Converts the provided value into a 32-bit floating point representation. `bool` becomes `1.0` or `0.0` while `string` is parsed as a floating point number.
* `toInt64(int8 | int16 | int32 | int64 | float32 | float64 | bool | string): int64`
  Converts the provided value into a 64-bit integer. `bool` becomes `1` or `0` while `string` is parsed as an integer
* `toInt32(int8 | int16 | int32 | int64 | float32 | float64 | bool | string): int32`
  Converts the provided value into a 32-bit integer. `bool` becomes `1` or `0` while `string` is parsed as an integer
* `toInt16(int8 | int16 | int32 | int64 | float32 | float64 | bool | string): int16`
  Converts the provided value into a 16-bit integer. `bool` becomes `1` or `0` while `string` is parsed as an integer
* `toInt8(int8 | int16 | int32 | int64 | float32 | float64 | bool | string): int8`
  Converts the provided value into an 8-bit integer. `bool` becomes `1` or `0` while `string` is parsed as an integer
* `toBool(int8 | int16 | int32 | int64 | float32 | float64 | bool | string): bool`
  Converts the provided value into a boolean. Numeric values becomes `true` if not `0` and `false` otherwise while `string` is parsed as a `bool`
* `toString(int8 | int16 | int32 | int64 | float32 | float64 | bool | string): string`
  Converts the provided value into a string.

##### Arithmetic

* `add(int8, int8): int8`, `add(int16, int16): int16`, `add(int32, int32): int32`, `add(int64, int64): int64`, `add(float32, float32): float32`, `add(float64, float64): float64`
  Adds two numbers together and returns the result. The numbers must be of the same type.
* `sub(int8, int8): int8`, `sub(int16, int16): int16`, `sub(int32, int32): int32`, `sub(int64, int64): int64`, `sub(float32, float32): float32`, `sub(float64, float64): float64`
  Subtracts two numbers and returns the result. The numbers must be of the same type.
* `mul(int8, int8): int8`, `mul(int16, int16): int16`, `mul(int32, int32): int32`, `mul(int64, int64): int64`, `mul(float32, float32): float32`, `mul(float64, float64): float64`
  Multiplies two numbers and returns the result. The numbers must be of the same type.
* `div(int8, int8): int8`, `div(int16, int16): int16`, `div(int32, int32): int32`, `div(int64, int64): int64`, `div(float32, float32): float32`, `div(float64, float64): float64`
  Divides two numbers and returns the result. The numbers must be of the same type.
* `pow(int8, int8): int8`, `pow(int16, int16): int16`, `pow(int32, int32): int32`, `pow(int64, int64): int64`, `pow(float32, float32): float32`, `pow(float64, float64): float64`
  Raises the first number to the power of the second number and returns the result. The numbers must be of the same type.
* `mod(int8, int8): int8`, `mod(int16, int16): int16`, `mod(int32, int32): int32`, `mod(int64, int64): int64`
  Takes the modulus (returns the remainder of) the first number by the second number. Both numbers must be of the same type and this is the only arithmetic function that does not support floating point numbers.
* `sqrt(float32): float32`, `sqrt(float64): float64`
  Returns the square root of the provided value. Equivalent to `pow(yourNumber, 0.5)` but common enough in calculations to be defined separately.

##### Logical and Bitwise

* `and(int8, int8): int8`, `and(int16, int16): int16`, `and(int32, int32): int32`, `and(int64, int64): int64`, `and(bool, bool): bool`
  Applies the `and` truth table to the inputs. If integers, it applies bitwise, if boolean, to the single bit.
* `or(int8, int8): int8`, `or(int16, int16): int16`, `or(int32, int32): int32`, `or(int64, int64): int64`, `or(bool, bool): bool`
  Applies the `or` truth table to the inputs. If integers, it applies bitwise, if boolean, to the single bit.
* `xor(int8, int8): int8`, `xor(int16, int16): int16`, `xor(int32, int32): int32`, `xor(int64, int64): int64`, `xor(bool, bool): bool`
  Applies the `xor` truth table to the inputs. If integers, it applies bitwise, if boolean, to the single bit.
* `not(int8): int8`, `not(int16): int16`, `not(int32): int32`, `not(int64): int64`, `not(bool): bool`
  Applies the `not` truth table to the input. If integers, it applies bitwise, if boolean, to the single bit.
* `nand(int8, int8): int8`, `nand(int16, int16): int16`, `nand(int32, int32): int32`, `nand(int64, int64): int64`, `nand(bool, bool): bool`
  Applies the `nand` truth table to the inputs. If integers, it applies bitwise, if boolean, to the single bit.
* `nor(int8, int8): int8`, `nor(int16, int16): int16`, `nor(int32, int32): int32`, `nor(int64, int64): int64`, `nor(bool, bool): bool`
  Applies the `nor` truth table to the inputs. If integers, it applies bitwise, if boolean, to the single bit.
* `xnor(int8, int8): int8`, `xnor(int16, int16): int16`, `xnor(int32, int32): int32`, `xnor(int64, int64): int64`, `xnor(bool, bool): bool`
  Applies the `xnor` truth table to the inputs. If integers, it applies bitwise, if boolean, to the single bit.

##### Comparators

* `eq(int8, int8): bool`, `eq(int16, int16): bool`, `eq(int32, int32): bool`, `eq(int64, int64): bool`, `eq(float32, float32): bool`, `eq(string, string): bool`, `eq(bool, bool): bool`
  Determines if the two values are equal.
* `neq(int8, int8): bool`, `neq(int16, int16): bool`, `neq(int32, int32): bool`, `neq(int64, int64): bool`, `neq(float32, float32): bool`, `neq(string, string): bool`, `neq(bool, bool): bool`
  Determines if the two values are not equal.
* `lt(int8, int8): bool`, `lt(int16, int16): bool`, `lt(int32, int32): bool`, `lt(int64, int64): bool`, `lt(float32, float32): bool`, `lt(string, string): bool`
  Determines if the first value is less than the second (for strings, the first character that is less than the other determines this)
* `lte(int8, int8): bool`, `lte(int16, int16): bool`, `lte(int32, int32): bool`, `lte(int64, int64): bool`, `lte(float32, float32): bool`, `lte(string, string): bool`
  Determines if the first value is less than or equal to the second (for strings, the first character that is less than the other determines this)
* `gt(int8, int8): bool`, `gt(int16, int16): bool`, `gt(int32, int32): bool`, `gt(int64, int64): bool`, `gt(float32, float32): bool`, `gt(string, string): bool`
  Determines if the first value is greater than the second (for strings, the first character that is greater ehan the other determines this)
* `gte(int8, int8): bool`, `gte(int16, int16): bool`, `gte(int32, int32): bool`, `gte(int64, int64): bool`, `gte(float32, float32): bool`, `gte(string, string): bool`
  Determines if the first value is greater than or equal to the second (for strings, the first character that is greater ehan the other determines this)

##### String Manipulation

The regular-expression-based string manipulation functions may not make it into the language. Modern regex engines are (painfully) turing complete and difficult to estimate the run-time of even when not abused. I'm still thinking about this one, but likely they're out.

* `concat(...string): string`
  Accepts one or more strings and concatenates them together.
* `repeat(string, int8 | int16 | int32 | int64): string`
  Takes a string and concatenates it to an empty string as many times as specified (so `repeat("hello", 1)` returns `"hello"`, not `"hellohello"`)
* `matches(string, string): bool`
  Determines if the first string contains the regex pattern defined in the second string.
* `index(string, string): int64`
  Finds where in the first string the substring defined by the second string is located. Returns the first match if multiple exist.
* `length(string): int64`
  Returns the number of characters in the string.
* `trim(string): string`
  Removes whitespace from the beginning and end of the string.
* `split(string, string): Array<string>`
  Returns an array of substrings split by the second string (but not including said second string in the results).
* `template(string, map<string, string>): string`
  Returns a string substituting in values for specific key substrings in the map. Template syntax is simply putting `${keyname}` anywhere you want the value of that key substituted.

To be added Soon (tm) (or not, see above):

* `find(string, string): FindObj`
  Finds all locations within a string where the second regex string matches and returns a special object with the original string, match locations, and match substrings extracted.
* `replace(string, string, string): string`, `replace(FindObj, string): string`
  Using the results of a prior find, or doing it in-place, takes all matches from a regex search and replaces with the specified text. (How much of PCRE to include here? Should back references be allowed? Could be an escape to turing completeness in a weird way.)

##### "Ternary" Functions

The "ternary" operator (`booleanVal ? trueval : falseval`) is implemented in `alan` (and in many languages) as two infix operators, `?` and `:`. These operators are powered by the `cond` and `pair` functions, respectively.

* `pair(any, any): Array<any>`
  Takes two values and returns an array of these two values
* `cond(bool, Array<any>): any`
  Takes a boolean conditional and an array of two values and returns either the first or second value

##### Map Manipulation

`Map`s are generally used just for assignment and lookup of data, but there are occasions where you need to operate on the entirety of the `Map` without any particular key in mind.

* `keyVal(Map<any, any>): Array<KeyVal<any, any>>`
  Takes the Map of key-value pairs and returns an array of `KeyVal` value types with `key` and `value` fields.
* `keys(Map<any, any>): Array<any>`
  Returns an array of keys for the `Map`
* `values(Map<any, any>): Array<any>`
  Returns an array of the values for the `Map`
* `length(Map<any, any>): int64`
  Returns the number of key-value pairs in the `Map`

##### Array Manipulation

`Array`s are the backbone of this language. Any kind of repetitive work is expressed through `Array`s and the creation and manipulation thereof. Several of the `string` manipulation functions have an `Array` equivalent, and then there are a whole class of tools, mostly from functional programming, specific to them.

Starting with the functions that also work on `string`s:

* `concat(...Array<any>): Array<any>`
  Accepts one or more arrays and creates a new array with the fields shallowly copied.
* `repeat(Array<any>, int8 | int16 | int32 | int64): Array<any>`
  Creates a new shallow-copied array with the contents of the new Array repeating the original array the specified number of times.
* `index(Array<any>, any>): int64`
  This function looks for the first value in the array equal to the provided value and returns that index, or `-1`.
* `length(Array<any>): int64`
  Returns the number of elements in the Array.

A special function just for `Array`s and `string`s:

* `join(Array<string>, string): string`
  This function takes the elements of the array, which are all strings, and concatenates them together with the second argument, a separator string, in between them, and then returns the resulting string.

The functional programming-inspired `Array` functions:

* `each(Array<any>, fn (any): void): void`
  This function calls a side-effect function for each element of the array.
* `map(Array<any>, fn (any): any): Array<any>`
  This function allows an array to be transformed into another array with a different set of data after being given a transform function. Coming Soon (tm) more advanced interfaces will provide more solid guarantees that the return type of the transform function matches the return type of the map call itself (needed for the compiler, the interpreter works without it because values are stored dynamically).
* `reduce(Array<any>, fn (any, any): any): any`
  This function takes an array and an function that takes two arguments (so equivalent to an infix operator) and merges all of the values together until a single output is provided.
* `filter(Array<any>, fn (any): bool): Array<any>`
  This function takes an array and a filter function that specifies which elements should be kept (`true`) and which should be skipped (`false`).
* `find(Array<any>, fn(any): bool): any`
  This function takes an array and a fitler function and returns the first value that passes the test of the filter function.
* `every(Array<any>, fn(any): bool): bool`
  This function takes an array and a filter function and indicates if every field in the array passed the test (`true`) or not (`false`)
* `some(Array<any>, fn(any): bool): bool`
  This function takes an array and a filter function and indicates if any field in the array passed the test or not.

#### Built-in Operators

The built-in operators in `alan` are all simply aliases for most of the functions listed above. The following table defines the mapping from operator to function:

Operator Infix/Prefix Precedence Commutative Associative Function(s)
-------- ------------ ---------- ----------- ----------- -----------
 `+`        Infix         2         Yes, No      Yes     add, concat
 `-`        Infix         2         No           No         sub
 `*`        Infix         3         Yes, No    Yes, No   mul, repeat
 `/`        Infix         3         No           No         div
 `**`       Infix         4         No           No         pow
 `%`        Infix         3         No           No         mod
 `&`        Infix         3         Yes          Yes        and
 `&&`       Infix         3         Yes          Yes        and
 `|`        Infix         2         Yes          Yes        or
 `||`       Infix         2         Yes          Yes        or
 `^`        Infix         2         Yes          Yes        xor
 `!`        Prefix        4         N/A          N/A        not
 `!&`       Infix         3         Yes          Yes        nand
 `!|`       Infix         2         Yes          Yes        nor
 `!^`       Infix         2         Yes          Yes        xnor
 `==`       Infix         1         Yes          Yes        eq
 `!=`       Infix         1         Yes          Yes        neq
 `<`        Infix         1         No           Yes        lt
 `<=`       Infix         1         No           Yes        lte
 `>`        Infix         1         No           Yes        gt
 `>=`       Infix         1         No           Yes        gte
 `~`        Infix         1         No           No         matches
 `@`        Infix         1         No           No         index
 `#`        Prefix        4         N/A          N/A        length
 `` ` ``    Prefix        4         N/A          N/A        trim
 `?`        Infix         0         No           No         cond
 `:`        Infix         5         No           No         pair

Table: Built-in Operator Mapping Table


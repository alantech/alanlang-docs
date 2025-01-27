# The Standard Library

Alan is still very early in development, so the standard library outside of the root scope is still very bare bones. There are only two standard library modules you can import: `@std/fs` and `@std/seq`. The number of types and functions defined in these is also very minimal at the moment.

## `@std/fs`

This is the standard library for working with the filesystem.

### Types

| Type   | Description                          |
| :----- | :----------------------------------- |
| `File` | Represents a file in the file system |

### Functions

| Name     | Type              | Description                                                                                                                                                                                             | Explicit |
| :------- | :---------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| `File`   | `string -> File`  | Takes the path to a file and returns a `File` type. Performs no validation on construction (the file could be deleted between type construction and access, so it's just all deferred to when it is used) | ❌       |
| `string` | `File -> string!` | Reads the contents of the file to a string, or fails if the file does not exist or is not readable                                                                                                        | ✅       |

## `@std/seq`

This is the standard library for performing sequential computation. It's isolated from the core of the language because mistakes with these tools can lead to infinite loops, deadlocks, etc. *Most* of the time, you don't need it as the built-in controlled iterative tools that `Buffer`, `Array`, `Dict`, `Set`, and `Tree` have are all you need.

There are no new types here, only functions.

### Functions

| Name      | Type                           | Description                                                                                                                                                                                                                                                                                                                                                                                                 |
| :-------- | :----------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `while`   | `(() -> bool, () -> ()) -> ()` | This provides a classic while loop functionality, but through a slightly functional notation. The first function is executed at the beginning of the loop to determine if the second function will be executed and then return to the first function again, or if it will exit the loop. The second function is the loop body. Both of these functions *rely* on closures mutating state to work correctly. |
| `iter{T}` | `(Mut{i64 -> T}, i64) -> T[]`  | This provides a common pattern usually implemented with a for loop: an iterator. The function body accepts the iterator index value from 0 to one less than the provided maximum value and is executed that many times. It's return value is stored into an array. The callback is marked mutable so it can mutate the outer scope (not that it can mutate the iterator value)                              |
| `iter`    | `(Mut{i64 -> ()}, i64) -> ()`  | This is a slightly optimized version of the iterator above, but it does not build an array if the callback function does not return anything. When writing looping, mutable code, this can often be the case, so the optimization is worth it.                                                                                                                                                              |

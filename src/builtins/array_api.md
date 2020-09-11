#### Array Manipulation

##### concat

```alan
// Concatenate two arrays into a new array containing the values of both
concat(Array<any>, Array<any>): Array<any>
```

##### repeat

```alan
// Create a new array with the contents of the original array repeated `n` times
repeat(Array<any>, int8): Array<any>
repeat(Array<any>, int16): Array<any>
repeat(Array<any>, int32): Array<any>
repeat(Array<any>, int64): Array<any>
```

##### index

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

##### has

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

##### push

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

##### pop

```alan
// Pop a value from an array and return that value wrapped in a result (or an error result)
pop(Array<any>): Result<any>
```

##### each

```alan
// Execute the provided side-effect function on each element of the array
each(Array<any>, function): void // Parallel if possible and worthwhile
eachLin(Array<any>, function): void // Forced linear execution
```

##### map

```alan
// Execute the provided converter function on each element of the array and return a new array
map(Array<any>, function): Array<anythingElse> // Parallel if possible and worthwhile
mapLin(Array<any>, function): Array<anythingElse> // Forced linear execution
```

##### reduce

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

##### filter

```alan
// Execute the filtering function on the array and return a new array with the allowed values
filter(Array<any>, function): Array<any> // Parallel if possible and worthwhile
```

##### find

```alan
// Execute the comparison function on the array and return the first element that passes the check,
// or an error
find(Array<any>, function): Result<any> // Parallel if possible and worthwhile
findLin(Array<any>, function): Result<any> // Forced linear execution
```

##### every

```alan
// Execute the comparison function on the array and return `true` if all elements pass the check
every(Array<any>, function): bool // Parallel if possible and worthwhile
everyLin(Array<any>, function): bool // Forced linear execution
```

##### some

```alan
// Execute the comparison function on the array and return `true` if any element passes the check
some(Array<any>, function): bool // Parallel if possible and worthwhile
someLin(Array<any>, function): bool // Forced linear execution
```

##### join

```alan
// Take an array of strings and merge them into one string separated by the separator string. The
// inverse of the `split` function
join(Array<string>, string): string
```

##### set

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
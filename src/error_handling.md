### Error Handling

Errors are unavoidable in software and life. Alan's error handling seeks to generate fault tolerant programs that will fail on you at compile time, instead of on your users in production. Alan requires you to acknowledge the possibility of an error and take some action before your code will compile. This tradeoff introduces some tedium, but it increases the overall quality and robustness of programs.

Alan, like Rust, doesn’t have exceptions. Instead, it has the type `Result<T>` for you to return which is equivalent to `Either<T, Error>`. The language provides [built-in error handling functions](./builtins/result_maybe.md) to easily handle recoverable errors: 

```rust,editable
from @std/app import start, print, exit

// the return type is not required, but included for clarity
fn reciprocal(val: float64): Result<float64> {
  if val == 0.0 {
    // creates a Result with an Error from a string
    return err('Divide by zero error!')
  } else {
    // creates a Result with a value
    return ok(1.0 / val)
  }
}

on start {
  const oneFifth = reciprocal(5.0)
  // checks if the Result has a value
  if oneFifth.isOk() {
    // gets the Result's value or default if it is an Error
    print(oneFifth.getOr(0.0))
    // getOr can be expressed with an | operator
    print(oneFifth | 0.0)
  }

  // checks if the Result has an error
  const oneZeroth = reciprocal(0.0)
  if oneZeroth.isErr() {
    // gets the Result's Error or default if it is a value
    print(oneZeroth | 1.2345)
  }

  emit exit 0
}
```


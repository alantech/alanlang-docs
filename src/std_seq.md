## @std/seq to express Sequential Algorithms in Alan

Alan does not allow arbitrary, or classical, loops or recursion and [the preferred way to do iteration is with arrays](./advanced_examples.md#loopln). However, there are algorithms people need to write that are inherently sequential, and often non-deterministic on the number of steps needed to take, such as with numeric approximation algorithms like Newton-Raphson, or anything written as a recursive function call. Most of the problems developers need to solve do not require this linearity, but for when it really is required, we are reintroducing this power in a controlled manner that still allows the AVM to be able to plan around these algorithms and provide the guarantee of termination. The `@std/seq` syntax was [designed](https://github.com/alantech/alan/blob/main/rfcs/007%20-%20Sequential%20Algorithms%20RFC.md) to *not* feel like classical control flow in order to nudge developers to find better, more deterministic and more parallelizable mechanisms, instead.

Here are the function signatures of the sequential functions that `@std/seq` provides:

```ln
fn next(seq: Seq): Result<int64>
fn each(seq: Seq, func: function): void
fn while(seq: Seq, condFn: function, bodyFn: function): void
fn doWhile(seq: Seq, bodyFn: function): void
fn recurse(seq: Seq, recursiveFn: function, arg: any): Result<anythingElse>
```

### `Seq` type

`@std/seq` provides functions for accomplishing many different sequential patterns that depend on a special, built-in `Seq` type with opaque internals to avoid manipulation after construction:

```alan
type Seq {
  counter: int64
  limit: int64
}
```

### `next_loop.ln`

```rust,editable
from @std/app import start, print, exit
from @std/seq import seq, next
on start {
  let s = seq(2)
  print(s.next())
  print(s.next())
  print(s.next())
  emit exit 0
}
```

`next` is the simplest to explain: each time you call it, it returns the current counter value wrapped in a Result and then increments it. If you call past the limit, it returns an [Error Result](./error_handling.md).

### `each_loop.ln`

```rust,editable
from @std/app import start, print, exit
from @std/seq import seq, each
on start {
  let s = seq(3)
  s.each(fn (i: int64) = print(i))
  emit exit 0
}
```

`each` is almost as simple as `next`: It simply runs the side-effect function however many times is in the limit of the seq instance. The function provided may or may not take the current iteration counter and must be the following signature:

```alan
fn func(): void
fn func(i: int64): void
```

### `while_loop.ln`

```rust,editable
from @std/app import start, print, exit
from @std/seq import seq, while
on start {
  let s = seq(100)
  let sum = 0
  // TODO: Still need type inference working for one-liner closures
  // https://github.com/alantech/alan/issues/193
  s.while(fn (): bool = sum < 10, fn {
    sum = sum + 1
  })
  print(sum)
  emit exit 0
}
```

`while` runs the `bodyFn` *up to* the `limit` number of times, but can abort early if `condFn` returns `false`. The signatures of these two functions must match:

```alan
fn condFn(): bool
fn bodyFn(): void
```

### `doWhile_loop.ln`

```rust,editable
from @std/app import start, print, exit
from @std/seq import seq, doWhile
on start {
  let s = seq(100)
  let sum = 0
  // TODO: Still need type inference working for one-liner closures
  // https://github.com/alantech/alan/issues/193
  s.doWhile(fn (): bool {
    sum = sum + 1
    return sum < 10
  })
  print(sum)
  emit exit 0
}
```

`doWhile` always runs at least once (unless the `seq` has reached its `limit` or it was constructed with an initial `limit` of `0`) and uses the return value of the function to determine if it should continue or not, so its `bodyFn` has the following signature:

```alan
fn bodyFn(): bool
```

### `recurse_fib.ln`

```rust,editable
from @std/app import start, print, exit
from @std/seq import seq, Self, recurse
on start {
  print(seq(100).recurse(fn fibonacci(self: Self, i: int64): Result<int64> {
    if i < 2 {
      return ok(1)
    } else {
      const prev = self.recurse(i - 1)
      const prevPrev = self.recurse(i - 2)
      if prev.isErr() {
        return prev
      }
      if prevPrev.isErr() {
        return prevPrev
      }
      return ok((prev || 1) + (prevPrev || 1))
    }
  }, 8))
  emit exit 0
}
```

`recurse` allows recursive functions to be defined in `alan`. This is impossible in `alan`'s grammar, so what is done is special trickery to make it possible. The `recursiveFn` has the following function signature:

```alan
fn recursiveFn(self: Self, arg: any): Result<anythingElse>
```

The `Self` type is a special type that the recursive function can use to trigger a controlled recursive call, like so:

```alan
const recursiveResult = self.recurse(someNewArg)
```

`Self` is another opaque type that the AVM can use to keep track of the function to be called recursively and how deep the recursion has gone so far. The `recursiveFn` *must* wrap its value in a `Result` type because `alan` may interject and bubble up an error of the recursion limit is reached.

#### Constants

Module-level constants allow the user to define fixed data that is shared across functions (or exported to be shared across modules). The syntax is simply:

```rust
const varname: typename = constvalue
const othervar = otherconstval
```

The `typename` is not required due to type inference, but can be added for clarity.

For those coming from Javascript/Typescript, `const` in `alan` is much more strict. A constant is truly constant, not just a variable that can't be reassigned with a new struct. This means the following is invalid:

```rust
const pushedVals = new Array<int64> [ ]

fn saveForLater(val: int64) {
  pushedVals.push(val)
}
```

Shared mutable global state inherently prevents parallelization, so it is discouraged.

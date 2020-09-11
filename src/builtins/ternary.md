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

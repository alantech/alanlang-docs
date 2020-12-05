#### Operators

In Alan, operators are just a special form of function.

All operators are made up of only the symbols: ``+, -, /, *, ^, ., ~, `, !, @, #, $, %, &, |, :, <, >, ?, =`` (excluding the commas used to separate them from each other, they are reserved for list separators only). See the [built-in operators here](./builtins/operators.md).

Operators have operator precedence to determine how they are implicitly grouped by parenthesis.

Any exported operator *must* also export its implementing functions, so users can choose to use the more descriptive function names instead of the terse-but-cryptic operator symbols.

Operators have only two forms: prefix operators that take only one argument and infix (in-between) operators that take two arguments.

Prefix:

```
<operator> argument
```

Infix:

```
argument1 <operator> argument2
```

The syntax to define a prefix operator looks like this:

```alan
prefix functionName as <operatorSymbol> precedence <precedenceNumber>
prefix precedence <precedenceNumber> functionName as <operatorSymbol>
```

where `<operatorSymbol>` is some combination of the symbols listed above (with a special ban on a solitary `=` as that is already used for assignment) and `<precedenceNumber>` is an `int8` number (`(-128, 127)` inclusive) indicating the precedence level, with a larger number taking precedence over a smaller one. Only the numbers `0 - 6` are used by any built-in operator, and the `functionName` being the function to map to the prefix. Only functions with that name with a single argument will be considered (or n-arity functions where the first argument is also the "last", once n-arity support is added). Either the function to operator aliasing or the precedence level may be written first, depending on your own preferences.

The syntax to define infix operators is similar, and looks like this:

```alan
infix functionName as <operatorSymbol> precedence <precedenceNumber>
infix precedence <precedenceNumber> functionName as <operatorSymbol>
```

where `<operatorSymbol>` is the symbol for the operator, `<precedenceNumber>` is an `int8` number, and `functionName` is the function being mapped to the operator. Only functions with two arguments will be considered.

The example earlier of the function calls `3.add(2).mul(5).mod(3)` or `mod(mul(add(3, 2), 5), 3)` can be written with operators as `(3 + 2) * 5 % 3` or `5 * (3 + 2) % 5`, where the parenthesis break the operator precedence to allow addition to come first. See the [built-in operators](./builtins/operators.md) section for the complete list of operators and their precedence.


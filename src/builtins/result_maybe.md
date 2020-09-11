
##### Error, Maybe, Result, and Either Functions

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

```alan
// Returns a non-error error object
noerr(): Error
```

### Error, Maybe, Result, and Either

#### Maybe Functions

##### some

```alan
// Wraps a given value into a Maybe type
some(any): Maybe<any>
```

##### none

```alan
// Creates an unassigned Maybe type
none(): Maybe<void>
```

##### isSome

```alan
// Determines if the Maybe has a value
isSome(Maybe<any>): bool
```

##### isNone

```alan
// Determines if the Maybe has no value
isNone(Maybe<any>): bool
```

##### getOr

```alan
// Returns the Maybe's value, or the default value if there is no value
getOr(Maybe<any>, any): any
```

#### Result and Error Functions

##### noerr

```alan
// Returns a non-error error object
noerr(): Error
```

##### ok

```alan
// Creates a Result with a value
ok(any): Result<any>
```

##### err

```alan
// Creates a Result with an Error
err(string): Result<any>
```

##### isOk

```alan
// Checks if the Result has a value
isOk(Result<any>): bool
```

##### isErr

```alan
// Checks if the Result has an Error
isErr(Result<any>): bool
```

##### getOr

```alan
// Gets the Result's value or default if it is an Error
getOr(Result<any>, any): any
```

##### getErr


```alan
// Gets the Result's Error or default if it is a value
getErr(Result<any>, Error): Error
```

#### Either Functions

##### main

```alan
// Creates an Either with the main (first) type set
main(any): Either<any, void>
```

##### alt

```alan
// Creates and Either with the alternative (second) type set
alt(any): Either<void, any>
```

##### isMain

```alan
// Checks if the Either's main type is set
isMain(Either<any, anythingElse>): bool
```

##### isAlt

```alan
// Checks if the Either's alt type is set
isAlt(Either<any, anythingElse>): bool
```

##### getMainOr

```alan
// Gets the main type or the default if it is the alt type
getMainOr(Either<any, anythingElse>, any): any
```

##### getAltOr

```alan
// Gets the alt type or the default if it is the main type
getAltOr(Either<any, anythingElse>, anythingElse): anythingElse
```
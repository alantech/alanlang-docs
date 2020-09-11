#### User-Defined Types

There are two major categories of types in Alan: built-in types and user-defined types. 
The special built-in types are covered in depth in [Built-ins](./builtins/types.md) and they can be used within your own types. User-defined types are similar to `struct`s in C or Go as they are simply named compound types made up of other user-defined types or built-in types. They can also be only partially-defined as generic types, more on that later.

##### Syntax

User-defined types must be declared by the user and they follow the following syntax:

```alan
type typename {
  propertyName: propertyType
  otherProperty: otherType
}
```

The syntax to construct a new instance of a user type is as follows:

```alan
const myVal: typename = new typename {
  propertyName = propertyValue
  otherProperty = otherValue
}
```

Or relying on type inference it is reduced to just:

```alan
const myVal = new typename {
  propertyName = propertyValue
  otherProperty = otherValue
}
```

User-defined types have another interesting feature: they can be generic. That means one or more of the actual sub-types used by the type is not yet defined, but will be "solidified" later on with the creation of a new type based on it.

Generic types look like this:

```alan
type typename<A, B> {
  propertyName: A
  otherProperty: B
}
```

Where later on you can "solidify" that type either by creating an alias with the types filled in:

```alan
type typenameIntStr = typename<int64, string>
```

or just declaring a variable that uses a "solidified" type:

```alan
let myVar = new typename<bool, float64> {
  propertyName = true
  otherProperty = 0.0
}
```

Functions cannot operate on Generic types directly, but they can work on Generics that have been "solidified" with interfaces. More on this in the [Interfaces](./interfaces.md) section.

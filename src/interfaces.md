#### Interfaces

In order to make generic types more useful, there must be a way to declare what operations/functions are possible to apply to the generic type in question so functions working with said generic are able to be checked even if the generic function is not "solidified" (for example, it is an exported library meant to be used by other code). Interfaces are the proposed solution, and they'll look something like this:

```alan
interface interfaceName {
  functionname (concreteType, interfaceName): concreteType,
  function2 (interfaceName, interfaceName): interfaceName,
  interfaceName <operatorSymbol> interfaceName: interfaceName,
  <operatorSymbol2> interfaceName: concreteType,
  requiredPropertyName: concreteType,
  requiredPropertyName2: concreteType,
}
```

They declare which functions and/or operators must exist for the type to pass the interface and provide a guarantee to the function using that interface which functions and/or operators are available for use within the function body. Because function dispatch is based on the input arguments and not the output type, at least one of the input arguments **must** be `interfaceName`. They can also optionally declare certain properties with certain concrete types as being required to exist. This would only make sense for the user-defined types, but it appears useful for them to prevent requiring useless accessor functions to be written.

Within a function, the interface name simply substitutes for a type and is used in place of it, with the function/operator usage being checked against the interface instead of the scope. When usage of the function comes later, the type and functions/operators that work with it are checked against the interface and the *current scope* to see if it is valid. This means that it is possible for a function using interfaces to work with a particular type in one module scope but not another based on what has been imported into each scope. It also means that the behavior of the function could change between modules if a *different, but matching* function is imported or declared in the relevant scope.

This is because invocation of the function in that scope also counts as definition of that function within the scope, with the original being used as a template for the function, and the current module's scope being injected between the export scope of the module it was pulled from (if it was imported across scope boundaries).

When interfaces are used in a function, they are matched against the incoming argument types. Once it is "realized" as a concrete type, the compiler assumes any other usage of that same interface will be the same realized type.

This means writing a constructor function to make a `KeyVal` object like so:

```alan
fn makeKV(key: any, val: any) = new KeyVal<any, any> {
  key: key,
  val: val,
}
```

will fail to compile unless both the `key` and the `val` are the same type, which may be unexpected. However, an identical interface with a different name will be matched separately, so if you have the following two otherwise identical interfaces:

```alan
interface any {}
interface anythingElse {}
```

That both would match *any* type given to them, you can then use them in the `KeyVal` constructor like this:

```alan
fn makeKv(key: any, val: anythingElse) = new KeyVal<any, anythingElse> {
  key: key,
  val: val
}
```

There is an interface aliasing feature, so one could simply write:

```alan
interface anythingElse = any
```

and have it do the right thing. Not super useful for the `any` interface, but for complex interfaces that you want to use in functions with the variables "unlinked" from each other, it can be quite useful.

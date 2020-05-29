#### Interfaces

In order to make generic types more useful, there must be a way to declare what operations/functions are possible to apply to the generic type in question so functions working with said generic are able to be checked even if the generic function is not "solidified" (for example, it is an exported library meant to be used by other code). Interfaces are the proposed solution, and they'll look something like this:

```
interface interfaceName {
  functionname (concreteType, interfaceName): concreteType
  function2 (interfaceName, interfaceName): interfaceName
  interfaceName <operatorSymbol> interfaceName: interfaceName
  <operatorSymbol2> interfaceName: concreteType
  potentialPropertyName: concreteType
  potentialPropertyName2: concreteType
}
```

They declare which functions and/or operators must exist for the type to pass the interface and provide a guarantee to the function using that interface which functions and/or operators are available for use within the function body. Because function dispatch is based on the input arguments and not the output type, at least one of the input arguments **must** be `interfaceName`. They can also optionally declare certain properties with certain concrete types as being required to exist. This would only make sense for the user-defined types, but it appears useful for them to prevent requiring useless accessor functions to be written.

Within a function, the interface name simply substitutes for a type and is used in place of it, with the function/operator usage being checked against the interface instead of the scope. When usage of the function comes later, the type and functions/operators that work with it are checked against the interface and the *current scope* to see if it is valid. This means that it is possible for a function using interfaces to work with a particular type in one module scope but not another based on what has been imported into each scope. It also means that the behavior of the function could change between modules if a *different, but matching* function is imported or declared in the relevant scope.

This is because invocation of the function in that scope also counts as definition of that function within the scope, with the original being used as a template for the function, and the current module's scope being injected between the export scope of the module it was pulled from (if it was imported across scope boundaries).

Coming Soon (tm) there will be a way to declare generic types within the `interface` to alias interfaces. This is to allow specification that two different arguments (or the return type) of a function can be the same interface, but should or should not resolve to the exact same type.

For example:

```
interface Mappable {
  map(Array<any>, fn (any): any): Array<any>
}
```

provides no guarantees that the `any` in the first argument's `Array<any>` should also be the first `any` in the provided function declaration `fn (any): any`, while the second `any` in that function declaration does *not* need to match the first, but it *does* need to match the `any` in the return type of the `map` function.

To make this clear, this syntax is proposed (but not yet implemented):

```
interface Mappable {
  type A as any
  type B as any
  map(Array<A>, fn (A): B): Array<B>
}
```


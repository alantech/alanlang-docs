## AMM Language Reference

Alan-- is an intentionally strict subset of Alan's grammar as an intermediate stage for compilation. It defines a relatively simple scope-based syntax that happens to be a perfectly suitable subset for converting to a variety of different languages, including conversion towards assembly-like languages (AGA) or other scope-based languages like Javascript.

The only syntactic elements left in the language are constants, let variables, let variable reassignment, events, event handlers, closure functions, and function calls. Everything else, including conditionals, is stripped away. These remaining elements also have some constraints placed on them versus their fuller representation in Alan proper.

Since imports and exports do not exist, this means all relevant code for a project has been inlined into the same output file. This means the file will be much larger, but also simpler to understand, since *everything* you need is inside of that file.

### Constants

There are two categories of constants in Alan--, actual static constants like numbers, booleans, and strings, and constants that are the output of a function call.

Static constants must *all* be declared in the root scope at the top of the file. The only allowed static constants are of the following types: `int8`, `int16`, `int32`, `int64`, `float32`, `float64`, `bool`, `string`. Every other constant declared in an Alan source file is recomposed at runtime from these core components. (This may be revisited in the future if/when a safe, static representation format is defined for the runtime.) Unlike Alan, constants in Alan-- *must* have their types declared, like so:

<!-- using ```alan works, but would be nicer to be able to use a ```amm in these examples -->

```alan
const foo: string = "bar";
```

Constants output from function calls may *only* be housed within event handlers or closures and not declared in the root scope. These also must have the type data included.

### Let variables

As with Alan, let variables may only be declared within event handlers or closure functions and never the root scope. They function identically with the type definition requirement.

```alan
let a: int64 = 3;
```

### Let variable reassignment

Let variable reassignment is also identical to Alan, happening with event handlers or closure functions and may cross scope boundaries.

```alan
a = a + 3;
```

### Events (and loose typing)

Also as with Alan, events are declared in the root scope and never within event handlers or closure functions. Unlike Alan, the event handlers do not need to declare the relevant metadata about their type structure. Any typename may be used indiscriminantly, and any type that is not one of the static constant types (or `void`) is assumed to be "array-like" and it is up to you as the developer to not mess up here.

In Alan--, array-like types are completely unguarded and may be cast at will to any relevant type. User types from Alan are reduced to arrays that have mixed types in Alan--, which is not allowed in Alan. This makes them essentially the same as arrays in Javascript, so the array index can refer to any kind of value, including nested arrays. The type safety of Alan is enforced in the first stage of the compiler and nowhere else.

```alan
event stdout: string
```

### Event Handlers

Event handlers are the same as in Alan, a single function is registered to an event and has either zero or one argument, with zero being the case only if the event is a `void` type. Multiple handler functions may be registered for the same event. These are the entrypoints for work in Alan--, with the `_start` event being a special event not needing declaration to use as the entrypoint for the entire application.

(It's called `_start` instead of `start` to give the Alan standard library the flexibility to inject some "always run" initial logic before triggering the developer's code.)

```alan
on _start fn (): void { ...
```

### Closure Functions

Closure functions can define an inner scope within an event handler and are assigned to a variable. In Alan you could call these functions directly, but in Alan-- you can only pass them to [opcode functions](./alan_opcode_reference.md) to do some sort of work.

```alan
on _start fn (): void {
  const closure: function = fn (): void { ...
```

### Functions Calls

You can't actually declare functions not associated with an event in Alan--. All nested defined functions must be closures within an event. The only "functions" independent of the event handlers are the [opcodes defined by the runtime(s)](./alan_opcode_reference.md).

```alan
on _start fn (): void {
  const val = addi64(a, a);
  ...
```

### That's all, folks!

That's it for the language syntax. Really! It's a barely-typed, minimally-scoped, event-driven language that relies on the first stage of the compiler for safety.

The following simple Alan source example:

```alan
import @std/app

on app.start {
  let exitCode = 0;
  if 1 == 0 {
    exitCode = 1;
  }
  app.print("Exit Code: " + exitCode.toString());
  emit app.exit exitCode;
}
```

exercises *the entire Alan-- grammar*:

```alan
const _250a4e2f_c064_4223_88bf_e39abd6dd877: int64 = 1
const _f35d4d37_8d09_4ada_82fa_1418cb79e998: int64 = 0
const _c8f78af1_501f_4235_963c_5d8be4bad6b3: string = "Exit Code: "
const _bedfde7a_badf_4c1d_863e_e388ac42b9cc: string = "\n"
event stdout: string
event exit: int8
on _start fn (): void {
  let _c683f98b_437e_4df9_85da_a2a6c327a238: int64 = 0
  const _d095305f_d756_4c19_b884_3a8fede9861d: bool = eqi64(_250a4e2f_c064_4223_88bf_e39abd6dd877, _f35d4d37_8d09_4ada_82fa_1418cb79e998)
  const _4ef487db_9de4_404b_84e2_521cb45cc55a: function = fn (): void {
    _c683f98b_437e_4df9_85da_a2a6c327a238 = 1
  }
  const _264c9102_8e7f_49e3_bce6_cf1e07f47b7c: any = condfn(_d095305f_d756_4c19_b884_3a8fede9861d, _4ef487db_9de4_404b_84e2_521cb45cc55a)
  const _f256ce86_7153_4ab1_b374_728a251f682c: string = i64str(_c683f98b_437e_4df9_85da_a2a6c327a238)
  const _9996a497_e19e_42e5_8785_68d3fd59663a: string = catstr(_c8f78af1_501f_4235_963c_5d8be4bad6b3, _f256ce86_7153_4ab1_b374_728a251f682c)
  const _8aeec8d8_79e2_4105_8652_d261d0fbde7c: string = catstr(_9996a497_e19e_42e5_8785_68d3fd59663a, _bedfde7a_badf_4c1d_863e_e388ac42b9cc)
  emit stdout _8aeec8d8_79e2_4105_8652_d261d0fbde7c
  emit exit _c683f98b_437e_4df9_85da_a2a6c327a238
}
on stdout fn (out: string): void {
  const _1015e87b_7164_4b53_b328_65940d8c6323: void = stdoutp(out)
}
on exit fn (status: int8): void {
  const _387b8e3c_9792_4455_a5b0_98bf479c03eb: void = exitop(status)
}
```

## AGA Language as an intermediate representation of Alan

Alan Graphcode Assembler is a text representation of the Alan's VM binary format, AGC.

The syntax looks like assembly, perl, graphviz, rust, and python were put in a blender. As the cyclomatic complexity of an assembler (syntactically) is low, the various symbols within AGA borrowed from the above four are meant to produce a "dense-but-legible" syntax.

The format follows a header-and-body pattern, with 5 distinct header types.

### Identity Header

The first header is also required in every Alan Graphcode Assembly file, is required to be the first header in the file, and has no body. It simply declares that this is an Alan Graphcode Assembler file:

```aga
Alan Graphcode Assembler v0.0.1
```

### Global Memory Header

The global memory header, `globalMem`, is required to be the next header *if* there is any global memory to declare.

The body of the global memory is a key-value set of addresses and constants.

Addresses in global memory are declared with a prefixed `@` symbol with negative values from `-1` to `-2^63 + 1` corresponding to the 0th to nth valid bytes of the global memory. Negative numbers are used to distinguish them from the virtual addresses within the handlers and closures defined later on.

These numbers corresponding to exactly the byte offsets necessary to pack the global memory into the final binary is currently the case but may change in the future, since it demands the developer know about details of the final binary format that they don't care about, such as strings being stored in AGC as pascal-style strings with a 64-bit integer length header and zero-padded at the end to reach an even 64-bit sizing in global memory but the length value being the raw string length without the zero-padding. Moving this work to the agatoagc layer is likely.

Values are only strings, booleans, numbers. Booleans are simply `true` or `false`, and strings are all C-escape-string styled strings with double quotes only. Numbers are Rust-style with the relevant numeric value written out and postfixed with the byte size and type: `i8`, `i16`, `i32`, `i64`, `f32`, `f64`.

The key-value pairs are separated from each other by colons and are one-per-line. The whole block is indented Python-style for legibility.

```aga
globalMem
  @-1: 1i64
  @-9: 0i64
  @-17: "Exit Code: "
  @-41: "\n"
```

### Custom Events Header

The custom events header, `customEvents`, is required to be the next header *if* there are any custom events.

The body of the custom events block also consists of key-value pairs. The keys are the names of the events and the values are the relevant payload size.

The names are treated like variable names and are unquoted following the normal pattern of `[A-Za-z_][A-Za-z0-9_]*`.

The values are integers (without a Rust-style sizing postfix) with only three valid values (as of now): `-1`, `0`, and `8`. `0` indicates that there is no payload at all, while `8` indicates that the payload is a fixed-sized type (the integers, floats, and booleans). `-1` indicates that the payload is a variable-sized type (strings and the array-based types). The fixed-sized types are all `8` because they all fit within a single 64-bit value (8 bytes).

```aga
customEvents
  stdout: -1
  exit: 8
  _4ef487db_9de4_404b_84e2_521cb45cc55a: 0
```

### Handlers and Closures

These two are grouped together because while a valid AGA file must have at least one handler, handlers and closures can be defined in any order from here on out and their syntax is almost identical. In fact, labeling a block as a handler or a closure is entirely up to you. They translate to the exact same bytes in the final AGC form and the distinction is to keep things clearer to the reader.

The header for handlers and closures follows the form:

```aga
handler for <eventName> with size <numVariables>
closure for <eventName> with size <numVariables>
```

where `<eventName>` is the name of the event declared in `customEvents` *or* the built-in `_start` event, and `<numVariables>` is the total number of distinct memory addresses (not number of LOC in the handler or closure) used.

The body of the handler or closure consists of all lines following the header until the next handler or closure header is encountered, or the end-of-file. This body consists of a single kind of statement: an opcode call.

The structure of an opcode call can follow a few different forms, though. Most opcodes take two values as input, perform an operation, and store the results into a new address:

```aga
  @1 = eqi64(@-1, @-9) #1
```

The return address is defined first like a variable assignment, with an equal sign in between it and the actual opcode call. The opcode itself has two arguments that are usually memory addresses, like above, and then it is followed by a line identifier that looks like a python comment.

That line identifier is what gives AGA the name "Graphcode" instead of "bytecode". Sometimes it's followed with a Graphviz-style `<-` operator and an array of other line identifiers:

```aga
  emit(stdout, @5) #6 <- [#5]
```

This is to indicate to the runtime that this particular line *must* be performed after the listed set of lines to prevent invalid data conditions, but otherwise will re-order the execution as desired to improve concurrency and/or parallelism when possible.

In this example, there is no assignment happening, because the `emit` opcode does not affect the current handler. It also takes as an argument the name of the relevant event that the data should be copied to.

Some opcodes can also have constant data defined for an argument:

```aga
  @0 = seti64(0i64, @0) #0
```

This is only possible for the boolean and numeric types, as their values can fit within the address space (64-bit integers).

The positive addresses for a given handler or closure *must* be less than the specified size, but these addresses are virtual addresses with 64-bit sizing (literally for a 64-bit integer array in the runtime). Values that are larger than 64-bits *can* be stored within a single address here, as they are all treated as pointers, with special opcodes designed for their manipulation.

This makes hand-writing handlers and closures easier than hand-writing global memory at the moment, so that will hopefully change in the future.

#### Small differences for closures

There are a couple of smaller things that closures have versus actual handlers.

First, while closures and handlers are loaded the same way by the runtime, the invocation of a closure within the context of a handler does something different: the closure is given temporary ownership over the memory of the handler that invoked it, so the `with size <numVariables>` is STRONGLY RECOMMENDED to match between the two, and any addresses used in the one can and will affect the other (this is how the closure has access to mutating variables defined in its outer scope).

Second, some opcodes add some fake global memory addresses located in the last few sets of bytes around `-2^63 + 1`. These are used for closure arguments and return value when the closure is invoked within a looping construct like an array map operation. These values are in the same memory addresses across all closures but have different values for each invocation. Currently the `ammtoaga` compiler gives these ridiculously large negative addresses like `@-9223372036854775807` but adding a human-legible Perl-inspired aliases like `$0`, `$1`, etc for these argument addresses is likely to be followed in the future to make these similarly easier-to-read-and-write, and likely required when migrating the global memory numbers to be virtual addresses instead of actual (inverted) offsets.

### That's all, folks!

That's it for AGA's syntax. It's a barely-typed, scope-less, event-driven assembly language that relies on the compiler for safety.

The following simple Alan source example:

```alan
import @std/app

on app.start {
  let exitCode = 0
  if 1 == 0 {
    exitCode = 1
  }
  app.print("Exit Code: " + exitCode.toString())
  emit app.exit exitCode
}
```

exercises everything about AGA except the closure arguments:

```aga
Alan Graphcode Assembler v0.0.1

globalMem
  @-1: 1i64
  @-9: 0i64
  @-17: "Exit Code: "
  @-41: "\n"

customEvents
  stdout: -1
  exit: 8
  _4ef487db_9de4_404b_84e2_521cb45cc55a: 0

handler for _start with size 6
  @0 = seti64(0i64, @0) #0
  @1 = eqi64(@-1, @-9) #1
  @2 = condfn(@1, _4ef487db_9de4_404b_84e2_521cb45cc55a) #2
  @3 = i64str(@0, @0) #3
  @4 = catstr(@-17, @3) #4
  @5 = catstr(@4, @-41) #5
  emit(stdout, @5) #6 <- [#5]
  emit(exit, @0) #7 <- [#0]

handler for stdout with size 2
  @1 = stdoutp(@0, @0) #0

handler for exit with size 2
  @1 = exitop(@0, @0) #0

closure for _4ef487db_9de4_404b_84e2_521cb45cc55a with size 6
  @0 = seti64(1i64, @0) #0
```

# About Alan

Alan is an implicitly-parallel, statically-compiled, event-based, type-inferred language with a familiar syntax and many compile-time and run-time safety guarantees.

* The compiler can determine which array operations are safely parallelizable and automatically distributes them across a threadpool.
* The AVM can determine which operations are IO operations and will `await` them accordingly without the need for Futures or Promises, as well as automatically batch IO operations that can be executed in parallel safely.
* The AVM has automatic memory management without a GC made possible by the language scoping semantics.
* The type system enforces safe code to prevent most runtime errors (out-of-memory being a notable exception).
* The module system has a built-in mocking mechanism (with no runtime performance penalty) that can be used for fine-grained permissioning of access to the standard library for third-party libraries.
* Aggressive function inlining and dead-code removal to make sure unused code isn't even available in the output to potentially exploit.

To accomplish this, Alan makes one single, significant trade-off versus other programming languages: Functions in Alan are all acyclic directed graphs. No arbitrary loops or recursion are allowed.

This does not mean that you can't loop over data or write recursive algorithms, just that they are provided through [controlled built-in functions](./std_seq.md) that the compiler and AVM can reason about to provide automatic parallelization when possible, or to force handling a recursion error instead of crashing on a stack overflow.

This means that the code that you write in Alan is not *quite* Turing-complete[^1]. But we believe that we have cut "close enough" to Turing-completeness and provided enough controlled mechanisms to fill the gaps that the advantages in having predictable functions outweigh the few places where Alan's syntax is slightly more awkward than its peers'. This allows the AVM to be able to judge when parallelization makes sense based on the data to be processed and the complexity of the code to be executed.

Alan solves the Halting Problem -- by sidestepping it. Alan pushes you to write deterministic code with known execution patterns, and forces eventual halting of non-deterministic code by wrapping it in constructs that demand a maximum number of loops before erroring out. We believe this is what the vast majority of developers and companies alike want from their language because while not every question you can ask of a computer will ever return an answer, only those that do are useful to humanity.

[^1]: Technically an escape hatch through the event loop has been left open for very awkward recursive calls. This does not impact the advantages of the runtime for the language, however, and can be useful if absolutely necessary, but please reach out if you feel the need to use it, as that means either you're doing something wrong, or there's something missing to the language that should be added.

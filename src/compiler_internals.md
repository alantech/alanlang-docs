# Compiler Internals

Alan's compiler is a multi-stage compiler written mostly in Typescript at the moment. There are two primary targets, Javascript and the Alan Runtime's Alan Graphcode (AGC) format, with a branching path involving two intermediate representations: Alan-- (AMM) and Alan Graphcode Assembler (AGA).

```
       LN (aLaN)
        |
       AMM (Alan Minus Minus, simplified syntax)
      /   \
   JS      AGA (Alan Graphcode Assembler, dependency graph code in a text format)
            |
           AGC (Alan Graphcode, binary format for the runtime)
```

**LN** is the high level language meant to be easily accessible, like a cleaned-up Typescript/JS. Automatic memory management, automatic IO concurrency, automatic event-level and array-level CPU parallelism (two tracks in the runtime right now), and a strict type system but with interfaces for defining generic functions that we believe we can write [100% automatic type inference with without the compiler requiring a fallback to an explicit type](https://github.com/alantech/alan/blob/main/rfcs/006%20-%20Automatic%20Argument%20Interfaces%20RFC.md).

**AMM** is a heavily stripped-down version of the language but technically syntactically compatible. It only has constants, events, event handlers, functions, closures, function calls, and assignments. Everything else, including conditionals, is stripped away.

**JS:** *AMM* looks surprisingly close to Javascript/Typescript, so a transpiler was written that mostly just strips out the type information and replaces all of opcode calls with method calls on [a pretty simple runtime shim](https://github.com/alantech/alan/blob/main/js-runtime/index.js).

The transpiled Javascript doesn't have any of the benefits of the language in terms of cpu parallelism or automatic concurrency, but with some extra intelligence in the transpilation and judicious use of WebWorker threads that could be restored.

**AGA** looks very similar to assembly, but with annotation on events, closures, and the dependency graph that the Alan Runtime uses reorganize for concurrency and parallelism benefits.

**AGC** is the binary version of *AGA* and is a near direct translation of the text to a 64-bit little-endian integer packed array, with keywords being given numeric values that are clearly interpretable as 8 UTF-8/ASCII characters.

The compiler contains as a set of AST generators for the various input formats ([ln](https://github.com/alantech/alan/tree/main/compiler/src/ln), [amm](https://github.com/alantech/alan/blob/main/compiler/src/amm.ts), [aga](https://github.com/alantech/alan/blob/main/compiler/src/aga.ts)) with ln using [ANTLR](https://www.antlr.org/) to define its grammar and the other two using our homegrown [lp](https://github.com/alantech/alan/blob/main/compiler/src/lp.ts).

Next, the compiler has the translation stages that go from one input format to another output format ([lntoamm](https://github.com/alantech/alan/tree/main/compiler/src/lntoamm), [ammtojs](https://github.com/alantech/alan/blob/main/compiler/src/ammtojs.ts), [ammtoaga](https://github.com/alantech/alan/blob/main/compiler/src/ammtoaga.ts), [agatoagc](https://github.com/alantech/alan/blob/main/compiler/src/agatoagc.ts)).

While overkill at the moment, the compiler [solves the shortest path from the specified input file to output file and constructs the pipeline to do so on the fly](https://github.com/alantech/alan/blob/main/compiler/src/pipeline.ts). (This is much faster than it sounds and has allowed us to add new inputs/outputs and translation formats quickly.)

The first stage of the compiler dominates with more than 90% of the total compile time, and within that, the ANTLR-generated parser takes over 99% of the time within the `lntoamm` layer. (Speeding this up is very important to us.) Once the AST is generated, the first layer transforms this into a scope-oriented collection of elements and then generates AMM code on a per-event-handler basis, finally it looks for constants in these handlers and hoists them to the global scope and deduplicates them, then emits this in the AMM format.

The next stage of the compiler take the AMM and converts it either into Javascript or AGA. Javascript is a very simple translation, as AMM was designed to look like a "least common denominator scope-based language" which is a very large number of popular languages. The AGA conversion takes a bit more time as the variables need to be assigned memory addresses during their run and nested scopes in event handlers pulled out into "closure handlers", but both of these conversions, both the parsing of AMM and the generation of JS or AGA, take less than 1% of the time the first stage compiler takes.

If targeting to AGC, the final stage of the compiler converts the AGA to it with a very straightforward parse and re-emit into 64-bit integers appended to an array and then written to disk. This format doesn't work in the browser due to depending on Node.js's Buffer API as well as the new BigInt/BigUInt support it has, which no browser shim supports, yet, but thankfully that is not needed to build runnable code in the browser!

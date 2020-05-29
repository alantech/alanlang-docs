# About `alan`

`alan` is meant to fit like a glove. Like a glove, it's meant to be familiar and obvious how to use and generally not restricting. But like a glove, it has a few restrictions at the edges that going without it wouldn't have. And also like a glove, `alan` lets you grasp at things that would otherwise hurt you if you tried. ;)

## `alan`'s not turing

The `alan` programming language is a little bit different from most programming languages, in that it is intentionally not Turing-complete. Loops and recursion have been eliminated[^1] from the language. But this doesn't make it a dumb declarative thing like HTML or eBPF[^2]. Instead, substitutes for looping and recursion have been provided by the language that should cover all[^3] of your needs in a controlled way, such that it should be impossible[^4] to write code that doesn't halt.

[^1]: Technically an escape hatch through the event loop has been left open for very awkward recursive calls. This does not impact the advantages of the runtime for the language, however, and can be useful if absolutely necessary, but please reach out if you feel the need to use it, as that means either you're doing something wrong, or there's something missing to the language that should be added.
[^2]: http://www.brendangregg.com/ebpf.html
[^3]: Again, there is an intentional escape hatch, but it should be considered an emergency-only usage.
[^4]: Assuming no bugs in the runtime and no mistakes in our reasoning. This hasn't been formally verified, so I may be wrong, but it doesn't appear that way after a lot of ad-hoc analysis.

What you get in return for accepting these hopefully minor restrictions is a language that can automatically scale to your workload without rewriting, ever. Since all code is guaranteed[^5] to halt, it is possible to predict its runtime, and therefore to decide which thread(s) on which machine(s)[^6] should execute any particular part of it.

[^5]: Guarantees not guaranteed! ;)
[^6]: This will only be available from the proprietary SaaS service at first, and eventually a proprietary enterprise compiler will be available to license once less-predictable datacenters are handled by the runtime. The open source runtime will only decide which threads to use for any given task, making it more like Go, but with less insulting assumptions that developers are idiots.

It's not likely that `alan` will beat an experienced software architect in finding the absolute best cluster design for a given problem, but it will do a good job on all problems and not cause headaches when attempting to refactor that a large, rigid structure like that would entail. It's also likely that `alan` can't beat an experienced software architect *yet*, just like early compilers could not generate optimal assembly that those with years of experience writing assembly directly could, but eventually the compilers caught up for all but particular corner-cases and thus only rarely relevant today.


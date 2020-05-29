#### Acquisition

Different languages have had differing dependency resolution mechanisms.

* C and C++ have ignored this altogether and the communities have not made much, if any, progress on changing that.
* Java has similarly ignored it, but the Java community has created a few competing module management systems, but have apparently centralized on the Maven repository for module sources.
* Python has a centralized module repository and installation mechanism in `pip` but multiple mechanisms for managing the actual project dependency management, though with VirtualEnv leading (but not commandingly so) the pack.
* Ruby and Node have fully centralized module repositories, dependency management (though there is a split between NPM and Yarn, but Yarn intentionally mirrors NPM and focuses on speed), and dependency installation.
* Go and the experimental Deno have taken different paths. Go originally ignored dependency management, as well, but is adopting one based on URLs to Git repositories. Deno goes one step further and uses HTTP/HTTPS URLs to raw source code, itself.

`alan` intends to take care of third-party module management from the get-go, but will intentionally not handle hosting of the modules. Sooner or later, Node.js' dependency on NPM, Inc to function will bite it *when* (not if) NPM dies. The use of `git` as the de facto source code storage system makes the most sense to me. It can be easily vendored locally unlike Deno's approach, which requires a convoluted caching mechanism, and it provides simple mechanisms for change management that are more difficult with Deno (how does one roll back a change once the cached version of the old code is gone and the HTTP server no longer serves it?).

So `alan` will expect and use `git` for its package management. It will use the portion of the git URL after the host to determine the location to store the dependency in the `dependencies` directory.

It will only work within an `alan init`ed directory, which is a git repository that contains a `.lnan.ln` file, which is a collection of exported constants to configure the package management for you (avoiding the whole JSON vs YAML problem by declaring a pox on both houses). *ALL* configuration will be exported for this to be valid, so there will be no hidden behavior like with gradle's syntax, but you can still use the language itself to do some of the work. -- I hope that doesn't come back to bite me.

There will be a particular exported property that is a list of git URL fragments to try if a dependency is declared with the `@dep` syntax instead of a fully qualified git URL, with the `init` command automatically filling in the value of `git+ssh://git@github.com:`, the idea being that the `@` is stripped and the rest is appended to that URL to identify the git repository.

Specifying the version of the code you want is done by specifying the tag or SHA you wish to use. If you can support multiple versions (particularly if you're writing a library instead of acting as an end user) you can also provide an array of tags/shas or a special Semver object defining the major.minor.patch ranges acceptable. (This will depend on getting compound types in the type system first)

The dependencies will be added to the `dependencies` directory, which will also be in the `.gitignore` list created by `alan init`. These dependencies, once loaded, will check their own needed dependencies. If there is a dependency "above" them that contains a `git` repo with a valid tag, it's done. If it finds a `git` repo with an invalid tag, it will install its needed version locally in its own `dependencies` sub-directory. If it finds no match at all in the parent hierarchy, it will place its dependency in the `dependencies` directory it finds itself in to potentially reduce duplication of commonly-used third party dependencies.

At least that'll be the first pass -- lots of potential optimizations can be taken from "yarn": determine if there are conflicting dependency needs across the entire tree and raise the most common version up while leaving the less common versions to be nested, instead of whichever was the first encountered. Also compute diffs of the dependency hierarchy before and after a dependency is added or removed and only perform the necessary operations instead of redoing everything.


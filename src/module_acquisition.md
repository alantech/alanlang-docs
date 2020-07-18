#### Acquisition

Different languages have had differing dependency resolution mechanisms.

* C and C++ have ignored this altogether and the communities have not made much, if any, progress on changing that.
* Java has similarly ignored it, but the Java community has created a few competing module management systems, but have apparently centralized on the Maven repository for module sources.
* Python has a centralized module repository and installation mechanism in `pip` but multiple mechanisms for managing the actual project dependency management, though with VirtualEnv leading (but not commandingly so) the pack. The dependencies themselves are declared in a simple text file or a yaml file, depending on the tool you use.
* Ruby and Node have fully centralized module repositories, dependency management (though there is a split between NPM and Yarn, but Yarn intentionally mirrors NPM and focuses on speed), and dependency installation. The dependencies are declared in a special JSON file for Node and a "Gemfile" Ruby source file in Ruby.
* Go and the experimental Deno have taken different paths. Go originally ignored dependency management, as well, but is adopting one based on URLs to Git repositories. Deno goes one step further and uses HTTP/HTTPS URLs to raw source code, itself, with no explicit dependency declaration file.

`alan` follows Ruby most closely in managing dependencies. Dependencies are specified in a `.dependencies.ln` file by convention that uses the `@std/deps` standard library to declare which dependencies are required and acquire them. Using `alan` itself as the dependency declaration file makes it possible to typecheck and validate the validity of the dependency configuration to an extent that is not possible in the declarative formats popular in Java, Python, Node, and Go.

Beyond that, `alan` automatically assumes all dependencies are listed as git URLs and that git is available for use locally to access the third-party libraries. This makes acquisition and version pinning much simpler and without any requirement of a centralized host.

Long-term, though, `alan` intends to have a centralized package hosting system because there are several advantages to the community for such a thing:

* The packages can be guaranteed immutable to make sure production deployments are more reliable.
* The central repository can require package signing to make it harder for popular packages to be hijacked and have malware injected into them (and also raise the bar to make sure only more serious projects are submitted).
* The semantic versioning (major, minor, patch) meaning can be better trusted by requiring published packages to conform to a validation mechanism we call "Semantic BDD." (TODO: Write up blog post on Semantic BDD, and link to it here.)
* Finally, the central repository can provide discoverability and recommendation mechanisms to developers on which packages may be worth using versus others. Simple metrics like download and star counts are one, but beyond that there could be recommendations based on things starred by other developers that also starred things you have, or the total coverage of their Semantic BDD tests versus the entirety of their export scope surface area.

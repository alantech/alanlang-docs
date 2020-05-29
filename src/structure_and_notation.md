## Structure and Notation

The high level structure of `alan` is a collection of modules that perform particular functions, which execution being triggered by events causing their handlers to be run. Languages with module systems tend to scope either at the directory level or the file level. `alan` chooses to use file-level scoping, as anything not obvious to someone with a moderate familiarity with the language must be explicitly declared within the single file, instead of potentially being declared in sibling files.


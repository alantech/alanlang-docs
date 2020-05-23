# Hello Alan

Right now the code snippet
has to be of type "rust" to get the proper html pieces in place. It should
be possible to get around this but for now since the mdbook will only have
code snippets for one language and `alan` has no syntax highlighting it 
should be fine.


```rust,editable

import @std/app
on app.start {
  app.print("Hello, World!")
  emit app.exit 0
}

```


# Hello JS

Running javascript in an mdBook is possible! Right now the code snippet
has to be of type "rust" to get the proper html pieces in place. It should
be possible to get around this but for now since the mdbook will only have
code snippets for one language and `alan` has no syntax highlighting it 
should be fine.

```rust,editable
// You can make code do what you want
console.log(5);

```

We can add more files to theme to overwrite the default client-side configuration:

[Theme Configuration](https://rust-lang.github.io/mdBook/format/theme/index.html)


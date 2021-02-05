# About the documentation

A high-level overview of [how the Alan documentation organized](https://documentation.divio.com/) will help you know how to quickly find what you are looking for:

- [Tutorials](./tutorials.md) take you through some Alan examples. Start here if you’re new to Alan.
<!--
- [Tutorials](./tutorials.md) take you by the hand through a series of steps to deploy a Web server to AWS that can process and store restaurant orders. Start here if you’re new to Alan or Web server development.
--->
- [How-to guides](./how_to.md) are recipes. They guide you through the steps involved in addressing key problems and use-cases. They are more advanced than tutorials and assume some knowledge of how Alan works.
- [Topic guides](./topics.md) discuss key topics and concepts at a fairly high level and provide useful background information and explanation about the internals of the Alan compiler, module system and syntax.
- [Reference guides](./reference.md) contains technical reference for built-in APIs and data types, the standard library and opcodes. They describe how it works and how to use it but assume that you have a basic understanding of key concepts.

Throughout the documentation you will find runnable code snippets, like the one below, that are included for clarity:

```rust,editable
import @std/app

on app.start {
  app.print("Hit the play button to see me run!");
  emit app.exit 0;
}
```
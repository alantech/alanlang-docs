## The Many Forms of 'Hello, World!'

The classic "Hello, World!" examples are a simple way to understand the minimum of structure you need to have in any code you write in a given language, with Java being famously heavyweight and Python famously featherweight.

`alan` is in the middle, requiring some concepts from the get-go that would be confusing to absolute beginners, but not requiring as many concepts as Java.

### `hello_world_1.ln`

```rust,editable
import @std/app

on app.start {
  app.print("Hello, World!")
  emit app.exit 0
}
```

The first line imports the `app` export scope, which can be used like a user type.

The next (non-blank) line declares that "on application start do this", which is relatively clear and analogous to C's `int main()` but slightly more English-y.

After that, "the application prints 'Hello, World!'" which is straightforward and what we're here to do.

Finally, "emit application exit zero" isn't super clear, but for those familiar with other "Hello, World!" type applications, it just looks like a funny `return 0`.

### `hello_world_2.ln`

```rust,editable
from @std/app import start, print, exit

on start {
  print("Hello, World!")
  emit exit 0
}
```

Almost identical to the first, but it pulls the pieces of the `app` namespace into the module's namespace, so it's a good introduction to the `from foo import bar, baz, ...` syntax, what it does and why you might want it.

### `hello_world_3.ln`

```rust,editable
from @std/app import start, print as put, exit

on start {
  put("Hello, World!")
  emit exit 0
}
```

This example demonstrates the renaming syntax on import, so you can choose a name that is clearer to you.

### `hello_world_4.ln`

```rust,editable
import @std/app as program

on program.start {
  program.print("Hello, World!")
  emit program.exit 0
}
```

Same as the previous, but the renaming is applied to the module name, rather than its contents.

### `hello_world_5.ln`

```rust,editable
from @std/app import start, print, exit

const helloWorld: string = "Hello, World!"

on start {
  print(helloWorld)
  emit exit 0
}
```

This example demonstrates printing a variable instead of an inline constant.

### `hello_world_6.ln`

```rust,editable
from @std/app import start, exit, print

on start fn {
  const hello: string = "Hello"
  const world: string = "World"
  print(concat(hello, ", ", world, "!"))
  emit exit 0
}
```

This example demonstrates how values can be combined together to produce the desired result.

### `hello_world_7.ln`

```rust,editable
from @std/app import start, print, exit

on start {
  "Hello, World!".print()
  emit exit 0
}
```

This demonstrates the "method-style" function call syntax, which allows those who prefer OO development to have that style (though it could be misleading that it implies everything is an object, when it's really syntactic sugar, but...)

### `hello_world_8.ln`

```rust,editable
from @std/app import start, print, exit

fn main() {
  "Hello, World!".print()
  emit exit 0
}

on start main
```

This example demonstrates that the functions passed to an event handler don't have to be inline declared.

### `hello_world_9.ln`

```rust,editable
from @std/app import start, print, exit

prefix $> 1 print

on start {
  _ = $> "Hello, World!"
  emit exit 0
}
```

This example introduces the `_` special variable and prefix operators, effectively renaming `print` to `$>` and letting you print "Hello, World!" with another syntax.

Because the statement would be ambiguous otherwise, the operator expression *must* be assigned to something. Since we don't care what value `print` returns (hint: `void`), we assign to the `_` variable to throw it away.


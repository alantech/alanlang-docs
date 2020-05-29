#### Coming Soon (tm): Classes

In `alan`, classes are (will be) almost purely syntactic sugar. A class is a collection of fields in a type and methods to act on them. So that's what classes are in `alan`, syntactic sugar to define methods while skipping the first argument in the argument list (and automatically naming it `this`) for a type that is being defined.

The only extra bit that's not quite purely syntactic sugar would be the `constructor` function, which will need a bit of extra help to use.

A simple class like this:

```
class Foo {
  bar: string
  baz: bool

  getBar(): string {
    return this.bar
  }

  bazzle(): string {
    if (this.baz) {
      return "bazzle!"
    } else {
      return "buzzle..."
    }
  }
}
```

Would directly translate to:

```
type Foo {
  bar: string
  baz: bool
}

fn getBar(this: Foo): string {
  return this.bar
}

fn bazzle(this: Foo): string {
  if (this.baz) {
    return "bazzle!"
  } else {
    return "buzzle..."
  }
}
```

In this case, the number of lines of code is identical, though the class syntax is very slightly less typing and looks more familiar to people coming from OO languages. Those same people will be noticing that this direct translation from `class` to `type` means there cannot be private and protected properties and methods defined in the class. Two points:

1. Methods can still be effectively private by not exporting them along with the rest of the class, but I would still discourage that, because:
2. Private properties of a class have always been a mistake. They assume that there is never going to be a valid use-case for anyone else to ever access them, so data serialization and deserialization, among other things, is made ridiculously hard in these OO languages, and they really come from a misguided attempt by language authors to obfuscate how their code works while calling it "Encapsulation", as if you don't already have to deal with the allocated memory for it, deal with potential serialization/translation issues and repopulation issues if that internal state can't be created by the constructor.

![Why are you booing me? I'm right.](./src/docs/im_right.jpg)

However, I believe it would be possible to obfuscate certain properties by creating a special type with the private values and creating a special property (probably called `private`) and not exporting that type. I'm not sure if I want to treat that as a compiler error, though, because I'm right about trying to restrict data access.

As alluded to above, there are two ways that classes could be exported:

```
export class Foo {
  bar: string
  baz: bool

  getBar(): string {
    return this.bar
  }

  bazzle(): string {
    if (this.baz) {
      return "bazzle!"
    } else {
      return "buzzle..."
    }
  }
}
```

which would export everything, the type and all of the defined methods, versus:

```
class Foo {
  bar: string
  baz: bool

  getBar(): string {
    return this.bar
  }

  bazzle(): string {
    if (this.baz) {
      return "bazzle!"
    } else {
      return "buzzle..."
    }
  }
}

export Foo
export getBar
```

which exports the `type` with the same name and the `getBar` method while leaving the `bazzle` method as effectively private.

Constructors complicate this a bit. They don't have an exact replica in the pure type + functions perspective, because there is also special syntactic sugar for using them.

For instance, this class:

```
class Foo {
  bar: string
  baz: bool

  constructor(bar: string, baz: bool) {
    this.bar = bar
    this.baz = baz
  }

  getBar(): string {
    return this.bar
  }

  bazzle(): string {
    if (this.baz) {
      return "bazzle!"
    } else {
      return "buzzle..."
    }
  }
}
```

could be functionally replicated by:

```
type Foo {
  bar: string
  baz: bool
}

fn createFoo(bar: string, baz: bool): Foo {
  let this: Foo
  this.bar = bar
  this.baz = baz
  return this
}

fn getBar(this: Foo): string {
  return this.bar
}

fn bazzle(this: Foo): string {
  if (this.baz) {
    return "bazzle!"
  } else {
    return "buzzle..."
  }
}
```

But the calling of that constructor function would look like this for classes (examples assuming type inference is built):

```
const foo = new Foo("bar", true)
```

and this way for types:

```
const foo = createFoo("bar", true)
```

Essentially the same, but with the latter, I have to make sure I import `createFoo` while the former I get it for free and have this special functional syntax for new type creation that I don't get with pure types. I would like to figure out a way to solve that for both types and classes, but I haven't figured one out yet.

Both would still be able to create an instance using the type constant mechanism:

```
const foo = new Foo {
  bar: "bar"
  baz: true
}
```

but that's not powerful enough when there are certain properties it is not expected that the user of the type would ever initialize, or if there are any particular side-effects necessary during initialization.


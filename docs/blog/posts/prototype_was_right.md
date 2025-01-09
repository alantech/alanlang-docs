---
draft: true
date: 2025-01-09
authors:
  - dfellis
categories:
  - PL Design
  - DevExp
  - Libraries
---

# `Prototype.js` Was Right All Along

If you're even aware that [`Prototype.js`](http://prototypejs.org/) exists, you're probably very confused, as the library hasn't received a single update in almost 10 years and has been decried as a terrible idea since [at least 2006](https://blog.metawrap.com/2006/01/06/why-i-dont-use-the-prototype-js-javascript-library/), nearing 20 years ago.

The reasoning in that blogpost and most complaints about `Prototype.js` are completely sound, though, and choosing to use it prevented you from safely using almost any other 3rd party Javascript library. Back when `Prototype.js` was written, though, you would use maybe 1-2 libraries, tops, and hand write everything else yourself, as there were no bundlers, no `node_modules`, etc, so this wasn't as big of a deal at the time, but it was what sealed its demise whenever any library you wanted/needed to use would break if `Prototype.js` was around.

But, what did `Prototype.js` actually do, why did that break things, and why am I still claiming that it was right all along?

<!-- more -->

## What did `Prototype.js` actually do?

`Prototype.js` was a sort of meta library. You included it at the beginning of your web page and then (usually) never directly interacted with it at all. Javascript is one of the few languages, and definitely the most popular, to use [Prototype-based programming](https://en.wikipedia.org/wiki/Prototype-based_programming), where object instantiation and functionality is derived from a chain of prototype objects that define these features.

The key distinction between Prototype-based and Class-based is that the chain is mutable at runtime. `Prototype.js` primarily altered the prototypes of core objects in Javascript, such as `Object`, `Function`, `Array`, etc, adding new functionality to them. With this, you suddenly have an expanded standard library to work with and your code can be much clearer and/or have less of an burden to maintain because these common concepts have been implemented in a more heavily tested way than your own (or own team's) code would be.

## Why did that break things?

In a vacuum with just your own code that you are writing and testing, this is great. You have easier-to-maintain code and you can iterate more quickly. But this alteration of the *core objects* in Javascript doesn't just affect your own code in the web page, but also any other Javascript code you're running in the page, and these alterations can introduce behavior differences from what is expected.

Early `Prototype.js` caused issues with `for(key in object) {` iterators because these new methods would show up in the iterator unexpectedly. The built-in methods did not because Javascript engines explicitly excluded them from the iterator and didn't provide a way for users to add values to be excluded. This functionality was later added to Javascript and this particular hard problem with `Prototype.js` was resolved, but the damage was already done: using `Prototype.js` with any library that didn't know about it and also used object key iterators would break, so it was a dangerous library to use outside of simple pages or actual prototyping.

But even supposing that all of these issues were resolved (and I believe they were), you still can't have *any other* library do what `Prototype.js` is doing in the same web page as it could introduce new methods or properties that overwrite the ones introduced by `Prototype.js` and clobber each other.

There's a reason languages aren't using Prototype-based programming anymore, and why Javascript tries to cover up its mistakes with the [`class` syntactic sugar](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) that makes sure you create new object types "the right way" -- actually mutating the prototypes of any object you didn't create yourself can cause unexpected side-effects in distant code from another library with no clear source of the issue. The core feature that `Prototype.js` was founded on was determined to be a fundamental flaw in Javascript.

## How could `Prototype.js` be right?

Let's take a look at some of the features `Prototype.js` brought to the base Javascript objects in the early 2000s. Starting with [`Array`](http://api.prototypejs.org/language/Array/index.html) (of which at least 3/4ths of the page is dedicated to a screed against `for..in` looping that we'll ignore), we see that it has added methods such as `map`, `some`, `every`, `filter`, `indexOf`, `lastIndexOf`, `reverse` which [all now exist in standard Javascript with exactly these names](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array), while some others like `flatten` received a different name (`flat`), or were put on a different object ([`window.structuredClone`](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone)), or were conceptually moved to a newly created standard object (the set operations moved to [a real `Set` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)).

Note that `Prototype.js` says `Array` also includes all of the `Enumerable` object? This gets us some more elements of modern `Array` like `any`, `all`, etc, and this can be used for enumerating more than just Arrays, just like how modern Javascript [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) and [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) can be enumerated with their own special logic to do so and a (different) standard way to do it.

We can see the prescience of `Prototype.js` throughout this documentation. There's a [`Hash`](http://api.prototypejs.org/language/Hash/index.html) object they created that is very similar to [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) conceptually to break the abuse of bare `Object` map-like usage. There's an [`ObjectRange`](http://api.prototypejs.org/language/ObjectRange/index.html) object that is similar in concept to [`Iteration`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) in modern Javascript. You have to implement a `next` method in modern Javascript, and it was called `succ` in `Prototype.js`. There's [`Template`](http://api.prototypejs.org/language/Template/index.html) similar in scope, but less magic because it's layered on top, to [`Template literals`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).

The `Prototype.js` team recognized gaps in Javascript's standard library and filled them in at least a decade before Javascript caught up to it. They were right on what Javascript needed, but their approach caused issues within the community: either the entire ecosystem had to adopt `Prototype.js`, or they had to reject it, because of how invasive it was. Because triaging issues could always (eventually, exhaustingly) be root caused as due to `Prototype.js` mucking with the built-in standard library of objects, the community rejected it.

And with rejecting it, the Javascript community began iterating on ways to replicate it, but without this fatal flaw.

## What did others do?

I'll be much more brief here, as this is not the focus of this article, but to fast forward us to roughly the state of Javascript today:

* [`Underscore.js`](https://underscorejs.org/) was a direct reaction to `Prototype.js`. It's almost directly called out in the first sentence on the page, "...without extending any built-in objects." A singular `_` global variable is inserted that has a grab-bag of methods whose first argument is the object you're working with and remaining arguments are equivalent to the method arguments if it had been a proper method of the object.
* [`browserify`](https://browserify.org/) let you use Node.js libraries in the browser easily. It's one of the first (and imo underrated and still one of the best) bundlers that indirectly helped spell the demise of `Prototype.js` by increasing the odds of developers using a library that doesn't work with it by letting them vastly increase the number of libraries they used. It also made use of [`IIFE`s](https://en.wikipedia.org/wiki/Immediately_invoked_function_expression) to shim a "Node.js"-like environment for your code to execute inside of without polluting "classic" Javascript libraries (except for injecting a top-level `require` function if you wanted).
* [`CoffeeScript`](https://coffeescript.org/) is a special-purpose Python-ish language that transpiles to Javascript. It's purpose was to provide a subjectively "cleaner" syntax for developers, but also demonstrated a way to add new root object methods without polluting the actual root object prototype by transpiling these special methods into underscore-like function calls, instead.
* [`Babel`](https://babeljs.io/) potentially inspired by that behavior of CoffeeScript (I am not sure, I do not know Babel's early history), Babel transpiles Javascript to Javascript. Specifically, newer Javascript syntax to work on earlier versions of Javascript still in production browsers, helping the ECMAScript Committee (and daring devs) try out proposals before they actually land, allowing for much of the adoption of `Prototype.js`-like features to occur.
* [`TypeScript`](https://www.typescriptlang.org/) technically a separate language like `CoffeeScript`, but it attempts to be more like `Babel` as a superset of Javascript but adding type safety to the language. Some new Javascript features have been derived from first existing in Typescript, such as [the optional chaining operator `?.`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining).

## `Prototype.js` was still "right" about adding to the Prototype

It's what Javascript's design encourages users to do. If you want `variable.method(argument)` style syntax, doing `Constructor.prototype.method = implementation` is how you (easily) get it (and `Object.defineProperty(Constructor.prototype, 'method', { value: implementation })` when you want to do it "right" and not mess with enumeration).

The real problem is that encapsulating and isolating this from code outside of your scope is not really possible in Javascript. The only tractable solution has been to just *not* do it in Javascript, either explicitly with `Underscore.js` or by making a transpiler do it with `CoffeeScript`, `Babel`, and `TypeScript`. Only `browserify` attempts this partially by wrapping things in an `IIFE`, though this only worked on not exposing new top-level objects that `Node.js` introduced to non-Node-ecosystem Javascript code.

But just "not doing it" has never been acceptable to users, otherwise `Babel` and to a lesser extent `TypeScript` would never have happened.

## Why do developers want non-standard methods on core types?

This is much more opinion-based. Why developers write code in any way can have a multitude of reasons, and developers are not one homogenous group, so this will be flat-out wrong for certain developer communities. I will attempt to demonstrate my reasoning why a majority of developers (or at least the largest plurality) gravitate towards methods, and therefore why `Underscore.js` or just `require`ing libraries that operate on these built-in objects and gluing them together, has never been good enough.

Let's take a look at code that makes good use of methods. We have an `Array` of grades for students that we're deriving some statistics from. Each element of the array will be a record, an object with the following keys (with Typescript types for clarity): `surname: string`, `givenName: string`, `gender: string | null`, `subject: 'Algebra' | 'English' | 'Physics' | 'Music'`, `grade: number`. The first three strings are essentially free-form, but we'll be bucketing `gender` into `male`, `female`, `non-binary`, and `non-specified`, with the first two being exact string matches, any other string going to `non-binary`, and `null` going to `non-specified`. The name information is irrelevant for our purposes, so it'll be removed before any processing, and then there will be statistics calculated. We'll be extracting the mean (average), min, and max grades for each bucket. First across all subjects and genders, then for each subject, then each gender, and finally each subject+gender pairing. For all of these, but especially the last one, there will not be a report generated if there are 3 or fewer students within the bucket, and the report will be removed.

```js
// Censor the names from the grades and convert the gender into one of four buckets for analysis
let censoredGrades = grades.map(({ gender, subject, grade }) => ({
  subject,
  grade,
  gender: gender === 'male' || gender === 'female' ?
    gender :
    gender === null ?
      'non-specified' :
      'non-binary'
}));
// Create the grade report groups, one for all, one for each of the gender buckets, one for each of
// the subjects, and one for each gender+subject pair
let groups = [];
for (const gender of [null, 'male', 'female', 'non-binary', 'non-specified']) {
  groups.push({ gender, });
  for (const subject of [null, 'Algebra', 'English', 'Physics', 'Music']) {
    groups.push({ gender, subject, });
  }
}
// Generate the report for each reporting group
let report = groups
  .map(({ gender, subject }) => censoredGrades
    // Filter out records that don't match the reporting group
    .filter((record) => (gender === null || gender === record.gender) &&
      (subject == null || subject === record.subject))
    // Combine the remaining grades into a report
    .reduce((stats, record, index, arr) => {
      // Skip this report if there are too few students in the sample
      if (arr.length < 4) {
        return null;
      }
      // Otherwise, update the report as each record is added
      return {
        // Copy the gender and subject to keep the report properly labeled
        gender: stats.gender,
        subject: stats.subject,
        // Update the lowest grade recorded if lower
        min: Math.min(stats.min, record.grade),
        // Update the highest grade recorded if higher
        max: Math.max(stats.max, record.grade),
        // Update the mean. We can use the current index being processed to determine how many vals
        // went into the existing mean and then multiply by that index to recreate the sum, then add
        // the new grade and divide by the new total number of values (index + 1)
        mean: (stats.mean * index + record.grade) / (index + 1),
      };
    }, {
      // Initialize the report with values that guarantee that the first record replaces all of the
      // values (set the gender and subject based on the particular report group, min of Infinity so
      // the grade is definitely smaller, max of -Infinity so the grade is definitely larger, and
      // technically the mean doesn't matter as it will be multiplied by zero on the first record,
      // but set it to zero anyway)
      gender,
      subject,
      min: Infinity,
      max: -Infinity,
      mean: 0,
    }))
  // Remove reports that were censored for being too noisy and potentially expose individual scores
  .filter((report) => report !== null);
```

This is a non-trivial example, so the solution is also non-trivial, but the flow of the code is for the most part very linear, you can read from left-to-right, top-to-bottom and not really need to backtrack. The two exceptions are the double-for loop mutating the `groups` array, though that's a small backtracking you probably won't even notice, and then in the main `reduce` method call due to Javascript's unfortunate decision to put the initial value argument as the second argument instead of the first when it is used as a two-argument function. To be *sure* the main callback body passed to the `reduce` works, you'd need to read the initial value near the end of the example, which introduces a bit of non-linearity, *but* it's within a singular method call.

The linearity of the logic is helped by method chaining. `variable.method1(arg1).method2(arg2).method3(arg3, arg4).method4(arg5)` is *significantly* easier to read than the purely functional variant `method4(method3(method2(method1(variable, arg1), arg2), arg3, arg4), arg5)`. The first thing to be executed is roughly in the middle of the purely functional style, and later execution straddles, with part of the definition earlier and part of it later.

We work around this problem with formatting rules, rewriting the second as something like:

```js
method4(
  method3(
    method2(
      method1(
        variable,
        arg1,
      ),
      arg2,
    ),
    arg3,
    arg4,
  ),
  arg5,
)
```

which takes up significantly more vertical space, and therefore reducing the overall code density on screen, but your eye is drawn to the "peak" of the "pyramid" and that is where execution starts, and you can visually trace which arguments belong to which function calls by the indentation level. An alternative exists by assigning intermediate results to variables:

```js
let val1 = method1(variable, arg1);
let val2 = method2(val1, arg2);
let val3 = method3(val2, arg3, arg4);
let val4 = method4(val3, arg5);
```

This returns the linearity and reduces the verticality quite a bit, but these single-use variables can be hard to name if the intermediate state doesn't have a term in whatever domain the problem is in, and typos here can cause the wrong intermediate value to be passed in the chain, particularly in dynamic languages like Javascript that won't provide an error if the argument is the wrong type.

Too many variable names works against the average human mind both by requiring thought about extraneous details that do not matter, and then if the human becomes lazy and chooses terse, repetitive variable names, increases the odds of mistakenly using the wrong intermediate variable. Developers gravitate towards method chaining because they get clearer code that is also easier to maintain and harder to introduce bugs.

So when developers have a function that they use over-and-over on a particular type, having that available as a method instead of a disjoint function is what they want *for very solid reasons*. `Prototype.js` was trying to give that to them. And if the developers themselves have a problem domain where they see the same pattern of code being written over-and-over again, they should be able to give themselves a method to be able to include in a method chain.

The true problem is that to do so you break the encapsulation of your code versus the rest of the code in the project, and this is the fault of Javascript (and all Prototypal languages), not *truly* the fault of `Prototype.js` and others who used this tool the language made its foundation and encouraged in its design.

So today, instead of actually solving this problem and making fluent method chaining trivial, we pretend that Javascript is as rigid as C++, with Javascript gaining `class` syntactic sugar to further sell this lie, and any non-standard methods on core objects are only allowed as part of the definition of another language that transpiles into Javascript, whether it is CoffeeScript, TypeScript, or a proposed future Javascript.

This doesn't have to be the case. There are other languages that have a partial solution to this, and I have a proposal to do so seamlessly *and* safely that I have integrated into the [Alan Programming Language](https://alan-lang.org).

## How do other languages work around the method chaining problem?

In [F#, the "pipe operator" `|>`](https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/functions/#pipelines) solves this problem.

```fsharp
let result = 100 |> function1 |> function2
```

This is a special operator that simply calls the *second* argument as a function of the *first* argument. This is combined with F#'s [automatic partial application](https://fsharpforfunandprofit.com/posts/partial-application/) of a function so you can pass arguments to the function and *then* the argument that came from the pipe operator is given as the last argument so the function can then be called.

This does allow for chaining of just about anything *but* it works backwards to how method chaining works, with the passed in argument being the last argument in the argument list instead of the first. This is not an insurmountable problem and developers could get used to it over time, but adopting this in a language that has method syntax can lead to a confusing state of things, where `variable.method1(arg1) |> method2(arg2).method3(arg3, arg4) |> method4(arg5)` doesn't work at all like the original example, and keeping track of argument ordering, function [`apply`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply), and so on could make the code more difficult to parse and dense at the same time.

If the language doesn't support methods but only has pipe chaining, partial application, and currying I could see this working out okay, but since F# is meant to be compatible with C#, [it *also* has methods](https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/members/methods), which is unfortunate.

The main benefit of `|>` is that the chaining is encapsulated. `100 |> function1` only works when `function1` is in scope, and `function1` does not become a property of the integer type in the same way altering a prototype in JS to enable chaining would do. The disadvantage is that it inverts which argument the `100` goes into (the last instead of the first).

The behavior of `|>` and `.` are similar but not quite identical. What if, instead of thinking of the `.` as only accessing the property of the variable, we think of it as an operator that has an internal order of operations it follows?

## How Javascript can finally live up to the `Prototype.js` promise

Currently in JS, `variable.property` checks the variable and its prototype chain for a `property` value and then returns it. If no `property` is found, it returns `undefined` instead. If you call that `property` with parenthesis to provide arguments, it sets the `variable` to `this` and passes the arguments through as a function call, or errors if `property` is not a function.

If instead if `undefined` is attempted to be called as a function it tries to find a function in the current scope with the `property` name and then calls it with `variable` set to `this` and pass in the arguments, you can get locally-scoped "methods" that have zero impact outside of your own code that also won't override any built-in methods for a function *and* also won't impact property testing for existing code that does duck typing because `variable.property instanceof Function` will return `false` because non-function-calling property accesses will still return `undefined` in that case.

[Alan has a more powerful variant of this concept](../../learn_alan/index.md#method-and-property-syntax) that just makes the `variable` the first argument of the function and checks that the type of the first argument matches the first argument of the function, so you can't call a method on the wrong kind of value, and does function dispatch on both function name *and* argument types to allow defining the same custom "method" for multiple types.

Javascript doesn't need this since it is dynamically typed, so if you want to reuse the same custom "method" on multiple kinds of data, you just have your "method" do `if (typeof this == "...")` and `if (this instanceOf That)` checking to overload it.

This slight tweak to how Javascript's method syntax works could finally realize the power that `Prototype.js` tried to attain two decades ago, and do so in a democratized way where you as a regular developer writing regular application code can take advantage of it, as well.

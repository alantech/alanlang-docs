#### Resolution

The module resolution algorithm is inspired by multiple languages, but primarily Node.js. The recursive module resolution system makes it much easier to upgrade dependencies even if some of your own dependencies still depend on an older version of them.

This sounds like a security issue, but in practice it's better than the flat dependency model, as security updates can be applied as rapidly as possible to most of the codebase and not cause pain in the process, while a flat dependency model requires lockstep upgrades, so you cannot upgrade dependencies until all have released a version using the updated dependency, holding you back and causing weird chicken-and-egg issues. And tooling has sprung up in the Node community to track the laggards on updating and to override their dependency versions ifnecessary.

However, one of the issues with a tree-based module resolution system is many duplicate dependencies. Dependency hoisting and keeping the hierarchy as flat as possible helps eliminate this, and the module installation system should keep this in mind. `alan` will come with such a system baked into the language.

The other major issue with reducing the friction on using third-party modules is that you use third-party modules a whole lot as its easy to do, now. Combine that with Node.js's intentionally small standard library and there are lots of tiny modules that implement basic functionality because it wasn't available and people wrote and released their own implementations and other people installed the first ones they found.

Even more, the module resolution system in Node.js is *nicer* for third-party modules than for source code in your own project! Third party dependencies can be referenced by a memorable name, while code in your project must be referenced by relative pathing to the module in question, which becomes complicated when you need to traverse up and down the path by different amounts for different locations within your project, and also makes refactoring tedious when it is not obvious by a `git grep` which files are using your module.

`alan`'s module resolution system attempts to address these concerns by having separate directories for third-party dependencies you install and being able to uniformly name modules within your own codebase clearly.

While relative pathing is necessary for a module to reference its submodule and it is possible to traverse up the tree and back down, having `../` in your import path should be considered an anti-pattern in `alan`.

A project directory structure like this:

```
ecommerceco/
├── dependencies/
│   └── alanco/
│       └── sqlclient/
│           ├── index.ln
│           ├── mariadb.ln
│           ├── mysql.db
│           ├── postgres.ln
│           └── sqlserver.ln
├── index.ln
└── modules/
    ├── logger.ln
    ├── models/
    │   ├── index.ln
    │   ├── products.ln
    │   ├── purchases.ln
    │   ├── suppliers.ln
    │   └── users.ln
    └── views/
        ├── cart.ln
        ├── home.ln
        ├── index.ln
        ├── product_details.ln
        └── purchase.ln
```

Allows the root `index.ln` file to reference the logger with just `import @logger` to get `./modules/logger.ln` and the models with just `import @models` while the `./modules/models/index.ln` file can get the SQL client by `import @alanco/sqlclient` that comes from `./dependencies/alanco/sqlclient/index.ln`

Similarly, `./modules/views/index.ln` is referenced as just `@views` by the `./index.ln` file and can reference the models with just `@models` as the resolution logic pops up and then discovers it's location for you. Module names are clear and memorable regardless of the origin: third-party and your own code can be treated the same, so there is no perverse incentive to publish helper modules you only use within your own project.


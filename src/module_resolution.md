#### Resolution

The module resolution algorithm is inspired by multiple languages, but primarily Node.js. The recursive module resolution system makes it much easier to upgrade dependencies even if some of your own dependencies still depend on an older version of them.

This sounds like a security issue, but in practice it's better than the flat dependency model, as security updates can be applied as rapidly as possible to most of the codebase and not cause pain in the process, while a flat dependency model requires lockstep upgrades, so you cannot upgrade dependencies until all have released a version using the updated dependency, holding you back and causing weird chicken-and-egg issues. And tooling has sprung up in the Node community to track the laggards on updating and to override their dependency versions if necessary.

However, one of the issues with a tree-based module resolution system is many duplicate dependencies. Dependency hoisting and keeping the hierarchy as flat as possible helps eliminate this.

The other major issue with Node.js's module model is reducing the friction on using third-party modules so much that it is *easier* to use third party modules than your own code. Third party modules can be loaded with a memorable name that doesn't change no matter where you are in the codebase, while your own code has to keep track of its relative location in the filesystem hierarchy anywhere it is used.

Combine that with Node.js's intentionally small standard library and there are lots of tiny modules that implement basic functionality because it wasn't available and people wrote and released their own implementations and other people installed the first ones they found, since it is so easy to do, and such cross-cutting core dependencies would show up in many different places in your project, each requiring a slightly different relative path invocation if it was a home-grown source file.

`alan`'s module resolution system attempts to address these concerns by having separate directories for third-party dependencies you install and being able to uniformly name modules within your own codebase clearly.

While relative pathing is necessary for a module to reference its submodule and it is possible to traverse up the tree and back down, having `../` in your import path should be considered an anti-pattern in `alan`.

A project directory structure like this:

```
ecommerceco/
├── dependencies/
│   └── alantech/
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

Allows the root `index.ln` file to reference the logger with just `import @logger` to get `./modules/logger.ln` and the models with just `import @models` while the `./modules/models/index.ln` file can get the SQL client by `import @alantech/sqlclient` that comes from `./dependencies/alantech/sqlclient/index.ln`

Similarly, `./modules/views/index.ln` is referenced as just `@views` by the `./index.ln` file and can reference the models with just `@models` as well. Module names are clear and memorable regardless of the origin: third-party and your own code can be treated the same, so there is no perverse incentive to publish helper modules you only use within your own project.


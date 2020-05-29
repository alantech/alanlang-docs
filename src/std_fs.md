### @std/fs and/or @std/posixfs + @std/winfs + @std/clusterfs **

We need a standard way to access and manipulate the filesystem for the OSS version of the language. Most languages don't give a shit about Windows' insanity in the filesystem layer and it bites them in the ass later when they have to get code written for one to work on the other. We could make `@std/fs` a simplified interface that builds on top of `@std/posixfs`, `@std/winfs`, and `@std/clusterfs` (the latter for the SaaS offering) which would have more specific capabilities for their respective platforms (at the end of the day, filesystems are basically shared hierarchical databases without transactions, so it's pretty simple to simulate one on a DHT).


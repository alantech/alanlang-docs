### @std/ssl***

This should be a wrapper around https://www.libressl.org/ IMO. It could be around OpenSSL, but I seriously don't trust that project after the heartbleed stuff. The OpenBSD guys are also super sharp and the licensing means we can definitely just embed it into our project.

A secondary question: should we also expose `libcrypto` and `libtls` from their project?


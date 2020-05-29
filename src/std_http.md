### @std/http*

A Node or Express-like http client will live here, probably. Going to look at several HTTP client and server libraries but will consider Java's (and Apache's) implementations anti-patterns to avoid, even though I initially have to build my API on top of that.

For now, the `http` library has three types: `Server`, `Request`, and `Response`, and two functions, `server`, and `listen`.

#### HTTP Types

```
type Server {
  handler: fn (Request): Response
  port: int16
}
```

```
type Request {
  method: string
  uri: string
  path: string
  headers: Map<string, string>
  body: string
}
```

```
type Response {
  statusCode: int16
  headers: Map<string, string>
  body: string
}
```

#### HTTP Functions

* `server(fn (Request): Response): Server`
  Creates an HTTP server with the specified handler
* `listen(Server, int8 | int16 | int32 | int64): Server
  Sets the port for the server and implicitly starts it.

#### Re-proposed http library

Instead of sticking so close to the Express style, getting this hooked into the event loop can produce a potentially more idiomatic API, but it requires a tweak to how events work:

```
import @std/http

on http.port(80) fn (socket: http.Socket) {
  socket.response.body = "Hello, World!"
  http.close(socket)
}
```

Event handlers must still be declared in module scope, but `Event` values can be created by functions and used for handler registration and emits.

There must also be an http request library. Here is a proposed view of how it should look to the end user:

```
import @std/app
import @std/http

on app.start {
  const resp = http.fetch(new http.Request {
    method = "GET"
    uri = "https://google.com"
  })
  app.print(resp.body)
  emit exit 0
}
```

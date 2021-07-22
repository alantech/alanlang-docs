require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const stdlibs = require('./stdlibs.json')

const Ast = require('../dist/lntoamm/Ast')
const Module = require('../dist/lntoamm/Module').default
const Scope = require('../dist/lntoamm/Scope').default
const opcodeScope = require('../dist/lntoamm/opcodes').default.exportScope

module.exports = {
  loadStdModules: (modules) => {
    const stdAsts = Object.keys(stdlibs).map(n => ({
      name: n,
      ast: Ast.fromString(stdlibs[n]),
    }))
    // Load the rootScope first, all the others depend on it
    let rootModule
    stdAsts.forEach((moduleAst) => {
      if (moduleAst.name == 'root.ln') {
        rootModule = Module.populateModule('<root>', moduleAst.ast, opcodeScope, true)
        Module.getAllModules()['<root>'] = rootModule
      }
    })
    // Now load the remaining modules based on the root scope
    while (stdAsts.length > 0) {
      const moduleAst = stdAsts.shift();
      if (moduleAst.name !== 'root.ln') {
        const currName = moduleAst.name;
        try {
          moduleAst.name = '@std/' + moduleAst.name.replace(/.ln$/, '')
          const stdModule = Module.populateModule(
            moduleAst.name,
            moduleAst.ast,
            rootModule.exportScope,
            true
          )
          Module.getAllModules()[moduleAst.name] = stdModule
        } catch (e) { // Failed to load, throw it back on the list to try again
          moduleAst.name = currName;
          stdAsts.push(moduleAst);
        }
      }
    }
  },
}

},{"../dist/lntoamm/Ast":9,"../dist/lntoamm/Module":13,"../dist/lntoamm/Scope":15,"../dist/lntoamm/opcodes":21,"./stdlibs.json":2}],2:[function(require,module,exports){
module.exports={"app.ln":"/**\n * @std/app - The entrypoint for CLI apps\n */\n\n// The `start` event with a signature like `event start` but has special meaning in the runtime\nexport start\n\n// The `stdout` event\nexport event stdout: string\n\n// `@std/app` has access to a special `stdoutp` opcode to trigger stdout writing\non stdout fn (out: string) = stdoutp(out);\n\n// The `print` function converts its input to a string, appends a newline, and does a blocking write to stdout\nexport fn print(out: Stringifiable) {\n  stdoutp(out.toString() + \"\\n\");\n}\n\n// The `exit` event\nexport event exit: int8\n\n// `@std/app` has access to a special `exitop` opcode to trigger the exit behavior\non exit fn (status: int8) = exitop(status);\n\n// The `stderr` event\nexport event stderr: string\n\n// `@std/app` has access to a special `stderrp` opcode to trigger stderr writing\non stderr fn (err: string) = stderrp(err);\n\n// The `eprint` function converts its input to a string, appends a newline, and does a blocking write to stderr\nexport fn eprint(err: Stringifiable) {\n  stderrp(err.toString() + \"\\n\");\n}\n","avmdaemon.ln":"/**\n * @std/avmdaemon - A module for manipulating the AVM in daemon mode\n *\n * Does nothing in JS or one-off running an AVM, but provides access to special functionality\n * enabled when running as a cluster. For now, this is only allowing user-defined extensions to the\n * control port, but should eventually expose many things like the stats tracking, live-swapping of\n * running code, etc.\n */\n\nfrom @std/httpcommon import Connection, InternalRequest, InternalResponse, Request, Response, body, status, send\n\n/**\n * The Control Port\n */\n\n// The controlPort event\nexport event controlPort: Connection\n\n// Re-export the Connection, Request, and Response types\nexport Connection\nexport Request\nexport Response\n\n// Re-export the body, status, and send functions\nexport body\nexport status\nexport send\n\n// The special control port event with a signature like `event __ctrl: InternalRequest`\n// This wraper function takes the internal request object, converts it to the user-friendly\n// connection object, and then emits it on a new event for the user code to pick up\non __ctrl fn (conn: InternalRequest) {\n  emit controlPort new Connection {\n    req: new Request {\n      method: conn.method,\n      url: conn.url,\n      headers: toHashMap(conn.headers),\n      body: conn.body,\n    },\n    res: new Response {\n      status: 404, // If not set by the user, assume it doesn't exist\n      headers: newHashMap('Content-Length', '0'), // If not set by the user, assume no data\n      body: '', // If not set by the user, assume no data\n      connId: conn.connId,\n    },\n  };\n}\n\n/**\n * The Cluster Secret\n */\n\nexport fn getClusterSecret(): Maybe<string> = getcs();\n","cmd.ln":"/**\n * @std/cmd - The entrypoint for working with command line processes.\n */\n\nexport fn execEager(n: string) = execop(n);\nexport fn exec(n: string) {\n  return syncop(execEager, n);\n}","datastore.ln":"/**\n * @std/datastore - Shared mutable state with controlled access\n */\n\n// Just syntactic sugar to seem less stringly-typed than it is\nexport fn namespace(ns: string) = ns;\n\n// The set function to store shared data\nexport fn set(ns: string, key: string, val: any) = dssetv(ns, key, val);\nexport fn set(ns: string, key: string, val: int8) = dssetf(ns, key, val);\nexport fn set(ns: string, key: string, val: int16) = dssetf(ns, key, val);\nexport fn set(ns: string, key: string, val: int32) = dssetf(ns, key, val);\nexport fn set(ns: string, key: string, val: int64) = dssetf(ns, key, val);\nexport fn set(ns: string, key: string, val: float32) = dssetf(ns, key, val);\nexport fn set(ns: string, key: string, val: float64) = dssetf(ns, key, val);\nexport fn set(ns: string, key: string, val: bool) = dssetf(ns, key, val);\n\n// The has function to test if a shared key exists\nexport fn has(ns: string, key: string): bool = dshas(ns, key);\n\n// The del function to remove a shared key\nexport fn del(ns: string, key: string): bool = dsdel(ns, key);\n\n// The getOr function to get a value or the return the provided default\nexport fn getOr(ns: string, key: string, default: any) {\n  return dsgetv(ns, key).getOr(default);\n}\nexport fn getOr(ns: string, key: string, default: int8) {\n  return dsgetf(ns, key).getOr(default);\n}\nexport fn getOr(ns: string, key: string, default: int16) {\n  return dsgetf(ns, key).getOr(default);\n}\nexport fn getOr(ns: string, key: string, default: int32) {\n  return dsgetf(ns, key).getOr(default);\n}\nexport fn getOr(ns: string, key: string, default: int64) {\n  return dsgetf(ns, key).getOr(default);\n}\nexport fn getOr(ns: string, key: string, default: float32) {\n  return dsgetf(ns, key).getOr(default);\n}\nexport fn getOr(ns: string, key: string, default: float64) {\n  return dsgetf(ns, key).getOr(default);\n}\nexport fn getOr(ns: string, key: string, default: bool) {\n  return dsgetf(ns, key).getOr(default);\n}\n","deps.ln":"from @std/app import start, print, exit\nfrom @std/cmd import exec\n\n/**\n * @std/deps - The entrypoint to install dependencies for an alan program\n */\n\n// The `install` event\nexport event install: void\n\n// The `add` function takes a string that describes a .git repository and install it in /dependencies\nexport fn add(remote: string) {\n  // TODO implement proper error handling\n  const parts = remote.split('/');\n  const repo = parts[length(parts) - 1] || '';\n  const group = parts[parts.length() - 2] || '';\n  const dest = 'dependencies/' + group + '/' + repo;\n  const rm = exec('rm -rf ./' + dest);\n  const git = exec('git clone ' + remote + ' ./' + dest);\n  print(git.stderr);\n  const rm2 = exec('rm -rf ./' + dest + '/.git');\n  const maybeRecurse = exec('cd ' + dest + ' && alan install');\n}\n\n// The `commit` function takes no arguments. Currently just causes the application to quit, but\n// eventually would be the point where the dependencies defined by the calls to `add` could be\n// compared against the currently-installed dependencies, and a faster install would be possible\nexport fn commit() {\n  emit exit 0;\n}\n\n// Emit the `install` event on app `start`\non start {\n  // TODO: optimize to parse the existing dependencies tree, if any, to build up a list of dependencies\n  // that are already installed so calls by the user to install them again (assuming the version is identical)\n  // are skipped, calls to upgrade or install new dependencies are performed, and then the remaining list\n  // of dependencies at the end are removed.\n  exec('rm -rf dependencies');\n  exec('mkdir dependencies');\n  emit install;\n}\n","http.ln":"/**\n * @std/http - Built-in client for http(s)\n */\n\nfrom @std/httpcommon import InternalRequest, InternalResponse, Request, Response\n\n// Re-export Request and Response\n\nexport Request\nexport Response\n\n/**\n * HTTP Client\n */\n\nexport fn fetchEager(req: Request): Result<Response> {\n  const i = new InternalRequest {\n    method: req.method,\n    url: req.url,\n    headers: req.headers.keyVal,\n    body: req.body,\n    connId: 0, // Unused by the client\n  };\n  const ro = httpreq(i);\n  if ro.isOk() {\n    const o = ro.getR();\n    return ok(new Response {\n      status: o.status,\n      headers: toHashMap(o.headers),\n      body: o.body,\n      connId: o.connId,\n    });\n  } else {\n    return ro;\n  }\n}\n\nexport fn fetch(req: Request): Result<Response> {\n  const i = new InternalRequest {\n    method: req.method,\n    url: req.url,\n    headers: req.headers.keyVal,\n    body: req.body,\n    connId: 0, // Unused by the client\n  };\n  const ro = syncop(fn (ir: InternalRequest) = httpreq(ir), i);\n  if ro.isOk() {\n    const o = ro.getR();\n    return ok(new Response {\n      status: o.status,\n      headers: toHashMap(o.headers),\n      body: o.body,\n      connId: o.connId,\n    });\n  } else {\n    return ro;\n  }\n}\n\nexport fn getEager(url: string): Result<string> {\n  const res = fetchEager(new Request {\n    method: 'GET',\n    url: url,\n    headers: newHashMap('Content-Length', '0'),\n    body: '',\n  });\n  if res.isOk() {\n    const r = res.getR();\n    if r.status < 300 {\n      return ok(r.body);\n    } else {\n      return err('Response was not ok');\n    }\n  } else {\n    return res;\n  }\n}\nexport fn get(url: string): Result<string> {\n  const res = fetch(new Request {\n    method: 'GET',\n    url: url,\n    headers: newHashMap('Content-Length', '0'),\n    body: '',\n  });\n  if res.isOk() {\n    const r = res.getR();\n    if r.status < 300 {\n      return ok(r.body);\n    } else {\n      return err('Response was not ok');\n    }\n  } else {\n    return res;\n  }\n}\nexport fn postEager(url: string, body: string): Result<string> {\n  const res = fetchEager(new Request {\n    method: 'POST',\n    url: url,\n    headers: newHashMap('Content-Length', body.length().toString()),\n    body: body,\n  });\n  if res.isOk() {\n    const r = res.getR();\n    if r.status < 300 {\n      return ok(r.body);\n    } else {\n      return err('Response was not ok');\n    }\n  } else {\n    return res;\n  }\n}\nexport fn post(url: string, body: string): Result<string> {\n  const res = fetch(new Request {\n    method: 'POST',\n    url: url,\n    headers: newHashMap('Content-Length', body.length().toString()),\n    body: body,\n  });\n  if res.isOk() {\n    const r = res.getR();\n    if r.status < 300 {\n      return ok(r.body);\n    } else {\n      return err('Response was not ok');\n    }\n  } else {\n    return res;\n  }\n}\nexport fn putEager(url: string, body: string): Result<string> {\n  const res = fetchEager(new Request {\n    method: 'PUT',\n    url: url,\n    headers: newHashMap('Content-Length', body.length().toString()),\n    body: body,\n  });\n  if res.isOk() {\n    const r = res.getR();\n    if r.status < 300 {\n      return ok(r.body);\n    } else {\n      return err('Response was not ok');\n    }\n  } else {\n    return res;\n  }\n}\nexport fn put(url: string, body: string): Result<string> {\n  const res = fetch(new Request {\n    method: 'PUT',\n    url: url,\n    headers: newHashMap('Content-Length', body.length().toString()),\n    body: body,\n  });\n  if res.isOk() {\n    const r = res.getR();\n    if r.status < 300 {\n      return ok(r.body);\n    } else {\n      return err('Response was not ok');\n    }\n  } else {\n    return res;\n  }\n}\nexport fn delEager(url: string): Result<string> {\n  const res = fetchEager(new Request {\n    method: 'DELETE',\n    url: url,\n    headers: newHashMap('Content-Length', '0'),\n    body: '',\n  });\n  if res.isOk() {\n    const r = res.getR();\n    if r.status < 300 {\n      return ok(r.body);\n    } else {\n      return err('Response was not ok');\n    }\n  } else {\n    return res;\n  }\n}\nexport fn del(url: string): Result<string> {\n  const res = fetch(new Request {\n    method: 'DELETE',\n    url: url,\n    headers: newHashMap('Content-Length', '0'),\n    body: '',\n  });\n  if res.isOk() {\n    const r = res.getR();\n    if r.status < 300 {\n      return ok(r.body);\n    } else {\n      return err('Response was not ok');\n    }\n  } else {\n    return res;\n  }\n}","httpcommon.ln":"/**\n * @std/httpcommon - Common type definitions for the http-related standard libraries\n *\n */\n\n// The InternalRequest type for http requests\nexport type InternalRequest {\n  method: string,\n  url: string,\n  headers: Array<KeyVal<string, string>>,\n  body: string,\n  connId: int64,\n}\n\n// The InternalResponse type for http responses\nexport type InternalResponse {\n  status: int64,\n  headers: Array<KeyVal<string, string>>,\n  body: string,\n  connId: int64,\n}\n\n// The exposed Request type\nexport type Request {\n  method: string,\n  url: string,\n  headers: HashMap<string, string>,\n  body: string,\n}\n\n// The exposed Response type\nexport type Response {\n  status: int64,\n  headers: HashMap<string, string>,\n  body: string,\n  connId: int64,\n}\n\n// The roll-up Connection type with both\nexport type Connection {\n  req: Request,\n  res: Response,\n}\n\n// The body function sets the body for a Response, sets the Content-Length header, and retuns the\n// Response for chaining needs\nexport fn body(res: Response, body: string) {\n  res.body = body;\n  const len = body.length();\n  set(res.headers, 'Content-Length', len.toString());\n  return res;\n}\n\n// The status function sets the status of the response\nexport fn status(res: Response, status: int64) {\n  res.status = status;\n  return res;\n}\n\n// The send function converts the response object into an internal response object and passed that\n// back to the HTTP server. A Result type with either an 'ok' string or an error is returned\nexport fn send(res: Response): Result<string> {\n  const ires = new InternalResponse {\n    status: res.status,\n    headers: res.headers.keyVal,\n    body: res.body,\n    connId: res.connId,\n  };\n  res.connId = 0; // Clear out the connection ID after use so it can't be used again\n  return httpsend(ires);\n}\n","httpserver.ln":"/**\n * @std/httpserver - Built-in server for http\n *\n * Split from the client because of the automatic inclusion of event handlers when importing\n */\n\n// Make sure we're using the same Request, Response definitions between the two\nfrom @std/httpcommon import Connection, InternalRequest, InternalResponse, Request, Response, body, status, send\n\n// Re-export Connection, Request, and Response\n\nexport Connection\nexport Request\nexport Response\n\n// Re-export the body, status, and send functions\nexport body\nexport status\nexport send\n\n/**\n * HTTP Server\n */\n\n// The connection event\nexport event connection: Connection\n\n// The special connection event with a signature like `event __conn: InternalRequest`\n// This wrapper function takes the internal connection object, converts it to the user-friendly\n// connection object, and then emits it on a new event for user code to pick up\non __conn fn (conn: InternalRequest) {\n  emit connection new Connection {\n    req: new Request {\n      method: conn.method,\n      url: conn.url,\n      headers: toHashMap(conn.headers),\n      body: conn.body,\n    },\n    res: new Response {\n      status: 200, // If not set by the user, assume they meant it to be good\n      headers: newHashMap('Content-Length', '0'), // If not set by the user, assume no data\n      body: '', // If not set by the user, assume no data\n      connId: conn.connId,\n    },\n  };\n}\n","json.ln":"/* @std/json - A library for parsing, representing, and serializing to and from JSON\n * This representation can handle every JSON type, and if you squint at it, it cannot represent an\n * invalid value. This is not entirely true without a small liberty being taken. If a JSONNode is an\n * object, its children *should* be `KeyVal<string, JSONBase>` type, but if they're just `JSONBase`\n * you could also just use the `toString` representation of the value as its key and the value as\n * the value. Similarly, you should not ever have children attached to a `JSONBase`, but you can\n * just ignore those children.\n */\nexport type IsObject {\n  isObject: bool,\n}\n// TODO: Fix issues with using `void` as a value in the compiler\nexport type Null {\n  isNull: bool,\n}\nexport const null = new Null {\n  isNull: true,\n};\nexport type JSONBase = Either<Either<float64, bool>, Either<string, Either<IsObject, Null>>>\nexport type JSONNode = Either<KeyVal<string, JSONBase>, JSONBase>\nexport type JSON = Tree<JSONNode>\n\n/* IsObject Functions */\nexport fn toObject() = new IsObject {\n  isObject: true,\n};\nexport fn toArray() = new IsObject {\n  isObject: false,\n};\n\nexport fn isObject(a: IsObject) = a.isObject;\nexport fn isArray(a: IsObject) = !a.isObject;\n\n/* JSONBase functions */\nexport fn toJSONBase(a: float64): JSONBase {\n  return main(main(a));\n}\nexport fn toJSONBase(a: bool): JSONBase {\n  return main(alt(a));\n}\nexport fn toJSONBase(a: string): JSONBase {\n  return alt(main(a));\n}\nexport fn toJSONBase(a: IsObject): JSONBase {\n  return alt(alt(main(a)));\n}\nexport fn toJSONBase(a: Null): JSONBase {\n  alt(alt(alt(a)));\n}\nexport fn toJSONBase(): JSONBase {\n  alt(alt(alt(null)));\n}\n\nexport fn getFloat64(a: JSONBase): Result<float64> {\n  if a.isMain() {\n    const b = a.getMainOr(alt(false)); // TODO: Not require the default value here\n    if b.isMain() {\n      return ok(b.getMainOr(0.0));\n    }\n  }\n  return err(\"JSON Node is not a number type\");\n}\nexport fn getBool(a: JSONBase): Result<bool> {\n  if a.isMain() {\n    const b = a.getMainOr(main(0.0));\n    if b.isAlt() {\n      return ok(b.getAltOr(false));\n    }\n  }\n  return err(\"JSON Node is not a bool type\");\n}\nexport fn getString(a: JSONBase): Result<string> {\n  if a.isAlt() {\n    const b = a.getAltOr(alt(alt(null)));\n    if b.isMain() {\n      return ok(b.getMainOr(''));\n    }\n  }\n  return err(\"JSON Node is not a string type\");\n}\nexport fn getIsObject(a: JSONBase): Result<IsObject> {\n  if a.isAlt() {\n    const b = a.getAltOr(alt(alt(null)));\n    if b.isAlt() {\n      const c = b.getAltOr(alt(null));\n      if c.isMain() {\n        return ok(c.getMainOr(new IsObject {\n          isObject: false,\n        }));\n      }\n    }\n  }\n  return err(\"JSON Node is not an object or array\");\n}\nexport fn isFloat64(a: JSONBase): bool {\n  if a.isMain() {\n    const b = a.getMainOr(alt(false));\n    return b.isMain();\n  }\n  return false;\n}\nexport fn isBool(a: JSONBase): bool {\n  if a.isMain() {\n    const b = a.getMainOr(main(0.0));\n    return b.isAlt();\n  }\n  return false;\n}\nexport fn isString(a: JSONBase): bool {\n  if a.isAlt() {\n    const b = a.getAltOr(alt(null));\n    return b.isMain();\n  }\n  return false;\n}\nexport fn isObjectOrArray(a: JSONBase): bool {\n  if a.isAlt() {\n    const b = a.getAltOr(main(''));\n    if b.isAlt() {\n      const c = b.getAltOr(alt(null));\n      return c.isMain();\n    }\n  }\n  return false;\n}\nexport fn isNull(a: JSONBase): bool {\n  if a.isAlt() {\n    const b = a.getAltOr(main(''));\n    if b.isAlt() {\n      const c = b.getAltOr(new IsObject {\n        isObject: false,\n      });\n      return c.isAlt();\n    }\n  }\n  return false;\n}\nexport fn toString(a: JSONBase): string {\n  if a.isMain() {\n    const b = a.getMainOr(main(0.0));\n    if b.isMain() {\n      return b.getMainOr(0.0).toString();\n    } else {\n      return b.getAltOr(false).toString();\n    }\n  } else {\n    const b = a.getAltOr(main(''));\n    if b.isMain() {\n      return '\"' + b.getMainOr('').split('\"').join('\\\\\"') + '\"';\n    } else {\n      const c = b.getAltOr(alt(null));\n      if c.isMain() {\n        const obj = c.getMainOr(new IsObject {\n          isObject: false,\n        });\n        if obj.isObject {\n          return '{}';\n        } else {\n          return '[]';\n        }\n      } else {\n        return 'null';\n      }\n    }\n  }\n}\n\n/* JSONNode function */\nexport fn toJSONNode(a: float64): JSONNode {\n  return alt(a.toJSONBase());\n}\nexport fn toJSONNode(a: bool): JSONNode {\n  return alt(a.toJSONBase());\n}\nexport fn toJSONNode(a: string): JSONNode {\n  return alt(a.toJSONBase());\n}\nexport fn toJSONNode(a: IsObject): JSONNode {\n  return alt(a.toJSONBase());\n}\nexport fn toJSONNode(a: Null): JSONNode {\n  return alt(a.toJSONBase());\n}\nexport fn toJSONNode(): JSONNode {\n  return alt(toJSONBase());\n}\nexport fn toJSONNode(a: JSONBase): JSONNode {\n  return alt(a);\n}\nexport fn toJSONNode(a: KeyVal<string, JSONBase>): JSONNode {\n  return main(a);\n}\n\nexport fn getFloat64(a: JSONNode): Result<float64> {\n  if a.isAlt() {\n    const b = a.getAltOr(toJSONBase());\n    return b.getFloat64();\n  }\n  return err(\"JSON Node is not a number type\");\n}\nexport fn getBool(a: JSONNode): Result<bool> {\n  if a.isAlt() {\n    const b = a.getAltOr(toJSONBase());\n    return b.getBool();\n  }\n  return err(\"JSON Node is not a bool type\");\n}\nexport fn getString(a: JSONNode): Result<bool> {\n  if a.isAlt() {\n    const b = a.getAltOr(toJSONBase());\n    return b.getString();\n  }\n  return err(\"JSON Node is not a string type\");\n}\nexport fn getIsObject(a: JSONNode): Result<IsObject> {\n  if a.isAlt() {\n    const b = a.getAltOr(toJSONBase());\n    return b.getIsObject();\n  }\n  return err(\"JSON Node is not an object or array\");\n}\nexport fn getKeyVal(a: JSONNode): Result<KeyVal<string, JSONBase>> {\n  if a.isMain() {\n    return ok(a.getMainOr(new KeyVal<string, JSONBase> {\n      key: '',\n      val: toJSONBase(),\n    }));\n  }\n  return err(\"JSON Element is not a KeyVal type\");\n}\nexport fn isFloat64(a: JSONNode): bool {\n  if a.isAlt() {\n    const b = a.getAltOr(toJSONBase());\n    return b.isFloat64();\n  }\n  return false;\n}\nexport fn isBool(a: JSONNode): bool {\n  if a.isAlt() {\n    const b = a.getAltOr(toJSONBase());\n    return b.isBool();\n  }\n  return false;\n}\nexport fn isString(a: JSONNode): bool {\n  if a.isAlt() {\n    const b = a.getAltOr(toJSONBase());\n    return b.isString();\n  }\n  return false;\n}\nexport fn isObjectOrArray(a: JSONNode): bool {\n  if a.isAlt() {\n    const b = a.getAltOr(toJSONBase());\n    return b.isObjectOrArray();\n  }\n  return false;\n}\nexport fn isNull(a: JSONNode): bool {\n  if a.isAlt() {\n    const b = a.getAltOr(toJSONBase(0.0));\n    return b.isNull();\n  }\n  return false;\n}\nexport fn isKeyVal(a: JSONNode): bool {\n  return a.isMain();\n}\nexport fn toString(a: JSONNode): string {\n  if a.isAlt() {\n    const b = a.getAltOr(toJSONBase());\n    return b.toString();\n  }\n  const b = a.getMainOr(new KeyVal<string, JSONBase> {\n    key: '',\n    val: toJSONBase(),\n  });\n  return '\"' + b.key.split('\"').join('\\\\\"') + '\": ' + b.val.toString();\n}\n\n// JSON Functions\nexport fn toJSON(a: float64): JSON = newTree(a.toJSONNode());\nexport fn toJSON(a: bool): JSON = newTree(a.toJSONNode());\nexport fn toJSON(a: string): JSON = newTree(a.toJSONNode());\nexport fn toJSON(a: Null): JSON = newTree(a.toJSONNode());\nexport fn toJSON(a: IsObject): JSON = newTree(a.toJSONNode());\nexport fn toJSON(): JSON = newTree(toJSONNode());\n// TODO: Would an interface help here?\nexport fn toJSON(a: HashMap<string, float64>): JSON {\n  const json = newTree(toObject().toJSONNode());\n  a.keyVal().eachLin(fn (kv: KeyVal<string, float64>) {\n    const kv2 = new KeyVal<string, JSONBase> {\n      key: kv.key,\n      val: kv.val.toJSONBase(),\n    };\n    json.addChild(kv2.toJSONNode());\n  });\n  return json;\n}\nexport fn toJSON(a: HashMap<string, bool>): JSON {\n  const json = newTree(toObject().toJSONNode());\n  a.keyVal().eachLin(fn (kv: KeyVal<string, bool>) {\n    const kv2 = new KeyVal<string, JSONBase> {\n      key: kv.key,\n      val: kv.val.toJSONBase(),\n    };\n    json.addChild(kv2.toJSONNode());\n  });\n  return json;\n}\nexport fn toJSON(a: HashMap<string, string>): JSON {\n  const json = newTree(toObject().toJSONNode());\n  a.keyVal().eachLin(fn (kv: KeyVal<string, string>) {\n    const kv2 = new KeyVal<string, JSONBase> {\n      key: kv.key,\n      val: kv.val.toJSONBase(),\n    };\n    json.addChild(kv2.toJSONNode());\n  });\n  return json;\n}\nexport fn toJSON(a: HashMap<string, Null>): JSON { // Would anyone even use such a thing?\n  const json = newTree(toObject().toJSONNode());\n  a.keyVal().eachLin(fn (kv: KeyVal<string, Null>) {\n    const kv2 = new KeyVal<string, JSONBase> {\n      key: kv.key,\n      val: kv.val.toJSONBase(),\n    };\n    json.addChild(kv2.toJSONNode());\n  });\n  return json;\n}\nexport fn toJSON(a: HashMap<string, IsObject>): JSON {\n  const json = newTree(toObject().toJSONNode());\n  a.keyVal().eachLin(fn (kv: KeyVal<string, IsObject>) {\n    const kv2 = new KeyVal<string, JSONBase> {\n      key: kv.key,\n      val: kv.val.toJSONBase(),\n    };\n    json.addChild(kv2.toJSONNode());\n  });\n  return json;\n}\nexport fn toJSON(a: HashMap<string, JSONBase>): JSON {\n  const json = newTree(toObject().toJSONNode());\n  a.keyVal().eachLin(fn (kv: KeyVal<string, JSONBase>) {\n    json.addChild(kv.toJSONNode());\n  });\n  return json;\n}\n// TODO: Same story, different function. It feels like an interface type would work here\nexport fn toJSON(a: Array<float64>): JSON {\n  const json = newTree(toArray().toJSONNode());\n  a.eachLin(fn (v: float64) {\n    json.addChild(v.toJSONNode());\n  });\n  return json;\n}\nexport fn toJSON(a: Array<bool>): JSON {\n  const json = newTree(toArray().toJSONNode());\n  a.eachLin(fn (v: bool) {\n    json.addChild(v.toJSONNode());\n  });\n  return json;\n}\nexport fn toJSON(a: Array<string>): JSON {\n  const json = newTree(toArray().toJSONNode());\n  a.eachLin(fn (v: string) {\n    json.addChild(v.toJSONNode());\n  });\n  return json;\n}\nexport fn toJSON(a: Array<Null>): JSON { // Would anyone even use such a thing?\n  const json = newTree(toArray().toJSONNode());\n  a.eachLin(fn (v: Null) {\n    json.addChild(v.toJSONNode());\n  });\n  return json;\n}\nexport fn toJSON(a: Array<IsObject>): JSON {\n  const json = newTree(toArray().toJSONNode());\n  a.eachLin(fn (v: IsObject) {\n    json.addChild(v.toJSONNode());\n  });\n  return json;\n}\nexport fn toJSON(a: Array<JSONBase>): JSON {\n  const json = newTree(toArray().toJSONNode());\n  a.eachLin(fn (v: JSONBase) {\n    json.addChild(v.toJSONNode());\n  });\n  return json;\n}\n\nexport fn newJSONObject(): JSON {\n  return new IsObject {\n    isObject: true,\n  }.toJSON();\n}\n\nexport fn newJSONArray(): JSON {\n  return new IsObject {\n    isObject: false,\n  }.toJSON();\n}\n\nexport fn addKeyVal(j: JSON, key: string, val: JSONBase): JSON {\n  const kv = new KeyVal<string, JSONBase> {\n    key: key,\n    val: val,\n  };\n  j.addChild(kv.toJSONNode());\n  return j;\n}\nexport fn addKeyVal(j: JSON, key: string, val: float64): JSON {\n  const kv = new KeyVal<string, JSONBase> {\n    key: key,\n    val: val.toJSONBase(),\n  };\n  j.addChild(kv.toJSONNode());\n  return j;\n}\nexport fn addKeyVal(j: JSON, key: string, val: bool): JSON {\n  const kv = new KeyVal<string, JSONBase> {\n    key: key,\n    val: val.toJSONBase(),\n  };\n  j.addChild(kv.toJSONNode());\n  return j;\n}\nexport fn addKeyVal(j: JSON, key: string, val: string): JSON {\n  const kv = new KeyVal<string, JSONBase> {\n    key: key,\n    val: val.toJSONBase(),\n  };\n  j.addChild(kv.toJSONNode());\n  return j;\n}\nexport fn addKeyVal(j: JSON, key: string, val: IsObject): JSON {\n  const kv = new KeyVal<string, JSONBase> {\n    key: key,\n    val: val.toJSONBase(),\n  };\n  j.addChild(kv.toJSONNode());\n  return j;\n}\nexport fn addKeyVal(j: JSON, key: string, val: Null): JSON {\n  const kv = new KeyVal<string, JSONBase> {\n    key: key,\n    val: val.toJSONBase(),\n  };\n  j.addChild(kv.toJSONNode());\n  return j;\n}\nexport fn addKeyVal(j: JSON, key: string): JSON {\n  const kv = new KeyVal<string, JSONBase> {\n    key: key,\n    val: toJSONBase(),\n  };\n  j.addChild(kv.toJSONNode());\n  return j;\n}\nexport fn addKeyVal(j: JSON, key: string, val: JSON): JSON {\n  const childNode = j.addChild(val);\n  // Now mutate the attached sub-tree's root node to become a KeyVal pair\n  const baseNode = childNode || toJSONNode();\n  if baseNode.isKeyVal() {\n    // Just update the key to match.\n    // TODO, Make this assignment work in one line\n    let n = baseNode.getMainOr(new KeyVal<string, JSONBase> {\n      key: key,\n      val: toJSONBase(),\n    });\n    n.key = key;\n    return j;\n  }\n  // We need to replace the JSONNode itself\n  const baseVal = baseNode.getAltOr(toJSONBase());\n  const newVal = new KeyVal<string, JSONBase> {\n    key: key,\n    val: baseVal,\n  }.toJSONNode();\n  j.vals.set(childNode.id, newVal);\n  return j;\n}\n\nexport fn push(j: JSON, val: JSON): JSON {\n  j.addChild(val);\n  return j;\n}\nexport fn push(j: JSON, val: JSONNode): JSON {\n  j.addChild(val);\n  return j;\n}\nexport fn push(j: JSON, val: JSONBase): JSON {\n  j.addChild(val.toJSONNode());\n  return j;\n}\nexport fn push(j: JSON, val: float64): JSON {\n  j.addChild(val.toJSONNode());\n  return j;\n}\nexport fn push(j: JSON, val: bool): JSON {\n  j.addChild(val.toJSONNode());\n  return j;\n}\nexport fn push(j: JSON, val: string): JSON {\n  j.addChild(val.toJSONNode());\n  return j;\n}\nexport fn push(j: JSON, val: IsObject): JSON {\n  j.addChild(val.toJSONNode());\n  return j;\n}\nexport fn push(j: JSON, val: Null): JSON {\n  j.addChild(val.toJSONNode());\n  return j;\n}\nexport fn push(j: JSON): JSON {\n  j.addChild(toJSONNode());\n  return j;\n}\n\n// TODO: Remove this hardwired version of `toString` once `foldup` compiles correctly\nexport fn toString(j: JSON): string {\n  // Get the leaf nodes\n  const leaves = j\n    .toNodeArray()\n    .filter(fn (n: Node<JSONNode>): bool = n.getChildren().length().eq(0));\n  // Create a lookup table from their ids to their output values\n  let lookup = leaves.map(fn (l: Node<JSONNode>): KeyVal<int64, string> {\n    return new KeyVal<int64, string> {\n      key: l.id,\n      val: toString(l || toJSONNode()),\n    };\n  }).toHashMap();\n  // Construct a list of nodes to process, based on the parents of the leaf nodes, using a HashMap\n  // as a set, but only those parents that have all children set by these leaves\n  let nodeList = newHashMap(-1, false);\n  leaves.eachLin(fn (l: Node<JSONNode>) {\n    const parentId = l.getParent().id;\n    if parentId > -1 {\n      nodeList.set(l.getParent().id, true);\n    }\n  });\n  nodeList.keyVal().filter(fn (kv: KeyVal<int64, bool>): bool {\n    const n = j.getNodeById(kv.key);\n    const children = n.getChildren();\n    let missingChildren = false;\n    children.eachLin(fn (c: Node<JSONNode>) {\n      if lookup.get(c.id).isErr() {\n        missingChildren = true;\n      }\n    });\n    return missingChildren;\n  }).eachLin(fn (kv: KeyVal<int64, bool>) {\n    nodeList.set(kv.key, false);\n  });\n  // Execute the following block over and over again until there are no more nodes to process\n  seqdo(newseq(pow(2, 62).getOr(0)), fn (): bool {\n    // Generate a list of ids from the nodeList by filtering out all `false` entries and mapping\n    // the remaining ids into Nodes\n    const nodes = nodeList\n      .keyVal()\n      .filter(fn (kv: KeyVal<int64, bool>): bool = kv.val)\n      .map(fn (kv: KeyVal<int64, bool>): Node<JSONNode> = j.getNodeById(kv.key));\n    // Generate the array of child output values per node by mapping each node first into the array\n    // of children and then mapping that into the values stored in the lookup hashmap\n    const childVals = nodes.map(fn (n: Node<JSONNode>): Array<string> {\n      return n.tree.children[n.id].getOr(new Array<int64> []).map(fn (x: int64): string {\n        return lookup.get(x).getR();\n      });\n    });\n    // Compute the new output values by calling the folding function on the nodes and their paired\n    // child arrays\n    const newVals = nodes.map(fn (n: Node<JSONNode>, i: int64): string {\n      const nodeVal = n || toJSONNode();\n      if nodeVal.isKeyVal() {\n        const kv = nodeVal.getKeyVal() || new KeyVal<string, JSONBase> {\n          key: '',\n          val: toJSONBase(),\n        };\n        if kv.val.isObjectOrArray() {\n          const isObject = kv.val.getIsObject().getR();\n          if isObject.isObject {\n            return '\"' + kv.key + '\": {' + childVals[i].getR().join(', ') + '}';\n          } else {\n            return '\"' + kv.key + '\": [' + childVals[i].getR().join(', ') + ']';\n          }\n        } else {\n          return nodeVal.toString();\n        }\n      }\n      if nodeVal.isObjectOrArray() {\n        const isObject = nodeVal.getIsObject().getR();\n        if isObject.isObject {\n          return '{' + childVals[i].getR().join(', ') + '}';\n        } else {\n          return '[' + childVals[i].getR().join(', ') + ']';\n        }\n      } else {\n        // This is an invalid path for JSON, we'll just ignore the children, instead, for now\n        return nodeVal.toString();\n      }\n    });\n    // Wipe the set by marking all values as false (we don't have HashMap deletes, yet)\n    nodeList.keys().eachLin(fn (k: int64) = nodeList.set(k, false));\n    // Then for each node, if it has a parent, add its parent to the set and its value to the lookup\n    nodes.eachLin(fn (n: Node<JSONNode>, i: int64) {\n      const parentId = n.getParent().id;\n      if parentId > -1 {\n        nodeList.set(parentId, true);\n      }\n      lookup.set(n.id, newVals[i].getR());\n    });\n    // Scan through the parents and disable any that are missing one or more of its children, this\n    // allows unbalanced trees to process correctly\n    nodeList.keyVal().filter(fn (kv: KeyVal<int64, bool>): bool {\n      const n = j.getNodeById(kv.key);\n      const children = n.getChildren();\n      let missingChildren = false;\n      children.eachLin(fn (c: Node<JSONNode>) {\n        if lookup.get(c.id).isErr() {\n          missingChildren = true;\n        }\n      });\n      return missingChildren;\n    }).eachLin(fn (kv: KeyVal<int64, bool>) {\n      nodeList.set(kv.key, false);\n    });\n    // Check if there are any nodes in the set to process and exit the loop if no\n    return nodeList.keyVal().filter(fn (kv: KeyVal<int64, bool>): bool = kv.val).length().gt(0);\n  });\n  // Lookup the root node's value as that should be the output and return it\n  return lookup.get(j.getRootNode().id).getR();\n}\n\nexport interface json {\n  toJSON(float64): json,\n  toJSON(bool): json,\n  toJSON(string): json,\n  toJSON(Null): json,\n  toJSON(HashMap<string, float64>): json,\n  toJSON(HashMap<string, bool>): json,\n  toJSON(HashMap<string, string>): json,\n  toJSON(HashMap<string, Null>): json,\n  toJSON(Array<float64>): json,\n  toJSON(Array<bool>): json,\n  toJSON(Array<string>): json,\n  toJSON(Array<Null>): json,\n  toString(json): string,\n  /*newJSONObject(): json,\n  newJSONArray(): json,*/\n  addKeyVal(json, string, float64): json,\n  addKeyVal(json, string, bool): json,\n  addKeyVal(json, string, Null): json,\n  addKeyVal(json, string): json,\n  addKeyVal(json, string, json): json,\n  push(json, json): json,\n  push(json, float64): json,\n  push(json, bool): json,\n  push(json, string): json,\n  push(json, Null): json,\n  push(json): json,\n}\n","root.ln":"/**\n * The root scope. These definitions are automatically available from every module.\n * These are almost entirely wrappers around runtime opcodes to provide a friendlier\n * name and using function dispatch based on input arguments to pick the correct opcode.\n */\n\n// TODO: See about making an export block scope so we don't have to write `export` so much\n\n// Export all of the built-in types\nexport void\nexport int8\nexport int16\nexport int32\nexport int64\nexport float32\nexport float64\nexport bool\nexport string\nexport function // TODO: Make the function type more explicit than this\nexport Array\nexport Error\nexport Maybe\nexport Result\nexport Either\n\n// Type aliasing of int64 and float64 to just int and float, as these are the default types\nexport type int = int64\nexport type float = float64\n\n// Default Interfaces\nexport interface any {}\nexport interface anythingElse = any // Same as `any` but doesn't match with it\nexport interface Stringifiable {\n  toString(Stringifiable): string,\n}\nexport interface Orderable {\n  lt(Orderable, Orderable): bool,\n  lte(Orderable, Orderable): bool,\n  gt(Orderable, Orderable): bool,\n  gte(Orderable, Orderable): bool,\n}\nexport interface canFloat64 {\n  toFloat64(canFloat64): float64\n}\nexport interface canInt64 {\n  toInt64(canInt64): int64\n}\n\n// Type conversion functions\nexport fn toFloat64(n: int8) = i8f64(n);\nexport fn toFloat64(n: int16) = i16f64(n);\nexport fn toFloat64(n: int32) = i32f64(n);\nexport fn toFloat64(n: int64) = i64f64(n);\nexport fn toFloat64(n: float32) = f32f64(n);\nexport fn toFloat64(n: float64) = n;\nexport fn toFloat64(n: string) = strf64(n);\nexport fn toFloat64(n: bool) = boolf64(n);\n\nexport fn toFloat32(n: int8) = i8f32(n);\nexport fn toFloat32(n: int16) = i16f32(n);\nexport fn toFloat32(n: int32) = i32f32(n);\nexport fn toFloat32(n: int64) = i64f32(n);\nexport fn toFloat32(n: float32) = n;\nexport fn toFloat32(n: float64) = f64f32(n);\nexport fn toFloat32(n: string) = strf32(n);\nexport fn toFloat32(n: bool) = boolf32(n);\n\nexport fn toInt64(n: int8) = i8i64(n);\nexport fn toInt64(n: int16) = i16i64(n);\nexport fn toInt64(n: int32) = i32i64(n);\nexport fn toInt64(n: int64) = n;\nexport fn toInt64(n: float32) = f32i64(n);\nexport fn toInt64(n: float64) = f64i64(n);\nexport fn toInt64(n: string) = stri64(n);\nexport fn toInt64(n: bool) = booli64(n);\n\nexport fn toInt32(n: int8) = i8i32(n);\nexport fn toInt32(n: int16) = i16i32(n);\nexport fn toInt32(n: int32) = n;\nexport fn toInt32(n: int64) = i64i32(n);\nexport fn toInt32(n: float32) = f32i32(n);\nexport fn toInt32(n: float64) = f64i32(n);\nexport fn toInt32(n: string) = stri32(n);\nexport fn toInt32(n: bool) = booli32(n);\n\nexport fn toInt16(n: int8) = i8i16(n);\nexport fn toInt16(n: int16) = n;\nexport fn toInt16(n: int32) = i32i16(n);\nexport fn toInt16(n: int64) = i64i16(n);\nexport fn toInt16(n: float32) = f32i16(n);\nexport fn toInt16(n: float64) = f64i16(n);\nexport fn toInt16(n: string) = stri16(n);\nexport fn toInt16(n: bool) = booli16(n);\n\nexport fn toInt8(n: int8) = n;\nexport fn toInt8(n: int16) = i16i8(n);\nexport fn toInt8(n: int32) = i32i8(n);\nexport fn toInt8(n: int64) = i64i8(n);\nexport fn toInt8(n: float32) = f32i8(n);\nexport fn toInt8(n: float64) = f64i8(n);\nexport fn toInt8(n: string) = stri8(n);\nexport fn toInt8(n: bool) = booli8(n);\n\nexport fn toBool(n: int8) = i8bool(n);\nexport fn toBool(n: int16) = i16bool(n);\nexport fn toBool(n: int32) = i32bool(n);\nexport fn toBool(n: int64) = i64bool(n);\nexport fn toBool(n: float32) = f32bool(n);\nexport fn toBool(n: float64) = f64bool(n);\nexport fn toBool(n: string) = strbool(n);\nexport fn toBool(n: bool) = n;\n\nexport fn toString(n: int8) = i8str(n);\nexport fn toString(n: int16) = i16str(n);\nexport fn toString(n: int32) = i32str(n);\nexport fn toString(n: int64) = i64str(n);\nexport fn toString(n: float32) = f32str(n);\nexport fn toString(n: float64) = f64str(n);\nexport fn toString(n: string) = n;\nexport fn toString(n: bool) = boolstr(n);\n\n// Type alias conversion functions\nexport fn toFloat(n: canFloat64): float = toFloat64(n);\nexport fn toInt(n: canInt64): int = toInt64(n);\n\n// Error, Maybe, Result, and Either types and functions\nexport error // opcode with signature `fn error(string): Error`\nexport fn ref(a: any) = refv(a);\nexport fn ref(a: void) = reff(a);\nexport fn ref(a: int8) = reff(a);\nexport fn ref(a: int16) = reff(a);\nexport fn ref(a: int32) = reff(a);\nexport fn ref(a: int64) = reff(a);\nexport fn ref(a: float32) = reff(a);\nexport fn ref(a: float64) = reff(a);\nexport fn ref(a: bool) = reff(a);\nexport noerr // opcode with signature `fn noerr(): Error`\nexport fn toString(err: Error) = errorstr(err);\n\nexport fn some(val: any) = someM(val, 0);\nexport fn some(val: int8) = someM(val, 8);\nexport fn some(val: int16) = someM(val, 8);\nexport fn some(val: int32) = someM(val, 8);\nexport fn some(val: int64) = someM(val, 8);\nexport fn some(val: float32) = someM(val, 8);\nexport fn some(val: float64) = someM(val, 8);\nexport fn some(val: bool) = someM(val, 8);\nexport fn none() = noneM();\nexport isSome // opcode with signature `fn isSome(Maybe<any>): bool`\nexport isNone // opcode with signature `fn isNone(Maybe<any>): bool`\nexport fn getOr(maybe: Maybe<any>, default: any) = getOrM(maybe, default);\nexport fn toString(maybe: Maybe<Stringifiable>): string {\n  if maybe.isSome() {\n    return maybe.getMaybe().toString();\n  } else {\n    return 'none';\n  }\n}\nexport fn getOrExit(maybe: Maybe<any>): any {\n  if maybe.isNone() {\n    exitop(1.toInt8());\n  } else {\n    return maybe.getMaybe();\n  }\n}\n\nexport fn ok(val: any) = okR(val, 0);\nexport fn ok(val: int8) = okR(val, 8);\nexport fn ok(val: int16) = okR(val, 8);\nexport fn ok(val: int32) = okR(val, 8);\nexport fn ok(val: int64) = okR(val, 8);\nexport fn ok(val: float32) = okR(val, 8);\nexport fn ok(val: float64) = okR(val, 8);\nexport fn ok(val: bool) = okR(val, 8);\nexport err // opcode with signature `fn err(string): Result<any>`\nexport isOk // opcode with signature `fn isOk(Result<any>): bool`\nexport isErr // opcode with signature `fn isErr(Result<any>: bool`\nexport fn getOr(result: Result<any>, default: any) = getOrR(result, default);\nexport fn getOr(result: Result<any>, default: string) = getOrRS(result, default);\nexport getErr // opcode with signature `fn getErr(Result<any>, Error): Error`\nexport fn getErr(result: Result<any>, default: string) = getErr(result, error(default));\nexport fn toString(n: Result<Stringifiable>): string {\n  if n.isOk() {\n    return n.getR().toString();\n  } else {\n    return n.getErr(noerr()).toString();\n  }\n}\nexport fn getOrExit(result: Result<any>): any {\n  if result.isErr() {\n    stderrp(result.getErr(noerr()).toString());\n    exitop(1.toInt8());\n  } else {\n    return result.getR();\n  }\n}\n\nexport fn main(val: any) = mainE(val, 0);\nexport fn main(val: int8) = mainE(val, 8);\nexport fn main(val: int16) = mainE(val, 8);\nexport fn main(val: int32) = mainE(val, 8);\nexport fn main(val: int64) = mainE(val, 8);\nexport fn main(val: float32) = mainE(val, 8);\nexport fn main(val: float64) = mainE(val, 8);\nexport fn main(val: bool) = mainE(val, 8);\nexport fn alt(val: any) = altE(val, 0);\nexport fn alt(val: int8) = altE(val, 8);\nexport fn alt(val: int16) = altE(val, 8);\nexport fn alt(val: int32) = altE(val, 8);\nexport fn alt(val: int64) = altE(val, 8);\nexport fn alt(val: float32) = altE(val, 8);\nexport fn alt(val: float64) = altE(val, 8);\nexport fn alt(val: bool) = altE(val, 8);\nexport isMain // opcode with signature `fn isMain(Either<any, anythingElse>): bool`\nexport isAlt // opcode with signature `fn isAlt(Either<any, anythingElse): bool`\nexport fn getMainOr(either: Either<any, anythingElse>, default: any) = mainOr(either, default);\nexport fn getAltOr(either: Either<any, anythingElse>, default: anythingElse) = altOr(either, default);\nexport fn toString(either: Either<Stringifiable, Stringifiable>): string {\n  if either.isMain() {\n    return either.getMain().toString();\n  } else {\n    return either.getAlt().toString();\n  }\n}\nexport fn getMainOrExit(either: Either<any, anythingElse>): any {\n  if either.isAlt() {\n    exitop(1.toInt8());\n  } else {\n    return either.getMain();\n  }\n}\nexport fn getAltOrExit(either: Either<any, anythingElse>): any {\n  if either.isMain() {\n    exitop(1.toInt8());\n  } else {\n    return either.getAlt();\n  }\n}\n\n// Arithmetic functions\nexport fn add(a: int8, b: int8) = addi8(ok(a), ok(b));\nexport fn add(a: Result<int8>, b: int8) = addi8(a, ok(b));\nexport fn add(a: int8, b: Result<int8>) = addi8(ok(a), b);\nexport fn add(a: Result<int8>, b: Result<int8>) = addi8(a, b);\nexport fn add(a: int16, b: int16) = addi16(ok(a), ok(b));\nexport fn add(a: Result<int16>, b: int16) = addi16(a, ok(b));\nexport fn add(a: int16, b: Result<int16>) = addi16(ok(a), b);\nexport fn add(a: Result<int16>, b: Result<int16>) = addi16(a, b);\nexport fn add(a: int32, b: int32) = addi32(ok(a), ok(b));\nexport fn add(a: Result<int32>, b: int32) = addi32(a, ok(b));\nexport fn add(a: int32, b: Result<int32>) = addi32(ok(a), b);\nexport fn add(a: Result<int32>, b: Result<int32>) = addi32(a, b);\nexport fn add(a: int64, b: int64) = addi64(ok(a), ok(b));\nexport fn add(a: Result<int64>, b: int64) = addi64(a, ok(b));\nexport fn add(a: int64, b: Result<int64>) = addi64(ok(a), b);\nexport fn add(a: Result<int64>, b: Result<int64>) = addi64(a, b);\nexport fn add(a: float32, b: float32) = addf32(ok(a), ok(b));\nexport fn add(a: Result<float32>, b: float32) = addf32(a, ok(b));\nexport fn add(a: float32, b: Result<float32>) = addf32(ok(a), b);\nexport fn add(a: Result<float32>, b: Result<float32>) = addf32(a, b);\nexport fn add(a: float64, b: float64) = addf64(ok(a), ok(b));\nexport fn add(a: Result<float64>, b: float64) = addf64(a, ok(b));\nexport fn add(a: float64, b: Result<float64>) = addf64(ok(a), b);\nexport fn add(a: Result<float64>, b: Result<float64>) = addf64(a, b);\n\nexport fn sub(a: int8, b: int8) = subi8(ok(a), ok(b));\nexport fn sub(a: Result<int8>, b: int8) = subi8(a, ok(b));\nexport fn sub(a: int8, b: Result<int8>) = subi8(ok(a), b);\nexport fn sub(a: Result<int8>, b: Result<int8>) = subi8(a, b);\nexport fn sub(a: int16, b: int16) = subi16(ok(a), ok(b));\nexport fn sub(a: Result<int16>, b: int16) = subi16(a, ok(b));\nexport fn sub(a: int16, b: Result<int16>) = subi16(ok(a), b);\nexport fn sub(a: Result<int16>, b: Result<int16>) = subi16(a, b);\nexport fn sub(a: int32, b: int32) = subi32(ok(a), ok(b));\nexport fn sub(a: Result<int32>, b: int32) = subi32(a, ok(b));\nexport fn sub(a: int32, b: Result<int32>) = subi32(ok(a), b);\nexport fn sub(a: Result<int32>, b: Result<int32>) = subi32(a, b);\nexport fn sub(a: int64, b: int64) = subi64(ok(a), ok(b));\nexport fn sub(a: Result<int64>, b: int64) = subi64(a, ok(b));\nexport fn sub(a: int64, b: Result<int64>) = subi64(ok(a), b);\nexport fn sub(a: Result<int64>, b: Result<int64>) = subi64(a, b);\nexport fn sub(a: float32, b: float32) = subf32(ok(a), ok(b));\nexport fn sub(a: Result<float32>, b: float32) = subf32(a, ok(b));\nexport fn sub(a: float32, b: Result<float32>) = subf32(ok(a), b);\nexport fn sub(a: Result<float32>, b: Result<float32>) = subf32(a, b);\nexport fn sub(a: float64, b: float64) = subf64(ok(a), ok(b));\nexport fn sub(a: Result<float64>, b: float64) = subf64(a, ok(b));\nexport fn sub(a: float64, b: Result<float64>) = subf64(ok(a), b);\nexport fn sub(a: Result<float64>, b: Result<float64>) = subf64(a, b);\n\nexport fn negate(n: int8) = negi8(ok(n));\nexport fn negate(n: Result<int8>) = negi8(n);\nexport fn negate(n: int16) = negi16(ok(n));\nexport fn negate(n: Result<int16>) = negi16(n);\nexport fn negate(n: int32) = negi32(ok(n));\nexport fn negate(n: Result<int32>) = negi32(n);\nexport fn negate(n: int64) = negi64(ok(n));\nexport fn negate(n: Result<int64>) = negi64(n);\nexport fn negate(n: float32) = negi32(ok(n));\nexport fn negate(n: Result<float32>) = negi32(n);\nexport fn negate(n: float64) = negi64(ok(n));\nexport fn negate(n: Result<float64>) = negi64(n);\n\nexport fn abs(n: int8) = absi8(ok(n));\nexport fn abs(n: Result<int8>) = absi8(n);\nexport fn abs(n: int16) = absi16(ok(n));\nexport fn abs(n: Result<int16>) = absi16(n);\nexport fn abs(n: int32) = absi32(ok(n));\nexport fn abs(n: Result<int32>) = absi32(n);\nexport fn abs(n: int64) = absi64(ok(n));\nexport fn abs(n: Result<int64>) = absi64(n);\nexport fn abs(n: float32) = absf32(ok(n));\nexport fn abs(n: Result<float32>) = absf32(n);\nexport fn abs(n: float64) = absf64(ok(n));\nexport fn abs(n: Result<float64>) = absf64(n);\n\nexport fn mul(a: int8, b: int8) = muli8(ok(a), ok(b));\nexport fn mul(a: Result<int8>, b: int8) = muli8(a, ok(b));\nexport fn mul(a: int8, b: Result<int8>) = muli8(ok(a), b);\nexport fn mul(a: Result<int8>, b: Result<int8>) = muli8(a, b);\nexport fn mul(a: int16, b: int16) = muli16(ok(a), ok(b));\nexport fn mul(a: Result<int16>, b: int16) = muli16(a, ok(b));\nexport fn mul(a: int16, b: Result<int16>) = muli16(ok(a), b);\nexport fn mul(a: Result<int16>, b: Result<int16>) = muli16(a, b);\nexport fn mul(a: int32, b: int32) = muli32(ok(a), ok(b));\nexport fn mul(a: Result<int32>, b: int32) = muli32(a, ok(b));\nexport fn mul(a: int32, b: Result<int32>) = muli32(ok(a), b);\nexport fn mul(a: Result<int32>, b: Result<int32>) = muli32(a, b);\nexport fn mul(a: int64, b: int64) = muli64(ok(a), ok(b));\nexport fn mul(a: Result<int64>, b: int64) = muli64(a, ok(b));\nexport fn mul(a: int64, b: Result<int64>) = muli64(ok(a), b);\nexport fn mul(a: Result<int64>, b: Result<int64>) = muli64(a, b);\nexport fn mul(a: float32, b: float32) = mulf32(ok(a), ok(b));\nexport fn mul(a: Result<float32>, b: float32) = mulf32(a, ok(b));\nexport fn mul(a: float32, b: Result<float32>) = mulf32(ok(a), b);\nexport fn mul(a: Result<float32>, b: Result<float32>) = mulf32(a, b);\nexport fn mul(a: float64, b: float64) = mulf64(ok(a), ok(b));\nexport fn mul(a: Result<float64>, b: float64) = mulf64(a, ok(b));\nexport fn mul(a: float64, b: Result<float64>) = mulf64(ok(a), b);\nexport fn mul(a: Result<float64>, b: Result<float64>) = mulf64(a, b);\n\nexport fn div(a: int8, b: int8) = divi8(ok(a), ok(b));\nexport fn div(a: Result<int8>, b: int8) = divi8(a, ok(b));\nexport fn div(a: int8, b: Result<int8>) = divi8(ok(a), b);\nexport fn div(a: Result<int8>, b: Result<int8>) = divi8(a, b);\nexport fn div(a: int16, b: int16) = divi16(ok(a), ok(b));\nexport fn div(a: Result<int16>, b: int16) = divi16(a, ok(b));\nexport fn div(a: int16, b: Result<int16>) = divi16(ok(a), b);\nexport fn div(a: Result<int16>, b: Result<int16>) = divi16(a, b);\nexport fn div(a: int32, b: int32) = divi32(ok(a), ok(b));\nexport fn div(a: Result<int32>, b: int32) = divi32(a, ok(b));\nexport fn div(a: int32, b: Result<int32>) = divi32(ok(a), b);\nexport fn div(a: Result<int32>, b: Result<int32>) = divi32(a, b);\nexport fn div(a: int64, b: int64) = divi64(ok(a), ok(b));\nexport fn div(a: Result<int64>, b: int64) = divi64(a, ok(b));\nexport fn div(a: int64, b: Result<int64>) = divi64(ok(a), b);\nexport fn div(a: Result<int64>, b: Result<int64>) = divi64(a, b);\nexport fn div(a: float32, b: float32) = divf32(ok(a), ok(b));\nexport fn div(a: Result<float32>, b: float32) = divf32(a, ok(b));\nexport fn div(a: float32, b: Result<float32>) = divf32(ok(a), b);\nexport fn div(a: Result<float32>, b: Result<float32>) = divf32(a, b);\nexport fn div(a: float64, b: float64) = divf64(ok(a), ok(b));\nexport fn div(a: Result<float64>, b: float64) = divf64(a, ok(b));\nexport fn div(a: float64, b: Result<float64>) = divf64(ok(a), b);\nexport fn div(a: Result<float64>, b: Result<float64>) = divf64(a, b);\n\nexport fn mod(a: int8, b: int8) = modi8(a, b);\nexport fn mod(a: Result<int8>, b: int8) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(modi8(a.getR(), b));\n}\nexport fn mod(a: int8, b: Result<int8>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(modi8(a, b.getR()));\n}\nexport fn mod(a: Result<int8>, b: Result<int8>) {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(modi8(a.getR(), b.getR()));\n}\nexport fn mod(a: int16, b: int16) = modi16(a, b);\nexport fn mod(a: Result<int16>, b: int16) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(modi16(a.getR(), b));\n}\nexport fn mod(a: int16, b: Result<int16>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(modi16(a, b.getR()));\n}\nexport fn mod(a: Result<int16>, b: Result<int16>) {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(modi16(a.getR(), b.getR()));\n}\nexport fn mod(a: int32, b: int32) = modi32(a, b);\nexport fn mod(a: Result<int32>, b: int32) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(modi32(a.getR(), b));\n}\nexport fn mod(a: int32, b: Result<int32>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(modi32(a, b.getR()));\n}\nexport fn mod(a: Result<int32>, b: Result<int32>) {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(modi32(a.getR(), b.getR()));\n}\nexport fn mod(a: int64, b: int64) = modi64(a, b);\nexport fn mod(a: Result<int64>, b: int64) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(modi64(a.getR(), b));\n}\nexport fn mod(a: int64, b: Result<int64>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(modi64(a, b.getR()));\n}\nexport fn mod(a: Result<int64>, b: Result<int64>) {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(modi64(a.getR(), b.getR()));\n}\n\nexport fn pow(a: int8, b: int8) = powi8(ok(a), ok(b));\nexport fn pow(a: Result<int8>, b: int8) = powi8(a, ok(b));\nexport fn pow(a: int8, b: Result<int8>) = powi8(ok(a), b);\nexport fn pow(a: Result<int8>, b: Result<int8>) = powi8(a, b);\nexport fn pow(a: int16, b: int16) = powi16(ok(a), ok(b));\nexport fn pow(a: Result<int16>, b: int16) = powi16(a, ok(b));\nexport fn pow(a: int16, b: Result<int16>) = powi16(ok(a), b);\nexport fn pow(a: Result<int16>, b: Result<int16>) = powi16(a, b);\nexport fn pow(a: int32, b: int32) = powi32(ok(a), ok(b));\nexport fn pow(a: Result<int32>, b: int32) = powi32(a, ok(b));\nexport fn pow(a: int32, b: Result<int32>) = powi32(ok(a), b);\nexport fn pow(a: Result<int32>, b: Result<int32>) = powi32(a, b);\nexport fn pow(a: int64, b: int64) = powi64(ok(a), ok(b));\nexport fn pow(a: Result<int64>, b: int64) = powi64(a, ok(b));\nexport fn pow(a: int64, b: Result<int64>) = powi64(ok(a), b);\nexport fn pow(a: Result<int64>, b: Result<int64>) = powi64(a, b);\nexport fn pow(a: float32, b: float32) = powf32(ok(a), ok(b));\nexport fn pow(a: Result<float32>, b: float32) = powf32(a, ok(b));\nexport fn pow(a: float32, b: Result<float32>) = powf32(ok(a), b);\nexport fn pow(a: Result<float32>, b: Result<float32>) = powf32(a, b);\nexport fn pow(a: float64, b: float64) = powf64(ok(a), ok(b));\nexport fn pow(a: Result<float64>, b: float64) = powf64(a, ok(b));\nexport fn pow(a: float64, b: Result<float64>) = powf64(ok(a), b);\nexport fn pow(a: Result<float64>, b: Result<float64>) = powf64(a, b);\n\nexport fn sqrt(n: float32) = sqrtf32(n);\nexport fn sqrt(n: Result<float32>) {\n  if n.isErr() {\n    return n;\n  }\n  return sqrtf32(n.getR());\n}\nexport fn sqrt(n: float64) = sqrtf64(n);\nexport fn sqrt(n: Result<float64>) {\n  if n.isErr() {\n    return n;\n  }\n  return sqrtf64(n.getR());\n}\n\nexport fn sadd(a: int8, b: int8) = saddi8(a, b);\nexport fn sadd(a: Result<int8>, b: int8) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(saddi8(a.getOrExit(), b));\n}\nexport fn sadd(a: int8, b: Result<int8>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(saddi8(a, b.getOrExit()));\n}\nexport fn sadd(a: Result<int8>, b: Result<int8>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(saddi8(a.getOrExit(), b.getOrExit()));\n}\nexport fn sadd(a: int16, b: int16) = saddi16(a, b);\nexport fn sadd(a: Result<int16>, b: int16) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(saddi16(a.getOrExit(), b));\n}\nexport fn sadd(a: int16, b: Result<int16>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(saddi16(a, b.getOrExit()));\n}\nexport fn sadd(a: Result<int16>, b: Result<int16>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(saddi16(a.getOrExit(), b.getOrExit()));\n}\nexport fn sadd(a: int32, b: int32) = saddi32(a, b);\nexport fn sadd(a: Result<int32>, b: int32) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(saddi32(a.getOrExit(), b));\n}\nexport fn sadd(a: int32, b: Result<int32>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(saddi32(a, b.getOrExit()));\n}\nexport fn sadd(a: Result<int32>, b: Result<int32>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(saddi32(a.getOrExit(), b.getOrExit()));\n}\nexport fn sadd(a: int64, b: int64) = saddi64(a, b);\nexport fn sadd(a: Result<int64>, b: int64) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(saddi64(a.getOrExit(), b));\n}\nexport fn sadd(a: int64, b: Result<int64>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(saddi64(a, b.getOrExit()));\n}\nexport fn sadd(a: Result<int64>, b: Result<int64>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(saddi64(a.getOrExit(), b.getOrExit()));\n}\nexport fn sadd(a: float32, b: float32) = saddf32(a, b);\nexport fn sadd(a: Result<float32>, b: float32) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(saddf32(a.getOrExit(), b));\n}\nexport fn sadd(a: float32, b: Result<float32>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(saddf32(a, b.getOrExit()));\n}\nexport fn sadd(a: Result<float32>, b: Result<float32>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(saddf32(a.getOrExit(), b.getOrExit()));\n}\nexport fn sadd(a: float64, b: float64) = saddf64(a, b);\nexport fn sadd(a: Result<float64>, b: float64) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(saddf64(a.getOrExit(), b));\n}\nexport fn sadd(a: float64, b: Result<float64>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(saddf64(a, b.getOrExit()));\n}\nexport fn sadd(a: Result<float64>, b: Result<float64>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(saddf64(a.getOrExit(), b.getOrExit()));\n}\n\nexport fn ssub(a: int8, b: int8) = ssubi8(a, b);\nexport fn ssub(a: Result<int8>, b: int8) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(ssubi8(a.getOrExit(), b));\n}\nexport fn ssub(a: int8, b: Result<int8>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(ssubi8(a, b.getOrExit()));\n}\nexport fn ssub(a: Result<int8>, b: Result<int8>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(ssubi8(a.getOrExit(), b.getOrExit()));\n}\nexport fn ssub(a: int16, b: int16) = ssubi16(a, b);\nexport fn ssub(a: Result<int16>, b: int16) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(ssubi16(a.getOrExit(), b));\n}\nexport fn ssub(a: int16, b: Result<int16>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(ssubi16(a, b.getOrExit()));\n}\nexport fn ssub(a: Result<int16>, b: Result<int16>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(ssubi16(a.getOrExit(), b.getOrExit()));\n}\nexport fn ssub(a: int32, b: int32) = ssubi32(a, b);\nexport fn ssub(a: Result<int32>, b: int32) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(ssubi32(a.getOrExit(), b));\n}\nexport fn ssub(a: int32, b: Result<int32>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(ssubi32(a, b.getOrExit()));\n}\nexport fn ssub(a: Result<int32>, b: Result<int32>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(ssubi32(a.getOrExit(), b.getOrExit()));\n}\nexport fn ssub(a: int64, b: int64) = ssubi64(a, b);\nexport fn ssub(a: Result<int64>, b: int64) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(ssubi64(a.getOrExit(), b));\n}\nexport fn ssub(a: int64, b: Result<int64>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(ssubi64(a, b.getOrExit()));\n}\nexport fn ssub(a: Result<int64>, b: Result<int64>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(ssubi64(a.getOrExit(), b.getOrExit()));\n}\nexport fn ssub(a: float32, b: float32) = ssubf32(a, b);\nexport fn ssub(a: Result<float32>, b: float32) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(ssubf32(a.getOrExit(), b));\n}\nexport fn ssub(a: float32, b: Result<float32>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(ssubf32(a, b.getOrExit()));\n}\nexport fn ssub(a: Result<float32>, b: Result<float32>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(ssubf32(a.getOrExit(), b.getOrExit()));\n}\nexport fn ssub(a: float64, b: float64) = ssubf64(a, b);\nexport fn ssub(a: Result<float64>, b: float64) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(ssubf64(a.getOrExit(), b));\n}\nexport fn ssub(a: float64, b: Result<float64>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(ssubf64(a, b.getOrExit()));\n}\nexport fn ssub(a: Result<float64>, b: Result<float64>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(ssubf64(a.getOrExit(), b.getOrExit()));\n}\n\nexport fn snegate(n: int8) = snegi8(n);\nexport fn snegate(n: Result<int8>) {\n  if n.isErr() {\n    return n;\n  }\n  return ok(snegi8(n.getR()));\n}\nexport fn snegate(n: int16) = snegi16(n);\nexport fn snegate(n: Result<int16>) {\n  if n.isErr() {\n    return n;\n  }\n  return ok(snegi16(n.getR()));\n}\nexport fn snegate(n: int32) = snegi32(n);\nexport fn snegate(n: Result<int32>) {\n  if n.isErr() {\n    return n;\n  }\n  return ok(snegi32(n.getR()));\n}\nexport fn snegate(n: int64) = snegi64(n);\nexport fn snegate(n: Result<int64>) {\n  if n.isErr() {\n    return n;\n  }\n  return ok(snegi64(n.getR()));\n}\nexport fn snegate(n: float32) = snegf32(n);\nexport fn snegate(n: Result<float32>) {\n  if n.isErr() {\n    return n;\n  }\n  return ok(snegf32(n.getR()));\n}\nexport fn snegate(n: float64) = snegf64(n);\nexport fn snegate(n: Result<float64>) {\n  if n.isErr() {\n    return n;\n  }\n  return ok(snegf64(n.getR()));\n}\n\nexport fn sabs(n: int8) = sabsi8(n);\nexport fn sabs(n: Result<int8>) {\n  if n.isErr() {\n    return n;\n  }\n  return ok(sabsi8(n.getR()));\n}\nexport fn sabs(n: int16) = sabsi16(n);\nexport fn sabs(n: Result<int16>) {\n  if n.isErr() {\n    return n;\n  }\n  return ok(sabsi16(n.getR()));\n}\nexport fn sabs(n: int32) = sabsi32(n);\nexport fn sabs(n: Result<int32>) {\n  if n.isErr() {\n    return n;\n  }\n  return ok(sabsi32(n.getR()));\n}\nexport fn sabs(n: int64) = sabsi64(n);\nexport fn sabs(n: Result<int64>) {\n  if n.isErr() {\n    return n;\n  }\n  return ok(sabsi64(n.getR()));\n}\nexport fn sabs(n: float32) = sabsf32(n);\nexport fn sabs(n: Result<float32>) {\n  if n.isErr() {\n    return n;\n  }\n  return ok(sabsf32(n.getR()));\n}\nexport fn sabs(n: float64) = sabsf64(n);\nexport fn sabs(n: Result<float64>) {\n  if n.isErr() {\n    return n;\n  }\n  return ok(sabsf64(n.getR()));\n}\n\nexport fn smul(a: int8, b: int8) = smuli8(a, b);\nexport fn smul(a: Result<int8>, b: int8) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(smuli8(a.getOrExit(), b));\n}\nexport fn smul(a: int8, b: Result<int8>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(smuli8(a, b.getOrExit()));\n}\nexport fn smul(a: Result<int8>, b: Result<int8>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(smuli8(a.getOrExit(), b.getOrExit()));\n}\nexport fn smul(a: int16, b: int16) = smuli16(a, b);\nexport fn smul(a: Result<int16>, b: int16) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(smuli16(a.getOrExit(), b));\n}\nexport fn smul(a: int16, b: Result<int16>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(smuli16(a, b.getOrExit()));\n}\nexport fn smul(a: Result<int16>, b: Result<int16>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(smuli16(a.getOrExit(), b.getOrExit()));\n}\nexport fn smul(a: int32, b: int32) = smuli32(a, b);\nexport fn smul(a: Result<int32>, b: int32) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(smuli32(a.getOrExit(), b));\n}\nexport fn smul(a: int32, b: Result<int32>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(smuli32(a, b.getOrExit()));\n}\nexport fn smul(a: Result<int32>, b: Result<int32>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(smuli32(a.getOrExit(), b.getOrExit()));\n}\nexport fn smul(a: int64, b: int64) = smuli64(a, b);\nexport fn smul(a: Result<int64>, b: int64) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(smuli64(a.getOrExit(), b));\n}\nexport fn smul(a: int64, b: Result<int64>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(smuli64(a, b.getOrExit()));\n}\nexport fn smul(a: Result<int64>, b: Result<int64>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(smuli64(a.getOrExit(), b.getOrExit()));\n}\nexport fn smul(a: float32, b: float32) = smulf32(a, b);\nexport fn smul(a: Result<float32>, b: float32) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(smulf32(a.getOrExit(), b));\n}\nexport fn smul(a: float32, b: Result<float32>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(smulf32(a, b.getOrExit()));\n}\nexport fn smul(a: Result<float32>, b: Result<float32>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(smulf32(a.getOrExit(), b.getOrExit()));\n}\nexport fn smul(a: float64, b: float64) = smulf64(a, b);\nexport fn smul(a: Result<float64>, b: float64) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(smulf64(a.getOrExit(), b));\n}\nexport fn smul(a: float64, b: Result<float64>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(smulf64(a, b.getOrExit()));\n}\nexport fn smul(a: Result<float64>, b: Result<float64>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(smulf64(a.getOrExit(), b.getOrExit()));\n}\n\nexport fn sdiv(a: int8, b: int8) = sdivi8(a, b);\nexport fn sdiv(a: Result<int8>, b: int8) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(sdivi8(a.getOrExit(), b));\n}\nexport fn sdiv(a: int8, b: Result<int8>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(sdivi8(a, b.getOrExit()));\n}\nexport fn sdiv(a: Result<int8>, b: Result<int8>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(sdivi8(a.getOrExit(), b.getOrExit()));\n}\nexport fn sdiv(a: int16, b: int16) = sdivi16(a, b);\nexport fn sdiv(a: Result<int16>, b: int16) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(sdivi16(a.getOrExit(), b));\n}\nexport fn sdiv(a: int16, b: Result<int16>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(sdivi16(a, b.getOrExit()));\n}\nexport fn sdiv(a: Result<int16>, b: Result<int16>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(sdivi16(a.getOrExit(), b.getOrExit()));\n}\nexport fn sdiv(a: int32, b: int32) = sdivi32(a, b);\nexport fn sdiv(a: Result<int32>, b: int32) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(sdivi32(a.getOrExit(), b));\n}\nexport fn sdiv(a: int32, b: Result<int32>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(sdivi32(a, b.getOrExit()));\n}\nexport fn sdiv(a: Result<int32>, b: Result<int32>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(sdivi32(a.getOrExit(), b.getOrExit()));\n}\nexport fn sdiv(a: int64, b: int64) = sdivi64(a, b);\nexport fn sdiv(a: Result<int64>, b: int64) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(sdivi64(a.getOrExit(), b));\n}\nexport fn sdiv(a: int64, b: Result<int64>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(sdivi64(a, b.getOrExit()));\n}\nexport fn sdiv(a: Result<int64>, b: Result<int64>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(sdivi64(a.getOrExit(), b.getOrExit()));\n}\nexport fn sdiv(a: float32, b: float32) = sdivf32(a, b);\nexport fn sdiv(a: Result<float32>, b: float32) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(sdivf32(a.getOrExit(), b));\n}\nexport fn sdiv(a: float32, b: Result<float32>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(sdivf32(a, b.getOrExit()));\n}\nexport fn sdiv(a: Result<float32>, b: Result<float32>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(sdivf32(a.getOrExit(), b.getOrExit()));\n}\nexport fn sdiv(a: float64, b: float64) = sdivf64(a, b);\nexport fn sdiv(a: Result<float64>, b: float64) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(sdivf64(a.getOrExit(), b));\n}\nexport fn sdiv(a: float64, b: Result<float64>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(sdivf64(a, b.getOrExit()));\n}\nexport fn sdiv(a: Result<float64>, b: Result<float64>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(sdivf64(a.getOrExit(), b.getOrExit()));\n}\n\nexport fn spow(a: int8, b: int8) = spowi8(a, b);\nexport fn spow(a: Result<int8>, b: int8) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(spowi8(a.getOrExit(), b));\n}\nexport fn spow(a: int8, b: Result<int8>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(spowi8(a, b.getOrExit()));\n}\nexport fn spow(a: Result<int8>, b: Result<int8>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(spowi8(a.getOrExit(), b.getOrExit()));\n}\nexport fn spow(a: int16, b: int16) = spowi16(a, b);\nexport fn spow(a: Result<int16>, b: int16) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(spowi16(a.getOrExit(), b));\n}\nexport fn spow(a: int16, b: Result<int16>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(spowi16(a, b.getOrExit()));\n}\nexport fn spow(a: Result<int16>, b: Result<int16>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(spowi16(a.getOrExit(), b.getOrExit()));\n}\nexport fn spow(a: int32, b: int32) = spowi32(a, b);\nexport fn spow(a: Result<int32>, b: int32) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(spowi32(a.getOrExit(), b));\n}\nexport fn spow(a: int32, b: Result<int32>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(spowi32(a, b.getOrExit()));\n}\nexport fn spow(a: Result<int32>, b: Result<int32>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(spowi32(a.getOrExit(), b.getOrExit()));\n}\nexport fn spow(a: int64, b: int64) = spowi64(a, b);\nexport fn spow(a: Result<int64>, b: int64) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(spowi64(a.getOrExit(), b));\n}\nexport fn spow(a: int64, b: Result<int64>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(spowi64(a, b.getOrExit()));\n}\nexport fn spow(a: Result<int64>, b: Result<int64>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(spowi64(a.getOrExit(), b.getOrExit()));\n}\nexport fn spow(a: float32, b: float32) = spowf32(a, b);\nexport fn spow(a: Result<float32>, b: float32) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(spowf32(a.getOrExit(), b));\n}\nexport fn spow(a: float32, b: Result<float32>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(spowf32(a, b.getOrExit()));\n}\nexport fn spow(a: Result<float32>, b: Result<float32>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(spowf32(a.getOrExit(), b.getOrExit()));\n}\nexport fn spow(a: float64, b: float64) = spowf64(a, b);\nexport fn spow(a: Result<float64>, b: float64) {\n  if a.isErr() {\n    return a;\n  }\n  return ok(spowf64(a.getOrExit(), b));\n}\nexport fn spow(a: float64, b: Result<float64>) {\n  if b.isErr() {\n    return b;\n  }\n  return ok(spowf64(a, b.getOrExit()));\n}\nexport fn spow(a: Result<float64>, b: Result<float64>) {\n  if a.isErr().or(b.isErr()) {\n    return a;\n  }\n  return ok(spowf64(a.getOrExit(), b.getOrExit()));\n}\n\nexport fn min(x: Orderable, y: Orderable): Orderable {\n  return cond(lte(x, y), [x, y]);\n}\nexport fn max(x: Orderable, y: Orderable): Orderable {\n  return cond(gte(x, y), [x, y]);\n}\n\n// Boolean and bitwise functions\nexport fn and(a: int8, b: int8) = andi8(a, b);\nexport fn and(a: Result<int8>, b: int8): Result<int8> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(and(a.getR(), b));\n}\nexport fn and(a: int8, b: Result<int8>): Result<int8> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(and(a, b.getR()));\n}\nexport fn and(a: Result<int8>, b: Result<int8>): Result<int8> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(and(a.getR(), b.getR()));\n}\nexport fn and(a: int16, b: int16) = andi16(a, b);\nexport fn and(a: Result<int16>, b: int16): Result<int16> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(and(a.getR(), b));\n}\nexport fn and(a: int16, b: Result<int16>): Result<int16> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(and(a, b.getR()));\n}\nexport fn and(a: Result<int16>, b: Result<int16>): Result<int16> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(and(a.getR(), b.getR()));\n}\nexport fn and(a: int32, b: int32) = andi32(a, b);\nexport fn and(a: Result<int32>, b: int32): Result<int32> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(and(a.getR(), b));\n}\nexport fn and(a: int32, b: Result<int32>): Result<int32> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(and(a, b.getR()));\n}\nexport fn and(a: Result<int32>, b: Result<int32>): Result<int32> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(and(a.getR(), b.getR()));\n}\nexport fn and(a: int64, b: int64) = andi64(a, b);\nexport fn and(a: Result<int64>, b: int64): Result<int64> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(and(a.getR(), b));\n}\nexport fn and(a: int64, b: Result<int64>): Result<int64> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(and(a, b.getR()));\n}\nexport fn and(a: Result<int64>, b: Result<int64>): Result<int64> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(and(a.getR(), b.getR()));\n}\nexport fn and(a: bool, b: bool) = andbool(a, b);\nexport fn and(a: Result<bool>, b: bool): Result<bool> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(and(a.getR(), b));\n}\nexport fn and(a: bool, b: Result<bool>): Result<bool> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(and(a, b.getR()));\n}\nexport fn and(a: Result<bool>, b: Result<bool>): Result<bool> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(and(a.getR(), b.getR()));\n}\n\nexport fn or(a: int8, b: int8) = ori8(a, b);\nexport fn or(a: Result<int8>, b: int8): Result<int8> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(or(a.getR(), b));\n}\nexport fn or(a: int8, b: Result<int8>): Result<int8> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(or(a, b.getR()));\n}\nexport fn or(a: Result<int8>, b: Result<int8>): Result<int8> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(or(a.getR(), b.getR()));\n}\nexport fn or(a: int16, b: int16) = ori16(a, b);\nexport fn or(a: Result<int16>, b: int16): Result<int16> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(or(a.getR(), b));\n}\nexport fn or(a: int16, b: Result<int16>): Result<int16> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(or(a, b.getR()));\n}\nexport fn or(a: Result<int16>, b: Result<int16>): Result<int16> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(or(a.getR(), b.getR()));\n}\nexport fn or(a: int32, b: int32) = ori32(a, b);\nexport fn or(a: Result<int32>, b: int32): Result<int32> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(or(a.getR(), b));\n}\nexport fn or(a: int32, b: Result<int32>): Result<int32> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(or(a, b.getR()));\n}\nexport fn or(a: Result<int32>, b: Result<int32>): Result<int32> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(or(a.getR(), b.getR()));\n}\nexport fn or(a: int64, b: int64) = ori64(a, b);\nexport fn or(a: Result<int64>, b: int64): Result<int64> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(or(a.getR(), b));\n}\nexport fn or(a: int64, b: Result<int64>): Result<int64> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(or(a, b.getR()));\n}\nexport fn or(a: Result<int64>, b: Result<int64>): Result<int64> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(or(a.getR(), b.getR()));\n}\nexport fn or(a: bool, b: bool) = orbool(a, b);\nexport fn or(a: Result<bool>, b: bool): Result<bool> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(or(a.getR(), b));\n}\nexport fn or(a: bool, b: Result<bool>): Result<bool> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(or(a, b.getR()));\n}\nexport fn or(a: Result<bool>, b: Result<bool>): Result<bool> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(or(a.getR(), b.getR()));\n}\n// This aliasing is for operator definition purposes only\nexport fn boolor(a: bool, b: bool) = orbool(a, b);\nexport fn boolor(a: Result<bool>, b: bool): Result<bool> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(boolor(a.getR(), b));\n}\nexport fn boolor(a: bool, b: Result<bool>): Result<bool> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(boolor(a, b.getR()));\n}\nexport fn boolor(a: Result<bool>, b: Result<bool>): Result<bool> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(boolor(a.getR(), b.getR()));\n}\n\nexport fn xor(a: int8, b: int8) = xori8(a, b);\nexport fn xor(a: Result<int8>, b: int8): Result<int8> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(xor(a.getR(), b));\n}\nexport fn xor(a: int8, b: Result<int8>): Result<int8> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(xor(a, b.getR()));\n}\nexport fn xor(a: Result<int8>, b: Result<int8>): Result<int8> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(xor(a.getR(), b.getR()));\n}\nexport fn xor(a: int16, b: int16) = xori16(a, b);\nexport fn xor(a: Result<int16>, b: int16): Result<int16> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(xor(a.getR(), b));\n}\nexport fn xor(a: int16, b: Result<int16>): Result<int16> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(xor(a, b.getR()));\n}\nexport fn xor(a: Result<int16>, b: Result<int16>): Result<int16> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(xor(a.getR(), b.getR()));\n}\nexport fn xor(a: int32, b: int32) = xori32(a, b);\nexport fn xor(a: Result<int32>, b: int32): Result<int32> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(xor(a.getR(), b));\n}\nexport fn xor(a: int32, b: Result<int32>): Result<int32> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(xor(a, b.getR()));\n}\nexport fn xor(a: Result<int32>, b: Result<int32>): Result<int32> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(xor(a.getR(), b.getR()));\n}\nexport fn xor(a: int64, b: int64) = xori64(a, b);\nexport fn xor(a: Result<int64>, b: int64): Result<int64> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(xor(a.getR(), b));\n}\nexport fn xor(a: int64, b: Result<int64>): Result<int64> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(xor(a, b.getR()));\n}\nexport fn xor(a: Result<int64>, b: Result<int64>): Result<int64> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(xor(a.getR(), b.getR()));\n}\nexport fn xor(a: bool, b: bool) = xorbool(a, b);\nexport fn xor(a: Result<bool>, b: bool): Result<bool> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(xor(a.getR(), b));\n}\nexport fn xor(a: bool, b: Result<bool>): Result<bool> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(xor(a, b.getR()));\n}\nexport fn xor(a: Result<bool>, b: Result<bool>): Result<bool> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(xor(a.getR(), b.getR()));\n}\n\nexport fn not(n: int8) = noti8(n);\nexport fn not(n: Result<int8>): Result<int8> {\n  if n.isErr() {\n    return n;\n  }\n  return ok(not(n.getR()));\n}\nexport fn not(n: int16) = noti16(n);\nexport fn not(n: Result<int16>): Result<int16> {\n  if n.isErr() {\n    return n;\n  }\n  return ok(not(n.getR()));\n}\nexport fn not(n: int32) = noti32(n);\nexport fn not(n: Result<int32>): Result<int32> {\n  if n.isErr() {\n    return n;\n  }\n  return ok(not(n.getR()));\n}\nexport fn not(n: int64) = noti64(n);\nexport fn not(n: Result<int64>): Result<int64> {\n  if n.isErr() {\n    return n;\n  }\n  return ok(not(n.getR()));\n}\nexport fn not(n: bool) = notbool(n);\nexport fn not(n: Result<bool>): Result<bool> {\n  if n.isErr() {\n    return n;\n  }\n  return ok(not(n.getR()));\n}\n\nexport fn nand(a: int8, b: int8) = nandi8(a, b);\nexport fn nand(a: Result<int8>, b: int8): Result<int8> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(nand(a.getR(), b));\n}\nexport fn nand(a: int8, b: Result<int8>): Result<int8> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(nand(a, b.getR()));\n}\nexport fn nand(a: Result<int8>, b: Result<int8>): Result<int8> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(nand(a.getR(), b.getR()));\n}\nexport fn nand(a: int16, b: int16) = nandi16(a, b);\nexport fn nand(a: Result<int16>, b: int16): Result<int16> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(nand(a.getR(), b));\n}\nexport fn nand(a: int16, b: Result<int16>): Result<int16> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(nand(a, b.getR()));\n}\nexport fn nand(a: Result<int16>, b: Result<int16>): Result<int16> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(nand(a.getR(), b.getR()));\n}\nexport fn nand(a: int32, b: int32) = nandi32(a, b);\nexport fn nand(a: Result<int32>, b: int32): Result<int32> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(nand(a.getR(), b));\n}\nexport fn nand(a: int32, b: Result<int32>): Result<int32> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(nand(a, b.getR()));\n}\nexport fn nand(a: Result<int32>, b: Result<int32>): Result<int32> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(nand(a.getR(), b.getR()));\n}\nexport fn nand(a: int64, b: int64) = nandi64(a, b);\nexport fn nand(a: Result<int64>, b: int64): Result<int64> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(nand(a.getR(), b));\n}\nexport fn nand(a: int64, b: Result<int64>): Result<int64> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(nand(a, b.getR()));\n}\nexport fn nand(a: Result<int64>, b: Result<int64>): Result<int64> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(nand(a.getR(), b.getR()));\n}\nexport fn nand(a: bool, b: bool) = nandboo(a, b);\nexport fn nand(a: Result<bool>, b: bool): Result<bool> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(nand(a.getR(), b));\n}\nexport fn nand(a: bool, b: Result<bool>): Result<bool> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(nand(a, b.getR()));\n}\nexport fn nand(a: Result<bool>, b: Result<bool>): Result<bool> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(nand(a.getR(), b.getR()));\n}\n\nexport fn nor(a: int8, b: int8) = nori8(a, b);\nexport fn nor(a: Result<int8>, b: int8): Result<int8> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(nor(a.getR(), b));\n}\nexport fn nor(a: int8, b: Result<int8>): Result<int8> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(nor(a, b.getR()));\n}\nexport fn nor(a: Result<int8>, b: Result<int8>): Result<int8> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(nor(a.getR(), b.getR()));\n}\nexport fn nor(a: int16, b: int16) = nori16(a, b);\nexport fn nor(a: Result<int16>, b: int16): Result<int16> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(nor(a.getR(), b));\n}\nexport fn nor(a: int16, b: Result<int16>): Result<int16> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(nor(a, b.getR()));\n}\nexport fn nor(a: Result<int16>, b: Result<int16>): Result<int16> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(nor(a.getR(), b.getR()));\n}\nexport fn nor(a: int32, b: int32) = nori32(a, b);\nexport fn nor(a: Result<int32>, b: int32): Result<int32> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(nor(a.getR(), b));\n}\nexport fn nor(a: int32, b: Result<int32>): Result<int32> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(nor(a, b.getR()));\n}\nexport fn nor(a: Result<int32>, b: Result<int32>): Result<int32> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(nor(a.getR(), b.getR()));\n}\nexport fn nor(a: int64, b: int64) = nori64(a, b);\nexport fn nor(a: Result<int64>, b: int64): Result<int64> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(nor(a.getR(), b));\n}\nexport fn nor(a: int64, b: Result<int64>): Result<int64> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(nor(a, b.getR()));\n}\nexport fn nor(a: Result<int64>, b: Result<int64>): Result<int64> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(nor(a.getR(), b.getR()));\n}\nexport fn nor(a: bool, b: bool) = norbool(a, b);\nexport fn nor(a: Result<bool>, b: bool): Result<bool> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(nor(a.getR(), b));\n}\nexport fn nor(a: bool, b: Result<bool>): Result<bool> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(nor(a, b.getR()));\n}\nexport fn nor(a: Result<bool>, b: Result<bool>): Result<bool> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(nor(a.getR(), b.getR()));\n}\n\nexport fn xnor(a: int8, b: int8) = xnori8(a, b);\nexport fn xnor(a: Result<int8>, b: int8): Result<int8> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(xnor(a.getR(), b));\n}\nexport fn xnor(a: int8, b: Result<int8>): Result<int8> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(xnor(a, b.getR()));\n}\nexport fn xnor(a: Result<int8>, b: Result<int8>): Result<int8> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(xnor(a.getR(), b.getR()));\n}\nexport fn xnor(a: int16, b: int16) = xnori16(a, b);\nexport fn xnor(a: Result<int16>, b: int16): Result<int16> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(xnor(a.getR(), b));\n}\nexport fn xnor(a: int16, b: Result<int16>): Result<int16> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(xnor(a, b.getR()));\n}\nexport fn xnor(a: Result<int16>, b: Result<int16>): Result<int16> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(xnor(a.getR(), b.getR()));\n}\nexport fn xnor(a: int32, b: int32) = xnori32(a, b);\nexport fn xnor(a: Result<int32>, b: int32): Result<int32> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(xnor(a.getR(), b));\n}\nexport fn xnor(a: int32, b: Result<int32>): Result<int32> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(xnor(a, b.getR()));\n}\nexport fn xnor(a: Result<int32>, b: Result<int32>): Result<int32> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(xnor(a.getR(), b.getR()));\n}\nexport fn xnor(a: int64, b: int64) = xnori64(a, b);\nexport fn xnor(a: Result<int64>, b: int64): Result<int64> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(xnor(a.getR(), b));\n}\nexport fn xnor(a: int64, b: Result<int64>): Result<int64> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(xnor(a, b.getR()));\n}\nexport fn xnor(a: Result<int64>, b: Result<int64>): Result<int64> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(xnor(a.getR(), b.getR()));\n}\nexport fn xnor(a: bool, b: bool) = xnorboo(a, b);\nexport fn xnor(a: Result<bool>, b: bool): Result<bool> {\n  if a.isErr() {\n    return a;\n  }\n  return ok(xnor(a.getR(), b));\n}\nexport fn xnor(a: bool, b: Result<bool>): Result<bool> {\n  if b.isErr() {\n    return b;\n  }\n  return ok(xnor(a, b.getR()));\n}\nexport fn xnor(a: Result<bool>, b: Result<bool>): Result<bool> {\n  if a.isErr() {\n    return a;\n  }\n  if b.isErr() {\n    return b;\n  }\n  return ok(xnor(a.getR(), b.getR()));\n}\n\n// Equality and order functions\n// TODO: Similarly, should equality/orderability functions accept Result-wrapped values?\nexport fn eq(a: int8, b: int8) = eqi8(a, b);\nexport fn eq(a: Result<int8>, b: int8): bool {\n  if a.isErr() {\n    return false;\n  }\n  return eq(a.getR(), b);\n}\nexport fn eq(a: int8, b: Result<int8>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return eq(a, b.getR());\n}\nexport fn eq(a: Result<int8>, b: Result<int8>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return eq(a.getR(), b.getR());\n}\nexport fn eq(a: int16, b: int16) = eqi16(a, b);\nexport fn eq(a: Result<int16>, b: int16): bool {\n  if a.isErr() {\n    return false;\n  }\n  return eq(a.getR(), b);\n}\nexport fn eq(a: int16, b: Result<int16>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return eq(a, b.getR());\n}\nexport fn eq(a: Result<int16>, b: Result<int16>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return eq(a.getR(), b.getR());\n}\nexport fn eq(a: int32, b: int32) = eqi32(a, b);\nexport fn eq(a: Result<int32>, b: int32): bool {\n  if a.isErr() {\n    return false;\n  }\n  return eq(a.getR(), b);\n}\nexport fn eq(a: int32, b: Result<int32>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return eq(a, b.getR());\n}\nexport fn eq(a: Result<int32>, b: Result<int32>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return eq(a.getR(), b.getR());\n}\nexport fn eq(a: int64, b: int64) = eqi64(a, b);\nexport fn eq(a: Result<int64>, b: int64): bool {\n  if a.isErr() {\n    return false;\n  }\n  return eq(a.getR(), b);\n}\nexport fn eq(a: int64, b: Result<int64>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return eq(a, b.getR());\n}\nexport fn eq(a: Result<int64>, b: Result<int64>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return eq(a.getR(), b.getR());\n}\nexport fn eq(a: float32, b: float32) = eqf32(a, b);\nexport fn eq(a: Result<float32>, b: float32): bool {\n  if a.isErr() {\n    return false;\n  }\n  return eq(a.getR(), b);\n}\nexport fn eq(a: float32, b: Result<float32>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return eq(a, b.getR());\n}\nexport fn eq(a: Result<float32>, b: Result<float32>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return eq(a.getR(), b.getR());\n}\nexport fn eq(a: float64, b: float64) = eqf64(a, b);\nexport fn eq(a: Result<float64>, b: float64): bool {\n  if a.isErr() {\n    return false;\n  }\n  return eq(a.getR(), b);\n}\nexport fn eq(a: float64, b: Result<float64>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return eq(a, b.getR());\n}\nexport fn eq(a: Result<float64>, b: Result<float64>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return eq(a.getR(), b.getR());\n}\nexport fn eq(a: string, b: string) = eqstr(a, b);\nexport fn eq(a: Result<string>, b: string): bool {\n  if a.isErr() {\n    return false;\n  }\n  return eq(a.getR(), b);\n}\nexport fn eq(a: string, b: Result<string>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return eq(a, b.getR());\n}\nexport fn eq(a: Result<string>, b: Result<string>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return eq(a.getR(), b.getR());\n}\nexport fn eq(a: bool, b: bool) = eqbool(a, b);\nexport fn eq(a: Result<bool>, b: bool): bool {\n  if a.isErr() {\n    return false;\n  }\n  return eq(a.getR(), b);\n}\nexport fn eq(a: bool, b: Result<bool>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return eq(a, b.getR());\n}\nexport fn eq(a: Result<bool>, b: Result<bool>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return eq(a.getR(), b.getR());\n}\n\nexport fn neq(a: int8, b: int8) = neqi8(a, b);\nexport fn neq(a: Result<int8>, b: int8): bool {\n  if a.isErr() {\n    return false;\n  }\n  return neq(a.getR(), b);\n}\nexport fn neq(a: int8, b: Result<int8>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return neq(a, b.getR());\n}\nexport fn neq(a: Result<int8>, b: Result<int8>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return neq(a.getR(), b.getR());\n}\nexport fn neq(a: int16, b: int16) = neqi16(a, b);\nexport fn neq(a: Result<int16>, b: int16): bool {\n  if a.isErr() {\n    return false;\n  }\n  return neq(a.getR(), b);\n}\nexport fn neq(a: int16, b: Result<int16>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return neq(a, b.getR());\n}\nexport fn neq(a: Result<int16>, b: Result<int16>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return neq(a.getR(), b.getR());\n}\nexport fn neq(a: int32, b: int32) = neqi32(a, b);\nexport fn neq(a: Result<int32>, b: int32): bool {\n  if a.isErr() {\n    return false;\n  }\n  return neq(a.getR(), b);\n}\nexport fn neq(a: int32, b: Result<int32>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return neq(a, b.getR());\n}\nexport fn neq(a: Result<int32>, b: Result<int32>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return neq(a.getR(), b.getR());\n}\nexport fn neq(a: int64, b: int64) = neqi64(a, b);\nexport fn neq(a: Result<int64>, b: int64): bool {\n  if a.isErr() {\n    return false;\n  }\n  return neq(a.getR(), b);\n}\nexport fn neq(a: int64, b: Result<int64>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return neq(a, b.getR());\n}\nexport fn neq(a: Result<int64>, b: Result<int64>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return neq(a.getR(), b.getR());\n}\nexport fn neq(a: float32, b: float32) = neqf32(a, b);\nexport fn neq(a: Result<float32>, b: float32): bool {\n  if a.isErr() {\n    return false;\n  }\n  return neq(a.getR(), b);\n}\nexport fn neq(a: float32, b: Result<float32>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return neq(a, b.getR());\n}\nexport fn neq(a: Result<float32>, b: Result<float32>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return neq(a.getR(), b.getR());\n}\nexport fn neq(a: float64, b: float64) = neqf64(a, b);\nexport fn neq(a: Result<float64>, b: float64): bool {\n  if a.isErr() {\n    return false;\n  }\n  return neq(a.getR(), b);\n}\nexport fn neq(a: float64, b: Result<float64>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return neq(a, b.getR());\n}\nexport fn neq(a: Result<float64>, b: Result<float64>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return neq(a.getR(), b.getR());\n}\nexport fn neq(a: string, b: string) = neqstr(a, b);\nexport fn neq(a: Result<string>, b: string): bool {\n  if a.isErr() {\n    return false;\n  }\n  return neq(a.getR(), b);\n}\nexport fn neq(a: string, b: Result<string>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return neq(a, b.getR());\n}\nexport fn neq(a: Result<string>, b: Result<string>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return neq(a.getR(), b.getR());\n}\nexport fn neq(a: bool, b: bool) = neqbool(a, b);\nexport fn neq(a: Result<bool>, b: bool): bool {\n  if a.isErr() {\n    return false;\n  }\n  return neq(a.getR(), b);\n}\nexport fn neq(a: bool, b: Result<bool>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return neq(a, b.getR());\n}\nexport fn neq(a: Result<bool>, b: Result<bool>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return neq(a.getR(), b.getR());\n}\n\nexport fn lt(a: int8, b: int8) = lti8(a, b);\nexport fn lt(a: Result<int8>, b: int8): bool {\n  if a.isErr() {\n    return false;\n  }\n  return lt(a.getR(), b);\n}\nexport fn lt(a: int8, b: Result<int8>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return lt(a, b.getR());\n}\nexport fn lt(a: Result<int8>, b: Result<int8>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return lt(a.getR(), b.getR());\n}\nexport fn lt(a: int16, b: int16) = lti16(a, b);\nexport fn lt(a: Result<int16>, b: int16): bool {\n  if a.isErr() {\n    return false;\n  }\n  return lt(a.getR(), b);\n}\nexport fn lt(a: int16, b: Result<int16>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return lt(a, b.getR());\n}\nexport fn lt(a: Result<int16>, b: Result<int16>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return lt(a.getR(), b.getR());\n}\nexport fn lt(a: int32, b: int32) = lti32(a, b);\nexport fn lt(a: Result<int32>, b: int32): bool {\n  if a.isErr() {\n    return false;\n  }\n  return lt(a.getR(), b);\n}\nexport fn lt(a: int32, b: Result<int32>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return lt(a, b.getR());\n}\nexport fn lt(a: Result<int32>, b: Result<int32>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return lt(a.getR(), b.getR());\n}\nexport fn lt(a: int64, b: int64) = lti64(a, b);\nexport fn lt(a: Result<int64>, b: int64): bool {\n  if a.isErr() {\n    return false;\n  }\n  return lt(a.getR(), b);\n}\nexport fn lt(a: int64, b: Result<int64>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return lt(a, b.getR());\n}\nexport fn lt(a: Result<int64>, b: Result<int64>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return lt(a.getR(), b.getR());\n}\nexport fn lt(a: float32, b: float32) = ltf32(a, b);\nexport fn lt(a: Result<float32>, b: float32): bool {\n  if a.isErr() {\n    return false;\n  }\n  return lt(a.getR(), b);\n}\nexport fn lt(a: float32, b: Result<float32>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return lt(a, b.getR());\n}\nexport fn lt(a: Result<float32>, b: Result<float32>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return lt(a.getR(), b.getR());\n}\nexport fn lt(a: float64, b: float64) = ltf64(a, b);\nexport fn lt(a: Result<float64>, b: float64): bool {\n  if a.isErr() {\n    return false;\n  }\n  return lt(a.getR(), b);\n}\nexport fn lt(a: float64, b: Result<float64>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return lt(a, b.getR());\n}\nexport fn lt(a: Result<float64>, b: Result<float64>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return lt(a.getR(), b.getR());\n}\nexport fn lt(a: string, b: string) = ltstr(a, b);\nexport fn lt(a: Result<string>, b: string): bool {\n  if a.isErr() {\n    return false;\n  }\n  return lt(a.getR(), b);\n}\nexport fn lt(a: string, b: Result<string>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return lt(a, b.getR());\n}\nexport fn lt(a: Result<string>, b: Result<string>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return lt(a.getR(), b.getR());\n}\n\nexport fn lte(a: int8, b: int8) = ltei8(a, b);\nexport fn lte(a: Result<int8>, b: int8): bool {\n  if a.isErr() {\n    return false;\n  }\n  return lte(a.getR(), b);\n}\nexport fn lte(a: int8, b: Result<int8>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return lte(a, b.getR());\n}\nexport fn lte(a: Result<int8>, b: Result<int8>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return lte(a.getR(), b.getR());\n}\nexport fn lte(a: int16, b: int16) = ltei16(a, b);\nexport fn lte(a: Result<int16>, b: int16): bool {\n  if a.isErr() {\n    return false;\n  }\n  return lte(a.getR(), b);\n}\nexport fn lte(a: int16, b: Result<int16>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return lte(a, b.getR());\n}\nexport fn lte(a: Result<int16>, b: Result<int16>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return lte(a.getR(), b.getR());\n}\nexport fn lte(a: int32, b: int32) = ltei32(a, b);\nexport fn lte(a: Result<int32>, b: int32): bool {\n  if a.isErr() {\n    return false;\n  }\n  return lte(a.getR(), b);\n}\nexport fn lte(a: int32, b: Result<int32>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return lte(a, b.getR());\n}\nexport fn lte(a: Result<int32>, b: Result<int32>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return lte(a.getR(), b.getR());\n}\nexport fn lte(a: int64, b: int64) = ltei64(a, b);\nexport fn lte(a: Result<int64>, b: int64): bool {\n  if a.isErr() {\n    return false;\n  }\n  return lte(a.getR(), b);\n}\nexport fn lte(a: int64, b: Result<int64>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return lte(a, b.getR());\n}\nexport fn lte(a: Result<int64>, b: Result<int64>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return lte(a.getR(), b.getR());\n}\nexport fn lte(a: float32, b: float32) = ltef32(a, b);\nexport fn lte(a: Result<float32>, b: float32): bool {\n  if a.isErr() {\n    return false;\n  }\n  return lte(a.getR(), b);\n}\nexport fn lte(a: float32, b: Result<float32>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return lte(a, b.getR());\n}\nexport fn lte(a: Result<float32>, b: Result<float32>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return lte(a.getR(), b.getR());\n}\nexport fn lte(a: float64, b: float64) = ltef64(a, b);\nexport fn lte(a: Result<float64>, b: float64): bool {\n  if a.isErr() {\n    return false;\n  }\n  return lte(a.getR(), b);\n}\nexport fn lte(a: float64, b: Result<float64>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return lte(a, b.getR());\n}\nexport fn lte(a: Result<float64>, b: Result<float64>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return lte(a.getR(), b.getR());\n}\nexport fn lte(a: string, b: string) = ltestr(a, b);\nexport fn lte(a: Result<string>, b: string): bool {\n  if a.isErr() {\n    return false;\n  }\n  return lte(a.getR(), b);\n}\nexport fn lte(a: string, b: Result<string>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return lte(a, b.getR());\n}\nexport fn lte(a: Result<string>, b: Result<string>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return lte(a.getR(), b.getR());\n}\n\nexport fn gt(a: int8, b: int8) = gti8(a, b);\nexport fn gt(a: Result<int8>, b: int8): bool {\n  if a.isErr() {\n    return false;\n  }\n  return gt(a.getR(), b);\n}\nexport fn gt(a: int8, b: Result<int8>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return gt(a, b.getR());\n}\nexport fn gt(a: Result<int8>, b: Result<int8>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return gt(a.getR(), b.getR());\n}\nexport fn gt(a: int16, b: int16) = gti16(a, b);\nexport fn gt(a: Result<int16>, b: int16): bool {\n  if a.isErr() {\n    return false;\n  }\n  return gt(a.getR(), b);\n}\nexport fn gt(a: int16, b: Result<int16>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return gt(a, b.getR());\n}\nexport fn gt(a: Result<int16>, b: Result<int16>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return gt(a.getR(), b.getR());\n}\nexport fn gt(a: int32, b: int32) = gti32(a, b);\nexport fn gt(a: Result<int32>, b: int32): bool {\n  if a.isErr() {\n    return false;\n  }\n  return gt(a.getR(), b);\n}\nexport fn gt(a: int32, b: Result<int32>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return gt(a, b.getR());\n}\nexport fn gt(a: Result<int32>, b: Result<int32>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return gt(a.getR(), b.getR());\n}\nexport fn gt(a: int64, b: int64) = gti64(a, b);\nexport fn gt(a: Result<int64>, b: int64): bool {\n  if a.isErr() {\n    return false;\n  }\n  return gt(a.getR(), b);\n}\nexport fn gt(a: int64, b: Result<int64>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return gt(a, b.getR());\n}\nexport fn gt(a: Result<int64>, b: Result<int64>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return gt(a.getR(), b.getR());\n}\nexport fn gt(a: float32, b: float32) = gtf32(a, b);\nexport fn gt(a: Result<float32>, b: float32): bool {\n  if a.isErr() {\n    return false;\n  }\n  return gt(a.getR(), b);\n}\nexport fn gt(a: float32, b: Result<float32>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return gt(a, b.getR());\n}\nexport fn gt(a: Result<float32>, b: Result<float32>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return gt(a.getR(), b.getR());\n}\nexport fn gt(a: float64, b: float64) = gtf64(a, b);\nexport fn gt(a: Result<float64>, b: float64): bool {\n  if a.isErr() {\n    return false;\n  }\n  return gt(a.getR(), b);\n}\nexport fn gt(a: float64, b: Result<float64>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return gt(a, b.getR());\n}\nexport fn gt(a: Result<float64>, b: Result<float64>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return gt(a.getR(), b.getR());\n}\nexport fn gt(a: string, b: string) = gtstr(a, b);\nexport fn gt(a: Result<string>, b: string): bool {\n  if a.isErr() {\n    return false;\n  }\n  return gt(a.getR(), b);\n}\nexport fn gt(a: string, b: Result<string>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return gt(a, b.getR());\n}\nexport fn gt(a: Result<string>, b: Result<string>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return gt(a.getR(), b.getR());\n}\n\nexport fn gte(a: int8, b: int8) = gtei8(a, b);\nexport fn gte(a: Result<int8>, b: int8): bool {\n  if a.isErr() {\n    return false;\n  }\n  return gte(a.getR(), b);\n}\nexport fn gte(a: int8, b: Result<int8>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return gte(a, b.getR());\n}\nexport fn gte(a: Result<int8>, b: Result<int8>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return gte(a.getR(), b.getR());\n}\nexport fn gte(a: int16, b: int16) = gtei16(a, b);\nexport fn gte(a: Result<int16>, b: int16): bool {\n  if a.isErr() {\n    return false;\n  }\n  return gte(a.getR(), b);\n}\nexport fn gte(a: int16, b: Result<int16>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return gte(a, b.getR());\n}\nexport fn gte(a: Result<int16>, b: Result<int16>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return gte(a.getR(), b.getR());\n}\nexport fn gte(a: int32, b: int32) = gtei32(a, b);\nexport fn gte(a: Result<int32>, b: int32): bool {\n  if a.isErr() {\n    return false;\n  }\n  return gte(a.getR(), b);\n}\nexport fn gte(a: int32, b: Result<int32>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return gte(a, b.getR());\n}\nexport fn gte(a: Result<int32>, b: Result<int32>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return gte(a.getR(), b.getR());\n}\nexport fn gte(a: int64, b: int64) = gtei64(a, b);\nexport fn gte(a: Result<int64>, b: int64): bool {\n  if a.isErr() {\n    return false;\n  }\n  return gte(a.getR(), b);\n}\nexport fn gte(a: int64, b: Result<int64>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return gte(a, b.getR());\n}\nexport fn gte(a: Result<int64>, b: Result<int64>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return gte(a.getR(), b.getR());\n}\nexport fn gte(a: float32, b: float32) = gtef32(a, b);\nexport fn gte(a: Result<float32>, b: float32): bool {\n  if a.isErr() {\n    return false;\n  }\n  return gte(a.getR(), b);\n}\nexport fn gte(a: float32, b: Result<float32>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return gte(a, b.getR());\n}\nexport fn gte(a: Result<float32>, b: Result<float32>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return gte(a.getR(), b.getR());\n}\nexport fn gte(a: float64, b: float64) = gtef64(a, b);\nexport fn gte(a: Result<float64>, b: float64): bool {\n  if a.isErr() {\n    return false;\n  }\n  return gte(a.getR(), b);\n}\nexport fn gte(a: float64, b: Result<float64>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return gte(a, b.getR());\n}\nexport fn gte(a: Result<float64>, b: Result<float64>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return gte(a.getR(), b.getR());\n}\nexport fn gte(a: string, b: string) = gtestr(a, b);\nexport fn gte(a: Result<string>, b: string): bool {\n  if a.isErr() {\n    return false;\n  }\n  return gte(a.getR(), b);\n}\nexport fn gte(a: string, b: Result<string>): bool {\n  if b.isErr() {\n    return false;\n  }\n  return gte(a, b.getR());\n}\nexport fn gte(a: Result<string>, b: Result<string>): bool {\n  if or(a.isErr(), b.isErr()) {\n    return false;\n  }\n  return gte(a.getR(), b.getR());\n}\n\n// Wait functions\nexport fn wait(n: int8) = waitop(i8i64(n));\nexport fn wait(n: int16) = waitop(i16i64(n));\nexport fn wait(n: int32) = waitop(i32i64(n));\nexport fn wait(n: int64) = waitop(n);\n\n// String functions\nexport fn concat(a: string, b: string) = catstr(a, b);\nexport split // opcode with signature `fn split(str: string, spl: string): Array<string>`\nexport fn repeat(s: string, n: int64) = repstr(s, n);\n// export fn template(str: string, map: Map<string, string>) = templ(str, map)\nexport matches // opcode with signature `fn matches(s: string, t: string): bool`\nexport fn index(s: string, t: string) = indstr(s, t);\nexport fn length(s: string) = lenstr(s);\nexport trim // opcode with signature `fn trim(s: string): string`\n// toCharArray would be better as an opcode, but this works for now.\nexport fn toCharArray(a: string): Array<string> = a.split('').filter(fn (c: string) = c.length().gt(0));\n\n// Array functions\nexport fn concat(a: Array<any>, b: Array<any>) = catarr(a, b);\nexport fn repeat(arr: Array<any>, n: int64) = reparr(arr, n);\nexport fn index(arr: Array<any>, val: any) = indarrv(arr, val);\nexport fn index(arr: Array<int8>, val: int8) = indarrf(arr, val);\nexport fn index(arr: Array<int16>, val: int16) = indarrf(arr, val);\nexport fn index(arr: Array<int32>, val: int32) = indarrf(arr, val);\nexport fn index(arr: Array<int64>, val: int64) = indarrf(arr, val);\nexport fn index(arr: Array<float32>, val: float32) = indarrf(arr, val);\nexport fn index(arr: Array<float64>, val: float64) = indarrf(arr, val);\nexport fn index(arr: Array<bool>, val: bool) = indarrf(arr, val);\nexport fn has(arr: Array<any>, val: any) = indarrv(arr, val).isOk();\nexport fn has(arr: Array<int8>, val: int8) = indarrf(arr, val).isOk();\nexport fn has(arr: Array<int16>, val: int16) = indarrf(arr, val).isOk();\nexport fn has(arr: Array<int32>, val: int32) = indarrf(arr, val).isOk();\nexport fn has(arr: Array<int64>, val: int64) = indarrf(arr, val).isOk();\nexport fn has(arr: Array<float32>, val: float32) = indarrf(arr, val).isOk();\nexport fn has(arr: Array<float64>, val: float64) = indarrf(arr, val).isOk();\nexport fn has(arr: Array<bool>, val: bool) = indarrf(arr, val).isOk();\nexport fn length(arr: Array<any>) = lenarr(arr);\nexport fn push(arr: Array<any>, val: any) {\n  pusharr(arr, val, 0);\n  return arr;\n}\nexport fn push(arr: Array<int8>, val: int8) {\n  pusharr(arr, val, 8);\n  return arr;\n}\nexport fn push(arr: Array<int16>, val: int16) {\n  pusharr(arr, val, 8);\n  return arr;\n}\nexport fn push(arr: Array<int32>, val: int32) {\n  pusharr(arr, val, 8);\n  return arr;\n}\nexport fn push(arr: Array<int64>, val: int64) {\n  pusharr(arr, val, 8);\n  return arr;\n}\nexport fn push(arr: Array<float32>, val: float32) {\n  pusharr(arr, val, 8);\n  return arr;\n}\nexport fn push(arr: Array<float64>, val: float64) {\n  pusharr(arr, val, 8);\n  return arr;\n}\nexport fn push(arr: Array<bool>, val: bool) {\n  pusharr(arr, val, 8);\n  return arr;\n}\nexport fn pop(arr: Array<any>) = poparr(arr);\nexport each // parallel opcode with signature `fn each(arr: Array<any>, cb: function): void`\nexport fn eachLin(arr: Array<any>, cb: function): void = eachl(arr, cb);\nexport map // parallel opcode with signature `fn map(arr: Array<any>, cb: function): Array<any>`\nexport fn mapLin(arr: Array<any>, cb: function): Array<anythingElse> = mapl(arr, cb);\n/**\n * Unlike the other array functions, reduce is sequential by default and parallelism must be opted\n * in. This is due to the fact that parallelism requires the reducer function to be commutative or\n * associative, otherwise it will return different values on each run, and the compiler has no way\n * to guarantee that your reducer function is commutative or associative.\n *\n * There are four reduce functions instead of two as expected, because a reducer that reduces into\n * the same datatype requires less work than one that reduces into a new datatype. To reduce into a\n * new datatype you need an initial value in that new datatype that the reducer can provide to the\n * first reduction call to \"get the ball rolling.\" And there are extra constraints if you want the\n * reducer to run in parallel: that initial value will be used multiple times for each of the\n * parallel threads of computation, so that initial value has to be idempotent for it to work. Then\n * you're left with multiple reduced results that cannot be combined with each other with the main\n * reducer, so you need to provide a second reducer function that takes the resulting datatype and\n * can combine them with each other successfully, and that one *also* needs to be a commutative or\n * associative function.\n *\n * The complexities involved in writing a parallel reducer are why we decided to make the sequential\n * version the default, as the extra overhead is not something most developers are used to, whether\n * they hail from the functional programming world or the imperative world.\n *\n * On that note, you'll notice that the opcodes are named after `reduce` and `fold`. This is the\n * naming scheme that functional language programmers would be used to, but Java and Javascript\n * combined them both as `reduce`, so we have maintained that convention as we expect fewer people\n * needing to adapt to that change, it being a change they're likely already familiar with, and\n * noting that an extra argument that makes it equivalent to `fold` is easier than trying to find\n * the 3 or 4 arg variant under a different name.\n */\nexport fn reduce(arr: Array<any>, cb: function): any = reducel(arr, cb);\nexport fn reducePar(arr: Array<any>, cb: function): any = reducep(arr, cb);\n/**\n * This type is used to reduce the number of arguments passed to the opcodes, which can only take 2\n * arguments if they return a value, or 3 arguments if they are a side-effect-only opcode, and is an\n * implementation detail of the 3 and 4 arg reduce functions.\n */\ntype InitialReduce<T, U> {\n  arr: Array<T>,\n  initial: U,\n}\nexport fn reduce(arr: Array<any>, cb: function, initial: anythingElse): anythingElse {\n  const args = new InitialReduce<any, anythingElse> {\n    arr: arr,\n    initial: initial,\n  };\n  return foldl(args, cb);\n}\nexport fn reducePar(arr: Array<any>, transformer: function, merger: function, initial: anythingElse): anythingElse {\n  const args = new InitialReduce<any, anythingElse> {\n    arr: arr,\n    initial: initial,\n  };\n  const intermediate = new Array<any> [foldl(args, transformer)];\n  return reducep(intermediate, merger);\n}\nexport filter // opcode with signature `fn filter(arr: Array<any>, cb: function): Array<any>`\nexport find // opcode with signature `fn find(arr: Array<any>, cb: function): Result<any>`\nexport fn findLin(arr: Array<any>, cb: function): Result<any> = findl(arr, cb);\nexport every // parallel opcode with signature `fn every(arr: Array<any>, cb: function): bool`\nexport fn everyLin(arr: Array<any>, cb: function): bool = everyl(arr, cb);\nexport some // parallel opcode with signature `fn some(arr: Array<any>, cb: function): bool`\nexport fn someLin(arr: Array<any>, cb: function): bool = somel(arr, cb);\nexport join // opcode with signature `fn join(arr: Array<string>, sep: string): string`\nexport fn delete(arr: Array<any>, idx: int64): Result<any> = delindx(arr, idx);\nexport fn delete(arr: Array<any>, idx: Result<int64>): Result<any> {\n  if idx.isErr() {\n    return idx;\n  }\n  return delindx(arr, idx.getR());\n}\nexport fn set(arr: Array<any>, idx: int64, val: any) {\n  if (idx < 0) | (idx > arr.length()) {\n    return err('array out-of-bounds access');\n  } else {\n    copytov(arr, idx, val);\n    return some(arr);\n  }\n}\nexport fn set(arr: Array<int8>, idx: int64, val: int8) {\n  if (idx < 0) | (idx > arr.length()) {\n    return err('array out-of-bounds access');\n  } else {\n    copytof(arr, idx, val);\n    return some(arr);\n  }\n}\nexport fn set(arr: Array<int16>, idx: int64, val: int16) {\n  if (idx < 0) | (idx > arr.length()) {\n    return err('array out-of-bounds access');\n  } else {\n    copytof(arr, idx, val);\n    return some(arr);\n  }\n}\nexport fn set(arr: Array<int32>, idx: int64, val: int32) {\n  if (idx < 0) | (idx > arr.length()) {\n    return err('array out-of-bounds access');\n  } else {\n    copytof(arr, idx, val);\n    return some(arr);\n  }\n}\nexport fn set(arr: Array<int64>, idx: int64, val: int64) {\n  if (idx < 0) | (idx > arr.length()) {\n    return err('array out-of-bounds access');\n  } else {\n    copytof(arr, idx, val);\n    return some(arr);\n  }\n}\nexport fn set(arr: Array<float32>, idx: int64, val: float32) {\n  if (idx < 0) | (idx > arr.length()) {\n    return err('array out-of-bounds access');\n  } else {\n    copytof(arr, idx, val);\n    return some(arr);\n  }\n}\nexport fn set(arr: Array<float64>, idx: int64, val: float64) {\n  if (idx < 0) | (idx > arr.length()) {\n    return err('array out-of-bounds access');\n  } else {\n    copytof(arr, idx, val);\n    return some(arr);\n  }\n}\nexport fn set(arr: Array<bool>, idx: int64, val: bool) {\n  if (idx < 0) | (idx > arr.length()) {\n    return err('array out-of-bounds access');\n  } else {\n    copytof(arr, idx, val);\n    return some(arr);\n  }\n}\nexport fn toString(arr: Array<Stringifiable>): string {\n  const strings = arr.map(toString);\n  return '[' + strings.join(', ') + ']';\n}\n\n// Ternary functions\nexport fn pair(trueval: any, falseval: any) = new Array<any> [ trueval, falseval ];\nexport fn cond(c: bool, options: Array<any>) = getR(options[1.sub(c.toInt64())]);\nexport fn cond(c: bool, optional: function): void = condfn(c, optional);\n\n// \"clone\" function useful for hoisting assignments and making duplicates\nexport fn clone(a: any) = copyarr(a);\nexport fn clone(a: Array<any>) = copyarr(a);\nexport fn clone(a: void) = copyvoid(a); // TODO: Eliminate this, covering up a weird error\nexport fn clone() = zeroed(); // TODO: Used for conditionals, eliminate with more clever compiler\nexport fn clone(a: int8) = copyi8(a);\nexport fn clone(a: int16) = copyi16(a);\nexport fn clone(a: int32) = copyi32(a);\nexport fn clone(a: int64) = copyi64(a);\nexport fn clone(a: float32) = copyf32(a);\nexport fn clone(a: float64) = copyf64(a);\nexport fn clone(a: bool) = copybool(a);\nexport fn clone(a: string) = copystr(a);\n\n// toHash functions for all data types\nexport fn toHash(val: any) = hashv(val);\nexport fn toHash(val: int8) = hashf(val);\nexport fn toHash(val: int16) = hashf(val);\nexport fn toHash(val: int32) = hashf(val);\nexport fn toHash(val: int64) = hashf(val);\nexport fn toHash(val: float32) = hashf(val);\nexport fn toHash(val: float64) = hashf(val);\nexport fn toHash(val: bool) = hashf(val);\n\n// HashMap implementation\nexport type KeyVal<K, V> {\n  key: K,\n  val: V,\n}\n\nexport interface Hashable {\n  toHash(Hashable): int64,\n  eq(Hashable, Hashable): bool,\n}\n\nexport type HashMap<K, V> {\n  keyVal: Array<KeyVal<K, V>>,\n  lookup: Array<Array<int64>>,\n}\n\nexport fn keyVal(hm: HashMap<Hashable, any>) = hm.keyVal;\nexport fn keys(hm: HashMap<Hashable, any>): Array<Hashable> = map(hm.keyVal, fn (kv: KeyVal<Hashable, any>): Hashable = kv.key);\nexport fn vals(hm: HashMap<Hashable, any>): Array<any> = map(hm.keyVal, fn (kv: KeyVal<Hashable, any>): any = kv.val);\nexport fn length(hm: HashMap<Hashable, any>): int64 = length(hm.keyVal);\n\nexport fn get(hm: HashMap<Hashable, any>, key: Hashable): Result<any> {\n  const hash = key.toHash().sabs() % length(hm.lookup);\n  const list = getR(hm.lookup[hash]);\n  const index = list.find(fn (i: int64): Result<int64> {\n    const kv = getR(hm.keyVal[i]);\n    return eq(kv.key, key);\n  });\n  if index.isOk() {\n    const i = index.getOr(0);\n    const kv = getR(hm.keyVal[i]);\n    return ok(kv.val);\n  } else {\n    return err('key not found');\n  }\n}\n\nexport fn set(hm: HashMap<Hashable, any>, key: Hashable, val: any): HashMap<Hashable, any> {\n  const kv = new KeyVal<Hashable, any> {\n    key: key,\n    val: val,\n  };\n  const hash = key.toHash().sabs() % length(hm.lookup);\n  const list = getR(hm.lookup[hash]);\n  if list.length() == 8 {\n    // Rebucket everything\n    const lookupLen = length(hm.lookup) * 2 || 0;\n    hm.lookup = new Array<Array<int64>> [ new Array<int64> [], ] * lookupLen;\n    eachl(hm.keyVal, fn (kv: KeyVal<Hashable, any>, i: int64) {\n      const hash = toHash(kv.key).sabs() % lookupLen;\n      const list = getR(hm.lookup[hash]);\n      list.push(i);\n    });\n  } else if list.find(fn (idx: int64): bool {\n    const rec = hm.keyVal[idx].getR();\n    return eq(rec.key, key);\n  }).isOk() {\n    list.eachLin(fn (idx: int64, i: int64) {\n      const rec = hm.keyVal[idx].getR();\n      if eq(rec.key, key) {\n        hm.keyVal.set(idx, kv);\n      }\n    });\n  } else {\n    const index = length(hm.keyVal);\n    push(hm.keyVal, kv);\n    list.push(index);\n  }\n  return hm;\n}\n\nexport fn newHashMap(firstKey: Hashable, firstVal: any): HashMap<Hashable, any> { // TODO: Rust-like fn::<typeA, typeB> syntax?\n  let hm = new HashMap<Hashable, any> {\n    keyVal: new Array<KeyVal<Hashable, any>> [],\n    lookup: new Array<Array<int64>> [ new Array<int64> [] ] * 128, // 1KB of space\n  };\n  return hm.set(firstKey, firstVal);\n}\n\nexport fn toHashMap(kva: Array<KeyVal<Hashable, any>>): HashMap<Hashable, any> {\n  let hm = new HashMap<Hashable, any> {\n    keyVal: kva,\n    lookup: new Array<Array<int64>> [ new Array<int64> [] ] * 128,\n  };\n  kva.eachl(fn (kv: KeyVal<Hashable, any>, i: int64) {\n    const hash = toHash(kv.key).sabs() % length(hm.lookup);\n    const list = getR(hm.lookup[hash]);\n    list.push(i);\n  });\n  return hm;\n}\n\n// Tree implementation\n\n// The Tree type houses all of the values attached to a tree in an array and two secondary arrays to\n// hold the metadata on which value is the parent and which are children, if any. The parent value\n// is `-1` if it has no parent and a positive integer otherwise.\nexport type Tree<T> {\n  vals: Array<T>,\n  parents: Array<int64>,\n  children: Array<Array<int64>>,\n}\n\n// The Node type simply holds the index to look into the tree for a particular value-parent-children\n// triplet, where that index is referred to as a node ID. This allows node-based code to be written\n// while not actually having a recursive data structure that a traditional Node type would define.\nexport type Node<T> {\n  id: int64,\n  tree: Tree<T>,\n}\n\nexport fn newTree(rootVal: any): Tree<any> = new Tree<any> {\n  vals: new Array<any> [ rootVal ],\n  parents: new Array<int64> [ -1 ], // The root node has no parent, so its parent ID is -1.\n  children: new Array<Array<int64>> [ new Array<int64> [ ] ],\n};\n\nexport fn getRootNode(t: Tree<any>): Node<any> {\n  if has(t.parents, -1) {\n    return new Node<any> {\n      id: index(t.parents, -1).getOr(0),\n      tree: t,\n    };\n  } else {\n    // Return an invalid node, will behave like an error result\n    return new Node<any> {\n      id: -1,\n      tree: new Tree<any> {\n        vals: new Array<any> [],\n        parents: new Array<int64> [],\n        children: new Array<Array<int64>> [],\n      },\n    };\n  }\n}\n\nexport fn getTree(n: Node<any>): Tree<any> = n.tree;\n\nexport fn length(t: Tree<any>): int64 = length(t.vals);\n\nexport fn getNodeById(t: Tree<any>, i: int64): Node<any> {\n  if length(t.vals).gt(i) {\n    return new Node<any> {\n      id: i,\n      tree: t,\n    };\n  } else {\n    // Return an invalid node, will behave like an error result\n    return new Node<any> {\n      id: -1,\n      tree: new Tree<any> {\n        vals: new Array<any> [],\n        parents: new Array<int64> [],\n        children: new Array<Array<int64>> [],\n      },\n    };\n  }\n}\n\nexport fn getParent(n: Node<any>): Node<any> {\n  const parentId = getOr(n.tree.parents[n.id], -1);\n  if parentId > -1 {\n    return new Node<any> {\n      id: parentId,\n      tree: n.tree,\n    };\n  } else {\n    // Return an invalid node, will behave like an error result\n    return new Node<any> {\n      id: -1,\n      tree: new Tree<any> {\n        vals: new Array<any> [],\n        parents: new Array<int64> [],\n        children: new Array<Array<int64>> [],\n      },\n    };\n  }\n}\n\nexport fn getChildren(n: Node<any>): Array<Node<any>> {\n  if length(n.tree.vals).gt(n.id) {\n    const childIds = getOr(n.tree.children[n.id], new Array<int64> []);\n    return childIds.filter(fn (id: int64): bool {\n      const parentId = getOr(n.tree.parents[id], -1);\n      return parentId.eq(n.id);\n    }).map(fn (id: int64): Node<any> {\n      return new Node<any> {\n        id: id,\n        tree: n.tree,\n      };\n    });\n  } else {\n    return new Array<Node<any>> [ ];\n  }\n}\n\n// Returns the pruned Tree\nexport fn prune(n: Node<any>): Tree<any> {\n  // adjust parent's children\n  const parentRes = n.tree.parents[n.id];\n  if parentRes.isOk() {\n    const parentId = parentRes.getR();\n    const children = getOr(n.tree.children[parentId], new Array<int64> []);\n    const idxRes = index(children, n.id);\n    if idxRes.isOk() {\n      delete(children, idxRes);\n    }\n  }\n  // This is, unfortunately for now, a sequential algorithm. Hope to figure out a parallel version\n  let nodeStack = new Array<int64> [ n.id ];\n  let rmdIds = new Array<int64> [ ];\n  seqdo(newseq(pow(2, 62).getOr(0)), fn (): bool {\n    // Get the nodeId, exit if none left\n    const nodeRes = nodeStack.pop();\n    if nodeRes.isErr() {\n      return false;\n    }\n    const nodeId = nodeRes.getR();\n    // Push the children onto the stack to process if the node has them\n    const childrenRes = n.tree.children[nodeId];\n    if childrenRes.isOk() {\n      const childrenIds = childrenRes.getR();\n      nodeStack = nodeStack.concat(childrenIds);\n    }\n    const delIdx = nodeId - length(rmdIds);\n    delete(n.tree.vals, delIdx);\n    delete(n.tree.parents, delIdx);\n    delete(n.tree.children, delIdx);\n    push(rmdIds, nodeId);\n    return true;\n  });\n\n  // adjust indices for remaining elements\n  const iters = length(n.tree.parents);\n  seqeach(newseq(iters), fn (i: int64) {\n    const parentId = getOr(n.tree.parents[i], -1);\n    const parentDelta = rmdIds.filter(fn (rmId: int64): bool = parentId > rmId).length();\n    if parentDelta > 0 {\n      set(n.tree.parents, i, parentId - parentDelta || 0);\n    }\n    const children = getOr(n.tree.children[i], new Array<int64> []);\n    const newChildren = children.map(fn (cId: int64): int64 {\n      const delta = rmdIds.filter(fn (rmdId: int64): bool = cId > rmdId).length();\n      if delta > 0 {\n        return cId - delta || 0;\n      }\n      return cId;\n    });\n    set(n.tree.children, i, newChildren);\n  });\n  return n.tree;\n}\n\n// Takes the given node and copies that node and all of its children into a new tree with the\n// current node as the root. Unfortunately a sequential algorithm right now.\nexport fn toSubtree(n: Node<any>): Tree<any> {\n  const val = n.tree.vals[n.id].getR();\n  let outTree = newTree(val);\n  let children = n.tree.children[n.id].getOr(new Array<int64> []);\n  if children.length().gt(0) {\n    let parentIds = [0].repeat(children.length());\n    seqdo(newseq(pow(2, 62).getOr(0)), fn (): bool {\n      const childId = children.pop().getOr(-1);\n      const parentId = parentIds.pop().getOr(-1);\n      const childVal = n.tree.vals[childId].getR();\n      const grandchildIds = n.tree.children[childId].getOr(new Array<int64> []);\n      const newParentId = outTree.vals.length();\n      outTree.vals.push(childVal);\n      outTree.parents.push(parentId);\n      outTree.children.push(new Array<int64> []);\n      children = grandchildIds.concat(children);\n      parentIds = [newParentId].repeat(grandchildIds.length()).concat(parentIds);\n      return parentIds.length().gt(0);\n    });\n  }\n  return outTree;\n}\n\nexport fn getChildren(t: Tree<any>): Array<Node<any>> = t.getRootNode().getChildren();\n\n// Attaches the value as a child of the specified node. Returns the new child node added for easier\n// method chaining\nexport fn addChild(n: Node<any>, val: any): Node<any> {\n  const childId = n.tree.vals.length();\n  n.tree.vals.push(val);\n  n.tree.parents.push(n.id);\n  n.tree.children.push(new Array<int64> []);\n  n.tree.children[n.id].getOr(new Array<int64> []).push(childId);\n  return new Node<any> {\n    id: childId,\n    tree: n.tree,\n  };\n}\n\n// Attaches the specified Tree to the specified Node. Can be done with simple maps and concats. This\n// returns the new child node corresponding to the root node of the tree. When adding a tree, we\n// duplicate that tree and attach it to the specified node on the new tree with the parent-child\n// relationships \"re-stitched\" on the node's own tree. This means it is even possible to attach a\n// tree to itself without producing loops in the tree structure:\n//    A          A\n//   / \\   =>   / \\\n//  B   C      B   C\n//                 |\n//                 A'\n//                / \\\n//               B'  C'\nexport fn addChild(n: Node<any>, val: Tree<any>): Node<any> {\n  const childIdOffset = n.tree.vals.length();\n  const newParents = val.parents.map(fn (p: int64): int64 {\n    if p == -1 {\n      return n.id;\n    } else {\n      return p.add(childIdOffset).getOr(0);\n    }\n  });\n  const newChildren = val.children.map(fn (ca: Array<int64>): Array<int64> {\n    return ca.map(fn (c: int64): int64 = c.add(childIdOffset).getOr(0));\n  });\n  n.tree.children = n.tree.children.concat(newChildren);\n  n.tree.children[n.id].getOr(new Array<int64> []).push(childIdOffset);\n  n.tree.vals = n.tree.vals.concat(val.vals);\n  n.tree.parents = n.tree.parents.concat(newParents);\n  return new Node<any> {\n    id: childIdOffset,\n    tree: n.tree,\n  };\n}\n\n// Attaches the specified Node and its children to the specified Node. This returns the new child\n// node corresponding to the attached node\nexport fn addChild(n: Node<any>, val: Node<any>): Node<any> = n.addChild(val.toSubtree());\n\n// Attaches the specified value to the specified Tree, by referencing a Tree directly, attaches to\n// the root node, and returns the new child node\nexport fn addChild(t: Tree<any>, val: any): Node<any> = t.getRootNode().addChild(val);\n\n// Attaches the specified Node and its children to the specified Tree's root node\nexport fn addChild(t: Tree<any>, val: Node<any>): Node<any> = t.getRootNode().addChild(val.toSubtree());\n\n// Attahces one tree to the root node of another tree. Returns the node of the attached tree's root\nexport fn addChild(t: Tree<any>, val: Tree<any>): Node<any> = t.getRootNode().addChild(val);\n\nexport fn getOr(n: Node<any>, default: any): any = getOr(n.tree.vals[n.id], default);\n\nexport fn toNodeArray(t: Tree<any>): Array<Node<any>> = map(\n  t.vals,\n  fn (val: any, i: int64): Node<any> = t.getNodeById(i)\n);\n\nexport fn map(t: Tree<any>, mapper: function): Tree<anythingElse> {\n  return new Tree<anythingElse> {\n    vals: t.toNodeArray().map(mapper),\n    parents: clone(t.parents),\n    children: clone(t.children),\n  };\n}\n\nexport fn some(t: Tree<any>, mapper: function): bool = t.toNodeArray().some(mapper);\n\nexport fn every(t: Tree<any>, mapper: function): bool = t.toNodeArray().every(mapper);\n\nexport fn reduce(t: Tree<any>, cb: function, initial: anythingElse): bool = t\n  .toNodeArray()\n  .reduce(cb, initial);\n\nexport fn find(t: Tree<any>, mapper: function): Node<any> {\n  // Return an invalid node, will behave like an error result\n  return t.toNodeArray().find(mapper).getOr(\n    new Node<any> {\n      id: -1,\n      tree: new Tree<any> {\n        vals: new Array<any> [],\n        parents: new Array<int64> [],\n        children: new Array<Array<int64>> [],\n      },\n    }\n  );\n}\n\n// Operator declarations\nexport infix add as + precedence 2\nexport infix concat as + precedence 2\nexport infix sub as - precedence 2\nexport prefix negate as - precedence 1\nexport infix mul as * precedence 3\nexport infix repeat as * precedence 3\nexport infix div as / precedence 3\nexport infix split as / precedence 3\nexport infix mod as % precedence 3\n// export infix template as % precedence 3\nexport infix pow as ** precedence 4\nexport infix sadd as +. precedence 2\nexport prefix snegate as -. precedence 1\nexport infix ssub as -. precedence 2\nexport infix smul as *. precedence 3\nexport infix sdiv as /. precedence 3\nexport infix spow as **. precedence 4\nexport infix and as & precedence 3\nexport infix and as && precedence 3\nexport infix or as | precedence 2\nexport infix boolor as || precedence 2\nexport infix xor as ^ precedence 2\nexport prefix not as ! precedence 4\nexport infix nand as !& precedence 3\nexport infix nor as !| precedence 2\nexport infix xnor as !^ precedence 2\nexport infix eq as == precedence 1\nexport infix neq as != precedence 1\nexport infix lt as < precedence 1\nexport infix lte as <= precedence 1\nexport infix gt as > precedence 1\nexport infix gte as >= precedence 1\nexport infix matches as ~ precedence 1\nexport infix index as @ precedence 1\nexport prefix length as # precedence 4\nexport prefix trim as ` precedence 4\nexport infix pair as : precedence 5\nexport infix push as : precedence 6\nexport infix cond as ? precedence 0\nexport infix getOr as || precedence 2\n","seq.ln":"/**\n * @std/seq - Tools for sequential algorithms. Use if you must.\n */\n\n// The `Seq` opaque type used by these algorithms to guarantee halting\nexport Seq\n\n// The `seq` constructor function\nexport fn seq(limit: int64): Seq = newseq(limit);\n\n// A basic iterator function, unlikely to be useful outside of these functions\nexport fn next(seq: Seq): Result<int64> = seqnext(seq);\n\n// An automatic iterator that executes the provided function in sequence until the limit is reached\nexport fn each(seq: Seq, func: function): void = seqeach(seq, func);\n\n// A while loop with an initial conditional check\nexport fn while(seq: Seq, condFn: function, bodyFn: function): void = seqwhile(seq, condFn, bodyFn);\n\n// A do-while loop that returns the conditional check\nexport fn doWhile(seq: Seq, bodyFn: function): void = seqdo(seq, bodyFn);\n\n// Recursive functions in Alan require a \"trampoline\" outside of the grammar of the language to work\n// so a special \"Self\" type exists that internally references the Seq type and the relevant function\n// and provides the mechanism to re-schedule the recursive function to call with a new argument.\nexport Self\n\n// There are two `recurse` functions. The first is on the `self` object that has an internal\n// reference to the relevant seq and recursive function to be called and is meant to be used within\n// the recursive function. The second sets it all off with a sequence operator, the recursive\n// function in question, and the query argument, and is using the first function under the hood.\nexport fn recurse(self: Self, arg: any): Result<anythingElse> = selfrec(self, arg);\nexport fn recurse(seq: Seq, recurseFn: function, arg: any): Result<anythingElse> {\n  let self = seqrec(seq, recurseFn);\n  return selfrec(self, arg);\n}\n\n// TODO: Add the generator piece of the seq rfc\n","tcp.ln":"/**\n * @std/tcp - Built-in client for TCP\n */\n\n// Built-in opaque types for the AVM and js-runtime to implement\nexport TcpChannel\nexport Chunk\n\n// The TcpContext type. This type is also built-in as the it is emitted in the\n// `chunk` and `tcpClose` events\nexport type TcpContext<C> {\n  channel: TcpChannel,\n  context: C,\n}\n\n// Built-in events for TCP channels, both client and server.\n// `chunk` has the signature `event chunk: Chunk`\nexport chunk\n// `tcpClose` has the signature `event tcpClose: TcpContext<C>`\nexport tcpClose\n\n// Creates a client connection to a TCP server.\n// `tcpconn` has the type signature `fn(string, int16): TcpChannel`\nexport fn connect(host: string, port: int64) = tcpconn(host, port.toInt16());\nexport fn connect(host: string, port: int16) = tcpconn(host, port);\n\n// Attaches a context value to a channel. Exposed to the other events wrapped the other way around\n// but this type is opaque so it is fine. `tcpAddC` has the type `fn(TcpChannel, any): TcpChannel`\nexport fn addContext(channel: TcpChannel, context: any) = tcpAddC(channel, context);\n\n// Marks the channel as ready to receive data from the other side. Useful if data is immediately\n// pushed at you, which is common for servers, but also possible for clients\n// `tcpReady` has the type `fn (TcpChannel): void`\nexport fn ready(channel: TcpChannel) = tcpReady(channel);\n\n// Reads a chunk of data from a channel. Since this is supposed to be called when the `chunk` event\n// is triggered, it is a CPU-bound operation that returns a chunk referencing actual data on the\n// first call, and a chunk representing no data on subsequent calls until the event is triggered\n// again. `tcpRead` has the type `fn(TcpChannel): Chunk`\nexport fn read(channel: TcpChannel) = tcpRead(channel);\n\n/**\n * TODO: The following functions should eventually be added for manipulating chunks, but they will\n * be implemented in a followup PR.\n *\n * fn toInt8Array(chunk: Chunk): Array<int8>\n * fn toAsciiString(chunk: Chunk): String\n * fn toUTF8ResultString(chunk: Chunk): Result<String>\n *\n */\n\n// Writes a chunk of data to a channel. This can be called as many times as desired whenever desired\n// but likely makes sense to happen on `chunk` events when there is some data to respond to. Though\n// an HTTP client built on top of this would likely write a lot of data immediately after creating\n// the connection. `tcpWrite` has the type `fn(TcpChannel, Chunk): TcpChannel`\nexport fn write(channel: TcpChannel, chunk: Chunk) = tcpWrite(channel, chunk);\n\n/**\n * TODO: The following functions should eventually be added for manipulating Alan types into chunks,\n * but they will be implemented in a followup PR.\n *\n * fn toChunk(a8: Array<int8>): Chunk\n * fn toChunk(s: String): Chunk\n * fn toChunk(s: String, encoding: String): Result<Chunk>\n *\n * `encoding` would ideally be an enum if/when we add them to the language, but for now is an\n * arbitrary string of the encoding format. Can fail if the encoding isn't known or if the\n * provided string can't be encoded in the specified format.\n *\n */\n\n// Closes a channel. Always succeeds even if the underlying channel is already closed.\n// `tcpTerm` has the type `fn(TcpChannel): void` (called `tcpTerm` to not clash with the `tcpClose`\n// event defined above\nexport fn close(channel: TcpChannel) = tcpTerm(channel);\n\n/**\n * TODO: The following functions should eventually be added for inspecting channel status, but they\n * will be implemented in a followup PR.\n *\n * fn getState(channel: TcpChannel): string\n * fn getCloseReason(channel: TcpChannel): string\n *\n */\n\n","tcpserver.ln":"/**\n * @std/tcpserver - Built-in server for TCP\n */\n\n// Built-in event solely for the TCP server. Has the signature `event tcpConn: TcpChannel`\nexport tcpConn\n\n// Built-in tunnel (with magic SSL unwrapping if the source port is 443) to a destination port.\n// Perf shortcut until raw TCP manipulation is more performant. Returns a boolean on if it succeeded\n// to listen on the specified source port.\nexport fn tunnel(port: int64) = tcptun(port.toInt16());\nexport fn tunnel(port: int16) = tcptun(port);\n\n","trig.ln":"export const e = 2.718281828459045;\nexport const pi = 3.141592653589793;\nexport const tau = 6.283185307179586;\n\nexport fn exp(x: float64) = e ** x;\nexport fn exp(x: Result<float64>) = e ** x;\nexport fn exp(x: float32) = toFloat32(e) ** x;\nexport fn exp(x: Result<float32>) = toFloat32(e) ** x;\n\nexport fn ln(x: float64) = lnf64(x);\nexport fn ln(x: float32) = toFloat32(lnf64(toFloat64(x)));\n// TODO: Figure out what's wrong with interfaces where the input and output type are the interface\nexport fn ln(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(ln(x.getR()));\n}\nexport fn ln(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(ln(x.getR()));\n}\n\nexport fn log(x: float64) = logf64(x);\nexport fn log(x: float32) = toFloat32(logf64(toFloat64(x)));\nexport fn log(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(log(x.getR()));\n}\nexport fn log(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(log(x.getR()));\n}\n\nexport fn sin(x: float64) = sinf64(x);\nexport fn sin(x: float32) = toFloat32(sinf64(toFloat64(x)));\nexport fn sin(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(sin(x.getR()));\n}\nexport fn sin(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(sin(x.getR()));\n}\nexport fn sine(x: float64) = sin(x);\nexport fn sine(x: float32) = sin(x);\nexport fn sine(x: Result<float64>) = sin(x);\nexport fn sine(x: Result<float32>) = sin(x);\n\nexport fn cos(x: float64) = cosf64(x);\nexport fn cos(x: float32) = toFloat32(cosf64(toFloat64(x)));\nexport fn cos(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(cos(x.getR()));\n}\nexport fn cos(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(cos(x.getR()));\n}\nexport fn cosine(x: float64) = cos(x);\nexport fn cosine(x: float32) = cos(x);\nexport fn cosine(x: Result<float64>) = cos(x);\nexport fn cosine(x: Result<float32>) = cos(x);\n\nexport fn tan(x: float64) = tanf64(x);\nexport fn tan(x: float32) = toFloat32(tanf64(toFloat64(x)));\nexport fn tan(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(tan(x.getR()));\n}\nexport fn tan(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(tan(x.getR()));\n}\nexport fn tangent(x: float64) = tan(x);\nexport fn tangent(x: float32) = tan(x);\nexport fn tangent(x: Result<float64>) = tan(x);\nexport fn tangent(x: Result<float32>) = tan(x);\n\nexport fn sec(x: float64) = 1.0 / cosf64(x);\nexport fn sec(x: float32): Result<float32> {\n  const s64 = sec(x.toFloat64());\n  if s64.isErr() {\n    return s64;\n  }\n  return ok(s64.getR().toFloat32());\n}\nexport fn sec(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return sec(x.getR());\n}\nexport fn sec(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return sec(x.getR());\n}\nexport fn secant(x: float64) = sec(x);\nexport fn secant(x: float32) = sec(x);\nexport fn secant(x: Result<float64>) = sec(x);\nexport fn secant(x: Result<float32>) = sec(x);\n\nexport fn csc(x: float64) = 1.0 / sinf64(x);\nexport fn csc(x: float32): Result<float32> {\n  const c64 = csc(x.toFloat64());\n  if c64.isErr() {\n    return c64;\n  }\n  return ok(c64.getR().toFloat32());\n}\nexport fn csc(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return csc(x.getR());\n}\nexport fn csc(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return csc(x.getR());\n}\nexport fn cosecant(x: float64) = csc(x);\nexport fn cosecant(x: float32) = csc(x);\nexport fn cosecant(x: Result<float64>) = csc(x);\nexport fn cosecant(x: Result<float32>) = csc(x);\n\nexport fn cot(x: float64) = 1.0 / tanf64(x);\nexport fn cot(x: float32): Result<float32> {\n  const t64 = cot(x.toFloat64());\n  if t64.isErr() {\n    return t64;\n  }\n  return ok(t64.getR().toFloat32());\n}\nexport fn cot(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return cot(x.getR());\n}\nexport fn cot(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return cot(x.getR());\n}\nexport fn cotangent(x: float64) = cot(x);\nexport fn cotangent(x: float32) = cot(x);\nexport fn cotangent(x: Result<float64>) = cot(x);\nexport fn cotangent(x: Result<float32>) = cot(x);\n\nexport fn asin(x: float64) = asinf64(x);\nexport fn asin(x: float32) = toFloat32(asinf64(toFloat64(x)));\nexport fn asin(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(asin(x.getR()));\n}\nexport fn asin(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(asin(x.getR()));\n}\nexport fn arcsine(x: float64) = asin(x);\nexport fn arcsine(x: float32) = asin(x);\nexport fn arcsine(x: Result<float64>) = asin(x);\nexport fn arcsine(x: Result<float32>) = asin(x);\n\nexport fn acos(x: float64) = acosf64(x);\nexport fn acos(x: float32) = toFloat32(acosf64(toFloat64(x)));\nexport fn acos(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(acos(x.getR()));\n}\nexport fn acos(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(acos(x.getR()));\n}\nexport fn arccosine(x: float64) = acos(x);\nexport fn arccosine(x: float32) = acos(x);\nexport fn arccosine(x: Result<float64>) = acos(x);\nexport fn arccosine(x: Result<float32>) = acos(x);\n\nexport fn atan(x: float64) = atanf64(x);\nexport fn atan(x: float32) = toFloat32(atanf64(toFloat64(x)));\nexport fn atan(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(atan(x.getR()));\n}\nexport fn atan(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(atan(x.getR()));\n}\nexport fn arctangent(x: float64) = atan(x);\nexport fn arctangent(x: float32) = atan(x);\nexport fn arctangent(x: Result<float64>) = atan(x);\nexport fn arctangent(x: Result<float32>) = atan(x);\n\nexport fn asec(x: float64): Result<float64> {\n  const inv = 1.0 / x;\n  if inv.isErr() {\n    return inv;\n  }\n  return ok(acosf64(inv.getR()));\n}\nexport fn asec(x: float32): Result<float32> {\n  const val = asec(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn asec(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return asec(x.getR());\n}\nexport fn asec(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return asec(x.getR());\n}\nexport fn arcsecant(x: float64) = asec(x);\nexport fn arcsecant(x: float32) = asec(x);\nexport fn arcsecant(x: Result<float64>) = asec(x);\nexport fn arcsecant(x: Result<float32>) = asec(x);\n\nexport fn acsc(x: float64): Result<float64> {\n  const inv = 1.0 / x;\n  if inv.isErr() {\n    return inv;\n  }\n  return ok(asinf64(inv.getR()));\n}\nexport fn acsc(x: float32): Result<float32> {\n  const val = acsc(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn acsc(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return acsc(x.getR());\n}\nexport fn acsc(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return acsc(x.getR());\n}\nexport fn arccosecant(x: float64) = acsc(x);\nexport fn arccosecant(x: float32) = acsc(x);\nexport fn arccosecant(x: Result<float64>) = acsc(x);\nexport fn arccosecant(x: Result<float32>) = acsc(x);\n\nexport fn acot(x: float64) = pi / 2.0 - atanf64(x);\nexport fn acot(x: float32): Result<float32> {\n  const val = acot(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn acot(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return acot(x.getR());\n}\nexport fn acot(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return acot(x.getR());\n}\nexport fn arccotangent(x: float64) = acot(x);\nexport fn arccotangent(x: float32) = acot(x);\nexport fn arccotangent(x: Result<float64>) = acot(x);\nexport fn arccotangent(x: Result<float32>) = acot(x);\n\nexport fn ver(x: float64) = 1.0 - cosf64(x);\nexport fn ver(x: float32): Result<float32> {\n  const val = ver(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn ver(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return ver(x.getR());\n}\nexport fn ver(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return ver(x.getR());\n}\nexport fn versine(x: float64) = ver(x);\nexport fn versine(x: float32) = ver(x);\nexport fn versine(x: Result<float64>) = ver(x);\nexport fn versine(x: Result<float32>) = ver(x);\n\nexport fn vcs(x: float64) = 1.0 + cosf64(x);\nexport fn vcs(x: float32): Result<float32> {\n  const val = vcs(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn vcs(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return vcs(x.getR());\n}\nexport fn vcs(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return vcs(x.getR());\n}\nexport fn vercosine(x: float64) = vcs(x);\nexport fn vercosine(x: float32) = vcs(x);\nexport fn vercosine(x: Result<float64>) = vcs(x);\nexport fn vercosine(x: Result<float32>) = vcs(x);\n\nexport fn cvs(x: float64) = 1.0 - sinf64(x);\nexport fn cvs(x: float32): Result<float32> {\n  const val = cvs(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn cvs(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return cvs(x.getR());\n}\nexport fn cvs(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return cvs(x.getR());\n}\nexport fn coversine(x: float64) = cvs(x);\nexport fn coversine(x: float32) = cvs(x);\nexport fn coversine(x: Result<float64>) = cvs(x);\nexport fn coversine(x: Result<float32>) = cvs(x);\n\nexport fn cvc(x: float64) = 1.0 + sinf64(x);\nexport fn cvc(x: float32): Result<float32> {\n  const val = cvc(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn cvc(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return cvc(x.getR());\n}\nexport fn cvc(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return cvc(x.getR());\n}\nexport fn covercosine(x: float64) = cvc(x);\nexport fn covercosine(x: float32) = cvc(x);\nexport fn covercosine(x: Result<float64>) = cvc(x);\nexport fn covercosine(x: Result<float32>) = cvc(x);\n\nexport fn hav(x: float64) = versine(x) / 2.0;\nexport fn hav(x: float32): Result<float32> {\n  const val = hav(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn hav(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return hav(x.getR());\n}\nexport fn hav(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return hav(x.getR());\n}\nexport fn haversine(x: float64) = hav(x);\nexport fn haversine(x: float32) = hav(x);\nexport fn haversine(x: Result<float64>) = hav(x);\nexport fn haversine(x: Result<float32>) = hav(x);\n\nexport fn hvc(x: float64) = vercosine(x) / 2.0;\nexport fn hvc(x: float32): Result<float32> {\n  const val = hvc(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn hvc(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return hvc(x.getR());\n}\nexport fn hvc(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return hvc(x.getR());\n}\nexport fn havercosine(x: float64) = hvc(x);\nexport fn havercosine(x: float32) = hvc(x);\nexport fn havercosine(x: Result<float64>) = hvc(x);\nexport fn havercosine(x: Result<float32>) = hvc(x);\n\nexport fn hcv(x: float64) = coversine(x) / 2.0;\nexport fn hcv(x: float32): Result<float32> {\n  const val = hcv(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn hcv(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return hcv(x.getR());\n}\nexport fn hcv(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return hcv(x.getR());\n}\nexport fn hacoversine(x: float64) = hcv(x);\nexport fn hacoversine(x: float32) = hcv(x);\nexport fn hacoversine(x: Result<float64>) = hcv(x);\nexport fn hacoversine(x: Result<float32>) = hcv(x);\n\nexport fn hcc(x: float64) = covercosine(x) / 2.0;\nexport fn hcc(x: float32): Result<float32> {\n  const val = hcc(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn hcc(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return hcc(x.getR());\n}\nexport fn hcc(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return hcc(x.getR());\n}\nexport fn hacovercosine(x: float64) = hcc(x);\nexport fn hacovercosine(x: float32) = hcc(x);\nexport fn hacovercosine(x: Result<float64>) = hcc(x);\nexport fn hacovercosine(x: Result<float32>) = hcc(x);\n\nexport fn exs(x: float64) = secant(x) - 1.0;\nexport fn exs(x: float32): Result<float32> {\n  const val = exs(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn exs(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return exs(x.getR());\n}\nexport fn exs(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return exs(x.getR());\n}\nexport fn exsecant(x: float64) = exs(x);\nexport fn exsecant(x: float32) = exs(x);\nexport fn exsecant(x: Result<float64>) = exs(x);\nexport fn exsecant(x: Result<float32>) = exs(x);\n\nexport fn exc(x: float64) = cosecant(x) - 1.0;\nexport fn exc(x: float32): Result<float32> {\n  const val = exc(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn exc(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return exc(x.getR());\n}\nexport fn exc(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return exc(x.getR());\n}\nexport fn excosecant(x: float64) = exc(x);\nexport fn excosecant(x: float32) = exc(x);\nexport fn excosecant(x: Result<float64>) = exc(x);\nexport fn excosecant(x: Result<float32>) = exc(x);\n\nexport fn crd(x: float64) = 2.0 * sine(x / 2.0);\nexport fn crd(x: float32): Result<float32> {\n  const val = crd(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn crd(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return crd(x.getR());\n}\nexport fn crd(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return crd(x.getR());\n}\nexport fn chord(x: float64) = crd(x);\nexport fn chord(x: float32) = crd(x);\nexport fn chord(x: Result<float64>) = crd(x);\nexport fn chord(x: Result<float32>) = crd(x);\n\nexport fn aver(x: float64) = arccosine(1.0 - x);\nexport fn aver(x: float32): Result<float32> {\n  const val = aver(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn aver(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return aver(x.getR());\n}\nexport fn aver(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return aver(x.getR());\n}\nexport fn arcversine(x: float64) = aver(x);\nexport fn arcversine(x: float32) = aver(x);\nexport fn arcversine(x: Result<float64>) = aver(x);\nexport fn arcversine(x: Result<float32>) = aver(x);\n\nexport fn avcs(x: float64) = arccosine(x - 1.0);\nexport fn avcs(x: float32): Result<float32> {\n  const val = avcs(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn avcs(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return avcs(x.getR());\n}\nexport fn avcs(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return avcs(x.getR());\n}\nexport fn arcvercosine(x: float64) = avcs(x);\nexport fn arcvercosine(x: float32) = avcs(x);\nexport fn arcvercosine(x: Result<float64>) = avcs(x);\nexport fn arcvercosine(x: Result<float32>) = avcs(x);\n\nexport fn acvs(x: float64) = arcsine(1.0 - x);\nexport fn acvs(x: float32): Result<float32> {\n  const val = acvs(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn acvs(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return acvs(x.getR());\n}\nexport fn acvs(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return acvs(x.getR());\n}\nexport fn arccoversine(x: float64) = acvs(x);\nexport fn arccoversine(x: float32) = acvs(x);\nexport fn arccoversine(x: Result<float64>) = acvs(x);\nexport fn arccoversine(x: Result<float32>) = acvs(x);\n\nexport fn acvc(x: float64) = arcsine(x - 1.0);\nexport fn acvc(x: float32): Result<float32> {\n  const val = acvc(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn acvc(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return acvc(x.getR());\n}\nexport fn acvc(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return acvc(x.getR());\n}\nexport fn arccovercosine(x: float64) = acvc(x);\nexport fn arccovercosine(x: float32) = acvc(x);\nexport fn arccovercosine(x: Result<float64>) = acvc(x);\nexport fn arccovercosine(x: Result<float32>) = acvc(x);\n\nexport fn ahav(x: float64) = arccosine(1.0 - 2.0 * x);\nexport fn ahav(x: float32): Result<float32> {\n  const val = ahav(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn ahav(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return ahav(x.getR());\n}\nexport fn ahav(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return ahav(x.getR());\n}\nexport fn archaversine(x: float64) = ahav(x);\nexport fn archaversine(x: float32) = ahav(x);\nexport fn archaversine(x: Result<float64>) = ahav(x);\nexport fn archaversine(x: Result<float32>) = ahav(x);\n\nexport fn ahvc(x: float64) = arccosine(2.0 * x - 1.0);\nexport fn ahvc(x: float32): Result<float32> {\n  const val = ahvc(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn ahvc(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return ahvc(x.getR());\n}\nexport fn ahvc(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return ahvc(x.getR());\n}\nexport fn archavercosine(x: float64) = ahvc(x);\nexport fn archavercosine(x: float32) = ahvc(x);\nexport fn archavercosine(x: Result<float64>) = ahvc(x);\nexport fn archavercosine(x: Result<float32>) = ahvc(x);\n\nexport fn ahcv(x: float64) = arcsine(1.0 - 2.0 * x);\nexport fn ahcv(x: float32): Result<float32> {\n  const val = ahcv(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn ahcv(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return ahcv(x.getR());\n}\nexport fn ahcv(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return ahcv(x.getR());\n}\nexport fn archacoversine(x: float64) = ahcv(x);\nexport fn archacoversine(x: float32) = ahcv(x);\nexport fn archacoversine(x: Result<float64>) = ahcv(x);\nexport fn archacoversine(x: Result<float32>) = ahcv(x);\n\nexport fn ahcc(x: float64) = arcsine(2.0 * x - 1.0);\nexport fn ahcc(x: float32): Result<float32> {\n  const val = ahcc(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn ahcc(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return ahcc(x.getR());\n}\nexport fn ahcc(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return ahcc(x.getR());\n}\nexport fn archacovercosine(x: float64) = ahcc(x);\nexport fn archacovercosine(x: float32) = ahcc(x);\nexport fn archacovercosine(x: Result<float64>) = ahcc(x);\nexport fn archacovercosine(x: Result<float32>) = ahcc(x);\n\nexport fn aexs(x: float64) = arccosine(1.0 / (x + 1.0));\nexport fn aexs(x: float32): Result<float32> {\n  const val = aexs(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn aexs(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return aexs(x.getR());\n}\nexport fn aexs(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return aexs(x.getR());\n}\nexport fn arcexsecant(x: float64) = aexs(x);\nexport fn arcexsecant(x: float32) = aexs(x);\nexport fn arcexsecant(x: Result<float64>) = aexs(x);\nexport fn arcexsecant(x: Result<float32>) = aexs(x);\n\nexport fn aexc(x: float64) = arcsine(1.0 / (x + 1.0));\nexport fn aexc(x: float32): Result<float32> {\n  const val = aexc(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn aexc(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return aexc(x.getR());\n}\nexport fn aexc(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return aexc(x.getR());\n}\nexport fn arcexcosecant(x: float64) = aexc(x);\nexport fn arcexcosecant(x: float32) = aexc(x);\nexport fn arcexcosecant(x: Result<float64>) = aexc(x);\nexport fn arcexcosecant(x: Result<float32>) = aexc(x);\n\nexport fn acrd(x: float64) = 2.0 * arcsine(x / 2.0);\nexport fn acrd(x: float32): Result<float32> {\n  const val = acrd(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn acrd(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return acrd(x.getR());\n}\nexport fn acrd(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return acrd(x.getR());\n}\nexport fn arcchord(x: float64) = acrd(x);\nexport fn arcchord(x: float32) = acrd(x);\nexport fn arcchord(x: Result<float64>) = acrd(x);\nexport fn arcchord(x: Result<float32>) = acrd(x);\n\nexport fn sinh(x: float64) = sinhf64(x);\nexport fn sinh(x: float32) = toFloat32(sinhf64(toFloat64(x)));\nexport fn sinh(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(sinh(x.getR()));\n}\nexport fn sinh(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(sinh(x.getR()));\n}\nexport fn hyperbolicSine(x: float64) = sinh(x);\nexport fn hyperbolicSine(x: float32) = sinh(x);\nexport fn hyperbolicSine(x: Result<float64>) = sinh(x);\nexport fn hyperbolicSine(x: Result<float32>) = sinh(x);\n\nexport fn cosh(x: float64) = coshf64(x);\nexport fn cosh(x: float32) = toFloat32(coshf64(toFloat64(x)));\nexport fn cosh(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(cosh(x.getR()));\n}\nexport fn cosh(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(cosh(x.getR()));\n}\nexport fn hyperbolicCosine(x: float64) = cosh(x);\nexport fn hyperbolicCosine(x: float32) = cosh(x);\nexport fn hyperbolicCosine(x: Result<float64>) = cosh(x);\nexport fn hyperbolicCosine(x: Result<float32>) = cosh(x);\n\nexport fn tanh(x: float64) = tanhf64(x);\nexport fn tanh(x: float32) = toFloat32(tanhf64(toFloat64(x)));\nexport fn tanh(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(tanh(x.getR()));\n}\nexport fn tanh(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return ok(tanh(x.getR()));\n}\nexport fn hyperbolicTangent(x: float64) = tanh(x);\nexport fn hyperbolicTangent(x: float32) = tanh(x);\nexport fn hyperbolicTangent(x: Result<float64>) = tanh(x);\nexport fn hyperbolicTangent(x: Result<float32>) = tanh(x);\n\nexport fn sech(x: float64) = 1.0 / cosh(x);\nexport fn sech(x: float32): Result<float32> {\n  const val = sech(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn sech(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return sech(x.getR());\n}\nexport fn sech(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return sech(x.getR());\n}\nexport fn hyperbolicSecant(x: float64) = sech(x);\nexport fn hyperbolicSecant(x: float32) = sech(x);\nexport fn hyperbolicSecant(x: Result<float64>) = sech(x);\nexport fn hyperbolicSecant(x: Result<float32>) = sech(x);\n\nexport fn csch(x: float64) = 1.0 / sinh(x);\nexport fn csch(x: float32): Result<float32> {\n  const val = csch(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn csch(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return csch(x.getR());\n}\nexport fn csch(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return csch(x.getR());\n}\nexport fn hyperbolicCosecant(x: float64) = csch(x);\nexport fn hyperbolicCosecant(x: float32) = csch(x);\nexport fn hyperbolicCosecant(x: Result<float64>) = csch(x);\nexport fn hyperbolicCosecant(x: Result<float32>) = csch(x);\n\nexport fn coth(x: float64) = 1.0 / tanh(x);\nexport fn coth(x: float32): Result<float32> {\n  const val = coth(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn coth(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return coth(x.getR());\n}\nexport fn coth(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return coth(x.getR());\n}\nexport fn hyperbolicCotangent(x: float64) = coth(x);\nexport fn hyperbolicCotangent(x: float32) = coth(x);\nexport fn hyperbolicCotangent(x: Result<float64>) = coth(x);\nexport fn hyperbolicCotangent(x: Result<float32>) = coth(x);\n\nexport fn asinh(x: float64) = ln(x + sqrt(x ** 2.0 + 1.0));\nexport fn asinh(x: float32): Result<float32> {\n  const val = asinh(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn asinh(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return asinh(x.getR());\n}\nexport fn asinh(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return asinh(x.getR());\n}\nexport fn hyperbolicArcsine(x: float64) = asinh(x);\nexport fn hyperbolicArcsine(x: float32) = asinh(x);\nexport fn hyperbolicArcsine(x: Result<float64>) = asinh(x);\nexport fn hyperbolicArcsine(x: Result<float32>) = asinh(x);\n\nexport fn acosh(x: float64) = ln(x + sqrt(x ** 2.0 - 1.0));\nexport fn acosh(x: float32): Result<float32> {\n  const val = acosh(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn acosh(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return acosh(x.getR());\n}\nexport fn acosh(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return acosh(x.getR());\n}\nexport fn hyperbolicArccosine(x: float64) = acosh(x);\nexport fn hyperbolicArccosine(x: float32) = acosh(x);\nexport fn hyperbolicArccosine(x: Result<float64>) = acosh(x);\nexport fn hyperbolicArccosine(x: Result<float32>) = acosh(x);\n\nexport fn atanh(x: float64) = ln((x + 1.0) / (x - 1.0)) / 2.0;\nexport fn atanh(x: float32): Result<float32> {\n  const val = atanh(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn atanh(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return atanh(x.getR());\n}\nexport fn atanh(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return atanh(x.getR());\n}\nexport fn hyperbolicArctangent(x: float64) = atanh(x);\nexport fn hyperbolicArctangent(x: float32) = atanh(x);\nexport fn hyperbolicArctangent(x: Result<float64>) = atanh(x);\nexport fn hyperbolicArctangent(x: Result<float32>) = atanh(x);\n\nexport fn asech(x: float64) = ln((1.0 + sqrt(1.0 - x ** 2.0)) / x);\nexport fn asech(x: float32): Result<float32> {\n  const val = asech(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn asech(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return asech(x.getR());\n}\nexport fn asech(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return asech(x.getR());\n}\nexport fn hyperbolicArcsecant(x: float64) = asech(x);\nexport fn hyperbolicArcsecant(x: float32) = asech(x);\nexport fn hyperbolicArcsecant(x: Result<float64>) = asech(x);\nexport fn hyperbolicArcsecant(x: Result<float32>) = asech(x);\n\nexport fn acsch(x: float64) = ln((1.0 / x) + sqrt(1.0 / x ** 2.0 + 1.0));\nexport fn acsch(x: float32): Result<float32> {\n  const val = acsch(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn acsch(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return acsch(x.getR());\n}\nexport fn acsch(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return acsch(x.getR());\n}\nexport fn hyperbolicArccosecant(x: float64) = acsch(x);\nexport fn hyperbolicArccosecant(x: float32) = acsch(x);\nexport fn hyperbolicArccosecant(x: Result<float64>) = acsch(x);\nexport fn hyperbolicArccosecant(x: Result<float32>) = acsch(x);\n\nexport fn acoth(x: float64) = ln((x + 1.0) / (x - 1.0)) / 2.0;\nexport fn acoth(x: float32): Result<float32> {\n  const val = acoth(x.toFloat64());\n  if val.isErr() {\n    return val;\n  }\n  return ok(val.getR().toFloat32());\n}\nexport fn acoth(x: Result<float64>): Result<float64> {\n  if x.isErr() {\n    return x;\n  }\n  return acoth(x.getR());\n}\nexport fn acoth(x: Result<float32>): Result<float32> {\n  if x.isErr() {\n    return x;\n  }\n  return acoth(x.getR());\n}\nexport fn hyperbolicArccotangent(x: float64) = acoth(x);\nexport fn hyperbolicArccotangent(x: float32) = acoth(x);\nexport fn hyperbolicArccotangent(x: Result<float64>) = acoth(x);\nexport fn hyperbolicArccotangent(x: Result<float32>) = acoth(x);\n\n"}

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lp_1 = require("./lp");
// Defining AMM Tokens
const space = lp_1.Token.build(' ');
const blank = lp_1.OneOrMore.build(space);
const optblank = lp_1.ZeroOrOne.build(blank);
const newline = lp_1.Token.build('\n');
const whitespace = lp_1.OneOrMore.build(lp_1.Or.build([space, newline]));
const colon = lp_1.Token.build(':');
const under = lp_1.Token.build('_');
const negate = lp_1.Token.build('-');
const dot = lp_1.Token.build('.');
const eq = lp_1.Token.build('=');
const openParen = lp_1.Token.build('(');
const closeParen = lp_1.Token.build(')');
const openCurly = lp_1.Token.build('{');
const closeCurly = lp_1.Token.build('}');
const openCaret = lp_1.Token.build('<');
const closeCaret = lp_1.Token.build('>');
const comma = lp_1.Token.build(',');
const optcomma = lp_1.ZeroOrOne.build(comma);
const sep = lp_1.And.build([optblank, comma, optblank]);
const base10 = lp_1.CharSet.build('0', '9');
const natural = lp_1.OneOrMore.build(base10);
const integer = lp_1.And.build([lp_1.ZeroOrOne.build(negate), natural]);
const real = lp_1.And.build([integer, dot, natural]);
const lower = lp_1.CharSet.build('a', 'z');
const upper = lp_1.CharSet.build('A', 'Z');
const variable = lp_1.And.build([
    lp_1.OneOrMore.build(lp_1.Or.build([under, lower, upper])),
    lp_1.ZeroOrMore.build(lp_1.Or.build([under, lower, upper, natural])),
]);
const exit = lp_1.Token.build('return');
const t = lp_1.Token.build('true');
const f = lp_1.Token.build('false');
const bool = lp_1.Or.build([t, f]);
const voidn = lp_1.Token.build('void');
const emit = lp_1.Token.build('emit');
const letn = lp_1.Token.build('let');
const constn = lp_1.Token.build('const');
const on = lp_1.Token.build('on');
const event = lp_1.Token.build('event');
const fn = lp_1.Token.build('fn');
const quote = lp_1.Token.build('"');
const escapeQuote = lp_1.Token.build('\\"');
const notQuote = lp_1.Not.build('"');
const str = lp_1.And.build([
    quote,
    lp_1.ZeroOrMore.build(lp_1.Or.build([escapeQuote, notQuote])),
    quote,
]);
const value = lp_1.NamedOr.build({ str, bool, real, integer });
const decname = variable;
const typename = variable;
const typegenerics = lp_1.NamedAnd.build({
    openCaret,
    a: optblank,
    generics: new lp_1.NulLP(),
    b: optblank,
    closeCaret,
});
const fulltypename = lp_1.NamedAnd.build({
    typename,
    opttypegenerics: lp_1.ZeroOrOne.build(typegenerics),
});
// Ugly hackery around circular dependency
typegenerics.and.generics = lp_1.NamedAnd.build({
    fulltypename,
    cdr: lp_1.ZeroOrMore.build(lp_1.NamedAnd.build({
        sep,
        fulltypename,
    })),
});
const emits = lp_1.NamedAnd.build({
    emit,
    blank,
    variable,
    value: lp_1.ZeroOrOne.build(lp_1.NamedAnd.build({
        blank,
        variable,
    })),
});
const events = lp_1.NamedAnd.build({
    event,
    blank,
    variable,
    a: optblank,
    colon,
    b: optblank,
    fulltypename,
});
const exits = lp_1.NamedAnd.build({ exit, blank, variable, a: optblank });
const calllist = lp_1.ZeroOrMore.build(lp_1.NamedAnd.build({ variable, optcomma, optblank }));
const calls = lp_1.NamedAnd.build({
    variable,
    a: optblank,
    openParen,
    b: optblank,
    calllist,
    c: optblank,
    closeParen,
});
const assignables = lp_1.NamedOr.build({
    functions: new lp_1.NulLP(),
    calls,
    value,
    variable,
});
const constdeclaration = lp_1.NamedAnd.build({
    constn,
    a: blank,
    decname,
    b: optblank,
    colon,
    c: optblank,
    fulltypename,
    d: optblank,
    eq,
    e: optblank,
    assignables,
});
const letdeclaration = lp_1.NamedAnd.build({
    letn,
    a: blank,
    decname,
    b: optblank,
    colon,
    c: optblank,
    fulltypename,
    d: blank,
    eq,
    e: blank,
    assignables,
});
const declarations = lp_1.NamedOr.build({ constdeclaration, letdeclaration });
const assignments = lp_1.NamedAnd.build({
    decname,
    a: blank,
    eq,
    b: blank,
    assignables,
});
const statements = lp_1.OneOrMore.build(lp_1.NamedOr.build({
    declarations,
    assignments,
    calls,
    emits,
    exits,
    whitespace,
}));
const functionbody = lp_1.NamedAnd.build({
    openCurly,
    statements,
    closeCurly,
});
const arg = lp_1.NamedAnd.build({
    variable,
    a: optblank,
    colon,
    b: optblank,
    fulltypename,
});
const functions = lp_1.NamedAnd.build({
    fn,
    blank,
    openParen,
    args: lp_1.And.build([
        lp_1.ZeroOrMore.build(lp_1.NamedAnd.build({ arg, sep })),
        lp_1.ZeroOrOne.build(lp_1.NamedAnd.build({ arg, optblank })),
    ]),
    closeParen,
    a: optblank,
    colon,
    b: optblank,
    fulltypename,
    c: optblank,
    functionbody,
});
assignables.or.functions = functions;
const handler = lp_1.NamedAnd.build({ on, a: blank, variable, b: blank, functions });
const amm = lp_1.NamedAnd.build({
    a: optblank,
    globalMem: lp_1.ZeroOrMore.build(lp_1.Or.build([constdeclaration, whitespace])),
    eventDec: lp_1.ZeroOrMore.build(lp_1.Or.build([events, whitespace])),
    handlers: lp_1.OneOrMore.build(lp_1.Or.build([handler, whitespace])),
});
exports.default = amm;

},{"./lp":22}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Statement = exports.Block = void 0;
class Block {
    constructor(type, name, memSize, statements, deps) {
        this.type = type;
        this.name = name;
        this.memSize = memSize;
        this.statements = statements;
        this.deps = deps;
    }
    build() {
        const dependencies = [];
        const idxByNode = new Map();
        for (let ii = 0; ii < this.statements.length; ii++) {
            const stmt = this.statements[ii];
            if (stmt.depNode === null)
                continue;
            idxByNode.set(stmt.depNode, ii);
            for (const upstream of stmt.depNode.upstream) {
                if (idxByNode.get(upstream) !== null &&
                    idxByNode.get(upstream) !== undefined) {
                    stmt.deps.push(idxByNode.get(upstream));
                    dependencies.push({
                        in: this.name,
                        stmt: ii,
                        dependsOn: idxByNode.get(upstream),
                    });
                }
            }
        }
        return JSON.stringify(dependencies);
    }
    toString() {
        let b = `${this.type} for ${this.name} with size ${this.memSize}\n`;
        this.statements.forEach((s) => (b += `  ${s.toString()}\n`));
        return b;
    }
}
exports.Block = Block;
class Statement {
    constructor(fn, inArgs, outArg, line, deps, depNode) {
        this.fn = fn;
        this.inArgs = inArgs;
        this.outArg = outArg;
        this.line = line;
        this.deps = deps;
        this.depNode = depNode || null;
    }
    toString() {
        let s = '';
        if (this.outArg !== null) {
            s += `${this.outArg} = `;
        }
        s += `${this.fn}(${this.inArgs.join(', ')}) #${this.line}`;
        if (this.deps.length > 0) {
            s += ` <- [${this.deps.map((d) => `#${d}`).join(', ')}]`;
        }
        return s;
    }
}
exports.Statement = Statement;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opcodeParamMutabilities = exports.DepNode = exports.DepGraph = void 0;
const lp_1 = require("../lp");
// this is just here for debugging purposes
const unhandled = (val, reason) => {
    console.error(`========== UNHANDLED: ${reason}`);
    console.error(val);
    console.error();
    throw new Error();
};
class DepGraph {
    constructor(fn, outer) {
        this.byOrder = [];
        this.byVar = {};
        this.byLP = new Map();
        this.outerGraph = outer || null;
        this.outerDeps = [];
        this.outerMuts = [];
        this.params = null;
        if (fn !== null && fn !== undefined) {
            fn = fn.get('functions');
            if (fn.has('args'))
                this.buildParams([...fn.get('args').getAll()]);
            const stmts = fn
                .get('functionbody')
                .get('statements')
                .getAll()
                .filter((s) => !s.has('whitespace'));
            this.build(stmts);
        }
    }
    get isNop() {
        return (this.byOrder.length === 0 ||
            this.byOrder.every((n) => n.closure != null && n.closure.isNop));
    }
    buildParams(params) {
        this.params = {};
        while (params.length > 0) {
            let param = params.shift();
            if (param instanceof lp_1.NamedAnd) {
                if (param.has('arg')) {
                    param = param.get('arg');
                }
                if (param.has('variable') && param.get('variable').t.trim() !== '') {
                    // assign a very basic `DepNode` struct to avoid having to go through
                    // the whole constructor, since this node is just a param declaration
                    // and doesn't need to go through the whole shebang. We just need it
                    // for when we're generating the dependencies of the aga output
                    this.params[param.get('variable').t.trim()] = new DepNode(param, this, true);
                }
                else {
                    unhandled(param, 'unknown param ast');
                }
            }
            else if (param instanceof lp_1.ZeroOrMore) {
                params.unshift(...param.getAll());
            }
            else if (!(param instanceof lp_1.NulLP)) {
                unhandled(param, 'unknown ast type for function parameters');
            }
        }
    }
    build(stmts) {
        for (const stmt of stmts) {
            const node = new DepNode(stmt, this);
            // console.log(`mutates:`)
            // console.log(node.mutates)
            for (const mutated of node.mutates) {
                if (this.outerGraph !== null &&
                    this.outerGraph.getLastMutationFor(mutated) !== null) {
                    this.outerMuts.push(mutated);
                }
                if (this.byVar[mutated] === null || this.byVar[mutated] === undefined) {
                    this.byVar[mutated] = [];
                }
                this.byVar[mutated].push(node);
            }
            this.byOrder.push(node);
            this.byLP.set(stmt, node);
        }
        this.outerDeps = [...new Set(this.outerDeps)];
    }
    getLastMutationFor(varName) {
        const nodes = this.byVar[varName];
        // console.log(`------- ${varName}`)
        // console.log('nodes:')
        // console.log(nodes)
        if (nodes !== null && nodes !== undefined && nodes.length !== 0) {
            return nodes[nodes.length - 1];
        }
        // if there's no mutation, check to see if it's a variable first
        if (this.params !== null &&
            this.params[varName] !== null &&
            this.params[varName] !== undefined) {
            // don't even make up a node for it, it's just dependent on the param
            // which is always guaranteed to be satisfied
            return this.params[varName];
        }
        // console.log('og:')
        // console.log(this.outerGraph)
        if (this.outerGraph !== null) {
            const outer = this.outerGraph.getLastMutationFor(varName);
            if (outer !== null) {
                // console.log(`found outer for ${varName}`)
                this.outerDeps.push(outer);
                return outer;
            }
        }
        return null;
    }
    toJSON() {
        return {
            byOrder: this.byOrder.map((n) => n.toJSON()),
            byVar: Object.keys(this.byVar),
            byLP: this.byLP.size,
            outerGraph: this.outerGraph !== null,
            outerDeps: this.outerDeps.map((n) => n.toJSON()),
            outerMuts: this.outerMuts,
        };
    }
}
exports.DepGraph = DepGraph;
class DepNode {
    constructor(stmt, graph, isParam) {
        this.stmt = stmt.t.trim();
        this.upstream = [];
        this.downstream = [];
        this.closure = null;
        this.mutates = [];
        this.graph = graph;
        this.isParam = isParam || false; // if `isParam` is `true`, retains it. Otherwise, always at least `false`
        // if this node is a parameter declaration, don't do extra work
        if (this.isParam) {
            return;
        }
        if (stmt.has('declarations')) {
            let dec = stmt.get('declarations');
            if (dec.has('constdeclaration')) {
                dec = dec.get('constdeclaration');
            }
            else if (dec.has('letdeclaration')) {
                dec = dec.get('letdeclaration');
            }
            else {
                unhandled(dec, 'dec kind');
            }
            this.fromAssignment(dec);
        }
        else if (stmt.has('assignments')) {
            this.fromAssignment(stmt.get('assignments'));
        }
        else if (stmt.has('calls')) {
            this.fromCall(stmt.get('calls'));
        }
        else if (stmt.has('emits')) {
            const upstream = graph.getLastMutationFor(stmt.get('emits').get('value').t.trim());
            if (upstream !== null) {
                this.upstream.push(upstream);
                upstream.downstream.push(this);
            }
        }
        else if (stmt.has('exits')) {
            this.fromExit(stmt.get('exits'));
        }
        else {
            unhandled(stmt, 'node top-level');
        }
        this.upstream = [...new Set(this.upstream)];
        this.mutates = [...new Set(this.mutates)];
    }
    fromExit(assign) {
        if (assign.has('variable')) {
            const upstream = this.graph.getLastMutationFor(assign.get('variable').t.trim());
            if (upstream !== null) {
                this.upstream.push(upstream);
                upstream.downstream.push(this);
            }
        }
    }
    fromAssignment(assign) {
        // console.log(assign)
        if (!assign.has('assignables')) {
            unhandled(assign, 'non-assignment assignment?');
        }
        const decname = assign.get('decname').t.trim();
        // console.log(`decname: ${decname}`)
        const prev = this.graph.getLastMutationFor(decname);
        if (prev !== null) {
            this.upstream.push(prev);
        }
        this.mutates.push(decname);
        if (assign.get('fulltypename').t.trim() === 'function') {
            this.closure = new DepGraph(assign.get('assignables'), this.graph);
            // for closures, only add upstream since the closure isn't actually
            // evaluated until its called. this just makes it so that the actual
            // use-site of the closure can inherit the upstream dependencies.
            this.upstream.push(...this.closure.outerDeps);
            this.mutates.push(...this.closure.outerMuts);
        }
        else if (assign.has('assignables')) {
            if (prev !== null) {
                prev.downstream.push(this);
            }
            assign = assign.get('assignables');
            if (assign.has('calls')) {
                this.fromCall(assign.get('calls'));
            }
            else if (assign.has('value')) {
                // do nothing
            }
            else {
                unhandled(assign, 'assignable');
            }
        }
        else {
            unhandled(assign, 'non-assignable... assignable... ?');
        }
    }
    fromCall(call) {
        const opcodeName = call.get('variable').t.trim();
        const args = call
            .get('calllist')
            .getAll()
            .map((c) => c.get('variable'));
        const mutated = [];
        const opMutability = exports.opcodeParamMutabilities[opcodeName];
        if (opMutability === undefined || opMutability === null) {
            unhandled(opMutability, 'opcode ' + opcodeName);
        }
        for (let ii = 0; ii < opMutability.length; ii++) {
            if (opMutability[ii] === true) {
                mutated.push(args[ii].t.trim());
            }
            else if (opMutability[ii] === null) {
                // null indicates that the parameter expects a closure,
                // so the mutability of the overall call depends on the
                // mutability of the specified closure. Because of this,
                // we have to grab the node for the closure declaration
                // and use its mutabilities instead
                // the closure def will be the first node in the list
                const closure = this.graph.getLastMutationFor(args[ii].t.trim());
                if (closure.closure) {
                    if (closure === null || closure === undefined) {
                        unhandled(this.graph.byVar, `no nodes declared for ${args[ii].t.trim()}`);
                    }
                    mutated.push(...closure.mutates);
                }
                else if (closure.isParam) {
                    mutated.push(closure);
                }
                else {
                    unhandled(closure, 'expected to inherit mutations');
                }
            }
        }
        this.mutates.push(...mutated);
        // console.log('---')
        // console.log(this.stmt)
        for (const arg of args) {
            // console.log(arg)
            const upstream = this.graph.getLastMutationFor(arg.t.trim());
            // console.log(upstream)
            if (upstream !== null) {
                if (upstream.closure !== null) {
                    // if it's a closure, inherit the upstreams
                    this.upstream.push(...upstream.upstream);
                }
                else {
                    this.upstream.push(upstream);
                    upstream.downstream.push(this);
                }
            }
        }
    }
    toJSON() {
        let closure = null;
        if (this.closure)
            closure = this.closure.toJSON();
        return {
            stmt: this.stmt.replace(/\n/g, '\\n'),
            upstream: this.upstream.length,
            downstream: this.downstream.length,
            closure,
            mutates: this.mutates,
        };
    }
}
exports.DepNode = DepNode;
exports.opcodeParamMutabilities = {
    i8f64: [false],
    i16f64: [false],
    i32f64: [false],
    i64f64: [false],
    f32f64: [false],
    strf64: [false],
    boolf64: [false],
    i8f32: [false],
    i16f32: [false],
    i32f32: [false],
    i64f32: [false],
    f64f32: [false],
    strf32: [false],
    boolf32: [false],
    i8i64: [false],
    i16i64: [false],
    i32i64: [false],
    f32i64: [false],
    f64i64: [false],
    stri64: [false],
    booli64: [false],
    i8i32: [false],
    i16i32: [false],
    i64i32: [false],
    f32i32: [false],
    f64i32: [false],
    stri32: [false],
    booli32: [false],
    i8i16: [false],
    i32i16: [false],
    i64i16: [false],
    f32i16: [false],
    f64i16: [false],
    stri16: [false],
    booli16: [false],
    i16i8: [false],
    i32i8: [false],
    i64i8: [false],
    f32i8: [false],
    f64i8: [false],
    stri8: [false],
    booli8: [false],
    i8bool: [false],
    i16bool: [false],
    i32bool: [false],
    i64bool: [false],
    f32bool: [false],
    f64bool: [false],
    strbool: [false],
    i8str: [false],
    i16str: [false],
    i32str: [false],
    i64str: [false],
    f32str: [false],
    f64str: [false],
    boolstr: [false],
    addi8: [false, false],
    addi16: [false, false],
    addi32: [false, false],
    addi64: [false, false],
    addf32: [false, false],
    addf64: [false, false],
    subi8: [false, false],
    subi16: [false, false],
    subi32: [false, false],
    subi64: [false, false],
    subf32: [false, false],
    subf64: [false, false],
    negi8: [false, false],
    negi16: [false, false],
    negi32: [false, false],
    negi64: [false, false],
    negf32: [false, false],
    negf64: [false, false],
    absi8: [false, false],
    absi16: [false, false],
    absi32: [false, false],
    absi64: [false, false],
    absf32: [false, false],
    absf64: [false, false],
    muli8: [false, false],
    muli16: [false, false],
    muli32: [false, false],
    muli64: [false, false],
    mulf32: [false, false],
    mulf64: [false, false],
    divi8: [false, false],
    divi16: [false, false],
    divi32: [false, false],
    divi64: [false, false],
    divf32: [false, false],
    divf64: [false, false],
    modi8: [false, false],
    modi16: [false, false],
    modi32: [false, false],
    modi64: [false, false],
    powi8: [false, false],
    powi16: [false, false],
    powi32: [false, false],
    powi64: [false, false],
    powf32: [false, false],
    powf64: [false, false],
    sqrtf32: [false, false],
    sqrtf64: [false, false],
    saddi8: [false, false],
    saddi16: [false, false],
    saddi32: [false, false],
    saddi64: [false, false],
    saddf32: [false, false],
    saddf64: [false, false],
    ssubi8: [false, false],
    ssubi16: [false, false],
    ssubi32: [false, false],
    ssubi64: [false, false],
    ssubf32: [false, false],
    ssubf64: [false, false],
    snegi8: [false, false],
    snegi16: [false, false],
    snegi32: [false, false],
    snegi64: [false, false],
    snegf32: [false, false],
    snegf64: [false, false],
    sabsi8: [false, false],
    sabsi16: [false, false],
    sabsi32: [false, false],
    sabsi64: [false, false],
    sabsf32: [false, false],
    sabsf64: [false, false],
    smuli8: [false, false],
    smuli16: [false, false],
    smuli32: [false, false],
    smuli64: [false, false],
    smulf32: [false, false],
    smulf64: [false, false],
    sdivi8: [false, false],
    sdivi16: [false, false],
    sdivi32: [false, false],
    sdivi64: [false, false],
    sdivf32: [false, false],
    sdivf64: [false, false],
    spowi8: [false, false],
    spowi16: [false, false],
    spowi32: [false, false],
    spowi64: [false, false],
    spowf32: [false, false],
    spowf64: [false, false],
    andi8: [false, false],
    andi16: [false, false],
    andi32: [false, false],
    andi64: [false, false],
    andbool: [false, false],
    ori8: [false, false],
    ori16: [false, false],
    ori32: [false, false],
    ori64: [false, false],
    orbool: [false, false],
    xori8: [false, false],
    xori16: [false, false],
    xori32: [false, false],
    xori64: [false, false],
    xorbool: [false, false],
    noti8: [false, false],
    noti16: [false, false],
    noti32: [false, false],
    noti64: [false, false],
    notbool: [false, false],
    nandi8: [false, false],
    nandi16: [false, false],
    nandi32: [false, false],
    nandi64: [false, false],
    nandboo: [false, false],
    nori8: [false, false],
    nori16: [false, false],
    nori32: [false, false],
    nori64: [false, false],
    norbool: [false, false],
    xnori8: [false, false],
    xnori16: [false, false],
    xnori32: [false, false],
    xnori64: [false, false],
    xnorboo: [false, false],
    eqi8: [false, false],
    eqi16: [false, false],
    eqi32: [false, false],
    eqi64: [false, false],
    eqf32: [false, false],
    eqf64: [false, false],
    eqbool: [false, false],
    eqstr: [false, false],
    neqi8: [false, false],
    neqi16: [false, false],
    neqi32: [false, false],
    neqi64: [false, false],
    neqf32: [false, false],
    neqf64: [false, false],
    neqbool: [false, false],
    neqstr: [false, false],
    lti8: [false, false],
    lti16: [false, false],
    lti32: [false, false],
    lti64: [false, false],
    ltf32: [false, false],
    ltf64: [false, false],
    ltstr: [false, false],
    ltei8: [false, false],
    ltei16: [false, false],
    ltei32: [false, false],
    ltei64: [false, false],
    ltef32: [false, false],
    ltef64: [false, false],
    ltestr: [false, false],
    gti8: [false, false],
    gti16: [false, false],
    gti32: [false, false],
    gti64: [false, false],
    gtf32: [false, false],
    gtf64: [false, false],
    gtstr: [false, false],
    gtei8: [false, false],
    gtei16: [false, false],
    gtei32: [false, false],
    gtei64: [false, false],
    gtef32: [false, false],
    gtef64: [false, false],
    gtestr: [false, false],
    httpreq: [false],
    httplsn: [false],
    httpsend: [false],
    execop: [false],
    waitop: [false],
    syncop: [false, false],
    catstr: [false, false],
    catarr: [false, false],
    split: [false, false],
    repstr: [false, false],
    reparr: [false, false],
    matches: [false, false],
    indstr: [false, false],
    indarrf: [false, false],
    indarrv: [false, false],
    lenstr: [false],
    lenarr: [false],
    trim: [false],
    condfn: [false, null],
    pusharr: [true, false, false],
    pushf: [true, false],
    pushv: [true, false],
    poparr: [true],
    delindx: [true, false],
    each: [false, null],
    eachl: [false, null],
    map: [false, null],
    mapl: [false, null],
    reducel: [false, null],
    reducep: [false, null],
    foldl: [false, null],
    foldp: [false, null],
    filter: [false, null],
    filterl: [false, null],
    find: [false, null],
    findl: [false, null],
    every: [false, null],
    everyl: [false, null],
    some: [false, null],
    somel: [false, null],
    join: [false, false],
    newarr: [false],
    stdoutp: [false],
    stderrp: [false],
    exitop: [false],
    copyfrom: [false, false],
    copytof: [true, false, false],
    copytov: [true, false, false],
    register: [false, false],
    copyi8: [false],
    copyi16: [false],
    copyi32: [false],
    copyi64: [false],
    copyvoid: [false],
    copyf32: [false],
    copyf64: [false],
    copybool: [false],
    copystr: [false],
    copyarr: [false],
    zeroed: [],
    lnf64: [false],
    logf64: [false],
    sinf64: [false],
    cosf64: [false],
    tanf64: [false],
    asinf64: [false],
    acosf64: [false],
    atanf64: [false],
    sinhf64: [false],
    coshf64: [false],
    tanhf64: [false],
    error: [false],
    reff: [false],
    refv: [false],
    noerr: [],
    errorstr: [false],
    someM: [false, false],
    noneM: [],
    // TODO: RFC-12 might impact these:
    isSome: [false],
    isNone: [false],
    getOrM: [false, false],
    getMaybe: [false],
    okR: [false, false],
    err: [false],
    isOk: [false],
    isErr: [false],
    getOrR: [false, false],
    getOrRS: [false, false],
    getR: [false],
    getErr: [false, false],
    resfrom: [false, false],
    mainE: [false, false],
    altE: [false, false],
    isMain: [false],
    isAlt: [false],
    mainOr: [false, false],
    altOr: [false, false],
    getMain: [false],
    getAlt: [false],
    hashf: [false],
    hashv: [false],
    dssetf: [true, false, false],
    dssetv: [true, false, false],
    dshas: [false, false],
    dsdel: [true, false],
    dsgetf: [false, false],
    dsgetv: [false, false],
    getcs: [],
    newseq: [false],
    seqnext: [false],
    seqeach: [false, null],
    seqwhile: [false, null, null],
    seqdo: [false, null],
    selfrec: [false, false],
    seqrec: [false, null],
    tcptun: [false],
};

},{"../lp":22}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromString = exports.fromFile = void 0;
const lp_1 = require("../lp");
const amm_1 = require("../amm");
const depgraph_1 = require("./depgraph");
const aga_1 = require("./aga");
// This project depends on BigNum and associated support in Node's Buffer, so must be >= Node 10.20
// and does not work in the browser. It would be possible to implement a browser-compatible version
// but there is no need for it and it would make it harder to work with.
const ceil8 = (n) => Math.ceil(n / 8) * 8;
const CLOSURE_ARG_MEM_START = BigInt(Math.pow(-2, 63));
// special closure that does nothing
const NOP_CLOSURE = BigInt('-9223372036854775808');
const loadGlobalMem = (globalMemAst, addressMap) => {
    const suffixes = {
        int64: 'i64',
        int32: 'i32',
        int16: 'i16',
        int8: 'i8',
        float64: 'f64',
        float32: 'f32',
    };
    const globalMem = {};
    let currentOffset = -1;
    for (const globalConst of globalMemAst) {
        const rec = globalConst.get();
        if (!(rec instanceof lp_1.NamedAnd))
            continue;
        let offset = 8;
        let val = rec.get('assignables').t.trim();
        const typename = rec.get('fulltypename').t.trim();
        if (typename === 'string') {
            let str;
            try {
                // Will fail on strings with escape chars
                str = JSON.parse(val);
            }
            catch (e) {
                // Hackery to get these strings to work
                str = JSON.stringify(val.replace(/^["']/, '').replace(/["']$/, ''));
            }
            offset = ceil8(str.length) + 8;
        }
        else if (suffixes.hasOwnProperty(typename)) {
            val += suffixes[typename];
        }
        else if (typename !== 'bool') {
            throw new Error(rec.get('fulltypename').t + ' not yet implemented');
        }
        globalMem[`@${currentOffset}`] = val;
        addressMap[rec.get('decname').t] = currentOffset;
        currentOffset -= offset;
    }
    return globalMem;
};
const loadEventDecs = (eventAst) => {
    const eventMem = {};
    for (const evt of eventAst) {
        const rec = evt.get();
        if (!(rec instanceof lp_1.NamedAnd))
            continue;
        const evtName = rec.get('variable').t.trim();
        const evtSize = rec.get('fulltypename').t.trim() === 'void'
            ? 0
            : [
                'int8',
                'int16',
                'int32',
                'int64',
                'float32',
                'float64',
                'bool',
            ].includes(rec.get('fulltypename').t.trim())
                ? 8
                : -1;
        eventMem[evtName] = evtSize;
    }
    return eventMem;
};
const getFunctionbodyMem = (functionbody) => {
    let memSize = 0;
    const addressMap = {};
    for (const statement of functionbody.get('statements').getAll()) {
        if (statement.has('declarations')) {
            if (statement.get('declarations').has('constdeclaration')) {
                if (statement
                    .get('declarations')
                    .get('constdeclaration')
                    .get('assignables')
                    .has('functions')) {
                    // Because closures re-use their parent memory space, their own memory needs to be included
                    const closureMem = getFunctionbodyMem(statement
                        .get('declarations')
                        .get('constdeclaration')
                        .get('assignables')
                        .get('functions')
                        .get('functionbody'));
                    Object.keys(closureMem.addressMap).forEach((name) => (addressMap[name] = closureMem.addressMap[name] + memSize));
                    memSize += closureMem.memSize;
                }
                else {
                    addressMap[statement
                        .get('declarations')
                        .get('constdeclaration')
                        .get('decname')
                        .t.trim()] = memSize;
                    memSize += 1;
                }
            }
            else {
                addressMap[statement
                    .get('declarations')
                    .get('letdeclaration')
                    .get('decname')
                    .t.trim()] = memSize;
                memSize += 1;
            }
        }
    }
    return {
        memSize,
        addressMap,
    };
};
const getHandlersMem = (handlers) => handlers
    .map((h) => h.get())
    .filter((h) => h instanceof lp_1.NamedAnd)
    .map((handler) => {
    const handlerMem = getFunctionbodyMem(handler.get('functions').get('functionbody'));
    let arg = handler.get('functions').get('args').get(0).get(0).get('arg');
    if (arg instanceof lp_1.NulLP) {
        arg = handler.get('functions').get('args').get(1).get('arg');
    }
    if (!(arg instanceof lp_1.NulLP)) {
        // Increase the memory usage and shift *everything* down, then add the new address
        handlerMem.memSize += 1;
        Object.keys(handlerMem.addressMap).forEach((name) => (handlerMem.addressMap[name] += 1));
        handlerMem.addressMap[arg.get('variable').t.trim()] = 0;
    }
    return handlerMem;
});
const closuresFromDeclaration = (declaration, closureMem, eventDecs, addressMap, 
// For each scope branch, determine a unique argument rereference so nested scopes can access
// parent scope arguments
argRerefOffset, scope, depGraph) => {
    const name = declaration.get('constdeclaration').get('decname').t.trim();
    if (depGraph.byVar[name] === null ||
        depGraph.byVar[name] === undefined ||
        depGraph.byVar[name].length === 0 ||
        depGraph.byVar[name][0].closure === null) {
        throw new Error('trying to build a closure, but the dependency graph did not build a closure');
    }
    const graph = depGraph.byVar[name][0].closure;
    const fn = declaration
        .get('constdeclaration')
        .get('assignables')
        .get('functions');
    let fnArgs = [];
    fn.get('args')
        .getAll()[0]
        .getAll()
        .forEach((argdef) => {
        fnArgs.push(argdef.get('arg').get('variable').t);
    });
    if (fn.get('args').getAll()[1].has()) {
        fnArgs.push(...fn
            .get('args')
            .getAll()[1]
            .getAll()
            .map((t) => t.get('variable').t));
        fnArgs = fnArgs.filter((t) => t !== '');
    }
    fnArgs.forEach((arg) => {
        addressMap[arg + name] = CLOSURE_ARG_MEM_START + BigInt(argRerefOffset);
        argRerefOffset++;
    });
    const allStatements = declaration
        .get('constdeclaration')
        .get('assignables')
        .get('functions')
        .get('functionbody')
        .get('statements')
        .getAll();
    const statements = allStatements.filter((statement) => !(statement.has('declarations') &&
        statement.get('declarations').has('constdeclaration') &&
        statement
            .get('declarations')
            .get('constdeclaration')
            .get('assignables')
            .has('functions')));
    const otherClosures = allStatements
        .filter((statement) => statement.has('declarations') &&
        statement.get('declarations').has('constdeclaration') &&
        statement
            .get('declarations')
            .get('constdeclaration')
            .get('assignables')
            .has('functions'))
        .map((s) => closuresFromDeclaration(s.get('declarations'), closureMem, eventDecs, addressMap, argRerefOffset, [name, ...scope], // Newest scope gets highest priority
    graph))
        .filter((clos) => clos !== null)
        .reduce((obj, rec) => ({
        ...obj,
        ...rec,
    }), {});
    eventDecs[name] = 0;
    if (!graph.isNop) {
        otherClosures[name] = {
            name,
            fn,
            statements,
            closureMem,
            scope: [name, ...scope],
            graph,
        };
    }
    else {
        addressMap[name] = NOP_CLOSURE;
    }
    return otherClosures;
};
const extractClosures = (handlers, handlerMem, eventDecs, addressMap, depGraphs) => {
    let closures = {};
    const recs = handlers.filter((h) => h.get() instanceof lp_1.NamedAnd);
    for (let i = 0; i < recs.length; i++) {
        const rec = recs[i].get();
        const closureMem = handlerMem[i];
        const handlerGraph = depGraphs[i];
        for (const statement of rec
            .get('functions')
            .get('functionbody')
            .get('statements')
            .getAll()) {
            if (statement.has('declarations') &&
                statement.get('declarations').has('constdeclaration') &&
                statement
                    .get('declarations')
                    .get('constdeclaration')
                    .get('assignables')
                    .has('functions')) {
                // It's a closure, first try to extract any inner closures it may have
                const innerClosures = closuresFromDeclaration(statement.get('declarations'), closureMem, eventDecs, addressMap, 5, [], handlerGraph);
                closures = {
                    ...closures,
                    ...innerClosures,
                };
            }
        }
    }
    return Object.values(closures);
};
const loadStatements = (statements, localMem, globalMem, fn, fnName, isClosure, closureScope, depGraph) => {
    const vec = [];
    let line = 0;
    const localMemToLine = {};
    statements = statements.filter((s) => !s.has('whitespace'));
    let fnArgs = [];
    fn.get('args')
        .getAll()[0]
        .getAll()
        .forEach((argdef) => {
        fnArgs.push(argdef.get('arg').get('variable').t);
    });
    if (fn.get('args').getAll()[1].has()) {
        fnArgs.push(...fn
            .get('args')
            .getAll()[1]
            .getAll()
            .map((t) => t.get('variable').t));
        fnArgs = fnArgs.filter((t) => t !== '');
    }
    fnArgs.forEach((arg, i) => {
        if (globalMem.hasOwnProperty(arg + fnName)) {
            const resultAddress = globalMem[arg + fnName];
            const val = CLOSURE_ARG_MEM_START + BigInt(1) + BigInt(i);
            const s = new aga_1.Statement('refv', [`@${val}`, '@0'], `@${resultAddress}`, line, [], depGraph.params[arg] || null);
            vec.push(s);
            line += 1;
        }
    });
    for (let idx = 0; idx < statements.length; idx++) {
        const statement = statements[idx];
        if (statement.has('declarations') &&
            statement.get('declarations').has('constdeclaration') &&
            statement
                .get('declarations')
                .get('constdeclaration')
                .get('assignables')
                .has('functions')) {
            // It's a closure, skip it
            continue;
        }
        const node = depGraph.byLP.get(statement);
        const hasClosureArgs = isClosure && fnArgs.length > 0;
        let s;
        if (statement.has('declarations')) {
            const dec = statement.get('declarations').has('constdeclaration')
                ? statement.get('declarations').get('constdeclaration')
                : statement.get('declarations').get('letdeclaration');
            const resultAddress = localMem[dec.get('decname').t.trim()];
            localMemToLine[dec.get('decname').t.trim()] = line;
            const assignables = dec.get('assignables');
            if (assignables.has('functions')) {
                throw new Error("This shouldn't be possible!");
            }
            else if (assignables.has('calls')) {
                const call = assignables.get('calls');
                const fnName = call.get('variable').t.trim();
                const vars = (call.has('calllist') ? call.get('calllist').getAll() : []).map((v) => v.get('variable').t.trim());
                const args = vars
                    .map((v) => {
                    if (localMem.hasOwnProperty(v)) {
                        return localMem[v];
                    }
                    else if (globalMem.hasOwnProperty(v)) {
                        return globalMem[v];
                    }
                    else if (Object.keys(globalMem).some((k) => closureScope.map((s) => v + s).includes(k))) {
                        return globalMem[closureScope
                            .map((s) => v + s)
                            .find((k) => Object.keys(globalMem).includes(k))];
                    }
                    else if (hasClosureArgs) {
                        return (CLOSURE_ARG_MEM_START + BigInt(1) + BigInt(fnArgs.indexOf(v)));
                    }
                    else {
                        return v;
                    }
                })
                    .map((a) => (typeof a === 'string' ? a : `@${a}`));
                while (args.length < 2)
                    args.push('@0');
                s = new aga_1.Statement(fnName, args, `@${resultAddress}`, line, [], node);
            }
            else if (assignables.has('value')) {
                // Only required for `let` statements
                let fn;
                let val;
                switch (dec.get('fulltypename').t.trim()) {
                    case 'int64':
                        fn = 'seti64';
                        val = assignables.t + 'i64';
                        break;
                    case 'int32':
                        fn = 'seti32';
                        val = assignables.t + 'i32';
                        break;
                    case 'int16':
                        fn = 'seti16';
                        val = assignables.t + 'i16';
                        break;
                    case 'int8':
                        fn = 'seti8';
                        val = assignables.t + 'i8';
                        break;
                    case 'float64':
                        fn = 'setf64';
                        val = assignables.t + 'f64';
                        break;
                    case 'float32':
                        fn = 'setf32';
                        val = assignables.t + 'f32';
                        break;
                    case 'bool':
                        fn = 'setbool';
                        val = assignables.t === 'true' ? '1i8' : '0i8'; // Bools are bytes in the runtime
                        break;
                    case 'string':
                        fn = 'setestr';
                        val = '0i64';
                        break;
                    default:
                        throw new Error(`Unsupported variable type ${dec.get('fulltypename').t}`);
                }
                s = new aga_1.Statement(fn, [val, '@0'], `@${resultAddress}`, line, [], node);
            }
            else if (assignables.has('variable')) {
                throw new Error('This should have been squashed');
            }
        }
        else if (statement.has('assignments')) {
            const asgn = statement.get('assignments');
            const resultAddress = localMem[asgn.get('decname').t.trim()];
            localMemToLine[resultAddress] = line;
            const assignables = asgn.get('assignables');
            if (assignables.has('functions')) {
                throw new Error("This shouldn't be possible!");
            }
            else if (assignables.has('calls')) {
                const call = assignables.get('calls');
                const fnName = call.get('variable').t.trim();
                const vars = (call.has('calllist') ? call.get('calllist').getAll() : []).map((v) => v.get('variable').t.trim());
                const hasClosureArgs = isClosure && vars.length > 0;
                const args = vars
                    .map((v) => {
                    if (localMem.hasOwnProperty(v)) {
                        return localMem[v];
                    }
                    else if (globalMem.hasOwnProperty(v)) {
                        return globalMem[v];
                    }
                    else if (Object.keys(globalMem).some((k) => closureScope.map((s) => v + s).includes(k))) {
                        return globalMem[closureScope
                            .map((s) => v + s)
                            .find((k) => Object.keys(globalMem).includes(k))];
                    }
                    else if (hasClosureArgs) {
                        return (CLOSURE_ARG_MEM_START + BigInt(1) + BigInt(fnArgs.indexOf(v)));
                    }
                    else
                        return v;
                })
                    .map((a) => (typeof a === 'string' ? a : `@${a}`));
                while (args.length < 2)
                    args.push('@0');
                s = new aga_1.Statement(fnName, args, `@${resultAddress}`, line, [], node);
            }
            else if (assignables.has('value')) {
                // Only required for `let` statements
                let fn;
                let val;
                // TODO: Relying on little-endian trimming integers correctly and doesn't support float32
                // correctly. Need to find the correct type data from the original variable.
                const valStr = assignables.t;
                if (valStr[0] === '"' || valStr[0] === "'") {
                    // It's a string, which doesn't work here...
                    fn = 'setestr';
                    val = '0i64';
                }
                else if (valStr[0] === 't' || valStr[0] === 'f') {
                    // It's a bool
                    fn = 'setbool';
                    val = assignables.t === 'true' ? '1i8' : '0i8'; // Bools are bytes in the runtime
                }
                else if (valStr.indexOf('.') > -1) {
                    // It's a floating point number, assume 64-bit
                    fn = 'setf64';
                    val = valStr + 'f64';
                }
                else {
                    // It's an integer. i64 will "work" for now
                    fn = 'seti64';
                    val = valStr + 'i64';
                }
                s = new aga_1.Statement(fn, [val, '@0'], `@${resultAddress}`, line, [], node);
            }
            else if (assignables.has('variable')) {
                throw new Error('This should have been squashed');
            }
        }
        else if (statement.has('calls')) {
            const call = statement.get('calls');
            const fnName = call.get('variable').t.trim();
            const vars = (call.has('calllist') ? call.get('calllist').getAll() : []).map((v) => v.get('variable').t.trim());
            const hasClosureArgs = isClosure && vars.length > 0;
            const args = vars
                .map((v) => {
                if (localMem.hasOwnProperty(v)) {
                    return localMem[v];
                }
                else if (globalMem.hasOwnProperty(v)) {
                    return globalMem[v];
                }
                else if (Object.keys(globalMem).some((k) => closureScope.map((s) => v + s).includes(k))) {
                    return globalMem[closureScope
                        .map((s) => v + s)
                        .find((k) => Object.keys(globalMem).includes(k))];
                }
                else if (hasClosureArgs) {
                    return (CLOSURE_ARG_MEM_START + BigInt(1) + BigInt(fnArgs.indexOf(v)));
                }
                else
                    return v;
            })
                .map((a) => (typeof a === 'string' ? a : `@${a}`));
            while (args.length < 3)
                args.push('@0');
            s = new aga_1.Statement(fnName, args, null, line, [], node);
        }
        else if (statement.has('emits')) {
            const emit = statement.get('emits');
            const evtName = emit.get('variable').t.trim();
            const payloadVar = emit.has('value')
                ? emit.get('value').t.trim()
                : undefined;
            const payload = !payloadVar
                ? 0
                : localMem.hasOwnProperty(payloadVar)
                    ? localMem[payloadVar]
                    : globalMem.hasOwnProperty(payloadVar)
                        ? globalMem[payloadVar]
                        : payloadVar;
            s = new aga_1.Statement('emit', [evtName, typeof payload === 'string' ? payload : `@${payload}`], null, line, [], node);
        }
        else if (statement.has('exits')) {
            const exit = statement.get('exits');
            const exitVar = exit.get('variable').t.trim();
            const exitVarType = localMem.hasOwnProperty(exitVar)
                ? 'variable'
                : globalMem.hasOwnProperty(exitVar) &&
                    typeof globalMem[exitVar] !== 'string'
                    ? 'fixed'
                    : 'variable';
            const vars = [exitVar];
            const args = vars
                .map((v) => {
                if (localMem.hasOwnProperty(v)) {
                    return localMem[v];
                }
                else if (globalMem.hasOwnProperty(v)) {
                    return globalMem[v];
                }
                else if (Object.keys(globalMem).some((k) => closureScope.map((s) => v + s).includes(k))) {
                    return globalMem[closureScope
                        .map((s) => v + s)
                        .find((k) => Object.keys(globalMem).includes(k))];
                }
                else if (hasClosureArgs) {
                    return (CLOSURE_ARG_MEM_START + BigInt(1) + BigInt(fnArgs.indexOf(v)));
                }
                else
                    return v;
            })
                .map((a) => (typeof a === 'string' ? a : `@${a}`));
            while (args.length < 2)
                args.push('@0');
            const ref = exitVarType === 'variable' ? 'refv' : 'reff';
            s = new aga_1.Statement(ref, args, `@${CLOSURE_ARG_MEM_START}`, line, [], node);
        }
        vec.push(s);
        line += 1;
    }
    return vec;
};
const loadHandlers = (handlers, handlerMem, globalMem, depGraphs) => {
    const vec = [];
    const recs = handlers.filter((h) => h.get() instanceof lp_1.NamedAnd);
    for (let i = 0; i < recs.length; i++) {
        const handler = recs[i].get();
        const eventName = handler.get('variable').t.trim();
        const memSize = handlerMem[i].memSize;
        const localMem = handlerMem[i].addressMap;
        const h = new aga_1.Block('handler', eventName, memSize, loadStatements(handler.get('functions').get('functionbody').get('statements').getAll(), localMem, globalMem, handler.get('functions'), eventName, false, [], depGraphs[i]), []);
        vec.push(h);
    }
    return vec;
};
const loadClosures = (closures, globalMem) => {
    const vec = [];
    for (let i = 0; i < closures.length; i++) {
        const closure = closures[i];
        const eventName = closure.name;
        const memSize = closure.closureMem.memSize;
        const localMem = closure.closureMem.addressMap;
        const c = new aga_1.Block('closure', eventName, memSize, loadStatements(closure.statements, localMem, globalMem, closure.fn, eventName, true, closure.scope, closure.graph), []);
        vec.push(c);
    }
    return vec;
};
const ammToAga = (amm) => {
    // Declare the AGA header
    let outStr = 'Alan Graphcode Assembler v0.0.1\n\n';
    // Get the global memory and the memory address map (var name to address ID)
    const addressMap = {};
    const globalMem = loadGlobalMem(amm.get('globalMem').getAll(), addressMap);
    if (Object.keys(globalMem).length > 0) {
        // Output the global memory
        outStr += 'globalMem\n';
        Object.keys(globalMem).forEach((addr) => (outStr += `  ${addr}: ${globalMem[addr]}\n`));
        outStr += '\n';
    }
    // Load the events, get the event id offset (for reuse with closures) and the event declarations
    const eventDecs = loadEventDecs(amm.get('eventDec').getAll());
    // Determine the amount of memory to allocate per handler and map declarations to addresses
    const handlerMem = getHandlersMem(amm.get('handlers').getAll());
    const depGraphs = [];
    for (let handler of amm.get('handlers').getAll()) {
        handler = handler.get();
        if (handler instanceof lp_1.NamedAnd) {
            depGraphs.push(new depgraph_1.DepGraph(handler));
        }
    }
    // console.log(depGraphs.map(g => JSON.stringify(g.toJSON())).join(','))
    const closures = extractClosures(amm.get('handlers').getAll(), handlerMem, eventDecs, addressMap, depGraphs);
    // Make sure closures are accessible as addresses for statements to use
    closures.forEach((c) => {
        if (addressMap[c.name] !== NOP_CLOSURE) {
            addressMap[c.name] = c.name;
        }
    });
    // Then output the custom events, which may include closures, if needed
    if (Object.keys(eventDecs).length > 0) {
        outStr += 'customEvents\n';
        Object.keys(eventDecs).forEach((evt) => (outStr += `  ${evt}: ${eventDecs[evt]}\n`));
        outStr += '\n';
    }
    // Load the handlers and load the closures (as handlers) if present
    const handlerVec = loadHandlers(amm.get('handlers').getAll(), handlerMem, addressMap, depGraphs);
    const closureVec = loadClosures(closures, addressMap);
    [...handlerVec, ...closureVec].map((b) => b.build());
    // console.log(([...handlerVec, ...closureVec]).map(b => b.build()).join(','))
    const blockVec = [...handlerVec, ...closureVec].map((b) => b.toString());
    outStr += blockVec.join('\n');
    return outStr;
};
exports.fromFile = (filename) => {
    const lp = new lp_1.LP(filename);
    const ast = amm_1.default.apply(lp);
    if (ast instanceof lp_1.LPError) {
        throw new Error(ast.msg);
    }
    return ammToAga(ast);
};
exports.fromString = (str) => {
    const lp = lp_1.LP.fromText(str);
    const ast = amm_1.default.apply(lp);
    if (ast instanceof lp_1.LPError) {
        throw new Error(ast.msg);
    }
    return ammToAga(ast);
};

},{"../amm":3,"../lp":22,"./aga":4,"./depgraph":5}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromString = exports.fromFile = void 0;
const alan_js_runtime_1 = require("alan-js-runtime");
const lp_1 = require("./lp");
const amm_1 = require("./amm");
const callToJsText = (call) => {
    const args = call.has('calllist')
        ? call
            .get('calllist')
            .getAll()
            .map((r) => r.get('variable').t)
            .join(', ')
        : '';
    const opcode = call.get('variable').t;
    return alan_js_runtime_1.asyncopcodes.includes(opcode)
        ? `await r.${opcode}(${args})`
        : `r.${opcode}(${args})`;
};
const functionbodyToJsText = (fnbody, indent) => {
    let outText = '';
    for (const statement of fnbody.get('statements').getAll()) {
        outText += indent + '  '; // For legibility of the output
        if (statement.has('declarations')) {
            if (statement.get('declarations').has('constdeclaration')) {
                const dec = statement.get('declarations').get('constdeclaration');
                outText += `const ${dec.get('decname').t} = ${assignableToJsText(dec.get('assignables'), dec.get('fulltypename'), indent)}\n`;
            }
            else if (statement.get('declarations').has('letdeclaration')) {
                const dec = statement.get('declarations').get('letdeclaration');
                outText += `let ${dec.get('decname').t} = ${assignableToJsText(dec.get('assignables'), dec.get('fulltypename'), indent)}\n`;
            }
        }
        else if (statement.has('assignments')) {
            const assign = statement.get('assignments');
            outText += `${assign.get('decname').t} = ${assignableToJsText(assign.get('assignables'), assign.get('fulltypename'), indent)}\n`;
        }
        else if (statement.has('calls')) {
            outText += `${callToJsText(statement.get('calls'))}\n`;
        }
        else if (statement.has('emits')) {
            const emit = statement.get('emits');
            const name = emit.get('variable').t;
            const arg = emit.has('value')
                ? emit.get('value').get('variable').t
                : 'undefined';
            outText += `r.emit('${name}', ${arg})\n`;
        }
        else if (statement.has('exits')) {
            outText += `${statement.get('exits').t.trim()}\n`;
        }
    }
    return outText;
};
const assignableToJsText = (assignable, fulltypename, indent) => {
    let outText = '';
    if (assignable.has('functions')) {
        const args = assignable.get('functions').get('args');
        const argnames = [];
        for (const arg of args.get(0).getAll()) {
            argnames.push(arg.get('arg').get('variable').t);
        }
        if (args.get(1)) {
            argnames.push(args.get(1).get('arg').get('variable').t);
        }
        outText += `async (${argnames.join(', ')}) => {\n`;
        outText += functionbodyToJsText(assignable.get('functions').get('functionbody'), indent + '  ');
        outText += indent + '  }'; // End this closure
    }
    else if (assignable.has('calls')) {
        outText += callToJsText(assignable.get('calls'));
    }
    else if (assignable.has('variable')) {
        outText += assignable.get('variable').t;
    }
    else if (assignable.has('value')) {
        outText += assignable.get('value').t;
        try {
            const t = assignable.get('value').t;
            if (!/"/.test(t) && t !== 'true' && t !== 'false' && !/\./.test(t)) {
                parseInt(assignable.get('value').t);
                if (fulltypename.t.trim() === 'int64') {
                    outText += 'n';
                }
            }
        }
        catch (e) { } // eslint-disable-line no-empty
    }
    return outText;
};
const ammToJsText = (amm) => {
    let outFile = "const r = require('alan-js-runtime')\n";
    // Where we're going we don't need types, so skipping that entire section
    // First convert all of the global constants to javascript
    for (const globalConst of amm.get('globalMem').getAll()) {
        const rec = globalConst.get();
        if (!(rec instanceof lp_1.NamedAnd))
            continue;
        outFile += `const ${rec.get('decname').t} = ${assignableToJsText(rec.get('assignables'), rec.get('fulltypename'), '')}\n`;
    }
    // We can also skip the event declarations because they are lazily bound by EventEmitter
    // Now we convert the handlers to Javascript. This is the vast majority of the work
    let hasConn = false;
    let hasTcpConn = false;
    for (const handler of amm.get('handlers').getAll()) {
        const rec = handler.get();
        if (!(rec instanceof lp_1.NamedAnd))
            continue;
        let arg = rec.get('functions').get('args').get(0).get(0).get('arg');
        if (arg instanceof lp_1.NulLP) {
            arg = rec.get('functions').get('args').get(1).get('arg');
        }
        const eventVarName = !(arg instanceof lp_1.NulLP) ? arg.get('variable').t : '';
        if (rec.get('variable').t === '__conn')
            hasConn = true;
        if (rec.get('variable').t === '__ctrl')
            throw new Error('AVM Control Port unavailable in JS');
        if (rec.get('variable').t === 'tcpConn')
            hasTcpConn = true;
        outFile += `r.on('${rec.get('variable').t}', async (${eventVarName}) => {\n`;
        outFile += functionbodyToJsText(rec.get('functions').get('functionbody'), '');
        outFile += '})\n'; // End this handler
    }
    if (hasConn)
        outFile += "r.on('_start', () => r.httplsn())\n"; // Make sure a web server starts up
    if (hasTcpConn)
        outFile += "r.on('_start', () => r.tcplsn())\n"; // Make sure a server starts up
    outFile += "r.emit('_start', undefined)\n"; // Let's get it started in here
    return outFile;
};
exports.fromFile = (filename) => {
    const lp = new lp_1.LP(filename);
    const ast = amm_1.default.apply(lp);
    if (ast instanceof lp_1.LPError) {
        throw new Error(ast.msg);
    }
    return ammToJsText(ast);
};
exports.fromString = (str) => {
    const lp = lp_1.LP.fromText(str);
    const ast = amm_1.default.apply(lp);
    if (ast instanceof lp_1.LPError) {
        throw new Error(ast.msg);
    }
    return ammToJsText(ast);
};

},{"./amm":3,"./lp":22,"alan-js-runtime":"alan-js-runtime"}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ln = exports.statement = exports.functions = exports.assignables = exports.fulltypename = void 0;
const lp_1 = require("./lp");
// Defining LN Tokens
const space = lp_1.Token.build(' ');
const blank = lp_1.OneOrMore.build(space);
const optblank = lp_1.ZeroOrOne.build(blank);
const newline = lp_1.Or.build([lp_1.Token.build('\n'), lp_1.Token.build('\r')]);
const notnewline = lp_1.Not.build('\n');
const singlelinecomment = lp_1.And.build([
    lp_1.Token.build('//'),
    lp_1.ZeroOrMore.build(notnewline),
    newline,
]);
const star = lp_1.Token.build('*');
const notstar = lp_1.Not.build('*');
const notslash = lp_1.Not.build('/');
const multilinecomment = lp_1.And.build([
    lp_1.Token.build('/*'),
    lp_1.ZeroOrMore.build(lp_1.Or.build([notstar, lp_1.And.build([star, notslash])])),
    lp_1.Token.build('*/'),
]);
const whitespace = lp_1.OneOrMore.build(lp_1.Or.build([space, newline, singlelinecomment, multilinecomment]));
const optwhitespace = lp_1.ZeroOrOne.build(whitespace);
const colon = lp_1.Token.build(':');
const under = lp_1.Token.build('_');
const negate = lp_1.Token.build('-');
const dot = lp_1.Token.build('.');
const par = lp_1.Token.build('..');
const eq = lp_1.Token.build('=');
const openParen = lp_1.Token.build('(');
const closeParen = lp_1.Token.build(')');
const openCurly = lp_1.Token.build('{');
const closeCurly = lp_1.Token.build('}');
const openCaret = lp_1.Token.build('<');
const closeCaret = lp_1.Token.build('>');
const openArr = lp_1.Token.build('[');
const closeArr = lp_1.Token.build(']');
const comma = lp_1.Token.build(',');
const optcomma = lp_1.ZeroOrOne.build(comma);
const semicolon = lp_1.Token.build(';');
const optsemicolon = lp_1.ZeroOrOne.build(semicolon);
const at = lp_1.Token.build('@');
const slash = lp_1.Token.build('/');
const base10 = lp_1.CharSet.build('0', '9');
const natural = lp_1.OneOrMore.build(base10);
const integer = lp_1.And.build([lp_1.ZeroOrOne.build(negate), natural]);
const real = lp_1.And.build([integer, lp_1.ZeroOrOne.build(lp_1.And.build([dot, natural]))]);
const num = lp_1.NamedOr.build({
    real,
    integer,
});
const t = lp_1.Token.build('true');
const f = lp_1.Token.build('false');
const bool = lp_1.Or.build([t, f]);
const lower = lp_1.CharSet.build('a', 'z');
const upper = lp_1.CharSet.build('A', 'Z');
const variable = lp_1.LeftSubset.build(lp_1.And.build([
    lp_1.OneOrMore.build(lp_1.Or.build([under, lower, upper])),
    lp_1.ZeroOrMore.build(lp_1.Or.build([under, lower, upper, base10])),
]), bool);
const operators = lp_1.OneOrMore.build(lp_1.Or.build([
    lp_1.Token.build('+'),
    lp_1.Token.build('-'),
    lp_1.Token.build('/'),
    lp_1.Token.build('\\'),
    lp_1.Token.build('*'),
    lp_1.Token.build('^'),
    lp_1.Token.build('.'),
    lp_1.Token.build('~'),
    lp_1.Token.build('`'),
    lp_1.Token.build('!'),
    lp_1.Token.build('@'),
    lp_1.Token.build('#'),
    lp_1.Token.build('$'),
    lp_1.Token.build('%'),
    lp_1.Token.build('&'),
    lp_1.Token.build('|'),
    lp_1.Token.build(':'),
    lp_1.Token.build('<'),
    lp_1.Token.build('>'),
    lp_1.Token.build('?'),
    lp_1.Token.build('='),
]));
const interfacen = lp_1.Token.build('interface');
const newn = lp_1.Token.build('new');
const ifn = lp_1.Token.build('if');
const elsen = lp_1.Token.build('else');
const precedence = lp_1.Token.build('precedence');
const infix = lp_1.Token.build('infix');
const prefix = lp_1.Token.build('prefix');
const asn = lp_1.Token.build('as');
const exit = lp_1.Token.build('return');
const emit = lp_1.Token.build('emit');
const letn = lp_1.Token.build('let');
const constn = lp_1.Token.build('const');
const on = lp_1.Token.build('on');
const event = lp_1.Token.build('event');
const exportn = lp_1.Token.build('export');
const typen = lp_1.Token.build('type');
const importn = lp_1.Token.build('import');
const fromn = lp_1.Token.build('from');
const fn = lp_1.Token.build('fn');
const quote = lp_1.Token.build("'");
const doublequote = lp_1.Token.build('"');
const escapeQuote = lp_1.Token.build("\\'");
const escapeDoublequote = lp_1.Token.build('\\"');
const notQuote = lp_1.Not.build("'");
const notDoublequote = lp_1.Not.build('"');
const sep = lp_1.And.build([optwhitespace, comma, optwhitespace]);
const optsep = lp_1.ZeroOrOne.build(sep);
const str = lp_1.Or.build([
    lp_1.And.build([
        quote,
        lp_1.ZeroOrMore.build(lp_1.Or.build([escapeQuote, notQuote])),
        quote,
    ]),
    lp_1.And.build([
        doublequote,
        lp_1.ZeroOrMore.build(lp_1.Or.build([escapeDoublequote, notDoublequote])),
        doublequote,
    ]),
]);
const arrayaccess = lp_1.NamedAnd.build({
    openArr,
    b: optwhitespace,
    assignables: new lp_1.NulLP(),
    c: optwhitespace,
    closeArr,
});
const varsegment = lp_1.NamedOr.build({
    variable,
    methodsep: lp_1.And.build([optwhitespace, dot, optwhitespace]),
    arrayaccess,
});
const varn = lp_1.OneOrMore.build(varsegment);
const varop = lp_1.NamedOr.build({
    variable,
    operators,
});
const renamed = lp_1.ZeroOrOne.build(lp_1.NamedAnd.build({
    a: blank,
    asn,
    b: blank,
    varop,
}));
const renameablevar = lp_1.NamedAnd.build({
    varop,
    renamed,
});
const varlist = lp_1.NamedAnd.build({
    renameablevar,
    cdr: lp_1.ZeroOrMore.build(lp_1.NamedAnd.build({
        sep,
        renameablevar,
    })),
    sep: lp_1.ZeroOrOne.build(sep),
});
const depsegment = lp_1.NamedOr.build({
    variable,
    slash,
});
const pardepsegment = lp_1.NamedOr.build({
    variable,
    slash,
    par,
});
const localdependency = lp_1.NamedOr.build({
    curDir: lp_1.NamedAnd.build({
        dot,
        depsegments: lp_1.OneOrMore.build(depsegment),
    }),
    parDir: lp_1.NamedAnd.build({
        par,
        depsegments: lp_1.OneOrMore.build(pardepsegment),
    }),
});
const globaldependency = lp_1.NamedAnd.build({
    at,
    depsegments: lp_1.OneOrMore.build(depsegment),
});
const dependency = lp_1.NamedOr.build({
    localdependency,
    globaldependency,
});
const standardImport = lp_1.NamedAnd.build({
    importn,
    blank,
    dependency,
    renamed,
    a: optblank,
    newline,
    b: optwhitespace,
});
const fromImport = lp_1.NamedAnd.build({
    fromn,
    a: blank,
    dependency,
    b: blank,
    importn,
    c: blank,
    varlist,
    d: optblank,
    newline,
    e: optwhitespace,
});
const imports = lp_1.ZeroOrMore.build(lp_1.NamedOr.build({
    standardImport,
    fromImport,
}));
const typename = varn;
const typegenerics = lp_1.NamedAnd.build({
    openCaret,
    a: optwhitespace,
    generics: new lp_1.NulLP(),
    b: optwhitespace,
    closeCaret,
});
exports.fulltypename = lp_1.NamedAnd.build({
    typename,
    opttypegenerics: lp_1.ZeroOrOne.build(typegenerics),
});
typegenerics.and.generics = lp_1.NamedAnd.build({
    fulltypename: exports.fulltypename,
    cdr: lp_1.ZeroOrMore.build(lp_1.NamedAnd.build({
        sep,
        fulltypename: exports.fulltypename,
    })),
});
const typeline = lp_1.NamedAnd.build({
    variable,
    a: optwhitespace,
    colon,
    b: optwhitespace,
    fulltypename: exports.fulltypename,
});
const typelist = lp_1.NamedAnd.build({
    typeline,
    cdr: lp_1.ZeroOrMore.build(lp_1.NamedAnd.build({
        sep,
        typeline,
    })),
    optsep,
});
const typebody = lp_1.NamedAnd.build({
    openCurly,
    a: optwhitespace,
    typelist,
    b: optwhitespace,
    closeCurly,
});
const types = lp_1.NamedAnd.build({
    typen,
    blank,
    fulltypename: exports.fulltypename,
    optwhitespace,
    typedef: lp_1.NamedOr.build({
        typebody,
        typealias: lp_1.NamedAnd.build({
            eq,
            blank,
            fulltypename: exports.fulltypename,
        }),
    }),
});
const constants = lp_1.NamedOr.build({
    bool,
    num,
    str,
});
const baseassignable = lp_1.NamedOr.build({
    objectliterals: new lp_1.NulLP(),
    functions: new lp_1.NulLP(),
    fncall: new lp_1.NulLP(),
    variable,
    constants,
    methodsep: lp_1.And.build([optwhitespace, dot, optwhitespace]),
});
const baseassignablelist = lp_1.OneOrMore.build(lp_1.NamedAnd.build({
    baseassignable,
}));
const withoperators = lp_1.NamedOr.build({
    baseassignablelist,
    operators: lp_1.And.build([optwhitespace, operators, optwhitespace]),
});
exports.assignables = lp_1.OneOrMore.build(lp_1.NamedAnd.build({
    withoperators,
}));
arrayaccess.and.assignables = exports.assignables;
const constdeclaration = lp_1.NamedAnd.build({
    constn,
    whitespace,
    variable,
    a: optwhitespace,
    typedec: lp_1.ZeroOrOne.build(lp_1.NamedAnd.build({
        colon,
        a: optwhitespace,
        fulltypename: exports.fulltypename,
        b: optwhitespace,
    })),
    eq,
    b: optwhitespace,
    assignables: exports.assignables,
    semicolon,
});
const letdeclaration = lp_1.NamedAnd.build({
    letn,
    whitespace,
    variable,
    a: optwhitespace,
    typedec: lp_1.ZeroOrOne.build(lp_1.NamedAnd.build({
        colon,
        optwhitespace,
        fulltypename: exports.fulltypename,
    })),
    b: optwhitespace,
    eq,
    c: optwhitespace,
    assignables: exports.assignables,
    semicolon,
});
const declarations = lp_1.NamedOr.build({
    constdeclaration,
    letdeclaration,
});
const assignments = lp_1.NamedAnd.build({
    varn,
    a: optwhitespace,
    eq,
    b: optwhitespace,
    assignables: exports.assignables,
    semicolon,
});
const retval = lp_1.ZeroOrOne.build(lp_1.NamedAnd.build({
    assignables: exports.assignables,
    optwhitespace,
}));
const exits = lp_1.NamedAnd.build({
    exit,
    optwhitespace,
    retval,
    semicolon,
});
const emits = lp_1.NamedAnd.build({
    emit,
    a: optwhitespace,
    eventname: varn,
    b: optwhitespace,
    retval,
    semicolon,
});
const arglist = lp_1.ZeroOrOne.build(lp_1.NamedAnd.build({
    variable,
    a: optblank,
    colon,
    b: optblank,
    fulltypename: exports.fulltypename,
    cdr: lp_1.ZeroOrMore.build(lp_1.NamedAnd.build({
        sep,
        variable,
        a: optblank,
        colon,
        b: optblank,
        fulltypename: exports.fulltypename,
    })),
    optsep,
}));
const functionbody = lp_1.NamedAnd.build({
    openCurly,
    statements: new lp_1.NulLP(),
    optwhitespace,
    closeCurly,
});
const assignfunction = lp_1.NamedAnd.build({
    eq,
    optwhitespace,
    assignables: exports.assignables,
    optsemicolon,
});
const fullfunctionbody = lp_1.NamedOr.build({
    functionbody,
    assignfunction,
});
exports.functions = lp_1.NamedAnd.build({
    fn,
    a: optwhitespace,
    optname: lp_1.ZeroOrOne.build(variable),
    b: optwhitespace,
    optargs: lp_1.ZeroOrOne.build(lp_1.NamedAnd.build({
        openParen,
        a: optwhitespace,
        arglist,
        b: optwhitespace,
        closeParen,
        c: optwhitespace,
    })),
    optreturntype: lp_1.ZeroOrOne.build(lp_1.NamedAnd.build({
        colon,
        a: optwhitespace,
        fulltypename: exports.fulltypename,
        b: optwhitespace,
    })),
    fullfunctionbody,
});
baseassignable.or.functions = exports.functions;
const blocklike = lp_1.NamedOr.build({
    functions: exports.functions,
    functionbody,
    fnname: varn,
});
const condorblock = lp_1.NamedOr.build({
    conditionals: new lp_1.NulLP(),
    blocklike,
});
const conditionals = lp_1.NamedAnd.build({
    ifn,
    whitespace,
    assignables: exports.assignables,
    optwhitespace,
    blocklike,
    elsebranch: lp_1.ZeroOrOne.build(lp_1.NamedAnd.build({
        whitespace,
        elsen,
        optwhitespace,
        condorblock,
    })),
});
condorblock.or.conditionals = conditionals;
exports.statement = lp_1.NamedOr.build({
    declarations,
    exits,
    emits,
    assignments,
    conditionals,
    assignables: lp_1.NamedAnd.build({
        assignables: exports.assignables,
        semicolon,
    }),
});
const statements = lp_1.OneOrMore.build(lp_1.NamedAnd.build({
    optwhitespace,
    statement: exports.statement,
}));
functionbody.and.statements = statements;
const literaldec = lp_1.NamedAnd.build({
    newn,
    blank,
    fulltypename: exports.fulltypename,
    optblank,
});
const assignablelist = lp_1.ZeroOrOne.build(lp_1.NamedAnd.build({
    optwhitespace,
    assignables: exports.assignables,
    cdr: lp_1.ZeroOrMore.build(lp_1.NamedAnd.build({
        sep,
        assignables: exports.assignables,
    })),
    optsep,
}));
const arraybase = lp_1.NamedAnd.build({
    openArr,
    a: optwhitespace,
    assignablelist,
    b: optwhitespace,
    closeArr,
});
const fullarrayliteral = lp_1.NamedAnd.build({
    literaldec,
    arraybase,
});
const arrayliteral = lp_1.NamedOr.build({
    arraybase,
    fullarrayliteral,
});
const typeassignlist = lp_1.NamedAnd.build({
    variable,
    a: optwhitespace,
    colon,
    b: optwhitespace,
    assignables: exports.assignables,
    c: optwhitespace,
    cdr: lp_1.ZeroOrMore.build(lp_1.NamedAnd.build({
        sep,
        variable,
        a: optwhitespace,
        colon,
        b: optwhitespace,
        assignables: exports.assignables,
    })),
    optsep,
});
const typebase = lp_1.NamedAnd.build({
    openCurly,
    a: optwhitespace,
    typeassignlist,
    b: optwhitespace,
    closeCurly,
});
const typeliteral = lp_1.NamedAnd.build({
    literaldec,
    typebase,
});
const objectliterals = lp_1.NamedOr.build({
    arrayliteral,
    typeliteral,
});
baseassignable.or.objectliterals = objectliterals;
const fncall = lp_1.NamedAnd.build({
    openParen,
    a: optwhitespace,
    assignablelist,
    b: optwhitespace,
    closeParen,
});
baseassignable.or.fncall = fncall;
const fntoop = lp_1.NamedAnd.build({
    fnname: variable,
    a: blank,
    asn,
    b: blank,
    operators,
});
const opprecedence = lp_1.NamedAnd.build({
    precedence,
    blank,
    num,
});
const fix = lp_1.NamedOr.build({
    prefix,
    infix,
});
const opmap = lp_1.Or.build([
    lp_1.NamedAnd.build({
        fntoop,
        blank,
        opprecedence,
    }),
    lp_1.NamedAnd.build({
        opprecedence,
        blank,
        fntoop,
    }),
]);
const operatormapping = lp_1.NamedAnd.build({
    fix,
    blank,
    opmap,
});
const events = lp_1.NamedAnd.build({
    event,
    whitespace,
    variable,
    a: optwhitespace,
    colon,
    b: optwhitespace,
    fulltypename: exports.fulltypename,
});
const propertytypeline = lp_1.NamedAnd.build({
    variable,
    a: blank,
    colon,
    b: blank,
    fulltypename: exports.fulltypename,
});
const operatortypeline = lp_1.NamedAnd.build({
    optleftarg: lp_1.ZeroOrOne.build(lp_1.NamedAnd.build({
        leftarg: exports.fulltypename,
        whitespace,
    })),
    operators,
    whitespace,
    rightarg: exports.fulltypename,
    a: optwhitespace,
    colon,
    b: optwhitespace,
    fulltypename: exports.fulltypename,
});
const functiontype = lp_1.NamedAnd.build({
    openParen,
    a: optwhitespace,
    fulltypename: exports.fulltypename,
    b: optwhitespace,
    cdr: lp_1.ZeroOrMore.build(lp_1.NamedAnd.build({
        sep,
        a: optwhitespace,
        fulltypename: exports.fulltypename,
        b: optwhitespace,
    })),
    optsep,
    c: optwhitespace,
    closeParen,
    d: optwhitespace,
    colon,
    e: optwhitespace,
    returntype: exports.fulltypename,
});
const functiontypeline = lp_1.NamedAnd.build({
    variable,
    optblank,
    functiontype,
});
const interfaceline = lp_1.NamedOr.build({
    functiontypeline,
    operatortypeline,
    propertytypeline,
});
const interfacelist = lp_1.ZeroOrOne.build(lp_1.NamedAnd.build({
    a: optwhitespace,
    interfaceline,
    b: optwhitespace,
    cdr: lp_1.ZeroOrMore.build(lp_1.NamedAnd.build({
        sep,
        a: optwhitespace,
        interfaceline,
        b: optwhitespace,
    })),
    optsep,
}));
const interfacebody = lp_1.NamedAnd.build({
    openCurly,
    interfacelist,
    optwhitespace,
    closeCurly,
});
const interfacealias = lp_1.NamedAnd.build({
    eq,
    blank,
    variable,
});
const interfacedef = lp_1.NamedOr.build({
    interfacebody,
    interfacealias,
});
const interfaces = lp_1.NamedAnd.build({
    interfacen,
    a: optblank,
    variable,
    b: optblank,
    interfacedef,
});
const exportable = lp_1.NamedOr.build({
    functions: exports.functions,
    constdeclaration,
    types,
    interfaces,
    operatormapping,
    events,
    ref: variable,
});
const exportsn = lp_1.NamedAnd.build({
    exportn,
    blank,
    exportable,
});
const handler = lp_1.NamedOr.build({
    functions: exports.functions,
    functionbody,
    fnname: variable,
});
const handlers = lp_1.NamedAnd.build({
    on,
    a: whitespace,
    eventname: varn,
    b: whitespace,
    handler,
});
const body = lp_1.OneOrMore.build(lp_1.NamedOr.build({
    whitespace,
    exportsn,
    handlers,
    functions: exports.functions,
    types,
    constdeclaration,
    operatormapping,
    events,
    interfaces,
}));
exports.ln = lp_1.NamedAnd.build({
    optwhitespace,
    imports,
    body,
});

},{"./lp":22}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignablesAstFromString = exports.fulltypenameAstFromString = exports.statementAstFromString = exports.functionAstFromString = exports.resolveImports = exports.resolveDependency = exports.fromFile = exports.fromString = void 0;
const fs = require("fs");
const path = require("path");
const lp_1 = require("../lp");
const ln = require("../ln");
const resolve = (path) => {
    try {
        return fs.realpathSync(path);
    }
    catch (e) {
        return null;
    }
};
exports.fromString = (str) => {
    const lp = lp_1.LP.fromText(str);
    const ast = ln.ln.apply(lp);
    if (ast instanceof lp_1.LPError) {
        throw new Error(ast.msg);
    }
    else if (ast.t.length !== str.length) {
        const lp2 = lp.clone();
        lp2.advance(ast.t.length);
        const body = ast.get('body').getAll();
        const last = body[body.length - 1];
        throw new Error(`AST Parse error, cannot continue due to syntax error between line ${last.line}:${last.char} - ${lp2.line}:${lp2.char}`);
    }
    return ast;
};
exports.fromFile = (filename) => {
    const ast = exports.fromString(fs.readFileSync(filename, { encoding: 'utf8' }));
    ast.filename = filename;
    return ast;
};
exports.resolveDependency = (modulePath, dependency) => {
    // Special case path for the standard library importing itself
    if (modulePath.substring(0, 4) === '@std')
        return dependency.t.trim();
    // For everything else...
    let importPath = null;
    // If the dependency is a local dependency, there's little logic in determining
    // what is being imported. It's either the relative path to a file with the language
    // extension, or the relative path to a directory containing an "index.ln" file
    if (dependency.has('localdependency')) {
        const dirPath = resolve(path.join(path.dirname(modulePath), dependency.get('localdependency').t, 'index.ln'));
        const filePath = resolve(path.join(path.dirname(modulePath), dependency.get('localdependency').t + '.ln'));
        // It's possible for both to exist. Prefer the directory-based one, but warn the user
        if (typeof dirPath === 'string' && typeof filePath === 'string') {
            console.error(dirPath + ' and ' + filePath + ' both exist. Using ' + dirPath);
        }
        if (typeof filePath === 'string') {
            importPath = filePath;
        }
        if (typeof dirPath === 'string') {
            importPath = dirPath;
        }
        if (importPath === null) {
            throw new Error(`The dependency ${dependency.get('localdependency').t} could not be found.`);
        }
    }
    // If the dependency is a global dependency, there's a more complicated resolution to find it.
    // This is inspired by the Ruby and Node resolution mechanisms, but with some changes that
    // should hopefully make some improvements so dependency-injection is effectively first-class
    // and micro-libraries are discouraged (the latter will require a multi-pronged effort)
    //
    // Essentially, there are two recursively-found directories that global modules can be found,
    // the `modules` directory and the `dependencies` directory (TBD: are these the final names?)
    // The `modules` directory is recursively checked first (with a special check to make sure it
    // ignores self-resolutions) and the first one found in that check, if any, is used. If not,
    // there's a special check if the dependency is an `@std/...` dependency, and if so to return
    // that string as-is so the built-in dependency is used. Next the same recursive check is
    // performed on the `dependencies` directories until the dependency is found. If that also
    // fails, then there will be a complaint and the process will exit.
    //
    // The idea is that the package manager will install dependencies into the `dependencies`
    // directory at the root of the project (or maybe PWD, but that seems a bit too unwieldy).
    // Meanwhile the `modules` directory will only exist if the developer wants it, but it can be
    // useful for cross-cutting code in the same project that doesn't really need to be open-
    // sourced but is annoying to always reference slightly differently in each file, eg
    // `../../../util`. Instead the project can have a project-root-level `modules` directory and
    // then `modules/util.ln` can be referenced simply with `import @util` anywhere in the project.
    //
    // Since this is also recursive, it's should make dependency injection a first-class citizen
    // of the language. For instance you can put all of your models in `modules/models/`, and then
    // your unit test suite can have its model mocks in `tests/modules/models/` and the dependency
    // you intend to inject into can be symlinked in the `tests/` directory to cause that version
    // to pull the injected code, instead. And of course, if different tests need different
    // dependency injections, you can turn the test file into a directory of the same name and
    // rename the file to `index.ln` within it, and then have the specific mocks that test needs
    // stored in a `modules/` directory in parallel with it, which will not impact other mocks.
    //
    // Because these mocks also have a special exception to not import themselves, this can also
    // be used for instrumentation purposes, where they override the actual module but then also
    // import the real thing and add extra behavior to it.
    //
    // While there are certainly uses for splitting some logical piece of code into a tree of
    // files and directories, it is my hope that the standard application organization path is a
    // project with a root `index.ln` file and `modules` and `dependencies` directories, and little
    // else. At least things like `modules/logger`, `modules/config`, etc should belong there.
    if (dependency.has('globaldependency')) {
        // Get the two potential dependency types, file and directory-style.
        const fileModule = dependency.get('globaldependency').t.substring(1) + '.ln';
        const dirModule = dependency.get('globaldependency').t.substring(1) + '/index.ln';
        // Get the initial root to check
        let pathRoot = path.dirname(modulePath);
        // Search the recursively up the directory structure in the `modules` directories for the
        // specified dependency, and if found, return it.
        while (pathRoot != null) {
            const dirPath = resolve(path.join(pathRoot, 'modules', dirModule));
            const filePath = resolve(path.join(pathRoot, 'modules', fileModule));
            // It's possible for a module to accidentally resolve to itself when the module wraps the
            // actual dependency it is named for.
            if (dirPath === modulePath || filePath === modulePath) {
                pathRoot = path.dirname(pathRoot);
                continue;
            }
            // It's possible for both to exist. Prefer the directory-based one, but warn the user
            if (typeof dirPath === 'string' && typeof filePath === 'string') {
                console.error(dirPath + ' and ' + filePath + ' both exist. Using ' + dirPath);
            }
            if (typeof filePath === 'string') {
                importPath = filePath;
                break;
            }
            if (typeof dirPath === 'string') {
                importPath = dirPath;
                break;
            }
            if (pathRoot === '/' || /[A-Z]:\\/.test(pathRoot)) {
                pathRoot = null;
            }
            else {
                pathRoot = path.dirname(pathRoot);
            }
        }
        if (importPath == null) {
            // If we can't find it defined in a `modules` directory, check if it's an `@std/...`
            // module and abort here so the built-in standard library is used.
            if (dependency.get('globaldependency').t.substring(0, 5) === '@std/') {
                // Not a valid path (starting with '@') to be used as signal to use built-in library)
                importPath = dependency.get('globaldependency').t;
            }
            else {
                // Go back to the original point and search up the tree for `dependencies` directories
                pathRoot = path.dirname(modulePath);
                while (pathRoot != null) {
                    const dirPath = resolve(path.join(pathRoot, 'dependencies', dirModule));
                    const filePath = resolve(path.join(pathRoot, 'dependencies', fileModule));
                    // It's possible for both to exist. Prefer the directory-based one, but warn the user
                    if (typeof dirPath === 'string' && typeof filePath === 'string') {
                        console.error(dirPath + ' and ' + filePath + ' both exist. Using ' + dirPath);
                    }
                    if (typeof filePath === 'string') {
                        importPath = filePath;
                        break;
                    }
                    if (typeof dirPath === 'string') {
                        importPath = dirPath;
                        break;
                    }
                    if (pathRoot === '/' || /[A-Z]:\\/.test(pathRoot)) {
                        pathRoot = null;
                    }
                    else {
                        pathRoot = path.dirname(pathRoot);
                    }
                }
            }
            if (importPath == null) {
                throw new Error(`The dependency ${dependency.get('globaldependency').t} could not be found.`);
            }
        }
    }
    return importPath;
};
exports.resolveImports = (modulePath, ast) => {
    const resolvedImports = [];
    const imports = ast.get('imports').getAll();
    for (let i = 0; i < imports.length; i++) {
        let dependency = null;
        if (imports[i].has('standardImport')) {
            dependency = imports[i].get('standardImport').get('dependency');
        }
        if (imports[i].has('fromImport')) {
            dependency = imports[i].get('fromImport').get('dependency');
        }
        if (!dependency) {
            // Should I do anything else here?
            throw new Error('Malformed AST, import statement without an import definition?');
        }
        const importPath = exports.resolveDependency(modulePath, dependency);
        resolvedImports.push(importPath);
    }
    return resolvedImports;
};
exports.functionAstFromString = (fn) => {
    const lp = lp_1.LP.fromText(fn);
    const ast = ln.functions.apply(lp);
    if (ast instanceof lp_1.LPError) {
        throw new Error(ast.msg);
    }
    else if (ast.t.length !== fn.length) {
        const lp2 = lp.clone();
        lp2.advance(ast.t.length);
        throw new Error(`AST Parse error, cannot continue due to syntax error ending at line ${lp2.line}:${lp2.char}`);
    }
    return ast;
};
exports.statementAstFromString = (s) => {
    const lp = lp_1.LP.fromText(s);
    const ast = ln.statement.apply(lp);
    if (ast instanceof lp_1.LPError) {
        throw new Error(ast.msg);
    }
    else if (ast.t.length !== s.length) {
        const lp2 = lp.clone();
        lp2.advance(ast.t.length);
        throw new Error(`AST Parse error, cannot continue due to syntax error ending at line ${lp2.line}:${lp2.char}`);
    }
    return ast;
};
exports.fulltypenameAstFromString = (s) => {
    const lp = lp_1.LP.fromText(s);
    const ast = ln.fulltypename.apply(lp);
    if (ast instanceof lp_1.LPError) {
        throw new Error(ast.msg);
    }
    else if (ast.t.length !== s.length) {
        const lp2 = lp.clone();
        lp2.advance(ast.t.length);
        throw new Error(`AST Parse error, cannot continue due to syntax error ending at line ${lp2.line}:${lp2.char}`);
    }
    return ast;
};
exports.assignablesAstFromString = (s) => {
    const lp = lp_1.LP.fromText(s);
    const ast = ln.assignables.apply(lp);
    if (ast instanceof lp_1.LPError) {
        throw new Error(ast.msg);
    }
    else if (ast.t.length !== s.length) {
        const lp2 = lp.clone();
        lp2.advance(ast.t.length);
        throw new Error(`AST Parse error, cannot continue due to syntax error ending at line ${lp2.line}:${lp2.char}`);
    }
    return ast;
};

},{"../ln":8,"../lp":22,"fs":26,"path":37}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Constant {
    constructor(name, assignablesAst, scope) {
        this.name = name;
        this.assignablesAst = assignablesAst;
        this.scope = scope;
    }
    static fromAst(constdeclaration, scope) {
        const name = constdeclaration.get('variable').t;
        const outConst = new Constant(name, constdeclaration.get('assignables'), scope);
        scope.put(name, outConst);
        return outConst;
    }
}
exports.default = Constant;

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Type_1 = require("./Type");
let Event = /** @class */ (() => {
    class Event {
        constructor(name, type, builtIn) {
            (this.name = name), (this.type = type);
            this.builtIn = builtIn;
            this.handlers = [];
            Event.allEvents.push(this);
        }
        toString() {
            return `event ${this.name}: ${this.type.typename}`;
        }
        static fromAst(eventAst, scope) {
            const name = eventAst.get('variable').t;
            const type = scope.deepGet(eventAst.get('fulltypename').t);
            if (!type) {
                throw new Error('Could not find specified type: ' + eventAst.get('fulltypename').t);
            }
            else if (!(type instanceof Type_1.default)) {
                throw new Error(eventAst.get('fulltypename').t + ' is not a type');
            }
            return new Event(name, type, false);
        }
    }
    Event.allEvents = [];
    return Event;
})();
exports.default = Event;

},{"./Type":18}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-var-requires */
const uuid_1 = require("uuid");
const Ast = require("./Ast");
const Event_1 = require("./Event");
const Operator_1 = require("./Operator");
const Constant_1 = require("./Constant");
const Scope_1 = require("./Scope");
const Statement_1 = require("./Statement");
const StatementType_1 = require("./StatementType");
const Type_1 = require("./Type");
const UserFunction_1 = require("./UserFunction");
const FIXED_TYPES = [
    'int64',
    'int32',
    'int16',
    'int8',
    'float64',
    'float32',
    'bool',
    'void',
];
class Microstatement {
    constructor(statementType, scope, pure, outputName, outputType = Type_1.default.builtinTypes.void, inputNames = [], fns = [], alias = '', closurePure = true, closureStatements = [], closureArgs = {}, closureOutputType = Type_1.default.builtinTypes.void) {
        this.statementType = statementType;
        this.scope = scope;
        this.pure = pure;
        this.outputName = outputName;
        this.outputType = outputType;
        this.inputNames = inputNames;
        this.fns = fns;
        this.alias = alias;
        this.closurePure = closurePure;
        this.closureStatements = closureStatements;
        this.closureArgs = closureArgs;
        this.closureOutputType = closureOutputType;
    }
    toString() {
        let outString = '';
        switch (this.statementType) {
            case StatementType_1.default.CONSTDEC:
                outString =
                    'const ' + this.outputName + ': ' + this.outputType.typename;
                if (this.fns.length > 0) {
                    outString +=
                        ' = ' +
                            this.fns[0].getName() +
                            '(' +
                            this.inputNames.join(', ') +
                            ')';
                }
                else if (this.inputNames.length > 0) {
                    outString += ' = ' + this.inputNames[0]; // Doesn't appear the list is ever used here
                }
                break;
            case StatementType_1.default.LETDEC:
                outString = 'let ' + this.outputName + ': ' + this.outputType.typename;
                if (this.fns.length > 0) {
                    outString +=
                        ' = ' +
                            this.fns[0].getName() +
                            '(' +
                            this.inputNames.join(', ') +
                            ')';
                }
                else if (this.inputNames.length > 0) {
                    outString += ' = ' + this.inputNames[0]; // Doesn't appear the list is ever used here
                }
                break;
            case StatementType_1.default.ASSIGNMENT:
                outString = this.outputName;
                if (this.fns.length > 0) {
                    outString +=
                        ' = ' +
                            this.fns[0].getName() +
                            '(' +
                            this.inputNames.join(', ') +
                            ')';
                }
                else if (this.inputNames.length > 0) {
                    outString += ' = ' + this.inputNames[0]; // Doesn't appear the list is ever used here
                }
                else {
                    outString += 'NO!';
                }
                break;
            case StatementType_1.default.CALL:
                if (this.fns.length > 0) {
                    outString +=
                        this.fns[0].getName() + '(' + this.inputNames.join(', ') + ')';
                }
                break;
            case StatementType_1.default.EMIT:
                outString = 'emit ' + this.outputName + ' ';
                if (this.fns.length > 0) {
                    outString +=
                        this.fns[0].getName() + '(' + this.inputNames.join(', ') + ')';
                }
                else if (this.inputNames.length > 0) {
                    outString += this.inputNames[0]; // Doesn't appear the list is ever used here
                }
                break;
            case StatementType_1.default.EXIT:
                outString = 'return ' + this.outputName;
                break;
            case StatementType_1.default.CLOSURE:
                outString = 'const ' + this.outputName + ': function = fn (';
                const args = [];
                for (const [name, type] of Object.entries(this.closureArgs)) {
                    if (name !== '' && type.typename != '') {
                        args.push(name + ': ' + type.typename);
                    }
                }
                outString += args.join(',');
                outString += '): ' + this.closureOutputType.typename + ' {\n';
                for (const m of this.closureStatements) {
                    const s = m.toString();
                    if (s !== '') {
                        outString += '    ' + m.toString() + '\n';
                    }
                }
                outString += '  }';
                break;
            case StatementType_1.default.REREF:
            case StatementType_1.default.ARG:
            case StatementType_1.default.CLOSUREDEF:
                // Intentionally never output anything, this is metadata for the transpiler algo only
                break;
        }
        return outString;
    }
    static fromVarName(varName, scope, microstatements) {
        let original = null;
        for (let i = microstatements.length - 1; i > -1; i--) {
            const microstatement = microstatements[i];
            // TODO: var resolution is complex. Need to revisit this.
            if (microstatement.outputName === varName) {
                original = microstatement;
                if (microstatement.statementType !== StatementType_1.default.REREF) {
                    break;
                }
            }
            if (microstatement.alias === varName) {
                original = microstatement;
                for (let j = i - 1; j >= 0; j--) {
                    if (microstatements[j].outputName === original.outputName &&
                        microstatements[j].statementType !== StatementType_1.default.REREF) {
                        original = microstatements[j];
                        break;
                    }
                }
                break;
            }
        }
        // Check if this is a module constant that should be un-hoisted
        if (original === null &&
            !!scope.deepGet(varName) &&
            scope.deepGet(varName) instanceof Constant_1.default) {
            const globalConst = scope.deepGet(varName);
            Microstatement.fromAssignablesAst(globalConst.assignablesAst, globalConst.scope, // Eval this in its original scope in case it was an exported const
            microstatements);
            const last = microstatements[microstatements.length - 1];
            microstatements.push(new Microstatement(StatementType_1.default.REREF, scope, true, last.outputName, last.outputType, [], [], globalConst.name));
        }
        return original;
    }
    static fromConstantsAst(constantsAst, scope, microstatements) {
        const constName = '_' + uuid_1.v4().replace(/-/g, '_');
        let constType = 'void';
        if (constantsAst.has('bool'))
            constType = 'bool';
        if (constantsAst.has('str'))
            constType = 'string';
        if (constantsAst.has('num')) {
            // TODO: Add support for hex, octal, scientific, etc
            const numberConst = constantsAst.t;
            constType = numberConst.indexOf('.') > -1 ? 'float64' : 'int64';
        }
        let constVal;
        try {
            JSON.parse(constantsAst.t); // Will fail on strings with escape chars
            constVal = constantsAst.t;
        }
        catch (e) {
            // It may be a zero-padded number
            if (['int8', 'int16', 'int32', 'int64'].includes(constType) &&
                constantsAst.t[0] === '0') {
                constVal = parseInt(constantsAst.t, 10).toString();
            }
            else if (['float32', 'float64'].includes(constType) &&
                constantsAst.t[0] === '0') {
                constVal = parseFloat(constantsAst.t).toString();
            }
            else {
                // Hackery to get these strings to work
                constVal = JSON.stringify(constantsAst.t.replace(/^["']/, '').replace(/["']$/, ''));
            }
        }
        microstatements.push(new Microstatement(StatementType_1.default.CONSTDEC, scope, true, constName, scope.deepGet(constType), [constVal], []));
    }
    static fromObjectLiteralsAst(objectLiteralsAst, scope, microstatements) {
        if (objectLiteralsAst.has('arrayliteral')) {
            // Array literals first need all of the microstatements of the array contents defined, then
            // a `newarr` opcode call is inserted for the object literal itself, then `pusharr` opcode
            // calls are emitted to insert the relevant data into the array, and finally the array itself
            // is REREFed for the outer microstatement generation call.
            let arrayLiteralContents = [];
            const arraybase = objectLiteralsAst.get('arrayliteral').has('arraybase')
                ? objectLiteralsAst.get('arrayliteral').get('arraybase')
                : objectLiteralsAst
                    .get('arrayliteral')
                    .get('fullarrayliteral')
                    .get('arraybase');
            if (arraybase.has('assignablelist')) {
                const assignablelist = arraybase.get('assignablelist');
                arrayLiteralContents.push(assignablelist.get('assignables'));
                assignablelist
                    .get('cdr')
                    .getAll()
                    .forEach((r) => {
                    arrayLiteralContents.push(r.get('assignables'));
                });
                arrayLiteralContents = arrayLiteralContents.map((r) => {
                    Microstatement.fromAssignablesAst(r, scope, microstatements);
                    return microstatements[microstatements.length - 1];
                });
            }
            let type = null;
            if (objectLiteralsAst.get('arrayliteral').has('fullarrayliteral')) {
                const arrayTypeAst = objectLiteralsAst
                    .get('arrayliteral')
                    .get('fullarrayliteral')
                    .get('literaldec')
                    .get('fulltypename');
                type = scope.deepGet(arrayTypeAst.t.trim());
                if (!type) {
                    // Try to define it if it's a generic type
                    if (arrayTypeAst.has('opttypegenerics')) {
                        const outerType = scope.deepGet(arrayTypeAst.get('typename').t.trim());
                        if (!outerType) {
                            throw new Error(`${arrayTypeAst.t}  is not defined
${objectLiteralsAst.t} on line ${objectLiteralsAst.line}:${objectLiteralsAst.char}`);
                        }
                        const generics = [];
                        const genericsAst = arrayTypeAst
                            .get('opttypegenerics')
                            .get('generics');
                        generics.push(genericsAst.get('fulltypename').t);
                        genericsAst
                            .get('cdr')
                            .getAll()
                            .forEach((r) => {
                            generics.push(r.get('fulltypename').t);
                        });
                        outerType.solidify(generics, scope);
                        type = scope.deepGet(arrayTypeAst.t.trim());
                    }
                }
                if (!(type instanceof Type_1.default)) {
                    throw new Error(`${arrayTypeAst.t.trim()} is not a type
${objectLiteralsAst.t} on line ${objectLiteralsAst.line}:${objectLiteralsAst.char}`);
                }
            }
            else if (arrayLiteralContents.length > 0) {
                const innerType = arrayLiteralContents[0].outputType.typename;
                Type_1.default.builtinTypes['Array'].solidify([innerType], scope);
                type = scope.deepGet(`Array<${innerType}>`);
            }
            else {
                throw new Error(`Ambiguous array type, please specify the type for an empty array with the syntax \`new Array<MyType> []\`
${objectLiteralsAst.t} on line ${objectLiteralsAst.line}:${objectLiteralsAst.char}`);
            }
            // Create a new variable to hold the size of the array literal
            const lenName = '_' + uuid_1.v4().replace(/-/g, '_');
            microstatements.push(new Microstatement(StatementType_1.default.CONSTDEC, scope, true, lenName, Type_1.default.builtinTypes['int64'], [`${arrayLiteralContents.length}`], []));
            // Add the opcode to create a new array with the specified size
            const opcodes = require('./opcodes').default;
            opcodes.exportScope
                .get('newarr')[0]
                .microstatementInlining([lenName], scope, microstatements);
            // Get the array microstatement and extract the name and insert the correct type
            const array = microstatements[microstatements.length - 1];
            array.outputType = type;
            // Try to use the "real" type if knowable
            if (arrayLiteralContents.length > 0) {
                array.outputType = Type_1.default.builtinTypes['Array'].solidify([arrayLiteralContents[0].outputType.typename], scope);
            }
            const arrayName = array.outputName;
            // Push the values into the array
            for (let i = 0; i < arrayLiteralContents.length; i++) {
                // Create a new variable to hold the size of the array value
                const size = FIXED_TYPES.includes(arrayLiteralContents[i].outputType.typename)
                    ? '8'
                    : '0';
                const sizeName = '_' + uuid_1.v4().replace(/-/g, '_');
                microstatements.push(new Microstatement(StatementType_1.default.CONSTDEC, scope, true, sizeName, Type_1.default.builtinTypes['int64'], [size], []));
                // Push the value into the array
                const opcodes = require('./opcodes').default;
                opcodes.exportScope
                    .get('pusharr')[0]
                    .microstatementInlining([arrayName, arrayLiteralContents[i].outputName, sizeName], scope, microstatements);
            }
            // REREF the array
            microstatements.push(new Microstatement(StatementType_1.default.REREF, scope, true, arrayName, array.outputType, [], []));
        }
        else if (objectLiteralsAst.has('typeliteral')) {
            // User types are represented in AMM and lower as `Array<any>`. This reduces the number of
            // concepts that have to be maintained in the execution layer (and is really what C structs
            // are, anyways). The order of the properties on the specified type directly map to the
            // order that they are inserted into the Array, not the order they're defined in the object
            // literal notation, so reads and updates later on can occur predictably by mapping the name
            // of the property to its array index.
            //
            // If the type literal is missing any fields, that's a hard compile error to make sure
            // accessing undefined data is impossible. If a value might not be needed, they should use
            // the `Option` type and provide a `None` value there.
            const typeAst = objectLiteralsAst
                .get('typeliteral')
                .get('literaldec')
                .get('fulltypename');
            let type = scope.deepGet(typeAst.t.trim());
            if (type === null) {
                // Try to define it if it's a generic type
                if (typeAst.has('opttypegenerics')) {
                    const outerType = scope.deepGet(typeAst.get('typename').t.trim());
                    if (outerType === null) {
                        throw new Error(`${typeAst.t} is not defined
${objectLiteralsAst.t} on line ${objectLiteralsAst.line}:${objectLiteralsAst.char}`);
                    }
                    const generics = [];
                    const genericsAst = typeAst.get('opttypegenerics').get('generics');
                    generics.push(genericsAst.get('fulltypename').t);
                    genericsAst
                        .get('cdr')
                        .getAll()
                        .forEach((r) => {
                        generics.push(r.get('fulltypename').t);
                    });
                    outerType.solidify(generics, scope);
                    type = scope.deepGet(typeAst.t.trim());
                }
            }
            if (!(type instanceof Type_1.default)) {
                throw new Error(`${typeAst.t.trim()} is not a type
${objectLiteralsAst.t} on line ${objectLiteralsAst.line}:${objectLiteralsAst.char}`);
            }
            const assignlist = objectLiteralsAst
                .get('typeliteral')
                .get('typebase')
                .get('typeassignlist');
            const assignArr = [];
            assignArr.push({
                field: assignlist.get('variable'),
                val: assignlist.get('assignables'),
            });
            assignlist
                .get('cdr')
                .getAll()
                .forEach((r) => {
                assignArr.push({
                    field: r.get('variable'),
                    val: r.get('assignables'),
                });
            });
            const assignfields = assignArr.map((r) => r.field.t);
            const assignvals = assignArr.map((r) => r.val);
            const fields = Object.keys(type.properties);
            const missingFields = [];
            const foundFields = [];
            const extraFields = [];
            const astLookup = {};
            for (let i = 0; i < assignfields.length; i++) {
                const assignfield = assignfields[i];
                const assignval = assignvals[i];
                astLookup[assignfield] = assignval;
                if (!fields.includes(assignfield)) {
                    extraFields.push(assignfield);
                }
                if (foundFields.includes(assignfield)) {
                    extraFields.push(assignfield);
                }
                foundFields.push(assignfield);
            }
            for (const field of fields) {
                if (!foundFields.includes(field)) {
                    missingFields.push(field);
                }
            }
            if (missingFields.length > 0 || extraFields.length > 0) {
                let errMsg = `${typeAst.t.trim()} object literal improperly defined`;
                if (missingFields.length > 0) {
                    errMsg += '\n' + `Missing fields: ${missingFields.join(', ')}`;
                }
                if (extraFields.length > 0) {
                    errMsg += '\n' + `Extra fields: ${extraFields.join(', ')}`;
                }
                errMsg +=
                    '\n' +
                        objectLiteralsAst.t +
                        ' on line ' +
                        objectLiteralsAst.line +
                        ':' +
                        objectLiteralsAst.char;
                throw new Error(errMsg);
            }
            // The assignment looks good, now we'll mimic the array literal logic mostly
            const arrayLiteralContents = [];
            for (let i = 0; i < fields.length; i++) {
                Microstatement.fromAssignablesAst(astLookup[fields[i]], scope, microstatements);
                arrayLiteralContents.push(microstatements[microstatements.length - 1]);
            }
            // Create a new variable to hold the size of the array literal
            const lenName = '_' + uuid_1.v4().replace(/-/g, '_');
            microstatements.push(new Microstatement(StatementType_1.default.CONSTDEC, scope, true, lenName, Type_1.default.builtinTypes['int64'], [`${fields.length}`], []));
            // Add the opcode to create a new array with the specified size
            const opcodes = require('./opcodes').default;
            opcodes.exportScope
                .get('newarr')[0]
                .microstatementInlining([lenName], scope, microstatements);
            // Get the array microstatement and extract the name and insert the correct type
            const array = microstatements[microstatements.length - 1];
            array.outputType = type;
            const arrayName = array.outputName;
            // Push the values into the array
            for (let i = 0; i < arrayLiteralContents.length; i++) {
                // Create a new variable to hold the size of the array value
                const size = FIXED_TYPES.includes(arrayLiteralContents[i].outputType.typename)
                    ? '8'
                    : '0';
                const sizeName = '_' + uuid_1.v4().replace(/-/g, '_');
                microstatements.push(new Microstatement(StatementType_1.default.CONSTDEC, scope, true, sizeName, Type_1.default.builtinTypes['int64'], [size], []));
                // Push the value into the array
                const opcodes = require('./opcodes').default;
                opcodes.exportScope
                    .get('pusharr')[0]
                    .microstatementInlining([arrayName, arrayLiteralContents[i].outputName, sizeName], scope, microstatements);
            }
            // REREF the array
            microstatements.push(new Microstatement(StatementType_1.default.REREF, scope, true, arrayName, array.outputType, [], []));
        }
    }
    static closureDef(fns, scope, microstatements) {
        const closuredefName = '_' + uuid_1.v4().replace(/-/g, '_');
        // Keep any rerefs around as closure references
        const rerefs = microstatements.filter((m) => m.statementType === StatementType_1.default.REREF);
        microstatements.push(new Microstatement(StatementType_1.default.CLOSUREDEF, scope, true, // TODO: What should this be?
        closuredefName, Type_1.default.builtinTypes['function'], [], fns, '', true, rerefs));
    }
    static closureFromUserFunction(userFunction, scope, microstatements, interfaceMap) {
        const fn = userFunction.maybeTransform(interfaceMap);
        const idx = microstatements.length;
        const args = Object.entries(fn.args);
        for (const [name, type] of args) {
            if (name !== '' && type.typename != '') {
                microstatements.push(new Microstatement(StatementType_1.default.CONSTDEC, scope, true, name, type));
            }
        }
        const len = microstatements.length - args.length;
        for (const s of fn.statements) {
            Microstatement.fromStatementsAst(s.statementAst, scope, microstatements);
        }
        microstatements.splice(idx, args.length);
        const newlen = microstatements.length;
        // There might be off-by-one bugs in the conversion here
        const innerMicrostatements = microstatements.slice(len, newlen);
        microstatements.splice(len, newlen - len);
        const constName = '_' + uuid_1.v4().replace(/-/g, '_');
        // if closure is not void return the last inner statement
        // TODO: Revisit this, if the closure doesn't have a type defined, sometimes it can only be
        // determined in the calling context and shouldn't be assumed to be `void`
        if (innerMicrostatements.length > 0 &&
            fn.getReturnType() !== Type_1.default.builtinTypes.void) {
            const last = innerMicrostatements[innerMicrostatements.length - 1];
            innerMicrostatements.push(new Microstatement(StatementType_1.default.EXIT, scope, true, last.outputName, last.outputType));
        }
        microstatements.push(new Microstatement(StatementType_1.default.CLOSURE, scope, true, // TODO: Figure out if this is true or not
        constName, Type_1.default.builtinTypes['function'], [], [], '', fn.pure, innerMicrostatements, fn.args, fn.getReturnType()));
    }
    static fromEmitsAst(emitsAst, scope, microstatements) {
        if (emitsAst.get('retval').has()) {
            // If there's an assignable value here, add it to the list of microstatements first, then
            // rewrite the final const assignment as the emit statement.
            Microstatement.fromAssignablesAst(emitsAst.get('retval').get('assignables'), scope, microstatements);
            const event = scope.deepGet(emitsAst.get('eventname').t);
            if (!(event instanceof Event_1.default)) {
                throw new Error(`${emitsAst.get('eventname').t} is not an event!
${emitsAst.t} on line ${emitsAst.line}:${emitsAst.char}`);
            }
            const last = microstatements[microstatements.length - 1];
            if (last.outputType != event.type &&
                !event.type.castable(last.outputType)) {
                throw new Error(`Attempting to assign a value of type ${last.outputType.typename} to an event of type ${event.type.typename}
${emitsAst.t} on line ${emitsAst.line}:${emitsAst.char}`);
            }
            microstatements.push(new Microstatement(StatementType_1.default.EMIT, scope, true, event.name, event.type, [last.outputName], []));
        }
        else {
            // Otherwise, create an emit statement with no value
            const event = scope.deepGet(emitsAst.get('eventname').t);
            if (!(event instanceof Event_1.default)) {
                throw new Error(`${emitsAst.get('eventname').t} is not an event!
${emitsAst.t} on line ${emitsAst.line}:${emitsAst.char}`);
            }
            if (event.type != Type_1.default.builtinTypes.void) {
                throw new Error(`${emitsAst.get('eventname').t} must have a ${event.type} value emitted to it!
${emitsAst.t} on line ${emitsAst.line}:${emitsAst.char}`);
            }
            microstatements.push(new Microstatement(StatementType_1.default.EMIT, scope, true, event.name, Type_1.default.builtinTypes.void, [], []));
        }
    }
    static fromExitsAst(exitsAst, scope, microstatements) {
        // `alan--` handlers don't have the concept of a `return` statement, the functions are all inlined
        // and the last assigned value for the function *is* the return statement
        if (exitsAst.get('retval').has()) {
            // If there's an assignable value here, add it to the list of microstatements
            Microstatement.fromAssignablesAst(exitsAst.get('retval').get('assignables'), scope, microstatements);
        }
        else {
            // Otherwise, create a microstatement with no value
            const constName = '_' + uuid_1.v4().replace(/-/g, '_');
            microstatements.push(new Microstatement(StatementType_1.default.CONSTDEC, scope, true, constName, Type_1.default.builtinTypes.void, ['void'], null));
        }
    }
    static fromAssignmentsAst(assignmentsAst, scope, microstatements) {
        // For reassigning to a variable, we need to determine that the root variable is a
        // `let`-defined mutable variable and then tease out if any array or property accesses are done,
        // and if so we need to `register` a mutable reference to the array memory space and then update
        // the value with a `register` call from the assignables result address to the relevant inner
        // address of the last access argument. The format of a `varn` can only be the following:
        // `{moduleScope}.varName[arrayAccess].userProperty` where the array accesses and userProperties
        // can come in any order after the preamble. *Fortunately,* for this scenario, any situation
        // where `moduleScope` is included is invalid since only constants can be exported out of a
        // module, not mutable values, so we only need to read the *first* segment to immediately
        // determine if it is relevant or not -- if it comes back as a `Scope` object we abort with an
        // error. If not, then we find the relevant `Microstatement` and determine if it is a `const`
        // or a `let` declaration and abort if it is a `const`. After that, if there are no segments
        // beyond the first one, we simply take the `assignable` microstatement output and turn it into
        // an `ASSIGNMENT` StatementType, otherwise we need to go through a more complicated procedure
        // to `register` the `n-1` remaining inner array segments to new variables as references and
        // finally `register` the `assignable` into the location the last segment indicates.
        const segments = assignmentsAst.get('varn').getAll();
        // Now, find the original variable and confirm that it actually is a let declaration
        const letName = segments[0].t;
        let actualLetName;
        let original;
        for (let i = microstatements.length - 1; i >= 0; i--) {
            const microstatement = microstatements[i];
            if (microstatement.alias === letName) {
                actualLetName = microstatement.outputName;
                continue;
            }
            if (microstatement.outputName === actualLetName) {
                if (microstatement.statementType === StatementType_1.default.LETDEC) {
                    original = microstatement;
                    break;
                }
                else if (microstatement.statementType === StatementType_1.default.REREF) {
                    original = Microstatement.fromVarName(microstatement.outputName, scope, microstatements);
                    break;
                }
                else if (microstatement.statementType === StatementType_1.default.ASSIGNMENT) {
                    // We could treat this as evidence that it's cool, but let's just skip it.
                    continue;
                }
                else {
                    throw new Error(`Attempting to reassign a non-let variable.
${assignmentsAst.t} on line ${assignmentsAst.line}:${assignmentsAst.char}`);
                }
            }
        }
        if (!original) {
            throw new Error(`Attempting to reassign to an undeclared variable
${assignmentsAst.t} on line ${assignmentsAst.line}:${assignmentsAst.char}`);
        }
        if (segments.length === 1) {
            // Could be a simple let variable
            const letName = segments[0].t;
            let actualLetName;
            for (let i = microstatements.length - 1; i >= 0; i--) {
                const microstatement = microstatements[i];
                if (microstatement.alias === letName) {
                    actualLetName = microstatement.outputName;
                    continue;
                }
                if (microstatement.outputName === actualLetName) {
                    if (microstatement.statementType === StatementType_1.default.LETDEC) {
                        break;
                    }
                    else if (microstatement.statementType === StatementType_1.default.REREF) {
                        original = Microstatement.fromVarName(microstatement.outputName, scope, microstatements);
                        break;
                    }
                    else if (microstatement.statementType === StatementType_1.default.ASSIGNMENT) {
                        // Could treat this as evidence that it's okay, but let's be sure about that
                        continue;
                    }
                    else {
                        throw new Error(`Attempting to reassign a non-let variable.
${letName} on line ${assignmentsAst.line}:${assignmentsAst.char}`);
                    }
                }
            }
            Microstatement.fromAssignablesAst(assignmentsAst.get('assignables'), scope, microstatements);
            // By definition the last microstatement is the const assignment we care about, so we can
            // just mutate its object to rename the output variable name to the name we need instead.
            let last = microstatements[microstatements.length - 1];
            if (last.statementType === StatementType_1.default.REREF) {
                // Find what it's rereferencing and adjust that, instead
                for (let i = microstatements.length - 2; i >= 0; i--) {
                    const m = microstatements[i];
                    if (m.outputName === last.outputName &&
                        m.statementType !== StatementType_1.default.REREF) {
                        last = m;
                        break;
                    }
                }
            }
            if (last.statementType === StatementType_1.default.LETDEC) {
                // Insert a ref call for this instead of mutating the original assignment
                Microstatement.fromAssignablesAst(Ast.assignablesAstFromString(`ref(${last.outputName})`), scope, microstatements);
                last = microstatements[microstatements.length - 1];
                if (last.statementType === StatementType_1.default.REREF) {
                    // Find what it's rereferencing and adjust that, instead
                    for (let i = microstatements.length - 2; i >= 0; i--) {
                        const m = microstatements[i];
                        if (m.outputName === last.outputName &&
                            m.statementType !== StatementType_1.default.REREF) {
                            last = m;
                            break;
                        }
                    }
                }
            }
            last.outputName = actualLetName;
            last.statementType = StatementType_1.default.ASSIGNMENT;
            // Attempt to "merge" the output types, useful for multiple branches assigning into the same
            // variable but only part of the type information is known in each branch (like in `Result`
            // or `Either` with the result value only in one branch or one type in each of the branches
            // for `Either`).
            if (original.outputType.typename !== last.outputType.typename) {
                if (original.outputType.iface) {
                    // Just overwrite if it's an interface type
                    original.outputType = last.outputType;
                }
                else if (!!original.outputType.originalType &&
                    !!last.outputType.originalType &&
                    original.outputType.originalType.typename ===
                        last.outputType.originalType.typename) {
                    // The tricky path, let's try to merge the two types together
                    const baseType = original.outputType.originalType;
                    const originalTypeAst = Ast.fulltypenameAstFromString(original.outputType.typename);
                    const lastTypeAst = Ast.fulltypenameAstFromString(last.outputType.typename);
                    const originalSubtypes = [];
                    if (originalTypeAst.has('opttypegenerics')) {
                        const originalTypeGenerics = originalTypeAst
                            .get('opttypegenerics')
                            .get('generics');
                        originalSubtypes.push(originalTypeGenerics.get('fulltypename').t);
                        originalTypeGenerics
                            .get('cdr')
                            .getAll()
                            .forEach((r) => {
                            originalSubtypes.push(r.get('fulltypename').t);
                        });
                    }
                    const lastSubtypes = [];
                    if (lastTypeAst.has('opttypegenerics')) {
                        const lastTypeGenerics = lastTypeAst
                            .get('opttypegenerics')
                            .get('generics');
                        lastSubtypes.push(lastTypeGenerics.get('fulltypename').t);
                        lastTypeGenerics
                            .get('cdr')
                            .getAll()
                            .forEach((r) => {
                            lastSubtypes.push(r.get('fulltypename').t);
                        });
                    }
                    const newSubtypes = [];
                    for (let i = 0; i < originalSubtypes.length; i++) {
                        if (originalSubtypes[i] === lastSubtypes[i]) {
                            newSubtypes.push(originalSubtypes[i]);
                        }
                        else {
                            const originalSubtype = scope.deepGet(originalSubtypes[i]);
                            if (originalSubtype.iface) {
                                newSubtypes.push(lastSubtypes[i]);
                            }
                            else if (originalSubtype.originalType) {
                                // TODO: Support nesting
                                newSubtypes.push(originalSubtypes[i]);
                            }
                            else {
                                newSubtypes.push(originalSubtypes[i]);
                            }
                        }
                    }
                    const newType = baseType.solidify(newSubtypes, scope);
                    original.outputType = newType;
                }
                else {
                    // Hmm... what to do here?
                    original.outputType = last.outputType;
                }
            }
            return;
        }
        // The more complicated path. First, rule out that the first segment is not a `scope`.
        const test = scope.deepGet(segments[0].t);
        if (!!test && test instanceof Scope_1.default) {
            throw new Error(`Atempting to reassign to variable from another module
${assignmentsAst.get('varn').t} on line ${assignmentsAst.line}:${assignmentsAst.char}`);
        }
        let nestedLetType = original.outputType;
        for (let i = 1; i < segments.length - 1; i++) {
            const segment = segments[i];
            // A separator, just do nothing else this loop
            if (segment.has('methodsep'))
                continue;
            // An array access. Until the grammar definition is reworked, this will parse correctly, but
            // it is banned in alan (due to being unable to catch and report assignment errors to arrays)
            if (segment.has('arrayaccess')) {
                throw new Error(`${segments.join('')} cannot be written to. Please use 'set' to mutate arrays and hash tables`);
            }
            // If it's a varname here, then we're accessing an inner property type. We need to figure out
            // which index it is in the underlying array structure and then `register` that piece (since
            // this is an intermediate access and not the final access point)
            if (segment.has('variable')) {
                const fieldName = segment.get('variable').t;
                const fields = Object.keys(nestedLetType.properties);
                const fieldNum = fields.indexOf(fieldName);
                if (fieldNum < 0) {
                    // Invalid object access
                    throw new Error(`${letName} does not have a field named ${fieldName}
${assignmentsAst.get('varn').t} on line ${assignmentsAst.get('varn').line}:${assignmentsAst.get('varn').char}`);
                }
                // Create a new variable to hold the address within the array literal
                const addrName = '_' + uuid_1.v4().replace(/-/g, '_');
                microstatements.push(new Microstatement(StatementType_1.default.CONSTDEC, scope, true, addrName, Type_1.default.builtinTypes['int64'], [`${fieldNum}`], []));
                // Insert a `register` opcode.
                const opcodes = require('./opcodes').default;
                opcodes.exportScope
                    .get('register')[0]
                    .microstatementInlining([original.outputName, addrName], scope, microstatements);
                // Now, we need to update the type we're working with.
                nestedLetType = Object.values(nestedLetType.properties)[fieldNum];
                // Now update the `original` record to the new `register` result
                original = microstatements[microstatements.length - 1];
            }
        }
        Microstatement.fromAssignablesAst(assignmentsAst.get('assignables'), scope, microstatements);
        // Grab a reference to the final assignment variable.
        const assign = microstatements[microstatements.length - 1];
        // Next, determine which kind of final segment this is and perform the appropriate action to
        // insert into with a `copytof` or `copytov` opcode.
        const copytoop = [
            'int8',
            'int16',
            'int32',
            'int64',
            'float32',
            'float64',
            'bool',
        ].includes(assign.outputType.typename)
            ? 'copytof'
            : 'copytov';
        const finalSegment = segments[segments.length - 1];
        if (finalSegment.has('variable')) {
            const fieldName = finalSegment.t;
            const fields = Object.keys(nestedLetType.properties);
            const fieldNum = fields.indexOf(fieldName);
            if (fieldNum < 0) {
                // Invalid object access
                throw new Error(`${letName} does not have a field named ${fieldName}
${letName} on line ${assignmentsAst.line}:${assignmentsAst.char}`);
            }
            // Check if the new variable is allowed to be assigned to this object
            const originalType = nestedLetType.properties[fieldName];
            if (!originalType.typeApplies(assign.outputType, scope)) {
                throw new Error(`${letName}.${fieldName} is of type ${originalType.typename} but assigned a value of type ${assign.outputType.typename}`);
            }
            // Create a new variable to hold the address within the array literal
            const addrName = '_' + uuid_1.v4().replace(/-/g, '_');
            microstatements.push(new Microstatement(StatementType_1.default.CONSTDEC, scope, true, addrName, Type_1.default.builtinTypes['int64'], [`${fieldNum}`], []));
            // Insert a `copytof` or `copytov` opcode.
            const opcodes = require('./opcodes').default;
            opcodes.exportScope
                .get(copytoop)[0]
                .microstatementInlining([original.outputName, addrName, assign.outputName], scope, microstatements);
        }
        else {
            throw new Error(`${finalSegment.t} cannot be the final piece in a reassignment statement
${letName} on line ${assignmentsAst.line}:${assignmentsAst.char}`);
        }
    }
    static fromLetdeclarationAst(letdeclarationAst, scope, microstatements) {
        const letAlias = letdeclarationAst.get('variable').t;
        const letTypeHint = letdeclarationAst.get('typedec').has()
            ? letdeclarationAst.get('typedec').get('fulltypename').t
            : '';
        const type = scope.deepGet(letTypeHint);
        if (type === null && letTypeHint !== '') {
            // Try to define it if it's a generic type
            const letTypeAst = letdeclarationAst.get('typedec').get('fulltypename');
            if (letTypeAst.has('opttypegenerics')) {
                const outerType = scope.deepGet(letTypeAst.get('typename').t);
                if (outerType === null) {
                    throw new Error(`${letTypeAst.get('typename').t}  is not defined
${letdeclarationAst.t} on line ${letdeclarationAst.line}:${letdeclarationAst.char}`);
                }
                const generics = [];
                const genericAst = letTypeAst.get('opttypegenerics').get('generics');
                generics.push(genericAst.get('fulltypename').t);
                genericAst
                    .get('cdr')
                    .getAll()
                    .forEach((r) => {
                    generics.push(r.get('fulltypename').t);
                });
                outerType.solidify(generics, scope);
            }
        }
        Microstatement.fromAssignablesAst(letdeclarationAst.get('assignables'), scope, microstatements);
        // By definition the last microstatement is the const assignment we care about, so we can just
        // mutate its object to rename the output variable name to the name we need instead.
        // EXCEPT with Arrays and User Types. The last is a REREF, so follow it back to the original
        // and mutate that, instead
        let val = microstatements[microstatements.length - 1];
        if (val.statementType === StatementType_1.default.REREF) {
            val = Microstatement.fromVarName(val.alias, scope, microstatements);
        }
        val.statementType = StatementType_1.default.LETDEC;
        microstatements.push(new Microstatement(StatementType_1.default.REREF, scope, true, val.outputName, val.outputType, [], [], letAlias));
    }
    static fromConstdeclarationAst(constdeclarationAst, scope, microstatements) {
        const constName = '_' + uuid_1.v4().replace(/-/g, '_');
        const constAlias = constdeclarationAst.get('variable').t;
        const constTypeHint = constdeclarationAst.get('typedec').has()
            ? constdeclarationAst.get('typedec').get('fulltypename').t
            : '';
        const type = scope.deepGet(constTypeHint);
        if (type === null && constTypeHint !== '') {
            // Try to define it if it's a generic type
            const constTypeAst = constdeclarationAst
                .get('typedec')
                .get('fulltypename');
            if (constTypeAst.has('opttypegenerics')) {
                const outerType = scope.deepGet(constTypeAst.get('typename').t);
                if (outerType === null) {
                    throw new Error(`${constTypeAst.get('typename').t}  is not defined
${constdeclarationAst.t} on line ${constdeclarationAst.line}:${constdeclarationAst.char}`);
                }
                const generics = [];
                const genericAst = constTypeAst.get('opttypegenerics').get('generics');
                generics.push(genericAst.get('fulltypename').t);
                genericAst
                    .get('cdr')
                    .getAll()
                    .forEach((r) => {
                    generics.push(r.get('fulltypename').t);
                });
                outerType.solidify(generics, scope);
            }
        }
        Microstatement.fromAssignablesAst(constdeclarationAst.get('assignables'), scope, microstatements);
        // By definition the last microstatement is the const assignment we care about, so we can just
        // mutate its object to rename the output variable name to the name we need instead.
        microstatements.push(new Microstatement(StatementType_1.default.REREF, scope, true, microstatements[microstatements.length - 1].outputName, microstatements[microstatements.length - 1].outputType, [], [], constAlias));
    }
    // DFS recursive algo to get the microstatements in a valid ordering
    static fromStatementsAst(statementAst, scope, microstatements) {
        if (statementAst.has('declarations')) {
            if (statementAst.get('declarations').has('constdeclaration')) {
                Microstatement.fromConstdeclarationAst(statementAst.get('declarations').get('constdeclaration'), scope, microstatements);
            }
            else {
                Microstatement.fromLetdeclarationAst(statementAst.get('declarations').get('letdeclaration'), scope, microstatements);
            }
        }
        if (statementAst.has('assignments')) {
            Microstatement.fromAssignmentsAst(statementAst.get('assignments'), scope, microstatements);
        }
        if (statementAst.has('assignables')) {
            Microstatement.fromAssignablesAst(statementAst.get('assignables').get('assignables'), scope, microstatements);
        }
        if (statementAst.has('exits')) {
            Microstatement.fromExitsAst(statementAst.get('exits'), scope, microstatements);
        }
        if (statementAst.has('emits')) {
            Microstatement.fromEmitsAst(statementAst.get('emits'), scope, microstatements);
        }
        return microstatements;
    }
    static fromBaseAssignableAst(baseAssignableAsts, scope, microstatements) {
        // The base assignables array are a lightly annotated set of primitives that can be combined
        // together to produce an assignable value. Certain combinations of these primitives are invalid
        // and TODO provide good error messaging when these are encountered. A state machine of valid
        // transitions is defined below:
        //
        // null -> { var, obj, fn, const, group }
        // var -> { dot, arraccess, call, eos }
        // obj -> { dot, arraccess, eos }
        // fn -> { call, eos }
        // const -> { dot, eos }
        // group -> { dot, arraccess, eos }
        // call -> { call, arraccess, dot, eos }
        // arraccess -> { arraccess, dot, call, eos }
        //
        // Where `null` is the initial state and `eos` is end-of-statement terminating state. `var` is
        // some variable-name-like value (could be a scope, variable, property, or function name). `obj`
        // is object literal syntax, `fn` is function literal syntax, `const` is a constant literal.
        // `group)` is re-using the function call syntax to handle operator grouping (eg `2 * (3 + 4)`).
        // Because of how operators are mixed in with the assignables, the only time this syntax is used
        // as an operator grouping syntax is if it is the first element in the array. Otherwise it is
        // being used as a function call for a given function (either defined by a variable, an
        // inline-defined function, or a returned function from another call or array access) as `call`.
        // Finally `arraccess` is when an array (and ideally later a HashMap) is accessed. This mode is
        // also abusing the `obj` syntax, but only when it's an array literal with only one value and no
        // `new Array<foo>` type definition *and* when there are prior elements in the list. This means
        // `[0][0]` is unambiguous and would return a Result-wrapped zero value, for instance.
        //
        // The exact meaning of `var.var...` chains varies based on the elements of the array both
        // before and after such a chain. If the start of such a list, and if a `call` is at the end, it
        // could be something like `scope.variable.property.functionName(args)` where `.property` can
        // repeat multiple times over. Basically, to properly parse any `.var` requires both the prior
        // state *and* look-ahead to the next element in the list.
        //
        // All of this to re-iterate that for the sake of compile time, some of the complexities of the
        // grammar have been moved from the LP definition into the compiler itself for performance
        // reasons, explaining the complicated iterative logic that follows.
        let currVal = null;
        for (let i = 0; i < baseAssignableAsts.length; i++) {
            const baseassignable = baseAssignableAsts[i].get('baseassignable');
            if (baseassignable.has('methodsep')) {
                if (i === 0) {
                    throw new Error(`Invalid start of assignable statement. Cannot begin with a dot (.)
${baseassignable.t} on line ${baseassignable.line}:${baseassignable.char}`);
                }
                const prevassignable = baseAssignableAsts[i - 1].get('baseassignable');
                if (prevassignable.has('methodsep')) {
                    throw new Error(`Invalid property access. You accidentally typed a dot twice in a row.
${baseassignable.t} on line ${baseassignable.line}:${baseassignable.char}`);
                }
                else if (prevassignable.has('functions')) {
                    throw new Error(`Invalid property access. Functions do not have properties.
${baseassignable.t} on line ${baseassignable.line}:${baseassignable.char}`);
                }
                // TODO: Do we even do anything else in this branch?
            }
            else if (baseassignable.has('variable')) {
                const nextassignable = baseAssignableAsts[i + 1]
                    ? baseAssignableAsts[i + 1].get('baseassignable')
                    : undefined;
                if (!!nextassignable && nextassignable.has('fncall')) {
                    // This is a function call path
                    const fncall = nextassignable.get('fncall');
                    const argAsts = [];
                    if (fncall.get('assignablelist').has()) {
                        argAsts.push(fncall.get('assignablelist').get('assignables'));
                        fncall
                            .get('assignablelist')
                            .get('cdr')
                            .getAll()
                            .forEach((r) => {
                            argAsts.push(r.get('assignables'));
                        });
                    }
                    const argMicrostatements = argAsts.map((arg) => {
                        Microstatement.fromAssignablesAst(arg, scope, microstatements);
                        return microstatements[microstatements.length - 1];
                    });
                    if (currVal === null) {
                        // This is a basic function call
                        const realArgNames = argMicrostatements.map((arg) => arg.outputName);
                        const realArgTypes = argMicrostatements.map((arg) => arg.outputType);
                        // Do a scan of the microstatements for an inner defined closure that might exist.
                        const fn = scope.deepGet(baseassignable.get('variable').t);
                        if (!fn ||
                            !(fn instanceof Array &&
                                fn[0].microstatementInlining instanceof Function)) {
                            const fnName = baseassignable.get('variable').t;
                            let actualFnName;
                            let inlinedClosure = false;
                            for (let i = microstatements.length - 1; i >= 0; i--) {
                                if (microstatements[i].alias === fnName) {
                                    actualFnName = microstatements[i].outputName;
                                    continue;
                                }
                                if (microstatements[i].outputName === actualFnName &&
                                    microstatements[i].statementType === StatementType_1.default.CLOSUREDEF) {
                                    const m = [
                                        ...microstatements,
                                        ...microstatements[i].closureStatements,
                                    ];
                                    const fn = UserFunction_1.default.dispatchFn(microstatements[i].fns, realArgTypes, scope);
                                    const interfaceMap = new Map();
                                    Object.values(fn.getArguments()).forEach((t, i) => t.typeApplies(realArgTypes[i], scope, interfaceMap));
                                    Microstatement.closureFromUserFunction(fn, fn.scope || scope, m, interfaceMap);
                                    const closure = m.pop();
                                    microstatements.push(...closure.closureStatements.filter((s) => s.statementType !== StatementType_1.default.EXIT));
                                    currVal = microstatements[microstatements.length - 1];
                                    inlinedClosure = true;
                                    break;
                                }
                            }
                            if (!inlinedClosure) {
                                throw new Error(`${baseassignable.get('variable').t} is not a function but used as one.
${baseassignable.t} on line ${baseassignable.line}:${baseassignable.char}`);
                            }
                        }
                        else {
                            // Generate the relevant microstatements for this function. UserFunctions get inlined
                            // with the return statement turned into a const assignment as the last statement,
                            // while built-in functions are kept as function calls with the correct renaming.
                            UserFunction_1.default.dispatchFn(fn, realArgTypes, scope).microstatementInlining(realArgNames, scope, microstatements);
                            currVal = microstatements[microstatements.length - 1];
                        }
                    }
                    else if (currVal instanceof Scope_1.default) {
                        // This is calling a function by its parent scope
                        const realArgNames = argMicrostatements.map((arg) => arg.outputName);
                        const realArgTypes = argMicrostatements.map((arg) => arg.outputType);
                        const fn = currVal.deepGet(baseassignable.get('variable').t);
                        if (!fn ||
                            !(fn instanceof Array &&
                                fn[0].microstatementInlining instanceof Function)) {
                            throw new Error(`${baseassignable.get('variable').t} is not a function but used as one.
${baseassignable.t} on line ${baseassignable.line}:${baseassignable.char}`);
                        }
                        // Generate the relevant microstatements for this function. UserFunctions get inlined
                        // with the return statement turned into a const assignment as the last statement,
                        // while built-in functions are kept as function calls with the correct renaming.
                        UserFunction_1.default.dispatchFn(fn, realArgTypes, scope).microstatementInlining(realArgNames, scope, microstatements);
                        currVal = microstatements[microstatements.length - 1];
                    }
                    else {
                        // It's a method-style function call
                        const realArgNames = [
                            currVal.outputName,
                            ...argMicrostatements.map((arg) => arg.outputName),
                        ];
                        const realArgTypes = [
                            currVal.outputType,
                            ...argMicrostatements.map((arg) => arg.outputType),
                        ];
                        const fn = scope.deepGet(baseassignable.get('variable').t);
                        if (!fn ||
                            !(fn instanceof Array &&
                                fn[0].microstatementInlining instanceof Function)) {
                            throw new Error(`${baseassignable.get('variable').t} is not a function but used as one.
${baseassignable.t} on line ${baseassignable.line}:${baseassignable.char}`);
                        }
                        // Generate the relevant microstatements for this function. UserFunctions get inlined
                        // with the return statement turned into a const assignment as the last statement,
                        // while built-in functions are kept as function calls with the correct renaming.
                        UserFunction_1.default.dispatchFn(fn, realArgTypes, scope).microstatementInlining(realArgNames, scope, microstatements);
                        currVal = microstatements[microstatements.length - 1];
                    }
                    // Intentionally skip over the `fncall` block on the next iteration
                    i++;
                }
                else {
                    if (currVal === null) {
                        let thing = Microstatement.fromVarName(baseassignable.get('variable').t, scope, microstatements);
                        if (!thing) {
                            thing = scope.deepGet(baseassignable.get('variable').t);
                        }
                        if (!thing) {
                            throw new Error(`${baseassignable.get('variable').t} not found.
  ${baseassignable.t} on line ${baseassignable.line}:${baseassignable.char}`);
                        }
                        currVal = thing;
                    }
                    else if (currVal instanceof Scope_1.default) {
                        const thing = currVal.deepGet(baseassignable.get('variable').t);
                        if (!thing) {
                            throw new Error(`${baseassignable.get('variable').t} not found in other scope.
  ${baseassignable.t} on line ${baseassignable.line}:${baseassignable.char}`);
                        }
                        currVal = thing;
                    }
                    else if (currVal instanceof Microstatement) {
                        const fieldName = baseassignable.get('variable').t;
                        const fields = Object.keys(currVal.outputType.properties);
                        const fieldNum = fields.indexOf(fieldName);
                        if (fieldNum < 0) {
                            // Invalid object access
                            throw new Error(`${fieldName} property not found.
  ${baseassignable.t} on line ${baseassignable.line}:${baseassignable.char}`);
                        }
                        // Create a new variable to hold the address within the array literal
                        const addrName = '_' + uuid_1.v4().replace(/-/g, '_');
                        microstatements.push(new Microstatement(StatementType_1.default.CONSTDEC, scope, true, addrName, Type_1.default.builtinTypes['int64'], [`${fieldNum}`], []));
                        // Insert a `register` opcode.
                        const opcodes = require('./opcodes').default;
                        opcodes.exportScope
                            .get('register')[0]
                            .microstatementInlining([currVal.outputName, addrName], scope, microstatements);
                        // We'll need a reference to this for later
                        const typeRecord = currVal;
                        // Set the original to this newly-generated microstatement
                        currVal = microstatements[microstatements.length - 1];
                        // Now we do something odd, but correct here; we need to replace the `outputType` from
                        // `any` to the type that was actually copied so function resolution continues to work
                        currVal.outputType = typeRecord.outputType.properties[fieldName];
                    }
                    else {
                        // What is this?
                        throw new Error(`Impossible path found. Bug in compiler, please report!
Previous value type: ${typeof currVal}
${baseassignable.t} on line ${baseassignable.line}:${baseassignable.char}`);
                    }
                }
            }
            else if (baseassignable.has('constants')) {
                if (currVal !== null) {
                    throw new Error(`Unexpected constant value detected.
Previous value type: ${typeof currVal}
${baseassignable.t} on line ${baseassignable.line}:${baseassignable.char}`);
                }
                Microstatement.fromConstantsAst(baseassignable.get('constants'), scope, microstatements);
                currVal = microstatements[microstatements.length - 1];
            }
            else if (baseassignable.has('functions')) {
                if (currVal !== null) {
                    throw new Error(`Unexpected function definition detected.
Previous value type: ${typeof currVal}
${baseassignable.t} on line ${baseassignable.line}:${baseassignable.char}`);
                }
                // So the closures eval correctly, we add the alias microstatements to the scope
                // TODO: Is this the right approach?
                microstatements
                    .filter((m) => !!m.alias)
                    .forEach((m) => scope.put(m.alias, m));
                const fn = UserFunction_1.default.fromFunctionsAst(baseassignable.get('functions'), scope);
                currVal = fn;
            }
            else if (baseassignable.has('objectliterals')) {
                if (currVal === null) {
                    // Has to be a "normal" object literal in this case
                    Microstatement.fromObjectLiteralsAst(baseassignable.get('objectliterals'), scope, microstatements);
                    currVal = microstatements[microstatements.length - 1];
                }
                else {
                    // Can only be an array accessor syntax
                    const objlit = baseassignable.get('objectliterals');
                    if (objlit.has('typeliteral') ||
                        objlit.get('arrayliteral').has('fullarrayliteral')) {
                        throw new Error(`Unexpected object literal definition detected.
Previous value type: ${typeof currVal}
${baseassignable.t} on line ${baseassignable.line}:${baseassignable.char}`);
                    }
                    const arrbase = objlit.get('arrayliteral').get('arraybase');
                    if (!arrbase.get('assignablelist').has() ||
                        arrbase.get('assignablelist').get('cdr').getAll().length > 0) {
                        throw new Error(`Array access must provide only one index value to query the array with
${baseassignable.t} on line ${baseassignable.line}:${baseassignable.char}`);
                    }
                    const assignableAst = arrbase
                        .get('assignablelist')
                        .get('assignables');
                    Microstatement.fromAssignablesAst(assignableAst, scope, microstatements);
                    const arrIndex = microstatements[microstatements.length - 1];
                    if (!(currVal instanceof Microstatement) ||
                        currVal.outputType.originalType.typename !== 'Array') {
                        throw new Error(`Array access may only be performed on arrays.
Previous value type: ${currVal.outputType.typename}
${baseassignable.t} on line ${baseassignable.line}:${baseassignable.char}`);
                    }
                    if (arrIndex.outputType.typename === 'int64') {
                        const opcodes = require('./opcodes').default;
                        // Create a new variable to hold the `okR` size value
                        const sizeName = '_' + uuid_1.v4().replace(/-/g, '_');
                        microstatements.push(new Microstatement(StatementType_1.default.CONSTDEC, scope, true, sizeName, Type_1.default.builtinTypes['int64'], ['8'], []));
                        // Insert an `okR` opcode.
                        opcodes.exportScope
                            .get('okR')[0]
                            .microstatementInlining([arrIndex.outputName, sizeName], scope, microstatements);
                        const wrapped = microstatements[microstatements.length - 1];
                        // Insert a `resfrom` opcode.
                        opcodes.exportScope
                            .get('resfrom')[0]
                            .microstatementInlining([currVal.outputName, wrapped.outputName], scope, microstatements);
                    }
                    else if (arrIndex.outputType.typename === 'Result<int64>') {
                        const opcodes = require('./opcodes').default;
                        // Insert a `resfrom` opcode.
                        opcodes.exportScope
                            .get('resfrom')[0]
                            .microstatementInlining([currVal.outputName, arrIndex.outputName], scope, microstatements);
                    }
                    else {
                        throw new Error(`Array access must be done with an int64 or Result<int64> value
${baseassignable.t} on line ${baseassignable.line}:${baseassignable.char}`);
                    }
                    // We'll need a reference to this for later
                    const arrayRecord = currVal;
                    // Update to this newly-generated microstatement
                    currVal = microstatements[microstatements.length - 1];
                    // Now we do something odd, but correct here; we need to replace the `outputType` from
                    // `any` to the type that was actually copied so function resolution continues to work
                    currVal.outputType = Type_1.default.builtinTypes.Result.solidify([Object.values(arrayRecord.outputType.properties)[0].typename], scope);
                }
            }
            else if (baseassignable.has('fncall')) {
                // It's a `fncall` syntax block but it wasn't caught in a function call before, so it's
                // either a function call on a returned function type, or it's an assignable group
                if (!currVal) {
                    // It's probably an assignable group
                    if (!baseassignable.get('fncall').get('assignablelist').has() ||
                        baseassignable
                            .get('fncall')
                            .get('assignablelist')
                            .get('cdr')
                            .getAll().length > 0) {
                        throw new Error(`Expected a group of assignable values, but got a function call signature.
${baseassignable.t} on line ${baseassignable.line}:${baseassignable.char}`);
                    }
                    // It *is* an assignable group!
                    Microstatement.fromAssignablesAst(baseassignable
                        .get('fncall')
                        .get('assignablelist')
                        .get('assignables'), scope, microstatements);
                    currVal = microstatements[microstatements.length - 1];
                }
                else {
                    // TODO: handle functions/closures being called from access out of other function returns
                    // and the like
                }
            }
            else {
                throw new Error(`Compiler error! Completely unhandled input.
${baseassignable.t} on line ${baseassignable.line}:${baseassignable.char}`);
            }
        }
        if (!(currVal instanceof Microstatement)) {
            if (currVal instanceof UserFunction_1.default) {
                Microstatement.closureDef([currVal], currVal.scope || scope, microstatements);
            }
            else if (currVal instanceof Array &&
                currVal[0] instanceof UserFunction_1.default) {
                Microstatement.closureDef(currVal, currVal[0].scope || scope, microstatements);
            }
        }
        else if (currVal.statementType !== StatementType_1.default.EMIT) {
            microstatements.push(new Microstatement(StatementType_1.default.REREF, scope, true, currVal.outputName, currVal.outputType, [], [], currVal.alias));
        }
    }
    static fromAssignablesAst(assignablesAst, scope, microstatements) {
        const withoperators = assignablesAst.getAll();
        const withOperatorsList = [];
        for (const operatorOrAssignable of withoperators) {
            if (operatorOrAssignable.get('withoperators').has('operators')) {
                const operator = operatorOrAssignable
                    .get('withoperators')
                    .get('operators')
                    .get(1);
                const op = scope.get(operator.t);
                if (op == null || !(op instanceof Array && op[0] instanceof Operator_1.default)) {
                    throw new Error('Operator ' + operator.t + ' is not defined');
                }
                withOperatorsList.push(op);
            }
            else if (operatorOrAssignable.get('withoperators').has('baseassignablelist')) {
                Microstatement.fromBaseAssignableAst(operatorOrAssignable
                    .get('withoperators')
                    .get('baseassignablelist')
                    .getAll(), scope, microstatements);
                const last = microstatements[microstatements.length - 1];
                withOperatorsList.push(last);
            }
        }
        // Now to combine these operators and values in the correct order. A compiled language could
        // never do something so inefficient, but I don't care about performance right now, so here's
        // the algorithm: while the list length is greater than 1, perform the two steps:
        // 1. Find the operator with the greatest precedence
        // 2. Apply the underlying function to the values on either side of the operator (or just the
        //    right side if the operator is a prefix operator), then replace the operator with the
        //    returned value in the list and delete the impacted values.
        while (withOperatorsList.length > 1) {
            let maxPrecedence = -1;
            let maxOperatorLoc = -1;
            let maxOperatorListLoc = -1;
            for (let i = 0; i < withOperatorsList.length; i++) {
                if (withOperatorsList[i] instanceof Array &&
                    withOperatorsList[i][0] instanceof Operator_1.default) {
                    const ops = withOperatorsList[i];
                    let op = null;
                    let operatorListLoc = -1;
                    let operatorPrecedence = -127;
                    if (ops.length == 1) {
                        op = ops[0];
                        operatorListLoc = 0;
                    }
                    else {
                        // TODO: We need to identify which particular operator applies in this case.
                        // We're just going to short-circuit this process on the first operator that matches
                        // but we need to come up with a "best match" behavior (ie, if one argument is an int8
                        // it may choose the int64-based operator because it was first and it can cast int8 to
                        // int64 and then miss the specialized int8 version of the function).
                        let left = null;
                        if (i != 0)
                            left = withOperatorsList[i - 1];
                        let right = null;
                        if (i != withOperatorsList.length - 1)
                            right = withOperatorsList[i + 1];
                        // Skip over any operator that is followed by another operator as it must be a prefix
                        // operator (or a syntax error, but we'll catch that later)
                        if (right === null || right instanceof Microstatement) {
                            for (let j = 0; j < ops.length; j++) {
                                if (ops[j].precedence > operatorPrecedence &&
                                    ops[j].applicableFunction(!left // Left is special, if two operators are in a row, this one
                                        ? null // needs to be a prefix operator for this to work at all
                                        : left instanceof Microstatement
                                            ? left.outputType
                                            : null, right === null ? null : right.outputType, scope) != null) {
                                    op = ops[j];
                                    operatorListLoc = j;
                                    operatorPrecedence = op.precedence;
                                }
                            }
                        }
                        // During the process of determining the operator ordering, there may be tests that
                        // will not match because operator precedence will convert the neighboring types into
                        // types that will match. This is complicated and doing this statically will be more
                        // difficult, but for now, just skip over these.
                        if (op == null)
                            continue;
                    }
                    if (op.precedence > maxPrecedence) {
                        maxPrecedence = op.precedence;
                        maxOperatorLoc = i;
                        maxOperatorListLoc = operatorListLoc;
                    }
                }
            }
            if (maxPrecedence == -1 || maxOperatorLoc == -1) {
                let errMsg = `Cannot resolve operators with remaining statement
${assignablesAst.t}`;
                const withOperatorsTranslation = [];
                for (let i = 0; i < withOperatorsList.length; i++) {
                    const node = withOperatorsList[i];
                    if (node instanceof Array && node[0] instanceof Operator_1.default) {
                        withOperatorsTranslation.push(node[0].name);
                    }
                    else {
                        withOperatorsTranslation.push('<' + node.outputType.typename + '>');
                    }
                }
                errMsg += '\n' + withOperatorsTranslation.join(' ');
                throw new Error(errMsg);
            }
            const op = withOperatorsList[maxOperatorLoc][maxOperatorListLoc];
            const realArgNames = [];
            const realArgTypes = [];
            if (!op.isPrefix) {
                const left = withOperatorsList[maxOperatorLoc - 1];
                realArgNames.push(left.outputName);
                realArgTypes.push(left.outputType);
            }
            const right = withOperatorsList[maxOperatorLoc + 1];
            realArgNames.push(right.outputName);
            realArgTypes.push(right.outputType);
            UserFunction_1.default.dispatchFn(op.potentialFunctions, realArgTypes, scope).microstatementInlining(realArgNames, scope, microstatements);
            const last = microstatements[microstatements.length - 1];
            withOperatorsList[maxOperatorLoc] = last;
            withOperatorsList.splice(maxOperatorLoc + 1, 1);
            if (!op.isPrefix) {
                withOperatorsList.splice(maxOperatorLoc - 1, 1);
            }
        }
    }
    static fromStatement(statement, microstatements, secondaryScope = null) {
        let actualStatement = statement;
        if (secondaryScope !== null) {
            const newScope = new Scope_1.default(statement.scope);
            newScope.secondaryPar = secondaryScope;
            actualStatement = new Statement_1.default(statement.statementAst, newScope, statement.pure);
        }
        Microstatement.fromStatementsAst(actualStatement.statementAst, actualStatement.scope, microstatements);
    }
}
exports.default = Microstatement;

},{"./Ast":9,"./Constant":10,"./Event":11,"./Operator":14,"./Scope":15,"./Statement":16,"./StatementType":17,"./Type":18,"./UserFunction":19,"./opcodes":21,"uuid":70}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Ast = require("./Ast");
const Constant_1 = require("./Constant");
const Event_1 = require("./Event");
const Operator_1 = require("./Operator");
const Scope_1 = require("./Scope");
const UserFunction_1 = require("./UserFunction");
const Type_1 = require("./Type");
const modules = {};
class Module {
    constructor(rootScope) {
        // Thoughts on how to handle this right now:
        // 1. The outermost module scope is read-only always.
        // 2. Therefore anything in the export scope can simply be duplicated in both scopes
        // 3. Therefore export scope needs access to the module scope so the functions function, but
        //    the module scope can just use its local copy
        this.moduleScope = new Scope_1.default(rootScope);
        this.exportScope = new Scope_1.default(this.moduleScope);
    }
    static getAllModules() {
        return modules;
    }
    static populateModule(path, ast, // ModuleContext
    rootScope, isStd = false) {
        // First, take the export scope of the root scope and put references to it in this module. If
        // it is a built-in std module, it inherits from the root scope, otherwise it attaches all
        // exported references. This way std modules get access to the opcode scope via inheritance and
        // 'normal' modules do not.
        const module = new Module(isStd ? rootScope : undefined);
        if (!isStd) {
            for (const rootModuleName of Object.keys(rootScope.vals)) {
                module.moduleScope.put(rootModuleName, rootScope.vals[rootModuleName]);
            }
        }
        // Now, populate all of the imports
        const imports = ast.get('imports').getAll();
        for (const importAst of imports) {
            // If it's a "standard" import, figure out what name to call it (if the user overrode it)
            // and then attach the entire module with that name to the local scope.
            if (importAst.has('standardImport')) {
                const standardImport = importAst.get('standardImport');
                let importName;
                if (standardImport.get('renamed').has()) {
                    importName = standardImport.get('renamed').get('varop').t;
                }
                else {
                    const nameParts = standardImport.get('dependency').t.split('/');
                    importName = nameParts[nameParts.length - 1];
                }
                const importedModule = modules[Ast.resolveDependency(path, importAst.get('standardImport').get('dependency'))];
                module.moduleScope.put(importName, importedModule.exportScope);
            }
            // If it's a "from" import, we're picking off pieces of the exported scope and inserting them
            // also potentially renaming them if requested by the user
            if (importAst.has('fromImport')) {
                const importedModule = modules[Ast.resolveDependency(path, importAst.get('fromImport').get('dependency'))];
                const vars = [];
                vars.push(importAst.get('fromImport').get('varlist').get('renameablevar'));
                importAst
                    .get('fromImport')
                    .get('varlist')
                    .get('cdr')
                    .getAll()
                    .forEach((r) => {
                    vars.push(r.get('renameablevar'));
                });
                for (const moduleVar of vars) {
                    const exportName = moduleVar.get('varop').t;
                    let importName = exportName;
                    if (moduleVar.get('renamed').has()) {
                        importName = moduleVar.get('renamed').get('varop').t;
                    }
                    const thing = importedModule.exportScope.shallowGet(exportName);
                    if (thing instanceof Array &&
                        thing[0].microstatementInlining instanceof Function) {
                        const otherthing = module.moduleScope.deepGet(importName);
                        if (!!otherthing &&
                            otherthing instanceof Array &&
                            otherthing[0].microstatementInlining instanceof Function) {
                            module.moduleScope.put(importName, [...thing, ...otherthing]);
                        }
                        else {
                            module.moduleScope.put(importName, thing);
                        }
                    }
                    else if (thing instanceof Array && thing[0] instanceof Operator_1.default) {
                        const otherthing = module.moduleScope.deepGet(importName);
                        if (!!otherthing &&
                            otherthing instanceof Array &&
                            otherthing instanceof Operator_1.default) {
                            module.moduleScope.put(importName, [...thing, ...otherthing]);
                        }
                        else {
                            module.moduleScope.put(importName, thing);
                        }
                    }
                    else {
                        module.moduleScope.put(importName, thing);
                    }
                    // Special behavior for interfaces. If there are any functions or operators that match
                    // the interface, pull them in. Similarly any types that match the entire interface. This
                    // allows concise importing of a related suite of tools without having to explicitly call
                    // out each one.
                    if (thing instanceof Type_1.Type && thing.iface) {
                        const iface = thing.iface;
                        const typesToCheck = Object.keys(importedModule.exportScope.vals)
                            .map((n) => importedModule.exportScope.vals[n])
                            .filter((v) => v instanceof Type_1.Type);
                        const fnsToCheck = Object.keys(importedModule.exportScope.vals)
                            .map((n) => importedModule.exportScope.vals[n])
                            .filter((v) => v instanceof Array &&
                            v[0].microstatementInlining instanceof Function);
                        const opsToCheck = Object.keys(importedModule.exportScope.vals)
                            .map((n) => importedModule.exportScope.vals[n])
                            .filter((v) => v instanceof Array && v[0] instanceof Operator_1.default);
                        typesToCheck
                            .filter((t) => iface.typeApplies(t, importedModule.exportScope))
                            .forEach((t) => {
                            module.moduleScope.put(t.typename, t);
                        });
                        fnsToCheck
                            .filter((fn) => {
                            // TODO: Make this better and move it to the Interface file in the future
                            return iface.functionTypes.some((ft) => ft.functionname === fn[0].getName());
                        })
                            .forEach((fn) => {
                            module.moduleScope.put(fn[0].getName(), fn);
                        });
                        opsToCheck
                            .filter((op) => {
                            return iface.operatorTypes.some((ot) => ot.operatorname === op[0].name);
                        })
                            .forEach((op) => {
                            module.moduleScope.put(op[0].name, op);
                        });
                    }
                }
            }
        }
        const body = ast.get('body').getAll();
        // Next, types
        const types = body.filter((r) => r.has('types')).map((r) => r.get('types'));
        for (const typeAst of types) {
            const newType = Type_1.Type.fromAst(typeAst, module.moduleScope);
            module.moduleScope.put(newType.typename, newType.alias ? newType.alias : newType);
        }
        // Next, interfaces
        const interfaces = body
            .filter((r) => r.has('interfaces'))
            .map((r) => r.get('interfaces'));
        for (const interfaceAst of interfaces) {
            Type_1.Interface.fromAst(interfaceAst, module.moduleScope);
            // Automatically inserts the interface into the module scope, we're done.
        }
        // Next, constants
        const constdeclarations = body
            .filter((r) => r.has('constdeclaration'))
            .map((r) => r.get('constdeclaration'));
        for (const constdeclaration of constdeclarations) {
            Constant_1.default.fromAst(constdeclaration, module.moduleScope);
        }
        // Next, events
        const events = body
            .filter((r) => r.has('events'))
            .map((r) => r.get('events'));
        for (const eventAst of events) {
            const newEvent = Event_1.default.fromAst(eventAst, module.moduleScope);
            module.moduleScope.put(newEvent.name, newEvent);
        }
        // Next, functions
        const functions = body
            .filter((r) => r.has('functions'))
            .map((r) => r.get('functions'));
        for (const functionAst of functions) {
            const newFunc = UserFunction_1.default.fromAst(functionAst, module.moduleScope);
            if (newFunc.getName() == null) {
                throw new Error('Module-level functions must have a name');
            }
            const fns = module.moduleScope.get(newFunc.getName());
            if (fns == null) {
                module.moduleScope.put(newFunc.getName(), [newFunc]);
            }
            else {
                fns.push(newFunc);
            }
        }
        // Next, operators
        const operatorMapping = body
            .filter((r) => r.has('operatormapping'))
            .map((r) => r.get('operatormapping'));
        for (const operatorAst of operatorMapping) {
            const isPrefix = operatorAst.get('fix').has('prefix');
            const name = operatorAst
                .get('opmap')
                .get()
                .get('fntoop')
                .get('operators')
                .t.trim();
            const precedence = parseInt(operatorAst.get('opmap').get().get('opprecedence').get('num').t, 10);
            const fns = module.moduleScope.deepGet(operatorAst.get('opmap').get().get('fntoop').get('fnname').t);
            if (!fns) {
                throw new Error('Operator ' +
                    name +
                    ' declared for unknown function ' +
                    operatorAst.t);
            }
            const op = new Operator_1.default(name, precedence, isPrefix, fns);
            const opsBox = module.moduleScope.deepGet(name);
            if (!opsBox) {
                module.moduleScope.put(name, [op]);
            }
            else {
                // To make sure we don't accidentally mutate other scopes, we're cloning this operator list
                const ops = [...opsBox];
                ops.push(op);
                module.moduleScope.put(name, ops);
            }
        }
        // Next, exports, which can be most of the above
        const exports = body
            .filter((r) => r.has('exportsn'))
            .map((r) => r.get('exportsn').get('exportable'));
        for (const exportAst of exports) {
            if (exportAst.has('ref')) {
                const exportVar = module.moduleScope.deepGet(exportAst.get('ref').t);
                const splitName = exportAst.get('ref').t.split('.');
                module.moduleScope.put(splitName[splitName.length - 1], exportVar);
                module.exportScope.put(splitName[splitName.length - 1], exportVar);
            }
            else if (exportAst.has('types')) {
                const newType = Type_1.Type.fromAst(exportAst.get('types'), module.moduleScope);
                const typeBox = !newType.alias ? newType : newType.alias;
                module.moduleScope.put(newType.typename, typeBox);
                module.exportScope.put(newType.typename, typeBox);
            }
            else if (exportAst.has('interfaces')) {
                // Automatically inserts the interface into the module scope
                const interfaceBox = Type_1.Interface.fromAst(exportAst.get('interfaces'), module.moduleScope);
                module.exportScope.put(interfaceBox.typename, interfaceBox);
            }
            else if (exportAst.has('constdeclaration')) {
                const constVal = Constant_1.default.fromAst(exportAst.get('constdeclaration'), module.moduleScope);
                module.exportScope.put(constVal.name, constVal);
            }
            else if (exportAst.has('functions')) {
                const newFunc = UserFunction_1.default.fromAst(exportAst.get('functions'), module.moduleScope);
                if (!newFunc.getName()) {
                    throw new Error(`Module-level functions must have a name:
${exportAst.get('functions').t}
`);
                }
                // Exported scope must be checked first because it will fall through to the not-exported
                // scope by default.
                const expFns = module.exportScope.shallowGet(newFunc.getName());
                if (!expFns) {
                    module.exportScope.put(newFunc.getName(), [newFunc]);
                }
                else {
                    expFns.push(newFunc);
                }
                const modFns = module.moduleScope.get(newFunc.getName());
                if (!modFns) {
                    module.moduleScope.put(newFunc.getName(), [newFunc]);
                }
                else {
                    modFns.push(newFunc);
                }
            }
            else if (exportAst.has('operatormapping')) {
                const operatorAst = exportAst.get('operatormapping');
                const isPrefix = operatorAst.get('fix').has('prefix');
                const name = operatorAst
                    .get('opmap')
                    .get()
                    .get('fntoop')
                    .get('operators')
                    .t.trim();
                const precedence = parseInt(operatorAst.get('opmap').get().get('opprecedence').get('num').t, 10);
                let fns = module.moduleScope.deepGet(operatorAst.get('opmap').get().get('fntoop').get('fnname').t);
                if (!fns) {
                    fns = module.moduleScope.deepGet(operatorAst.get('opmap').get().get('fntoop').get('fnname').t);
                    if (fns) {
                        throw new Error('Exported operator ' +
                            name +
                            ' wrapping unexported function ' +
                            operatorAst.get('opmap').get('fntoop').get('fnname').t +
                            ' which is not allowed, please export the function, as well.');
                    }
                    throw new Error('Operator ' +
                        name +
                        ' declared for unknown function ' +
                        operatorAst.get('opmap').get('fntoop').get('fnname').t);
                }
                const op = new Operator_1.default(name, precedence, isPrefix, fns);
                const modOpsBox = module.moduleScope.deepGet(name);
                if (!modOpsBox) {
                    module.moduleScope.put(name, [op]);
                }
                else {
                    const ops = [...modOpsBox];
                    ops.push(op);
                    module.moduleScope.put(name, ops);
                }
                const expOpsBox = module.exportScope.deepGet(name);
                if (!expOpsBox) {
                    module.exportScope.put(name, [op]);
                }
                else {
                    const ops = [...expOpsBox];
                    ops.push(op);
                    module.exportScope.put(name, ops);
                }
            }
            else if (exportAst.has('events')) {
                const newEvent = Event_1.default.fromAst(exportAst.get('events'), module.moduleScope);
                module.moduleScope.put(newEvent.name, newEvent);
                module.exportScope.put(newEvent.name, newEvent);
            }
            else {
                // What?
                throw new Error('What should be an impossible export state has been reached.');
            }
        }
        // Finally, event handlers, so they can depend on events that are exported from the same module
        const handlers = body
            .filter((r) => r.has('handlers'))
            .map((r) => r.get('handlers'));
        for (const handlerAst of handlers) {
            const evt = module.moduleScope.deepGet(handlerAst.get('eventname').t);
            if (!evt)
                throw new Error('Could not find specified event: ' + handlerAst.get('eventname').t);
            if (!(evt instanceof Event_1.default))
                throw new Error(handlerAst.get('eventname').t + ' is not an event');
            const handler = handlerAst.get('handler');
            let fn = null;
            if (handler.has('fnname')) {
                const fnName = handler.get('fnname').t;
                const fns = module.moduleScope.deepGet(fnName);
                if (!fns)
                    throw new Error('Could not find specified function: ' + fnName);
                if (!(fns instanceof Array &&
                    fns[0].microstatementInlining instanceof Function)) {
                    throw new Error(fnName + ' is not a function');
                }
                for (let i = 0; i < fns.length; i++) {
                    if (evt.type.typename === 'void' &&
                        Object.values(fns[i].getArguments()).length === 0) {
                        fn = fns[i];
                        break;
                    }
                    const argTypes = Object.values(fns[i].getArguments());
                    if (argTypes.length !== 1)
                        continue;
                    if (argTypes[0] == evt.type) {
                        fn = fns[i];
                        break;
                    }
                }
                if (fn == null) {
                    throw new Error('Could not find function named ' +
                        fnName +
                        ' with matching function signature');
                }
            }
            if (handler.has('functions')) {
                fn = UserFunction_1.default.fromAst(handler.get('functions'), module.moduleScope);
            }
            if (handler.has('functionbody')) {
                fn = UserFunction_1.default.fromAst(handler.get('functionbody'), module.moduleScope);
            }
            if (!fn) {
                // Shouldn't be possible
                throw new Error('Impossible state reached processing event handler');
            }
            if (Object.keys(fn.getArguments()).length > 1 ||
                (evt.type === Type_1.Type.builtinTypes['void'] &&
                    Object.keys(fn.getArguments()).length !== 0)) {
                throw new Error('Function provided for ' +
                    handlerAst.get('eventname').t +
                    ' has invalid argument signature');
            }
            evt.handlers.push(fn);
        }
        return module;
    }
    static modulesFromAsts(astMap, rootScope) {
        const modulePaths = Object.keys(astMap);
        while (modulePaths.length > 0) {
            for (let i = 0; i < modulePaths.length; i++) {
                const path = modulePaths[i];
                const moduleAst = astMap[path];
                const imports = Ast.resolveImports(path, moduleAst);
                let loadable = true;
                for (const importPath of imports) {
                    if (importPath[0] === '@')
                        continue;
                    if (modules.hasOwnProperty(importPath))
                        continue;
                    loadable = false;
                }
                if (!loadable)
                    continue;
                modulePaths.splice(i, 1);
                i--;
                const module = Module.populateModule(path, moduleAst, rootScope);
                modules[path] = module;
            }
        }
        return modules;
    }
}
exports.default = Module;

},{"./Ast":9,"./Constant":10,"./Event":11,"./Operator":14,"./Scope":15,"./Type":18,"./UserFunction":19}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Ast = require("./Ast");
const Type_1 = require("./Type");
class Operator {
    constructor(name, precedence, isPrefix, potentialFunctions) {
        this.name = name;
        this.precedence = precedence;
        this.isPrefix = isPrefix;
        this.potentialFunctions = potentialFunctions;
    }
    applicableFunction(left, right, scope) {
        const argumentTypeList = [];
        if (!this.isPrefix) {
            if (left == null)
                return null;
            argumentTypeList.push(left);
        }
        argumentTypeList.push(right);
        const fns = this.potentialFunctions;
        for (let i = 0; i < fns.length; i++) {
            const args = fns[i].getArguments();
            const argList = Object.values(args);
            if (argList.length != argumentTypeList.length)
                continue;
            let skip = false;
            for (let j = 0; j < argList.length; j++) {
                if (argList[j].typename === argumentTypeList[j].typename)
                    continue;
                if (argList[j].iface &&
                    argList[j].iface.typeApplies(argumentTypeList[j], scope))
                    continue;
                if (argList[j].generics.length > 0 &&
                    argumentTypeList[j].originalType == argList[j]) {
                    continue;
                }
                if (argList[j].originalType != null &&
                    argumentTypeList[j].originalType == argList[j].originalType) {
                    const argListAst = Ast.fulltypenameAstFromString(argList[j].typename);
                    const argumentTypeListAst = Ast.fulltypenameAstFromString(argumentTypeList[j].typename);
                    const argGenericTypes = [];
                    if (argListAst.has('opttypegenerics')) {
                        argGenericTypes.push(argListAst
                            .get('opttypegenerics')
                            .get('generics')
                            .get('fulltypename').t);
                        argListAst
                            .get('opttypegenerics')
                            .get('generics')
                            .get('cdr')
                            .getAll()
                            .map((r) => {
                            argGenericTypes.push(r.get('fulltypename').t);
                        });
                    }
                    const argumentGenericTypes = [];
                    if (argumentTypeListAst.has('opttypegenerics')) {
                        argumentGenericTypes.push(argumentTypeListAst
                            .get('opttypegenerics')
                            .get('generics')
                            .get('fulltypename').t);
                        argumentTypeListAst
                            .get('opttypegenerics')
                            .get('generics')
                            .get('cdr')
                            .getAll()
                            .map((r) => {
                            argumentGenericTypes.push(r.get('fulltypename').t);
                        });
                    }
                    let innerSkip = false;
                    for (let i = 0; i < argGenericTypes.length; i++) {
                        const argListTypeProp = argGenericTypes[i];
                        const argumentTypeListTypeProp = argumentGenericTypes[i];
                        if (argListTypeProp === argumentTypeListTypeProp)
                            continue;
                        const argListProp = scope.deepGet(argListTypeProp);
                        const argumentTypeListProp = scope.deepGet(argumentTypeListTypeProp);
                        if (!argListProp || !(argListProp instanceof Type_1.default)) {
                            innerSkip = true;
                            break;
                        }
                        if (!argumentTypeListProp ||
                            !(argumentTypeListProp instanceof Type_1.default)) {
                            innerSkip = true;
                            break;
                        }
                        if (argListProp.iface != null &&
                            argListProp.iface.typeApplies(argumentTypeListProp, scope))
                            continue;
                        innerSkip = true;
                    }
                    if (innerSkip)
                        skip = true;
                    continue;
                }
                skip = true;
            }
            if (skip)
                continue;
            return fns[i];
        }
        return null;
    }
}
exports.default = Operator;

},{"./Ast":9,"./Type":18}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Scope {
    constructor(par) {
        this.vals = {};
        this.par = par ? par : null;
        this.secondaryPar = null;
    }
    get(name) {
        if (this.vals.hasOwnProperty(name)) {
            return this.vals[name];
        }
        if (this.par) {
            const val = this.par.get(name);
            if (!val && !!this.secondaryPar) {
                return this.secondaryPar.get(name);
            }
            else {
                return val;
            }
        }
        return null;
    }
    shallowGet(name) {
        if (this.vals.hasOwnProperty(name)) {
            return this.vals[name];
        }
        return null;
    }
    deepGet(fullName) {
        const fullVar = fullName.trim().split('.');
        let boxedVar;
        for (let i = 0; i < fullVar.length; i++) {
            if (i === 0) {
                boxedVar = this.get(fullVar[i]);
            }
            else if (!boxedVar) {
                return null;
            }
            else {
                if (boxedVar instanceof Scope) {
                    boxedVar = boxedVar.get(fullVar[i]);
                }
                else {
                    return null;
                }
            }
        }
        return boxedVar;
    }
    has(name) {
        if (this.vals.hasOwnProperty(name)) {
            return true;
        }
        if (this.par) {
            return this.par.has(name);
        }
        return false;
    }
    put(name, val) {
        this.vals[name.trim()] = val;
    }
}
exports.default = Scope;

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Only implements the pieces necessary for the first stage compiler
class Statement {
    constructor(statementAst, scope, pure) {
        (this.statementAst = statementAst), (this.scope = scope);
        this.pure = pure;
    }
    isConditionalStatement() {
        return this.statementAst.has('conditionals');
    }
    isReturnStatement() {
        return this.statementAst.has('exits');
    }
    static baseAssignableHasObjectLiteral(baseAssignableAst) {
        return baseAssignableAst.has('objectliterals');
    }
    static assignablesHasObjectLiteral(assignablesAst) {
        for (const w of assignablesAst.getAll()) {
            const wo = w.get('withoperators');
            if (wo.has('operators'))
                continue;
            for (const b of wo.get('baseassignablelist').getAll()) {
                const ba = b.get('baseassignable');
                if (Statement.baseAssignableHasObjectLiteral(ba))
                    return true;
                if (ba.has('fncall') && ba.get('fncall').has('assignablelist')) {
                    const innerAssignables = [];
                    innerAssignables.push(ba.get('fncall').get('assignablelist').get('assignables'));
                    ba.get('fncall')
                        .get('assignablelist')
                        .get('cdr')
                        .getAll()
                        .map((a) => {
                        innerAssignables.push(a.get('assignables'));
                    });
                    for (const ia of innerAssignables) {
                        if (Statement.assignablesHasObjectLiteral(ia))
                            return true;
                    }
                }
            }
        }
        return false;
    }
    static assignmentsHasObjectLiteral(assignmentsAst) {
        return Statement.assignablesHasObjectLiteral(assignmentsAst.get('assignables'));
    }
    hasObjectLiteral() {
        const s = this.statementAst;
        if (s.has('declarations')) {
            const d = s.get('declarations').has('constdeclaration')
                ? s.get('declarations').get('constdeclaration')
                : s.get('declarations').get('letdeclaration');
            return Statement.assignablesHasObjectLiteral(d.get('assignables'));
        }
        if (s.has('assignments'))
            return Statement.assignmentsHasObjectLiteral(s.get('assignments'));
        if (s.has('assignables'))
            return Statement.assignablesHasObjectLiteral(s.get('assignables'));
        if (s.has('exits') && s.get('exits').get('retval').has('assignables')) {
            return Statement.assignablesHasObjectLiteral(s.get('exits').get('retval').get('assignables'));
        }
        if (s.has('emits') && s.get('emits').get('retval').has('assignables')) {
            return Statement.assignablesHasObjectLiteral(s.get('emits').get('retval').get('assignables'));
        }
        // TODO: Cover conditionals
        return false;
    }
    static isAssignablePure(assignableAst, scope) {
        // TODO: Redo this
        return true;
    }
    static create(statementAst, scope) {
        if (statementAst instanceof Error)
            throw statementAst;
        let pure = true;
        if (statementAst.has('declarations')) {
            if (statementAst.get('declarations').has('constdeclaration')) {
                pure = Statement.isAssignablePure(statementAst
                    .get('declarations')
                    .get('constdeclaration')
                    .get('assignables'), scope);
            }
            else if (statementAst.get('declarations').has('letdeclaration')) {
                pure = Statement.isAssignablePure(statementAst
                    .get('declarations')
                    .get('letdeclaration')
                    .get('assignables'), scope);
            }
            else {
                throw new Error('Malformed AST. Invalid const/let declaration structure');
            }
        }
        if (statementAst.has('assignments')) {
            if (statementAst.get('assignments').has('assignables')) {
                pure = Statement.isAssignablePure(statementAst.get('assignments').get('assignables'), scope);
            }
        }
        if (statementAst.has('assignables')) {
            pure = Statement.isAssignablePure(statementAst.get('assignables').get('assignables'), scope);
        }
        if (statementAst.has('exits')) {
            if (statementAst.get('exits').has('assignables')) {
                pure = Statement.isAssignablePure(statementAst.get('exits').get('assignables'), scope);
            }
        }
        if (statementAst.has('emits')) {
            if (statementAst.get('emits').has('assignables')) {
                pure = Statement.isAssignablePure(statementAst.get('emits').get('assignables'), scope);
            }
        }
        return new Statement(statementAst, scope, pure);
    }
    toString() {
        return this.statementAst.t;
    }
}
exports.default = Statement;

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StatementType;
(function (StatementType) {
    StatementType["CONSTDEC"] = "CONSTDEC";
    StatementType["LETDEC"] = "LETDEC";
    StatementType["ASSIGNMENT"] = "ASSIGNMENT";
    StatementType["CALL"] = "CALL";
    StatementType["EMIT"] = "EMIT";
    StatementType["REREF"] = "REREF";
    StatementType["CLOSURE"] = "CLOSURE";
    StatementType["ARG"] = "ARG";
    StatementType["ENTERFN"] = "ENTERFN";
    StatementType["EXIT"] = "EXIT";
    StatementType["CLOSUREDEF"] = "CLOSUREDEF";
})(StatementType || (StatementType = {}));
exports.default = StatementType;

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = exports.Interface = exports.OperatorType = exports.FunctionType = void 0;
const Operator_1 = require("./Operator");
const Scope_1 = require("./Scope");
const Ast_1 = require("./Ast");
class FunctionType {
    constructor(functionname = null, args = [], returnType) {
        this.functionname = functionname;
        this.args = args;
        this.returnType = returnType;
    }
}
exports.FunctionType = FunctionType;
class OperatorType {
    constructor(operatorname, isPrefix = false, args, returnType) {
        this.operatorname = operatorname;
        this.isPrefix = isPrefix;
        this.args = args;
        this.returnType = returnType;
    }
}
exports.OperatorType = OperatorType;
class Interface {
    constructor(interfacename, functionTypes = [], operatorTypes = [], requiredProperties = {}) {
        this.interfacename = interfacename;
        this.functionTypes = functionTypes;
        this.operatorTypes = operatorTypes;
        this.requiredProperties = requiredProperties;
    }
    typeApplies(typeToCheck, scope) {
        // Solve circular dependency issue
        for (const requiredProperty of Object.keys(this.requiredProperties)) {
            if (!typeToCheck.properties.hasOwnProperty(requiredProperty))
                return false;
        }
        for (const functionType of this.functionTypes) {
            if (!functionType.functionname)
                continue; // Anonymous functions checked at callsite
            const potentialFunctions = scope.deepGet(functionType.functionname);
            if (!potentialFunctions ||
                !(potentialFunctions instanceof Array &&
                    potentialFunctions[0].microstatementInlining instanceof Function)) {
                throw new Error(functionType.functionname + ' is not the name of a function');
            }
            let functionFound = false;
            for (const potentialFunction of potentialFunctions) {
                const argTypes = potentialFunction.getArguments();
                let argsMatch = true;
                const typeNames = Object.keys(argTypes);
                for (let i = 0; i < typeNames.length; i++) {
                    const functionTypeArgType = functionType.args[i];
                    if (argTypes[typeNames[i]] === functionTypeArgType)
                        continue;
                    if (argTypes[typeNames[i]].originalType === functionTypeArgType)
                        continue;
                    if (argTypes[typeNames[i]].originalType ===
                        functionTypeArgType.originalType &&
                        Object.values(functionTypeArgType.properties).every((prop, j) => {
                            const comparable = Object.values(argTypes[typeNames[i]].properties)[j];
                            if (prop === comparable)
                                return true;
                            if (prop.iface && prop.iface.typeApplies(comparable, scope))
                                return true;
                            return false;
                        }))
                        continue;
                    if (argTypes[typeNames[i]] === typeToCheck)
                        continue;
                    if (!!argTypes[typeNames[i]].iface &&
                        !!functionTypeArgType.iface &&
                        argTypes[typeNames[i]].iface === functionTypeArgType.iface)
                        continue;
                    argsMatch = false;
                    break;
                }
                if (!argsMatch)
                    continue;
                functionFound = true;
                break;
            }
            if (!functionFound)
                return false;
        }
        for (const operatorType of this.operatorTypes) {
            const potentialOperators = scope.deepGet(operatorType.operatorname);
            if (!potentialOperators ||
                !(potentialOperators instanceof Array &&
                    potentialOperators[0] instanceof Operator_1.default)) {
                throw new Error(`${operatorType.operatorname} is not an operator`);
            }
            let operatorFound = false;
            for (const potentialOperator of potentialOperators) {
                for (const potentialFunction of potentialOperator.potentialFunctions) {
                    const argTypes = potentialFunction.getArguments();
                    let argsMatch = true;
                    const typeNames = Object.keys(argTypes);
                    for (let i = 0; i < typeNames.length; i++) {
                        const operatorTypeArgType = operatorType.args[i];
                        if (argTypes[typeNames[i]] === operatorTypeArgType)
                            continue;
                        if (argTypes[typeNames[i]].originalType === operatorTypeArgType)
                            continue;
                        if (argTypes[typeNames[i]] === typeToCheck)
                            continue;
                        if (!!argTypes[typeNames[i]].iface &&
                            !!operatorTypeArgType.iface &&
                            argTypes[typeNames[i]].iface === operatorTypeArgType.iface)
                            continue;
                        argsMatch = false;
                        break;
                    }
                    if (!argsMatch)
                        continue;
                    operatorFound = true;
                    break;
                }
            }
            if (!operatorFound)
                return false;
        }
        return true;
    }
    static fromAst(interfaceAst, scope) {
        // Construct the basic interface, the wrapper type, and insert it into the scope
        // This is all necessary so the interface can self-reference when constructing the function and
        // operator types.
        const interfacename = interfaceAst.get('variable').t;
        const iface = new Interface(interfacename);
        const ifaceType = new Type(interfacename, false, false, {}, {}, null, iface);
        scope.put(interfacename, ifaceType);
        // Now, insert the actual declarations of the interface, if there are any (if there are none,
        // it will provide only as much as a type generic -- you can set it to a variable and return it
        // but nothing else, unlike Go's ridiculous interpretation of a bare interface).
        if (interfaceAst.get('interfacedef').has('interfacebody') &&
            interfaceAst
                .get('interfacedef')
                .get('interfacebody')
                .get('interfacelist')
                .has()) {
            const interfacelist = interfaceAst
                .get('interfacedef')
                .get('interfacebody')
                .get('interfacelist');
            const interfacelines = [];
            interfacelines.push(interfacelist.get('interfaceline'));
            interfacelist
                .get('cdr')
                .getAll()
                .forEach((l) => {
                interfacelines.push(l.get('interfaceline'));
            });
            for (const interfaceline of interfacelines) {
                if (interfaceline.has('functiontypeline')) {
                    const functiontypeline = interfaceline.get('functiontypeline');
                    const functionname = functiontypeline.get('variable').t;
                    const typenames = [];
                    typenames.push(functiontypeline.get('functiontype').get('fulltypename').t);
                    functiontypeline
                        .get('functiontype')
                        .get('cdr')
                        .getAll()
                        .forEach((r) => {
                        typenames.push(r.get('fulltypename').t);
                    });
                    const returnType = scope.deepGet(functiontypeline.get('functiontype').get('returntype').t);
                    if (!returnType || !(returnType instanceof Type)) {
                        throw new Error(functiontypeline.get('functiontype').get('returntype').t +
                            ' is not a type');
                    }
                    const args = [];
                    for (let i = 0; i < typenames.length; i++) {
                        const argument = scope.deepGet(typenames[i]);
                        if (!argument || !(argument instanceof Type)) {
                            throw new Error(typenames[i] + ' is not a type');
                        }
                        args.push(argument);
                    }
                    const functionType = new FunctionType(functionname, args, returnType);
                    iface.functionTypes.push(functionType);
                }
                if (interfaceline.has('operatortypeline')) {
                    const operatorname = interfaceline
                        .get('operatortypeline')
                        .get('operators').t;
                    const isPrefix = !interfaceline
                        .get('operatortypeline')
                        .has('optleftarg');
                    const argTypenames = [];
                    if (!isPrefix) {
                        argTypenames.push(interfaceline
                            .get('operatortypeline')
                            .get('optleftarg')
                            .get('leftarg').t);
                    }
                    argTypenames.push(interfaceline.get('operatortypeline').get('rightarg').t);
                    const returnTypename = interfaceline
                        .get('operatortypeline')
                        .get('fulltypename').t;
                    const args = argTypenames.map((n) => {
                        const box = scope.deepGet(n);
                        if (!box || !(box instanceof Type)) {
                            throw new Error(`${n} is not a type`);
                        }
                        return box;
                    });
                    const returnType = scope.deepGet(returnTypename);
                    if (!returnType || !(returnType instanceof Type)) {
                        throw new Error(`${returnTypename} is not a type`);
                    }
                    const operatorType = new OperatorType(operatorname, isPrefix, args, returnType);
                    iface.operatorTypes.push(operatorType);
                }
                if (interfaceline.has('propertytypeline')) {
                    const propertyType = scope.deepGet(interfaceline.get('propertytypeline').get('variable').t);
                    if (!propertyType || !(propertyType instanceof Type)) {
                        throw new Error(interfaceline.get('propertytypeline').get('variable').t +
                            ' is not a type');
                    }
                    iface.requiredProperties[interfaceline.get('propertytypeline').get('variable').t] = propertyType;
                }
            }
        }
        else if (interfaceAst.get('interfacedef').has('interfacealias')) {
            const otherInterface = scope.deepGet(interfaceAst.get('interfacedef').get('interfacealias').get('variable')
                .t);
            if (!(otherInterface instanceof Type) || !otherInterface.iface) {
                throw new Error(`${interfaceAst
                    .get('interfacedef')
                    .get('interfacealias')
                    .get('variable').t} is not an interface`);
            }
            // Replace the interface with the other one
            ifaceType.iface = otherInterface.iface;
        }
        return ifaceType;
    }
}
exports.Interface = Interface;
let Type = /** @class */ (() => {
    class Type {
        constructor(typename, builtIn = false, isGenericStandin = false, properties = {}, generics = {}, originalType = null, iface = null, alias = null) {
            this.typename = typename;
            this.builtIn = builtIn;
            this.isGenericStandin = isGenericStandin;
            this.properties = properties;
            this.generics = generics;
            this.originalType = originalType;
            this.iface = iface;
            this.alias = alias;
        }
        toString() {
            if (this.iface != null)
                return '// Interfaces TBD';
            let outString = 'type ' + this.typename;
            if (this.alias != null) {
                outString += ' = ' + this.alias.typename;
                return outString;
            }
            if (this.generics.length > 0) {
                outString += '<' + Object.keys(this.generics).join(', ') + '>';
            }
            outString += '{\n';
            for (const propName of Object.keys(this.properties)) {
                outString +=
                    '  ' + propName + ': ' + this.properties[propName].typename + '\n';
            }
            outString += '}\n';
            return outString;
        }
        static fromAst(typeAst, scope) {
            const type = new Type(typeAst.get('fulltypename').get('typename').t);
            const genScope = new Scope_1.default();
            const typeScope = new Scope_1.default(scope);
            typeScope.secondaryPar = genScope;
            if (typeAst.get('fulltypename').has('opttypegenerics')) {
                const genericsAst = typeAst
                    .get('fulltypename')
                    .get('opttypegenerics')
                    .get('generics');
                const generics = [];
                generics.push(genericsAst.get('fulltypename').t);
                genericsAst
                    .get('cdr')
                    .getAll()
                    .forEach((r) => {
                    generics.push(r.get('fulltypename').t);
                });
                for (let i = 0; i < generics.length; i++) {
                    type.generics[generics[i]] = i;
                    genScope.put(generics[i], new Type(generics[i], true, true));
                }
            }
            if (typeAst.get('typedef').has('typebody')) {
                const typelist = typeAst.get('typedef').get('typebody').get('typelist');
                const lines = [];
                lines.push(typelist.get('typeline'));
                typelist
                    .get('cdr')
                    .getAll()
                    .forEach((r) => {
                    lines.push(r.get('typeline'));
                });
                for (const lineAst of lines) {
                    const propertyName = lineAst.get('variable').t;
                    const typeName = lineAst.get('fulltypename').t.trim();
                    const property = typeScope.deepGet(typeName);
                    if (!property || !(property instanceof Type)) {
                        // Potentially a type that depends on the type generics of this type
                        const baseTypeName = lineAst.get('fulltypename').get('typename').t;
                        const genericsList = [];
                        if (lineAst.get('fulltypename').has('opttypegenerics')) {
                            const innerGenerics = lineAst
                                .get('fulltypename')
                                .get('opttypegenerics')
                                .get('generics');
                            genericsList.push(innerGenerics.get('fulltypename'));
                            innerGenerics
                                .get('cdr')
                                .getAll()
                                .forEach((r) => {
                                genericsList.push(r.get('fulltypename'));
                            });
                        }
                        const innerGenerics = [...genericsList];
                        const genericsQueue = [];
                        while (genericsList.length > 0) {
                            const generic = genericsList.shift();
                            genericsQueue.push(generic);
                            if (generic.has('opttypegenerics')) {
                                const innerInnerGenerics = generic
                                    .get('opttypegenerics')
                                    .get('generics');
                                genericsList.push(innerInnerGenerics.get('fulltypename'));
                                innerInnerGenerics
                                    .get('cdr')
                                    .getAll()
                                    .forEach((r) => {
                                    genericsList.push(r.get('fulltypename'));
                                });
                            }
                        }
                        while (genericsQueue.length > 0) {
                            const generic = genericsQueue.pop();
                            const innerType = typeScope.deepGet(generic.t);
                            if (!innerType) {
                                const innerBaseTypeName = generic.get('typename').t;
                                const innerBaseType = typeScope.deepGet(innerBaseTypeName);
                                if (!innerBaseType) {
                                    throw new Error(`Cannot find type ${innerBaseTypeName} while defining ${type}`);
                                }
                                const innerBaseGenerics = [];
                                if (generic.has('opttypegenerics')) {
                                    const innerInnerGenerics = generic
                                        .get('opttypegenerics')
                                        .get('generics');
                                    innerBaseGenerics.push(innerInnerGenerics.get('fulltypename').t);
                                    innerInnerGenerics
                                        .get('cdr')
                                        .getAll()
                                        .forEach((r) => {
                                        innerBaseGenerics.push(r.get('fulltypename').t);
                                    });
                                }
                                innerBaseType.solidify(innerBaseGenerics, typeScope);
                            }
                        }
                        const baseType = scope.deepGet(baseTypeName);
                        if (!baseType || !(baseType instanceof Type)) {
                            throw new Error(lineAst.get('fulltypename').t + ' is not a type');
                        }
                        type.properties[propertyName] = baseType.solidify(innerGenerics.map((r) => r.t), typeScope);
                    }
                    else {
                        type.properties[propertyName] = property;
                    }
                }
            }
            if (typeAst.get('typedef').has('typealias')) {
                const otherType = scope.deepGet(typeAst
                    .get('typedef')
                    .get('typealias')
                    .get('fulltypename')
                    .get('typename').t);
                if (!otherType) {
                    throw new Error('Type ' +
                        typeAst.get('typedef').get('typealias').get('fulltypename').t +
                        ' not defined');
                }
                if (!(otherType instanceof Type)) {
                    throw new Error(typeAst.get('typedef').get('typealias').get('fulltypename').t +
                        ' is not a valid type');
                }
                let fulltypename = otherType;
                if (Object.keys(fulltypename.generics).length > 0 &&
                    typeAst
                        .get('typedef')
                        .get('typealias')
                        .get('fulltypename')
                        .has('opttypegenerics')) {
                    const solidTypes = [];
                    const innerTypeGenerics = typeAst
                        .get('typedef')
                        .get('typealias')
                        .get('fulltypename')
                        .get('opttypegenerics')
                        .get('generics');
                    solidTypes.push(innerTypeGenerics.get('fulltypename').t);
                    innerTypeGenerics
                        .get('cdr')
                        .getAll()
                        .forEach((r) => {
                        solidTypes.push(r.get('fulltypename').t);
                    });
                    fulltypename = fulltypename.solidify(solidTypes, scope);
                }
                // For simplification of the type aliasing functionality, the other type is attached as
                // an alias. The module construction will, if present, perfer the alias over the actual
                // type, to make sure built-in types that are aliased continue to work. This means that
                // `type varA == type varB` will work if `varA` is assigned to an alias and `varB` to the
                // orignal type. I can see the argument either way on this, but the simplicity of this
                // approach is why I will go with this for now.
                type.alias = fulltypename;
            }
            scope.put(type.typename, type);
            return type;
        }
        solidify(genericReplacements, scope) {
            const genericTypes = Object.keys(this.generics).map((t) => new Type(t, true, true));
            const replacementTypes = [];
            for (const typename of genericReplacements) {
                const typebox = scope.deepGet(typename);
                if (!typebox || !(typebox instanceof Type)) {
                    const fulltypename = Ast_1.fulltypenameAstFromString(typename);
                    if (fulltypename.has('opttypegenerics')) {
                        const basename = fulltypename.get('typename').t;
                        const generics = [];
                        generics.push(fulltypename
                            .get('opttypegenerics')
                            .get('generics')
                            .get('fulltypename').t);
                        fulltypename
                            .get('opttypegenerics')
                            .get('generics')
                            .get('cdr')
                            .getAll()
                            .forEach((r) => {
                            generics.push(r.get('fulltypename').t);
                        });
                        const baseType = scope.deepGet(basename);
                        if (!baseType || !(baseType instanceof Type)) {
                            throw new Error(basename + ' type not found');
                        }
                        else {
                            const newtype = baseType.solidify(generics, scope);
                            replacementTypes.push(newtype);
                        }
                    }
                    else {
                        throw new Error(typename + ' type not found');
                    }
                }
                else {
                    replacementTypes.push(typebox);
                }
            }
            const genericMap = new Map();
            genericTypes.forEach((g, i) => genericMap.set(g, replacementTypes[i]));
            const solidifiedName = this.typename + '<' + genericReplacements.join(', ') + '>';
            const solidified = new Type(solidifiedName, this.builtIn);
            solidified.originalType = this;
            for (const propKey of Object.keys(this.properties)) {
                const propValue = this.properties[propKey];
                const newPropValue = propValue.realize(genericMap, scope);
                solidified.properties[propKey] = newPropValue;
            }
            scope.put(solidifiedName, solidified);
            return solidified;
        }
        typeApplies(otherType, scope, interfaceMap = new Map()) {
            if (this.typename === otherType.typename)
                return true;
            if (this.iface) {
                const applies = this.iface.typeApplies(otherType, scope);
                if (applies) {
                    interfaceMap.set(this, otherType);
                }
                return applies;
            }
            if (!this.originalType ||
                !otherType.originalType ||
                this.originalType.typename !== otherType.originalType.typename)
                return false;
            const typeAst = Ast_1.fulltypenameAstFromString(this.typename);
            const otherTypeAst = Ast_1.fulltypenameAstFromString(otherType.typename);
            let generics = [];
            if (typeAst.has('opttypegenerics')) {
                generics.push(typeAst.get('opttypegenerics').get('generics').get('fulltypename').t);
                typeAst
                    .get('opttypegenerics')
                    .get('generics')
                    .get('cdr')
                    .getAll()
                    .forEach((r) => {
                    generics.push(r.get('fulltypename').t);
                });
            }
            generics = generics.map((g) => scope.deepGet(g) ||
                Type.fromStringWithMap(g, interfaceMap, scope) ||
                new Type('-bogus-', false, true));
            let otherGenerics = [];
            if (otherTypeAst.has('opttypegenerics')) {
                otherGenerics.push(otherTypeAst.get('opttypegenerics').get('generics').get('fulltypename')
                    .t);
                otherTypeAst
                    .get('opttypegenerics')
                    .get('generics')
                    .get('cdr')
                    .getAll()
                    .forEach((r) => {
                    otherGenerics.push(r.get('fulltypename').t);
                });
            }
            otherGenerics = otherGenerics.map((g) => scope.deepGet(g) ||
                Type.fromStringWithMap(g, interfaceMap, scope) ||
                new Type('-bogus-', false, true));
            return generics.every((t, i) => t.typeApplies(otherGenerics[i], scope, interfaceMap));
        }
        hasInterfaceType() {
            if (this.iface)
                return true;
            return Object.values(this.properties).some((t) => t.hasInterfaceType());
        }
        // There has to be a more elegant way to tackle this
        static fromStringWithMap(typestr, interfaceMap, scope) {
            const typeAst = Ast_1.fulltypenameAstFromString(typestr);
            const baseName = typeAst.get('typename').t;
            const baseType = scope.deepGet(baseName);
            if (typeAst.has('opttypegenerics')) {
                const genericNames = [];
                genericNames.push(typeAst.get('opttypegenerics').get('generics').get('fulltypename').t);
                typeAst
                    .get('opttypegenerics')
                    .get('generics')
                    .get('cdr')
                    .getAll()
                    .forEach((r) => {
                    genericNames.push(r.get('fulltypename').t);
                });
                const generics = genericNames.map((t) => {
                    const interfaceMapping = [...interfaceMap.entries()].find((e) => e[0].typename === t.trim());
                    if (interfaceMapping)
                        return interfaceMapping[1];
                    const innerType = Type.fromStringWithMap(t, interfaceMap, scope);
                    return innerType;
                });
                return baseType.solidify(generics
                    .map((g) => interfaceMap.get(g) || g)
                    .map((t) => t.typename), scope);
            }
            else {
                return interfaceMap.get(baseType) || baseType;
            }
        }
        realize(interfaceMap, scope) {
            if (this.isGenericStandin)
                return [...interfaceMap.entries()].find((e) => e[0].typename === this.typename)[1];
            if (!this.iface && !this.originalType)
                return this;
            if (this.iface)
                return interfaceMap.get(this) || this;
            const self = new Type(this.typename, this.builtIn, this.isGenericStandin, { ...this.properties }, { ...this.generics }, this.originalType, this.iface, this.alias);
            const newProps = Object.values(self.properties).map((t) => t.realize(interfaceMap, scope));
            Object.keys(self.properties).forEach((k, i) => {
                self.properties[k] = newProps[i];
            });
            const newType = Type.fromStringWithMap(self.typename, interfaceMap, scope);
            return newType;
        }
        // This is only necessary for the numeric types. TODO: Can we eliminate it?
        castable(otherType) {
            const intTypes = ['int8', 'int16', 'int32', 'int64'];
            const floatTypes = ['float32', 'float64'];
            if (intTypes.includes(this.typename) &&
                intTypes.includes(otherType.typename))
                return true;
            if (floatTypes.includes(this.typename) &&
                floatTypes.includes(otherType.typename))
                return true;
            if (floatTypes.includes(this.typename) &&
                intTypes.includes(otherType.typename))
                return true;
            return false;
        }
    }
    Type.builtinTypes = {
        void: new Type('void', true),
        int8: new Type('int8', true),
        int16: new Type('int16', true),
        int32: new Type('int32', true),
        int64: new Type('int64', true),
        float32: new Type('float32', true),
        float64: new Type('float64', true),
        bool: new Type('bool', true),
        string: new Type('string', true),
        Error: new Type('Error', true, false, {
            msg: new Type('string', true, true),
        }),
        Maybe: new Type('Maybe', true, false, {
            value: new Type('T', true, true),
        }, {
            T: 0,
        }),
        Result: new Type('Result', true, false, {
            value: new Type('T', true, true),
            error: new Type('Error', true, false, {
                msg: new Type('string', true, true),
            }),
        }, {
            T: 0,
        }),
        Either: new Type('Either', true, false, {
            main: new Type('T', true, true),
            alt: new Type('U', true, true),
        }, {
            T: 0,
            U: 1,
        }),
        Array: new Type('Array', true, false, {
            records: new Type('V', true, true),
        }, {
            V: 0,
        }),
        ExecRes: new Type('ExecRes', false, false, {
            exitCode: new Type('int64', true),
            stdout: new Type('string', true),
            stderr: new Type('string', true),
        }),
        InitialReduce: new Type('InitialReduce', false, false, {
            arr: new Type('Array<T>', true, false, {
                records: new Type('T', true, true),
            }, {
                T: 0,
            }),
            initial: new Type('U', true, true),
        }, {
            T: 0,
            U: 1,
        }),
        KeyVal: new Type('KeyVal', false, false, {
            key: new Type('K', true, true),
            val: new Type('V', true, true),
        }, {
            K: 0,
            V: 1,
        }),
        // Placeholders to be replaced through weirdness with opcodes.ts as the self-referential piece
        // does not play well with `static`
        InternalRequest: new Type('InternalRequest', true, false, {
            method: new Type('string', true),
            url: new Type('string', true),
            headers: new Type('headers', true),
            body: new Type('string', true),
            connId: new Type('int64', true),
        }),
        InternalResponse: new Type('InternalResponse', true, false, {
            status: new Type('int64', true),
            headers: new Type('headers', true),
            body: new Type('string', true),
            connId: new Type('int64', true),
        }),
        Seq: new Type('Seq', true, false, {
            counter: new Type('int64', true, true),
            limit: new Type('int64', true, true),
        }),
        Self: new Type('Self', true, false, {
            seq: new Type('Seq', true, false, {
                counter: new Type('int64', true, true),
                limit: new Type('int64', true, true),
            }),
            recurseFn: new Type('function', true),
        }),
        TcpChannel: new Type('TcpChannel', true),
        TcpContext: new Type('TcpContext', true, false, {
            context: new Type('C', true, true),
            channel: new Type('TcpChannel', true),
        }, {
            C: 0,
        }),
        Chunk: new Type('Chunk', true),
        function: new Type('function', true),
        operator: new Type('operator', true),
        Event: new Type('Event', true, false, {
            type: new Type('E', true, true),
        }, {
            E: 0,
        }),
        type: new Type('type', true),
        scope: new Type('scope', true),
        microstatement: new Type('microstatement', true),
    };
    return Type;
})();
exports.Type = Type;
exports.default = Type;

},{"./Ast":9,"./Operator":14,"./Scope":15}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const Ast = require("./Ast");
const Microstatement_1 = require("./Microstatement");
const Scope_1 = require("./Scope");
const Statement_1 = require("./Statement");
const StatementType_1 = require("./StatementType");
const Type_1 = require("./Type");
class UserFunction {
    constructor(name, args, returnType, scope, statements, pure) {
        this.name = name;
        this.args = args;
        this.returnType = returnType;
        this.scope = scope;
        for (let i = 0; i < statements.length - 1; i++) {
            if (statements[i].isReturnStatement()) {
                // There are unreachable statements after this line, abort
                throw new Error(`Unreachable code in function '${name}' after:
${statements[i].statementAst.t.trim()} on line ${statements[i].statementAst.line}:${statements[i].statementAst.char}`);
            }
        }
        this.statements = statements;
        this.pure = pure;
    }
    static fromAst(functionishAst, scope) {
        if (functionishAst.has('fnname') ||
            functionishAst.has('functions') ||
            functionishAst.has('functionbody')) {
            // It's a `blocklike` node
            if (functionishAst.has('functions')) {
                return UserFunction.fromFunctionsAst(functionishAst.get('functions'), scope);
            }
            if (functionishAst.has('functionbody')) {
                return UserFunction.fromFunctionbodyAst(functionishAst.get('functionbody'), scope);
            }
            if (functionishAst.has('fnname')) {
                // TODO: We didn't cover this path before?
            }
        }
        if (functionishAst.has('fn')) {
            // It's a `functions` node
            return UserFunction.fromFunctionsAst(functionishAst, scope);
        }
        if (functionishAst.has('openCurly')) {
            // It's a `functionbody` node
            return UserFunction.fromFunctionbodyAst(functionishAst, scope);
        }
        return null;
    }
    static fromFunctionbodyAst(functionbodyAst, scope) {
        const args = {};
        const returnType = Type_1.default.builtinTypes.void;
        let pure = true; // Assume purity and then downgrade if needed
        const statementsAst = functionbodyAst.get('statements');
        const statements = statementsAst.getAll().map((r) => {
            const statement = Statement_1.default.create(r.get('statement'), scope);
            if (!statement.pure)
                pure = false;
            return statement;
        });
        return new UserFunction(null, args, returnType, scope, statements, pure);
    }
    static fromFunctionsAst(functionAst, scope) {
        const name = functionAst.has('optname')
            ? functionAst.get('optname').t
            : null;
        const args = {};
        if (functionAst.get('optargs').has('arglist')) {
            const argsAst = functionAst.get('optargs').get('arglist');
            const argsArr = [];
            argsArr.push({
                variable: argsAst.get('variable').t,
                fulltypename: argsAst.get('fulltypename'),
            });
            argsAst
                .get('cdr')
                .getAll()
                .forEach((r) => {
                argsArr.push({
                    variable: r.get('variable').t,
                    fulltypename: r.get('fulltypename'),
                });
            });
            for (let i = 0; i < argsArr.length; i++) {
                const argName = argsArr[i].variable;
                let getArgType = scope.deepGet(argsArr[i].fulltypename.t);
                if (!getArgType) {
                    if (argsArr[i].fulltypename.has('opttypegenerics')) {
                        getArgType = scope.deepGet(argsArr[i].fulltypename.get('typename').t);
                        if (!getArgType) {
                            throw new Error('Could not find type ' +
                                argsArr[i].fulltypename.t +
                                ' for argument ' +
                                argName);
                        }
                        if (!(getArgType instanceof Type_1.default)) {
                            throw new Error('Function argument is not a valid type: ' +
                                argsArr[i].fulltypename.t);
                        }
                        const genericTypes = [];
                        const genericAst = argsArr[i].fulltypename
                            .get('opttypegenerics')
                            .get('generics');
                        genericTypes.push(genericAst.get('fulltypename').t);
                        genericAst
                            .get('cdr')
                            .getAll()
                            .forEach((r) => {
                            genericTypes.push(r.get('fulltypename').t);
                        });
                        getArgType = getArgType.solidify(genericTypes, scope);
                    }
                    else {
                        throw new Error('Could not find type ' +
                            argsArr[i].fulltypename.t +
                            ' for argument ' +
                            argName);
                    }
                }
                if (!(getArgType instanceof Type_1.default)) {
                    throw new Error('Function argument is not a valid type: ' +
                        argsArr[i].fulltypename.t);
                }
                args[argName] = getArgType;
            }
        }
        let pure = true;
        let statements = [];
        if (functionAst.get('fullfunctionbody').has('functionbody')) {
            const functionbody = functionAst
                .get('fullfunctionbody')
                .get('functionbody');
            statements = functionbody
                .get('statements')
                .getAll()
                .map((r) => {
                const statement = Statement_1.default.create(r.get('statement'), scope);
                if (!statement.pure)
                    pure = false;
                return statement;
            });
        }
        else {
            const assignablesAst = functionAst
                .get('fullfunctionbody')
                .get('assignfunction')
                .get('assignables');
            const statementAst = Ast.statementAstFromString(`return ${assignablesAst.t};`);
            const statement = Statement_1.default.create(statementAst, scope);
            if (!statement.pure)
                pure = false;
            statements.push(statement);
        }
        return new UserFunction(name, args, functionAst, scope, statements, pure);
    }
    getName() {
        return this.name;
    }
    getArguments() {
        return this.args;
    }
    generateReturnType() {
        const functionAst = this.returnType; // Abusing field to lazily load the return type
        let returnType = null;
        const scope = this.scope;
        const args = this.args;
        if (functionAst.has('optreturntype')) {
            const fulltypename = functionAst.get('optreturntype').get('fulltypename');
            let getReturnType = scope.deepGet(fulltypename.t);
            if (getReturnType == null || !(getReturnType instanceof Type_1.default)) {
                if (fulltypename.has('opttypegenerics')) {
                    getReturnType = scope.deepGet(fulltypename.get('typename').t);
                    if (getReturnType == null) {
                        throw new Error('Could not find type ' +
                            fulltypename.t +
                            ' for function ' +
                            functionAst.get('optname').t);
                    }
                    if (!(getReturnType instanceof Type_1.default)) {
                        throw new Error('Function return is not a valid type: ' + fulltypename.t);
                    }
                    const genericTypes = [];
                    genericTypes.push(fulltypename
                        .get('opttypegenerics')
                        .get('generics')
                        .get('fulltypename').t);
                    fulltypename
                        .get('opttypegenerics')
                        .get('generics')
                        .get('cdr')
                        .getAll()
                        .forEach((r) => {
                        genericTypes.push(r.get('fulltypename').t);
                    });
                    getReturnType = getReturnType.solidify(genericTypes, scope);
                }
                else {
                    throw new Error('Could not find type ' +
                        fulltypename.t +
                        ' for function ' +
                        functionAst.get('optname').t);
                }
            }
            returnType = getReturnType;
        }
        if (functionAst.get('fullfunctionbody').has('functionbody')) {
            if (returnType === null)
                returnType = Type_1.default.builtinTypes['void'];
        }
        else {
            const assignablesAst = functionAst
                .get('fullfunctionbody')
                .get('assignfunction')
                .get('assignables');
            if (!returnType &&
                Object.keys(args).every((arg) => args[arg].typename !== 'function')) {
                // We're going to use the Microstatement logic here
                const microstatements = [];
                // First lets add all microstatements from the provided scope into the list
                // TODO: If this pattern is ever used more than once, add a new method to the Scope type
                Object.keys(scope.vals).forEach((val) => {
                    if (scope.vals[val] instanceof Microstatement_1.default) {
                        microstatements.push(scope.vals[val]);
                    }
                });
                Object.keys(args).forEach((arg) => {
                    microstatements.push(new Microstatement_1.default(StatementType_1.default.REREF, scope, true, arg, args[arg], [], [], arg));
                });
                Microstatement_1.default.fromAssignablesAst(assignablesAst, scope, microstatements);
                const last = microstatements[microstatements.length - 1];
                if (last.statementType !== StatementType_1.default.EMIT) {
                    // TODO: Come up with a better solution than this hackery for void function calls as the
                    // only value for a one-liner function
                    returnType = last.outputType;
                }
                else {
                    returnType = Type_1.default.builtinTypes.void;
                }
            }
            else if (!returnType) {
                // TODO: Generalize this hackery for opcodes that take closure functions
                const opcodeName = assignablesAst.t.split('(')[0];
                const opcode = scope.deepGet(opcodeName);
                returnType = opcode
                    ? opcode[0].getReturnType()
                    : Type_1.default.builtinTypes['void'];
            }
        }
        return returnType;
    }
    getReturnType() {
        if (!(this.returnType instanceof Type_1.default)) {
            this.returnType = this.generateReturnType();
        }
        return this.returnType;
    }
    isPure() {
        return this.pure;
    }
    toFnStr() {
        return `
      fn ${this.name || ''} (${Object.keys(this.args)
            .map((argName) => `${argName}: ${this.args[argName].typename}`)
            .join(', ')}): ${this.getReturnType().typename} {
        ${this.statements.map((s) => s.statementAst.t).join('\n')}
      }
    `.trim();
    }
    static conditionalToCond(cond, scope) {
        const newStatements = [];
        let hasConditionalReturn = false; // Flag for potential second pass
        const condName = '_' + uuid_1.v4().replace(/-/g, '_');
        const condStatement = Ast.statementAstFromString(`
      const ${condName}: bool = ${cond.get('assignables').t}
    `.trim() + ';');
        const condBlockFn = (cond.get('blocklike').has('functionbody')
            ? UserFunction.fromFunctionbodyAst(cond.get('blocklike').get('functionbody'), scope)
            : cond.get('blocklike').has('fnname')
                ? // TODO: If more than one function matches, need to run multiple dispatch logic
                    scope.deepGet(cond.get('blocklike').get('fnname').t)[0]
                : UserFunction.fromFunctionsAst(cond.get('blocklike').get('functions'), scope)).maybeTransform(new Map(), scope);
        if (condBlockFn.statements[condBlockFn.statements.length - 1].isReturnStatement()) {
            hasConditionalReturn = true;
        }
        const condBlock = condBlockFn.toFnStr();
        const condCall = Ast.statementAstFromString(`
      cond(${condName}, ${condBlock})
    `.trim() + ';'); // TODO: If the blocklike is a reference, grab it and inline it
        newStatements.push(condStatement, condCall);
        if (cond.has('elsebranch')) {
            const notcond = cond.get('elsebranch');
            if (notcond.get('condorblock').has('blocklike')) {
                const notblock = notcond.get('condorblock').get('blocklike');
                const elseBlockFn = (notblock.has('functionbody')
                    ? UserFunction.fromFunctionbodyAst(notblock.get('functionbody'), scope)
                    : notblock.has('fnname')
                        ? // TODO: If more than one function matches, need to run multiple dispatch logic
                            scope.deepGet(notblock.get('fnname').t)[0]
                        : UserFunction.fromFunctionsAst(notblock.get('functions'), scope)).maybeTransform(new Map(), scope);
                if (elseBlockFn.statements[elseBlockFn.statements.length - 1].isReturnStatement()) {
                    hasConditionalReturn = true;
                }
                const elseBlock = elseBlockFn.toFnStr();
                const elseStatement = Ast.statementAstFromString(`
          cond(not(${condName}), ${elseBlock})
        `.trim() + ';');
                newStatements.push(elseStatement);
            }
            else {
                const res = UserFunction.conditionalToCond(notcond.get('condorblock').get('conditionals'), scope);
                const innerCondStatements = res[0];
                if (res[1])
                    hasConditionalReturn = true;
                const elseStatement = Ast.statementAstFromString(`
          cond(!${condName}, fn {
            ${innerCondStatements.map((s) => s.t).join('\n')}
          })
        `.trim() + ';');
                newStatements.push(elseStatement);
            }
        }
        return [newStatements, hasConditionalReturn];
    }
    static earlyReturnRewrite(retVal, retNotSet, statements, scope) {
        const replacementStatements = [];
        while (statements.length > 0) {
            const s = statements.shift();
            // TODO: This doesn't work for actual direct-usage of `cond` in some sort of method chaining
            // if that's even possible. Probably lots of other weirdness to deal with here.
            if (s.has('assignables') &&
                s
                    .get('assignables')
                    .get('assignables')
                    .getAll()[0]
                    .get('withoperators')
                    .get('baseassignablelist')
                    .getAll().length >= 2 &&
                s
                    .get('assignables')
                    .get('assignables')
                    .getAll()[0]
                    .get('withoperators')
                    .get('baseassignablelist')
                    .getAll()[0]
                    .t.trim() === 'cond' &&
                s
                    .get('assignables')
                    .get('assignables')
                    .getAll()[0]
                    .get('withoperators')
                    .get('baseassignablelist')
                    .getAll()[1]
                    .get('baseassignable')
                    .has('fncall')) {
                // TODO: Really need to rewrite
                const argsAst = s
                    .get('assignables')
                    .get('assignables')
                    .getAll()[0]
                    .get('withoperators')
                    .get('baseassignablelist')
                    .getAll()[1]
                    .get('baseassignable')
                    .get('fncall')
                    .get('assignablelist');
                const args = [];
                if (argsAst.has('assignables')) {
                    args.push(argsAst.get('assignables'));
                    argsAst
                        .get('cdr')
                        .getAll()
                        .forEach((r) => {
                        args.push(r.get('assignables'));
                    });
                }
                if (args.length == 2) {
                    const block = args[1]
                        .getAll()[0]
                        .get('withoperators')
                        .has('baseassignablelist')
                        ? args[1]
                            .getAll()[0]
                            .get('withoperators')
                            .get('baseassignablelist')
                            .getAll()[0]
                            .get('baseassignable')
                        : null;
                    if (block) {
                        const blockFn = UserFunction.fromAst(block, scope);
                        if (blockFn.statements[blockFn.statements.length - 1].isReturnStatement()) {
                            const innerStatements = blockFn.statements.map((s) => s.statementAst);
                            const newBlockStatements = UserFunction.earlyReturnRewrite(retVal, retNotSet, innerStatements, scope);
                            const cond = args[0].t.trim();
                            const newBlock = Ast.statementAstFromString(`
                cond(${cond}, fn {
                  ${newBlockStatements.map((s) => s.t).join('\n')}
                })
              `.trim() + ';');
                            replacementStatements.push(newBlock);
                            if (statements.length > 0) {
                                const remainingStatements = UserFunction.earlyReturnRewrite(retVal, retNotSet, statements, scope);
                                const remainingBlock = Ast.statementAstFromString(`
                  cond(${retNotSet}, fn {
                    ${remainingStatements.map((s) => s.t).join('\n')}
                  })
                `.trim() + ';');
                                replacementStatements.push(remainingBlock);
                            }
                        }
                        else {
                            replacementStatements.push(s);
                        }
                    }
                    else {
                        replacementStatements.push(s);
                    }
                }
                else {
                    replacementStatements.push(s);
                }
            }
            else {
                replacementStatements.push(s);
            }
        }
        // If no inner conditional was found in this branch, check if there's a final return
        if (replacementStatements[replacementStatements.length - 1].has('exits')) {
            const retStatement = replacementStatements.pop();
            if (retStatement.get('exits').get('retval').has('assignables')) {
                const newAssign = Ast.statementAstFromString(`
          ${retVal} = ref(${retStatement.get('exits').get('retval').get('assignables').t})
        `.trim() + ';');
                replacementStatements.push(newAssign);
            }
            replacementStatements.push(Ast.statementAstFromString(`
        ${retNotSet} = clone(false)
      `.trim() + ';'));
        }
        return replacementStatements;
    }
    maybeTransform(interfaceMap, scope) {
        if (this.statements.some((s) => s.isConditionalStatement()) ||
            this.statements.some((s) => s.hasObjectLiteral())) {
            // First pass, convert conditionals to `cond` fn calls and wrap assignment statements
            let statementAsts = [];
            let hasConditionalReturn = false; // Flag for potential second pass
            for (let i = 0; i < this.statements.length; i++) {
                const s = new Statement_1.default(this.statements[i].statementAst, this.statements[i].scope, this.statements[i].pure);
                // Potentially rewrite the type for the object literal to match the interface type used by
                // a specific call
                const str = s.statementAst.t;
                const corrected = str.replace(/new ([^<]+)<([^{[]+)> *([{[])/g, (_, basetypestr, genericstr, openstr) => {
                    let newScope = this.scope;
                    if (scope !== undefined) {
                        newScope = new Scope_1.default(scope);
                        newScope.secondaryPar = this.scope;
                    }
                    const originaltypestr = `${basetypestr.trim()}<${genericstr.trim()}>`;
                    let originalType = newScope.deepGet(originaltypestr);
                    if (!originalType || !(originalType instanceof Type_1.default)) {
                        // It may be the first time this particular type has shown up, let's build it
                        const typeAst = Ast.fulltypenameAstFromString(originaltypestr);
                        const baseTypeName = typeAst.get('typename').t;
                        const generics = [];
                        if (typeAst.has('opttypegenerics')) {
                            const genericsAst = typeAst
                                .get('opttypegenerics')
                                .get('generics');
                            generics.push(genericsAst.get('fulltypename').t);
                            genericsAst
                                .get('cdr')
                                .getAll()
                                .forEach((r) => {
                                generics.push(r.get('fulltypename').t);
                            });
                        }
                        const baseType = newScope.deepGet(baseTypeName);
                        if (!baseType || !(baseType instanceof Type_1.default)) {
                            // Now we panic
                            throw new Error('This should be impossible');
                        }
                        originalType = baseType.solidify(generics, newScope);
                    }
                    const replacementType = originalType.realize(interfaceMap, newScope);
                    return `new ${replacementType.typename} ${openstr}`;
                });
                // TODO: Get rid of these regex-based type corrections
                const secondCorrection = corrected.replace(/: (?!new )([^:<,]+)<([^{)]+)>( *[,{)])/g, (_, basetypestr, genericstr, openstr) => {
                    let newScope = this.scope;
                    if (scope !== undefined) {
                        newScope = new Scope_1.default(scope);
                        newScope.secondaryPar = this.scope;
                    }
                    const originaltypestr = `${basetypestr.trim()}<${genericstr.trim()}>`;
                    let originalType = newScope.deepGet(originaltypestr);
                    if (!originalType || !(originalType instanceof Type_1.default)) {
                        // It may be the first time this particular type has shown up, let's build it
                        const typeAst = Ast.fulltypenameAstFromString(originaltypestr);
                        const baseTypeName = typeAst.get('typename').t;
                        const generics = [];
                        if (typeAst.has('opttypegenerics')) {
                            const genericsAst = typeAst
                                .get('opttypegenerics')
                                .get('generics');
                            generics.push(genericsAst.get('fulltypename').t);
                            genericsAst
                                .get('cdr')
                                .getAll()
                                .forEach((r) => {
                                generics.push(r.get('fulltypename').t);
                            });
                        }
                        const baseType = newScope.deepGet(baseTypeName);
                        if (!baseType || !(baseType instanceof Type_1.default)) {
                            // Now we panic
                            throw new Error('This should be impossible');
                        }
                        originalType = baseType.solidify(generics, newScope);
                    }
                    const replacementType = originalType.realize(interfaceMap, newScope);
                    return `: ${replacementType.typename}${openstr}`;
                });
                const correctedAst = Ast.statementAstFromString(secondCorrection);
                s.statementAst = correctedAst;
                // statementAsts.push(correctedAst)
                let newScope = this.scope;
                if (scope !== undefined) {
                    newScope = new Scope_1.default(scope);
                    newScope.secondaryPar = this.scope;
                }
                if (s.isConditionalStatement()) {
                    const cond = s.statementAst.get('conditionals');
                    const res = UserFunction.conditionalToCond(cond, newScope);
                    const newStatements = res[0];
                    if (res[1])
                        hasConditionalReturn = true;
                    statementAsts.push(...newStatements);
                }
                else if (s.statementAst.has('assignments')) {
                    const a = s.statementAst.get('assignments');
                    const wrappedAst = Ast.statementAstFromString(`
            ${a.get('varn').t} = ref(${a.get('assignables').t})
          `.trim() + ';');
                    statementAsts.push(wrappedAst);
                }
                else if (s.statementAst.has('declarations') &&
                    s.statementAst.get('declarations').has('letdeclaration')) {
                    const l = s.statementAst.get('declarations').get('letdeclaration');
                    const name = l.get('variable').t;
                    const type = l.has('typedec')
                        ? l.get('typedec').get('fulltypename').t
                        : undefined;
                    const v = l.get('assignables').t;
                    const wrappedAst = Ast.statementAstFromString(`
            let ${name}${type ? `: ${type}` : ''} = ref(${v})
          `.trim() + ';');
                    statementAsts.push(wrappedAst);
                }
                else {
                    statementAsts.push(s.statementAst);
                }
            }
            // Second pass, there was a conditional return, mutate everything *again* so the return is
            // instead hoisted into writing a closure variable
            if (hasConditionalReturn) {
                // Need the UUID to make sure this is unique if there's multiple layers of nested returns
                const retNamePostfix = '_' + uuid_1.v4().replace(/-/g, '_');
                const retVal = 'retVal' + retNamePostfix;
                const retNotSet = 'retNotSet' + retNamePostfix;
                const retValStatement = Ast.statementAstFromString(`
          let ${retVal}: ${this.getReturnType().typename} = clone()
        `.trim() + ';');
                const retNotSetStatement = Ast.statementAstFromString(`
          let ${retNotSet}: bool = clone(true)
        `.trim() + ';');
                const replacementStatements = [retValStatement, retNotSetStatement];
                replacementStatements.push(...UserFunction.earlyReturnRewrite(retVal, retNotSet, statementAsts, this.scope));
                replacementStatements.push(Ast.statementAstFromString(`
          return ${retVal}
        `.trim() + ';'));
                statementAsts = replacementStatements;
            }
            // TODO: Should these be attached to the scope or should callers provide a merged scope?
            const newArgs = {};
            for (const argName in this.args) {
                const a = this.args[argName];
                newArgs[argName] = interfaceMap.has(a) ? interfaceMap.get(a) : a;
                this.scope.put(newArgs[argName].typename, newArgs[argName]);
            }
            const newRet = interfaceMap.has(this.getReturnType())
                ? interfaceMap.get(this.getReturnType())
                : this.getReturnType();
            this.scope.put(newRet.typename, newRet);
            const fnStr = `
        fn ${this.name || ''} (${Object.keys(newArgs)
                .map((argName) => `${argName}: ${newArgs[argName].typename}`)
                .join(', ')}): ${newRet.typename} {
          ${statementAsts.map((s) => s.t).join('\n')}
        }
      `.trim();
            const fn = UserFunction.fromAst(Ast.functionAstFromString(fnStr), this.scope);
            return fn;
        }
        else {
            let hasNewType = false;
            const newArgs = {};
            for (const argName in this.args) {
                const a = this.args[argName];
                newArgs[argName] = interfaceMap.has(a) ? interfaceMap.get(a) : a;
                if (newArgs[argName] !== this.args[argName]) {
                    this.scope.put(newArgs[argName].typename, newArgs[argName]);
                    hasNewType = true;
                }
            }
            const newRet = interfaceMap.has(this.getReturnType())
                ? interfaceMap.get(this.getReturnType())
                : this.getReturnType();
            if (newRet !== this.getReturnType()) {
                this.scope.put(newRet.typename, newRet);
                hasNewType = true;
            }
            if (hasNewType) {
                const statementAsts = this.statements.map((s) => s.statementAst);
                const fnStr = `
          fn ${this.name || ''} (${Object.keys(newArgs)
                    .map((argName) => `${argName}: ${newArgs[argName].typename}`)
                    .join(', ')}): ${newRet.typename} {
            ${statementAsts.map((s) => s.t).join('\n')}
          }
        `.trim();
                const fn = UserFunction.fromAst(Ast.functionAstFromString(fnStr), this.scope);
                return fn;
            }
            else {
                return this;
            }
        }
    }
    microstatementInlining(realArgNames, s, microstatements) {
        const scope = new Scope_1.default(s);
        scope.secondaryPar = this.scope;
        // Get the current statement length for usage in multiple cleanup routines
        const originalStatementLength = microstatements.length;
        // First, check if there are any ENTERFN microstatements indicating a nested inlining, then
        // check that list for self-containment, which would cause an infinite loop in compilation and
        // abort with a useful error message.
        const enterfns = microstatements.filter((m) => m.statementType === StatementType_1.default.ENTERFN);
        const isRecursive = enterfns.some((m) => m.fns[0] === this);
        if (isRecursive) {
            const path = enterfns
                .slice(enterfns.findIndex((m) => m.fns[0] === this))
                .map((m) => m.fns[0].getName());
            path.push(this.getName());
            const pathstr = path.join(' -> ');
            throw new Error(`Recursive callstack detected: ${pathstr}. Aborting.`);
        }
        else {
            // Otherwise, add a marker for this
            microstatements.push(new Microstatement_1.default(StatementType_1.default.ENTERFN, scope, true, '', Type_1.default.builtinTypes.void, [], [this]));
        }
        // Perform a transform, if necessary, before generating the microstatements
        // Resolve circular dependency issue
        const internalNames = Object.keys(this.args);
        const inputs = realArgNames.map((n) => Microstatement_1.default.fromVarName(n, scope, microstatements));
        const inputTypes = inputs.map((i) => i.outputType);
        const originalTypes = Object.values(this.getArguments());
        const interfaceMap = new Map();
        originalTypes.forEach((t, i) => t.typeApplies(inputTypes[i], scope, interfaceMap));
        for (let i = 0; i < internalNames.length; i++) {
            const realArgName = realArgNames[i];
            // Instead of copying the relevant data, define a reference to where the data is located with
            // an alias for the function's expected variable name so statements referencing the argument
            // can be rewritten to use the new variable name.
            microstatements.push(new Microstatement_1.default(StatementType_1.default.REREF, scope, true, realArgName, inputTypes[i], [], [], internalNames[i]));
        }
        const fn = this.maybeTransform(interfaceMap, scope);
        for (const s of fn.statements) {
            Microstatement_1.default.fromStatement(s, microstatements, scope);
        }
        // Delete `REREF`s except a `return` statement's `REREF` to make sure it doesn't interfere with
        // the outer scope (if it has the same variable name defined, for instance)
        for (let i = originalStatementLength; i < microstatements.length - 1; i++) {
            if (microstatements[i].statementType == StatementType_1.default.REREF) {
                microstatements.splice(i, 1);
                i--;
            }
        }
        // If the output return type is an interface or is a realized generic with an inner interface
        // type, figure out what its actual type is. This is assuming that any input type of the same
        // interface's real type is the same as the output type, which is a valid assumption as long as
        // all inputs of that particular interface are the same type. TODO: If this is not true, it must
        // be a compile-time error earlier on.
        const last = microstatements[microstatements.length - 1];
        if (!this.getReturnType().typeApplies(last.outputType, scope, new Map())) {
            const returnTypeAst = Ast.fulltypenameAstFromString(this.getReturnType().typename);
            let returnSubtypes = [];
            if (returnTypeAst.has('opttypegenerics')) {
                const generics = returnTypeAst.get('opttypegenerics').get('generics');
                const returnSubtypeAsts = [];
                returnSubtypeAsts.push(generics.get('fulltypename'));
                generics
                    .get('cdr')
                    .getAll()
                    .forEach((r) => {
                    returnSubtypeAsts.push(r.get('fulltypename'));
                });
                returnSubtypes = returnSubtypeAsts.map((r) => {
                    let t = scope.deepGet(r.t);
                    if (!t) {
                        const innerGenerics = [];
                        if (r.has('opttypegenerics')) {
                            innerGenerics.push(r.get('opttypegenerics').get('generics').get('fulltypename').t);
                            r.get('opttypegenerics')
                                .get('generics')
                                .get('cdr')
                                .getAll()
                                .forEach((r2) => {
                                innerGenerics.push(r2.t);
                            });
                        }
                        t = scope.deepGet(r.get('typename').t).solidify(innerGenerics, scope);
                    }
                    return t;
                });
            }
            if (this.getReturnType().iface) {
                const originalArgTypes = Object.values(this.args);
                for (let i = 0; i < inputTypes.length; i++) {
                    if (this.getReturnType() === originalArgTypes[i]) {
                        microstatements[microstatements.length - 1].outputType =
                            inputTypes[i];
                    }
                }
            }
            else if (returnSubtypes.some((t) => t.hasInterfaceType())) {
                const oldReturnType = this.getReturnType();
                const originalArgTypes = Object.values(this.args);
                for (let i = 0; i < inputTypes.length; i++) {
                    for (let j = 0; j < returnSubtypes.length; j++) {
                        if (returnSubtypes[j] === originalArgTypes[i]) {
                            returnSubtypes[j] = inputTypes[i];
                        }
                    }
                }
                // Try to tackle issue with `main` and `alt` when they are in a function without branching
                if (returnSubtypes.some((t) => !!t.iface)) {
                    last.outputType = this.getReturnType();
                }
                else {
                    // We were able to piece together the right type info, let's use it
                    const newReturnType = oldReturnType.originalType.solidify(returnSubtypes.map((t) => t.typename), scope);
                    last.outputType = newReturnType;
                }
            }
            else {
                const lastTypeAst = Ast.fulltypenameAstFromString(last.outputType.typename);
                const lastSubtypes = [];
                if (lastTypeAst.has('opttypegenerics')) {
                    const generics = lastTypeAst.get('opttypegenerics').get('generics');
                    lastSubtypes.push(scope.deepGet(generics.get('fulltypename').t));
                    generics
                        .get('cdr')
                        .getAll()
                        .forEach((r) => {
                        lastSubtypes.push(scope.deepGet(r.get('fulltypename').t));
                    });
                }
                if (lastSubtypes.some((t) => t.hasInterfaceType())) {
                    const oldLastType = last.outputType;
                    const originalArgTypes = Object.values(this.args);
                    for (let i = 0; i < inputTypes.length; i++) {
                        for (let j = 0; j < lastSubtypes.length; j++) {
                            if (lastSubtypes[j] === originalArgTypes[i]) {
                                lastSubtypes[j] = inputTypes[i];
                            }
                        }
                    }
                    if (lastSubtypes.some((t) => t.hasInterfaceType())) {
                        // Just fall back to the user-provided type for now
                        last.outputType = this.getReturnType();
                    }
                    else {
                        const newLastType = oldLastType.originalType.solidify(lastSubtypes.map((t) => t.typename), scope);
                        last.outputType = newLastType;
                    }
                }
            }
        }
        // If `last` is a REREF, we also need to potentially update the type on the original record
        for (let i = 0; i < microstatements.length; i++) {
            const m = microstatements[i];
            if (m.outputName === last.outputName &&
                m.statementType !== StatementType_1.default.REREF) {
                m.outputType = last.outputType;
                break;
            }
        }
        // Now that we're done with this, we need to pop out all of the ENTERFN microstatements created
        // after this one so we don't mark non-recursive calls to a function multiple times as recursive
        // TODO: This is not the most efficient way to do things, come up with a better metadata
        // mechanism to pass around.
        for (let i = originalStatementLength; i < microstatements.length; i++) {
            if (microstatements[i].statementType === StatementType_1.default.ENTERFN) {
                microstatements.splice(i, 1);
                i--;
            }
        }
    }
    static dispatchFn(fns, argumentTypeList, s) {
        let fn = null;
        for (let i = 0; i < fns.length; i++) {
            const scope = new Scope_1.default(s);
            scope.secondaryPar = fns[i].scope;
            const args = fns[i].getArguments();
            const argList = Object.values(args);
            if (argList.length !== argumentTypeList.length)
                continue;
            let skip = false;
            for (let j = 0; j < argList.length; j++) {
                if (argList[j].typeApplies(argumentTypeList[j], scope))
                    continue;
                skip = true;
            }
            if (skip)
                continue;
            fn = fns[i];
        }
        if (fn == null) {
            let errMsg = 'Unable to find matching function for name and argument type set';
            const argTypes = [];
            for (let i = 0; i < argumentTypeList.length; i++) {
                argTypes.push('<' + argumentTypeList[i].typename + '>');
            }
            errMsg += '\n' + fns[0].getName() + '(' + argTypes.join(', ') + ')\n';
            errMsg += 'Candidate functions considered:\n';
            for (let i = 0; i < fns.length; i++) {
                const fn = fns[i];
                if (fn instanceof UserFunction) {
                    const fnStr = fn.toFnStr().split('{')[0];
                    errMsg += `${fnStr}\n`;
                }
                else {
                    // TODO: Add this to the opcode definition, too?
                    errMsg += `fn ${fn.getName()}(${Object.entries(fn.getArguments()).map((kv) => `${kv[0]}: ${kv[1].typename}`)}): ${fn.getReturnType().typename}\n`;
                }
            }
            throw new Error(errMsg);
        }
        return fn;
    }
}
exports.default = UserFunction;

},{"./Ast":9,"./Microstatement":12,"./Scope":15,"./Statement":16,"./StatementType":17,"./Type":18,"uuid":70}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromString = exports.fromFile = void 0;
const fs = require("fs");
const uuid_1 = require("uuid");
const Ast = require("./Ast");
const Std = require("./Std");
const Event_1 = require("./Event");
const Microstatement_1 = require("./Microstatement");
const Module_1 = require("./Module");
const StatementType_1 = require("./StatementType");
const UserFunction_1 = require("./UserFunction");
const hoistConst = (microstatements, constantDedupeLookup, constantDuplicateLookup, constants, eventTypes) => {
    let i = 0;
    while (i < microstatements.length) {
        const m = microstatements[i];
        if (m.statementType === StatementType_1.default.CONSTDEC && m.fns.length === 0) {
            const original = constantDedupeLookup[m.inputNames[0]];
            if (!original) {
                constants.add(m);
                if (!m.outputType.builtIn) {
                    eventTypes.add(m.outputType);
                }
                microstatements.splice(i, 1);
                constantDedupeLookup[m.inputNames[0]] = m;
            }
            else {
                constantDuplicateLookup[m.outputName] = original.outputName;
                // Rewrite with the replaced name
                for (let j = i + 1; j < microstatements.length; j++) {
                    const n = microstatements[j];
                    for (let k = 0; k < n.inputNames.length; k++) {
                        if (n.inputNames[k] === m.outputName) {
                            n.inputNames[k] = original.outputName;
                        }
                    }
                }
                microstatements.splice(i, 1);
            }
        }
        else if (m.statementType === StatementType_1.default.CLOSURE) {
            hoistConst(m.closureStatements, constantDedupeLookup, constantDuplicateLookup, constants, eventTypes);
            i++;
        }
        else {
            i++;
        }
    }
};
const finalDedupe = (microstatements, constantDuplicateLookup) => {
    for (let i = 0; i < microstatements.length; i++) {
        const m = microstatements[i];
        if (m.statementType !== StatementType_1.default.LETDEC &&
            m.statementType !== StatementType_1.default.CLOSURE) {
            for (let j = 0; j < m.inputNames.length; j++) {
                if (constantDuplicateLookup[m.inputNames[j]]) {
                    m.inputNames[j] = constantDuplicateLookup[m.inputNames[j]];
                }
            }
        }
        else if (m.statementType === StatementType_1.default.CLOSURE) {
            finalDedupe(m.closureStatements, constantDuplicateLookup);
        }
    }
};
const moduleAstsFromFile = (filename) => {
    const moduleAsts = {};
    const paths = [];
    const rootPath = fs.realpathSync(filename);
    paths.push(rootPath);
    while (paths.length > 0) {
        const modulePath = paths.shift();
        let module = null;
        try {
            module = Ast.fromFile(modulePath);
        }
        catch (e) {
            console.error('Could not load ' + modulePath);
            throw e;
        }
        moduleAsts[modulePath] = module;
        const imports = Ast.resolveImports(modulePath, module);
        for (let i = 0; i < imports.length; i++) {
            if (!moduleAsts[imports[i]] &&
                !(imports[i].substring(0, 5) === '@std/')) {
                paths.push(imports[i]);
            }
        }
    }
    return moduleAsts;
};
const moduleAstsFromString = (str) => {
    // If loading from a string, it's in the browser and some internal state needs cleaning. Some of
    // this doesn't appear to affect things, but better to compile from a known state
    Event_1.default.allEvents = [Event_1.default.allEvents[0]]; // Keep the `start` event
    Event_1.default.allEvents[0].handlers = []; // Reset the registered handlers on the `start` event
    const moduleAsts = {};
    const fakeRoot = '/fake/root/test.ln';
    let module = null;
    try {
        module = Ast.fromString(str);
    }
    catch (e) {
        console.error('Could not load test.ln');
        throw e;
    }
    moduleAsts[fakeRoot] = module;
    const imports = Ast.resolveImports(fakeRoot, module);
    for (let i = 0; i < imports.length; i++) {
        if (moduleAsts[imports[i]] === null &&
            !(imports[i].substring(0, 5) === '@std/')) {
            console.error('Only @std imports allowed in the playground');
            throw new Error('Import declaration error');
        }
    }
    return moduleAsts;
};
const ammFromModuleAsts = (moduleAsts) => {
    // Load the standard library
    const stdFiles = new Set();
    for (const [modulePath, module] of Object.entries(moduleAsts)) {
        for (const importt of Ast.resolveImports(modulePath, module)) {
            if (importt.substring(0, 5) === '@std/') {
                stdFiles.add(importt.substring(5, importt.length) + '.ln');
            }
        }
    }
    Std.loadStdModules(stdFiles);
    const rootScope = Module_1.default.getAllModules()['<root>'].exportScope;
    // Load all modules
    Module_1.default.modulesFromAsts(moduleAsts, rootScope);
    // This implicitly populates the `allEvents` static property on the `Event` type, which we can
    // use to serialize out the definitions, skipping the built-in events. In the process we're need
    // to check a hashset for duplicate event names and rename as necessary. We also need to get the
    // list of user-defined types that we need to emit.
    const eventNames = new Set();
    const eventTypeNames = new Set();
    const eventTypes = new Set();
    const constantDedupeLookup = {}; // String to Microstatement object
    const constantDuplicateLookup = {}; // String to String object
    const constants = new Set(); // Microstatment objects
    for (const evt of Event_1.default.allEvents) {
        // Skip built-in events
        if (evt.builtIn)
            continue;
        // Check if there's a collision
        if (eventNames.has(evt.name)) {
            // We modify the event name by attaching a UUIDv4 to it
            evt.name = evt.name + '_' + uuid_1.v4().replace(/-/g, '_');
        }
        // Add the event to the list
        eventNames.add(evt.name);
        // Now on to event type processing
        const type = evt.type;
        // Skip built-in types, too
        if (type.builtIn)
            continue;
        // Check if there's a collision
        if (eventTypeNames.has(type.typename)) {
            // An event type may be seen multiple times, make sure this is an actual collision
            if (eventTypes.has(type))
                continue; // This event was already processed, so we're done
            // Modify the type name by attaching a UUIDv4 to it
            type.typename = type.typename + '_' + uuid_1.v4().replace(/-/g, '_');
        }
        // Add the type to the list
        eventTypeNames.add(type.typename);
        eventTypes.add(type);
        // Determine if any of the properties of the type should be added to the list
        for (const propType of Object.values(type.properties)) {
            // Skip built-in types, too
            if (propType.builtIn)
                continue;
            // Check if there's a collision
            if (eventTypeNames.has(propType.typename)) {
                // A type may be seen multiple times, make sure this is an actual collision
                if (eventTypes.has(propType))
                    continue; // This event was already processed, so we're done
                // Modify the type name by attaching a UUIDv4 to it
                propType.typename =
                    propType.typename + '_' + uuid_1.v4().replace(/-/g, '_');
            }
            // Add the type to the list
            eventTypeNames.add(propType.typename);
            eventTypes.add(propType);
        }
    }
    // Extract the handler definitions and constant data
    const handlers = {}; // String to array of Microstatement objects
    for (const evt of Event_1.default.allEvents) {
        for (const handler of evt.handlers) {
            if (handler instanceof UserFunction_1.default) {
                // Define the handler preamble
                let handlerDec = 'on ' + evt.name + ' fn (';
                const argList = [];
                const microstatements = [];
                for (const arg of Object.keys(handler.getArguments())) {
                    argList.push(arg + ': ' + handler.getArguments()[arg].typename);
                    microstatements.push(new Microstatement_1.default(StatementType_1.default.ARG, handler.scope, true, arg, handler.getArguments()[arg], [], []));
                }
                handlerDec += argList.join(', ');
                handlerDec += '): ' + handler.getReturnType().typename + ' {';
                // Extract the handler statements and compile into microstatements
                const statements = handler.maybeTransform(new Map()).statements;
                for (const s of statements) {
                    Microstatement_1.default.fromStatement(s, microstatements);
                }
                // Pull the constants out of the microstatements into the constants set.
                hoistConst(microstatements, constantDedupeLookup, constantDuplicateLookup, constants, eventTypes);
                // Register the handler and remaining statements
                handlers.hasOwnProperty(handlerDec)
                    ? handlers[handlerDec].push(microstatements)
                    : (handlers[handlerDec] = [microstatements]);
            }
        }
    }
    // Second pass to fully-deduplicate constants
    for (const handler of Object.keys(handlers)) {
        const functions = handlers[handler];
        for (const microstatements of functions) {
            finalDedupe(microstatements, constantDuplicateLookup);
        }
    }
    let outStr = '';
    // Print the event types
    /* for (const eventType of eventTypes) {
      outStr += eventType.toString() + "\n"
    } */ // TODO: It doesn't appear to be required in the rest of the stack
    // Print the constants
    for (const constant of constants) {
        outStr += constant.toString() + '\n';
    }
    // Print the user-defined event declarations
    for (const evt of Event_1.default.allEvents) {
        if (evt.builtIn)
            continue; // Skip built-in events
        outStr += evt.toString() + '\n';
    }
    // Print the user-defined event handlers
    for (const [handlerDec, handlersList] of Object.entries(handlers)) {
        for (const microstatements of handlersList) {
            outStr += handlerDec + '\n';
            for (const m of microstatements) {
                const mString = m.toString();
                if (mString === '')
                    continue;
                outStr += '  ' + mString + '\n';
            }
            outStr += '}\n';
        }
    }
    return outStr;
};
exports.fromFile = (filename) => ammFromModuleAsts(moduleAstsFromFile(filename));
exports.fromString = (str) => ammFromModuleAsts(moduleAstsFromString(str));

},{"./Ast":9,"./Event":11,"./Microstatement":12,"./Module":13,"./StatementType":17,"./Std":1,"./UserFunction":19,"fs":26,"uuid":70}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const Event_1 = require("./Event");
const Microstatement_1 = require("./Microstatement");
const Module_1 = require("./Module");
const Scope_1 = require("./Scope");
const StatementType_1 = require("./StatementType");
const UserFunction_1 = require("./UserFunction");
const Type_1 = require("./Type");
const Ast_1 = require("./Ast");
const opcodeScope = new Scope_1.default();
const opcodeModule = new Module_1.default(opcodeScope);
// Base types
const addBuiltIn = (name) => {
    opcodeScope.put(name, Type_1.Type.builtinTypes[name]);
};
[
    'void',
    'int8',
    'int16',
    'int32',
    'int64',
    'float32',
    'float64',
    'bool',
    'string',
    'function',
    'operator',
    'Error',
    'Maybe',
    'Result',
    'Either',
    'Array',
    'ExecRes',
    'InitialReduce',
    'KeyVal',
    'InternalRequest',
    'InternalResponse',
    'Seq',
    'Self',
    'TcpChannel',
    'TcpContext',
    'Chunk',
].map(addBuiltIn);
Type_1.Type.builtinTypes['Array'].solidify(['string'], opcodeScope);
opcodeScope.put('any', new Type_1.Type('any', true, false, {}, {}, null, new Type_1.Interface('any')));
opcodeScope.put('anythingElse', new Type_1.Type('anythingElse', true, false, {}, {}, null, new Type_1.Interface('anythingElse')));
Type_1.Type.builtinTypes['Array'].solidify(['any'], opcodeScope);
Type_1.Type.builtinTypes['Array'].solidify(['anythingElse'], opcodeScope);
Type_1.Type.builtinTypes['KeyVal'].solidify(['string', 'string'], opcodeScope);
Type_1.Type.builtinTypes['Array'].solidify(['KeyVal<string, string>'], opcodeScope);
Type_1.Type.builtinTypes['TcpContext'].solidify(['any'], opcodeScope);
// HTTP server opcode-related builtin Types hackery, also defined in std/http.ln
Type_1.Type.builtinTypes.InternalRequest.properties = {
    method: opcodeScope.get('string'),
    url: opcodeScope.get('string'),
    headers: opcodeScope.get('Array<KeyVal<string, string>>'),
    body: opcodeScope.get('string'),
    connId: opcodeScope.get('int64'),
};
Type_1.Type.builtinTypes.InternalResponse.properties = {
    status: opcodeScope.get('int64'),
    headers: opcodeScope.get('Array<KeyVal<string, string>>'),
    body: opcodeScope.get('string'),
    connId: opcodeScope.get('int64'),
};
Type_1.Type.builtinTypes.Maybe.solidify(['any'], opcodeScope);
Type_1.Type.builtinTypes.Maybe.solidify(['string'], opcodeScope);
Type_1.Type.builtinTypes.Result.solidify(['any'], opcodeScope);
Type_1.Type.builtinTypes.Result.solidify(['anythingElse'], opcodeScope);
Type_1.Type.builtinTypes.Result.solidify(['int8'], opcodeScope);
Type_1.Type.builtinTypes.Result.solidify(['int16'], opcodeScope);
Type_1.Type.builtinTypes.Result.solidify(['int32'], opcodeScope);
Type_1.Type.builtinTypes.Result.solidify(['int64'], opcodeScope);
Type_1.Type.builtinTypes.Result.solidify(['float32'], opcodeScope);
Type_1.Type.builtinTypes.Result.solidify(['float64'], opcodeScope);
Type_1.Type.builtinTypes.Result.solidify(['string'], opcodeScope);
Type_1.Type.builtinTypes.Result.solidify(['InternalResponse'], opcodeScope);
Type_1.Type.builtinTypes.Either.solidify(['any', 'anythingElse'], opcodeScope);
Type_1.Type.builtinTypes.InitialReduce.solidify(['any', 'anythingElse'], opcodeScope);
opcodeScope.put('start', new Event_1.default('_start', Type_1.Type.builtinTypes.void, true));
opcodeScope.put('__conn', new Event_1.default('__conn', Type_1.Type.builtinTypes.InternalRequest, true));
opcodeScope.put('__ctrl', new Event_1.default('__ctrl', Type_1.Type.builtinTypes.InternalRequest, true));
opcodeScope.put('tcpConn', new Event_1.default('tcpConn', Type_1.Type.builtinTypes.TcpChannel, true));
opcodeScope.put('chunk', new Event_1.default('chunk', opcodeScope.get('TcpContext<any>'), true));
opcodeScope.put('tcpClose', new Event_1.default('tcpClose', opcodeScope.get('TcpContext<any>'), true));
const t = (str) => opcodeScope.get(str);
// opcode declarations
const addopcodes = (opcodes) => {
    const opcodeNames = Object.keys(opcodes);
    opcodeNames.forEach((opcodeName) => {
        const opcodeDef = opcodes[opcodeName];
        const [args, returnType] = opcodeDef;
        if (!returnType) {
            // This is a three-arg, 0-return opcode
            const opcodeObj = {
                getName: () => opcodeName,
                getArguments: () => args,
                getReturnType: () => Type_1.Type.builtinTypes.void,
                isPure: () => true,
                microstatementInlining: (realArgNames, scope, microstatements) => {
                    if (['seqwhile'].includes(opcodeName)) {
                        const inputs = realArgNames.map((n) => Microstatement_1.default.fromVarName(n, scope, microstatements));
                        const condfn = UserFunction_1.default.dispatchFn(inputs[1].fns, [], scope);
                        const condidx = microstatements.indexOf(inputs[1]);
                        const condm = microstatements.slice(0, condidx);
                        Microstatement_1.default.closureFromUserFunction(condfn, condfn.scope || scope, condm, new Map());
                        const condclosure = condm[condm.length - 1];
                        microstatements.splice(condidx, 0, condclosure);
                        realArgNames[1] = condclosure.outputName;
                        const bodyfn = UserFunction_1.default.dispatchFn(inputs[2].fns, [], scope);
                        const bodyidx = microstatements.indexOf(inputs[2]);
                        const bodym = microstatements.slice(0, bodyidx);
                        Microstatement_1.default.closureFromUserFunction(bodyfn, bodyfn.scope || scope, bodym, new Map());
                        const bodyclosure = bodym[bodym.length - 1];
                        microstatements.splice(bodyidx, 0, bodyclosure);
                        realArgNames[2] = bodyclosure.outputName;
                    }
                    microstatements.push(new Microstatement_1.default(StatementType_1.default.CALL, scope, true, null, opcodeObj.getReturnType(), realArgNames, [opcodeObj]));
                },
            };
            // Add each opcode
            opcodeScope.put(opcodeName, [opcodeObj]);
        }
        else {
            const opcodeObj = {
                getName: () => opcodeName,
                getArguments: () => args,
                getReturnType: () => returnType,
                isPure: () => true,
                microstatementInlining: (realArgNames, scope, microstatements) => {
                    const inputs = realArgNames.map((n) => Microstatement_1.default.fromVarName(n, scope, microstatements));
                    const inputTypes = inputs.map((i) => i.outputType);
                    const interfaceMap = new Map();
                    Object.values(args).forEach((t, i) => t.typeApplies(inputTypes[i], scope, interfaceMap));
                    microstatements.push(new Microstatement_1.default(StatementType_1.default.CONSTDEC, scope, true, '_' + uuid_1.v4().replace(/-/g, '_'), ((inputTypes, scope) => {
                        // The `syncop` opcode's return type is always the return type of the closure it was
                        // given, so we can short circuit this really quickly.
                        if (opcodeName === 'syncop') {
                            const fn = inputs[0].fns[0];
                            const idx = microstatements.indexOf(inputs[0]);
                            const m = microstatements.slice(0, idx);
                            Microstatement_1.default.closureFromUserFunction(fn, fn.scope || scope, m, interfaceMap);
                            const closure = m[m.length - 1];
                            microstatements.splice(idx, 0, closure);
                            realArgNames[0] = closure.outputName;
                            return fn.getReturnType();
                        }
                        if (returnType.iface) {
                            // Path 1: the opcode returns an interface based on the interface type of an input
                            let replacementType;
                            Object.values(args).forEach((a, i) => {
                                if (inputs[i].statementType === StatementType_1.default.CLOSUREDEF) {
                                    const idx = microstatements.indexOf(inputs[i]);
                                    const m = microstatements.slice(0, idx);
                                    let fn;
                                    // TODO: Remove this hackery after function types are more than just 'function'
                                    if ([
                                        'map',
                                        'mapl',
                                        'each',
                                        'eachl',
                                        'every',
                                        'everyl',
                                        'some',
                                        'somel',
                                        'filter',
                                        'filterl',
                                        'seqeach',
                                    ].includes(opcodeName)) {
                                        // TODO: Try to re-unify these blocks from above
                                        const arrayInnerType = scope.deepGet(inputTypes[0].typename.replace(/^Array<(.*)>$/, '$1'));
                                        const innerType = inputTypes[0].originalType
                                            ? arrayInnerType
                                            : Type_1.Type.builtinTypes.int64; // Hackery for seqeach
                                        try {
                                            fn = UserFunction_1.default.dispatchFn(inputs[i].fns, [innerType], scope)(Object.values(fn.getArguments())[0]).typeApplies(innerType, scope, interfaceMap);
                                        }
                                        catch {
                                            try {
                                                fn = UserFunction_1.default.dispatchFn(inputs[i].fns, [], scope);
                                            }
                                            catch {
                                                fn = UserFunction_1.default.dispatchFn(inputs[i].fns, [arrayInnerType, Type_1.Type.builtinTypes.int64], scope);
                                                const closureArgs = Object.values(fn.getArguments());
                                                closureArgs[0].typeApplies(arrayInnerType, scope, interfaceMap);
                                                closureArgs[1].typeApplies(Type_1.Type.builtinTypes.int64, scope, interfaceMap);
                                            }
                                        }
                                    }
                                    else if (['reducel', 'reducep'].includes(opcodeName)) {
                                        const arrayInnerType = scope.deepGet(inputTypes[0].typename.replace(/^Array<(.*)>$/, '$1'));
                                        fn = UserFunction_1.default.dispatchFn(inputs[i].fns, [arrayInnerType, arrayInnerType], scope);
                                        const closureArgs = Object.values(fn.getArguments());
                                        closureArgs[0].typeApplies(arrayInnerType, scope, interfaceMap);
                                        closureArgs[1].typeApplies(arrayInnerType, scope, interfaceMap);
                                    }
                                    else if (['foldl'].includes(opcodeName)) {
                                        const reducerTypes = Object.values(inputTypes[0].properties);
                                        const inType = scope.deepGet(reducerTypes[0].typename.replace(/^Array<(.*)>$/, '$1'));
                                        const fnArgTypes = [reducerTypes[1], inType];
                                        fn = UserFunction_1.default.dispatchFn(inputs[i].fns, fnArgTypes, scope);
                                        const closureArgs = Object.values(fn.getArguments());
                                        closureArgs[0].typeApplies(reducerTypes[1], scope, interfaceMap);
                                        closureArgs[1].typeApplies(inType, scope, interfaceMap);
                                    }
                                    else if (['foldp'].includes(opcodeName)) {
                                        const reducerTypes = Object.values(inputTypes[0].properties);
                                        const inType = scope.deepGet(reducerTypes[0].typename.replace(/^Array<(.*)>$/, '$1'));
                                        const fnArgTypes = [reducerTypes[1], inType];
                                        fn = UserFunction_1.default.dispatchFn(inputs[i].fns, fnArgTypes, scope);
                                        const closureArgs = Object.values(fn.getArguments());
                                        closureArgs[0].typeApplies(reducerTypes[1], scope, interfaceMap);
                                        closureArgs[1].typeApplies(inType, scope, interfaceMap);
                                    }
                                    else if (['seqrec'].includes(opcodeName)) {
                                        // TODO: Is this even reachable?
                                        // TODO: How would multiple dispatch even work here?
                                        fn = inputs[1].fns[0];
                                    }
                                    else if (['selfrec'].includes(opcodeName)) {
                                        // TODO: Is this even reachable?
                                        fn = inputs[0].fns[0];
                                    }
                                    else {
                                        fn = UserFunction_1.default.dispatchFn(inputs[i].fns, [], scope);
                                    }
                                    Microstatement_1.default.closureFromUserFunction(fn, fn.scope || scope, m, interfaceMap);
                                    const closure = m[m.length - 1];
                                    microstatements.splice(idx, 0, closure);
                                    realArgNames[i] = closure.outputName;
                                }
                                if (!!a.iface &&
                                    a.iface.interfacename === returnType.iface.interfacename) {
                                    replacementType = inputTypes[i];
                                }
                                if (Object.values(a.properties).some((p) => !!p.iface &&
                                    p.iface.interfacename ===
                                        returnType.iface.interfacename)) {
                                    Object.values(a.properties).forEach((p, j) => {
                                        if (!!p.iface &&
                                            p.iface.interfacename ===
                                                returnType.iface.interfacename) {
                                            replacementType = Object.values(inputTypes[i].properties)[j];
                                        }
                                    });
                                }
                            });
                            if (!replacementType)
                                return returnType;
                            return replacementType;
                        }
                        else if (returnType.originalType &&
                            Object.values(returnType.properties).some((p) => !!p.iface)) {
                            // TODO: Remove this hackery after function types are more than just 'function'
                            if ([
                                'map',
                                'mapl',
                                'each',
                                'eachl',
                                'every',
                                'everyl',
                                'some',
                                'somel',
                                'filter',
                                'filterl',
                                'seqeach',
                            ].includes(opcodeName)) {
                                // The ideal `map` opcode type declaration is something like:
                                // `map(Array<any>, fn (any): anythingElse): Array<anythingElse>` and then the
                                // interface matching logic figures out what the return type of the opcode is
                                // based on the return type of the function given to it.
                                // For now, we just do that "by hand."
                                const arrayInnerTypeStr = inputTypes[0].typename.replace(/^Array<(.*)>$/, '$1');
                                const arrayInnerType = arrayInnerTypeStr.includes('<')
                                    ? (() => {
                                        const fulltypenameAst = Ast_1.fulltypenameAstFromString(arrayInnerTypeStr);
                                        const baseTypeStr = fulltypenameAst.get('typename').t;
                                        const baseType = scope.deepGet(baseTypeStr);
                                        const generics = [
                                            fulltypenameAst
                                                .get('opttypegenerics')
                                                .get('generics')
                                                .get('fulltypename').t,
                                        ];
                                        fulltypenameAst
                                            .get('opttypegenerics')
                                            .get('generics')
                                            .get('cdr')
                                            .getAll()
                                            .forEach((r) => {
                                            generics.push(r.get('fulltypename').t);
                                        });
                                        return baseType.solidify(generics, scope);
                                    })()
                                    : scope.deepGet(arrayInnerTypeStr);
                                const innerType = inputTypes[0].originalType
                                    ? arrayInnerType
                                    : Type_1.Type.builtinTypes.int64; // Hackery for seqeach
                                let fn;
                                try {
                                    fn = UserFunction_1.default.dispatchFn(inputs[1].fns, [innerType], scope);
                                }
                                catch {
                                    try {
                                        fn = UserFunction_1.default.dispatchFn(inputs[1].fns, [], scope);
                                    }
                                    catch {
                                        fn = UserFunction_1.default.dispatchFn(inputs[1].fns, [arrayInnerType, Type_1.Type.builtinTypes.int64], scope);
                                    }
                                }
                                const closureArgs = Object.values(fn.getArguments());
                                if (closureArgs[0]) {
                                    closureArgs[0].typeApplies(innerType, scope, interfaceMap);
                                }
                                if (closureArgs[1]) {
                                    closureArgs[1].typeApplies(Type_1.Type.builtinTypes.int64, scope, interfaceMap);
                                }
                                const idx = microstatements.indexOf(inputs[1]);
                                const m = microstatements.slice(0, idx);
                                Microstatement_1.default.closureFromUserFunction(fn, fn.scope || scope, m, interfaceMap);
                                const closure = m[m.length - 1];
                                microstatements.splice(idx, 0, closure);
                                realArgNames[1] = closure.outputName;
                                if (['filter', 'filterl'].includes(opcodeName)) {
                                    return inputs[0].outputType;
                                }
                                else {
                                    const innerType = closure.closureOutputType;
                                    const newInnerType = innerType.realize(interfaceMap, scope); // Necessary?
                                    const baseType = returnType.originalType;
                                    const newReturnType = baseType
                                        ? baseType.solidify([newInnerType.typename], scope)
                                        : returnType;
                                    return newReturnType;
                                }
                            }
                            else if (['find', 'findl'].includes(opcodeName)) {
                                const arrayInnerType = scope.deepGet(inputTypes[0].typename.replace(/^Array<(.*)>$/, '$1'));
                                const innerType = inputTypes[0].originalType
                                    ? arrayInnerType
                                    : Type_1.Type.builtinTypes.int64; // Hackery for seqeach
                                const fn = UserFunction_1.default.dispatchFn(inputs[1].fns, [arrayInnerType], scope);
                                const closureArgs = Object.values(fn.getArguments());
                                if (closureArgs[0]) {
                                    closureArgs[0].typeApplies(innerType, scope, interfaceMap);
                                }
                                const idx = microstatements.indexOf(inputs[1]);
                                const m = microstatements.slice(0, idx);
                                Microstatement_1.default.closureFromUserFunction(fn, fn.scope || scope, m, interfaceMap);
                                const closure = m[m.length - 1];
                                microstatements.splice(idx, 0, closure);
                                realArgNames[1] = closure.outputName;
                                return Type_1.Type.builtinTypes.Result.solidify([innerType.typename], scope);
                            }
                            else if (['reducel', 'reducep'].includes(opcodeName)) {
                                const arrayInnerType = scope.deepGet(inputTypes[0].typename.replace(/^Array<(.*)>$/, '$1'));
                                const fn = UserFunction_1.default.dispatchFn(inputs[1].fns, [arrayInnerType, arrayInnerType], scope);
                                const closureArgs = Object.values(fn.getArguments());
                                closureArgs[0].typeApplies(arrayInnerType, scope, interfaceMap);
                                closureArgs[1].typeApplies(arrayInnerType, scope, interfaceMap);
                                const idx = microstatements.indexOf(inputs[1]);
                                const m = microstatements.slice(0, idx);
                                Microstatement_1.default.closureFromUserFunction(fn, fn.scope || scope, m, interfaceMap);
                                const closure = m[m.length - 1];
                                microstatements.splice(idx, 0, closure);
                                realArgNames[1] = closure.outputName;
                                return arrayInnerType;
                            }
                            else if (['foldl'].includes(opcodeName)) {
                                const reducerTypes = Object.values(inputTypes[0].properties);
                                const inType = scope.deepGet(reducerTypes[0].typename.replace(/^Array<(.*)>$/, '$1'));
                                const fnArgTypes = [reducerTypes[1], inType];
                                const fn = UserFunction_1.default.dispatchFn(inputs[1].fns, fnArgTypes, scope);
                                const closureArgs = Object.values(fn.getArguments());
                                closureArgs[0].typeApplies(reducerTypes[1], scope, interfaceMap);
                                closureArgs[1].typeApplies(inType, scope, interfaceMap);
                                const idx = microstatements.indexOf(inputs[1]);
                                const m = microstatements.slice(0, idx);
                                Microstatement_1.default.closureFromUserFunction(fn, fn.scope || scope, m, interfaceMap);
                                const closure = m[m.length - 1];
                                microstatements.splice(idx, 0, closure);
                                realArgNames[1] = closure.outputName;
                                return closure.closureOutputType;
                            }
                            else if (['foldp'].includes(opcodeName)) {
                                const reducerTypes = Object.values(inputTypes[0].properties);
                                const inType = scope.deepGet(reducerTypes[0].typename.replace(/^Array<(.*)>$/, '$1'));
                                const fnArgTypes = [reducerTypes[1], inType];
                                const fn = UserFunction_1.default.dispatchFn(inputs[1].fns, fnArgTypes, scope);
                                const closureArgs = Object.values(fn.getArguments());
                                closureArgs[0].typeApplies(reducerTypes[1], scope, interfaceMap);
                                closureArgs[1].typeApplies(inType, scope, interfaceMap);
                                const idx = microstatements.indexOf(inputs[1]);
                                const m = microstatements.slice(0, idx);
                                Microstatement_1.default.closureFromUserFunction(fn, fn.scope || scope, m, interfaceMap);
                                const closure = m[m.length - 1];
                                microstatements.splice(idx, 0, closure);
                                realArgNames[1] = closure.outputName;
                                return Type_1.Type.builtinTypes['Array'].solidify([closure.closureOutputType.typename], scope);
                            }
                            else if (['seqrec'].includes(opcodeName)) {
                                // TODO: How would multiple dispatch even work here?
                                const fn = inputs[1].inputNames[1].fns[0];
                                const idx = microstatements.indexOf(inputs[1]);
                                const m = microstatements.slice(0, idx);
                                Microstatement_1.default.closureFromUserFunction(fn, fn.scope || scope, m, interfaceMap);
                                const closure = m[m.length - 1];
                                microstatements.splice(idx, 0, closure);
                                realArgNames[1] = closure.outputName;
                                // TODO: How do interface types work here?
                                return closure.closureOutputType.typename;
                            }
                            else if (['selfrec'].includes(opcodeName)) {
                                // TODO: This is absolute crap. How to fix?
                                return inputs[0].inputNames[1]
                                    ? Microstatement_1.default.fromVarName(inputs[0].inputNames[1], scope, microstatements).closureOutputType
                                    : returnType;
                            }
                            else {
                                // Path 2: the opcode returns solidified generic type with an interface generic
                                // that mathces the interface type of an input
                                const returnIfaces = Object.values(returnType.properties)
                                    .filter((p) => !!p.iface)
                                    .map((p) => p.iface);
                                if (returnIfaces.length > 0) {
                                    const newReturnType = returnType.realize(interfaceMap, scope);
                                    return newReturnType;
                                }
                                else {
                                    return returnType;
                                }
                            }
                        }
                        else {
                            // No need to adjust the return type, but may still need to lazy eval a closure
                            Object.values(args).forEach((_a, i) => {
                                if (inputs[i].statementType === StatementType_1.default.CLOSUREDEF) {
                                    const idx = microstatements.indexOf(inputs[i]);
                                    const m = microstatements.slice(0, idx);
                                    let fn;
                                    // TODO: Remove this hackery after function types are more than just 'function'
                                    if ([
                                        'map',
                                        'mapl',
                                        'each',
                                        'eachl',
                                        'every',
                                        'everyl',
                                        'some',
                                        'somel',
                                        'filter',
                                        'filterl',
                                        'seqeach',
                                    ].includes(opcodeName)) {
                                        // TODO: Try to re-unify these blocks from above
                                        const arrayInnerTypeStr = inputTypes[0].typename.replace(/^Array<(.*)>$/, '$1');
                                        const arrayInnerType = arrayInnerTypeStr.includes('<')
                                            ? (() => {
                                                const fulltypenameAst = Ast_1.fulltypenameAstFromString(arrayInnerTypeStr);
                                                const baseTypeStr = fulltypenameAst.get('typename').t;
                                                const baseType = scope.deepGet(baseTypeStr);
                                                const generics = [
                                                    fulltypenameAst
                                                        .get('opttypegenerics')
                                                        .get('generics')
                                                        .get('fulltypename').t,
                                                ];
                                                fulltypenameAst
                                                    .get('opttypegenerics')
                                                    .get('generics')
                                                    .get('cdr')
                                                    .getAll()
                                                    .forEach((r) => {
                                                    generics.push(r.get('fulltypename').t);
                                                });
                                                return baseType.solidify(generics, scope);
                                            })()
                                            : scope.deepGet(arrayInnerTypeStr);
                                        const innerType = inputTypes[0].originalType
                                            ? arrayInnerType
                                            : Type_1.Type.builtinTypes.int64; // Hackery for seqeach
                                        try {
                                            fn = UserFunction_1.default.dispatchFn(inputs[i].fns, [innerType], scope);
                                        }
                                        catch {
                                            try {
                                                fn = UserFunction_1.default.dispatchFn(inputs[i].fns, [], scope);
                                            }
                                            catch {
                                                fn = UserFunction_1.default.dispatchFn(inputs[i].fns, [arrayInnerType, Type_1.Type.builtinTypes.int64], scope);
                                            }
                                        }
                                        const closureArgs = Object.values(fn.getArguments());
                                        if (closureArgs[0]) {
                                            closureArgs[0].typeApplies(innerType, scope, interfaceMap);
                                        }
                                        if (closureArgs[1]) {
                                            closureArgs[1].typeApplies(Type_1.Type.builtinTypes.int64, scope, interfaceMap);
                                        }
                                    }
                                    else if (['reducel', 'reducep'].includes(opcodeName)) {
                                        const arrayInnerType = scope.deepGet(inputTypes[0].typename.replace(/^Array<(.*)>$/, '$1'));
                                        fn = UserFunction_1.default.dispatchFn(inputs[1].fns, [arrayInnerType, arrayInnerType], scope);
                                        const closureArgs = Object.values(fn.getArguments());
                                        closureArgs[0].typeApplies(arrayInnerType, scope, interfaceMap);
                                        closureArgs[1].typeApplies(arrayInnerType, scope, interfaceMap);
                                    }
                                    else if (['foldl'].includes(opcodeName)) {
                                        const reducerTypes = Object.values(inputTypes[0].properties);
                                        const inType = scope.deepGet(reducerTypes[0].typename.replace(/^Array<(.*)>$/, '$1'));
                                        const fnArgTypes = [reducerTypes[1], inType];
                                        const fn = UserFunction_1.default.dispatchFn(inputs[1].fns, fnArgTypes, scope);
                                        const closureArgs = Object.values(fn.getArguments());
                                        closureArgs[0].typeApplies(reducerTypes[1], scope, interfaceMap);
                                        closureArgs[1].typeApplies(inType, scope, interfaceMap);
                                    }
                                    else if (['seqrec'].includes(opcodeName)) {
                                        // TODO: How would multiple dispatch even work here?
                                        fn = inputs[1].fns[0];
                                    }
                                    else if (['selfrec'].includes(opcodeName)) {
                                        // TODO: Is this even reachable?
                                        fn = inputs[0].inputNames[1].fns[0];
                                    }
                                    else {
                                        fn = UserFunction_1.default.dispatchFn(inputs[i].fns, [], scope);
                                    }
                                    Microstatement_1.default.closureFromUserFunction(fn, fn.scope || scope, m, interfaceMap);
                                    const closure = m[m.length - 1];
                                    microstatements.splice(idx, 0, closure);
                                    realArgNames[i] = closure.outputName;
                                }
                            });
                        }
                        return returnType;
                    })(inputTypes, scope), realArgNames, [opcodeObj]));
                },
            };
            // Add each opcode
            opcodeScope.put(opcodeName, [opcodeObj]);
        }
    });
};
addopcodes({
    i8f64: [{ number: t('int8') }, t('float64')],
    i16f64: [{ number: t('int16') }, t('float64')],
    i32f64: [{ number: t('int32') }, t('float64')],
    i64f64: [{ number: t('int64') }, t('float64')],
    f32f64: [{ number: t('float32') }, t('float64')],
    strf64: [{ str: t('string') }, t('float64')],
    boolf64: [{ boo: t('bool') }, t('float64')],
    i8f32: [{ number: t('int8') }, t('float32')],
    i16f32: [{ number: t('int16') }, t('float32')],
    i32f32: [{ number: t('int32') }, t('float32')],
    i64f32: [{ number: t('int64') }, t('float32')],
    f64f32: [{ number: t('float64') }, t('float32')],
    strf32: [{ str: t('string') }, t('float32')],
    boolf32: [{ boo: t('bool') }, t('float32')],
    i8i64: [{ number: t('int8') }, t('int64')],
    i16i64: [{ number: t('int16') }, t('int64')],
    i32i64: [{ number: t('int32') }, t('int64')],
    f32i64: [{ number: t('float32') }, t('int64')],
    f64i64: [{ number: t('float64') }, t('int64')],
    stri64: [{ str: t('string') }, t('int64')],
    booli64: [{ boo: t('bool') }, t('int64')],
    i8i32: [{ number: t('int8') }, t('int32')],
    i16i32: [{ number: t('int16') }, t('int32')],
    i64i32: [{ number: t('int64') }, t('int32')],
    f32i32: [{ number: t('float32') }, t('int32')],
    f64i32: [{ number: t('float64') }, t('int32')],
    stri32: [{ str: t('string') }, t('int32')],
    booli32: [{ boo: t('bool') }, t('int32')],
    i8i16: [{ number: t('int8') }, t('int16')],
    i32i16: [{ number: t('int32') }, t('int16')],
    i64i16: [{ number: t('int64') }, t('int16')],
    f32i16: [{ number: t('float32') }, t('int16')],
    f64i16: [{ number: t('float64') }, t('int16')],
    stri16: [{ str: t('string') }, t('int16')],
    booli16: [{ boo: t('bool') }, t('int16')],
    i16i8: [{ number: t('int16') }, t('int8')],
    i32i8: [{ number: t('int32') }, t('int8')],
    i64i8: [{ number: t('int64') }, t('int8')],
    f32i8: [{ number: t('float32') }, t('int8')],
    f64i8: [{ number: t('float64') }, t('int8')],
    stri8: [{ str: t('string') }, t('int8')],
    booli8: [{ boo: t('bool') }, t('int8')],
    i8bool: [{ number: t('int8') }, t('bool')],
    i16bool: [{ number: t('int16') }, t('bool')],
    i32bool: [{ number: t('int32') }, t('bool')],
    i64bool: [{ number: t('int64') }, t('bool')],
    f32bool: [{ number: t('float32') }, t('bool')],
    f64bool: [{ number: t('float64') }, t('bool')],
    strbool: [{ str: t('string') }, t('bool')],
    i8str: [{ number: t('int8') }, t('string')],
    i16str: [{ number: t('int16') }, t('string')],
    i32str: [{ number: t('int32') }, t('string')],
    i64str: [{ number: t('int64') }, t('string')],
    f32str: [{ number: t('float32') }, t('string')],
    f64str: [{ number: t('float64') }, t('string')],
    boolstr: [{ boo: t('bool') }, t('string')],
    addi8: [{ a: t('Result<int8>'), b: t('Result<int8>') }, t('Result<int8>')],
    addi16: [
        { a: t('Result<int16>'), b: t('Result<int16>') },
        t('Result<int16>'),
    ],
    addi32: [
        { a: t('Result<int32>'), b: t('Result<int32>') },
        t('Result<int32>'),
    ],
    addi64: [
        { a: t('Result<int64>'), b: t('Result<int64>') },
        t('Result<int64>'),
    ],
    addf32: [
        { a: t('Result<float32>'), b: t('Result<float32>') },
        t('Result<float32>'),
    ],
    addf64: [
        { a: t('Result<float64>'), b: t('Result<float64>') },
        t('Result<float64>'),
    ],
    subi8: [{ a: t('Result<int8>'), b: t('Result<int8>') }, t('Result<int8>')],
    subi16: [
        { a: t('Result<int16>'), b: t('Result<int16>') },
        t('Result<int16>'),
    ],
    subi32: [
        { a: t('Result<int32>'), b: t('Result<int32>') },
        t('Result<int32>'),
    ],
    subi64: [
        { a: t('Result<int64>'), b: t('Result<int64>') },
        t('Result<int64>'),
    ],
    subf32: [
        { a: t('Result<float32>'), b: t('Result<float32>') },
        t('Result<float32>'),
    ],
    subf64: [
        { a: t('Result<float64>'), b: t('Result<float64>') },
        t('Result<float64>'),
    ],
    negi8: [{ a: t('Result<int8>') }, t('Result<int8>')],
    negi16: [{ a: t('Result<int16>') }, t('Result<int16>')],
    negi32: [{ a: t('Result<int32>') }, t('Result<int32>')],
    negi64: [{ a: t('Result<int64>') }, t('Result<int64>')],
    negf32: [{ a: t('Result<float32>') }, t('Result<float32>')],
    negf64: [{ a: t('Result<float64>') }, t('Result<float64>')],
    absi8: [{ a: t('Result<int8>') }, t('Result<int8>')],
    absi16: [{ a: t('Result<int16>') }, t('Result<int16>')],
    absi32: [{ a: t('Result<int32>') }, t('Result<int32>')],
    absi64: [{ a: t('Result<int64>') }, t('Result<int64>')],
    absf32: [{ a: t('Result<float32>') }, t('Result<float32>')],
    absf64: [{ a: t('Result<float64>') }, t('Result<float64>')],
    muli8: [{ a: t('Result<int8>'), b: t('Result<int8>') }, t('Result<int8>')],
    muli16: [
        { a: t('Result<int16>'), b: t('Result<int16>') },
        t('Result<int16>'),
    ],
    muli32: [
        { a: t('Result<int32>'), b: t('Result<int32>') },
        t('Result<int32>'),
    ],
    muli64: [
        { a: t('Result<int64>'), b: t('Result<int64>') },
        t('Result<int64>'),
    ],
    mulf32: [
        { a: t('Result<float32>'), b: t('Result<float32>') },
        t('Result<float32>'),
    ],
    mulf64: [
        { a: t('Result<float64>'), b: t('Result<float64>') },
        t('Result<float64>'),
    ],
    divi8: [{ a: t('Result<int8>'), b: t('Result<int8>') }, t('Result<int8>')],
    divi16: [
        { a: t('Result<int16>'), b: t('Result<int16>') },
        t('Result<int16>'),
    ],
    divi32: [
        { a: t('Result<int32>'), b: t('Result<int32>') },
        t('Result<int32>'),
    ],
    divi64: [
        { a: t('Result<int64>'), b: t('Result<int64>') },
        t('Result<int64>'),
    ],
    divf32: [
        { a: t('Result<float32>'), b: t('Result<float32>') },
        t('Result<float32>'),
    ],
    divf64: [
        { a: t('Result<float64>'), b: t('Result<float64>') },
        t('Result<float64>'),
    ],
    modi8: [{ a: t('int8'), b: t('int8') }, t('int8')],
    modi16: [{ a: t('int16'), b: t('int16') }, t('int16')],
    modi32: [{ a: t('int32'), b: t('int32') }, t('int32')],
    modi64: [{ a: t('int64'), b: t('int64') }, t('int64')],
    powi8: [{ a: t('Result<int8>'), b: t('Result<int8>') }, t('Result<int8>')],
    powi16: [
        { a: t('Result<int16>'), b: t('Result<int16>') },
        t('Result<int16>'),
    ],
    powi32: [
        { a: t('Result<int32>'), b: t('Result<int32>') },
        t('Result<int32>'),
    ],
    powi64: [
        { a: t('Result<int64>'), b: t('Result<int64>') },
        t('Result<int64>'),
    ],
    powf32: [
        { a: t('Result<float32>'), b: t('Result<float32>') },
        t('Result<float32>'),
    ],
    powf64: [
        { a: t('Result<float64>'), b: t('Result<float64>') },
        t('Result<float64>'),
    ],
    sqrtf32: [{ a: t('float32') }, t('float32')],
    sqrtf64: [{ a: t('float64') }, t('float64')],
    saddi8: [{ a: t('int8'), b: t('int8') }, t('int8')],
    saddi16: [{ a: t('int16'), b: t('int16') }, t('int16')],
    saddi32: [{ a: t('int32'), b: t('int32') }, t('int32')],
    saddi64: [{ a: t('int64'), b: t('int64') }, t('int64')],
    saddf32: [{ a: t('float32'), b: t('float32') }, t('float32')],
    saddf64: [{ a: t('float64'), b: t('float64') }, t('float64')],
    ssubi8: [{ a: t('int8'), b: t('int8') }, t('int8')],
    ssubi16: [{ a: t('int16'), b: t('int16') }, t('int16')],
    ssubi32: [{ a: t('int32'), b: t('int32') }, t('int32')],
    ssubi64: [{ a: t('int64'), b: t('int64') }, t('int64')],
    ssubf32: [{ a: t('float32'), b: t('float32') }, t('float32')],
    ssubf64: [{ a: t('float64'), b: t('float64') }, t('float64')],
    snegi8: [{ a: t('int8') }, t('int8')],
    snegi16: [{ a: t('int16') }, t('int16')],
    snegi32: [{ a: t('int32') }, t('int32')],
    snegi64: [{ a: t('int64') }, t('int64')],
    snegf32: [{ a: t('float32') }, t('float32')],
    snegf64: [{ a: t('float64') }, t('float64')],
    sabsi8: [{ a: t('int8') }, t('int8')],
    sabsi16: [{ a: t('int16') }, t('int16')],
    sabsi32: [{ a: t('int32') }, t('int32')],
    sabsi64: [{ a: t('int64') }, t('int64')],
    sabsf32: [{ a: t('float32') }, t('float32')],
    sabsf64: [{ a: t('float64') }, t('float64')],
    smuli8: [{ a: t('int8'), b: t('int8') }, t('int8')],
    smuli16: [{ a: t('int16'), b: t('int16') }, t('int16')],
    smuli32: [{ a: t('int32'), b: t('int32') }, t('int32')],
    smuli64: [{ a: t('int64'), b: t('int64') }, t('int64')],
    smulf32: [{ a: t('float32'), b: t('float32') }, t('float32')],
    smulf64: [{ a: t('float64'), b: t('float64') }, t('float64')],
    sdivi8: [{ a: t('int8'), b: t('int8') }, t('int8')],
    sdivi16: [{ a: t('int16'), b: t('int16') }, t('int16')],
    sdivi32: [{ a: t('int32'), b: t('int32') }, t('int32')],
    sdivi64: [{ a: t('int64'), b: t('int64') }, t('int64')],
    sdivf32: [{ a: t('float32'), b: t('float32') }, t('float32')],
    sdivf64: [{ a: t('float64'), b: t('float64') }, t('float64')],
    spowi8: [{ a: t('int8'), b: t('int8') }, t('int8')],
    spowi16: [{ a: t('int16'), b: t('int16') }, t('int16')],
    spowi32: [{ a: t('int32'), b: t('int32') }, t('int32')],
    spowi64: [{ a: t('int64'), b: t('int64') }, t('int64')],
    spowf32: [{ a: t('float32'), b: t('float32') }, t('float32')],
    spowf64: [{ a: t('float64'), b: t('float64') }, t('float64')],
    andi8: [{ a: t('int8'), b: t('int8') }, t('int8')],
    andi16: [{ a: t('int16'), b: t('int16') }, t('int16')],
    andi32: [{ a: t('int32'), b: t('int32') }, t('int32')],
    andi64: [{ a: t('int64'), b: t('int64') }, t('int64')],
    andbool: [{ a: t('bool'), b: t('bool') }, t('bool')],
    ori8: [{ a: t('int8'), b: t('int8') }, t('int8')],
    ori16: [{ a: t('int16'), b: t('int16') }, t('int16')],
    ori32: [{ a: t('int32'), b: t('int32') }, t('int32')],
    ori64: [{ a: t('int64'), b: t('int64') }, t('int64')],
    orbool: [{ a: t('bool'), b: t('bool') }, t('bool')],
    xori8: [{ a: t('int8'), b: t('int8') }, t('int8')],
    xori16: [{ a: t('int16'), b: t('int16') }, t('int16')],
    xori32: [{ a: t('int32'), b: t('int32') }, t('int32')],
    xori64: [{ a: t('int64'), b: t('int64') }, t('int64')],
    xorbool: [{ a: t('bool'), b: t('bool') }, t('bool')],
    noti8: [{ a: t('int8') }, t('int8')],
    noti16: [{ a: t('int16') }, t('int16')],
    noti32: [{ a: t('int32') }, t('int32')],
    noti64: [{ a: t('int64') }, t('int64')],
    notbool: [{ a: t('bool') }, t('bool')],
    nandi8: [{ a: t('int8'), b: t('int8') }, t('int8')],
    nandi16: [{ a: t('int16'), b: t('int16') }, t('int16')],
    nandi32: [{ a: t('int32'), b: t('int32') }, t('int32')],
    nandi64: [{ a: t('int64'), b: t('int64') }, t('int64')],
    nandboo: [{ a: t('bool'), b: t('bool') }, t('bool')],
    nori8: [{ a: t('int8'), b: t('int8') }, t('int8')],
    nori16: [{ a: t('int16'), b: t('int16') }, t('int16')],
    nori32: [{ a: t('int32'), b: t('int32') }, t('int32')],
    nori64: [{ a: t('int64'), b: t('int64') }, t('int64')],
    norbool: [{ a: t('bool'), b: t('bool') }, t('bool')],
    xnori8: [{ a: t('int8'), b: t('int8') }, t('int8')],
    xnori16: [{ a: t('int16'), b: t('int16') }, t('int16')],
    xnori32: [{ a: t('int32'), b: t('int32') }, t('int32')],
    xnori64: [{ a: t('int64'), b: t('int64') }, t('int64')],
    xnorboo: [{ a: t('bool'), b: t('bool') }, t('bool')],
    eqi8: [{ a: t('int8'), b: t('int8') }, t('bool')],
    eqi16: [{ a: t('int16'), b: t('int16') }, t('bool')],
    eqi32: [{ a: t('int32'), b: t('int32') }, t('bool')],
    eqi64: [{ a: t('int64'), b: t('int64') }, t('bool')],
    eqf32: [{ a: t('float32'), b: t('float32') }, t('bool')],
    eqf64: [{ a: t('float64'), b: t('float64') }, t('bool')],
    eqbool: [{ a: t('bool'), b: t('bool') }, t('bool')],
    eqstr: [{ a: t('string'), b: t('string') }, t('bool')],
    neqi8: [{ a: t('int8'), b: t('int8') }, t('bool')],
    neqi16: [{ a: t('int16'), b: t('int16') }, t('bool')],
    neqi32: [{ a: t('int32'), b: t('int32') }, t('bool')],
    neqi64: [{ a: t('int64'), b: t('int64') }, t('bool')],
    neqf32: [{ a: t('float32'), b: t('float32') }, t('bool')],
    neqf64: [{ a: t('float64'), b: t('float64') }, t('bool')],
    neqbool: [{ a: t('bool'), b: t('bool') }, t('bool')],
    neqstr: [{ a: t('string'), b: t('string') }, t('bool')],
    lti8: [{ a: t('int8'), b: t('int8') }, t('bool')],
    lti16: [{ a: t('int16'), b: t('int16') }, t('bool')],
    lti32: [{ a: t('int32'), b: t('int32') }, t('bool')],
    lti64: [{ a: t('int64'), b: t('int64') }, t('bool')],
    ltf32: [{ a: t('float32'), b: t('float32') }, t('bool')],
    ltf64: [{ a: t('float64'), b: t('float64') }, t('bool')],
    ltstr: [{ a: t('string'), b: t('string') }, t('bool')],
    ltei8: [{ a: t('int8'), b: t('int8') }, t('bool')],
    ltei16: [{ a: t('int16'), b: t('int16') }, t('bool')],
    ltei32: [{ a: t('int32'), b: t('int32') }, t('bool')],
    ltei64: [{ a: t('int64'), b: t('int64') }, t('bool')],
    ltef32: [{ a: t('float32'), b: t('float32') }, t('bool')],
    ltef64: [{ a: t('float64'), b: t('float64') }, t('bool')],
    ltestr: [{ a: t('string'), b: t('string') }, t('bool')],
    gti8: [{ a: t('int8'), b: t('int8') }, t('bool')],
    gti16: [{ a: t('int16'), b: t('int16') }, t('bool')],
    gti32: [{ a: t('int32'), b: t('int32') }, t('bool')],
    gti64: [{ a: t('int64'), b: t('int64') }, t('bool')],
    gtf32: [{ a: t('float32'), b: t('float32') }, t('bool')],
    gtf64: [{ a: t('float64'), b: t('float64') }, t('bool')],
    gtstr: [{ a: t('string'), b: t('string') }, t('bool')],
    gtei8: [{ a: t('int8'), b: t('int8') }, t('bool')],
    gtei16: [{ a: t('int16'), b: t('int16') }, t('bool')],
    gtei32: [{ a: t('int32'), b: t('int32') }, t('bool')],
    gtei64: [{ a: t('int64'), b: t('int64') }, t('bool')],
    gtef32: [{ a: t('float32'), b: t('float32') }, t('bool')],
    gtef64: [{ a: t('float64'), b: t('float64') }, t('bool')],
    gtestr: [{ a: t('string'), b: t('string') }, t('bool')],
    httpreq: [{ a: t('InternalRequest') }, t('Result<InternalResponse>')],
    httpsend: [{ a: t('InternalResponse') }, t('Result<string>')],
    execop: [{ a: t('string') }, t('ExecRes')],
    waitop: [{ a: t('int64') }, t('void')],
    syncop: [{ f: t('function'), a: t('any') }, t('anythingElse')],
    catstr: [{ a: t('string'), b: t('string') }, t('string')],
    catarr: [{ a: t('Array<any>'), b: t('Array<any>') }, t('Array<any>')],
    split: [{ str: t('string'), spl: t('string') }, t('Array<string>')],
    repstr: [{ s: t('string'), n: t('int64') }, t('string')],
    reparr: [{ arr: t('Array<any>'), n: t('int64') }, t('Array<any>')],
    matches: [{ s: t('string'), t: t('string') }, t('bool')],
    indstr: [{ s: t('string'), t: t('string') }, t('Result<int64>')],
    indarrf: [{ arr: t('Array<any>'), val: t('any') }, t('Result<int64>')],
    indarrv: [{ arr: t('Array<any>'), val: t('any') }, t('Result<int64>')],
    lenstr: [{ s: t('string') }, t('int64')],
    lenarr: [{ arr: t('Array<any>') }, t('int64')],
    trim: [{ s: t('string') }, t('string')],
    condfn: [{ cond: t('bool'), optional: t('function') }, t('any')],
    pusharr: [{ arr: t('Array<any>'), val: t('any'), size: t('int64') }],
    poparr: [{ arr: t('Array<any>') }, t('Result<any>')],
    delindx: [{ arr: t('Array<any>'), idx: t('int64') }, t('Result<any>')],
    each: [{ arr: t('Array<any>'), cb: t('function') }, t('void')],
    eachl: [{ arr: t('Array<any>'), cb: t('function') }, t('void')],
    map: [{ arr: t('Array<any>'), cb: t('function') }, t('Array<any>')],
    mapl: [{ arr: t('Array<any>'), cb: t('function') }, t('Array<any>')],
    reducel: [{ arr: t('Array<any>'), cb: t('function') }, t('any')],
    reducep: [{ arr: t('Array<any>'), cb: t('function') }, t('any')],
    foldl: [
        { arr: t('InitialReduce<any, anythingElse>'), cb: t('function') },
        t('anythingElse'),
    ],
    foldp: [
        { arr: t('InitialReduce<any, anythingElse>'), cb: t('function') },
        t('Array<anythingElse>'),
    ],
    filter: [{ arr: t('Array<any>'), cb: t('function') }, t('Array<any>')],
    filterl: [{ arr: t('Array<any>'), cb: t('function') }, t('Array<any>')],
    find: [{ arr: t('Array<any>'), cb: t('function') }, t('Result<any>')],
    findl: [{ arr: t('Array<any>'), cb: t('function') }, t('Result<any>')],
    every: [{ arr: t('Array<any>'), cb: t('function') }, t('bool')],
    everyl: [{ arr: t('Array<any>'), cb: t('function') }, t('bool')],
    some: [{ arr: t('Array<any>'), cb: t('function') }, t('bool')],
    somel: [{ arr: t('Array<any>'), cb: t('function') }, t('bool')],
    join: [{ arr: t('Array<string>'), sep: t('string') }, t('string')],
    newarr: [{ size: t('int64') }, t('Array<any>')],
    stdoutp: [{ out: t('string') }, t('void')],
    stderrp: [{ err: t('string') }, t('void')],
    exitop: [{ code: t('int8') }, t('void')],
    copyfrom: [{ arr: t('Array<any>'), addr: t('int64') }, t('any')],
    copytof: [{ arr: t('Array<any>'), addr: t('int64'), val: t('any') }],
    copytov: [{ arr: t('Array<any>'), addr: t('int64'), val: t('any') }],
    register: [{ arr: t('Array<any>'), addr: t('int64') }, t('Array<any>')],
    copyi8: [{ a: t('int8') }, t('int8')],
    copyi16: [{ a: t('int16') }, t('int16')],
    copyi32: [{ a: t('int32') }, t('int32')],
    copyi64: [{ a: t('int64') }, t('int64')],
    copyvoid: [{ a: t('void') }, t('void')],
    copyf32: [{ a: t('float32') }, t('float32')],
    copyf64: [{ a: t('float64') }, t('float64')],
    copybool: [{ a: t('bool') }, t('bool')],
    copystr: [{ a: t('string') }, t('string')],
    copyarr: [{ a: t('any') }, t('any')],
    zeroed: [{}, t('any')],
    lnf64: [{ a: t('float64') }, t('float64')],
    logf64: [{ a: t('float64') }, t('float64')],
    sinf64: [{ a: t('float64') }, t('float64')],
    cosf64: [{ a: t('float64') }, t('float64')],
    tanf64: [{ a: t('float64') }, t('float64')],
    asinf64: [{ a: t('float64') }, t('float64')],
    acosf64: [{ a: t('float64') }, t('float64')],
    atanf64: [{ a: t('float64') }, t('float64')],
    sinhf64: [{ a: t('float64') }, t('float64')],
    coshf64: [{ a: t('float64') }, t('float64')],
    tanhf64: [{ a: t('float64') }, t('float64')],
    error: [{ a: t('string') }, t('Error')],
    reff: [{ a: t('any') }, t('any')],
    refv: [{ a: t('any') }, t('any')],
    noerr: [{}, t('Error')],
    errorstr: [{ a: t('Error') }, t('string')],
    someM: [{ a: t('any'), size: t('int64') }, t('Maybe<any>')],
    noneM: [{}, t('Maybe<any>')],
    isSome: [{ a: t('Maybe<any>') }, t('bool')],
    isNone: [{ a: t('Maybe<any>') }, t('bool')],
    getOrM: [{ a: t('Maybe<any>'), b: t('any') }, t('any')],
    getMaybe: [{ a: t('Maybe<any>') }, t('any')],
    okR: [{ a: t('any'), size: t('int64') }, t('Result<any>')],
    err: [{ a: t('string') }, t('Result<any>')],
    isOk: [{ a: t('Result<any>') }, t('bool')],
    isErr: [{ a: t('Result<any>') }, t('bool')],
    getOrR: [{ a: t('Result<any>'), b: t('any') }, t('any')],
    getOrRS: [{ a: t('Result<any>'), b: t('string') }, t('string')],
    getR: [{ a: t('Result<any>') }, t('any')],
    getErr: [{ a: t('Result<any>'), b: t('Error') }, t('Error')],
    resfrom: [
        { arr: t('Array<any>'), addr: t('Result<int64>') },
        t('Result<any>'),
    ],
    mainE: [{ a: t('any'), size: t('int64') }, t('Either<any, anythingElse>')],
    altE: [
        { a: t('anythingElse'), size: t('int64') },
        t('Either<any, anythingElse>'),
    ],
    isMain: [{ a: t('Either<any, anythingElse>') }, t('bool')],
    isAlt: [{ a: t('Either<any, anythingElse>') }, t('bool')],
    mainOr: [{ a: t('Either<any, anythingElse>'), b: t('any') }, t('any')],
    altOr: [
        { a: t('Either<any, anythingElse>'), b: t('anythingElse') },
        t('anythingElse'),
    ],
    getMain: [{ a: t('Either<any, anythingElse>') }, t('any')],
    getAlt: [{ a: t('Either<any, anythingElse>') }, t('anythingElse')],
    hashf: [{ a: t('any') }, t('int64')],
    hashv: [{ a: t('any') }, t('int64')],
    dssetf: [{ ns: t('string'), key: t('string'), val: t('any') }],
    dssetv: [{ ns: t('string'), key: t('string'), val: t('any') }],
    dshas: [{ ns: t('string'), key: t('string') }, t('bool')],
    dsdel: [{ ns: t('string'), key: t('string') }, t('bool')],
    dsgetf: [{ ns: t('string'), key: t('string') }, t('Result<any>')],
    dsgetv: [{ ns: t('string'), key: t('string') }, t('Result<any>')],
    getcs: [{}, t('Maybe<string>')],
    newseq: [{ limit: t('int64') }, t('Seq')],
    seqnext: [{ seq: t('Seq') }, t('Result<int64>')],
    seqeach: [{ seq: t('Seq'), func: t('function') }, t('void')],
    seqwhile: [{ seq: t('Seq'), condFn: t('function'), bodyFn: t('function') }],
    seqdo: [{ seq: t('Seq'), bodyFn: t('function') }, t('void')],
    selfrec: [{ self: t('Self'), arg: t('any') }, t('Result<anythingElse>')],
    seqrec: [{ seq: t('Seq'), recurseFn: t('function') }, t('Self')],
    tcpconn: [{ host: t('string'), port: t('int16') }, t('TcpChannel')],
    tcpAddC: [{ channel: t('TcpChannel'), context: t('any') }, t('TcpChannel')],
    tcpReady: [{ channel: t('TcpChannel') }, t('TcpChannel')],
    tcpRead: [{ channel: t('TcpChannel') }, t('Chunk')],
    tcpWrite: [{ channel: t('TcpChannel'), chunk: t('Chunk') }, t('TcpChannel')],
    tcpTerm: [{ channel: t('TcpChannel') }, t('void')],
    tcptun: [{ port: t('int16') }, t('bool')],
});
exports.default = opcodeModule;

},{"./Ast":9,"./Event":11,"./Microstatement":12,"./Module":13,"./Scope":15,"./StatementType":17,"./Type":18,"./UserFunction":19,"uuid":70}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangeSet = exports.CharSet = exports.NamedOr = exports.NamedAnd = exports.LeftSubset = exports.ExclusiveOr = exports.Or = exports.And = exports.OneOrMore = exports.ZeroOrMore = exports.ZeroOrOne = exports.Not = exports.Token = exports.NulLP = exports.lpError = exports.LPError = exports.LP = void 0;
const fs = require("fs"); // This syntax is so dumb
// An LP record and methods, used for keeping track of advancements through the text to parse
class LP {
    constructor(filename, loadData = true) {
        this.filename = filename;
        this.data = loadData ? fs.readFileSync(filename, 'utf8') : '';
        this.line = 1;
        this.char = 1;
        this.i = 0;
    }
    advance(n) {
        for (let i = 0; i < n; i++) {
            this.i += 1;
            if (this.data[this.i] === '\n') {
                this.line += 1;
                this.char = 1;
            }
            else {
                this.char += 1;
            }
        }
    }
    clone() {
        const clone = new LP(this.filename, false);
        clone.data = this.data;
        clone.line = this.line;
        clone.char = this.char;
        clone.i = this.i;
        return clone;
    }
    static fromText(data) {
        const lp = new LP('fakeFile', false);
        lp.data = data;
        return lp;
    }
    snapshot() {
        return {
            line: this.line,
            char: this.char,
            i: this.i,
        };
    }
    restore(snap) {
        this.line = snap.line;
        this.char = snap.char;
        this.i = snap.i;
    }
}
exports.LP = LP;
class LPError {
    constructor(msg, parent = undefined) {
        this.msg = msg;
        this.parent = parent;
    }
}
exports.LPError = LPError;
exports.lpError = (message, obj) => new LPError(`${message} in file ${obj.filename} line ${obj.line}:${obj.char}`);
// A special AST node that indicates that you successfully matched nothing, useful for optional ASTs
class NulLP {
    constructor() {
        this.t = '';
        this.line = -1;
        this.char = -1;
    }
    get() {
        return this;
    }
    getAll() {
        return [this];
    }
    has() {
        return false;
    }
    apply() {
        return new LPError('nullish');
    }
    toString() {
        return this.t;
    }
}
exports.NulLP = NulLP;
// One of the 'leaf' AST nodes. It declares a fixed set of characters in a row to match
class Token {
    constructor(t, filename, line, char) {
        this.t = t;
        this.filename = filename;
        this.line = line;
        this.char = char;
    }
    static build(t) {
        return new Token(t, '', -1, -1);
    }
    toString() {
        return this.t;
    }
    get() {
        return this;
    }
    getAll() {
        return [this];
    }
    has() {
        return this.line > -1;
    }
    check(lp) {
        let matches = true;
        const t = this.t;
        const len = t.length;
        const data = lp.data;
        const j = lp.i;
        for (let i = 0; i < len; i++) {
            if (t[i] !== data[i + j]) {
                matches = false;
                break;
            }
        }
        return matches;
    }
    apply(lp) {
        if (this.check(lp)) {
            lp.advance(this.t.length);
            return new Token(this.t, lp.filename, lp.line, lp.char);
        }
        return exports.lpError(`Token mismatch, ${this.t} not found, instead ${lp.data[lp.i]}`, lp);
    }
}
exports.Token = Token;
// Another 'leaf' AST node. It matches any characters that DO NOT match the string provided
class Not {
    constructor(t, filename, line, char) {
        this.t = t;
        this.filename = filename;
        this.line = line;
        this.char = char;
    }
    static build(t) {
        return new Not(t, '', -1, -1);
    }
    toString() {
        return this.t;
    }
    check(lp) {
        let matches = true;
        const t = this.t;
        const len = t.length;
        const data = lp.data;
        const j = lp.i;
        for (let i = 0; i < len; i++) {
            if (t[i] !== data[i + j]) {
                matches = false;
                break;
            }
        }
        return !matches;
    }
    get() {
        return this;
    }
    getAll() {
        return [this];
    }
    has() {
        return this.line > -1;
    }
    apply(lp) {
        if (this.check(lp)) {
            const newT = lp.data[lp.i];
            lp.advance(this.t.length);
            return new Not(newT, lp.filename, lp.line, lp.char);
        }
        return exports.lpError(`Not mismatch, ${this.t} found`, lp);
    }
}
exports.Not = Not;
// An AST node that optionally matches the AST node below it
class ZeroOrOne {
    constructor(t, zeroOrOne, filename, line, char) {
        this.t = t;
        this.zeroOrOne = zeroOrOne;
        this.filename = filename;
        this.line = line;
        this.char = char;
    }
    static build(zeroOrOne) {
        return new ZeroOrOne(zeroOrOne.t, zeroOrOne, '', -1, -1);
    }
    toString() {
        return this.t;
    }
    get() {
        return this.zeroOrOne;
    }
    getAll() {
        return [this.zeroOrOne];
    }
    has() {
        return this.line > -1;
    }
    apply(lp) {
        const s = lp.snapshot();
        const zeroOrOne = this.zeroOrOne.apply(lp);
        if (zeroOrOne instanceof LPError) {
            lp.restore(s);
            return new NulLP();
        }
        return zeroOrOne;
    }
}
exports.ZeroOrOne = ZeroOrOne;
// An AST node that optionally matches the AST node below it as many times as possible
class ZeroOrMore {
    constructor(t, zeroOrMore, filename, line, char) {
        this.t = t;
        this.zeroOrMore = zeroOrMore;
        this.filename = filename;
        this.line = line;
        this.char = char;
    }
    static build(zeroOrMore) {
        return new ZeroOrMore(zeroOrMore.t, [zeroOrMore], '', -1, -1);
    }
    toString() {
        return this.t;
    }
    get(i) {
        if (this.zeroOrMore[i])
            return this.zeroOrMore[i];
        return new NulLP();
    }
    getAll() {
        return this.zeroOrMore;
    }
    has(id) {
        if (typeof id === 'number') {
            if (this.zeroOrMore[id]) {
                return this.zeroOrMore[id].has();
            }
            return false;
        }
        return this.line > -1;
    }
    apply(lp) {
        const filename = lp.filename;
        const line = lp.line;
        const char = lp.char;
        let t = '';
        const zeroOrMore = [];
        do {
            const s = lp.snapshot();
            const z = this.zeroOrMore[0].apply(lp);
            if (z instanceof LPError) {
                lp.restore(s);
                return new ZeroOrMore(t, zeroOrMore, filename, line, char);
            }
            const t2 = z.toString();
            if (!t2 || t2.length === 0) {
                return exports.lpError('ZeroOrMore made no forward progress, will infinite loop', lp);
            }
            t += t2;
            zeroOrMore.push(z);
        } while (true); // eslint-disable-line no-constant-condition
    }
}
exports.ZeroOrMore = ZeroOrMore;
// An AST node that matches the node below it multiple times and fails if it finds no match
class OneOrMore {
    constructor(t, oneOrMore, filename, line, char) {
        this.t = t;
        this.oneOrMore = oneOrMore;
        this.filename = filename;
        this.line = line;
        this.char = char;
    }
    static build(oneOrMore) {
        return new OneOrMore(oneOrMore.t, [oneOrMore], '', -1, -1);
    }
    toString() {
        return this.t;
    }
    get(i) {
        if (this.oneOrMore[i])
            return this.oneOrMore[i];
        return new NulLP();
    }
    getAll() {
        return this.oneOrMore;
    }
    has(id) {
        if (typeof id === 'number') {
            if (this.oneOrMore[id]) {
                return this.oneOrMore[id].has();
            }
            return false;
        }
        return this.line > -1;
    }
    apply(lp) {
        const filename = lp.filename;
        const line = lp.line;
        const char = lp.char;
        let t = '';
        const oneOrMore = [];
        do {
            const s = lp.snapshot();
            const o = this.oneOrMore[0].apply(lp);
            if (o instanceof LPError) {
                lp.restore(s);
                if (oneOrMore.length === 0) {
                    const err = exports.lpError(`No match for OneOrMore ${this.oneOrMore.toString()}`, lp);
                    err.parent = o;
                    return err;
                }
                return new OneOrMore(t, oneOrMore, filename, line, char);
            }
            const t2 = o.toString();
            if (t2.length === 0) {
                return exports.lpError('OneOrMore made no forward progress, will infinite loop', lp);
            }
            t += t2;
            oneOrMore.push(o);
        } while (true); // eslint-disable-line no-constant-condition
    }
}
exports.OneOrMore = OneOrMore;
// An AST node that matches a sequence of child nodes in a row or fails
class And {
    constructor(t, and, filename, line, char) {
        this.t = t;
        this.and = and;
        this.filename = filename;
        this.line = line;
        this.char = char;
    }
    static build(and) {
        return new And(`(${and.map((a) => a.t).join(' & ')})`, and, '', -1, -1);
    }
    toString() {
        return this.t;
    }
    get(i) {
        if (this.and[i])
            return this.and[i];
        return new NulLP();
    }
    getAll() {
        return this.and;
    }
    has(id) {
        if (typeof id === 'number') {
            if (this.and[id]) {
                return this.and[id].has();
            }
            return false;
        }
        return this.line > -1;
    }
    apply(lp) {
        const filename = lp.filename;
        const line = lp.line;
        const char = lp.char;
        let t = '';
        const and = [];
        const s = lp.snapshot();
        // This can fail, allow the underlying error to bubble up
        for (let i = 0; i < this.and.length; i++) {
            const a = this.and[i].apply(lp);
            if (a instanceof LPError) {
                lp.restore(s);
                return a;
            }
            t += a.toString();
            and.push(a);
        }
        return new And(t, and, filename, line, char);
    }
}
exports.And = And;
// An AST node that matches any of its child nodes or fails. Only returns the first match.
class Or {
    constructor(t, or, filename, line, char) {
        this.t = t;
        this.or = or;
        this.filename = filename;
        this.line = line;
        this.char = char;
    }
    static build(or) {
        return new Or(`(${or.map((o) => o.t).join(' | ')})`, or, '', -1, -1);
    }
    toString() {
        return this.t;
    }
    get() {
        if (this.or[0])
            return this.or[0];
        return new NulLP();
    }
    getAll() {
        return this.or;
    }
    has(id) {
        if (typeof id === 'number') {
            if (this.or[id]) {
                return this.or[id].has();
            }
            return false;
        }
        return this.line > -1;
    }
    apply(lp) {
        const filename = lp.filename;
        const line = lp.line;
        const char = lp.char;
        let t = '';
        const or = [];
        const errs = [];
        // Return the first match (if there are multiple matches, it is the first one)
        for (let i = 0; i < this.or.length; i++) {
            const s = lp.snapshot();
            const o = this.or[i].apply(lp);
            if (o instanceof LPError) {
                errs.push(o);
                lp.restore(s);
                continue;
            }
            // We have a match!
            t = o.toString();
            or.push(o);
            break;
        }
        if (or.length === 0) {
            const err = exports.lpError(`No matching tokens ${this.or.map((o) => o.t).join(' | ')} found`, lp);
            err.parent = errs;
            return err;
        }
        return new Or(t, or, filename, line, char);
    }
}
exports.Or = Or;
class ExclusiveOr {
    constructor(t, xor, filename, line, char) {
        this.t = t;
        this.xor = xor;
        this.filename = filename;
        this.line = line;
        this.char = char;
    }
    static build(xor) {
        return new ExclusiveOr(`(${xor.map((x) => x.t).join(' ^ ')})`, xor, '', -1, -1);
    }
    toString() {
        return this.t;
    }
    get() {
        if (this.xor[0])
            return this.xor[0];
        return new NulLP();
    }
    getAll() {
        return this.xor;
    }
    has(id) {
        if (typeof id === 'number') {
            if (this.xor[id]) {
                return this.xor[id].has();
            }
            return false;
        }
        return this.line > -1;
    }
    apply(lp) {
        const filename = lp.filename;
        const line = lp.line;
        const char = lp.char;
        let t = '';
        const xor = [];
        const errs = [];
        // Checks the matches, it only succeeds if there's only one match
        for (let i = 0; i < this.xor.length; i++) {
            const s = lp.snapshot();
            const x = this.xor[i].apply(lp);
            if (x instanceof LPError) {
                errs.push(x);
                lp.restore(s);
                continue;
            }
            // We have a match!
            t = x.toString();
            xor.push(i);
            // We still restore the snapshot for further iterations
            lp.restore(s);
        }
        if (xor.length === 0) {
            const err = exports.lpError('No matching tokens found', lp);
            err.parent = errs;
            return err;
        }
        if (xor.length > 1) {
            const err = exports.lpError('Multiple matching tokens found', lp);
            err.parent = errs;
            return err;
        }
        // Since we restored the state every time, we need to take the one that matched and re-run it
        // to make sure the offset is correct
        return new ExclusiveOr(t, [this.xor[xor[0]].apply(lp)], filename, line, char);
    }
}
exports.ExclusiveOr = ExclusiveOr;
class LeftSubset {
    constructor(t, left, right, filename, line, char) {
        this.t = t;
        this.left = left;
        this.right = right;
        this.filename = filename;
        this.line = line;
        this.char = char;
    }
    static build(left, right) {
        return new LeftSubset(`(${left.t} - ${right.t})`, left, right, '', -1, -1);
    }
    toString() {
        return this.t;
    }
    get() {
        return this.left;
    }
    getAll() {
        return [this.left];
    }
    has() {
        return this.line > -1;
    }
    apply(lp) {
        const filename = lp.filename;
        const line = lp.line;
        const char = lp.char;
        // Check the left set first, immediately return an error if it failed
        const s = lp.snapshot();
        const l = this.left.apply(lp);
        if (l instanceof LPError) {
            lp.restore(s);
            return l;
        }
        // Check the right set *against* the value returned by the left set. If they exactly match, also
        // fail
        const lp2 = LP.fromText(l.toString());
        const r = this.right.apply(lp2);
        if (r instanceof LPError || r.toString().length !== l.toString().length) {
            // The right subset did not match the left, we're good!
            return new LeftSubset(l.toString(), l, new NulLP(), filename, line, char);
        }
        // In this path, we force a failure because the match also exists in the right subset
        lp.restore(s);
        return exports.lpError(`Right subset ${this.right.t} matches unexpectedly`, lp);
    }
}
exports.LeftSubset = LeftSubset;
// An AST node that matches all of the child nodes or fails. Also provides easier access to the
// matched child nodes.
class NamedAnd {
    constructor(t, and, filename, line, char) {
        this.t = t;
        this.and = and;
        this.filename = filename;
        this.line = line;
        this.char = char;
    }
    static build(and) {
        return new NamedAnd(`(${Object.keys(and).join(' & ')})`, and, '', -1, -1);
    }
    toString() {
        return this.t;
    }
    get(name) {
        if (this.and[name])
            return this.and[name];
        return new NulLP();
    }
    getAll() {
        return Object.values(this.and);
    }
    has(id) {
        if (typeof id === 'string') {
            if (this.and[id]) {
                return this.and[id].has();
            }
            return false;
        }
        return this.line > -1;
    }
    apply(lp) {
        const filename = lp.filename;
        const line = lp.line;
        const char = lp.char;
        let t = '';
        const and = {};
        const andNames = Object.keys(this.and);
        const s = lp.snapshot();
        // This can fail, allow the underlying error to bubble up
        for (let i = 0; i < andNames.length; i++) {
            const a = this.and[andNames[i]].apply(lp);
            if (a instanceof LPError) {
                lp.restore(s);
                return a;
            }
            t += a.toString();
            and[andNames[i]] = a;
        }
        return new NamedAnd(t, and, filename, line, char);
    }
}
exports.NamedAnd = NamedAnd;
// An AST node that matches one of the child nodes or fails. The first match is returned. Also
// provides easier access to the child node by name.
class NamedOr {
    constructor(t, or, filename, line, char) {
        this.t = t;
        this.or = or;
        this.filename = filename;
        this.line = line;
        this.char = char;
    }
    static build(or) {
        return new NamedOr(`(${Object.keys(or).join(' | ')})`, or, '', -1, -1);
    }
    toString() {
        return this.t;
    }
    get(name) {
        if (this.or[name])
            return this.or[name];
        return new NulLP();
    }
    getAll() {
        return Object.values(this.or);
    }
    has(id) {
        if (typeof id === 'string') {
            if (this.or[id]) {
                return this.or[id].has();
            }
            return false;
        }
        return this.line > -1;
    }
    apply(lp) {
        const filename = lp.filename;
        const line = lp.line;
        const char = lp.char;
        let t = '';
        const or = {};
        const errs = [];
        const orNames = Object.keys(this.or);
        // Return the first match (if there are multiple matches, it is the first one)
        for (let i = 0; i < orNames.length; i++) {
            const s = lp.snapshot();
            const o = this.or[orNames[i]].apply(lp);
            if (o instanceof LPError) {
                errs.push(o);
                lp.restore(s);
                continue;
            }
            // We have a match!
            t = o.toString();
            or[orNames[i]] = o;
            break;
        }
        if (Object.keys(or).length === 0) {
            const err = exports.lpError('No matching or tokens found', lp);
            err.parent = errs;
            return err;
        }
        return new NamedOr(t, or, filename, line, char);
    }
}
exports.NamedOr = NamedOr;
// A 'leaf' AST node that matches a character within the specified range of characters. Useful for
// building regex-like matchers.
class CharSet {
    constructor(t, lowerChar, upperChar, filename, line, char) {
        this.t = t;
        this.lowerCharCode = lowerChar.charCodeAt(0);
        this.upperCharCode = upperChar.charCodeAt(0);
        this.filename = filename;
        this.line = line;
        this.char = char;
    }
    static build(lowerChar, upperChar) {
        return new CharSet(`[${lowerChar}-${upperChar}]`, lowerChar, upperChar, '', -1, -1);
    }
    toString() {
        return this.t;
    }
    check(lp) {
        const lpCharCode = lp.data.charCodeAt(lp.i);
        return this.lowerCharCode <= lpCharCode && this.upperCharCode >= lpCharCode;
    }
    get() {
        return this;
    }
    getAll() {
        return [this];
    }
    has() {
        return this.line > -1;
    }
    apply(lp) {
        if (this.check(lp)) {
            const outCharSet = new CharSet(lp.data[lp.i], String.fromCharCode(this.lowerCharCode), String.fromCharCode(this.upperCharCode), lp.filename, lp.line, lp.char);
            lp.advance(1);
            return outCharSet;
        }
        return exports.lpError(`Token mismatch, expected character in range of ${String.fromCharCode(this.lowerCharCode)}-${String.fromCharCode(this.upperCharCode)}`, lp);
    }
}
exports.CharSet = CharSet;
// A composite AST 'node' that matches the child node between the minimum and maximum repetitions or
// fails.
exports.RangeSet = (toRepeat, min, max) => {
    const sets = [];
    for (let i = min; i <= max; i++) {
        if (i === 0) {
            sets.push(Token.build(''));
            continue;
        }
        else {
            const set = [];
            for (let j = 0; j < i; j++) {
                set.push(toRepeat);
            }
            sets.push(And.build(set));
        }
    }
    return Or.build(sets);
};

},{"fs":26}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const buildPipeline = (converters) => {
    // Get a unique set of inputs and outputs, and index the converters by their input and output
    const inputs = new Set();
    const outputs = new Set();
    const both = new Set();
    const byInput = new Map();
    const byOutput = new Map();
    const byBoth = new Map();
    converters.forEach((converter) => {
        inputs.add(converter[0]);
        outputs.add(converter[1]);
        both.add(converter[0]);
        both.add(converter[1]);
        if (!byInput.has(converter[0])) {
            byInput.set(converter[0], []);
        }
        byInput.get(converter[0]).push(converter);
        if (!byOutput.has(converter[1])) {
            byOutput.set(converter[1], []);
        }
        byOutput.get(converter[1]).push(converter);
        byBoth.set(converter[0] + converter[1], converter[2]);
    });
    // Compute the shortest path from every input to every output, or drop it if not possible
    const paths = {};
    inputs.forEach((input) => {
        outputs.forEach((output) => {
            // Skip identical inputs and outputs
            if (input === output)
                return;
            // Short-circuit if a direct conversion is possible
            if (byBoth.has(input + output)) {
                if (!paths[input])
                    paths[input] = {};
                paths[input][output] = [input, output];
                return;
            }
            // Otherwise, scan through the graph using Djikstra's Algorithm
            const nodes = new Set();
            const dist = new Map();
            const prev = new Map();
            both.forEach((n) => {
                nodes.add(n);
                dist.set(n, Infinity);
                prev.set(n, undefined);
            });
            dist.set(input, 0);
            let minDist = 0;
            let minNode = input;
            while (nodes.size > 0) {
                const n = minNode;
                if (n === output)
                    break;
                nodes.delete(n);
                minNode = undefined;
                minDist = Infinity;
                // Find the smallest remaining distance node to continue the search
                nodes.forEach((node) => {
                    if (dist.get(node) < minDist || minDist === Infinity) {
                        minDist = dist.get(node);
                        minNode = node;
                    }
                });
                if (byInput.has(n)) {
                    byInput
                        .get(n)
                        .map((r) => r[1])
                        .forEach((neighbor) => {
                        const newDist = dist.get(n) + 1;
                        if (newDist < dist.get(neighbor)) {
                            dist.set(neighbor, newDist);
                            prev.set(neighbor, n);
                        }
                        if (newDist < minDist) {
                            minDist = newDist;
                            minNode = neighbor;
                        }
                    });
                }
            }
            const path = [];
            let node = output;
            while (node) {
                path.unshift(node);
                node = prev.get(node);
            }
            if (path.length < 2)
                return; // Invalid/impossible path, skip it
            if (!paths[input])
                paths[input] = {};
            paths[input][output] = path;
        });
    });
    const lookup = {};
    Object.keys(paths).forEach((i) => {
        Object.keys(paths[i]).forEach((o) => {
            if (!lookup[i])
                lookup[i] = {};
            const c = paths[i][o].reduce((cumu, curr) => {
                if (!cumu.prev)
                    return {
                        prev: curr,
                        fromFile: undefined,
                        fromString: undefined,
                    };
                const converter = byBoth.get(cumu.prev + curr);
                if (!cumu.fromFile) {
                    return {
                        prev: curr,
                        fromFile: converter.fromFile,
                        fromString: converter.fromString,
                    };
                }
                return {
                    prev: curr,
                    fromFile: (filename) => converter.fromString(cumu.fromFile(filename)),
                    fromString: (str) => converter.fromString(cumu.fromString(str)),
                };
            }, { prev: undefined, fromFile: undefined, fromString: undefined });
            lookup[i][o] = {
                fromFile: c.fromFile,
                fromString: c.fromString,
            };
        });
    });
    return lookup;
};
exports.default = buildPipeline;

},{}],24:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],25:[function(require,module,exports){

},{}],26:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"dup":25}],27:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],28:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this,require("buffer").Buffer)
},{"base64-js":24,"buffer":28,"ieee754":35}],29:[function(require,module,exports){
module.exports = {
  "100": "Continue",
  "101": "Switching Protocols",
  "102": "Processing",
  "200": "OK",
  "201": "Created",
  "202": "Accepted",
  "203": "Non-Authoritative Information",
  "204": "No Content",
  "205": "Reset Content",
  "206": "Partial Content",
  "207": "Multi-Status",
  "208": "Already Reported",
  "226": "IM Used",
  "300": "Multiple Choices",
  "301": "Moved Permanently",
  "302": "Found",
  "303": "See Other",
  "304": "Not Modified",
  "305": "Use Proxy",
  "307": "Temporary Redirect",
  "308": "Permanent Redirect",
  "400": "Bad Request",
  "401": "Unauthorized",
  "402": "Payment Required",
  "403": "Forbidden",
  "404": "Not Found",
  "405": "Method Not Allowed",
  "406": "Not Acceptable",
  "407": "Proxy Authentication Required",
  "408": "Request Timeout",
  "409": "Conflict",
  "410": "Gone",
  "411": "Length Required",
  "412": "Precondition Failed",
  "413": "Payload Too Large",
  "414": "URI Too Long",
  "415": "Unsupported Media Type",
  "416": "Range Not Satisfiable",
  "417": "Expectation Failed",
  "418": "I'm a teapot",
  "421": "Misdirected Request",
  "422": "Unprocessable Entity",
  "423": "Locked",
  "424": "Failed Dependency",
  "425": "Unordered Collection",
  "426": "Upgrade Required",
  "428": "Precondition Required",
  "429": "Too Many Requests",
  "431": "Request Header Fields Too Large",
  "451": "Unavailable For Legal Reasons",
  "500": "Internal Server Error",
  "501": "Not Implemented",
  "502": "Bad Gateway",
  "503": "Service Unavailable",
  "504": "Gateway Timeout",
  "505": "HTTP Version Not Supported",
  "506": "Variant Also Negotiates",
  "507": "Insufficient Storage",
  "508": "Loop Detected",
  "509": "Bandwidth Limit Exceeded",
  "510": "Not Extended",
  "511": "Network Authentication Required"
}

},{}],30:[function(require,module,exports){
(function(self) {

var irrelevant = (function (exports) {

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob:
      'FileReader' in self &&
      'Blob' in self &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj)
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView =
      ArrayBuffer.isView ||
      function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push(name);
    });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) {
      items.push(value);
    });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit})
  };

  function decode(body) {
    var form = new FormData();
    body
      .trim()
      .split('&')
      .forEach(function(bytes) {
        if (bytes) {
          var split = bytes.split('=');
          var name = split.shift().replace(/\+/g, ' ');
          var value = split.join('=').replace(/\+/g, ' ');
          form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
      });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  exports.DOMException = self.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'))
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.onabort = function() {
        reject(new exports.DOMException('Aborted', 'AbortError'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  }

  fetch.polyfill = true;

  if (!self.fetch) {
    self.fetch = fetch;
    self.Headers = Headers;
    self.Request = Request;
    self.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  return exports;

}({}));
})(typeof self !== 'undefined' ? self : this);

},{}],31:[function(require,module,exports){
exports.UINT32 = require('./lib/uint32')
exports.UINT64 = require('./lib/uint64')
},{"./lib/uint32":32,"./lib/uint64":33}],32:[function(require,module,exports){
/**
	C-like unsigned 32 bits integers in Javascript
	Copyright (C) 2013, Pierre Curto
	MIT license
 */
;(function (root) {

	// Local cache for typical radices
	var radixPowerCache = {
		36: UINT32( Math.pow(36, 5) )
	,	16: UINT32( Math.pow(16, 7) )
	,	10: UINT32( Math.pow(10, 9) )
	,	2:  UINT32( Math.pow(2, 30) )
	}
	var radixCache = {
		36: UINT32(36)
	,	16: UINT32(16)
	,	10: UINT32(10)
	,	2:  UINT32(2)
	}

	/**
	 *	Represents an unsigned 32 bits integer
	 * @constructor
	 * @param {Number|String|Number} low bits     | integer as a string 		 | integer as a number
	 * @param {Number|Number|Undefined} high bits | radix (optional, default=10)
	 * @return 
	 */
	function UINT32 (l, h) {
		if ( !(this instanceof UINT32) )
			return new UINT32(l, h)

		this._low = 0
		this._high = 0
		this.remainder = null
		if (typeof h == 'undefined')
			return fromNumber.call(this, l)

		if (typeof l == 'string')
			return fromString.call(this, l, h)

		fromBits.call(this, l, h)
	}

	/**
	 * Set the current _UINT32_ object with its low and high bits
	 * @method fromBits
	 * @param {Number} low bits
	 * @param {Number} high bits
	 * @return ThisExpression
	 */
	function fromBits (l, h) {
		this._low = l | 0
		this._high = h | 0

		return this
	}
	UINT32.prototype.fromBits = fromBits

	/**
	 * Set the current _UINT32_ object from a number
	 * @method fromNumber
	 * @param {Number} number
	 * @return ThisExpression
	 */
	function fromNumber (value) {
		this._low = value & 0xFFFF
		this._high = value >>> 16

		return this
	}
	UINT32.prototype.fromNumber = fromNumber

	/**
	 * Set the current _UINT32_ object from a string
	 * @method fromString
	 * @param {String} integer as a string
	 * @param {Number} radix (optional, default=10)
	 * @return ThisExpression
	 */
	function fromString (s, radix) {
		var value = parseInt(s, radix || 10)

		this._low = value & 0xFFFF
		this._high = value >>> 16

		return this
	}
	UINT32.prototype.fromString = fromString

	/**
	 * Convert this _UINT32_ to a number
	 * @method toNumber
	 * @return {Number} the converted UINT32
	 */
	UINT32.prototype.toNumber = function () {
		return (this._high * 65536) + this._low
	}

	/**
	 * Convert this _UINT32_ to a string
	 * @method toString
	 * @param {Number} radix (optional, default=10)
	 * @return {String} the converted UINT32
	 */
	UINT32.prototype.toString = function (radix) {
		return this.toNumber().toString(radix || 10)
	}

	/**
	 * Add two _UINT32_. The current _UINT32_ stores the result
	 * @method add
	 * @param {Object} other UINT32
	 * @return ThisExpression
	 */
	UINT32.prototype.add = function (other) {
		var a00 = this._low + other._low
		var a16 = a00 >>> 16

		a16 += this._high + other._high

		this._low = a00 & 0xFFFF
		this._high = a16 & 0xFFFF

		return this
	}

	/**
	 * Subtract two _UINT32_. The current _UINT32_ stores the result
	 * @method subtract
	 * @param {Object} other UINT32
	 * @return ThisExpression
	 */
	UINT32.prototype.subtract = function (other) {
		//TODO inline
		return this.add( other.clone().negate() )
	}

	/**
	 * Multiply two _UINT32_. The current _UINT32_ stores the result
	 * @method multiply
	 * @param {Object} other UINT32
	 * @return ThisExpression
	 */
	UINT32.prototype.multiply = function (other) {
		/*
			a = a00 + a16
			b = b00 + b16
			a*b = (a00 + a16)(b00 + b16)
				= a00b00 + a00b16 + a16b00 + a16b16

			a16b16 overflows the 32bits
		 */
		var a16 = this._high
		var a00 = this._low
		var b16 = other._high
		var b00 = other._low

/* Removed to increase speed under normal circumstances (i.e. not multiplying by 0 or 1)
		// this == 0 or other == 1: nothing to do
		if ((a00 == 0 && a16 == 0) || (b00 == 1 && b16 == 0)) return this

		// other == 0 or this == 1: this = other
		if ((b00 == 0 && b16 == 0) || (a00 == 1 && a16 == 0)) {
			this._low = other._low
			this._high = other._high
			return this
		}
*/

		var c16, c00
		c00 = a00 * b00
		c16 = c00 >>> 16

		c16 += a16 * b00
		c16 &= 0xFFFF		// Not required but improves performance
		c16 += a00 * b16

		this._low = c00 & 0xFFFF
		this._high = c16 & 0xFFFF

		return this
	}

	/**
	 * Divide two _UINT32_. The current _UINT32_ stores the result.
	 * The remainder is made available as the _remainder_ property on
	 * the _UINT32_ object. It can be null, meaning there are no remainder.
	 * @method div
	 * @param {Object} other UINT32
	 * @return ThisExpression
	 */
	UINT32.prototype.div = function (other) {
		if ( (other._low == 0) && (other._high == 0) ) throw Error('division by zero')

		// other == 1
		if (other._high == 0 && other._low == 1) {
			this.remainder = new UINT32(0)
			return this
		}

		// other > this: 0
		if ( other.gt(this) ) {
			this.remainder = this.clone()
			this._low = 0
			this._high = 0
			return this
		}
		// other == this: 1
		if ( this.eq(other) ) {
			this.remainder = new UINT32(0)
			this._low = 1
			this._high = 0
			return this
		}

		// Shift the divisor left until it is higher than the dividend
		var _other = other.clone()
		var i = -1
		while ( !this.lt(_other) ) {
			// High bit can overflow the default 16bits
			// Its ok since we right shift after this loop
			// The overflown bit must be kept though
			_other.shiftLeft(1, true)
			i++
		}

		// Set the remainder
		this.remainder = this.clone()
		// Initialize the current result to 0
		this._low = 0
		this._high = 0
		for (; i >= 0; i--) {
			_other.shiftRight(1)
			// If shifted divisor is smaller than the dividend
			// then subtract it from the dividend
			if ( !this.remainder.lt(_other) ) {
				this.remainder.subtract(_other)
				// Update the current result
				if (i >= 16) {
					this._high |= 1 << (i - 16)
				} else {
					this._low |= 1 << i
				}
			}
		}

		return this
	}

	/**
	 * Negate the current _UINT32_
	 * @method negate
	 * @return ThisExpression
	 */
	UINT32.prototype.negate = function () {
		var v = ( ~this._low & 0xFFFF ) + 1
		this._low = v & 0xFFFF
		this._high = (~this._high + (v >>> 16)) & 0xFFFF

		return this
	}

	/**
	 * Equals
	 * @method eq
	 * @param {Object} other UINT32
	 * @return {Boolean}
	 */
	UINT32.prototype.equals = UINT32.prototype.eq = function (other) {
		return (this._low == other._low) && (this._high == other._high)
	}

	/**
	 * Greater than (strict)
	 * @method gt
	 * @param {Object} other UINT32
	 * @return {Boolean}
	 */
	UINT32.prototype.greaterThan = UINT32.prototype.gt = function (other) {
		if (this._high > other._high) return true
		if (this._high < other._high) return false
		return this._low > other._low
	}

	/**
	 * Less than (strict)
	 * @method lt
	 * @param {Object} other UINT32
	 * @return {Boolean}
	 */
	UINT32.prototype.lessThan = UINT32.prototype.lt = function (other) {
		if (this._high < other._high) return true
		if (this._high > other._high) return false
		return this._low < other._low
	}

	/**
	 * Bitwise OR
	 * @method or
	 * @param {Object} other UINT32
	 * @return ThisExpression
	 */
	UINT32.prototype.or = function (other) {
		this._low |= other._low
		this._high |= other._high

		return this
	}

	/**
	 * Bitwise AND
	 * @method and
	 * @param {Object} other UINT32
	 * @return ThisExpression
	 */
	UINT32.prototype.and = function (other) {
		this._low &= other._low
		this._high &= other._high

		return this
	}

	/**
	 * Bitwise NOT
	 * @method not
	 * @return ThisExpression
	 */
	UINT32.prototype.not = function() {
		this._low = ~this._low & 0xFFFF
		this._high = ~this._high & 0xFFFF

		return this
	}

	/**
	 * Bitwise XOR
	 * @method xor
	 * @param {Object} other UINT32
	 * @return ThisExpression
	 */
	UINT32.prototype.xor = function (other) {
		this._low ^= other._low
		this._high ^= other._high

		return this
	}

	/**
	 * Bitwise shift right
	 * @method shiftRight
	 * @param {Number} number of bits to shift
	 * @return ThisExpression
	 */
	UINT32.prototype.shiftRight = UINT32.prototype.shiftr = function (n) {
		if (n > 16) {
			this._low = this._high >> (n - 16)
			this._high = 0
		} else if (n == 16) {
			this._low = this._high
			this._high = 0
		} else {
			this._low = (this._low >> n) | ( (this._high << (16-n)) & 0xFFFF )
			this._high >>= n
		}

		return this
	}

	/**
	 * Bitwise shift left
	 * @method shiftLeft
	 * @param {Number} number of bits to shift
	 * @param {Boolean} allow overflow
	 * @return ThisExpression
	 */
	UINT32.prototype.shiftLeft = UINT32.prototype.shiftl = function (n, allowOverflow) {
		if (n > 16) {
			this._high = this._low << (n - 16)
			this._low = 0
			if (!allowOverflow) {
				this._high &= 0xFFFF
			}
		} else if (n == 16) {
			this._high = this._low
			this._low = 0
		} else {
			this._high = (this._high << n) | (this._low >> (16-n))
			this._low = (this._low << n) & 0xFFFF
			if (!allowOverflow) {
				// Overflow only allowed on the high bits...
				this._high &= 0xFFFF
			}
		}

		return this
	}

	/**
	 * Bitwise rotate left
	 * @method rotl
	 * @param {Number} number of bits to rotate
	 * @return ThisExpression
	 */
	UINT32.prototype.rotateLeft = UINT32.prototype.rotl = function (n) {
		var v = (this._high << 16) | this._low
		v = (v << n) | (v >>> (32 - n))
		this._low = v & 0xFFFF
		this._high = v >>> 16

		return this
	}

	/**
	 * Bitwise rotate right
	 * @method rotr
	 * @param {Number} number of bits to rotate
	 * @return ThisExpression
	 */
	UINT32.prototype.rotateRight = UINT32.prototype.rotr = function (n) {
		var v = (this._high << 16) | this._low
		v = (v >>> n) | (v << (32 - n))
		this._low = v & 0xFFFF
		this._high = v >>> 16

		return this
	}

	/**
	 * Clone the current _UINT32_
	 * @method clone
	 * @return {Object} cloned UINT32
	 */
	UINT32.prototype.clone = function () {
		return new UINT32(this._low, this._high)
	}

	if (typeof define != 'undefined' && define.amd) {
		// AMD / RequireJS
		define([], function () {
			return UINT32
		})
	} else if (typeof module != 'undefined' && module.exports) {
		// Node.js
		module.exports = UINT32
	} else {
		// Browser
		root['UINT32'] = UINT32
	}

})(this)

},{}],33:[function(require,module,exports){
/**
	C-like unsigned 64 bits integers in Javascript
	Copyright (C) 2013, Pierre Curto
	MIT license
 */
;(function (root) {

	// Local cache for typical radices
	var radixPowerCache = {
		16: UINT64( Math.pow(16, 5) )
	,	10: UINT64( Math.pow(10, 5) )
	,	2:  UINT64( Math.pow(2, 5) )
	}
	var radixCache = {
		16: UINT64(16)
	,	10: UINT64(10)
	,	2:  UINT64(2)
	}

	/**
	 *	Represents an unsigned 64 bits integer
	 * @constructor
	 * @param {Number} first low bits (8)
	 * @param {Number} second low bits (8)
	 * @param {Number} first high bits (8)
	 * @param {Number} second high bits (8)
	 * or
	 * @param {Number} low bits (32)
	 * @param {Number} high bits (32)
	 * or
	 * @param {String|Number} integer as a string 		 | integer as a number
	 * @param {Number|Undefined} radix (optional, default=10)
	 * @return 
	 */
	function UINT64 (a00, a16, a32, a48) {
		if ( !(this instanceof UINT64) )
			return new UINT64(a00, a16, a32, a48)

		this.remainder = null
		if (typeof a00 == 'string')
			return fromString.call(this, a00, a16)

		if (typeof a16 == 'undefined')
			return fromNumber.call(this, a00)

		fromBits.apply(this, arguments)
	}

	/**
	 * Set the current _UINT64_ object with its low and high bits
	 * @method fromBits
	 * @param {Number} first low bits (8)
	 * @param {Number} second low bits (8)
	 * @param {Number} first high bits (8)
	 * @param {Number} second high bits (8)
	 * or
	 * @param {Number} low bits (32)
	 * @param {Number} high bits (32)
	 * @return ThisExpression
	 */
	function fromBits (a00, a16, a32, a48) {
		if (typeof a32 == 'undefined') {
			this._a00 = a00 & 0xFFFF
			this._a16 = a00 >>> 16
			this._a32 = a16 & 0xFFFF
			this._a48 = a16 >>> 16
			return this
		}

		this._a00 = a00 | 0
		this._a16 = a16 | 0
		this._a32 = a32 | 0
		this._a48 = a48 | 0

		return this
	}
	UINT64.prototype.fromBits = fromBits

	/**
	 * Set the current _UINT64_ object from a number
	 * @method fromNumber
	 * @param {Number} number
	 * @return ThisExpression
	 */
	function fromNumber (value) {
		this._a00 = value & 0xFFFF
		this._a16 = value >>> 16
		this._a32 = 0
		this._a48 = 0

		return this
	}
	UINT64.prototype.fromNumber = fromNumber

	/**
	 * Set the current _UINT64_ object from a string
	 * @method fromString
	 * @param {String} integer as a string
	 * @param {Number} radix (optional, default=10)
	 * @return ThisExpression
	 */
	function fromString (s, radix) {
		radix = radix || 10

		this._a00 = 0
		this._a16 = 0
		this._a32 = 0
		this._a48 = 0

		/*
			In Javascript, bitwise operators only operate on the first 32 bits 
			of a number, even though parseInt() encodes numbers with a 53 bits 
			mantissa.
			Therefore UINT64(<Number>) can only work on 32 bits.
			The radix maximum value is 36 (as per ECMA specs) (26 letters + 10 digits)
			maximum input value is m = 32bits as 1 = 2^32 - 1
			So the maximum substring length n is:
			36^(n+1) - 1 = 2^32 - 1
			36^(n+1) = 2^32
			(n+1)ln(36) = 32ln(2)
			n = 32ln(2)/ln(36) - 1
			n = 5.189644915687692
			n = 5
		 */
		var radixUint = radixPowerCache[radix] || new UINT64( Math.pow(radix, 5) )

		for (var i = 0, len = s.length; i < len; i += 5) {
			var size = Math.min(5, len - i)
			var value = parseInt( s.slice(i, i + size), radix )
			this.multiply(
					size < 5
						? new UINT64( Math.pow(radix, size) )
						: radixUint
				)
				.add( new UINT64(value) )
		}

		return this
	}
	UINT64.prototype.fromString = fromString

	/**
	 * Convert this _UINT64_ to a number (last 32 bits are dropped)
	 * @method toNumber
	 * @return {Number} the converted UINT64
	 */
	UINT64.prototype.toNumber = function () {
		return (this._a16 * 65536) + this._a00
	}

	/**
	 * Convert this _UINT64_ to a string
	 * @method toString
	 * @param {Number} radix (optional, default=10)
	 * @return {String} the converted UINT64
	 */
	UINT64.prototype.toString = function (radix) {
		radix = radix || 10
		var radixUint = radixCache[radix] || new UINT64(radix)

		if ( !this.gt(radixUint) ) return this.toNumber().toString(radix)

		var self = this.clone()
		var res = new Array(64)
		for (var i = 63; i >= 0; i--) {
			self.div(radixUint)
			res[i] = self.remainder.toNumber().toString(radix)
			if ( !self.gt(radixUint) ) break
		}
		res[i-1] = self.toNumber().toString(radix)

		return res.join('')
	}

	/**
	 * Add two _UINT64_. The current _UINT64_ stores the result
	 * @method add
	 * @param {Object} other UINT64
	 * @return ThisExpression
	 */
	UINT64.prototype.add = function (other) {
		var a00 = this._a00 + other._a00

		var a16 = a00 >>> 16
		a16 += this._a16 + other._a16

		var a32 = a16 >>> 16
		a32 += this._a32 + other._a32

		var a48 = a32 >>> 16
		a48 += this._a48 + other._a48

		this._a00 = a00 & 0xFFFF
		this._a16 = a16 & 0xFFFF
		this._a32 = a32 & 0xFFFF
		this._a48 = a48 & 0xFFFF

		return this
	}

	/**
	 * Subtract two _UINT64_. The current _UINT64_ stores the result
	 * @method subtract
	 * @param {Object} other UINT64
	 * @return ThisExpression
	 */
	UINT64.prototype.subtract = function (other) {
		return this.add( other.clone().negate() )
	}

	/**
	 * Multiply two _UINT64_. The current _UINT64_ stores the result
	 * @method multiply
	 * @param {Object} other UINT64
	 * @return ThisExpression
	 */
	UINT64.prototype.multiply = function (other) {
		/*
			a = a00 + a16 + a32 + a48
			b = b00 + b16 + b32 + b48
			a*b = (a00 + a16 + a32 + a48)(b00 + b16 + b32 + b48)
				= a00b00 + a00b16 + a00b32 + a00b48
				+ a16b00 + a16b16 + a16b32 + a16b48
				+ a32b00 + a32b16 + a32b32 + a32b48
				+ a48b00 + a48b16 + a48b32 + a48b48

			a16b48, a32b32, a48b16, a48b32 and a48b48 overflow the 64 bits
			so it comes down to:
			a*b	= a00b00 + a00b16 + a00b32 + a00b48
				+ a16b00 + a16b16 + a16b32
				+ a32b00 + a32b16
				+ a48b00
				= a00b00
				+ a00b16 + a16b00
				+ a00b32 + a16b16 + a32b00
				+ a00b48 + a16b32 + a32b16 + a48b00
		 */
		var a00 = this._a00
		var a16 = this._a16
		var a32 = this._a32
		var a48 = this._a48
		var b00 = other._a00
		var b16 = other._a16
		var b32 = other._a32
		var b48 = other._a48

		var c00 = a00 * b00

		var c16 = c00 >>> 16
		c16 += a00 * b16
		var c32 = c16 >>> 16
		c16 &= 0xFFFF
		c16 += a16 * b00

		c32 += c16 >>> 16
		c32 += a00 * b32
		var c48 = c32 >>> 16
		c32 &= 0xFFFF
		c32 += a16 * b16
		c48 += c32 >>> 16
		c32 &= 0xFFFF
		c32 += a32 * b00

		c48 += c32 >>> 16
		c48 += a00 * b48
		c48 &= 0xFFFF
		c48 += a16 * b32
		c48 &= 0xFFFF
		c48 += a32 * b16
		c48 &= 0xFFFF
		c48 += a48 * b00

		this._a00 = c00 & 0xFFFF
		this._a16 = c16 & 0xFFFF
		this._a32 = c32 & 0xFFFF
		this._a48 = c48 & 0xFFFF

		return this
	}

	/**
	 * Divide two _UINT64_. The current _UINT64_ stores the result.
	 * The remainder is made available as the _remainder_ property on
	 * the _UINT64_ object. It can be null, meaning there are no remainder.
	 * @method div
	 * @param {Object} other UINT64
	 * @return ThisExpression
	 */
	UINT64.prototype.div = function (other) {
		if ( (other._a16 == 0) && (other._a32 == 0) && (other._a48 == 0) ) {
			if (other._a00 == 0) throw Error('division by zero')

			// other == 1: this
			if (other._a00 == 1) {
				this.remainder = new UINT64(0)
				return this
			}
		}

		// other > this: 0
		if ( other.gt(this) ) {
			this.remainder = this.clone()
			this._a00 = 0
			this._a16 = 0
			this._a32 = 0
			this._a48 = 0
			return this
		}
		// other == this: 1
		if ( this.eq(other) ) {
			this.remainder = new UINT64(0)
			this._a00 = 1
			this._a16 = 0
			this._a32 = 0
			this._a48 = 0
			return this
		}

		// Shift the divisor left until it is higher than the dividend
		var _other = other.clone()
		var i = -1
		while ( !this.lt(_other) ) {
			// High bit can overflow the default 16bits
			// Its ok since we right shift after this loop
			// The overflown bit must be kept though
			_other.shiftLeft(1, true)
			i++
		}

		// Set the remainder
		this.remainder = this.clone()
		// Initialize the current result to 0
		this._a00 = 0
		this._a16 = 0
		this._a32 = 0
		this._a48 = 0
		for (; i >= 0; i--) {
			_other.shiftRight(1)
			// If shifted divisor is smaller than the dividend
			// then subtract it from the dividend
			if ( !this.remainder.lt(_other) ) {
				this.remainder.subtract(_other)
				// Update the current result
				if (i >= 48) {
					this._a48 |= 1 << (i - 48)
				} else if (i >= 32) {
					this._a32 |= 1 << (i - 32)
				} else if (i >= 16) {
					this._a16 |= 1 << (i - 16)
				} else {
					this._a00 |= 1 << i
				}
			}
		}

		return this
	}

	/**
	 * Negate the current _UINT64_
	 * @method negate
	 * @return ThisExpression
	 */
	UINT64.prototype.negate = function () {
		var v = ( ~this._a00 & 0xFFFF ) + 1
		this._a00 = v & 0xFFFF
		v = (~this._a16 & 0xFFFF) + (v >>> 16)
		this._a16 = v & 0xFFFF
		v = (~this._a32 & 0xFFFF) + (v >>> 16)
		this._a32 = v & 0xFFFF
		this._a48 = (~this._a48 + (v >>> 16)) & 0xFFFF

		return this
	}

	/**

	 * @method eq
	 * @param {Object} other UINT64
	 * @return {Boolean}
	 */
	UINT64.prototype.equals = UINT64.prototype.eq = function (other) {
		return (this._a48 == other._a48) && (this._a00 == other._a00)
			 && (this._a32 == other._a32) && (this._a16 == other._a16)
	}

	/**
	 * Greater than (strict)
	 * @method gt
	 * @param {Object} other UINT64
	 * @return {Boolean}
	 */
	UINT64.prototype.greaterThan = UINT64.prototype.gt = function (other) {
		if (this._a48 > other._a48) return true
		if (this._a48 < other._a48) return false
		if (this._a32 > other._a32) return true
		if (this._a32 < other._a32) return false
		if (this._a16 > other._a16) return true
		if (this._a16 < other._a16) return false
		return this._a00 > other._a00
	}

	/**
	 * Less than (strict)
	 * @method lt
	 * @param {Object} other UINT64
	 * @return {Boolean}
	 */
	UINT64.prototype.lessThan = UINT64.prototype.lt = function (other) {
		if (this._a48 < other._a48) return true
		if (this._a48 > other._a48) return false
		if (this._a32 < other._a32) return true
		if (this._a32 > other._a32) return false
		if (this._a16 < other._a16) return true
		if (this._a16 > other._a16) return false
		return this._a00 < other._a00
	}

	/**
	 * Bitwise OR
	 * @method or
	 * @param {Object} other UINT64
	 * @return ThisExpression
	 */
	UINT64.prototype.or = function (other) {
		this._a00 |= other._a00
		this._a16 |= other._a16
		this._a32 |= other._a32
		this._a48 |= other._a48

		return this
	}

	/**
	 * Bitwise AND
	 * @method and
	 * @param {Object} other UINT64
	 * @return ThisExpression
	 */
	UINT64.prototype.and = function (other) {
		this._a00 &= other._a00
		this._a16 &= other._a16
		this._a32 &= other._a32
		this._a48 &= other._a48

		return this
	}

	/**
	 * Bitwise XOR
	 * @method xor
	 * @param {Object} other UINT64
	 * @return ThisExpression
	 */
	UINT64.prototype.xor = function (other) {
		this._a00 ^= other._a00
		this._a16 ^= other._a16
		this._a32 ^= other._a32
		this._a48 ^= other._a48

		return this
	}

	/**
	 * Bitwise NOT
	 * @method not
	 * @return ThisExpression
	 */
	UINT64.prototype.not = function() {
		this._a00 = ~this._a00 & 0xFFFF
		this._a16 = ~this._a16 & 0xFFFF
		this._a32 = ~this._a32 & 0xFFFF
		this._a48 = ~this._a48 & 0xFFFF

		return this
	}

	/**
	 * Bitwise shift right
	 * @method shiftRight
	 * @param {Number} number of bits to shift
	 * @return ThisExpression
	 */
	UINT64.prototype.shiftRight = UINT64.prototype.shiftr = function (n) {
		n %= 64
		if (n >= 48) {
			this._a00 = this._a48 >> (n - 48)
			this._a16 = 0
			this._a32 = 0
			this._a48 = 0
		} else if (n >= 32) {
			n -= 32
			this._a00 = ( (this._a32 >> n) | (this._a48 << (16-n)) ) & 0xFFFF
			this._a16 = (this._a48 >> n) & 0xFFFF
			this._a32 = 0
			this._a48 = 0
		} else if (n >= 16) {
			n -= 16
			this._a00 = ( (this._a16 >> n) | (this._a32 << (16-n)) ) & 0xFFFF
			this._a16 = ( (this._a32 >> n) | (this._a48 << (16-n)) ) & 0xFFFF
			this._a32 = (this._a48 >> n) & 0xFFFF
			this._a48 = 0
		} else {
			this._a00 = ( (this._a00 >> n) | (this._a16 << (16-n)) ) & 0xFFFF
			this._a16 = ( (this._a16 >> n) | (this._a32 << (16-n)) ) & 0xFFFF
			this._a32 = ( (this._a32 >> n) | (this._a48 << (16-n)) ) & 0xFFFF
			this._a48 = (this._a48 >> n) & 0xFFFF
		}

		return this
	}

	/**
	 * Bitwise shift left
	 * @method shiftLeft
	 * @param {Number} number of bits to shift
	 * @param {Boolean} allow overflow
	 * @return ThisExpression
	 */
	UINT64.prototype.shiftLeft = UINT64.prototype.shiftl = function (n, allowOverflow) {
		n %= 64
		if (n >= 48) {
			this._a48 = this._a00 << (n - 48)
			this._a32 = 0
			this._a16 = 0
			this._a00 = 0
		} else if (n >= 32) {
			n -= 32
			this._a48 = (this._a16 << n) | (this._a00 >> (16-n))
			this._a32 = (this._a00 << n) & 0xFFFF
			this._a16 = 0
			this._a00 = 0
		} else if (n >= 16) {
			n -= 16
			this._a48 = (this._a32 << n) | (this._a16 >> (16-n))
			this._a32 = ( (this._a16 << n) | (this._a00 >> (16-n)) ) & 0xFFFF
			this._a16 = (this._a00 << n) & 0xFFFF
			this._a00 = 0
		} else {
			this._a48 = (this._a48 << n) | (this._a32 >> (16-n))
			this._a32 = ( (this._a32 << n) | (this._a16 >> (16-n)) ) & 0xFFFF
			this._a16 = ( (this._a16 << n) | (this._a00 >> (16-n)) ) & 0xFFFF
			this._a00 = (this._a00 << n) & 0xFFFF
		}
		if (!allowOverflow) {
			this._a48 &= 0xFFFF
		}

		return this
	}

	/**
	 * Bitwise rotate left
	 * @method rotl
	 * @param {Number} number of bits to rotate
	 * @return ThisExpression
	 */
	UINT64.prototype.rotateLeft = UINT64.prototype.rotl = function (n) {
		n %= 64
		if (n == 0) return this
		if (n >= 32) {
			// A.B.C.D
			// B.C.D.A rotl(16)
			// C.D.A.B rotl(32)
			var v = this._a00
			this._a00 = this._a32
			this._a32 = v
			v = this._a48
			this._a48 = this._a16
			this._a16 = v
			if (n == 32) return this
			n -= 32
		}

		var high = (this._a48 << 16) | this._a32
		var low = (this._a16 << 16) | this._a00

		var _high = (high << n) | (low >>> (32 - n))
		var _low = (low << n) | (high >>> (32 - n))

		this._a00 = _low & 0xFFFF
		this._a16 = _low >>> 16
		this._a32 = _high & 0xFFFF
		this._a48 = _high >>> 16

		return this
	}

	/**
	 * Bitwise rotate right
	 * @method rotr
	 * @param {Number} number of bits to rotate
	 * @return ThisExpression
	 */
	UINT64.prototype.rotateRight = UINT64.prototype.rotr = function (n) {
		n %= 64
		if (n == 0) return this
		if (n >= 32) {
			// A.B.C.D
			// D.A.B.C rotr(16)
			// C.D.A.B rotr(32)
			var v = this._a00
			this._a00 = this._a32
			this._a32 = v
			v = this._a48
			this._a48 = this._a16
			this._a16 = v
			if (n == 32) return this
			n -= 32
		}

		var high = (this._a48 << 16) | this._a32
		var low = (this._a16 << 16) | this._a00

		var _high = (high >>> n) | (low << (32 - n))
		var _low = (low >>> n) | (high << (32 - n))

		this._a00 = _low & 0xFFFF
		this._a16 = _low >>> 16
		this._a32 = _high & 0xFFFF
		this._a48 = _high >>> 16

		return this
	}

	/**
	 * Clone the current _UINT64_
	 * @method clone
	 * @return {Object} cloned UINT64
	 */
	UINT64.prototype.clone = function () {
		return new UINT64(this._a00, this._a16, this._a32, this._a48)
	}

	if (typeof define != 'undefined' && define.amd) {
		// AMD / RequireJS
		define([], function () {
			return UINT64
		})
	} else if (typeof module != 'undefined' && module.exports) {
		// Node.js
		module.exports = UINT64
	} else {
		// Browser
		root['UINT64'] = UINT64
	}

})(this)

},{}],34:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],35:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],36:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],37:[function(require,module,exports){
(function (process){
// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":38}],38:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],39:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],40:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],41:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":39,"./encode":40}],42:[function(require,module,exports){
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.prototype = Object.create(Buffer.prototype)

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":28}],43:[function(require,module,exports){
(function (global){
var ClientRequest = require('./lib/request')
var response = require('./lib/response')
var extend = require('xtend')
var statusCodes = require('builtin-status-codes')
var url = require('url')

var http = exports

http.request = function (opts, cb) {
	if (typeof opts === 'string')
		opts = url.parse(opts)
	else
		opts = extend(opts)

	// Normally, the page is loaded from http or https, so not specifying a protocol
	// will result in a (valid) protocol-relative url. However, this won't work if
	// the protocol is something else, like 'file:'
	var defaultProtocol = global.location.protocol.search(/^https?:$/) === -1 ? 'http:' : ''

	var protocol = opts.protocol || defaultProtocol
	var host = opts.hostname || opts.host
	var port = opts.port
	var path = opts.path || '/'

	// Necessary for IPv6 addresses
	if (host && host.indexOf(':') !== -1)
		host = '[' + host + ']'

	// This may be a relative url. The browser should always be able to interpret it correctly.
	opts.url = (host ? (protocol + '//' + host) : '') + (port ? ':' + port : '') + path
	opts.method = (opts.method || 'GET').toUpperCase()
	opts.headers = opts.headers || {}

	// Also valid opts.auth, opts.mode

	var req = new ClientRequest(opts)
	if (cb)
		req.on('response', cb)
	return req
}

http.get = function get (opts, cb) {
	var req = http.request(opts, cb)
	req.end()
	return req
}

http.ClientRequest = ClientRequest
http.IncomingMessage = response.IncomingMessage

http.Agent = function () {}
http.Agent.defaultMaxSockets = 4

http.globalAgent = new http.Agent()

http.STATUS_CODES = statusCodes

http.METHODS = [
	'CHECKOUT',
	'CONNECT',
	'COPY',
	'DELETE',
	'GET',
	'HEAD',
	'LOCK',
	'M-SEARCH',
	'MERGE',
	'MKACTIVITY',
	'MKCOL',
	'MOVE',
	'NOTIFY',
	'OPTIONS',
	'PATCH',
	'POST',
	'PROPFIND',
	'PROPPATCH',
	'PURGE',
	'PUT',
	'REPORT',
	'SEARCH',
	'SUBSCRIBE',
	'TRACE',
	'UNLOCK',
	'UNSUBSCRIBE'
]
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lib/request":45,"./lib/response":46,"builtin-status-codes":29,"url":63,"xtend":79}],44:[function(require,module,exports){
(function (global){
exports.fetch = isFunction(global.fetch) && isFunction(global.ReadableStream)

exports.writableStream = isFunction(global.WritableStream)

exports.abortController = isFunction(global.AbortController)

// The xhr request to example.com may violate some restrictive CSP configurations,
// so if we're running in a browser that supports `fetch`, avoid calling getXHR()
// and assume support for certain features below.
var xhr
function getXHR () {
	// Cache the xhr value
	if (xhr !== undefined) return xhr

	if (global.XMLHttpRequest) {
		xhr = new global.XMLHttpRequest()
		// If XDomainRequest is available (ie only, where xhr might not work
		// cross domain), use the page location. Otherwise use example.com
		// Note: this doesn't actually make an http request.
		try {
			xhr.open('GET', global.XDomainRequest ? '/' : 'https://example.com')
		} catch(e) {
			xhr = null
		}
	} else {
		// Service workers don't have XHR
		xhr = null
	}
	return xhr
}

function checkTypeSupport (type) {
	var xhr = getXHR()
	if (!xhr) return false
	try {
		xhr.responseType = type
		return xhr.responseType === type
	} catch (e) {}
	return false
}

// If fetch is supported, then arraybuffer will be supported too. Skip calling
// checkTypeSupport(), since that calls getXHR().
exports.arraybuffer = exports.fetch || checkTypeSupport('arraybuffer')

// These next two tests unavoidably show warnings in Chrome. Since fetch will always
// be used if it's available, just return false for these to avoid the warnings.
exports.msstream = !exports.fetch && checkTypeSupport('ms-stream')
exports.mozchunkedarraybuffer = !exports.fetch && checkTypeSupport('moz-chunked-arraybuffer')

// If fetch is supported, then overrideMimeType will be supported too. Skip calling
// getXHR().
exports.overrideMimeType = exports.fetch || (getXHR() ? isFunction(getXHR().overrideMimeType) : false)

function isFunction (value) {
	return typeof value === 'function'
}

xhr = null // Help gc

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],45:[function(require,module,exports){
(function (process,global,Buffer){
var capability = require('./capability')
var inherits = require('inherits')
var response = require('./response')
var stream = require('readable-stream')

var IncomingMessage = response.IncomingMessage
var rStates = response.readyStates

function decideMode (preferBinary, useFetch) {
	if (capability.fetch && useFetch) {
		return 'fetch'
	} else if (capability.mozchunkedarraybuffer) {
		return 'moz-chunked-arraybuffer'
	} else if (capability.msstream) {
		return 'ms-stream'
	} else if (capability.arraybuffer && preferBinary) {
		return 'arraybuffer'
	} else {
		return 'text'
	}
}

var ClientRequest = module.exports = function (opts) {
	var self = this
	stream.Writable.call(self)

	self._opts = opts
	self._body = []
	self._headers = {}
	if (opts.auth)
		self.setHeader('Authorization', 'Basic ' + Buffer.from(opts.auth).toString('base64'))
	Object.keys(opts.headers).forEach(function (name) {
		self.setHeader(name, opts.headers[name])
	})

	var preferBinary
	var useFetch = true
	if (opts.mode === 'disable-fetch' || ('requestTimeout' in opts && !capability.abortController)) {
		// If the use of XHR should be preferred. Not typically needed.
		useFetch = false
		preferBinary = true
	} else if (opts.mode === 'prefer-streaming') {
		// If streaming is a high priority but binary compatibility and
		// the accuracy of the 'content-type' header aren't
		preferBinary = false
	} else if (opts.mode === 'allow-wrong-content-type') {
		// If streaming is more important than preserving the 'content-type' header
		preferBinary = !capability.overrideMimeType
	} else if (!opts.mode || opts.mode === 'default' || opts.mode === 'prefer-fast') {
		// Use binary if text streaming may corrupt data or the content-type header, or for speed
		preferBinary = true
	} else {
		throw new Error('Invalid value for opts.mode')
	}
	self._mode = decideMode(preferBinary, useFetch)
	self._fetchTimer = null

	self.on('finish', function () {
		self._onFinish()
	})
}

inherits(ClientRequest, stream.Writable)

ClientRequest.prototype.setHeader = function (name, value) {
	var self = this
	var lowerName = name.toLowerCase()
	// This check is not necessary, but it prevents warnings from browsers about setting unsafe
	// headers. To be honest I'm not entirely sure hiding these warnings is a good thing, but
	// http-browserify did it, so I will too.
	if (unsafeHeaders.indexOf(lowerName) !== -1)
		return

	self._headers[lowerName] = {
		name: name,
		value: value
	}
}

ClientRequest.prototype.getHeader = function (name) {
	var header = this._headers[name.toLowerCase()]
	if (header)
		return header.value
	return null
}

ClientRequest.prototype.removeHeader = function (name) {
	var self = this
	delete self._headers[name.toLowerCase()]
}

ClientRequest.prototype._onFinish = function () {
	var self = this

	if (self._destroyed)
		return
	var opts = self._opts

	var headersObj = self._headers
	var body = null
	if (opts.method !== 'GET' && opts.method !== 'HEAD') {
        body = new Blob(self._body, {
            type: (headersObj['content-type'] || {}).value || ''
        });
    }

	// create flattened list of headers
	var headersList = []
	Object.keys(headersObj).forEach(function (keyName) {
		var name = headersObj[keyName].name
		var value = headersObj[keyName].value
		if (Array.isArray(value)) {
			value.forEach(function (v) {
				headersList.push([name, v])
			})
		} else {
			headersList.push([name, value])
		}
	})

	if (self._mode === 'fetch') {
		var signal = null
		if (capability.abortController) {
			var controller = new AbortController()
			signal = controller.signal
			self._fetchAbortController = controller

			if ('requestTimeout' in opts && opts.requestTimeout !== 0) {
				self._fetchTimer = global.setTimeout(function () {
					self.emit('requestTimeout')
					if (self._fetchAbortController)
						self._fetchAbortController.abort()
				}, opts.requestTimeout)
			}
		}

		global.fetch(self._opts.url, {
			method: self._opts.method,
			headers: headersList,
			body: body || undefined,
			mode: 'cors',
			credentials: opts.withCredentials ? 'include' : 'same-origin',
			signal: signal
		}).then(function (response) {
			self._fetchResponse = response
			self._connect()
		}, function (reason) {
			global.clearTimeout(self._fetchTimer)
			if (!self._destroyed)
				self.emit('error', reason)
		})
	} else {
		var xhr = self._xhr = new global.XMLHttpRequest()
		try {
			xhr.open(self._opts.method, self._opts.url, true)
		} catch (err) {
			process.nextTick(function () {
				self.emit('error', err)
			})
			return
		}

		// Can't set responseType on really old browsers
		if ('responseType' in xhr)
			xhr.responseType = self._mode

		if ('withCredentials' in xhr)
			xhr.withCredentials = !!opts.withCredentials

		if (self._mode === 'text' && 'overrideMimeType' in xhr)
			xhr.overrideMimeType('text/plain; charset=x-user-defined')

		if ('requestTimeout' in opts) {
			xhr.timeout = opts.requestTimeout
			xhr.ontimeout = function () {
				self.emit('requestTimeout')
			}
		}

		headersList.forEach(function (header) {
			xhr.setRequestHeader(header[0], header[1])
		})

		self._response = null
		xhr.onreadystatechange = function () {
			switch (xhr.readyState) {
				case rStates.LOADING:
				case rStates.DONE:
					self._onXHRProgress()
					break
			}
		}
		// Necessary for streaming in Firefox, since xhr.response is ONLY defined
		// in onprogress, not in onreadystatechange with xhr.readyState = 3
		if (self._mode === 'moz-chunked-arraybuffer') {
			xhr.onprogress = function () {
				self._onXHRProgress()
			}
		}

		xhr.onerror = function () {
			if (self._destroyed)
				return
			self.emit('error', new Error('XHR error'))
		}

		try {
			xhr.send(body)
		} catch (err) {
			process.nextTick(function () {
				self.emit('error', err)
			})
			return
		}
	}
}

/**
 * Checks if xhr.status is readable and non-zero, indicating no error.
 * Even though the spec says it should be available in readyState 3,
 * accessing it throws an exception in IE8
 */
function statusValid (xhr) {
	try {
		var status = xhr.status
		return (status !== null && status !== 0)
	} catch (e) {
		return false
	}
}

ClientRequest.prototype._onXHRProgress = function () {
	var self = this

	if (!statusValid(self._xhr) || self._destroyed)
		return

	if (!self._response)
		self._connect()

	self._response._onXHRProgress()
}

ClientRequest.prototype._connect = function () {
	var self = this

	if (self._destroyed)
		return

	self._response = new IncomingMessage(self._xhr, self._fetchResponse, self._mode, self._fetchTimer)
	self._response.on('error', function(err) {
		self.emit('error', err)
	})

	self.emit('response', self._response)
}

ClientRequest.prototype._write = function (chunk, encoding, cb) {
	var self = this

	self._body.push(chunk)
	cb()
}

ClientRequest.prototype.abort = ClientRequest.prototype.destroy = function () {
	var self = this
	self._destroyed = true
	global.clearTimeout(self._fetchTimer)
	if (self._response)
		self._response._destroyed = true
	if (self._xhr)
		self._xhr.abort()
	else if (self._fetchAbortController)
		self._fetchAbortController.abort()
}

ClientRequest.prototype.end = function (data, encoding, cb) {
	var self = this
	if (typeof data === 'function') {
		cb = data
		data = undefined
	}

	stream.Writable.prototype.end.call(self, data, encoding, cb)
}

ClientRequest.prototype.flushHeaders = function () {}
ClientRequest.prototype.setTimeout = function () {}
ClientRequest.prototype.setNoDelay = function () {}
ClientRequest.prototype.setSocketKeepAlive = function () {}

// Taken from http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader%28%29-method
var unsafeHeaders = [
	'accept-charset',
	'accept-encoding',
	'access-control-request-headers',
	'access-control-request-method',
	'connection',
	'content-length',
	'cookie',
	'cookie2',
	'date',
	'dnt',
	'expect',
	'host',
	'keep-alive',
	'origin',
	'referer',
	'te',
	'trailer',
	'transfer-encoding',
	'upgrade',
	'via'
]

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"./capability":44,"./response":46,"_process":38,"buffer":28,"inherits":36,"readable-stream":61}],46:[function(require,module,exports){
(function (process,global,Buffer){
var capability = require('./capability')
var inherits = require('inherits')
var stream = require('readable-stream')

var rStates = exports.readyStates = {
	UNSENT: 0,
	OPENED: 1,
	HEADERS_RECEIVED: 2,
	LOADING: 3,
	DONE: 4
}

var IncomingMessage = exports.IncomingMessage = function (xhr, response, mode, fetchTimer) {
	var self = this
	stream.Readable.call(self)

	self._mode = mode
	self.headers = {}
	self.rawHeaders = []
	self.trailers = {}
	self.rawTrailers = []

	// Fake the 'close' event, but only once 'end' fires
	self.on('end', function () {
		// The nextTick is necessary to prevent the 'request' module from causing an infinite loop
		process.nextTick(function () {
			self.emit('close')
		})
	})

	if (mode === 'fetch') {
		self._fetchResponse = response

		self.url = response.url
		self.statusCode = response.status
		self.statusMessage = response.statusText
		
		response.headers.forEach(function (header, key){
			self.headers[key.toLowerCase()] = header
			self.rawHeaders.push(key, header)
		})

		if (capability.writableStream) {
			var writable = new WritableStream({
				write: function (chunk) {
					return new Promise(function (resolve, reject) {
						if (self._destroyed) {
							reject()
						} else if(self.push(Buffer.from(chunk))) {
							resolve()
						} else {
							self._resumeFetch = resolve
						}
					})
				},
				close: function () {
					global.clearTimeout(fetchTimer)
					if (!self._destroyed)
						self.push(null)
				},
				abort: function (err) {
					if (!self._destroyed)
						self.emit('error', err)
				}
			})

			try {
				response.body.pipeTo(writable).catch(function (err) {
					global.clearTimeout(fetchTimer)
					if (!self._destroyed)
						self.emit('error', err)
				})
				return
			} catch (e) {} // pipeTo method isn't defined. Can't find a better way to feature test this
		}
		// fallback for when writableStream or pipeTo aren't available
		var reader = response.body.getReader()
		function read () {
			reader.read().then(function (result) {
				if (self._destroyed)
					return
				if (result.done) {
					global.clearTimeout(fetchTimer)
					self.push(null)
					return
				}
				self.push(Buffer.from(result.value))
				read()
			}).catch(function (err) {
				global.clearTimeout(fetchTimer)
				if (!self._destroyed)
					self.emit('error', err)
			})
		}
		read()
	} else {
		self._xhr = xhr
		self._pos = 0

		self.url = xhr.responseURL
		self.statusCode = xhr.status
		self.statusMessage = xhr.statusText
		var headers = xhr.getAllResponseHeaders().split(/\r?\n/)
		headers.forEach(function (header) {
			var matches = header.match(/^([^:]+):\s*(.*)/)
			if (matches) {
				var key = matches[1].toLowerCase()
				if (key === 'set-cookie') {
					if (self.headers[key] === undefined) {
						self.headers[key] = []
					}
					self.headers[key].push(matches[2])
				} else if (self.headers[key] !== undefined) {
					self.headers[key] += ', ' + matches[2]
				} else {
					self.headers[key] = matches[2]
				}
				self.rawHeaders.push(matches[1], matches[2])
			}
		})

		self._charset = 'x-user-defined'
		if (!capability.overrideMimeType) {
			var mimeType = self.rawHeaders['mime-type']
			if (mimeType) {
				var charsetMatch = mimeType.match(/;\s*charset=([^;])(;|$)/)
				if (charsetMatch) {
					self._charset = charsetMatch[1].toLowerCase()
				}
			}
			if (!self._charset)
				self._charset = 'utf-8' // best guess
		}
	}
}

inherits(IncomingMessage, stream.Readable)

IncomingMessage.prototype._read = function () {
	var self = this

	var resolve = self._resumeFetch
	if (resolve) {
		self._resumeFetch = null
		resolve()
	}
}

IncomingMessage.prototype._onXHRProgress = function () {
	var self = this

	var xhr = self._xhr

	var response = null
	switch (self._mode) {
		case 'text':
			response = xhr.responseText
			if (response.length > self._pos) {
				var newData = response.substr(self._pos)
				if (self._charset === 'x-user-defined') {
					var buffer = Buffer.alloc(newData.length)
					for (var i = 0; i < newData.length; i++)
						buffer[i] = newData.charCodeAt(i) & 0xff

					self.push(buffer)
				} else {
					self.push(newData, self._charset)
				}
				self._pos = response.length
			}
			break
		case 'arraybuffer':
			if (xhr.readyState !== rStates.DONE || !xhr.response)
				break
			response = xhr.response
			self.push(Buffer.from(new Uint8Array(response)))
			break
		case 'moz-chunked-arraybuffer': // take whole
			response = xhr.response
			if (xhr.readyState !== rStates.LOADING || !response)
				break
			self.push(Buffer.from(new Uint8Array(response)))
			break
		case 'ms-stream':
			response = xhr.response
			if (xhr.readyState !== rStates.LOADING)
				break
			var reader = new global.MSStreamReader()
			reader.onprogress = function () {
				if (reader.result.byteLength > self._pos) {
					self.push(Buffer.from(new Uint8Array(reader.result.slice(self._pos))))
					self._pos = reader.result.byteLength
				}
			}
			reader.onload = function () {
				self.push(null)
			}
			// reader.onerror = ??? // TODO: this
			reader.readAsArrayBuffer(response)
			break
	}

	// The ms-stream case handles end separately in reader.onload()
	if (self._xhr.readyState === rStates.DONE && self._mode !== 'ms-stream') {
		self.push(null)
	}
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"./capability":44,"_process":38,"buffer":28,"inherits":36,"readable-stream":61}],47:[function(require,module,exports){
'use strict';

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var codes = {};

function createErrorType(code, message, Base) {
  if (!Base) {
    Base = Error;
  }

  function getMessage(arg1, arg2, arg3) {
    if (typeof message === 'string') {
      return message;
    } else {
      return message(arg1, arg2, arg3);
    }
  }

  var NodeError =
  /*#__PURE__*/
  function (_Base) {
    _inheritsLoose(NodeError, _Base);

    function NodeError(arg1, arg2, arg3) {
      return _Base.call(this, getMessage(arg1, arg2, arg3)) || this;
    }

    return NodeError;
  }(Base);

  NodeError.prototype.name = Base.name;
  NodeError.prototype.code = code;
  codes[code] = NodeError;
} // https://github.com/nodejs/node/blob/v10.8.0/lib/internal/errors.js


function oneOf(expected, thing) {
  if (Array.isArray(expected)) {
    var len = expected.length;
    expected = expected.map(function (i) {
      return String(i);
    });

    if (len > 2) {
      return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(', '), ", or ") + expected[len - 1];
    } else if (len === 2) {
      return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
    } else {
      return "of ".concat(thing, " ").concat(expected[0]);
    }
  } else {
    return "of ".concat(thing, " ").concat(String(expected));
  }
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith


function startsWith(str, search, pos) {
  return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith


function endsWith(str, search, this_len) {
  if (this_len === undefined || this_len > str.length) {
    this_len = str.length;
  }

  return str.substring(this_len - search.length, this_len) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes


function includes(str, search, start) {
  if (typeof start !== 'number') {
    start = 0;
  }

  if (start + search.length > str.length) {
    return false;
  } else {
    return str.indexOf(search, start) !== -1;
  }
}

createErrorType('ERR_INVALID_OPT_VALUE', function (name, value) {
  return 'The value "' + value + '" is invalid for option "' + name + '"';
}, TypeError);
createErrorType('ERR_INVALID_ARG_TYPE', function (name, expected, actual) {
  // determiner: 'must be' or 'must not be'
  var determiner;

  if (typeof expected === 'string' && startsWith(expected, 'not ')) {
    determiner = 'must not be';
    expected = expected.replace(/^not /, '');
  } else {
    determiner = 'must be';
  }

  var msg;

  if (endsWith(name, ' argument')) {
    // For cases like 'first argument'
    msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  } else {
    var type = includes(name, '.') ? 'property' : 'argument';
    msg = "The \"".concat(name, "\" ").concat(type, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  }

  msg += ". Received type ".concat(typeof actual);
  return msg;
}, TypeError);
createErrorType('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF');
createErrorType('ERR_METHOD_NOT_IMPLEMENTED', function (name) {
  return 'The ' + name + ' method is not implemented';
});
createErrorType('ERR_STREAM_PREMATURE_CLOSE', 'Premature close');
createErrorType('ERR_STREAM_DESTROYED', function (name) {
  return 'Cannot call ' + name + ' after a stream was destroyed';
});
createErrorType('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times');
createErrorType('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable');
createErrorType('ERR_STREAM_WRITE_AFTER_END', 'write after end');
createErrorType('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
createErrorType('ERR_UNKNOWN_ENCODING', function (arg) {
  return 'Unknown encoding: ' + arg;
}, TypeError);
createErrorType('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event');
module.exports.codes = codes;

},{}],48:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.
'use strict';
/*<replacement>*/

var objectKeys = Object.keys || function (obj) {
  var keys = [];

  for (var key in obj) {
    keys.push(key);
  }

  return keys;
};
/*</replacement>*/


module.exports = Duplex;

var Readable = require('./_stream_readable');

var Writable = require('./_stream_writable');

require('inherits')(Duplex, Readable);

{
  // Allow the keys array to be GC'ed.
  var keys = objectKeys(Writable.prototype);

  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);
  Readable.call(this, options);
  Writable.call(this, options);
  this.allowHalfOpen = true;

  if (options) {
    if (options.readable === false) this.readable = false;
    if (options.writable === false) this.writable = false;

    if (options.allowHalfOpen === false) {
      this.allowHalfOpen = false;
      this.once('end', onend);
    }
  }
}

Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});
Object.defineProperty(Duplex.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});
Object.defineProperty(Duplex.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
}); // the no-half-open enforcer

function onend() {
  // If the writable side ended, then we're ok.
  if (this._writableState.ended) return; // no more data can be written.
  // But allow more writes to happen in this tick.

  process.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }

    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});
}).call(this,require('_process'))
},{"./_stream_readable":50,"./_stream_writable":52,"_process":38,"inherits":36}],49:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.
'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

require('inherits')(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);
  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":51,"inherits":36}],50:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
'use strict';

module.exports = Readable;
/*<replacement>*/

var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;
/*<replacement>*/

var EE = require('events').EventEmitter;

var EElistenerCount = function EElistenerCount(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/


var Stream = require('./internal/streams/stream');
/*</replacement>*/


var Buffer = require('buffer').Buffer;

var OurUint8Array = global.Uint8Array || function () {};

function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}

function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
/*<replacement>*/


var debugUtil = require('util');

var debug;

if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function debug() {};
}
/*</replacement>*/


var BufferList = require('./internal/streams/buffer_list');

var destroyImpl = require('./internal/streams/destroy');

var _require = require('./internal/streams/state'),
    getHighWaterMark = _require.getHighWaterMark;

var _require$codes = require('../errors').codes,
    ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
    ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT; // Lazy loaded to improve the startup performance.


var StringDecoder;
var createReadableStreamAsyncIterator;
var from;

require('inherits')(Readable, Stream);

var errorOrDestroy = destroyImpl.errorOrDestroy;
var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn); // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.

  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream, isDuplex) {
  Duplex = Duplex || require('./_stream_duplex');
  options = options || {}; // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.

  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex; // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away

  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode; // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"

  this.highWaterMark = getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex); // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()

  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false; // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.

  this.sync = true; // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.

  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;
  this.paused = true; // Should close be emitted on destroy. Defaults to true.

  this.emitClose = options.emitClose !== false; // Should .destroy() be called after 'end' (and potentially 'finish')

  this.autoDestroy = !!options.autoDestroy; // has it been destroyed

  this.destroyed = false; // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.

  this.defaultEncoding = options.defaultEncoding || 'utf8'; // the number of writers that are awaiting a drain event in .pipe()s

  this.awaitDrain = 0; // if true, a maybeReadMore has been scheduled

  this.readingMore = false;
  this.decoder = null;
  this.encoding = null;

  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');
  if (!(this instanceof Readable)) return new Readable(options); // Checking for a Stream.Duplex instance is faster here instead of inside
  // the ReadableState constructor, at least with V8 6.5

  var isDuplex = this instanceof Duplex;
  this._readableState = new ReadableState(options, this, isDuplex); // legacy

  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined) {
      return false;
    }

    return this._readableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._readableState.destroyed = value;
  }
});
Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;

Readable.prototype._destroy = function (err, cb) {
  cb(err);
}; // Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.


Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;

      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }

      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
}; // Unshift should *always* be something directly out of read()


Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  debug('readableAddChunk', chunk);
  var state = stream._readableState;

  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);

    if (er) {
      errorOrDestroy(stream, er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
      } else if (state.destroyed) {
        return false;
      } else {
        state.reading = false;

        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
      maybeReadMore(stream, state);
    }
  } // We can push more data if we are below the highWaterMark.
  // Also, if we have no data yet, we can stand some more bytes.
  // This is to work around cases where hwm=0, such as the repl.


  return !state.ended && (state.length < state.highWaterMark || state.length === 0);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    state.awaitDrain = 0;
    stream.emit('data', chunk);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
    if (state.needReadable) emitReadable(stream);
  }

  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;

  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
  }

  return er;
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
}; // backwards compatibility.


Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  var decoder = new StringDecoder(enc);
  this._readableState.decoder = decoder; // If setEncoding(null), decoder.encoding equals utf8

  this._readableState.encoding = this._readableState.decoder.encoding; // Iterate over current buffer to convert already stored Buffers:

  var p = this._readableState.buffer.head;
  var content = '';

  while (p !== null) {
    content += decoder.write(p.data);
    p = p.next;
  }

  this._readableState.buffer.clear();

  if (content !== '') this._readableState.buffer.push(content);
  this._readableState.length = content.length;
  return this;
}; // Don't raise the hwm > 1GB


var MAX_HWM = 0x40000000;

function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    // TODO(ronag): Throw ERR_VALUE_OUT_OF_RANGE.
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }

  return n;
} // This function is designed to be inlinable, so please take care when making
// changes to the function body.


function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;

  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  } // If we're asking for more than the current hwm, then raise the hwm.


  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n; // Don't have enough

  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }

  return state.length;
} // you can override either this method, or the async _read(n) below.


Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;
  if (n !== 0) state.emittedReadable = false; // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.

  if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state); // if we've ended, and we're now clear, then finish it up.

  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  } // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.
  // if we need a readable event, then we need to do some reading.


  var doRead = state.needReadable;
  debug('need readable', doRead); // if we currently have less than the highWaterMark, then also read some

  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  } // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.


  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true; // if the length is currently zero, then we *need* a readable event.

    if (state.length === 0) state.needReadable = true; // call internal read method

    this._read(state.highWaterMark);

    state.sync = false; // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.

    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = state.length <= state.highWaterMark;
    n = 0;
  } else {
    state.length -= n;
    state.awaitDrain = 0;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true; // If we tried to read() past the EOF, then emit end on the next tick.

    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);
  return ret;
};

function onEofChunk(stream, state) {
  debug('onEofChunk');
  if (state.ended) return;

  if (state.decoder) {
    var chunk = state.decoder.end();

    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }

  state.ended = true;

  if (state.sync) {
    // if we are sync, wait until next tick to emit the data.
    // Otherwise we risk emitting data in the flow()
    // the readable code triggers during a read() call
    emitReadable(stream);
  } else {
    // emit 'readable' now to make sure it gets picked up.
    state.needReadable = false;

    if (!state.emittedReadable) {
      state.emittedReadable = true;
      emitReadable_(stream);
    }
  }
} // Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.


function emitReadable(stream) {
  var state = stream._readableState;
  debug('emitReadable', state.needReadable, state.emittedReadable);
  state.needReadable = false;

  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    process.nextTick(emitReadable_, stream);
  }
}

function emitReadable_(stream) {
  var state = stream._readableState;
  debug('emitReadable_', state.destroyed, state.length, state.ended);

  if (!state.destroyed && (state.length || state.ended)) {
    stream.emit('readable');
    state.emittedReadable = false;
  } // The stream needs another readable event if
  // 1. It is not flowing, as the flow mechanism will take
  //    care of it.
  // 2. It is not ended.
  // 3. It is below the highWaterMark, so we can schedule
  //    another readable later.


  state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
  flow(stream);
} // at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.


function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    process.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  // Attempt to read more data if we should.
  //
  // The conditions for reading more data are (one of):
  // - Not enough data buffered (state.length < state.highWaterMark). The loop
  //   is responsible for filling the buffer with enough data if such data
  //   is available. If highWaterMark is 0 and we are not in the flowing mode
  //   we should _not_ attempt to buffer any extra data. We'll get more data
  //   when the stream consumer calls read() instead.
  // - No data in the buffer, and the stream is in flowing mode. In this mode
  //   the loop below is responsible for ensuring read() is called. Failing to
  //   call read here would abort the flow and there's no other mechanism for
  //   continuing the flow if the stream consumer has just subscribed to the
  //   'data' event.
  //
  // In addition to the above conditions to keep reading data, the following
  // conditions prevent the data from being read:
  // - The stream has ended (state.ended).
  // - There is already a pending 'read' operation (state.reading). This is a
  //   case where the the stream has called the implementation defined _read()
  //   method, but they are processing the call asynchronously and have _not_
  //   called push() with new data. In this case we skip performing more
  //   read()s. The execution ends in this method again after the _read() ends
  //   up calling push() with more data.
  while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
    var len = state.length;
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length) // didn't get any data, stop spinning.
      break;
  }

  state.readingMore = false;
} // abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.


Readable.prototype._read = function (n) {
  errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED('_read()'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;

    case 1:
      state.pipes = [state.pipes, dest];
      break;

    default:
      state.pipes.push(dest);
      break;
  }

  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) process.nextTick(endFn);else src.once('end', endFn);
  dest.on('unpipe', onunpipe);

  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');

    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  } // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.


  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);
  var cleanedUp = false;

  function cleanup() {
    debug('cleanup'); // cleanup event handlers once the pipe is broken

    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);
    cleanedUp = true; // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.

    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  src.on('data', ondata);

  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    debug('dest.write', ret);

    if (ret === false) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', state.awaitDrain);
        state.awaitDrain++;
      }

      src.pause();
    }
  } // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.


  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) errorOrDestroy(dest, er);
  } // Make sure our error handler is attached before userland ones.


  prependListener(dest, 'error', onerror); // Both close and finish should trigger unpipe, but only once.

  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }

  dest.once('close', onclose);

  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }

  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  } // tell the dest that it's being piped to


  dest.emit('pipe', src); // start the flow if it hasn't been started already.

  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function pipeOnDrainFunctionResult() {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;

    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = {
    hasUnpiped: false
  }; // if we're not piping anywhere, then do nothing.

  if (state.pipesCount === 0) return this; // just one destination.  most common case.

  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;
    if (!dest) dest = state.pipes; // got a match.

    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  } // slow case. multiple pipe destinations.


  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, {
        hasUnpiped: false
      });
    }

    return this;
  } // try to find the right one.


  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;
  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];
  dest.emit('unpipe', this, unpipeInfo);
  return this;
}; // set up data events if they are asked for
// Ensure readable listeners eventually get something


Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);
  var state = this._readableState;

  if (ev === 'data') {
    // update readableListening so that resume() may be a no-op
    // a few lines down. This is needed to support once('readable').
    state.readableListening = this.listenerCount('readable') > 0; // Try start flowing on next tick if stream isn't explicitly paused

    if (state.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.flowing = false;
      state.emittedReadable = false;
      debug('on readable', state.length, state.reading);

      if (state.length) {
        emitReadable(this);
      } else if (!state.reading) {
        process.nextTick(nReadingNextTick, this);
      }
    }
  }

  return res;
};

Readable.prototype.addListener = Readable.prototype.on;

Readable.prototype.removeListener = function (ev, fn) {
  var res = Stream.prototype.removeListener.call(this, ev, fn);

  if (ev === 'readable') {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }

  return res;
};

Readable.prototype.removeAllListeners = function (ev) {
  var res = Stream.prototype.removeAllListeners.apply(this, arguments);

  if (ev === 'readable' || ev === undefined) {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }

  return res;
};

function updateReadableListening(self) {
  var state = self._readableState;
  state.readableListening = self.listenerCount('readable') > 0;

  if (state.resumeScheduled && !state.paused) {
    // flowing needs to be set to true now, otherwise
    // the upcoming resume will not flow.
    state.flowing = true; // crude way to check if we should resume
  } else if (self.listenerCount('data') > 0) {
    self.resume();
  }
}

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
} // pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.


Readable.prototype.resume = function () {
  var state = this._readableState;

  if (!state.flowing) {
    debug('resume'); // we flow only if there is no one listening
    // for readable, but we still have to call
    // resume()

    state.flowing = !state.readableListening;
    resume(this, state);
  }

  state.paused = false;
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    process.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  debug('resume', state.reading);

  if (!state.reading) {
    stream.read(0);
  }

  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);

  if (this._readableState.flowing !== false) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }

  this._readableState.paused = true;
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);

  while (state.flowing && stream.read() !== null) {
    ;
  }
} // wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.


Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;
  stream.on('end', function () {
    debug('wrapped end');

    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });
  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk); // don't skip over falsy values in objectMode

    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);

    if (!ret) {
      paused = true;
      stream.pause();
    }
  }); // proxy all the other methods.
  // important when wrapping filters and duplexes.

  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function methodWrap(method) {
        return function methodWrapReturnFunction() {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  } // proxy certain important events.


  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  } // when we try to consume some more bytes, simply unpause the
  // underlying stream.


  this._read = function (n) {
    debug('wrapped _read', n);

    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

if (typeof Symbol === 'function') {
  Readable.prototype[Symbol.asyncIterator] = function () {
    if (createReadableStreamAsyncIterator === undefined) {
      createReadableStreamAsyncIterator = require('./internal/streams/async_iterator');
    }

    return createReadableStreamAsyncIterator(this);
  };
}

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.highWaterMark;
  }
});
Object.defineProperty(Readable.prototype, 'readableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState && this._readableState.buffer;
  }
});
Object.defineProperty(Readable.prototype, 'readableFlowing', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.flowing;
  },
  set: function set(state) {
    if (this._readableState) {
      this._readableState.flowing = state;
    }
  }
}); // exposed for testing purposes only.

Readable._fromList = fromList;
Object.defineProperty(Readable.prototype, 'readableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.length;
  }
}); // Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.

function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;
  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.first();else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = state.buffer.consume(n, state.decoder);
  }
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;
  debug('endReadable', state.endEmitted);

  if (!state.endEmitted) {
    state.ended = true;
    process.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  debug('endReadableNT', state.endEmitted, state.length); // Check that we didn't get one last unshift.

  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');

    if (state.autoDestroy) {
      // In case of duplex streams we need a way to detect
      // if the writable side is ready for autoDestroy as well
      var wState = stream._writableState;

      if (!wState || wState.autoDestroy && wState.finished) {
        stream.destroy();
      }
    }
  }
}

if (typeof Symbol === 'function') {
  Readable.from = function (iterable, opts) {
    if (from === undefined) {
      from = require('./internal/streams/from');
    }

    return from(Readable, iterable, opts);
  };
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }

  return -1;
}
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../errors":47,"./_stream_duplex":48,"./internal/streams/async_iterator":53,"./internal/streams/buffer_list":54,"./internal/streams/destroy":55,"./internal/streams/from":57,"./internal/streams/state":59,"./internal/streams/stream":60,"_process":38,"buffer":28,"events":34,"inherits":36,"string_decoder/":62,"util":25}],51:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.
'use strict';

module.exports = Transform;

var _require$codes = require('../errors').codes,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
    ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING,
    ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;

var Duplex = require('./_stream_duplex');

require('inherits')(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;
  var cb = ts.writecb;

  if (cb === null) {
    return this.emit('error', new ERR_MULTIPLE_CALLBACK());
  }

  ts.writechunk = null;
  ts.writecb = null;
  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);
  cb(er);
  var rs = this._readableState;
  rs.reading = false;

  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);
  Duplex.call(this, options);
  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  }; // start out asking for a readable event once data is transformed.

  this._readableState.needReadable = true; // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.

  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;
    if (typeof options.flush === 'function') this._flush = options.flush;
  } // When the writable side finishes, then flush out anything remaining.


  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function' && !this._readableState.destroyed) {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
}; // This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.


Transform.prototype._transform = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_transform()'));
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;

  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
}; // Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.


Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && !ts.transforming) {
    ts.transforming = true;

    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);
  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data); // TODO(BridgeAR): Write a test for these two error cases
  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided

  if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
  if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
  return stream.push(null);
}
},{"../errors":47,"./_stream_duplex":48,"inherits":36}],52:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.
'use strict';

module.exports = Writable;
/* <replacement> */

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
} // It seems a linked list but it is not
// there will be only 2 of these for each stream


function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;

  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/


var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;
/*<replacement>*/

var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/

var Stream = require('./internal/streams/stream');
/*</replacement>*/


var Buffer = require('buffer').Buffer;

var OurUint8Array = global.Uint8Array || function () {};

function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}

function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

var destroyImpl = require('./internal/streams/destroy');

var _require = require('./internal/streams/state'),
    getHighWaterMark = _require.getHighWaterMark;

var _require$codes = require('../errors').codes,
    ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
    ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE,
    ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED,
    ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES,
    ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END,
    ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;

var errorOrDestroy = destroyImpl.errorOrDestroy;

require('inherits')(Writable, Stream);

function nop() {}

function WritableState(options, stream, isDuplex) {
  Duplex = Duplex || require('./_stream_duplex');
  options = options || {}; // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream,
  // e.g. options.readableObjectMode vs. options.writableObjectMode, etc.

  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex; // object stream flag to indicate whether or not this stream
  // contains buffers or objects.

  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode; // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()

  this.highWaterMark = getHighWaterMark(this, options, 'writableHighWaterMark', isDuplex); // if _final has been called

  this.finalCalled = false; // drain event flag.

  this.needDrain = false; // at the start of calling end()

  this.ending = false; // when end() has been called, and returned

  this.ended = false; // when 'finish' is emitted

  this.finished = false; // has it been destroyed

  this.destroyed = false; // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.

  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode; // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.

  this.defaultEncoding = options.defaultEncoding || 'utf8'; // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.

  this.length = 0; // a flag to see when we're in the middle of a write.

  this.writing = false; // when true all writes will be buffered until .uncork() call

  this.corked = 0; // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.

  this.sync = true; // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.

  this.bufferProcessing = false; // the callback that's passed to _write(chunk,cb)

  this.onwrite = function (er) {
    onwrite(stream, er);
  }; // the callback that the user supplies to write(chunk,encoding,cb)


  this.writecb = null; // the amount that is being written when _write is called.

  this.writelen = 0;
  this.bufferedRequest = null;
  this.lastBufferedRequest = null; // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted

  this.pendingcb = 0; // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams

  this.prefinished = false; // True if the error was already emitted and should not be thrown again

  this.errorEmitted = false; // Should close be emitted on destroy. Defaults to true.

  this.emitClose = options.emitClose !== false; // Should .destroy() be called after 'finish' (and potentially 'end')

  this.autoDestroy = !!options.autoDestroy; // count buffered requests

  this.bufferedRequestCount = 0; // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two

  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];

  while (current) {
    out.push(current);
    current = current.next;
  }

  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function writableStateBufferGetter() {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})(); // Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.


var realHasInstance;

if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function value(object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;
      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function realHasInstance(object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex'); // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.
  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  // Checking for a Stream.Duplex instance is faster here instead of inside
  // the WritableState constructor, at least with V8 6.5

  var isDuplex = this instanceof Duplex;
  if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
  this._writableState = new WritableState(options, this, isDuplex); // legacy.

  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;
    if (typeof options.writev === 'function') this._writev = options.writev;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
} // Otherwise people can pipe Writable streams, which is just wrong.


Writable.prototype.pipe = function () {
  errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
};

function writeAfterEnd(stream, cb) {
  var er = new ERR_STREAM_WRITE_AFTER_END(); // TODO: defer error events consistently everywhere, not just the cb

  errorOrDestroy(stream, er);
  process.nextTick(cb, er);
} // Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.


function validChunk(stream, state, chunk, cb) {
  var er;

  if (chunk === null) {
    er = new ERR_STREAM_NULL_VALUES();
  } else if (typeof chunk !== 'string' && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer'], chunk);
  }

  if (er) {
    errorOrDestroy(stream, er);
    process.nextTick(cb, er);
    return false;
  }

  return true;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;
  if (typeof cb !== 'function') cb = nop;
  if (state.ending) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }
  return ret;
};

Writable.prototype.cork = function () {
  this._writableState.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;
    if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

Object.defineProperty(Writable.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }

  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
}); // if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.

function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);

    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }

  var len = state.objectMode ? 1 : chunk.length;
  state.length += len;
  var ret = state.length < state.highWaterMark; // we must ensure that previous needDrain will not be reset to false.

  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };

    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }

    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));else if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    process.nextTick(cb, er); // this can emit finish, and it will always happen
    // after error

    process.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er); // this can emit finish, but finish must
    // always follow error

    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;
  if (typeof cb !== 'function') throw new ERR_MULTIPLE_CALLBACK();
  onwriteStateUpdate(state);
  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state) || stream.destroyed;

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      process.nextTick(afterWrite, stream, state, finished, cb);
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
} // Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.


function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
} // if there's something in the buffer waiting, then process it


function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;
    var count = 0;
    var allBuffers = true;

    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }

    buffer.allBuffers = allBuffers;
    doWrite(stream, state, true, state.length, buffer, '', holder.finish); // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite

    state.pendingcb++;
    state.lastBufferedRequest = null;

    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }

    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;
      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--; // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.

      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_write()'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding); // .end() fully uncorks

  if (state.corked) {
    state.corked = 1;
    this.uncork();
  } // ignore unnecessary end() calls.


  if (!state.ending) endWritable(this, state, cb);
  return this;
};

Object.defineProperty(Writable.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
});

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;

    if (err) {
      errorOrDestroy(stream, err);
    }

    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}

function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function' && !state.destroyed) {
      state.pendingcb++;
      state.finalCalled = true;
      process.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);

  if (need) {
    prefinish(stream, state);

    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');

      if (state.autoDestroy) {
        // In case of duplex streams we need a way to detect
        // if the readable side is ready for autoDestroy as well
        var rState = stream._readableState;

        if (!rState || rState.autoDestroy && rState.endEmitted) {
          stream.destroy();
        }
      }
    }
  }

  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);

  if (cb) {
    if (state.finished) process.nextTick(cb);else stream.once('finish', cb);
  }

  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;

  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  } // reuse the free corkReq.


  state.corkedRequestsFree.next = corkReq;
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._writableState === undefined) {
      return false;
    }

    return this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._writableState.destroyed = value;
  }
});
Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;

Writable.prototype._destroy = function (err, cb) {
  cb(err);
};
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../errors":47,"./_stream_duplex":48,"./internal/streams/destroy":55,"./internal/streams/state":59,"./internal/streams/stream":60,"_process":38,"buffer":28,"inherits":36,"util-deprecate":65}],53:[function(require,module,exports){
(function (process){
'use strict';

var _Object$setPrototypeO;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var finished = require('./end-of-stream');

var kLastResolve = Symbol('lastResolve');
var kLastReject = Symbol('lastReject');
var kError = Symbol('error');
var kEnded = Symbol('ended');
var kLastPromise = Symbol('lastPromise');
var kHandlePromise = Symbol('handlePromise');
var kStream = Symbol('stream');

function createIterResult(value, done) {
  return {
    value: value,
    done: done
  };
}

function readAndResolve(iter) {
  var resolve = iter[kLastResolve];

  if (resolve !== null) {
    var data = iter[kStream].read(); // we defer if data is null
    // we can be expecting either 'end' or
    // 'error'

    if (data !== null) {
      iter[kLastPromise] = null;
      iter[kLastResolve] = null;
      iter[kLastReject] = null;
      resolve(createIterResult(data, false));
    }
  }
}

function onReadable(iter) {
  // we wait for the next tick, because it might
  // emit an error with process.nextTick
  process.nextTick(readAndResolve, iter);
}

function wrapForNext(lastPromise, iter) {
  return function (resolve, reject) {
    lastPromise.then(function () {
      if (iter[kEnded]) {
        resolve(createIterResult(undefined, true));
        return;
      }

      iter[kHandlePromise](resolve, reject);
    }, reject);
  };
}

var AsyncIteratorPrototype = Object.getPrototypeOf(function () {});
var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
  get stream() {
    return this[kStream];
  },

  next: function next() {
    var _this = this;

    // if we have detected an error in the meanwhile
    // reject straight away
    var error = this[kError];

    if (error !== null) {
      return Promise.reject(error);
    }

    if (this[kEnded]) {
      return Promise.resolve(createIterResult(undefined, true));
    }

    if (this[kStream].destroyed) {
      // We need to defer via nextTick because if .destroy(err) is
      // called, the error will be emitted via nextTick, and
      // we cannot guarantee that there is no error lingering around
      // waiting to be emitted.
      return new Promise(function (resolve, reject) {
        process.nextTick(function () {
          if (_this[kError]) {
            reject(_this[kError]);
          } else {
            resolve(createIterResult(undefined, true));
          }
        });
      });
    } // if we have multiple next() calls
    // we will wait for the previous Promise to finish
    // this logic is optimized to support for await loops,
    // where next() is only called once at a time


    var lastPromise = this[kLastPromise];
    var promise;

    if (lastPromise) {
      promise = new Promise(wrapForNext(lastPromise, this));
    } else {
      // fast path needed to support multiple this.push()
      // without triggering the next() queue
      var data = this[kStream].read();

      if (data !== null) {
        return Promise.resolve(createIterResult(data, false));
      }

      promise = new Promise(this[kHandlePromise]);
    }

    this[kLastPromise] = promise;
    return promise;
  }
}, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function () {
  return this;
}), _defineProperty(_Object$setPrototypeO, "return", function _return() {
  var _this2 = this;

  // destroy(err, cb) is a private API
  // we can guarantee we have that here, because we control the
  // Readable class this is attached to
  return new Promise(function (resolve, reject) {
    _this2[kStream].destroy(null, function (err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(createIterResult(undefined, true));
    });
  });
}), _Object$setPrototypeO), AsyncIteratorPrototype);

var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator(stream) {
  var _Object$create;

  var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
    value: stream,
    writable: true
  }), _defineProperty(_Object$create, kLastResolve, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kLastReject, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kError, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kEnded, {
    value: stream._readableState.endEmitted,
    writable: true
  }), _defineProperty(_Object$create, kHandlePromise, {
    value: function value(resolve, reject) {
      var data = iterator[kStream].read();

      if (data) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        resolve(createIterResult(data, false));
      } else {
        iterator[kLastResolve] = resolve;
        iterator[kLastReject] = reject;
      }
    },
    writable: true
  }), _Object$create));
  iterator[kLastPromise] = null;
  finished(stream, function (err) {
    if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
      var reject = iterator[kLastReject]; // reject if we are waiting for data in the Promise
      // returned by next() and store the error

      if (reject !== null) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        reject(err);
      }

      iterator[kError] = err;
      return;
    }

    var resolve = iterator[kLastResolve];

    if (resolve !== null) {
      iterator[kLastPromise] = null;
      iterator[kLastResolve] = null;
      iterator[kLastReject] = null;
      resolve(createIterResult(undefined, true));
    }

    iterator[kEnded] = true;
  });
  stream.on('readable', onReadable.bind(null, iterator));
  return iterator;
};

module.exports = createReadableStreamAsyncIterator;
}).call(this,require('_process'))
},{"./end-of-stream":56,"_process":38}],54:[function(require,module,exports){
'use strict';

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require('buffer'),
    Buffer = _require.Buffer;

var _require2 = require('util'),
    inspect = _require2.inspect;

var custom = inspect && inspect.custom || 'inspect';

function copyBuffer(src, target, offset) {
  Buffer.prototype.copy.call(src, target, offset);
}

module.exports =
/*#__PURE__*/
function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  _createClass(BufferList, [{
    key: "push",
    value: function push(v) {
      var entry = {
        data: v,
        next: null
      };
      if (this.length > 0) this.tail.next = entry;else this.head = entry;
      this.tail = entry;
      ++this.length;
    }
  }, {
    key: "unshift",
    value: function unshift(v) {
      var entry = {
        data: v,
        next: this.head
      };
      if (this.length === 0) this.tail = entry;
      this.head = entry;
      ++this.length;
    }
  }, {
    key: "shift",
    value: function shift() {
      if (this.length === 0) return;
      var ret = this.head.data;
      if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
      --this.length;
      return ret;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.head = this.tail = null;
      this.length = 0;
    }
  }, {
    key: "join",
    value: function join(s) {
      if (this.length === 0) return '';
      var p = this.head;
      var ret = '' + p.data;

      while (p = p.next) {
        ret += s + p.data;
      }

      return ret;
    }
  }, {
    key: "concat",
    value: function concat(n) {
      if (this.length === 0) return Buffer.alloc(0);
      var ret = Buffer.allocUnsafe(n >>> 0);
      var p = this.head;
      var i = 0;

      while (p) {
        copyBuffer(p.data, ret, i);
        i += p.data.length;
        p = p.next;
      }

      return ret;
    } // Consumes a specified amount of bytes or characters from the buffered data.

  }, {
    key: "consume",
    value: function consume(n, hasStrings) {
      var ret;

      if (n < this.head.data.length) {
        // `slice` is the same for buffers and strings.
        ret = this.head.data.slice(0, n);
        this.head.data = this.head.data.slice(n);
      } else if (n === this.head.data.length) {
        // First chunk is a perfect match.
        ret = this.shift();
      } else {
        // Result spans more than one buffer.
        ret = hasStrings ? this._getString(n) : this._getBuffer(n);
      }

      return ret;
    }
  }, {
    key: "first",
    value: function first() {
      return this.head.data;
    } // Consumes a specified amount of characters from the buffered data.

  }, {
    key: "_getString",
    value: function _getString(n) {
      var p = this.head;
      var c = 1;
      var ret = p.data;
      n -= ret.length;

      while (p = p.next) {
        var str = p.data;
        var nb = n > str.length ? str.length : n;
        if (nb === str.length) ret += str;else ret += str.slice(0, n);
        n -= nb;

        if (n === 0) {
          if (nb === str.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = str.slice(nb);
          }

          break;
        }

        ++c;
      }

      this.length -= c;
      return ret;
    } // Consumes a specified amount of bytes from the buffered data.

  }, {
    key: "_getBuffer",
    value: function _getBuffer(n) {
      var ret = Buffer.allocUnsafe(n);
      var p = this.head;
      var c = 1;
      p.data.copy(ret);
      n -= p.data.length;

      while (p = p.next) {
        var buf = p.data;
        var nb = n > buf.length ? buf.length : n;
        buf.copy(ret, ret.length - n, 0, nb);
        n -= nb;

        if (n === 0) {
          if (nb === buf.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = buf.slice(nb);
          }

          break;
        }

        ++c;
      }

      this.length -= c;
      return ret;
    } // Make sure the linked list only shows the minimal necessary information.

  }, {
    key: custom,
    value: function value(_, options) {
      return inspect(this, _objectSpread({}, options, {
        // Only inspect one level.
        depth: 0,
        // It should not recurse.
        customInspect: false
      }));
    }
  }]);

  return BufferList;
}();
},{"buffer":28,"util":25}],55:[function(require,module,exports){
(function (process){
'use strict'; // undocumented cb() API, needed for core, not for public API

function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err) {
      if (!this._writableState) {
        process.nextTick(emitErrorNT, this, err);
      } else if (!this._writableState.errorEmitted) {
        this._writableState.errorEmitted = true;
        process.nextTick(emitErrorNT, this, err);
      }
    }

    return this;
  } // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks


  if (this._readableState) {
    this._readableState.destroyed = true;
  } // if this is a duplex stream mark the writable part as destroyed as well


  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      if (!_this._writableState) {
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else if (!_this._writableState.errorEmitted) {
        _this._writableState.errorEmitted = true;
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else {
        process.nextTick(emitCloseNT, _this);
      }
    } else if (cb) {
      process.nextTick(emitCloseNT, _this);
      cb(err);
    } else {
      process.nextTick(emitCloseNT, _this);
    }
  });

  return this;
}

function emitErrorAndCloseNT(self, err) {
  emitErrorNT(self, err);
  emitCloseNT(self);
}

function emitCloseNT(self) {
  if (self._writableState && !self._writableState.emitClose) return;
  if (self._readableState && !self._readableState.emitClose) return;
  self.emit('close');
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finalCalled = false;
    this._writableState.prefinished = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

function errorOrDestroy(stream, err) {
  // We have tests that rely on errors being emitted
  // in the same tick, so changing this is semver major.
  // For now when you opt-in to autoDestroy we allow
  // the error to be emitted nextTick. In a future
  // semver major update we should change the default to this.
  var rState = stream._readableState;
  var wState = stream._writableState;
  if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);else stream.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy,
  errorOrDestroy: errorOrDestroy
};
}).call(this,require('_process'))
},{"_process":38}],56:[function(require,module,exports){
// Ported from https://github.com/mafintosh/end-of-stream with
// permission from the author, Mathias Buus (@mafintosh).
'use strict';

var ERR_STREAM_PREMATURE_CLOSE = require('../../../errors').codes.ERR_STREAM_PREMATURE_CLOSE;

function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    callback.apply(this, args);
  };
}

function noop() {}

function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}

function eos(stream, opts, callback) {
  if (typeof opts === 'function') return eos(stream, null, opts);
  if (!opts) opts = {};
  callback = once(callback || noop);
  var readable = opts.readable || opts.readable !== false && stream.readable;
  var writable = opts.writable || opts.writable !== false && stream.writable;

  var onlegacyfinish = function onlegacyfinish() {
    if (!stream.writable) onfinish();
  };

  var writableEnded = stream._writableState && stream._writableState.finished;

  var onfinish = function onfinish() {
    writable = false;
    writableEnded = true;
    if (!readable) callback.call(stream);
  };

  var readableEnded = stream._readableState && stream._readableState.endEmitted;

  var onend = function onend() {
    readable = false;
    readableEnded = true;
    if (!writable) callback.call(stream);
  };

  var onerror = function onerror(err) {
    callback.call(stream, err);
  };

  var onclose = function onclose() {
    var err;

    if (readable && !readableEnded) {
      if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }

    if (writable && !writableEnded) {
      if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }
  };

  var onrequest = function onrequest() {
    stream.req.on('finish', onfinish);
  };

  if (isRequest(stream)) {
    stream.on('complete', onfinish);
    stream.on('abort', onclose);
    if (stream.req) onrequest();else stream.on('request', onrequest);
  } else if (writable && !stream._writableState) {
    // legacy streams
    stream.on('end', onlegacyfinish);
    stream.on('close', onlegacyfinish);
  }

  stream.on('end', onend);
  stream.on('finish', onfinish);
  if (opts.error !== false) stream.on('error', onerror);
  stream.on('close', onclose);
  return function () {
    stream.removeListener('complete', onfinish);
    stream.removeListener('abort', onclose);
    stream.removeListener('request', onrequest);
    if (stream.req) stream.req.removeListener('finish', onfinish);
    stream.removeListener('end', onlegacyfinish);
    stream.removeListener('close', onlegacyfinish);
    stream.removeListener('finish', onfinish);
    stream.removeListener('end', onend);
    stream.removeListener('error', onerror);
    stream.removeListener('close', onclose);
  };
}

module.exports = eos;
},{"../../../errors":47}],57:[function(require,module,exports){
module.exports = function () {
  throw new Error('Readable.from is not available in the browser')
};

},{}],58:[function(require,module,exports){
// Ported from https://github.com/mafintosh/pump with
// permission from the author, Mathias Buus (@mafintosh).
'use strict';

var eos;

function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    callback.apply(void 0, arguments);
  };
}

var _require$codes = require('../../../errors').codes,
    ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS,
    ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;

function noop(err) {
  // Rethrow the error if it exists to avoid swallowing it
  if (err) throw err;
}

function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}

function destroyer(stream, reading, writing, callback) {
  callback = once(callback);
  var closed = false;
  stream.on('close', function () {
    closed = true;
  });
  if (eos === undefined) eos = require('./end-of-stream');
  eos(stream, {
    readable: reading,
    writable: writing
  }, function (err) {
    if (err) return callback(err);
    closed = true;
    callback();
  });
  var destroyed = false;
  return function (err) {
    if (closed) return;
    if (destroyed) return;
    destroyed = true; // request.destroy just do .end - .abort is what we want

    if (isRequest(stream)) return stream.abort();
    if (typeof stream.destroy === 'function') return stream.destroy();
    callback(err || new ERR_STREAM_DESTROYED('pipe'));
  };
}

function call(fn) {
  fn();
}

function pipe(from, to) {
  return from.pipe(to);
}

function popCallback(streams) {
  if (!streams.length) return noop;
  if (typeof streams[streams.length - 1] !== 'function') return noop;
  return streams.pop();
}

function pipeline() {
  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }

  var callback = popCallback(streams);
  if (Array.isArray(streams[0])) streams = streams[0];

  if (streams.length < 2) {
    throw new ERR_MISSING_ARGS('streams');
  }

  var error;
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1;
    var writing = i > 0;
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err;
      if (err) destroys.forEach(call);
      if (reading) return;
      destroys.forEach(call);
      callback(error);
    });
  });
  return streams.reduce(pipe);
}

module.exports = pipeline;
},{"../../../errors":47,"./end-of-stream":56}],59:[function(require,module,exports){
'use strict';

var ERR_INVALID_OPT_VALUE = require('../../../errors').codes.ERR_INVALID_OPT_VALUE;

function highWaterMarkFrom(options, isDuplex, duplexKey) {
  return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
}

function getHighWaterMark(state, options, duplexKey, isDuplex) {
  var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);

  if (hwm != null) {
    if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
      var name = isDuplex ? duplexKey : 'highWaterMark';
      throw new ERR_INVALID_OPT_VALUE(name, hwm);
    }

    return Math.floor(hwm);
  } // Default value


  return state.objectMode ? 16 : 16 * 1024;
}

module.exports = {
  getHighWaterMark: getHighWaterMark
};
},{"../../../errors":47}],60:[function(require,module,exports){
module.exports = require('events').EventEmitter;

},{"events":34}],61:[function(require,module,exports){
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');
exports.finished = require('./lib/internal/streams/end-of-stream.js');
exports.pipeline = require('./lib/internal/streams/pipeline.js');

},{"./lib/_stream_duplex.js":48,"./lib/_stream_passthrough.js":49,"./lib/_stream_readable.js":50,"./lib/_stream_transform.js":51,"./lib/_stream_writable.js":52,"./lib/internal/streams/end-of-stream.js":56,"./lib/internal/streams/pipeline.js":58}],62:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":42}],63:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":64,"punycode":27,"querystring":41}],64:[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}],65:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],66:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],67:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],68:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":67,"_process":38,"inherits":66}],69:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function bytesToUuid(buf, offset) {
  const i = offset || 0;
  const bth = byteToHex; // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434

  return (bth[buf[i + 0]] + bth[buf[i + 1]] + bth[buf[i + 2]] + bth[buf[i + 3]] + '-' + bth[buf[i + 4]] + bth[buf[i + 5]] + '-' + bth[buf[i + 6]] + bth[buf[i + 7]] + '-' + bth[buf[i + 8]] + bth[buf[i + 9]] + '-' + bth[buf[i + 10]] + bth[buf[i + 11]] + bth[buf[i + 12]] + bth[buf[i + 13]] + bth[buf[i + 14]] + bth[buf[i + 15]]).toLowerCase();
}

var _default = bytesToUuid;
exports.default = _default;
},{}],70:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "v1", {
  enumerable: true,
  get: function () {
    return _v.default;
  }
});
Object.defineProperty(exports, "v3", {
  enumerable: true,
  get: function () {
    return _v2.default;
  }
});
Object.defineProperty(exports, "v4", {
  enumerable: true,
  get: function () {
    return _v3.default;
  }
});
Object.defineProperty(exports, "v5", {
  enumerable: true,
  get: function () {
    return _v4.default;
  }
});

var _v = _interopRequireDefault(require("./v1.js"));

var _v2 = _interopRequireDefault(require("./v3.js"));

var _v3 = _interopRequireDefault(require("./v4.js"));

var _v4 = _interopRequireDefault(require("./v5.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./v1.js":74,"./v3.js":75,"./v4.js":77,"./v5.js":78}],71:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
 * Browser-compatible JavaScript MD5
 *
 * Modification of JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */
function md5(bytes) {
  if (typeof bytes === 'string') {
    const msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

    bytes = new Uint8Array(msg.length);

    for (let i = 0; i < msg.length; ++i) {
      bytes[i] = msg.charCodeAt(i);
    }
  }

  return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
}
/*
 * Convert an array of little-endian words to an array of bytes
 */


function md5ToHexEncodedArray(input) {
  const output = [];
  const length32 = input.length * 32;
  const hexTab = '0123456789abcdef';

  for (let i = 0; i < length32; i += 8) {
    const x = input[i >> 5] >>> i % 32 & 0xff;
    const hex = parseInt(hexTab.charAt(x >>> 4 & 0x0f) + hexTab.charAt(x & 0x0f), 16);
    output.push(hex);
  }

  return output;
}
/**
 * Calculate output length with padding and bit length
 */


function getOutputLength(inputLength8) {
  return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
}
/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */


function wordsToMd5(x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << len % 32;
  x[getOutputLength(len) - 1] = len;
  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < x.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;
    a = md5ff(a, b, c, d, x[i], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, x[i], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  return [a, b, c, d];
}
/*
 * Convert an array bytes to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */


function bytesToWords(input) {
  if (input.length === 0) {
    return [];
  }

  const length8 = input.length * 8;
  const output = new Uint32Array(getOutputLength(length8));

  for (let i = 0; i < length8; i += 8) {
    output[i >> 5] |= (input[i / 8] & 0xff) << i % 32;
  }

  return output;
}
/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */


function safeAdd(x, y) {
  const lsw = (x & 0xffff) + (y & 0xffff);
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 0xffff;
}
/*
 * Bitwise rotate a 32-bit number to the left.
 */


function bitRotateLeft(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}
/*
 * These functions implement the four basic operations the algorithm uses.
 */


function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}

function md5ff(a, b, c, d, x, s, t) {
  return md5cmn(b & c | ~b & d, a, b, x, s, t);
}

function md5gg(a, b, c, d, x, s, t) {
  return md5cmn(b & d | c & ~d, a, b, x, s, t);
}

function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}

function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}

var _default = md5;
exports.default = _default;
},{}],72:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rng;
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
// getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
// find the complete implementation of crypto (msCrypto) on IE11.
const getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);
const rnds8 = new Uint8Array(16);

function rng() {
  if (!getRandomValues) {
    throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
  }

  return getRandomValues(rnds8);
}
},{}],73:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// Adapted from Chris Veness' SHA1 code at
// http://www.movable-type.co.uk/scripts/sha1.html
function f(s, x, y, z) {
  switch (s) {
    case 0:
      return x & y ^ ~x & z;

    case 1:
      return x ^ y ^ z;

    case 2:
      return x & y ^ x & z ^ y & z;

    case 3:
      return x ^ y ^ z;
  }
}

function ROTL(x, n) {
  return x << n | x >>> 32 - n;
}

function sha1(bytes) {
  const K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
  const H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];

  if (typeof bytes === 'string') {
    const msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

    bytes = [];

    for (let i = 0; i < msg.length; ++i) {
      bytes.push(msg.charCodeAt(i));
    }
  }

  bytes.push(0x80);
  const l = bytes.length / 4 + 2;
  const N = Math.ceil(l / 16);
  const M = new Array(N);

  for (let i = 0; i < N; ++i) {
    const arr = new Uint32Array(16);

    for (let j = 0; j < 16; ++j) {
      arr[j] = bytes[i * 64 + j * 4] << 24 | bytes[i * 64 + j * 4 + 1] << 16 | bytes[i * 64 + j * 4 + 2] << 8 | bytes[i * 64 + j * 4 + 3];
    }

    M[i] = arr;
  }

  M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
  M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = (bytes.length - 1) * 8 & 0xffffffff;

  for (let i = 0; i < N; ++i) {
    const W = new Uint32Array(80);

    for (let t = 0; t < 16; ++t) {
      W[t] = M[i][t];
    }

    for (let t = 16; t < 80; ++t) {
      W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
    }

    let a = H[0];
    let b = H[1];
    let c = H[2];
    let d = H[3];
    let e = H[4];

    for (let t = 0; t < 80; ++t) {
      const s = Math.floor(t / 20);
      const T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[t] >>> 0;
      e = d;
      d = c;
      c = ROTL(b, 30) >>> 0;
      b = a;
      a = T;
    }

    H[0] = H[0] + a >>> 0;
    H[1] = H[1] + b >>> 0;
    H[2] = H[2] + c >>> 0;
    H[3] = H[3] + d >>> 0;
    H[4] = H[4] + e >>> 0;
  }

  return [H[0] >> 24 & 0xff, H[0] >> 16 & 0xff, H[0] >> 8 & 0xff, H[0] & 0xff, H[1] >> 24 & 0xff, H[1] >> 16 & 0xff, H[1] >> 8 & 0xff, H[1] & 0xff, H[2] >> 24 & 0xff, H[2] >> 16 & 0xff, H[2] >> 8 & 0xff, H[2] & 0xff, H[3] >> 24 & 0xff, H[3] >> 16 & 0xff, H[3] >> 8 & 0xff, H[3] & 0xff, H[4] >> 24 & 0xff, H[4] >> 16 & 0xff, H[4] >> 8 & 0xff, H[4] & 0xff];
}

var _default = sha1;
exports.default = _default;
},{}],74:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rng = _interopRequireDefault(require("./rng.js"));

var _bytesToUuid = _interopRequireDefault(require("./bytesToUuid.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html
let _nodeId;

let _clockseq; // Previous uuid creation time


let _lastMSecs = 0;
let _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || [];
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189

  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || _rng.default)();

    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }

    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


  let msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock

  let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval


  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  } // Per 4.2.1.2 Throw error if too many uuids are requested


  if (nsecs >= 10000) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

  msecs += 12219292800000; // `time_low`

  const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff; // `time_mid`

  const tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff; // `time_high_and_version`

  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

  b[i++] = clockseq & 0xff; // `node`

  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf || (0, _bytesToUuid.default)(b);
}

var _default = v1;
exports.default = _default;
},{"./bytesToUuid.js":69,"./rng.js":72}],75:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _v = _interopRequireDefault(require("./v35.js"));

var _md = _interopRequireDefault(require("./md5.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v3 = (0, _v.default)('v3', 0x30, _md.default);
var _default = v3;
exports.default = _default;
},{"./md5.js":71,"./v35.js":76}],76:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
exports.URL = exports.DNS = void 0;

var _bytesToUuid = _interopRequireDefault(require("./bytesToUuid.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function uuidToBytes(uuid) {
  // Note: We assume we're being passed a valid uuid string
  const bytes = [];
  uuid.replace(/[a-fA-F0-9]{2}/g, function (hex) {
    bytes.push(parseInt(hex, 16));
  });
  return bytes;
}

function stringToBytes(str) {
  str = unescape(encodeURIComponent(str)); // UTF8 escape

  const bytes = [];

  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }

  return bytes;
}

const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
exports.DNS = DNS;
const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
exports.URL = URL;

function _default(name, version, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    const off = buf && offset || 0;
    if (typeof value === 'string') value = stringToBytes(value);
    if (typeof namespace === 'string') namespace = uuidToBytes(namespace);

    if (!Array.isArray(value)) {
      throw TypeError('value must be an array of bytes');
    }

    if (!Array.isArray(namespace) || namespace.length !== 16) {
      throw TypeError('namespace must be uuid string or an Array of 16 byte values');
    } // Per 4.3


    const bytes = hashfunc(namespace.concat(value));
    bytes[6] = bytes[6] & 0x0f | version;
    bytes[8] = bytes[8] & 0x3f | 0x80;

    if (buf) {
      for (let idx = 0; idx < 16; ++idx) {
        buf[off + idx] = bytes[idx];
      }
    }

    return buf || (0, _bytesToUuid.default)(bytes);
  } // Function#name is not settable on some platforms (#270)


  try {
    generateUUID.name = name; // eslint-disable-next-line no-empty
  } catch (err) {} // For CommonJS default export support


  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
}
},{"./bytesToUuid.js":69}],77:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rng = _interopRequireDefault(require("./rng.js"));

var _bytesToUuid = _interopRequireDefault(require("./bytesToUuid.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function v4(options, buf, offset) {
  if (typeof options === 'string') {
    buf = options === 'binary' ? new Uint8Array(16) : null;
    options = null;
  }

  options = options || {};

  const rnds = options.random || (options.rng || _rng.default)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`


  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    const start = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[start + i] = rnds[i];
    }

    return buf;
  }

  return (0, _bytesToUuid.default)(rnds);
}

var _default = v4;
exports.default = _default;
},{"./bytesToUuid.js":69,"./rng.js":72}],78:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _v = _interopRequireDefault(require("./v35.js"));

var _sha = _interopRequireDefault(require("./sha1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v5 = (0, _v.default)('v5', 0x50, _sha.default);
var _default = v5;
exports.default = _default;
},{"./sha1.js":73,"./v35.js":76}],79:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],80:[function(require,module,exports){
module.exports = {
	h32: require("./xxhash")
,	h64: require("./xxhash64")
}

},{"./xxhash":81,"./xxhash64":82}],81:[function(require,module,exports){
(function (Buffer){
/**
xxHash implementation in pure Javascript

Copyright (C) 2013, Pierre Curto
MIT license
*/
var UINT32 = require('cuint').UINT32

/*
	Merged this sequence of method calls as it speeds up
	the calculations by a factor of 2
 */
// this.v1.add( other.multiply(PRIME32_2) ).rotl(13).multiply(PRIME32_1);
UINT32.prototype.xxh_update = function (low, high) {
	var b00 = PRIME32_2._low
	var b16 = PRIME32_2._high

	var c16, c00
	c00 = low * b00
	c16 = c00 >>> 16

	c16 += high * b00
	c16 &= 0xFFFF		// Not required but improves performance
	c16 += low * b16

	var a00 = this._low + (c00 & 0xFFFF)
	var a16 = a00 >>> 16

	a16 += this._high + (c16 & 0xFFFF)

	var v = (a16 << 16) | (a00 & 0xFFFF)
	v = (v << 13) | (v >>> 19)

	a00 = v & 0xFFFF
	a16 = v >>> 16

	b00 = PRIME32_1._low
	b16 = PRIME32_1._high

	c00 = a00 * b00
	c16 = c00 >>> 16

	c16 += a16 * b00
	c16 &= 0xFFFF		// Not required but improves performance
	c16 += a00 * b16

	this._low = c00 & 0xFFFF
	this._high = c16 & 0xFFFF
}

/*
 * Constants
 */
var PRIME32_1 = UINT32( '2654435761' )
var PRIME32_2 = UINT32( '2246822519' )
var PRIME32_3 = UINT32( '3266489917' )
var PRIME32_4 = UINT32(  '668265263' )
var PRIME32_5 = UINT32(  '374761393' )

/**
* Convert string to proper UTF-8 array
* @param str Input string
* @returns {Uint8Array} UTF8 array is returned as uint8 array
*/
function toUTF8Array (str) {
	var utf8 = []
	for (var i=0, n=str.length; i < n; i++) {
		var charcode = str.charCodeAt(i)
		if (charcode < 0x80) utf8.push(charcode)
		else if (charcode < 0x800) {
			utf8.push(0xc0 | (charcode >> 6),
			0x80 | (charcode & 0x3f))
		}
		else if (charcode < 0xd800 || charcode >= 0xe000) {
			utf8.push(0xe0 | (charcode >> 12),
			0x80 | ((charcode>>6) & 0x3f),
			0x80 | (charcode & 0x3f))
		}
		// surrogate pair
		else {
			i++;
			// UTF-16 encodes 0x10000-0x10FFFF by
			// subtracting 0x10000 and splitting the
			// 20 bits of 0x0-0xFFFFF into two halves
			charcode = 0x10000 + (((charcode & 0x3ff)<<10)
			| (str.charCodeAt(i) & 0x3ff))
			utf8.push(0xf0 | (charcode >>18),
			0x80 | ((charcode>>12) & 0x3f),
			0x80 | ((charcode>>6) & 0x3f),
			0x80 | (charcode & 0x3f))
		}
	}

	return new Uint8Array(utf8)
}

/**
 * XXH object used as a constructor or a function
 * @constructor
 * or
 * @param {Object|String} input data
 * @param {Number|UINT32} seed
 * @return ThisExpression
 * or
 * @return {UINT32} xxHash
 */
function XXH () {
	if (arguments.length == 2)
		return new XXH( arguments[1] ).update( arguments[0] ).digest()

	if (!(this instanceof XXH))
		return new XXH( arguments[0] )

	init.call(this, arguments[0])
}

/**
 * Initialize the XXH instance with the given seed
 * @method init
 * @param {Number|Object} seed as a number or an unsigned 32 bits integer
 * @return ThisExpression
 */
 function init (seed) {
	this.seed = seed instanceof UINT32 ? seed.clone() : UINT32(seed)
	this.v1 = this.seed.clone().add(PRIME32_1).add(PRIME32_2)
	this.v2 = this.seed.clone().add(PRIME32_2)
	this.v3 = this.seed.clone()
	this.v4 = this.seed.clone().subtract(PRIME32_1)
	this.total_len = 0
	this.memsize = 0
	this.memory = null

	return this
}
XXH.prototype.init = init

/**
 * Add data to be computed for the XXH hash
 * @method update
 * @param {String|Buffer|ArrayBuffer} input as a string or nodejs Buffer or ArrayBuffer
 * @return ThisExpression
 */
XXH.prototype.update = function (input) {
	var isString = typeof input == 'string'
	var isArrayBuffer

	// Convert all strings to utf-8 first (issue #5)
	if (isString) {
		input = toUTF8Array(input)
		isString = false
		isArrayBuffer = true
	}

	if (typeof ArrayBuffer !== "undefined" && input instanceof ArrayBuffer)
	{
		isArrayBuffer = true
		input = new Uint8Array(input);
	}

	var p = 0
	var len = input.length
	var bEnd = p + len

	if (len == 0) return this

	this.total_len += len

	if (this.memsize == 0)
	{
		if (isString) {
			this.memory = ''
		} else if (isArrayBuffer) {
			this.memory = new Uint8Array(16)
		} else {
			this.memory = new Buffer(16)
		}
	}

	if (this.memsize + len < 16)   // fill in tmp buffer
	{
		// XXH_memcpy(this.memory + this.memsize, input, len)
		if (isString) {
			this.memory += input
		} else if (isArrayBuffer) {
			this.memory.set( input.subarray(0, len), this.memsize )
		} else {
			input.copy( this.memory, this.memsize, 0, len )
		}

		this.memsize += len
		return this
	}

	if (this.memsize > 0)   // some data left from previous update
	{
		// XXH_memcpy(this.memory + this.memsize, input, 16-this.memsize);
		if (isString) {
			this.memory += input.slice(0, 16 - this.memsize)
		} else if (isArrayBuffer) {
			this.memory.set( input.subarray(0, 16 - this.memsize), this.memsize )
		} else {
			input.copy( this.memory, this.memsize, 0, 16 - this.memsize )
		}

		var p32 = 0
		if (isString) {
			this.v1.xxh_update(
				(this.memory.charCodeAt(p32+1) << 8) | this.memory.charCodeAt(p32)
			,	(this.memory.charCodeAt(p32+3) << 8) | this.memory.charCodeAt(p32+2)
			)
			p32 += 4
			this.v2.xxh_update(
				(this.memory.charCodeAt(p32+1) << 8) | this.memory.charCodeAt(p32)
			,	(this.memory.charCodeAt(p32+3) << 8) | this.memory.charCodeAt(p32+2)
			)
			p32 += 4
			this.v3.xxh_update(
				(this.memory.charCodeAt(p32+1) << 8) | this.memory.charCodeAt(p32)
			,	(this.memory.charCodeAt(p32+3) << 8) | this.memory.charCodeAt(p32+2)
			)
			p32 += 4
			this.v4.xxh_update(
				(this.memory.charCodeAt(p32+1) << 8) | this.memory.charCodeAt(p32)
			,	(this.memory.charCodeAt(p32+3) << 8) | this.memory.charCodeAt(p32+2)
			)
		} else {
			this.v1.xxh_update(
				(this.memory[p32+1] << 8) | this.memory[p32]
			,	(this.memory[p32+3] << 8) | this.memory[p32+2]
			)
			p32 += 4
			this.v2.xxh_update(
				(this.memory[p32+1] << 8) | this.memory[p32]
			,	(this.memory[p32+3] << 8) | this.memory[p32+2]
			)
			p32 += 4
			this.v3.xxh_update(
				(this.memory[p32+1] << 8) | this.memory[p32]
			,	(this.memory[p32+3] << 8) | this.memory[p32+2]
			)
			p32 += 4
			this.v4.xxh_update(
				(this.memory[p32+1] << 8) | this.memory[p32]
			,	(this.memory[p32+3] << 8) | this.memory[p32+2]
			)
		}

		p += 16 - this.memsize
		this.memsize = 0
		if (isString) this.memory = ''
	}

	if (p <= bEnd - 16)
	{
		var limit = bEnd - 16

		do
		{
			if (isString) {
				this.v1.xxh_update(
					(input.charCodeAt(p+1) << 8) | input.charCodeAt(p)
				,	(input.charCodeAt(p+3) << 8) | input.charCodeAt(p+2)
				)
				p += 4
				this.v2.xxh_update(
					(input.charCodeAt(p+1) << 8) | input.charCodeAt(p)
				,	(input.charCodeAt(p+3) << 8) | input.charCodeAt(p+2)
				)
				p += 4
				this.v3.xxh_update(
					(input.charCodeAt(p+1) << 8) | input.charCodeAt(p)
				,	(input.charCodeAt(p+3) << 8) | input.charCodeAt(p+2)
				)
				p += 4
				this.v4.xxh_update(
					(input.charCodeAt(p+1) << 8) | input.charCodeAt(p)
				,	(input.charCodeAt(p+3) << 8) | input.charCodeAt(p+2)
				)
			} else {
				this.v1.xxh_update(
					(input[p+1] << 8) | input[p]
				,	(input[p+3] << 8) | input[p+2]
				)
				p += 4
				this.v2.xxh_update(
					(input[p+1] << 8) | input[p]
				,	(input[p+3] << 8) | input[p+2]
				)
				p += 4
				this.v3.xxh_update(
					(input[p+1] << 8) | input[p]
				,	(input[p+3] << 8) | input[p+2]
				)
				p += 4
				this.v4.xxh_update(
					(input[p+1] << 8) | input[p]
				,	(input[p+3] << 8) | input[p+2]
				)
			}
			p += 4
		} while (p <= limit)
	}

	if (p < bEnd)
	{
		// XXH_memcpy(this.memory, p, bEnd-p);
		if (isString) {
			this.memory += input.slice(p)
		} else if (isArrayBuffer) {
			this.memory.set( input.subarray(p, bEnd), this.memsize )
		} else {
			input.copy( this.memory, this.memsize, p, bEnd )
		}

		this.memsize = bEnd - p
	}

	return this
}

/**
 * Finalize the XXH computation. The XXH instance is ready for reuse for the given seed
 * @method digest
 * @return {UINT32} xxHash
 */
XXH.prototype.digest = function () {
	var input = this.memory
	var isString = typeof input == 'string'
	var p = 0
	var bEnd = this.memsize
	var h32, h
	var u = new UINT32

	if (this.total_len >= 16)
	{
		h32 = this.v1.rotl(1).add( this.v2.rotl(7).add( this.v3.rotl(12).add( this.v4.rotl(18) ) ) )
	}
	else
	{
		h32  = this.seed.clone().add( PRIME32_5 )
	}

	h32.add( u.fromNumber(this.total_len) )

	while (p <= bEnd - 4)
	{
		if (isString) {
			u.fromBits(
				(input.charCodeAt(p+1) << 8) | input.charCodeAt(p)
			,	(input.charCodeAt(p+3) << 8) | input.charCodeAt(p+2)
			)
		} else {
			u.fromBits(
				(input[p+1] << 8) | input[p]
			,	(input[p+3] << 8) | input[p+2]
			)
		}
		h32
			.add( u.multiply(PRIME32_3) )
			.rotl(17)
			.multiply( PRIME32_4 )
		p += 4
	}

	while (p < bEnd)
	{
		u.fromBits( isString ? input.charCodeAt(p++) : input[p++], 0 )
		h32
			.add( u.multiply(PRIME32_5) )
			.rotl(11)
			.multiply(PRIME32_1)
	}

	h = h32.clone().shiftRight(15)
	h32.xor(h).multiply(PRIME32_2)

	h = h32.clone().shiftRight(13)
	h32.xor(h).multiply(PRIME32_3)

	h = h32.clone().shiftRight(16)
	h32.xor(h)

	// Reset the state
	this.init( this.seed )

	return h32
}

module.exports = XXH

}).call(this,require("buffer").Buffer)
},{"buffer":28,"cuint":31}],82:[function(require,module,exports){
(function (Buffer){
/**
xxHash64 implementation in pure Javascript

Copyright (C) 2016, Pierre Curto
MIT license
*/
var UINT64 = require('cuint').UINT64

/*
 * Constants
 */
var PRIME64_1 = UINT64( '11400714785074694791' )
var PRIME64_2 = UINT64( '14029467366897019727' )
var PRIME64_3 = UINT64(  '1609587929392839161' )
var PRIME64_4 = UINT64(  '9650029242287828579' )
var PRIME64_5 = UINT64(  '2870177450012600261' )

/**
* Convert string to proper UTF-8 array
* @param str Input string
* @returns {Uint8Array} UTF8 array is returned as uint8 array
*/
function toUTF8Array (str) {
	var utf8 = []
	for (var i=0, n=str.length; i < n; i++) {
		var charcode = str.charCodeAt(i)
		if (charcode < 0x80) utf8.push(charcode)
		else if (charcode < 0x800) {
			utf8.push(0xc0 | (charcode >> 6),
			0x80 | (charcode & 0x3f))
		}
		else if (charcode < 0xd800 || charcode >= 0xe000) {
			utf8.push(0xe0 | (charcode >> 12),
			0x80 | ((charcode>>6) & 0x3f),
			0x80 | (charcode & 0x3f))
		}
		// surrogate pair
		else {
			i++;
			// UTF-16 encodes 0x10000-0x10FFFF by
			// subtracting 0x10000 and splitting the
			// 20 bits of 0x0-0xFFFFF into two halves
			charcode = 0x10000 + (((charcode & 0x3ff)<<10)
			| (str.charCodeAt(i) & 0x3ff))
			utf8.push(0xf0 | (charcode >>18),
			0x80 | ((charcode>>12) & 0x3f),
			0x80 | ((charcode>>6) & 0x3f),
			0x80 | (charcode & 0x3f))
		}
	}

	return new Uint8Array(utf8)
}

/**
 * XXH64 object used as a constructor or a function
 * @constructor
 * or
 * @param {Object|String} input data
 * @param {Number|UINT64} seed
 * @return ThisExpression
 * or
 * @return {UINT64} xxHash
 */
function XXH64 () {
	if (arguments.length == 2)
		return new XXH64( arguments[1] ).update( arguments[0] ).digest()

	if (!(this instanceof XXH64))
		return new XXH64( arguments[0] )

	init.call(this, arguments[0])
}

/**
 * Initialize the XXH64 instance with the given seed
 * @method init
 * @param {Number|Object} seed as a number or an unsigned 32 bits integer
 * @return ThisExpression
 */
 function init (seed) {
	this.seed = seed instanceof UINT64 ? seed.clone() : UINT64(seed)
	this.v1 = this.seed.clone().add(PRIME64_1).add(PRIME64_2)
	this.v2 = this.seed.clone().add(PRIME64_2)
	this.v3 = this.seed.clone()
	this.v4 = this.seed.clone().subtract(PRIME64_1)
	this.total_len = 0
	this.memsize = 0
	this.memory = null

	return this
}
XXH64.prototype.init = init

/**
 * Add data to be computed for the XXH64 hash
 * @method update
 * @param {String|Buffer|ArrayBuffer} input as a string or nodejs Buffer or ArrayBuffer
 * @return ThisExpression
 */
XXH64.prototype.update = function (input) {
	var isString = typeof input == 'string'
	var isArrayBuffer

	// Convert all strings to utf-8 first (issue #5)
	if (isString) {
		input = toUTF8Array(input)
		isString = false
		isArrayBuffer = true
	}

	if (typeof ArrayBuffer !== "undefined" && input instanceof ArrayBuffer)
	{
		isArrayBuffer = true
		input = new Uint8Array(input);
	}

	var p = 0
	var len = input.length
	var bEnd = p + len

	if (len == 0) return this

	this.total_len += len

	if (this.memsize == 0)
	{
		if (isString) {
			this.memory = ''
		} else if (isArrayBuffer) {
			this.memory = new Uint8Array(32)
		} else {
			this.memory = new Buffer(32)
		}
	}

	if (this.memsize + len < 32)   // fill in tmp buffer
	{
		// XXH64_memcpy(this.memory + this.memsize, input, len)
		if (isString) {
			this.memory += input
		} else if (isArrayBuffer) {
			this.memory.set( input.subarray(0, len), this.memsize )
		} else {
			input.copy( this.memory, this.memsize, 0, len )
		}

		this.memsize += len
		return this
	}

	if (this.memsize > 0)   // some data left from previous update
	{
		// XXH64_memcpy(this.memory + this.memsize, input, 16-this.memsize);
		if (isString) {
			this.memory += input.slice(0, 32 - this.memsize)
		} else if (isArrayBuffer) {
			this.memory.set( input.subarray(0, 32 - this.memsize), this.memsize )
		} else {
			input.copy( this.memory, this.memsize, 0, 32 - this.memsize )
		}

		var p64 = 0
		if (isString) {
			var other
			other = UINT64(
					(this.memory.charCodeAt(p64+1) << 8) | this.memory.charCodeAt(p64)
				,	(this.memory.charCodeAt(p64+3) << 8) | this.memory.charCodeAt(p64+2)
				,	(this.memory.charCodeAt(p64+5) << 8) | this.memory.charCodeAt(p64+4)
				,	(this.memory.charCodeAt(p64+7) << 8) | this.memory.charCodeAt(p64+6)
				)
			this.v1.add( other.multiply(PRIME64_2) ).rotl(31).multiply(PRIME64_1);
			p64 += 8
			other = UINT64(
					(this.memory.charCodeAt(p64+1) << 8) | this.memory.charCodeAt(p64)
				,	(this.memory.charCodeAt(p64+3) << 8) | this.memory.charCodeAt(p64+2)
				,	(this.memory.charCodeAt(p64+5) << 8) | this.memory.charCodeAt(p64+4)
				,	(this.memory.charCodeAt(p64+7) << 8) | this.memory.charCodeAt(p64+6)
				)
			this.v2.add( other.multiply(PRIME64_2) ).rotl(31).multiply(PRIME64_1);
			p64 += 8
			other = UINT64(
					(this.memory.charCodeAt(p64+1) << 8) | this.memory.charCodeAt(p64)
				,	(this.memory.charCodeAt(p64+3) << 8) | this.memory.charCodeAt(p64+2)
				,	(this.memory.charCodeAt(p64+5) << 8) | this.memory.charCodeAt(p64+4)
				,	(this.memory.charCodeAt(p64+7) << 8) | this.memory.charCodeAt(p64+6)
				)
			this.v3.add( other.multiply(PRIME64_2) ).rotl(31).multiply(PRIME64_1);
			p64 += 8
			other = UINT64(
					(this.memory.charCodeAt(p64+1) << 8) | this.memory.charCodeAt(p64)
				,	(this.memory.charCodeAt(p64+3) << 8) | this.memory.charCodeAt(p64+2)
				,	(this.memory.charCodeAt(p64+5) << 8) | this.memory.charCodeAt(p64+4)
				,	(this.memory.charCodeAt(p64+7) << 8) | this.memory.charCodeAt(p64+6)
				)
			this.v4.add( other.multiply(PRIME64_2) ).rotl(31).multiply(PRIME64_1);
		} else {
			var other
			other = UINT64(
					(this.memory[p64+1] << 8) | this.memory[p64]
				,	(this.memory[p64+3] << 8) | this.memory[p64+2]
				,	(this.memory[p64+5] << 8) | this.memory[p64+4]
				,	(this.memory[p64+7] << 8) | this.memory[p64+6]
				)
			this.v1.add( other.multiply(PRIME64_2) ).rotl(31).multiply(PRIME64_1);
			p64 += 8
			other = UINT64(
					(this.memory[p64+1] << 8) | this.memory[p64]
				,	(this.memory[p64+3] << 8) | this.memory[p64+2]
				,	(this.memory[p64+5] << 8) | this.memory[p64+4]
				,	(this.memory[p64+7] << 8) | this.memory[p64+6]
				)
			this.v2.add( other.multiply(PRIME64_2) ).rotl(31).multiply(PRIME64_1);
			p64 += 8
			other = UINT64(
					(this.memory[p64+1] << 8) | this.memory[p64]
				,	(this.memory[p64+3] << 8) | this.memory[p64+2]
				,	(this.memory[p64+5] << 8) | this.memory[p64+4]
				,	(this.memory[p64+7] << 8) | this.memory[p64+6]
				)
			this.v3.add( other.multiply(PRIME64_2) ).rotl(31).multiply(PRIME64_1);
			p64 += 8
			other = UINT64(
					(this.memory[p64+1] << 8) | this.memory[p64]
				,	(this.memory[p64+3] << 8) | this.memory[p64+2]
				,	(this.memory[p64+5] << 8) | this.memory[p64+4]
				,	(this.memory[p64+7] << 8) | this.memory[p64+6]
				)
			this.v4.add( other.multiply(PRIME64_2) ).rotl(31).multiply(PRIME64_1);
		}

		p += 32 - this.memsize
		this.memsize = 0
		if (isString) this.memory = ''
	}

	if (p <= bEnd - 32)
	{
		var limit = bEnd - 32

		do
		{
			if (isString) {
				var other
				other = UINT64(
						(input.charCodeAt(p+1) << 8) | input.charCodeAt(p)
					,	(input.charCodeAt(p+3) << 8) | input.charCodeAt(p+2)
					,	(input.charCodeAt(p+5) << 8) | input.charCodeAt(p+4)
					,	(input.charCodeAt(p+7) << 8) | input.charCodeAt(p+6)
					)
				this.v1.add( other.multiply(PRIME64_2) ).rotl(31).multiply(PRIME64_1);
				p += 8
				other = UINT64(
						(input.charCodeAt(p+1) << 8) | input.charCodeAt(p)
					,	(input.charCodeAt(p+3) << 8) | input.charCodeAt(p+2)
					,	(input.charCodeAt(p+5) << 8) | input.charCodeAt(p+4)
					,	(input.charCodeAt(p+7) << 8) | input.charCodeAt(p+6)
					)
				this.v2.add( other.multiply(PRIME64_2) ).rotl(31).multiply(PRIME64_1);
				p += 8
				other = UINT64(
						(input.charCodeAt(p+1) << 8) | input.charCodeAt(p)
					,	(input.charCodeAt(p+3) << 8) | input.charCodeAt(p+2)
					,	(input.charCodeAt(p+5) << 8) | input.charCodeAt(p+4)
					,	(input.charCodeAt(p+7) << 8) | input.charCodeAt(p+6)
					)
				this.v3.add( other.multiply(PRIME64_2) ).rotl(31).multiply(PRIME64_1);
				p += 8
				other = UINT64(
						(input.charCodeAt(p+1) << 8) | input.charCodeAt(p)
					,	(input.charCodeAt(p+3) << 8) | input.charCodeAt(p+2)
					,	(input.charCodeAt(p+5) << 8) | input.charCodeAt(p+4)
					,	(input.charCodeAt(p+7) << 8) | input.charCodeAt(p+6)
					)
				this.v4.add( other.multiply(PRIME64_2) ).rotl(31).multiply(PRIME64_1);
			} else {
				var other
				other = UINT64(
						(input[p+1] << 8) | input[p]
					,	(input[p+3] << 8) | input[p+2]
					,	(input[p+5] << 8) | input[p+4]
					,	(input[p+7] << 8) | input[p+6]
					)
				this.v1.add( other.multiply(PRIME64_2) ).rotl(31).multiply(PRIME64_1);
				p += 8
				other = UINT64(
						(input[p+1] << 8) | input[p]
					,	(input[p+3] << 8) | input[p+2]
					,	(input[p+5] << 8) | input[p+4]
					,	(input[p+7] << 8) | input[p+6]
					)
				this.v2.add( other.multiply(PRIME64_2) ).rotl(31).multiply(PRIME64_1);
				p += 8
				other = UINT64(
						(input[p+1] << 8) | input[p]
					,	(input[p+3] << 8) | input[p+2]
					,	(input[p+5] << 8) | input[p+4]
					,	(input[p+7] << 8) | input[p+6]
					)
				this.v3.add( other.multiply(PRIME64_2) ).rotl(31).multiply(PRIME64_1);
				p += 8
				other = UINT64(
						(input[p+1] << 8) | input[p]
					,	(input[p+3] << 8) | input[p+2]
					,	(input[p+5] << 8) | input[p+4]
					,	(input[p+7] << 8) | input[p+6]
					)
				this.v4.add( other.multiply(PRIME64_2) ).rotl(31).multiply(PRIME64_1);
			}
			p += 8
		} while (p <= limit)
	}

	if (p < bEnd)
	{
		// XXH64_memcpy(this.memory, p, bEnd-p);
		if (isString) {
			this.memory += input.slice(p)
		} else if (isArrayBuffer) {
			this.memory.set( input.subarray(p, bEnd), this.memsize )
		} else {
			input.copy( this.memory, this.memsize, p, bEnd )
		}

		this.memsize = bEnd - p
	}

	return this
}

/**
 * Finalize the XXH64 computation. The XXH64 instance is ready for reuse for the given seed
 * @method digest
 * @return {UINT64} xxHash
 */
XXH64.prototype.digest = function () {
	var input = this.memory
	var isString = typeof input == 'string'
	var p = 0
	var bEnd = this.memsize
	var h64, h
	var u = new UINT64

	if (this.total_len >= 32)
	{
		h64 = this.v1.clone().rotl(1)
		h64.add( this.v2.clone().rotl(7) )
		h64.add( this.v3.clone().rotl(12) )
		h64.add( this.v4.clone().rotl(18) )

		h64.xor( this.v1.multiply(PRIME64_2).rotl(31).multiply(PRIME64_1) )
		h64.multiply(PRIME64_1).add(PRIME64_4)

		h64.xor( this.v2.multiply(PRIME64_2).rotl(31).multiply(PRIME64_1) )
		h64.multiply(PRIME64_1).add(PRIME64_4)

		h64.xor( this.v3.multiply(PRIME64_2).rotl(31).multiply(PRIME64_1) )
		h64.multiply(PRIME64_1).add(PRIME64_4)

		h64.xor( this.v4.multiply(PRIME64_2).rotl(31).multiply(PRIME64_1) )
		h64.multiply(PRIME64_1).add(PRIME64_4)
	}
	else
	{
		h64  = this.seed.clone().add( PRIME64_5 )
	}

	h64.add( u.fromNumber(this.total_len) )

	while (p <= bEnd - 8)
	{
		if (isString) {
			u.fromBits(
				(input.charCodeAt(p+1) << 8) | input.charCodeAt(p)
			,	(input.charCodeAt(p+3) << 8) | input.charCodeAt(p+2)
			,	(input.charCodeAt(p+5) << 8) | input.charCodeAt(p+4)
			,	(input.charCodeAt(p+7) << 8) | input.charCodeAt(p+6)
			)
		} else {
			u.fromBits(
				(input[p+1] << 8) | input[p]
			,	(input[p+3] << 8) | input[p+2]
			,	(input[p+5] << 8) | input[p+4]
			,	(input[p+7] << 8) | input[p+6]
			)
		}
		u.multiply(PRIME64_2).rotl(31).multiply(PRIME64_1)
		h64
			.xor(u)
			.rotl(27)
			.multiply( PRIME64_1 )
			.add( PRIME64_4 )
		p += 8
	}

	if (p + 4 <= bEnd) {
		if (isString) {
			u.fromBits(
				(input.charCodeAt(p+1) << 8) | input.charCodeAt(p)
			,	(input.charCodeAt(p+3) << 8) | input.charCodeAt(p+2)
			,	0
			,	0
			)
		} else {
			u.fromBits(
				(input[p+1] << 8) | input[p]
			,	(input[p+3] << 8) | input[p+2]
			,	0
			,	0
			)
		}
		h64
			.xor( u.multiply(PRIME64_1) )
			.rotl(23)
			.multiply( PRIME64_2 )
			.add( PRIME64_3 )
		p += 4
	}

	while (p < bEnd)
	{
		u.fromBits( isString ? input.charCodeAt(p++) : input[p++], 0, 0, 0 )
		h64
			.xor( u.multiply(PRIME64_5) )
			.rotl(11)
			.multiply(PRIME64_1)
	}

	h = h64.clone().shiftRight(33)
	h64.xor(h).multiply(PRIME64_2)

	h = h64.clone().shiftRight(29)
	h64.xor(h).multiply(PRIME64_3)

	h = h64.clone().shiftRight(32)
	h64.xor(h)

	// Reset the state
	this.init( this.seed )

	return h64
}

module.exports = XXH64

}).call(this,require("buffer").Buffer)
},{"buffer":28,"cuint":31}],"alan-compiler":[function(require,module,exports){
const { default: buildPipeline, } = require('./dist/pipeline')
const ammtojs = require('./dist/ammtojs')
const lntoamm = require('./dist/lntoamm')
const ammtoaga = require('./dist/ammtoaga')

// We won't support AGC for now because of the complexities of moving off the Buffer API
const convert = buildPipeline([
  ['ln', 'amm', lntoamm],
  ['amm', 'aga', ammtoaga],
  ['amm', 'js', ammtojs],
])

module.exports = (inFormat, outFormat, text) => {
  if (convert[inFormat] && convert[inFormat][outFormat]) {
    const out = convert[inFormat][outFormat].fromString(text)
    if (outFormat === 'js') { // Hackery for browserify for now, will clean this up later
      return out.replace(/alan-js-runtime/g, 'alan-runtime')
    }
    return out
  } else {
    throw new Error(`${inFormat} to ${outFormat} is not supported`)
  }
}

},{"./dist/ammtoaga":6,"./dist/ammtojs":7,"./dist/lntoamm":20,"./dist/pipeline":23}],"alan-js-runtime":[function(require,module,exports){
(function (process,Buffer){
require('cross-fetch/polyfill')
const EventEmitter = require('events')
const http = require('http')
const net = require('net')
const util = require('util')

const xxh = require('xxhashjs')

const exec = util.promisify ? util.promisify(require('child_process').exec) : () => {} // browsers

const e = new EventEmitter()

const INT8MAX = 2 ** 7 - 1
const INT8MIN = -(2 ** 7)
const INT16MAX = 2 ** 15 - 1
const INT16MIN = -(2 ** 15)
const INT32MAX = 2 ** 31 - 1
const INT32MIN = -(2 ** 31)
const INT64MAX = 2n ** 63n - 1n
const INT64MIN = -(2n ** 63n)

// JS really doesn't have BigInt equivalents of these?
const BigMin = (a, b) => a < b ? a : b
const BigMax = (a, b) => a > b ? a : b
const BigAbs = a => a > 0n ? a : -a // A six pack?

// Hashing opcodes (hashv is recursive, needs to be defined outside of the export object)
const hashcore = (hasher, a) => {
  // TODO: We have to turn these values into ArrayBuffers of the right type. There's currently an
  // issue if a floating point number that is also an integer is provided -- the duck typing here
  // will treat it as an i64 instead of an f64 so the hash will be different between the JS and
  // Rust implementations. There are a few ways to solve this, but they all have tradeoffs. Will
  // revisit this in the future.
  let buffer = new ArrayBuffer(8)
  if (typeof a === 'number') {
    if (a === parseInt(a)) {
      const view = new BigInt64Array(buffer)
      view.set([BigInt(a)], 0)
    } else {
      const view = new Float64Array(buffer)
      view.set([a], 0)
    }
  } else if (typeof a === 'bigint') {
    const view = new BigInt64Array(buffer)
    view.set([a], 0)
  } else if (typeof a === 'string') {
    // If it's a string, we treat it like an array of 64-bit integers with a prefixed 64-bit length
    // to match the behavior of the Rust runtime
    const len = a.length
    const len8 = Math.ceil(len / 8) * 8
    buffer = new ArrayBuffer(8 + len8)
    const lenview = new BigInt64Array(buffer)
    lenview.set([BigInt(len)], 0)
    const strview = new Int8Array(buffer)
    // The following only works in the ASCII subset for now, since JS chose to use utf16 instead of
    // utf8. TODO: Find a pure Javascript library that converts utf16 codepoints to utf8, or write
    // one. :/
    strview.set(a.split('').map(s => s.charCodeAt(0)), 8)
  } else {
    // Booleans are treated as if they are 64-bit integers
    const val = a ? BigInt(1) : BigInt(0)
    const view = new BigInt64Array(buffer)
    view.set([val], 0)
  }
  for (let i = 0; i < buffer.byteLength; i += 8) {
    const piece = buffer.slice(i, i + 8)
    hasher.update(piece)
  }
  return hasher
}
const hashf = a => BigInt.asIntN(64, hashcore(xxh.h64().init(0xfa57), a).digest())
const hashv = arr => {
  // The Rust runtime considers strings a variable type, but they are more like a fixed type for JS
  if (typeof arr === 'string') return hashf(arr)
  const hasher = xxh.h64().init(0xfa57)
  let stack = [arr]
  while (stack.length > 0) {
    let arr = stack.pop()
    for (const elem of arr) {
      if (elem instanceof Array) {
        stack.push(elem)
      } else {
        hashcore(hasher, elem)
      }
    }
  }
  return BigInt.asIntN(64, hasher.digest())
}

const copyarr = a => {
  try {
    return JSON.parse(JSON.stringify(a))
  } catch (e) {
    if (typeof a[0] === 'bigint') {
      return a.map(v => BigInt(v))
    } else {
      return a.map(v => copyarr(v))
    }
  }
}

// Not very OOP, but since the HTTP server is a singleton right now, store open connections here
const httpConns = {}

// Same justification for the TCP server
const tcpConns = {}

// The shared mutable state for the datastore library
const ds = {}

module.exports = {
  // Type conversion opcodes (mostly no-ops in JS, unless we implement a strict mode)
  i8f64:    a => a,
  i16f64:   a => a,
  i32f64:   a => a,
  i64f64:   a => parseFloat(a.toString()),
  f32f64:   a => a,
  strf64:   a => parseFloat(a),
  boolf64:  a => a ? 1.0 : 0.0,

  i8f32:    a => a,
  i16f32:   a => a,
  i32f32:   a => a,
  i64f32:   a => parseFloat(a.toString()),
  f64f32:   a => a,
  strf32:   a => parseFloat(a),
  boolf32:  a => a ? 1.0 : 0.0,

  i8i64:    a => BigInt(a),
  i16i64:   a => BigInt(a),
  i32i64:   a => BigInt(a),
  f32i64:   a => BigInt(Math.floor(a)),
  f64i64:   a => BigInt(Math.floor(a)),
  stri64:   a => BigInt(parseInt(a)), // intentionally allowing other bases here
  booli64:  a => a ? 1n : 0n,

  i8i32:    a => a,
  i16i32:   a => a,
  i64i32:   a => Number(BigInt.asIntN(32, a)),
  f32i32:   a => Math.floor(a),
  f64i32:   a => Math.floor(a),
  stri32:   a => parseInt(a),
  booli32:  a => a ? 1 : 0,

  i8i16:    a => a,
  i32i16:   a => a,
  i64i16:   a => Number(BigInt.asIntN(16, a)),
  f32i16:   a => Math.floor(a),
  f64i16:   a => Math.floor(a),
  stri16:   a => parseInt(a),
  booli16:  a => a ? 1 : 0,

  i16i8:    a => a,
  i32i8:    a => a,
  i64i8:    a => Number(BigInt.asIntN(8, a)),
  f32i8:    a => Math.floor(a),
  f64i8:    a => Math.floor(a),
  stri8:    a => parseInt(a),
  booli8:   a => a ? 1 : 0,

  i8bool:   a => a !== 0,
  i16bool:  a => a !== 0,
  i32bool:  a => a !== 0,
  i64bool:  a => a !== 0n,
  f32bool:  a => a !== 0.0,
  f64bool:  a => a !== 0.0,
  strbool:  a => a === "true",

  i8str:    a => a.toString(),
  i16str:   a => a.toString(),
  i32str:   a => a.toString(),
  i64str:   a => a.toString(),
  f32str:   a => a.toString(),
  f64str:   a => a.toString(),
  boolstr:  a => a.toString(),

  // Arithmetic opcodes
  addi8:   (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (a > 0 && b > 0 && a > INT8MAX - b) return [false, 'overflow']
    if (a < 0 && b < 0 && a < INT8MIN - b) return [false, 'underflow']
    return [true, a + b]
  },
  addi16:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (a > 0 && b > 0 && a > INT16MAX - b) return [false, 'overflow']
    if (a < 0 && b < 0 && a < INT16MIN - b) return [false, 'underflow']
    return [true, a + b]
  },
  addi32:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (a > 0 && b > 0 && a > INT32MAX - b) return [false, 'overflow']
    if (a < 0 && b < 0 && a < INT32MIN - b) return [false, 'underflow']
    return [true, a + b]
  },
  addi64:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (a > 0n && b > 0n && a > INT64MAX - b) return [false, 'overflow']
    if (a < 0n && b < 0n && a < INT64MIN - b) return [false, 'underflow']
    return [true, a + b]
  },
  addf32:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    const out = a + b
    if (out === Number.POSITIVE_INFINITY) return [false, 'overflow']
    if (out === Number.NEGATIVE_INFINITY) return [false, 'underflow']
    return [true, out]
  },
  addf64:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    const out = a + b
    if (out === Number.POSITIVE_INFINITY) return [false, 'overflow']
    if (out === Number.NEGATIVE_INFINITY) return [false, 'underflow']
    return [true, out]
  },

  subi8:   (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (a > 0 && b < 0 && a > INT8MAX + b) return [false, 'overflow']
    if (a < 0 && b > 0 && a < INT8MIN + b) return [false, 'underflow']
    return [true, a - b]
  },
  subi16:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (a > 0 && b < 0 && a > INT16MAX + b) return [false, 'overflow']
    if (a < 0 && b > 0 && a < INT16MIN + b) return [false, 'underflow']
    return [true, a - b]
  },
  subi32:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (a > 0 && b < 0 && a > INT32MAX + b) return [false, 'overflow']
    if (a < 0 && b > 0 && a < INT32MIN + b) return [false, 'underflow']
    return [true, a - b]
  },
  subi64:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (a > 0n && b < 0n && a > INT64MAX + b) return [false, 'overflow']
    if (a < 0n && b > 0n && a < INT64MIN + b) return [false, 'underflow']
    return [true, a - b]
  },
  subf32:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    const out = a - b
    if (out === Number.POSITIVE_INFINITY) return [false, 'overflow']
    if (out === Number.NEGATIVE_INFINITY) return [false, 'underflow']
    return [true, out]
  },
  subf64:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    const out = a - b
    if (out === Number.POSITIVE_INFINITY) return [false, 'overflow']
    if (out === Number.NEGATIVE_INFINITY) return [false, 'underflow']
    return [true, out]
  },

  negi8:    ra => !ra[0] ? ra : (0 - ra[1] <= INT8MAX ? [true, 0 - ra[1]] : [false, 'overflow']),
  negi16:   ra => !ra[0] ? ra : (0 - ra[1] <= INT16MAX ? [true, 0 - ra[1]] : [false, 'overflow']),
  negi32:   ra => !ra[0] ? ra : (0 - ra[1] <= INT32MAX ? [true, 0 - ra[1]] : [false, 'overflow']),
  negi64:   ra => !ra[0] ? ra : (0n - ra[1] <= INT64MAX ? [true, 0n - ra[1]] : [false, 'overflow']),
  negf32:   ra => !ra[0] ? ra : [true, 0.0 - a],
  negf64:   ra => !ra[0] ? ra : [true, 0.0 - a],

  absi8:    ra => !ra[0] ? ra : (Math.abs(ra[1]) <= INT8MAX ? [true, Math.abs(ra[1])] : [false, 'overflow']),
  absi16:   ra => !ra[0] ? ra : (Math.abs(ra[1]) <= INT16MAX ? [true, Math.abs(ra[1])] : [false, 'overflow']),
  absi32:   ra => !ra[0] ? ra : (Math.abs(ra[1]) <= INT32MAX ? [true, Math.abs(ra[1])] : [false, 'overflow']),
  absi64:   ra => !ra[0] ? ra : (BigAbs(ra[1]) <= INT64MAX ? [true, BigAbs(ra[1])] : [false, 'overflow']),
  absf32:   ra => !ra[0] ? ra : [true, Math.abs(ra[1])],
  absf64:   ra => !ra[0] ? ra : [true, Math.abs(ra[1])],

  muli8:   (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (a > 0 && b > 0 && a > INT8MAX / b) return [false, 'overflow']
    if (a < 0 && b < 0 && a < INT8MIN / b) return [false, 'underflow']
    return [true, a * b]
  },
  muli16:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (a > 0 && b > 0 && a > INT16MAX / b) return [false, 'overflow']
    if (a < 0 && b < 0 && a < INT16MIN / b) return [false, 'underflow']
    return [true, a * b]
  },
  muli32:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (a > 0 && b > 0 && a > INT32MAX / b) return [false, 'overflow']
    if (a < 0 && b < 0 && a < INT32MIN / b) return [false, 'underflow']
    return [true, a * b]
  },
  muli64:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (a > 0n && b > 0n && a > INT64MAX / b) return [false, 'overflow']
    if (a < 0n && b < 0n && a < INT64MIN / b) return [false, 'underflow']
    return [true, a * b]
  },
  mulf32:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    const out = a * b
    if (out === Number.POSITIVE_INFINITY) return [false, 'overflow']
    if (out === Number.NEGATIVE_INFINITY) return [false, 'underflow']
    return [true, out]
  },
  mulf64:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    const out = a * b
    if (out === Number.POSITIVE_INFINITY) return [false, 'overflow']
    if (out === Number.NEGATIVE_INFINITY) return [false, 'underflow']
    return [true, out]
  },

  divi8:   (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (b === 0) return [false, 'divide-by-zero']
    return [true, Math.floor(a / b)]
  },
  divi16:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (b === 0) return [false, 'divide-by-zero']
    return [true, Math.floor(a / b)]
  },
  divi32:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (b === 0) return [false, 'divide-by-zero']
    return [true, Math.floor(a / b)]
  },
  divi64:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (b === 0n) return [false, 'divide-by-zero']
    return [true, a / b]
  },
  divf32:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (b === 0.0) return [false, 'divide-by-zero']
    const out = a / b
    if (out === Number.POSITIVE_INFINITY) return [false, 'overflow']
    if (out === Number.NEGATIVE_INFINITY) return [false, 'underflow']
    return [true, out]
  },
  divf64:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (b === 0.0) return [false, 'divide-by-zero']
    const out = a / b
    if (out === Number.POSITIVE_INFINITY) return [false, 'overflow']
    if (out === Number.NEGATIVE_INFINITY) return [false, 'underflow']
    return [true, out]
  },

  modi8:   (a, b) => a % b,
  modi16:  (a, b) => a % b,
  modi32:  (a, b) => a % b,
  modi64:  (a, b) => a % b,

  powi8:   (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (a > 0 && b > 1 && a > INT8MAX ** (1 / b)) return [false, 'overflow']
    if (a < 0 && b > 1 && a < INT8MIN ** (1 / b)) return [false, 'underflow']
    return [true, Math.floor(a ** b)]
  },
  powi16:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (a > 0 && b > 1 && a > INT16MAX ** (1 / b)) return [false, 'overflow']
    if (a < 0 && b > 1 && a < INT16MIN ** (1 / b)) return [false, 'underflow']
    return [true, Math.floor(a ** b)]
  },
  powi32:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (a > 0 && b > 1 && a > INT32MAX ** (1 / b)) return [false, 'overflow']
    if (a < 0 && b > 1 && a < INT32MIN ** (1 / b)) return [false, 'underflow']
    return [true, Math.floor(a ** b)]
  },
  powi64:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    if (a > 0 && b > 1n) {
      const af = parseFloat(a.toString())
      const bf = parseFloat(b.toString())
      const maxf = parseFloat(INT64MAX.toString())
      if (af > maxf ** (1 / bf)) return [false, 'overflow']
    }
    if (a < 0n && b > 1n) {
      const af = parseFloat(a.toString())
      const bf = parseFloat(b.toString())
      const minf = parseFloat(INT64MIN.toString())
      if (af < minf ** (1 / bf)) return [false, 'underflow']
    }
    return [true, a ** b]
  },
  powf32:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    const out = a ** b
    if (out === Number.POSITIVE_INFINITY) return [false, 'overflow']
    if (out === Number.NEGATIVE_INFINITY) return [false, 'underflow']
    return [true, out]
  },
  powf64:  (ra, rb) => {
    if (!ra[0]) return ra
    if (!rb[0]) return rb
    const a = ra[1]
    const b = rb[1]
    const out = a ** b
    if (out === Number.POSITIVE_INFINITY) return [false, 'overflow']
    if (out === Number.NEGATIVE_INFINITY) return [false, 'underflow']
    return [true, out]
  },

  sqrtf32:  a => Math.sqrt(a),
  sqrtf64:  a => Math.sqrt(a),

  // Saturating arithmetic
  saddi8:   (a, b) => {
    if (a > 0 && b > 0 && a > INT8MAX - b) return INT8MAX
    if (a < 0 && b < 0 && a < INT8MIN - b) return INT8MIN
    return a + b
  },
  saddi16:  (a, b) => {
    if (a > 0 && b > 0 && a > INT16MAX - b) return INT16MAX
    if (a < 0 && b < 0 && a < INT16MIN - b) return INT16MIN
    return a + b
  },
  saddi32:  (a, b) => {
    if (a > 0 && b > 0 && a > INT32MAX - b) return INT32MAX
    if (a < 0 && b < 0 && a < INT32MIN - b) return INT32MIN
    return a + b
  },
  saddi64:  (a, b) => {
    if (a > 0n && b > 0n && a > INT64MAX - b) return INT64MAX
    if (a < 0n && b < 0n && a < INT64MIN - b) return INT64MIN
    return a + b
  },
  saddf32:  (a, b) => a + b,
  saddf64:  (a, b) => a + b,

  ssubi8:   (a, b) => {
    if (a > 0 && b < 0 && a > INT8MAX + b) return INT8MAX
    if (a < 0 && b > 0 && a < INT8MIN + b) return INT8MIN
    return a - b
  },
  ssubi16:  (a, b) => {
    if (a > 0 && b < 0 && a > INT16MAX + b) return INT16MAX
    if (a < 0 && b > 0 && a < INT16MIN + b) return INT16MIN
    return a - b
  },
  ssubi32:  (a, b) => {
    if (a > 0 && b < 0 && a > INT32MAX + b) return INT32MAX
    if (a < 0 && b > 0 && a < INT32MIN + b) return INT32MIN
    return a - b
  },
  ssubi64:  (a, b) => {
    if (a > 0n && b < 0n && a > INT64MAX + b) return INT64MAX
    if (a < 0n && b > 0n && a < INT64MIN + b) return INT64MIN
    return a - b
  },
  ssubf32:  (a, b) => a - b,
  ssubf64:  (a, b) => a - b,

  snegi8:    a => Math.min(0 - a, INT8MAX),
  snegi16:   a => Math.min(0 - a, INT16MAX),
  snegi32:   a => Math.min(0 - a, INT32MAX),
  snegi64:   a => BigMin(0n - a, INT64MAX),
  snegf32:   a => 0.0 - a,
  snegf64:   a => 0.0 - a,

  sabsi8:    a => Math.min(Math.abs(a), INT8MAX),
  sabsi16:   a => Math.min(Math.abs(a), INT16MAX),
  sabsi32:   a => Math.min(Math.abs(a), INT32MAX),
  sabsi64:   a => BigMin(a > 0n ? a : -a, INT64MAX),
  sabsf32:   a => Math.abs(a),
  sabsf64:   a => Math.abs(a),

  smuli8:   (a, b) => {
    if (a > 0 && b > 0 && a > INT8MAX / b) return INT8MAX
    if (a < 0 && b < 0 && a < INT8MIN / b) return INT8MIN
    return a * b
  },
  smuli16:  (a, b) => {
    if (a > 0 && b > 0 && a > INT16MAX / b) return INT16MAX
    if (a < 0 && b < 0 && a < INT16MIN / b) return INT16MIN
    return a * b
  },
  smuli32:  (a, b) => {
    if (a > 0 && b > 0 && a > INT32MAX / b) return INT32MAX
    if (a < 0 && b < 0 && a < INT32MIN / b) return INT32MIN
    return a * b
  },
  smuli64:  (a, b) => {
    if (a > 0n && b > 0n && a > INT64MAX / b) return INT64MAX
    if (a < 0n && b < 0n && a < INT64MIN / b) return INT64MIN
    return a * b
  },
  smulf32:  (a, b) => a * b,
  smulf64:  (a, b) => a * b,

  sdivi8:   (a, b) => {
    if (b === 0) return a > 0 ? INT8MAX : INT8MIN
    return Math.floor(a / b)
  },
  sdivi16:  (a, b) => {
    if (b === 0) return a > 0 ? INT16MAX : INT16MIN
    return Math.floor(a / b)
  },
  sdivi32:  (a, b) => {
    if (b === 0) return a > 0 ? INT32MAX : INT32MIN
    return Math.floor(a / b)
  },
  sdivi64:  (a, b) => {
    if (b === 0n) return a > 0n ? INT64MAX : INT64MIN
    return a / b
  },
  sdivf32:  (a, b) => a / b,
  sdivf64:  (a, b) => a / b,

  spowi8:   (a, b) => {
    if (a > 0 && b > 1 && a > INT8MAX ** (1 / b)) return INT8MAX
    if (a < 0 && b > 1 && a < INT8MIN ** (1 / b)) return INT8MIN
    return Math.floor(a ** b)
  },
  spowi16:  (a, b) => {
    if (a > 0 && b > 1 && a > INT16MAX ** (1 / b)) return INT16MAX
    if (a < 0 && b > 1 && a < INT16MIN ** (1 / b)) return INT16MIN
    return Math.floor(a ** b)
  },
  spowi32:  (a, b) => {
    if (a > 0 && b > 1 && a > INT32MAX ** (1 / b)) return INT32MAX
    if (a < 0 && b > 1 && a < INT32MIN ** (1 / b)) return INT32MIN
    return Math.floor(a ** b)
  },
  spowi64:  (a, b) => {
    if (a > 0 && b > 1n) {
      const af = parseFloat(a.toString())
      const bf = parseFloat(b.toString())
      const maxf = parseFloat(INT64MAX.toString())
      if (af > maxf ** (1 / bf)) return INT64MAX
    }
    if (a < 0n && b > 1n) {
      const af = parseFloat(a.toString())
      const bf = parseFloat(b.toString())
      const minf = parseFloat(INT64MIN.toString())
      if (af < minf ** (1 / bf)) return INT64MIN
    }
    return a ** b
  },
  spowf32:  (a, b) => a ** b,
  spowf64:  (a, b) => a ** b,

  // Boolean and bitwise opcodes
  andi8:   (a, b) => a & b,
  andi16:  (a, b) => a & b,
  andi32:  (a, b) => a & b,
  andi64:  (a, b) => a & b,
  andbool: (a, b) => a && b,

  ori8:    (a, b) => a | b,
  ori16:   (a, b) => a | b,
  ori32:   (a, b) => a | b,
  ori64:   (a, b) => a | b,
  orbool:  (a, b) => a || b,

  xori8:   (a, b) => a ^ b,
  xori16:  (a, b) => a ^ b,
  xori32:  (a, b) => a ^ b,
  xori64:  (a, b) => a ^ b,
  xorbool: (a, b) => !!(a ^ b),

  noti8:    a => ~a,
  noti16:   a => ~a,
  noti32:   a => ~a,
  noti64:   a => ~a,
  notbool:  a => !a,

  nandi8:  (a, b) => ~(a & b),
  nandi16: (a, b) => ~(a & b),
  nandi32: (a, b) => ~(a & b),
  nandi64: (a, b) => ~(a & b),
  nandboo: (a, b) => !(a && b),

  nori8:   (a, b) => ~(a | b),
  nori16:  (a, b) => ~(a | b),
  nori32:  (a, b) => ~(a | b),
  nori64:  (a, b) => ~(a | b),
  norbool: (a, b) => !(a || b),

  xnori8:  (a, b) => ~(a ^ b),
  xnori16: (a, b) => ~(a ^ b),
  xnori32: (a, b) => ~(a ^ b),
  xnori64: (a, b) => ~(a ^ b),
  xnorboo: (a, b) => !(a ^ b),

  // Equality and order opcodes
  eqi8:    (a, b) => a === b,
  eqi16:   (a, b) => a === b,
  eqi32:   (a, b) => a === b,
  eqi64:   (a, b) => a === b,
  eqf32:   (a, b) => a === b,
  eqf64:   (a, b) => a === b,
  eqstr:   (a, b) => a === b,
  eqbool:  (a, b) => a === b,

  neqi8:   (a, b) => a !== b,
  neqi16:  (a, b) => a !== b,
  neqi32:  (a, b) => a !== b,
  neqi64:  (a, b) => a !== b,
  neqf32:  (a, b) => a !== b,
  neqf64:  (a, b) => a !== b,
  neqstr:  (a, b) => a !== b,
  neqbool: (a, b) => a !== b,

  lti8:    (a, b) => a < b,
  lti16:   (a, b) => a < b,
  lti32:   (a, b) => a < b,
  lti64:   (a, b) => a < b,
  ltf32:   (a, b) => a < b,
  ltf64:   (a, b) => a < b,
  ltstr:   (a, b) => a < b,

  ltei8:   (a, b) => a <= b,
  ltei16:  (a, b) => a <= b,
  ltei32:  (a, b) => a <= b,
  ltei64:  (a, b) => a <= b,
  ltef32:  (a, b) => a <= b,
  ltef64:  (a, b) => a <= b,
  ltestr:  (a, b) => a <= b,

  gti8:    (a, b) => a > b,
  gti16:   (a, b) => a > b,
  gti32:   (a, b) => a > b,
  gti64:   (a, b) => a > b,
  gtf32:   (a, b) => a > b,
  gtf64:   (a, b) => a > b,
  gtstr:   (a, b) => a > b,

  gtei8:   (a, b) => a >= b,
  gtei16:  (a, b) => a >= b,
  gtei32:  (a, b) => a >= b,
  gtei64:  (a, b) => a >= b,
  gtef32:  (a, b) => a >= b,
  gtef64:  (a, b) => a >= b,
  gtestr:  (a, b) => a >= b,

  // String opcodes
  catstr:  (a, b) => a.concat(b),
  split:   (a, b) => a.split(b),
  repstr:  (a, b) => new Array(parseInt(b.toString())).fill(a).join(''),
  // TODO: templ, after maps are figured out
  matches: (a, b) => RegExp(b).test(a),
  indstr:  (a, b) => {
    const ind = BigInt(a.indexOf(b))
    return ind > -1 ? [ true, ind, ] : [ false, 'substring not found', ]
  },
  lenstr:   a => BigInt(a.length),
  trim:     a => a.trim(),
  copyfrom:(arr, ind) => JSON.parse(JSON.stringify(arr[ind])),
  copytof: (arr, ind, val) => { arr[ind] = val }, // These do the same thing in JS
  copytov: (arr, ind, val) => { arr[ind] = val },
  register:(arr, ind) => arr[ind], // Only on references to inner arrays

  // Array opcodes TODO more to come
  newarr:   size => new Array(), // Ignored because JS push doesn't behave as desired
  pusharr: (arr, val, size) => arr.push(val),
  pushf: (arr, val) => arr.push(val),
  pushv: (arr, val) => arr.push(val),
  poparr:   arr => arr.length > 0 ? [ true, arr.pop(), ] : [ false, 'cannot pop empty array', ],
  lenarr:   arr => BigInt(arr.length),
  indarrf: (arr, val) => {
    const ind = BigInt(arr.indexOf(val))
    return ind > -1 ? [ true, ind, ] : [ false, 'element not found', ]
  },
  indarrv: (arr, val) => {
    const ind = BigInt(arr.indexOf(val))
    return ind > -1 ? [ true, ind, ] : [ false, 'element not found', ]
  },
  delindx: (arr, idx) => {
    const spliced = arr.splice(parseInt(idx.toString()), 1)
    if (spliced.length === 1 && parseInt(idx.toString()) >= 0) {
      return [ true, spliced[0] ]
    } else {
      return [ false, `cannot remove idx ${idx} from array with length ${arr.length}` ]
    }
  },
  join:    (arr, sep) => arr.join(sep),
  map:     async (arr, fn) => await Promise.all(arr.map((v, i) => fn(v, BigInt(i)))),
  mapl:    async (arr, fn) => await Promise.all(arr.map((v, i) => fn(v, BigInt(i)))),
  reparr:  (arr, n) => Array.from(new Array(parseInt(n.toString()) * arr.length))
    .map((_, i) => typeof arr[i % arr.length] === 'bigint' ?
      BigInt(arr[i % arr.length]) :
      JSON.parse(JSON.stringify(arr[i % arr.length]))
    ),
  each:    async (arr, fn) => { // Thrown away but awaited to maintain consistent execution
    await Promise.all(arr.map((v, i) => fn(v, BigInt(i))))
  },
  eachl:   async (arr, fn) => { // Thrown away but awaited to maintain consistent execution
    await Promise.all(arr.map((v, i) => fn(v, BigInt(i))))
  },
  find:    async (arr, fn) => {
    let val = undefined
    const len = arr.length
    for (let i = 0; i < len && val === undefined; i++) {
      if (await fn(arr[i])) {
        val = arr[i]
      }
    }
    if (val === undefined) {
      return [
        false,
        'no element matches',
      ]
    } else {
      return [
        true,
        val,
      ]
    }
  },
  findl:   async (arr, fn) => {
    let val = undefined
    const len = arr.length
    for (let i = 0; i < len && val === undefined; i++) {
      if (await fn(arr[i])) {
        val = arr[i]
      }
    }
    if (val === undefined) {
      return [
        false,
        'no element matches',
      ]
    } else {
      return [
        true,
        val,
      ]
    }
  },
  every:   async (arr, fn) => {
    const len = arr.length
    for (let i = 0; i < len; i++) {
      if (!await fn(arr[i])) return false
    }
    return true
  },
  everyl:  async (arr, fn) => {
    const len = arr.length
    for (let i = 0; i < len; i++) {
      if (!await fn(arr[i])) return false
    }
    return true
  },
  some:    async (arr, fn) => {
    const len = arr.length
    for (let i = 0; i < len; i++) {
      if (await fn(arr[i])) return true
    }
    return false
  },
  somel:    async (arr, fn) => {
    const len = arr.length
    for (let i = 0; i < len; i++) {
      if (await fn(arr[i])) return true
    }
    return false
  },
  filter:  async (arr, fn) => {
    let out = []
    let len = arr.length
    for (let i = 0; i < len; i++) {
      if (await fn(arr[i])) out.push(arr[i])
    }
    return out
  },
  filterl: async (arr, fn) => {
    let out = []
    let len = arr.length
    for (let i = 0; i < len; i++) {
      if (await fn(arr[i])) out.push(arr[i])
    }
    return out
  },
  reducel: async (arr, fn) => {
    let cumu = arr[0]
    let len = arr.length
    for (let i = 1; i < len; i++) {
      cumu = await fn(cumu, arr[i])
    }
    return cumu
  },
  reducep: async (arr, fn) => {
    let cumu = arr[0]
    let len = arr.length
    for (let i = 1; i < len; i++) {
      cumu = await fn(cumu, arr[i])
    }
    return cumu
  },
  foldl:   async (obj, fn) => {
    const [arr, init] = obj
    let cumu = init
    let len = arr.length
    for (let i = 0; i < len; i++) {
      cumu = await fn(cumu, arr[i])
    }
    return cumu
  },
  foldp:   async (obj, fn) => {
    const [arr, init] = obj
    let cumu = init
    let len = arr.length
    for (let i = 0; i < len; i++) {
      cumu = await fn(cumu, arr[i])
    }
    return [cumu] // This path is expected to return an array of folded values per thread
  },
  catarr:  (a, b) => [...a, ...b],

  // Map opcodes TODO after maps are figured out

  // Ternary functions
  // TODO: pair and condarr after arrays are figured out
  condfn:  async (cond, fn) => cond ? await fn() : undefined,

  // Copy opcodes (for let reassignment)
  copyi8:   a => JSON.parse(JSON.stringify(a)),
  copyi16:  a => JSON.parse(JSON.stringify(a)),
  copyi32:  a => JSON.parse(JSON.stringify(a)),
  copyi64:  a => BigInt(a),
  copyvoid: a => JSON.parse(JSON.stringify(a)),
  copyf32:  a => JSON.parse(JSON.stringify(a)),
  copyf64:  a => JSON.parse(JSON.stringify(a)),
  copybool: a => JSON.parse(JSON.stringify(a)),
  copystr:  a => JSON.parse(JSON.stringify(a)),
  // Actually the recommended deep clone mechanism: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Deep_Clone
  // Doesn't work with BigInt :(
  // copyarr:  a => JSON.parse(JSON.stringify(a)),
  // Implementation is now recursive with a try-catch wrapper, so not great for perf
  copyarr,
  zeroed:  () => null,

  // Trig opcodes
  lnf64:    a => Math.log(a),
  logf64:   a => Math.log(a) / Math.log(10),
  sinf64:   a => Math.sin(a),
  cosf64:   a => Math.cos(a),
  tanf64:   a => Math.tan(a),
  asinf64:  a => Math.asin(a),
  acosf64:  a => Math.acos(a),
  atanf64:  a => Math.atan(a),
  sinhf64:  a => Math.sinh(a),
  coshf64:  a => Math.cosh(a),
  tanhf64:  a => Math.tanh(a),

  // Error, Maybe, Result, Either opcodes
  error:    a => a,
  reff:      a => a, // Just an alias for error but without the type mangling in the compiler
  refv:      a => a, // Just an alias for error but without the type mangling in the compiler
  noerr:   () => '',
  errorstr: a => a.toString(),
  someM:    a => [
    true,
    a,
  ],
  noneM:   () => [
    false,
  ],
  isSome:   a => a[0],
  isNone:   a => !a[0],
  getOrM:  (a, b) => a[0] ? a[1] : b,
  getMaybe: a => {
    if (a[0]) {
      return a[1]
    } else {
      throw new Error('runtime error: illegal access')
    }
  },
  okR:      a => [
    true,
    a,
  ],
  err:      a => [
    false,
    a,
  ],
  isOk:     a => a[0],
  isErr:    a => !a[0],
  getOrR:  (a, b) => a[0] ? a[1] : b,
  getOrRS: (a, b) => a[0] ? a[1] : b,
  getR:    (a) => {
    if (a[0]) {
      return a[1]
    } else {
      throw new Error('runtime error: illegal access')
    }
  },
  getErr:  (a, b) => a[0] ? b : a[1],
  resfrom: (arr, rind) => {
    if (!rind[0]) return rind
    const ind = rind[1]
    if (ind >= 0 && ind < arr.length) {
      return [
        true,
        arr[ind],
      ]
    } else {
      return [
        false,
        'out-of-bounds access',
      ]
    }
  },
  mainE:    a => [
    true,
    a,
  ],
  altE:     a => [
    false,
    a,
  ],
  isMain:   a => a[0],
  isAlt:    a => !a[0],
  mainOr:  (a, b) => a[0] ? a[1] : b,
  altOr:   (a, b) => a[0] ? b : a[1],
  getMain:  a => {
    if (a[0]) {
      return a[1]
    } else {
      throw new Error('runtime error: illegal access')
    }
  },
  getAlt:  a => {
    if (!a[0]) {
      return a[1]
    } else {
      throw new Error('runtime error: illegal access')
    }
  },

  // Hashing opcodes (hashv is recursive, needs to be defined elsewhere)
  hashf,
  hashv,

  // In Node.js the datastore opcodes don't have to be IO opcodes, but in the Rust runtime they do,
  // because of the multithreaded nature of the Rust runtime. Not sure if they should be "fake"
  // async here or not.
  dssetf:  (ns, key, val) => {
    ds[`${ns}:${key}`] = val
  },
  dssetv:  (ns, key, val) => {
    ds[`${ns}:${key}`] = val
  },
  dshas:   (ns, key) => ds.hasOwnProperty(`${ns}:${key}`),
  dsdel:   (ns, key) => {
    const fullKey = `${ns}:${key}`
    const toDelete = ds.hasOwnProperty(fullKey)
    if (toDelete) delete ds[fullKey]
    return toDelete
  },
  dsgetf:  (ns, key) => {
    const fullKey = `${ns}:${key}`
    if (ds.hasOwnProperty(fullKey)) {
      return [ true, ds[`${ns}:${key}`], ]
    } else {
      return [ false, 'namespace-key pair not found', ]
    }
  },
  dsgetv:  (ns, key) => {
    const fullKey = `${ns}:${key}`
    if (ds.hasOwnProperty(fullKey)) {
      return [ true, ds[`${ns}:${key}`], ]
    } else {
      return [ false, 'namespace-key pair not found', ]
    }
  },
  getcs:  () => [false],
  newseq:  (limit) => [0n, limit],
  seqnext: (seq) => {
    if (seq[0] < seq[1]) {
      const out = [true, seq[0]]
      seq[0]++
      return out
    } else {
      return [false, 'error: sequence out-of-bounds']
    }
  },
  seqeach: async (seq, func) => {
    while (seq[0] < seq[1]) {
      await func(seq[0])
      seq[0]++
    }
  },
  seqwhile:async (seq, condFn, bodyFn) => {
    while (seq[0] < seq[1] && await condFn()) {
      await bodyFn()
      seq[0]++
    }
  },
  seqdo:   async (seq, bodyFn) => {
    let ok = true
    do {
      ok = await bodyFn()
      seq[0]++
    } while (seq[0] < seq[1] && ok)
  },
  selfrec: async (self, arg) => {
    const [seq, recurseFn] = self
    if (seq[0] < seq[1]) {
      seq[0]++
      return recurseFn(self, arg)
    } else {
      return [false, 'error: sequence out-of-bounds']
    }
  },
  seqrec: (seq, recurseFn) => [seq, recurseFn],

  // IO opcodes
  httpreq:  async req => {
    const [ method, url, headers, body, ] = req
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body.length > 0 ? body : undefined,
      });
      const rstatus = response.status
      const rheaders = [...response.headers.entries()].map(kv => [kv[0] + '', kv[1] + ''])
      const rbody = await response.text()
      return [ true, [ rstatus, rheaders, rbody, 0n ] ]
    } catch (e) {
      return [ false, e.toString() ]
    }
  },
  httplsn:  async () => {
    const server = http.createServer((req, res) => {
      const connId = Number(hashf(Math.random().toString()))
      httpConns[connId] = {
        req,
        res,
      }
      let body = ''
      req.on('data', d => {
        body += d
      })
      req.on('end', () => {
        e.emit('__conn', [
          req.method,
          req.url,
          Object.entries(req.headers),
          body,
          connId,
        ])
      })
    })
    const listenResult = await new Promise(resolve => {
      server.on('error', e => resolve(e))
      server.listen({
        port: 8000,
      }, () => resolve(true))
    })
    if (listenResult === true) {
      console.log("HTTP server listening on port 8000")
    } else {
      console.error(`HTTP server failed to listen to port 8000: ${listenResult}`)
    }
  },
  httpsend: async (ires) => {
    const [ status, headers, body, connId, ] = ires
    const conn = httpConns[connId]
    if (!conn) return [ false, 'connection not found', ]
    delete httpConns[connId]
    return new Promise(resolve => {
      conn.res.on('close', () => resolve([ false, 'client hangup', ]))
      conn.res
        .writeHead(Number(status), headers.reduce((acc, kv) => {
          acc[kv[0]] = kv[1]
          return acc
        }, {}))
        .end(body, () => resolve([ true, 'ok', ]))
    })
  },
  waitop:   async (a) => await new Promise(resolve => setTimeout(resolve, Number(a))),
  syncop:   async (f, a) => await f(a),
  execop:   async (cmd) => {
    try {
      const res = await exec(cmd)
      const { stdout, stderr } = res
      return [ 0, stdout, stderr ]
    } catch (e) {
      return [ e.signal, e.stdout, e.stderr ]
    }
  },
  tcplsn: async () => {
    const server = net.createServer((c) => {
      // To allow the `tcpConn` event to set up anything it needs
      c.pause()
      const connId = Number(hashf(Math.random().toString()))
      const context = [connId, undefined, {
        c,
        dataArr: [],
        state: 'paused',
      }]
      tcpConns[connId] = context
      c.on('data', (buf) => {
        context[2].dataArr.push(buf)
        e.emit('chunk', context)
      })
      c.on('error', () => context[2].state = 'error')
      c.on('timeout', () => {
        context[2].state = 'timeout'
        c.end() // Node.js doesn't automatically do this on timeout for some reason?
      })
      c.on('close', () => {
        if (context[2].state === 'open') context[2].state = 'closed'
        e.emit('tcpClose', context)
        delete tcpConns[connId]
      })
      e.emit('tcpConn', connId)
    })
    const listenResult = await new Promise(resolve => {
      server.on('error', e => resolve(e))
      server.listen({
        port: 8000,
      }, () => resolve(true))
    })
    if (listenResult === true) {
      console.log("TCP server listening on port 8000")
    } else {
      console.error(`TCP server failed to listen on port 8000: ${listenResult}`)
    }
  },
  tcptun: async (port) => {
    const server = net.createServer((c) => {
      // To set up the connection to the server to forward this data to.
      c.pause();
      const t = net.createConnection({ port, }, () => {
        c.resume();
      });
      c.on('data', (data) => t.write(data));
      t.on('data', (data) => c.write(data));
      c.on('end', () => t.end());
      t.on('end', () => c.end());
    });
    return await new Promise((resolve) => {
      server.on('error', e => resolve(e));
      server.listen({
        port: 8000,
      }, () => resolve(true));
    });
  },
  tcpconn: async (host, port) => {
    return new Promise(resolve => {
      const c = net.createConnection(port, host, () => {
        const connId = Number(hashf(Math.random().toString()))
        const context = [connId, undefined, {
          connId,
          c,
          dataArr: [],
          state: 'paused',
        }]
        tcpConns[connId] = context
        c.on('data', (buf) => {
          context[2].dataArr.push(buf)
          e.emit('chunk', context)
        })
        c.on('error', () => context[2].state = 'error')
        c.on('timeout', () => {
          context[2].state = 'timeout'
          c.end() // Node.js doesn't automatically do this on timeout for some reason
        })
        c.on('close', () => {
          if (context[2].state === 'open') context[2].state = 'closed'
          e.emit('tcpClose', context)
          delete tcpConns[connId]
        })
        resolve(connId)
      })
      // To allow the setup of everything needed
      c.pause()
    })
  },
  tcpAddC: (connId, context) => {
    tcpConns[connId][1] = context
    return connId
  },
  tcpReady: (connId) => {
    const channel = tcpConns[connId]
    if (!channel) return connId
    channel[2].state = 'open'
    channel[2].c.resume()
    return connId
  },
  tcpRead: (connId) => {
    const channel = tcpConns[connId]
    if (!channel) return new Buffer()
    const chunk = channel[2].dataArr.shift()
    return chunk
  },
  tcpWrite: (connId, chunk) => {
    const channel = tcpConns[connId]
    if (!channel) return connId
    channel[2].c.write(chunk)
    return connId
  },
  tcpTerm: (connId) => {
    const channel = tcpConns[connId]
    if (!channel) return undefined
    channel[2].c.end()
  },

  // "Special" opcodes
  stdoutp:  out => process.stdout.write(out),
  stderrp:  err => process.stderr.write(err),
  exitop:   code => process.exit(parseInt(code.toString())),

  // Event bookkeeping
  emit:    (name, payload) => e.emit(name, payload),
  on:      (name, cb) => e.on(name, cb),
  emitter:  e,
}

module.exports.asyncopcodes = Object.keys(module.exports).filter(k => module.exports[k].constructor.name === 'AsyncFunction')

}).call(this,require('_process'),require("buffer").Buffer)
},{"_process":38,"buffer":28,"child_process":26,"cross-fetch/polyfill":30,"events":34,"http":43,"net":26,"util":68,"xxhashjs":80}],"alan-runtime":[function(require,module,exports){
const r = require('alan-js-runtime')

// Redefined stdoutp and exitop to work in the browser
module.exports = {
  ...r,
  stdoutp: (...args) => console.log(...args), // Lazy binding to replace `console.log` at will
  stderrp: (...args) => console.error(...args), // Lazy binding to replace `console.error` at will
  exitop: () => {
    r.emitter.removeAllListeners()
  }, // Clean up the event emitter, later we'll want a hook into the playground to show this
}

},{"alan-js-runtime":"alan-js-runtime"}]},{},[]);

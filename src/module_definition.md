#### Definition

Modules are defined by simply creating an `alan` source file. The name of the module is simply the name of the file minus the extension, unless the file is named `index.ln` in which case the name of the module is it's parent directory for anything referencing it. (This allows a former `something.ln` module to become `something/index.ln` and have a companion `something/submodule.ln` if it grows too big but should still be thought of as a singular unit.)


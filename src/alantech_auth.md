### @alantech/auth***

A generic authentication and authorization library. It's a bit opinionated to have one, but so many projects need it it's probably a good idea to provide a bit of opinion here. The question is do we mimic the POSIX model, OpenLDAP/ActiveDirectory, etc with a Role-Based Access Control https://en.wikipedia.org/wiki/Role-based_access_control or do we go extra opinionated and go with an Attribute-Based Access Control https://en.wikipedia.org/wiki/Attribute-based_access_control (which I personally like, but the only examples of its implementation is a weird XML standard, the US Government, and as a special mode in Windows Server 2012).


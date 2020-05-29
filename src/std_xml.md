### @std/xml***

While much less relevant nowadays, being able to parse XML is useful, and could *potentially* be used as the support structure for HTML parse and generation (but there was only a brief window where making HTML conformant to the XML spec was considered, and both early and modern HTML are not strictly so, meaning it might not be useful).

A big question is whether to include any support for the various XML validation standards (DTD, RelaxNG, etc). There were 4 major ones as I recall and I don't think a single one actually won out, but I do think the most primitive DTD ended up with the greatest share, when validation was used at all.


### @std/zlib***

If we're generating custom HTML and CSS data, we probably want a way to compress it in the industry standard zlib/gzip format. We probably also don't want anyone implementing that in Alan itself, as the algorithm likely has looping, so providing a built-in way to compress and decompress this data is required.


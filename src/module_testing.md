#### Testing and Mocking

Testing is a very important part of any significant project. I believe the Perl community's culture of testing allowed the language to survive in mainstream usage longer than if it hadn't, as the rigorous testing many libraries had kept them manageable in the face of a language that didn't really care about that. Other languages adopted the techniques pioneered there, among them Java, which teaches another lesson.

Perl and other dynamic languages were able to make testing "mocks" of real code in order to better unit test the pieces separately that they behaved correctly in the face of uncommon results (like particular failure cases). But Java, being typed and static, had a very hard time tackling this issue, and reflection (and [sometimes direct byte-code manipulation!](https://stackoverflow.com/a/2993641)) was necessary to get this working, warping the language and pushing for difficult-to-implement esoteric features.

Further, there are often third-party dependencies that are only useful when running your test suite but are not useful when running your code directly. For this reasons, test dependencies are placed in a `test/dependencies` subdirectory and all test code is expected to live in the `test` directory. If you wish to mock code from the primary path, simply define a mock in the `test/modules` directory to mock it for your entire test suite, or rename a particular test from `test/some_test.ln` to `test/some_test/index.ln` and place the test-specific mock into `test/some_test/modules/special_mock.ln` instead.

Simply from the dependency resolution system, isolated test dependencies and mocks are possible without reflection or run-time manipulation of the compiled code.


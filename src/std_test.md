### @std/test*

Code for assertions and defining tests goes here. Need to decide on several conventions -- should it be "spec" files co-habiting with the source code, or in a separate "test" tree? All of my assumptions so far have been on the latter, as the mock pattern possible via the dependency importing depends on it.

Beyond that, the structure of the tests themselves are next. Assertions should be clearly declared, but should it be simple unit-test style list-of-functions-to-execute with basic assertion calls, or BDD-style "describe-it-should" style with "english-looking" assertion statements?


### File structure

Every `alan` file is made up of two parts, the `imports` and `body`. In `alan` all imports must be declared at the beginning of the file, and once anything else is declared `imports` are no longer allowed.

The `body` is simply everything else that can be declared in the file: `types`, `constants`, `functions`, `operators`, `events`, and `event handlers`. Of these everything but `event handlers` can be `exports` that can be used by other modules, even things simply imported from another module. These two levels of "visibility" in the file are part of an implied structure: scope.


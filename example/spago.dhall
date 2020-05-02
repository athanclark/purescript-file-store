{-
Welcome to a Spago project!
You can edit this file as you like.
-}
{ name = "example"
, dependencies = [ "prelude", "file-store" ]
, packages = ./packages.dhall
, sources = [ "src/**/*.purs" ]
}

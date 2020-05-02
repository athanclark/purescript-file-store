{-
Welcome to a Spago project!
You can edit this file as you like.
-}
{ name = "file-store"
, dependencies =
  [ "aff"
  , "arraybuffer"
  , "arraybuffer-types"
  , "b64"
  , "console"
  , "effect"
  , "prelude"
  , "promises"
  , "psci-support"
  , "web-html"
  ]
, packages = ./packages.dhall
, sources = [ "src/**/*.purs", "test/**/*.purs" ]
}

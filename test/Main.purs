module Test.Main where

import Web.File.Store (getFile, fileToArrayBuffer, makeBase64Href)

import Prelude
import Effect (Effect)
import Effect.Console (log)

main :: Effect Unit
main = do
  log "You should add some tests."

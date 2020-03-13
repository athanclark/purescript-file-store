module Main (main, exportFileBase64, exportFileURL, importFile) where

import Web.File.Store (getFile, fileToArrayBuffer, makeBase64Href, arrayBufferToBlob)
import Web.File.Url (createObjectURL)

import Prelude
import Data.Maybe (Maybe (..))
import Data.Either (Either (..))
import Data.ArrayBuffer.Types (ArrayBuffer)
import Data.Function.Uncurried (Fn1, mkFn1)
import Data.MediaType (MediaType)
import Effect (Effect)
import Effect.Console (log)
import Effect.Uncurried (EffectFn1, runEffectFn1, EffectFn2, mkEffectFn2)
import Effect.Exception (throw)
import Effect.Promise (Promise, promise)
import Effect.Promise.Unsafe (undefer, class Deferred)
import Effect.Aff (runAff_)

main :: Effect Unit
main = do
  log "Hello sailor!"
  runEffectFn1 addToWindow {exportFileBase64, exportFileURL, importFile}

foreign import addToWindow :: EffectFn1
                              { exportFileBase64 :: EffectFn2 MediaType ArrayBuffer String
                              , exportFileURL :: EffectFn2 MediaType ArrayBuffer String
                              , importFile :: Fn1 String (Promise ArrayBuffer)
                              } Unit


exportFileBase64 :: EffectFn2 MediaType ArrayBuffer String
exportFileBase64 = mkEffectFn2 makeBase64Href

exportFileURL :: EffectFn2 MediaType ArrayBuffer String
exportFileURL = mkEffectFn2 (\media -> createObjectURL <<< arrayBufferToBlob media)

importFile :: Fn1 String (Promise ArrayBuffer)
importFile = mkFn1 \id ->
  let go :: Deferred => Promise ArrayBuffer
      go = promise \ok err -> do
        mFile <- getFile id
        case mFile of
          Nothing -> throw $ "Can't find element id " <> show id
          Just file ->
            let resolve eErr = case eErr of
                  Left e -> err e
                  Right x -> ok x
            in  runAff_ resolve (fileToArrayBuffer file)
  in  undefer go

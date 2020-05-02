module Web.File.Store where

import Prelude
import Data.Maybe (Maybe)
import Data.ArrayBuffer.Types (ArrayBuffer)
import Data.MediaType (MediaType (..))
import Data.ArrayBuffer.Typed (whole) as TA
import Data.Binary.Base64 (encodeUrl)
import Effect (Effect)
import Effect.Aff (Aff)
import Effect.Class (liftEffect)
import Web.DOM (Element)
import Web.DOM.Document (toNonElementParentNode)
import Web.DOM.NonElementParentNode (getElementById)
import Web.File.Blob (Blob, fromArray)
import Web.File.File (File, toBlob)
import Web.File.FileList (item)
import Web.HTML (window)
import Web.HTML.Window (document)
import Web.HTML.HTMLDocument (toDocument)
import Unsafe.Coerce (unsafeCoerce)
import Stream.Response (newResponse, getArrayBuffer)



getFile :: String -- ^ DOM id of `<input type="file">`
        -> Effect (Maybe File)
getFile id = do
  doc <- (toNonElementParentNode <<< toDocument) <$> (window >>= document)
  let go :: Element -> Maybe File
      go el = item 0 (unsafeCoerce el).files
  (flip bind go) <$> getElementById id doc


fileToArrayBuffer :: File -> Aff ArrayBuffer
fileToArrayBuffer file = do
  let blob = toBlob file
  resp <- liftEffect (newResponse blob)
  getArrayBuffer resp


arrayBufferToBlob :: MediaType -> ArrayBuffer -> Blob
arrayBufferToBlob media buffer =
  fromArray [unsafeCoerce buffer] media


makeBase64Href :: MediaType -> ArrayBuffer -> Effect String
makeBase64Href (MediaType media) buffer = do
  value <- encodeUrl <$> TA.whole buffer
  pure ("data:" <> media <> ";base64," <> value)

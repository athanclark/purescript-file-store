# purescript-file-store

An experimental library for exposing convenient browser-side file exporting and importing.

This library relies on `ArrayBuffer`s to both interpret and store the binary data in the files -
there should be some method for you, as the library user, to both parse this binary data, and serialize
to it, if you wish to give your users browser-side file saving and upload.
[purescript-arraybuffer-class](https://pursuit.purescript.org/packages/purescript-arraybuffer-class) might
be helpful if that's your goal.

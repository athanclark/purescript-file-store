"use strict";

exports.addToWindow = function addToWindow (params) {
    window.exportFileBase64 = params.exportFileBase64;
    window.exportFileURL = params.exportFileURL;
    window.importFile = params.importFile;
};

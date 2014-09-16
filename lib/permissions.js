// check that the userId specified owns the documents
ownsDocument = function(userId, doc) {
    return doc && doc.owner === userId;
};

writeAccess = function(userId, doc) {
    var accessReport = doc && ( ownsDocument(userId, doc) || doc.allowed.indexOf(userId) > -1 );
    return true;
};
/**
 * Schema form service.
 * This service is not that useful outside of schema form directive
 * but makes the code more testable.
 */
angular.module('schemaForm').factory('refResolver',
['$http','$q', function($http,$q) {
    var resolveMissingUris=function(config) {
      config = config || {};
      config.uriTranslator=config.uriTranslator || function(u) { return u;};
      var missingUris=tv4.getMissingUris();
      console.log("Missing uris: ",missingUris);
      if(!missingUris.length) {
        return $q.when();
      }
      return $q.all(missingUris.map(function(uri) {
        var modified=config.uriTranslator(uri);
//        console.log("Translating ",uri," into ",modified);
        return $http.get(modified).then(function(refSchema) {
          tv4.addSchema(refSchema.data.id,refSchema.data);
        }).catch(function(err) {
          tv4.addSchema(uri,{
            "title": "Unknown reference: " + uri,
            "description": err.message,
            "type": "string",
            "readOnly": true
          });
        });
      })).then(resolveMissingUris);
    };
    return resolveMissingUris;
}]);
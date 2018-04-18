// Cloud code common function
// geoLookup
Parse.Cloud.define('clientip', function(request, response) {
  var clientIP = request.headers['X-Parse-Real-Ip'];
  response.success(clientIP);
});

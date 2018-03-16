"use strict";
/* global Parse */

// Cloud code status check
Parse.Cloud.define("cloudcode_status", function(request, response) {
  response.success("👌");
});

// Cloud functions
require('./functions/index');

// Parse Jobs
// require('./jobs');

// Class triggers (beforeSave & afterSave)
require('./triggers/index');

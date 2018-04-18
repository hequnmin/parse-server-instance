// Example express application adding the parse-server module to expose Parse
// compatible API routes.

const express = require("express");
const ParseServer = require('parse-server').ParseServer;
const path = require('path');

const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/parse';   // Mongodb

const appId = process.env.APP_ID || 'bec';
const appName = process.env.APP_NAME || 'Becheer';      // 本应用名称
const masterKey = process.env.MASTER_KEY || 'bec';      // 主密匙. 保密!
const serverURL = process.env.SERVER_URL || 'http://localhost:1337/parse';   // Don't forget to change to https if needed
const cloud = process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/index.js';
const verifyUserEmails = true;                            // 是否开启邮件验证
const publicServerURL = serverURL;                        // 验证邮件链接URL
const emailAdapter = {                                    // 邮件验证适配器
  module: "@parse/simple-mailgun-adapter",        // https://www.mailgun.com，UID:hequnmin@gmail.com
  options: {
    fromAddress: "no-reply@becheer.com",
    domain: "sandbox2f47f9fb0c1b4832a27f7a7e069ff5fb.mailgun.org",
    apiKey: "key-235b37dd69d4eac162215380aac51a22"
  }
};

const FSFilesAdapter = require('@parse/fs-files-adapter');
// const fsAdapter = new FSFilesAdapter({
//   "filesSubDirectory": "my/files/folder" // optional
// });
const fsAdapter = new FSFilesAdapter();

const liveQuery = {
  classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
};
const push = JSON.parse(process.env.PARSE_SERVER_PUSH || "{}");

// if (!databaseUri) {
//   console.log('DATABASE_URI not specified, falling back to localhost.');
// }
console.log('DATABASE_URI :' + databaseUri );

const api = new ParseServer({
  databaseURI: databaseUri,
  cloud: cloud,
  appId: appId,
  appName: appName,
  masterKey: masterKey,
  serverURL: serverURL,
  verifyUserEmails: verifyUserEmails,
  publicServerURL: publicServerURL,
  emailAdapter: emailAdapter,
  liveQuery: liveQuery,
  push: push,
  filesAdapter: fsAdapter
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

const app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Get Client IP
app.use(function(req, res, next) {
  // console.log("headers = " + JSON.stringify(req.headers));// 包含了各种header，包括x-forwarded-for(如果被代理过的话)
  // console.log("x-forwarded-for = " + req.header('x-forwarded-for'));// 各阶段ip的CSV, 最左侧的是原始ip
  // console.log("ips = " + JSON.stringify(req.ips));// 相当于(req.header('x-forwarded-for') || '').split(',')
  // console.log("remoteAddress = " + req.connection.remoteAddress);// 未发生代理时，请求的ip
  // console.log("ip = " + req.ip);// 同req.connection.remoteAddress, 但是格式要好一些
  req.headers['X-Parse-Real-Ip'] = req.header('x-forwarded-for');
  next();
});

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

const port = process.env.PORT || 1337;
const httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
  console.log('parse-server-example running on ' + serverURL + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);

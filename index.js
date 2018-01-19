'use strict';

const express = require('express')
const querystring = require('querystring')
const https = require('https')
const cors = require('cors')
const bodyParser = require('body-parser')

const PORT = 3003
const HOST = '127.0.0.1'
const CLIENT_KEY = process.env.CLIENT_KEY
const CLIENT_SECRET = process.env.CLIENT_SECRET

const app = express();
app.use(cors())
app.use(bodyParser())

const requestToken = (code, responseCallback) => {
  const postData = querystring.stringify({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: 'http://localhost:3002/auth/reddit/confirm'
  })

  const auth2 = "Basic " + new Buffer(CLIENT_KEY+':'+CLIENT_SECRET).toString("base64");

  const options = {
    host: 'www.reddit.com',
    port: 443,
    method: 'POST',
    path: '/api/v1/access_token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length,
      'Authorization': auth2
    }
  };

  let req = https.request(options, function(res) {
    let result = '';
    req.on('error', function(err) {
      console.log('err', err)
    })
    res.on('data', function(chunk) {
      result += chunk
    })
    res.on('end', () => {
      responseCallback(result)
    })
  })

  req.write(postData)
  req.end()

}

app.post('/auth/reddit/token', (req, res) => {
  const code = req.body.code
  console.log(req.body.code)
  requestToken(code, (redditResponse) => {
    console.log('callback', redditResponse)
    res.send(redditResponse)
  })

});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

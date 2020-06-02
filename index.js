/*───────────────────────────────────────────────────────────────────────────**
** Proxy for Discord Webhook Endpoint, GitHub Payload: Self-serv Avatar fix? **
**───────────────────────────────────────────────────────────────────────────*/

PRIVKEY   = 'String: filepath to cert key'
FULLCHAIN = 'String: filepath to certificate'
WEBHOOK_ID  = 'String: The Webhook id'
WEBHOOK_KEY = 'String: The Webhook key'
AVATAR   = 'String: URL for an icon'
USERNAME = 'String: A name for the webhook'

// Intrinsics
const fs = require('fs');
const http = require('http');
const https = require('https');

// Modules
const express = require('express');
const parse = require('body-parser')
const needle = require('needle')

// Globals
const privateKey  = fs.readFileSync(PRIVKEY, 'utf8');
const certificate = fs.readFileSync(FULLCHAIN, 'utf8');
const credentials = {key: privateKey, cert: certificate};
const app = express();


app.use(parse.json())
app.get('/', (req, res) => res.send('Ok Zoomer'))
app.post('/', (req, res) => {
    return doTheThing(req, res)
})

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

const httpPort = 8080
const httpsPort = 8443
httpServer .listen(httpPort,  () => console.log(`Simple relay listening at localhost:${httpPort}`));
httpsServer.listen(httpsPort, () => console.log(`Simple relay listening at localhost:${httpsPort}`));

function doTheThing(req, res) {
    const PAYLOAD = JSON.stringify(Object.assign({}, req.body, {
        // override the default username and avatar of the webhook?
        // https://discord.com/developers/docs/resources/webhook
        'username':   USERNAME,
        'avatar_url': AVATAR
    }))

    const options = {
      headers: {
        'content-length': PAYLOAD.length,
        'content-type': 'application/json',
        'user-agent': 'GitHub-Hookshot/25c8cea',
        'x-github-event':    req.headers['x-github-event'],
        'x-github-delivery': req.headers['x-github-delivery'],
      }
    }

    function webhookURL(id, key, github = true) {
        let url = 'https://';
        url += 'canary.discordapp.com';
        url += '/api/webhooks/';
        url += id;
        url += '/';
        url += key;
        url += github ? '/github' : '';
        return url
    }

    let url = webhookURL(WEBHOOK_ID, WEBHOOK_KEY)
    needle.post(url, PAYLOAD, options)
    res.status(204).end()
}

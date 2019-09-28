const http = require("http");
const querystring = require('querystring');
let tr = null;

module.exports = {
    getContent,
    getContentProxy,
    getArgs
}

function getContentProxy(options, post_data) {
    if (tr === null) {
        tr = require('tor-request');
        tr.setTorAddress('127.0.0.1', 9050);
        tr.TorControlPort.password = 'my_secret_password';
        tr.newTorSession(() => true);

        tr.request('https://api.ipify.org', function (err, res, body) {
            if (!err && res.statusCode == 200) {
                console.log("Your public (through Tor) IP is: " + body);
            }
        });
    }

    return new Promise((resolve, reject) => {
        const reqOptions = { ...options, uri: `http://${options.host}${options.path}` }

        const callback = function (err, response, body) {
            if (err || response.statusCode !== 200) {
                reject(err);
                return;
            }

            resolve({ body, response });
        };

        if (options.method !== 'POST') {
            tr.request(reqOptions, callback);
        } else {
            tr.request.post(reqOptions, callback).form(querystring.parse(post_data));
        }
    });
}

function getContent(options, post_data) {
    return new Promise((resolve, reject) => {
        const request = http.request(options, (response) => {
            if (response.statusCode < 200 || response.statusCode > 299) {
                reject(new Error('Failed to load page, status code: ' + response.statusCode));
            }

            response.setEncoding('utf8');

            const body = [];
            response.on('data', (chunk) => body.push(chunk));
            response.on('end', () => resolve({ body: body.join(''), response }));
        });

        request.on('error', (err) => reject(err));

        if (options.method === 'POST') {
            request.write(post_data);
        }
        request.end();
    });
};

function getArgs() {
    const args = {};
    process.argv
        .slice(2, process.argv.length)
        .forEach(arg => {
            // long arg
            if (arg.slice(0, 2) === '--') {
                const longArg = arg.split('=');
                const longArgFlag = longArg[0].slice(2, longArg[0].length);
                const longArgValue = longArg.length > 1 ? longArg[1] : true;
                args[longArgFlag] = longArgValue;
            }
            // flags
            else if (arg[0] === '-') {
                const flags = arg.slice(1, arg.length).split('');
                flags.forEach(flag => {
                    args[flag] = true;
                });
            }
        });
    return args;
}

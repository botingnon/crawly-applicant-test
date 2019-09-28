const querystring = require('querystring');
const withProxy = require('./util').getArgs()['with-proxy'] || false;
const lib = withProxy ? 'getContentProxy' : 'getContent';
const getContent = require('./util')[lib];

async function work() {
    try {
        const options = {
            host: 'applicant-test.us-east-1.elasticbeanstalk.com',
            path: ''
        };
        const { body:htmlContent, response } = await getContent(options);

        const cookie = response.headers["set-cookie"][0];
        const patternJs = /<script src="(.*)">/g
        const [, jsPath] = patternJs.exec(htmlContent);
    
        let { body:jsContent } = await getContent({...options, path: `/${jsPath}`});
        jsContent = jsContent.split('document.getElementById("token").value').join('TOKEN');
        jsContent = jsContent.split(',document.getElementById("form").submit()').join('');
    
        eval(jsContent);
    
        const patternToken = /<.*input.*token.*value="(.*)".*>/g
        const [, token] = patternToken.exec(htmlContent);
        TOKEN = token;
    
        findAnswer();

        const post_data = querystring.stringify({
            token: TOKEN
        });
    
        const post_options = {
            ...options,
            method: 'POST',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6,it;q=0.5,nb;q=0.4',
                'Content-Length': Buffer.byteLength(post_data),
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookie.replace('; path=/', ''),
                'Host': options.host,
                'Origin': `http://${options.host}`,
                'Pragma': 'no-cache',
                'Referer': `http://${options.host}/`,
                'Upgrade-Insecure-Requests': 1,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36'
            }
        };
    
        const { body:answerContent } = await getContent(post_options, post_data);
        const patternAnswer = /<span id="answer">(\d*)<\/span>/g
        const [, answer] = patternAnswer.exec(answerContent);
    
        console.log(`RESPOSTA: ${answer}`);

        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

work();

import blockies
import web3

const querystring = require('querystring');
const http = require('http');
const https = require('https');
const fs = require('fs');
const child = require('child_process');


exports.handler = (event, context, callback) => {
    console.log(JSON.stringify(event, null, 2));
    const request = event.Records[0].cf.request;
    const protocol = origin.protocol;
    const tmpPath = '/tmp/sourceImage';
    const targetPath = '/tmp/targetImage';
    
    const options = querystring.parse(request.querystring)
    const small = [8, 4]
    const medium = [8, 8]

    const sizeNames = ['small', 'large']
    const sizes = [{'small': small, 'medium': medium}]

    if (options.size not in sizeNames) {
        console.log('Invalid Input');
        context.succeed({
            status: '400',
            statusDescription: 'Invalid Input'
        });
        return;
    }
    const size = options.size
    else {
        const sizeDim = sizes.size
    }

    if (web3.utils.isAddress(request.uri)){
        var icon = blockies.create({
            seed: request.uri,
            size: sizeDim[0],
            scale: sizeDim[1]
        })

        const image = fs.readFileSync(targetPath).toString('base64');

        context.succeed({
            bodyEncoding: 'base64',
            body: icon,
            headers: originHeaders,
            status: '200',
            statusDescription: 'OK'
        });
    } else {
        console.log('Invalid Wallet');
        context.succeed({
            status: '400',
            statusDescription: 'Invalid Wallet'
        });
        return;
    }
}
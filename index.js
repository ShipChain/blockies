var blockies = require('ethereum-blockies');
var Web3 = require('web3');
var Canvas = require('canvas');

const querystring = require('querystring');
const http = require('http');
const https = require('https');
const fs = require('fs');
const child = require('child_process');


exports.handler = function blockies_generator(event, context, callback) {
    console.log(JSON.stringify(event, null, 2));
    const request = event.Records[0].cf.request;
    console.log(request)
    
    const targetPath = '/tmp/targetImage';
    
    const options = querystring.parse(request.querystring);
    const small = [8, 4];
    const medium = [8, 8];

    const sizeNames = ['small', 'large'];
    const sizes = [{'small': small, 'medium': medium}];
    
    if (options.size && !sizeNames.includes(options.size)) {
        console.log('Invalid Input');
        context.succeed({
            status: '400',
            statusDescription: 'Invalid Input'
        });
        return;
    }

    const size = options.size | small;
    const sizeDim = sizes[size];
    const web3 = new Web3();

    if (options.wallet && (web3.utils.isAddress(options.wallet))){
        const canvas = Canvas.createCanvas(50, 50);

        var icon = blockies.render({
            seed: options.wallet,
            size: sizeDim[0],
            scale: sizeDim[1]
        }, canvas);

        var stringIcon = icon.toDataURL().replace(/^data:image\/(png|jpg);base64,/, '');

        context.succeed({
            bodyEncoding: 'text',
            body: stringIcon,
            status: '200',
            statusDescription: 'OK',
            headers: {
                'content-type': [{key:'Content-Type', value: 'image/png'}],
            }
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
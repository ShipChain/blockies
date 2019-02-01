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
    const options = querystring.parse(request.querystring);

    const small = 4;
    const medium = 8;
    const large = 16;
    
    const sizes = {'small': small, 'medium': medium, 'large': large};

    var size = medium;
    
    if (options.size && !(options.size in sizes)) {
        console.log('Invalid Input');
        callback("Error: Invalid size given.");
        return;
    } else if (options.size && (options.size in sizes)) {
        size = sizes[options.size];
    }

    const web3 = new Web3();

    if (!request.uri.includes('.png')) {
        console.log('Invalid ')
        callback("Error: missing png ending for wallet.");
    }

    const wallet = request.uri.substr(1).split('.')[0].toLowerCase();;

    if (web3.utils.isAddress(wallet)){
        const canvas = Canvas.createCanvas(50, 50);

        var icon = blockies.render({
            seed: wallet,
            scale: size
        }, canvas);

        var stringIcon = icon.toDataURL().replace(/^data:image\/(png|jpg);base64,/, '');

        const response = {
            bodyEncoding: 'base64',
            body: stringIcon,
            status: '200',
            statusDescription: 'OK',
            headers: {
                'content-type': [{key:'Content-Type', value: 'image/png'}],
            }
        }
        
        callback(null, response);
    
    } else {
        console.log('Invalid Wallet');
        callback("Error: Invalid wallet address.");
        return;
    }
}
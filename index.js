var blockies = require('ethereum-blockies');
var Web3 = require('web3');
var Canvas = require('canvas');

const querystring = require('querystring');

const small = 4;
const medium = 8;
const large = 16;

exports.handler = function blockies_generator(event, context, callback) {
    console.log(JSON.stringify(event, null, 2));
    const request = event.Records[0].cf.request;    
    const options = querystring.parse(request.querystring);
    
    const sizes = {'small': small, 'medium': medium, 'large': large};

    var size;

    var error_response = {
        status: '400',
        statusDescription: 'Error'
    }

    if (!request.uri.includes('.png')) {
        console.log("Error: request URI must end with '.png'.")
        error_response.statusDescription = "Error: request URI must end with '.png'.";
        callback(null, error_response);
        return;
    }

    const web3 = new Web3();

    // This strips out the appending slash and the .png part of the request URI
    const wallet = request.uri.substr(1).split('.')[0].toLowerCase();;

    if (!web3.utils.isAddress(wallet)){
        console.log('Invalid Wallet');
        error_response.statusDescription = "Error: Invalid wallet address.";
        callback(null, error_response);
        return;
    }

    if (options.size) {
        if (!sizes.hasOwnProperty(options.size)) {
            console.log('Invalid Input');
            error_response.statusDescription = "Error: Invalid size given.";
            callback(null, error_response);
            return;
        }
        size = sizes[options.size];
    } else {
        size = medium;
    }

    const canvas = Canvas.createCanvas(size, size);

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
}
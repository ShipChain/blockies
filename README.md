<p align="center">
  <img src="https://shipchain.io/img/logo.png" alt="ShipChain"/>
</p>

[![License](http://img.shields.io/:license-apache-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)
[![Chat](https://img.shields.io/badge/gitter-ShipChain/lobby-green.svg)](https://gitter.im/ShipChain/Lobby)

# Shipchain Blockies Project

* A service assisting in generating the blockies using an ethereum wallet's address as the seed.
* These blockies use the same standard as the etherscan, keeping a standard blockie per wallet. These can come in 3 different, customizable sizes.

These are can be accessed by using the website blockies.shipchain.io/{{walletAddress}}.png. The size can be customizeable through the querystring.

The blockies are created using AWS' Lambda@Edge and Serverless Framework.


### How to configure and deploy

The settup for the CloudFront, Lambda@Edge and S3 buckets are configured on the serverless.yml file. Included there, are the environment variables for the possible sizes of the blockie. You can deploy this to your AWS account using the command `sls deploy`, and for more in depth detail about the deployment you can use the command `sls deploy -v`.

### How to Access

In order to obtain a blockie based on an ethereum address, you need to make a request to blockies.shipchain.io/{{walletAddress}}.png, replacing {{walletAddress}} with the address of the ethereum wallet you want the blockie for. You can also customize the size of the blockie by adding '?size=(small/medium/large)' to the end of the request.

### How to Run Tests

Make sure that you are compiling and installing using Node version 8.10-8.9999. You can run the test using the command `npm test`.
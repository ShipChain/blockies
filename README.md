<p align="center">
  <img src="https://shipchain.io/img/logo.png" alt="ShipChain"/>
</p>

[![License](http://img.shields.io/:license-apache-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)
[![Chat](https://img.shields.io/badge/gitter-ShipChain/lobby-green.svg)](https://gitter.im/ShipChain/Lobby)

# Shipchain Blockies Project

* A service assisting in generating the blockies using an Ethereum wallet's address as the seed.
* These blockies use the same standard as in the Ethereum ecosystem, keeping a set blockie per wallet allowing quick identification of wallets visually. These can come in 3 different, customizable sizes.

These can be accessed by using the website blockies.shipchain.io/{{walletAddress}}.png. The size is customizeable, with three different sizes, through the querystring.

The blockies are created using AWS' Lambda@Edge and Serverless Framework.


### How to configure and deploy

The setup for the CloudFront, Lambda@Edge and S3 buckets are configured on the serverless.yml file. This You can deploy this to your AWS account using the command `sls deploy`, and for more in depth detail about the deployment you can use the command `sls deploy -v`. When deployed, it will be associated with the AWS account one has granted access to.


#### NOTE

In order to deploy, you must install the proper node modules. This is best done in a docker file in order not to install versions associated with your OS. However, you may need to install it to your computer in order to test it using `npm test` and/or `eslint index`.


### How to Access

In order to obtain a blockie based on an Ethereum address, you need to make a request to blockies.shipchain.io/{{walletAddress}}.png, replacing {{walletAddress}} with the address of the Ethereum wallet you want the blockie for. You can also customize the size of the blockie by adding '?size=(small/medium/large)' to the end of the request. The default size returned is medium.


### How to Run Tests

Make sure that you are compiling and installing using Node version 8.10-8.9999. You can run the test using the command `npm test`. You can also get format information through the command `eslint index`.

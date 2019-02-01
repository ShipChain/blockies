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

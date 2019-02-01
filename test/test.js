const successfulEvent = {
    "Records": [
      {
        "cf": {
          "config": {
            "distributionId": "EXAMPLE"
          },
          "request": {
            "uri": "/0xa49Cbd18721526440A3d6D6A32215b35574dbF6E.png",
            "method": "GET",
            "clientIp": "2001:cdba::3257:9652",
            "headers": {
              "user-agent": [
                {
                  "key": "User-Agent",
                  "value": "test-agent"
                }
              ],
              "host": [
                {
                  "key": "Host",
                  "value": "d123.cf.net"
                }
              ]
            },
            "querystring": "size=small"
          }
        }
      }
    ]
}

const successfulEventMedium = {
"Records": [
    {
    "cf": {
        "config": {
        "distributionId": "EXAMPLE"
        },
        "request": {
        "uri": "/0xa49Cbd18721526440A3d6D6A32215b35574dbF6E.png",
        "method": "GET",
        "clientIp": "2001:cdba::3257:9652",
        "headers": {
            "user-agent": [
            {
                "key": "User-Agent",
                "value": "test-agent"
            }
            ],
            "host": [
            {
                "key": "Host",
                "value": "d123.cf.net"
            }
            ]
        },
        "querystring": "size=medium"
        }
    }
    }
]
}

const failEvent = {
"Records": [
    {
    "cf": {
        "config": {
        "distributionId": "EXAMPLE"
        },
        "request": {
        "uri": "0xa49Cbd18721526440A3d6D6A32215b35574dbF6E.png",
        "method": "GET",
        "clientIp": "2001:cdba::3257:9652",
        "headers": {
            "user-agent": [
            {
                "key": "User-Agent",
                "value": "test-agent"
            }
            ],
            "host": [
            {
                "key": "Host",
                "value": "d123.cf.net"
            }
            ]
        },
        "querystring": "size=small"
        }
    }
    }
]
}

const failEvent2 = {
    "Records": [
        {
        "cf": {
            "config": {
            "distributionId": "EXAMPLE"
            },
            "request": {
            "uri": "0xa49Cbd18721526440A3d6D6A32215b35574dbF6E",
            "method": "GET",
            "clientIp": "2001:cdba::3257:9652",
            "headers": {
                "user-agent": [
                {
                    "key": "User-Agent",
                    "value": "test-agent"
                }
                ],
                "host": [
                {
                    "key": "Host",
                    "value": "d123.cf.net"
                }
                ]
            },
            "querystring": "size=small"
            }
        }
        }
    ]
}

const failEventNonWallet = {
    "Records": [
        {
        "cf": {
            "config": {
            "distributionId": "EXAMPLE"
            },
            "request": {
            "uri": "/NotAWallet.png",
            "method": "GET",
            "clientIp": "2001:cdba::3257:9652",
            "headers": {
                "user-agent": [
                {
                    "key": "User-Agent",
                    "value": "test-agent"
                }
                ],
                "host": [
                {
                    "key": "Host",
                    "value": "d123.cf.net"
                }
                ]
            },
            "querystring": "size=small"
            }
        }
        }
    ]
}

const failEventIncorrectSize = {
"Records": [
    {
    "cf": {
        "config": {
        "distributionId": "EXAMPLE"
        },
        "request": {
        "uri": "/0xa49Cbd18721526440A3d6D6A32215b35574dbF6E.png",
        "method": "GET",
        "clientIp": "2001:cdba::3257:9652",
        "headers": {
            "user-agent": [
            {
                "key": "User-Agent",
                "value": "test-agent"
            }
            ],
            "host": [
            {
                "key": "Host",
                "value": "d123.cf.net"
            }
            ]
        },
        "querystring": "size=FAILURE"
        }
    }
    }
]
}

const assert = require('assert');
const LambdaTester = require('lambda-tester');
const myHandler = require('../index').handler;

describe( 'handler', function() {
    it('test success', function() {
        return LambdaTester( myHandler ).event(successfulEvent).expectSucceed( (result) => {
            assert.equal(result.status, '200');
        });
    });
    it('test success medium', function() {
        return LambdaTester( myHandler ).event(successfulEventMedium).expectSucceed( (result) => {
            assert.equal(result.status, '200')
        });
    });
    it('test fail no appending slash', function() {
        return LambdaTester( myHandler ).event(failEvent).expectSucceed( (result) => {
            assert.equal(result.status, '400')
        });
    });
    it('test fail no trailing .png', function() {
        return LambdaTester( myHandler ).event(failEvent2).expectSucceed( (result) => {
            assert.equal(result.status, '400')
        });
    });
    it('test fail non wallet supplied', function() {
        return LambdaTester( myHandler ).event(failEventNonWallet).expectSucceed( (result) => {
            assert.equal(result.status, '400')
        });
    });
    it('test fail invalid size name', function() {
        return LambdaTester( myHandler ).event(failEventIncorrectSize).expectSucceed( (result) => {
            assert.equal(result.status, '400')
        });
    });
});
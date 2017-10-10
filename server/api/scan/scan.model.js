'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var ScanSchema = new mongoose.Schema({
  scanDate: {
    type: Date,
    required: true
  },
  responseTime: {
    type: Number,
    min: [0, 'Can not be less 0'],
    required: true
  },
  url:{
    type: String,
    required: true,
    unique: true
  },
  statistics:{
    isBlacklisted:{
      type: Boolean,
      required: true
    },
    urlScore:{
      type: Number,
      min: [0, 'Can not be less 0'],
      required: true
    },
    totalRulesScore:{
      type: Number,
      min: [0, 'Can not be less 0'],
      required: true
    },
    finalScore:{
      type: Number,
      min: [0, 'Can not be less 0'],
      max: [100, 'Can not be more 100'],
      required: true
    },
    urlOfAnchors: {
      percentage: {
        type: Number,
        min: [0, 'Can not be less than 0 %'],
        max: [100, 'Can not be more than 100 %'],
        required: true
      },
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    requestUrls: {
      percentage: {
        type: Number,
        min: [0, 'Can not be less than 0 %'],
        max: [100, 'Can not be more than 100 %'],
        required: true
      },
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    linksInTags: {
      percentage: {
        type: Number,
        min: [0, 'Can not be less than 0 %'],
        max: [100, 'Can not be more than 100 %'],
        required: true
      },
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    sfh: {
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    iframe: {
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    tinyURL: {
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    atSymbol: {
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    hasPrefixOrSufix: {
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    isIPAddress: {
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    keywordDomainReport: {
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    ssl: {
      duration: {
        type: Number,
        min: [0, 'Can not be less than 0 %'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        }
      },
      expiresIn: {
        type: Number,
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        }
      },
      isTrusted: Boolean,
      completeCertChain: Boolean,
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    subdomains: {
      count: {
        type: Number,
        min: [0, 'Can not be less than 0 %'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      },
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    urlLenght: {
      count: {
        type: Number,
        min: [0, 'Can not be less than 0 %'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      },
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    mozRankURL: {
      count: {
        type: Number,
        min: [0, 'Can not be less than 0 %'],
        max: [10, 'Can not be more 10'],
        required: true
      },
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    pageAuthority: {
      count: {
        type: Number,
        min: [1, 'Can not be less than 1 %'],
        max: [100, 'Can not be more 100'],
        required: true
      },
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    domainAuthority: {
      count: {
        type: Number,
        min: [1, 'Can not be less than 1 %'],
        max: [100, 'Can not be more 100'],
        required: true
      },
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    externalLinks: {
      count: {
        type: Number,
        min: [0, 'Can not be less than 0 %'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      },
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    myWOT: {
      count: {
        type: Number,
        min: [-2, 'Can not be less than -2 %'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      },
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    websiteTrafficAlexa: {
      count: {
        type: Number,
        min: [-2, 'Can not be less than -2 %'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      },
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    ageOfDomain: {
      count: {
        type: Number,
        min: [-2, 'Can not be less than -2 %'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      },
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    domainRegistrationLength: {
      count: {
        type: Number,
        min: [-2, 'Can not be less than -2 %'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      },
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    },
    inputFields: {
      numOfTextFields: {
        type: Number,
        min: [0, 'Can not be less than 0 %'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      },
      numOfPasswordFields: {
        type: Number,
        min: [0, 'Can not be less than 0 %'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      },
      value: {
        type: Number,
        min: [-1, 'Can not be less -1'],
        max: [1, 'Can not be more 1'],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        },
        required: true
      }
    }
  }
});

export default mongoose.model('Scan', ScanSchema);

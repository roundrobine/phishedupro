'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
import {Schema} from 'mongoose';
var mongoosePaginate = require('mongoose-paginate');

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
  statistics:{
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
      },
      certType:String
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
      rank: {
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
      days: {
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
      days: {
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
  },
  googleBlackList: Schema.Types.Mixed,
  crawlerResults: Schema.Types.Mixed,
  unshortUrl: Schema.Types.Mixed,
  parsedUrl: Schema.Types.Mixed,
  urlStatisitcs: Schema.Types.Mixed,
  alexa: Schema.Types.Mixed,
  whoisRecord: {
    expiresInDays:{
      type: Number,
      min: [-2, 'Can not be less than -2'],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      },
    },
    domainAgeDays:{
      type: Number,
      min: [-2, 'Can not be less than -2'],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      },
    },
    lookupDate:{
      type: Date,
      required: true
    },
    expiresDate:{
      type: Date,
    },
    updatedDate:{
      type: Date,
    },
    createdDate:{
      type: Date,
    }
  },
  sslCertificate: {
    validFrom:Date,
    validTo:Date,
    issuer: String,
    expiresIn : Number,
    certificateDuration : Number,
    isRevoked : Boolean,
    completeCertChain : Boolean,
    certType: String,
    trustedCA: Boolean,
    existInSANEntries : Boolean,
    san_entries: [String]
  },
  mozscape: Schema.Types.Mixed,
  myWOT: Schema.Types.Mixed,
  target: {
    type: Number,
    min: [-1, 'Can not be less -1'],
    max: [1, 'Can not be more 1'],
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    }
  },
  owner: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  active:{
    type:Boolean,
    default:true
  }
});

ScanSchema.plugin(mongoosePaginate);

export default mongoose.model('Scan', ScanSchema);

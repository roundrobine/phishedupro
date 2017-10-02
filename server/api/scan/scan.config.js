'use strict';

// Scan module specific configuration
// ==================================

const MY_WOT = {
  TRUSTWORTHINESS: "0",
  CHILD_SAFETY: "4",
  CATEGORIES: "categories",
  BLACKLISTS: "blacklists",
  REPUTATION: {
    EXCELLENT: {
      NAME: "Excellent",
      VALUE: 80
    },
    GOOD: {
      NAME: "Good",
      VALUE: 60
    },
    UNSATISFACTORY: {
      NAME: "Unsatisfactory",
      VALUE: 40
    },
    POOR: {
      NAME: "Poor",
      VALUE: 20
    },
    VERY_POOR: {
      NAME: "Very poor",
      VALUE: 0
    },
    UNKNOWN: {
      NAME: "Unknown",
      VALUE: -2
    }
  },
  CATEGORY:{
    C_101:{
      DESCRIPTION: "Malware or viruses",
      VALUE: "101"
    },
    C_102:{
      DESCRIPTION: "Poor customer experience",
      VALUE: "102"
    },
    C_103:{
      DESCRIPTION: "Phishing",
      VALUE: "103"
    },
    C_104:{
      DESCRIPTION: "Scam",
      VALUE: "104"
    },
    C_105:{
      DESCRIPTION: "Potentially illegal",
      VALUE: "105"
    },
    C_201:{
      DESCRIPTION: "Misleading claims or unethical",
      VALUE: "201"
    },
    C_202:{
      DESCRIPTION: "Privacy risks",
      VALUE: "202"
    },
    C_203:{
      DESCRIPTION: "Suspicious",
      VALUE: "203"
    },
    C_204:{
      DESCRIPTION: "Hate, discrimination",
      VALUE: "204"
    },
    C_205:{
      DESCRIPTION: "Spam",
      VALUE: "205"
    },
    C_206:{
      DESCRIPTION: "Potentially unwanted programs",
      VALUE: "206"
    },
    C_207:{
      DESCRIPTION: "Ads / pop-ups",
      VALUE: "207"
    },
    C_301:{
      DESCRIPTION: "Online tracking",
      VALUE: "301"
    },
    C_302:{
      DESCRIPTION: "Alternative or controversial medicine",
      VALUE: "302"
    },
    C_303:{
      DESCRIPTION: "Opinions, religion, politics",
      VALUE: "303"
    },
    C_304:{
      DESCRIPTION: "Other",
      VALUE: "304"
    },
    C_501:{
      DESCRIPTION: "Good site",
      VALUE: "501"
    },
    C_401:{
      DESCRIPTION: "Adult content",
      VALUE: "401"
    },
    C_402:{
      DESCRIPTION: "Incidental nudity",
      VALUE: "402"
    },
    C_403:{
      DESCRIPTION: "Gruesome or shocking",
      VALUE: "403"
    },
    C_404:{
      DESCRIPTION: "Site for kids",
      VALUE: "404"
    }
  },
  BLACKLIST_TYPE:{
    MALWARE:{
      NAME: "malware",
      DESCRIPTION: "Site is blacklisted for hosting malware."
    },
    PHISHING:{
      NAME: "phishing",
      DESCRIPTION: "Site is blacklisted for hosting a phishing page."
    },
    SCAM:{
      NAME: "scam",
      DESCRIPTION: "Site is blacklisted for hosting a scam (e.g. a rogue pharmacy)."
    },
    SPAM:{
      NAME: "spam",
      DESCRIPTION: "Site is blacklisted for sending spam or being advertised in spam."
    }
  }

};

const MOZCAPE = {
  ut:{
    name: "title",
    description:"The title of the page, if available",
    bit_flag: 1
  },
  uu:{
    name: "canonicalURL",
    description:"The canonical form of the URL",
    bit_flag: 4
  },
  ueid:{
    name: "externalEquityLinks",
    description:"The number of external equity links to the URL",
    bit_flag: 32
  },
  uid:{
    name: "links",
    description:"The number of links (equity or nonequity or not, internal or external) to the URL",
    bit_flag: 2048
  },
  umrp:{
    name: "mozRankURLNormalized",
    description:"The MozRank of the URL, in the normalized 10-point score (umrp)",
    bit_flag: 16384
  },
  umrr:{
    name: "mozRankURLRaw",
    description:"The MozRank of the URL, in the raw score (umrr)",
    bit_flag: 16384
  },
  fmrp:{
    name: "mozRankSubdomainNormalized",
    description:"The MozRank of the URL's subdomain, in the normalized 10-point score (fmrp)",
    bit_flag: 32768
  },
  fmrr:{
    name: "mozRankSubdomainRaw",
    description:"The MozRank of the URL's subdomain, in the raw score (fmrr)",
    bit_flag: 32768
  },
  us:{
    name: "httpStatusCode",
    description:"The HTTP status code recorded by Mozscape for this URL, if available",
    bit_flag: 536870912
  },
  upa:{
    name: "pageAuthority",
    description:"A normalized 100-point score representing the likelihood of a page to rank well in search engine results",
    bit_flag: 34359738368
  },
  pda:{
    name: "domainAuthority",
    description:"A normalized 100-point score representing the likelihood of a domain to rank well in search engine results",
    bit_flag: 68719476736
  },
  ulc:{
    name: "timeLastCrawled",
    description:"The time and date on which Mozscape last crawled the URL, returned in Unix epoch format",
    bit_flag: 144115188075855872
  }
};


const TOP_PHISHING_DOMAINS = [
  "esy.es",
  "hol.es",
  "000webhostapp.com",
  "for-our.info",
  "bit.ly",
  "16mb.com",
  "for-our.info",
  "beget.tech",
  "blogspot.com",
  "weebly.com",
  "raymannag.ch",
  "96.lt",
  "totalsolution.com.br",
  "sellercancelordernotification.com",
  "kloshpro.com",
  "webcindario.com",
  "manageaccount-disputepaymentebay-paymentresolve.com",
  "myjino.ru",
  "tripod.com",
  "u-telcom.net",
  "clan.su",
  "my1.ru",
  "w-reia.com",
  "pe.hu",
  "ucoz.pl",
]

const TOP_PHISHING_IP_ADDRESSES = [
  "146.112.61.108",
  "31.170.160.61",
  "67.199.248.11",
  "67.199.248.10",
  "69.50.209.78",
  "192.254.172.78",
  "216.58.193.65",
  "23.234.229.68",
  "173.212.223.160",
  "60.249.179.122",
  "200.219.245.41",
  "50.31.138.222",
  "200.219.245.53",
  "200.219.245.194",
  "213.174.157.151",
  "209.202.252.50",
  "95.110.230.232"
]

const TOP_PHISHING_KEYWORDS = [
  "paypal",
  "facebook",
  "google",
  "microsoft",
  "jpmorganchase",
  "apple",
  "bcb",
  "dropbox",
  "yahoo",
  "amazon",
  "santander",
  "aol",
  "irs",
  "anz"
]

const WHITELISTED_DOMAINS = [
  "paypal.com",
  "facebook.com",
  "google.com",
  "microsoft.com",
  "jpmorganchase.com",
  "apple.com",
  "bbamericas.com",
  "bcb.gov.br",
  "amazon.com",
  "dropbox.com",
  "yahoo.com",
  "santanderbank.com",
  "santander.co.uk",
  "aol.com",
  "irs.gov",
  "anz.com.au"
]

const PHISHING_CLASS = {
  phishing: -1,
  suspicious: 0,
  legitimate: 1
}


/*const RULE_CODES = {
  UIPA: "UIPA",
  LUHSP: "LUHSP",
  TINYURL: "TINYURL",
  UHAS: "UHAS",
  APSTD: "APSTD",
  SDMSD: "SDMSD",
  HTTPS: "HTTPS",
  DRL: "DRL",
  RURL: "RURL",
  URLA: "URLA",
  LISALT: "LISALT",
  SFH: "SFH",
  IFR: "IFR",
  UIF: "UIF",
  AOD: "AOD",
  WTAR: "WTAR",
  PR: "PR",
  PA: "PA",
  DA: "DA",
  NLPP: "NLPP",
  SRBF: "SRBF",
  WOT: "WOT"
}*/


const RULE_CODES = {
  urlOfAnchors: "urlOfAnchors",
  requestUrls: "requestUrls",
  linksInTags: "linksInTags",
  sfh: "sfh",
  iframe: "iframe",
  inputFields: "inputFields",
  tinyURL: "tinyURL",
  atSymbol: "atSymbol",
  hasPrefixOrSufix: "hasPrefixOrSufix",
  subdomains: "subdomains",
  isIPAddress: "isIPAddress",
  urlLenght: "urlLenght",
  keywordDomainReport: "keywordDomainReport",
  websiteTrafficAlexa: "websiteTrafficAlexa",
  ageOfDomain: "ageOfDomain",
  domainRegistrationLength: "domainRegistrationLength",
  ssl: "ssl",
  mozRankURL: "mozRankURL",
  pageAuthority: "pageAuthority",
  domainAuthority: "domainAuthority",
  externalLinks: "externalLinks",
  myWOT: "myWOT"
}

module.exports = {
  MY_WOT: MY_WOT,
  MOZCAPE: MOZCAPE,
  TOP_PHISHING_DOMAINS: TOP_PHISHING_DOMAINS,
  TOP_PHISHING_IP_ADDRESSES: TOP_PHISHING_IP_ADDRESSES,
  TOP_PHISHING_KEYWORDS: TOP_PHISHING_KEYWORDS,
  WHITELISTED_DOMAINS: WHITELISTED_DOMAINS,
  PHISHING_CLASS: PHISHING_CLASS,
  RULE_CODES: RULE_CODES
};

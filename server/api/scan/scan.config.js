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

}





module.exports = {

  // My_WOT Config variable
  MY_WOT: MY_WOT

};

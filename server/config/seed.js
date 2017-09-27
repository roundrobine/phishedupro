/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import User from '../api/user/user.model';
import Rule from '../api/rule/rule.model';

Rule.find({}).removeAsync()
  .then(() => {
    Rule.create({
      name: 'Using the IP Address',
      code: 'UIPA',
      weight: 0.006,
      description: 'If an IP address is used as an alternative of the domain name in the URL, ' +
      'such as “http://125.98.3.123/fake.html”, users can be sure that someone is trying to steal their ' +
      'personal information. Sometimes, the IP address is even transformed into hexadecimal code as shown in ' +
      'the following link “http://0x58.0xCC.0xCA.0x62/2/paypal.ca/index.html”',
      active: true
    }, {
      name: 'Long URL to Hide the Suspicious Part',
      code: 'LUHSP',
      weight: 0.003,
      description: 'Phishers can use long URL to hide the doubtful part in the address bar. For example: ' +
      'http://federmacedoadv.com.br/3f/aze/ab51e2e319e51502f416dbe46b773a5e/?cmd=_home&amp;dispatch=11004d58f5b74f8dc1e7c2e8dd4105e811004d58f5b74f8dc1e7c2e8dd4105e8@phishing.website.html' +
      'To ensure accuracy of our study, we calculated the length of URLs in the dataset and produced an average URL length.' +
      'The results showed that if the length of the URL is greater than or equal 54 characters then the URL classified ' +
      'as phishing. By reviewing our dataset we were able to find 1220 URLs lengths equals to 54 or more which constitute ' +
      '48.8% of the total dataset size.',
      active: true
    }, {
      name: 'Using URL Shortening Services “TinyURL”',
      code: 'TINYURL',
      weight: 0.003,
      description: 'URL shortening is a method on the “World Wide Web” in which a URL may be made considerably smaller' +
      'in length and still lead to the required webpage. This is accomplished by means of an “HTTP Redirect” on a domain' +
      'name that is short, which links to the webpage that has a long URL. For example, the URL “http://portal.hud.ac.uk/”' +
      'can be shortened to “bit.ly/19DXSk4”.',
      active: true
    }, {
      name: 'URL’s having “@” Symbol',
      code: 'UHAS',
      weight: 0.002,
      description: 'Using “@” symbol in the URL leads the browser to ignore everything preceding the “@” symbol ' +
      'and the real address often follows the “@” symbol. ',
      active: true
    }, {
      name: 'Adding Prefix or Suffix Separated by (-) to the Domain',
      code: 'APSTD',
      weight: 0.123,
      description: 'The dash symbol is rarely used in legitimate URLs. Phishers tend to add prefixes or suffixes ' +
      'separated by (-) to the domain name so that users feel that they are dealing with a legitimate webpage. ' +
      'For example http://www.Confirme-paypal.com/',
      active: true
    }, {
      name: 'Sub Domain and Multi Sub Domains',
      code: 'SDMSD',
      weight: 0.109,
      description: 'Let us assume we have the following link: http://www.hud.ac.uk/students/. A domain name might include ' +
      'the country-code top-level domains (ccTLD), which in our example is “uk”. The “ac” part is shorthand for “academic”,' +
      'the combined “ac.uk” is called a second-level domain (SLD) and “hud” is the actual name of the domain. ' +
      'To produce a rule for extracting this feature, we firstly have to omit the (www.) from the URL which is in fact a' +
      'sub domain in itself. Then, we have to remove the (ccTLD) if it exists. Finally, we count the remaining dots. ' +
      'If the number of dots is greater than one, then the URL is classified as “Suspicious” since it has one sub domain.' +
      'However, if the dots are greater than two, it is classified as “Phishing” since it will have multiple sub domains.' +
      'Otherwise, if the URL has no sub domains, we will assign “Legitimate” to the feature. ',
      active: true
    },{
      name: 'HTTPS (Hyper Text Transfer Protocol with Secure Sockets Layer) ',
      code: 'HTTPS',
      weight: 0.499,
      description: 'The existence of HTTPS is very important in giving the impression of website legitimacy, ' +
      'but this is clearly not enough. The authors in (Mohammad, Thabtah and McCluskey 2012), ' +
      '(Mohammad, Thabtah and McCluskey 2013) suggest checking the certificate assigned with HTTPS ' +
      'including the extent of the trust certificate issuer, and the certificate age. ' +
      'Certificate Authorities that are consistently listed among the top trustworthy names include: ' +
      '“GeoTrust, GoDaddy, Network Solutions, Thawte, Comodo, Doster and VeriSign”. ' +
      'Furthermore, by testing out our datasets, we find that the minimum age of a reputable certificate is one year.',
      active: true
    },{
      name: 'Domain Registration Length',
      code: 'DRL',
      weight: 0.036,
      description: 'Based on the fact that a phishing website lives for a short period of time, we believe ' +
      'that trustworthy domains are regularly paid for several years in advance. In our dataset, ' +
      'we find that the longest fraudulent domains have been used for one year only.',
      active: true
    },{
      name: 'Request URL',
      code: 'RURL',
      weight: 0.046,
      description: 'Request URL examines whether the external objects contained within a webpage such as images, videos' +
      'and sounds are loaded from another domain. In legitimate webpages, the webpage address and most of objects' +
      'embedded within the webpage are sharing the same domain',
      active: true
    },{
      name: 'URL of Anchor',
      code: 'URLA',
      weight: 0.047,
      description: 'Given that our investigation covers all angles likely to be used in the webpage source code, ' +
      'we find that it is common for legitimate websites (Script) tags to create a client side script and ' +
      '(Link) tags to retrieve other web resources. ' +
      'It is expected that these tags are linked to the same domain of the webpage.',
      active: true
    },{
      name: 'Links in (Script) and (Link) tags',
      code: 'LISALT',
      weight: 0.123,
      description: 'The dash symbol is rarely used in legitimate URLs. Phishers tend to add prefixes or suffixes ' +
      'separated by (-) to the domain name so that users feel that they are dealing with a legitimate webpage. ' +
      'For example http://www.Confirme-paypal.com/',
      active: true
    },{
      name: 'Server Form Handler (SFH)',
      code: 'SFH',
      weight: 0.037,
      description: 'SFHs that contain an empty string or “about:blank” are considered doubtful because an action should ' +
      'be taken upon the submitted information. In addition, if the domain name in SFHs is different from the domain name' +
      'of the webpage, this reveals that the webpage is suspicious because the submitted information ' +
      'is rarely handled by external domains.',
      active: true
    },{
      name: 'IFrame Redirection',
      code: 'IFR',
      weight: 0.0001,
      description: 'IFrame is an HTML tag used to display an additional webpage into one that is currently shown. ' +
      'Phishers can make use of the “iframe” tag and make it invisible i.e. without frame borders. In this regard, ' +
      'phishers make use of the “frameBorder” attribute which causes the browser to render a visual delineation.',
      active: true
    },{
      name: 'Using Input Fields (Password, Text, Email, Tel)',
      code: 'UIF',
      weight: 0.0611,
      description: 'Phishers usually lure their victims to disclose their personal information like: emails, passwords,' +
      'credit card numbers, and phone numbers so they can take advantage of it. We need to check if the' +
      'users are requested to input their personal info into a website that does not support https.',
      active: true
    },{
      name: 'Age of Domain',
      code: 'AOD',
      weight: 0.01,
      description: 'This feature can be extracted from WHOIS database (Whois 2005). Most phishing websites live ' +
      'for a short period of time. By reviewing our dataset, we find that the minimum age ' +
      'of the legitimate domain is 6 months.',
      active: true
    },{
      name: 'Website Traffic - Alexa Ranking',
      code: 'WTAR',
      weight: 0.1145,
      description: 'This feature measures the popularity of the website by determining the number of visitors ' +
      'and the number of pages they visit. However, since phishing websites live for a short period of time, ' +
      'they may not be recognized by the Alexa database (Alexa the Web Information Company., 1996). ' +
      'By reviewing the literature and phishing data sets, it is concluded that in worst scenarios, ' +
      'legitimate websites ranked among the top 200,000. ' +
      'Furthermore, if the domain has no traffic or is not recognized by the Alexa database, ' +
      'it is classified as “Phishing”. Otherwise, it is classified as “Suspicious”.',
      active: true
    },{
      name: 'PageRank Mozescape',
      code: 'PR',
      weight: 0.611,
      description: 'MozRank quantifies link popularity and is Moz’s version of Google’s classic PageRank algorithm. ' +
      'Pages earn MozRank based on the other pages on the web that link to them and the MozRank of those linking pages. ' +
      'The higher the MozRank of the linking pages, the higher the MozRank of the page receiving those links. ' +
      'In this way, it reflects a type of raw link equity for any given webpage on the Internet. ' +
      'Similar to the way that Google’s original PageRank is calculated, we base MozRank on a ' +
      'logarithmic scale between 0 and 10. Thus, it\'s much easier to improve from a MozRank of 3 to 4 ' +
      'than it is to improve from 8 to 9. The rule is if MozRank > 0.2 the page is legitimate otherwise it is phishing.',
      active: true
    },{
      name: 'Page Authority Mozescape',
      code: 'PA',
      weight: 0.611,
      description: 'Page Authority (PA) is a score developed by Moz that predicts how well a specific page will rank on' +
      'search engine result pages (SERP). Page Authority scores range from one to 100, with higher scores corresponding ' +
      'to a greater ability to rank. Page Authority is based on data from the Mozscape web index and includes ' +
      'link counts, MozRank, MozTrust, and dozens of other factors. Like Domain Authority, ' +
      'it uses a machine learning model to identify the algorithm that best correlates with rankings across ' +
      'the thousands of SERPs that we predict against, then produces Page Authority scores ' +
      'using that specific calculation. The rule is if PA > 3 the page is legitimate otherwise it is phishing',
      active: true
    },{
      name: 'Domain Authority',
      code: 'DA',
      weight: 0.611,
      description: 'Domain Authority (DA) is a search engine ranking score developed by Moz that predicts how well' +
      'a website will rank on search engine result pages (SERPs). A Domain Authority score ranges from one to 100, ' +
      'with higher scores corresponding to a greater ability to rank. Domain Authority is calculated by evaluating ' +
      'linking root domains, number of total links, MozRank, MozTrust, etc. — into a single DA score. ' +
      'This score can then be used when comparing websites or tracking the "ranking strength" of a website over time. ' +
      'The rule is if PA > 15 the page is legitimate otherwise it is phishing',
      active: true
    },{
      name: 'Number of Links Pointing to Page',
      code: 'NLPP',
      weight: 0.611,
      description: 'The number of links pointing to the webpage indicates its legitimacy level, even if some links are ' +
      'of the same domain (Dean, 2014). In our datasets and due to its short life span, we find that 98% of ' +
      'phishing dataset items have no links pointing to them. On the other hand, legitimate websites have at least 2 ' +
      'external links pointing to them. The rule is if NLPP == 0 than phishing else if NLPP between 0 and 2 ' +
      'than suspicious else if NLPP > 2 than legitimate',
      active: true
    },{
      name: 'Statistical-Reports Based Feature',
      code: 'SRBF',
      weight: 0.004,
      description: 'Websites such as PhishTank, formulate numerous statistical reports on ' +
      'phishing websites at every given period of time; some are monthly and others are quarterly. ' +
      'In our research, we used 3 forms of the top statistics from PhishTank: “Top Phishing Domains from 2017”,' +
      '“Top Phishing IPs for 2017” and “Top Phishing Targets for 2017” according to PhishTank ' +
      'statistical-reports published in 2017',
      active: true
    },{
      name: 'Web of Trust (WOT)',
      code: 'WOT',
      weight: 0.611,
      description: 'Web of Trust (WOT) is a website reputation and review service that helps people make informed ' +
      'decisions about whether to trust a website or not. WOT is based on a unique crowdsourcing approach that collects ' +
      'ratings and reviews from a global community of millions of users who rate and comment on websites based on ' +
      'their personal experiences. The community-powered approach enables WOT to protect you against threats that only ' +
      'the human eye can spot such as scams, unreliable web stores and questionable content. It complements traditional ' +
      'security solutions that protect computers against technical threats such as viruses and other harmful software. ' +
      'WOT is based on a patented system where user behavior is systematically analyzed and monitored to ensure ' +
      'that the ratings are reliable, accurate and constantly updated. In addition, the ratings are validated with ' +
      'trusted third party information, such as blacklists of phishing sites.',
      active: true
    });
  });

User.find({}).removeAsync()
  .then(() => {
    User.createAsync({
      provider: 'local',
      name: 'Test User',
      email: 'test@example.com',
      password: 'test'
    }, {
      provider: 'local',
      role: 'admin',
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin'
    })
    .then(() => {
      console.log('finished populating users');
    });
  });

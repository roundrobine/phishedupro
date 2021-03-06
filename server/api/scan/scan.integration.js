'use strict';

var app = require('../..');
import User from '../user/user.model';
import Scan  from './scan.model';
import Rule  from '../rule/rule.model';
import request from 'supertest';

var newScan;

describe('Scan API:', function() {

  var user;
  var token;

  // Clear users before testing
  before(function() {
    return User.removeAsync().then(function() {
      user = new User({
        provider: 'local',
        role: 'admin',
        name: 'Admin',
        email: 'adminUser@example.com',
        password: 'Tphalo8c'
      });

      return user.saveAsync();
    });
  });

  before(function(done) {
    request(app)
      .post('/auth/local')
      .send({
        email: 'adminUser@example.com',
        password: 'Tphalo8c'
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  before(function() {
    return Rule.find({}).removeAsync()
      .then(() => {
        return Rule.create({
          name: 'Using the IP Address',
          code: 'isIPAddress',
          weight: 0.006,
          description: 'If an IP address is used as an alternative of the domain name in the URL, ' +
          'such as “http://125.98.3.123/fake.html”, users can be sure that someone is trying to steal their ' +
          'personal information. Sometimes, the IP address is even transformed into hexadecimal code as shown in ' +
          'the following link “http://0x58.0xCC.0xCA.0x62/2/paypal.ca/index.html”',
          active: true
        }, {
          name: 'Long URL to Hide the Suspicious Part',
          code: 'urlLenght',
          weight: 0.003,
          description: 'Phishers can use long URL to hide the doubtful part in the address bar. For example: ' +
          'http://federmacedoadv.com.br/3f/aze/ab51e2e319e51502f416dbe46b773a5e/?cmd=_home&amp;dispatch=11004d58f5b74f8dc1e7c2e8dd4105e811004d58f5b74f8dc1e7c2e8dd4105e8@phishing.website.html' +
          'To ensure accuracy of their study, (Mohammad, Thabtah and McCluskey 2012) calculated the length of URLs in the data-set ' +
          'and produced an average URL length. The results showed that if the length of the URL is greater than or equal 54 ' +
          'characters then the URL classified as phishing. By reviewing their data-set they were able to find 1220 URLs lengths ' +
          'equals to 54 or more which constitute 48.8% of the total data-set size.',
          suspicious: 54,
          phishing: 75,
          unit: 'characters',
          active: true
        }, {
          name: 'Using URL Shortening Services “TinyURL”',
          code: 'tinyURL',
          weight: 0.003,
          description: 'URL shortening is a method on the “World Wide Web” in which a URL may be made considerably smaller' +
          'in length and still lead to the required webpage. This is accomplished by means of an “HTTP Redirect” on a domain' +
          'name that is short, which links to the webpage that has a long URL. For example, the URL “http://portal.hud.ac.uk/”' +
          'can be shortened to “bit.ly/19DXSk4”.',
          active: true
        }, {
          name: 'URL’s having “@” Symbol',
          code: 'atSymbol',
          weight: 0.002,
          description: 'Using “@” symbol in the URL leads the browser to ignore everything preceding the “@” symbol ' +
          'and the real address often follows the “@” symbol. ',
          active: true
        }, {
          name: 'Adding Prefix or Suffix Separated by (-) to the Domain',
          code: 'hasPrefixOrSufix',
          weight: 0.123,
          description: 'The dash symbol is rarely used in legitimate URLs. Phishers tend to add prefixes or suffixes ' +
          'separated by (-) to the domain name so that users feel that they are dealing with a legitimate webpage. ' +
          'For example http://www.Confirme-paypal.com/',
          active: true
        }, {
          name: 'Sub Domain and Multi Sub Domains',
          code: 'subdomains',
          weight: 0.109,
          description: 'Let us assume we have the following link: http://www.hud.ac.uk/students/. A domain name might include ' +
          'the country-code top-level domains (ccTLD), which in our example is “uk”. The “ac” part is shorthand for “academic”,' +
          'the combined “ac.uk” is called a second-level domain (SLD) and “hud” is the actual name of the domain. ' +
          'To produce a rule for extracting this feature, we firstly have to omit the (www.) from the URL which is in fact a' +
          'sub domain in itself. Then, we have to remove the (ccTLD) if it exists. Finally, we count the remaining dots. ' +
          'If the number of dots is greater than one, then the URL is classified as “Suspicious” since it has one sub domain.' +
          'However, if the dots are greater than two, it is classified as “Phishing” since it will have multiple sub domains.' +
          'Otherwise, if the URL has no sub domains, we will assign “Legitimate” to the feature. ',
          suspicious: 1,
          phishing: 2,
          unit: 'subdomain',
          active: true
        },{
          name: 'Hyper Text Transfer Protocol with Secure Sockets Layer',
          code: 'ssl',
          weight: 0.499,
          description: 'The existence of HTTPS is very important in giving the impression of website legitimacy, ' +
          'but this is clearly not enough. The authors in (Mohammad, Thabtah and McCluskey 2012), ' +
          '(Mohammad, Thabtah and McCluskey 2013) suggest checking the certificate assigned with HTTPS ' +
          'including the extent of the trust certificate issuer, and the certificate age. ' +
          'Certificate Authorities that are consistently listed among the top trustworthy names include: ' +
          '“GeoTrust, GoDaddy, Network Solutions, Thawte, Comodo, Doster and VeriSign”. ' +
          'Furthermore, by testing out our datasets, we find that the minimum age of a reputable certificate is more than 6 months.',
          phishing: 181,
          unit: 'days',
          active: true
        },{
          name: 'Domain Registration Length',
          code: 'domainRegistrationLength',
          weight: 0.036,
          description: 'Based on the fact that a phishing website lives for a short period of time, we believe ' +
          'that trustworthy domains are regularly paid for several years in advance. In our dataset, ' +
          'we find that the longest fraudulent domains have been used for one year only.',
          phishing: 364,
          unit: 'days',
          active: true
        },{
          name: 'Request URL',
          code: 'requestUrls',
          weight: 0.046,
          description: 'Request URL examines whether the external objects contained within a webpage such as images, videos' +
          'and sounds are loaded from another domain. In legitimate webpages, the webpage address and most of objects' +
          'embedded within the webpage are sharing the same domain',
          suspicious: 22,
          phishing: 61,
          unit: '%',
          active: true
        },{
          name: 'URL of Anchor',
          code: 'urlOfAnchors',
          weight: 0.477,
          description: 'An anchor is an element defined by the (a) tag. This feature is treated exactly as “Request URL”. ' +
          'However, for this feature we examine If the (a) tags and the website have different domain names. ' +
          'This is similar to request URL feature.',
          suspicious: 31,
          phishing: 67,
          unit: '%',
          active: true
        },{
          name: 'Links in (Script) and (Link) tags',
          code: 'linksInTags',
          weight: 0.047,
          description: 'Given that our investigation covers all angles likely to be used in the webpage source code, ' +
          'we find that it is common for legitimate websites (Script) tags to create a client side script and ' +
          '(Link) tags to retrieve other web resources. ' +
          'It is expected that these tags are linked to the same domain of the webpage.',
          suspicious: 17,
          phishing: 81,
          unit: '%',
          active: true
        },{
          name: 'Server Form Handler (SFH)',
          code: 'sfh',
          weight: 0.037,
          description: 'SFHs that contain an empty string or “about:blank” are considered doubtful because an action should ' +
          'be taken upon the submitted information. In addition, if the domain name in SFHs is different from the domain name' +
          'of the webpage, this reveals that the webpage is suspicious because the submitted information ' +
          'is rarely handled by external domains.',
          active: true
        },{
          name: 'IFrame Redirection',
          code: 'iframe',
          weight: 0.0001,
          description: 'IFrame is an HTML tag used to display an additional webpage into one that is currently shown. ' +
          'Phishers can make use of the “iframe” tag and make it invisible i.e. without frame borders. In this regard, ' +
          'phishers make use of the “frameBorder” attribute which causes the browser to render a visual delineation.',
          active: true
        },{
          name: 'Using Input Fields (Password, Text, Email, Tel)',
          code: 'inputFields',
          weight: 0.0847,
          description: 'Phishers usually lure their victims to disclose their personal information like: emails, passwords,' +
          'credit card numbers, and phone numbers so they can take advantage of it. We need to check if the' +
          'users are requested to input their personal info into a website that does not support https.',
          active: true
        },{
          name: 'Age of Domain',
          code: 'ageOfDomain',
          weight: 0.01,
          description: 'This feature can be extracted from WHOIS database (Whois 2005). Most phishing websites live ' +
          'for a short period of time. By reviewing our dataset, we find that the minimum age ' +
          'of the legitimate domain is 6 months.',
          phishing: 180,
          unit: 'days',
          active: true
        },{
          name: 'Website Traffic - Alexa Ranking',
          code: 'websiteTrafficAlexa',
          weight: 0.1145,
          description: 'This feature measures the popularity of the website by determining the number of visitors ' +
          'and the number of pages they visit. However, since phishing websites live for a short period of time, ' +
          'they may not be recognized by the Alexa database (Alexa the Web Information Company., 1996). ' +
          'By reviewing the literature and phishing data sets, it is concluded that in worst scenarios, ' +
          'legitimate websites ranked among the top 200,000. ' +
          'Furthermore, if the domain has no traffic or is not recognized by the Alexa database, ' +
          'it is classified as “Phishing”. Otherwise, it is classified as “Suspicious”.',
          suspicious: 500000,
          unit: 'rank',
          active: true
        },{
          name: 'PageRank Mozescape',
          code: 'mozRankURL',
          weight: 0.008,
          description: 'MozRank quantifies link popularity and is Moz’s version of Google’s classic PageRank algorithm. ' +
          'Pages earn MozRank based on the other pages on the web that link to them and the MozRank of those linking pages. ' +
          'The higher the MozRank of the linking pages, the higher the MozRank of the page receiving those links. ' +
          'In this way, it reflects a type of raw link equity for any given webpage on the Internet. ' +
          'Similar to the way that Google’s original PageRank is calculated, we base MozRank on a ' +
          'logarithmic scale between 0 and 10. Thus, it\'s much easier to improve from a MozRank of 3 to 4 ' +
          'than it is to improve from 8 to 9. The rule is if MozRank > 0.2 the page is legitimate otherwise it is phishing.',
          phishing: 0.2,
          unit: 'PageRank',
          active: true
        },{
          name: 'Page Authority Mozescape',
          code: 'pageAuthority',
          weight: 0.0847,
          description: 'Page Authority (PA) is a score developed by Moz that predicts how well a specific page will rank on' +
          'search engine result pages (SERP). Page Authority scores range from one to 100, with higher scores corresponding ' +
          'to a greater ability to rank. Page Authority is based on data from the Mozscape web index and includes ' +
          'link counts, MozRank, MozTrust, and dozens of other factors. Like Domain Authority, ' +
          'it uses a machine learning model to identify the algorithm that best correlates with rankings across ' +
          'the thousands of SERPs that we predict against, then produces Page Authority scores ' +
          'using that specific calculation. The rule is if PA > 3 the page is legitimate otherwise it is phishing',
          suspicious: 5,
          phishing: 2,
          active: true
        },{
          name: 'Domain Authority',
          code: 'domainAuthority',
          weight: 0.0847,
          description: 'Domain Authority (DA) is a search engine ranking score developed by Moz that predicts how well' +
          'a website will rank on search engine result pages (SERPs). A Domain Authority score ranges from one to 100, ' +
          'with higher scores corresponding to a greater ability to rank. Domain Authority is calculated by evaluating ' +
          'linking root domains, number of total links, MozRank, MozTrust, etc. — into a single DA score. ' +
          'This score can then be used when comparing websites or tracking the "ranking strength" of a website over time. ' +
          'The rule is if PA > 15 the page is legitimate otherwise it is phishing',
          suspicious: 17,
          phishing: 8,
          active: true
        },{
          name: 'Number of Links Pointing to Page',
          code: 'externalLinks',
          weight: 0.004,
          description: 'The number of links pointing to the webpage indicates its legitimacy level, even if some links are ' +
          'of the same domain (Dean, 2014). In our datasets and due to its short life span, we find that 98% of ' +
          'phishing dataset items have no links pointing to them. On the other hand, legitimate websites have at least 2 ' +
          'external links pointing to them. The rule is if NLPP == 0 than phishing else if NLPP between 0 and 2 ' +
          'than suspicious else if NLPP > 2 than legitimate',
          suspicious: 2,
          phishing: 0,
          active: true
        },{
          name: 'Statistical-Reports Based Feature',
          code: 'keywordDomainReport',
          weight: 0.004,
          description: 'Websites such as PhishTank, formulate numerous statistical reports on ' +
          'phishing websites at every given period of time; some are monthly and others are quarterly. ' +
          'In our research, we used 3 forms of the top statistics from PhishTank: “Top Phishing Domains from 2017”,' +
          '“Top Phishing IPs for 2017” and “Top Phishing Targets for 2017” according to PhishTank ' +
          'statistical-reports published in 2017',
          active: true
        },{
          name: 'Web of Trust (WOT)',
          code: 'myWOT',
          weight: 0.0847,
          description: 'Web of Trust (WOT) is a website reputation and review service that helps people make informed ' +
          'decisions about whether to trust a website or not. WOT is based on a unique crowdsourcing approach that collects ' +
          'ratings and reviews from a global community of millions of users who rate and comment on websites based on ' +
          'their personal experiences. The community-powered approach enables WOT to protect you against threats that only ' +
          'the human eye can spot such as scams, unreliable web stores and questionable content. It complements traditional ' +
          'security solutions that protect computers against technical threats such as viruses and other harmful software. ' +
          'WOT is based on a patented system where user behavior is systematically analyzed and monitored to ensure ' +
          'that the ratings are reliable, accurate and constantly updated. In addition, the ratings are validated with ' +
          'trusted third party information, such as blacklists of phishing sites.',
          suspicious: 60,
          phishing: 40,
          unit: '%',
          active: true
        });
      });
  });

  // Clear users after testing
  after(function() {
    return User.removeAsync();
  });

  after(function() {
    return Rule.removeAsync();
  });

  after(function() {
    return Scan.removeAsync();
  });

  describe('GET /scan', function() {
    var scans;

    beforeEach(function(done) {
      request(app)
        .get('/scan')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          scans = res.body;
          done();
        });
    });

    it('should respond with scans object with empty scans.docs array', function() {
      expect(scans).to.be.instanceOf(Object);
      expect(scans.docs).to.be.an('array').that.is.empty;
      expect(scans.total).to.equal(0);
    });

    it('should respond with a 401 when not authenticated', function(done) {
      request(app)
        .get('/scan')
        .expect(401)
        .end(done);
    });

  });

  describe('POST /scan', function() {

    this.timeout(20000);

    beforeEach(function(done) {
      request(app)
        .post('/scan')
        .set('authorization', 'Bearer ' + token)
        .send({
          url:"https://www.google.com/",
          target:1,
          owner: user._id
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newScan = res.body;
          done();
        });
    });

    it('should respond with the newly created scan', function() {
      expect(newScan.target).to.equal(1);
      expect(newScan.active).to.equal(true);
      expect(newScan.finalScore).to.be.below(10);
      expect(newScan.statistics.websiteTrafficAlexa.value).to.equal(1);
      expect(newScan.statistics.myWOT.value).to.equal(1);
      expect(newScan.statistics.subdomains.value).to.equal(1);
      expect(newScan.statistics.ssl.value).to.equal(1);
      expect(newScan.statistics.ssl.completeCertChain).to.equal(true);
      expect(newScan.statistics.ssl.certType).to.equal('OV');
      expect(newScan.statistics.isIPAddress.value).to.equal(1);
      expect(newScan.isBlacklisted).to.equal(false);
    });

  });

  describe('GET /scan/:id', function() {
    var scan;

    beforeEach(function(done) {
      request(app)
        .get('/scan/' + newScan._id)
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          scan = res.body;
          done();
        });
    });

    afterEach(function() {
      scan = {};
    });

    it('should respond with the requested scan', function() {
      expect(scan.target).to.equal(1);
      expect(scan.active).to.equal(true);
      expect(scan.url).to.equal('https://www.google.com/');
      expect(scan.finalScore).to.be.below(10);
      expect(scan.statistics.ssl.certType).to.equal('OV');
    });

    it('should respond with a 401 when not authenticated', function(done) {
      request(app)
        .get('/scan/' + newScan._id)
        .expect(401)
        .end(done);
    });

  });

  describe('PUT /scan/:id', function() {
    var updatedScan;

    beforeEach(function(done) {
      request(app)
        .put('/scan/' + newScan._id)
        .set('authorization', 'Bearer ' + token)
        .send({
          finalScore: 7,
          urlScore: 0.129,
          url: 'https://www.apple.com/',
          responseTime: 12.56
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedScan = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedScan = {};
    });

    it('should respond with the updated scan', function() {
      expect(updatedScan.finalScore).to.equal(7);
      expect(updatedScan.urlScore).to.equal(0.129);
      expect(updatedScan.url).to.equal('https://www.apple.com/');
      expect(updatedScan.responseTime).to.equal(12.56);
    });

  });

  describe('DELETE /scan/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/scan/' + newScan._id)
        .set('authorization', 'Bearer ' + token)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when scan does not exist', function(done) {
      request(app)
        .delete('/scan/' + newScan._id)
        .set('authorization', 'Bearer ' + token)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});

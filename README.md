# phishedupro

Phishing is a pervasive online security threat in which an attacker known as phisher tries to lure legitimate users to
disclose confidential information, by mimicking electronic communication, from trustworthy organizations and companies.
Fighting against phishing attacks is not a straightforward mission. Many different anti-phishing strategies have been
proposed by the research community and the industry, but not all of them produced promising results. By following
up-to-date anti-phishing literature and examining state of the art anti-phishing practice, this projects aims to tackle
phishing scam using an alternative approach. This project implements an automated real-time anti-phishing platform, 
named PhishEduPro, which is capable to detect website based phishing attacks. The platform operates online and is able 
to extract all relevant information from suspected web pages, analyze it with state of the art techniques, generate 
relevant features from each technique, and store those features for each of the analyzed web pages. Each feature, used 
in the website evaluation process, is tagged and labeled with an appropriate color, based on the score obtained from a 
newly developed anti-phishing algorithm. Therefore, those features could be utilized to raise user awareness about 
phishing and could help in educating and training users to recognize and mitigate future phishing attacks. Finally, the 
performance of PhishEduPro platform has been evaluated in a real life scenario, by utilizing a dataset of phishing and 
legitimate web pages. The results obtained from the evaluation process are considered as very promising.

## Anti-Phishing Dataset

A dataset with binary features of 1420 evaluated web pages where 710 are legitimate and 710 are phishing is available
in the websites_anti-phishing_statistics.csv. More information about this dataset and how each of the features is designed 
could be found in my Master Thesis attached to the root of this repo.  

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node ^4.2.3, npm ^2.14.7
- [Bower](bower.io) (`npm install --global bower`)
- [Grunt](http://gruntjs.com/) (`npm install --global grunt-cli`)
- [MongoDB](https://www.mongodb.org/) - Keep a running daemon with `mongod`

### Developing

1. Run `npm install` to install server dependencies.

2. Run `bower install` to install front-end dependencies.

3. Run `mongod` in a separate shell to keep an instance of the MongoDB Daemon running

4. Run `grunt serve` to start the development server. It should automatically open the client in your browser when ready.

## Build & development

Run `grunt build` for building and `grunt serve` for preview.

## Testing

Running `grunt test:server` will run the unit tests and integration tests using Mocha, Chai and Sinon.

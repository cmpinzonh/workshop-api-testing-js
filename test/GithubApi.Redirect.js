const agent = require('superagent-promise')(require('superagent'), Promise);
const { expect } = require('chai');
const statusCode = require('http-status-codes');

const redirectURL = 'https://github.com/aperdomob/redirect-test';
const newURL = 'https://github.com/aperdomob/new-redirect-test';
let newURLResponseStatus;

describe('Redirection test', () => {
  let redirectQuery;

  before(() => {
    redirectQuery = agent.head(redirectURL)
      .auth('token', process.env.ACCESS_TOKEN);
  });

  it('Check new URL is in error response', () => redirectQuery.catch((error) => {
    expect(error.status).to.equal(301);
    expect(error.response.headers.location).to.equal(newURL);
  }));

  describe('Test new URL', () => {
    let newURLQuery;

    before(() => {
      newURLQuery = agent.get(newURL)
        .auth('token', process.env.ACCESS_TOKEN)
        .then((response) => {
          newURLResponseStatus = response.status;
        });
      return newURLQuery;
    });

    it('Response status should be OK', () => {
      expect(newURLResponseStatus).to.equal(statusCode.OK);
    });
  });
});

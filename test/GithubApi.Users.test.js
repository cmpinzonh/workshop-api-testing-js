const agent = require('superagent-promise')(require('superagent'), Promise);
const responseTime = require('superagent-response-time');
const { expect } = require('chai');

const urlBase = 'https://api.github.com';

describe('Given a Github user', () => {
  describe('when querying all the users', () => {
    let queryTime;
    // let allUsers;

    before(() => {
      const usersQuery = agent
        .get(`${urlBase}/users`)
        .auth('token', process.env.ACCESS_TOKEN)
        .use(responseTime((request, time) => {
          queryTime = time;
        }));
      return usersQuery;
    });

    it.only('should have a quick response', () => {
      expect(queryTime).to.be.below(5000);
    });
  });
});

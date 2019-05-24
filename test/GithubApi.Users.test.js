const agent = require('superagent-promise')(require('superagent'), Promise);
const responseTime = require('superagent-response-time');
const { expect } = require('chai');

const urlBase = 'https://api.github.com';

describe('Given a github user', () => {
  describe('When querying all the users', () => {
    let queryTime;
    let allUsersQueryLength;

    before(() => {
      const usersQuery = agent
        .get(`${urlBase}/users`)
        .auth('token', process.env.ACCESS_TOKEN)
        .use(responseTime((request, time) => {
          queryTime = time;
        }))
        .then((response) => {
          allUsersQueryLength = response.body.length;
        });

      return usersQuery;
    });

    it('then it should have a quick response', () => {
      expect(queryTime).to.be.below(5000);
    });

    it('and it should contain thirty users by default pagination', () => expect(allUsersQueryLength).to.be.equal(30));

    describe('when it filters the number of users by 10', () => {
      let tenUsersQuery;
      let tenUsersQueryLength;

      before(() => {
        tenUsersQuery = agent
          .get(`${urlBase}/users`)
          .auth('token', process.env.ACCESS_TOKEN)
          .query({ per_page: 10 })
          .then((response) => {
            tenUsersQueryLength = response.body.length;
          });
        return tenUsersQuery;
      });

      it('then the number of filtered users should be equal by 10', () => expect(tenUsersQueryLength).to.equal(10));
    });

    describe('when it filters the number of users by 50', () => {
      let oneHundredUsersQuery;
      let oneHundredUsersQueryLength;

      before(() => {
        oneHundredUsersQuery = agent
          .get(`${urlBase}/users`)
          .auth('token', process.env.ACCESS_TOKEN)
          .query({ per_page: 50 })
          .then((response) => {
            oneHundredUsersQueryLength = response.body.length;
          });
        return oneHundredUsersQuery;
      });

      it('then the number of filtered users should be equal by 50', () => expect(oneHundredUsersQueryLength).to.equal(50));
    });
  });
});

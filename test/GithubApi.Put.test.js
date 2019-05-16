const agent = require('superagent-promise')(require('superagent'), Promise);
const statusCode = require('http-status-codes');
const { expect } = require('chai');

const urlBase = 'https://api.github.com';
const githubUserName = 'srestrepoo';

describe('Tests using the PUT method', () => {
  let userFollowing;

  let followUser;
  
  before(() => {
    followUser = agent.put(`${urlBase}/user/following/${githubUserName}`)
      .auth('token', process.env.ACCESS_TOKEN);
  });
  it('Check for response of PUT', () => followUser.then((response) => {
    expect(response.status).to.equal(statusCode.NO_CONTENT);
    expect(response.body).to.eql({});
  }));
  describe('Check users following list', () => {
    let userFollowingQuery;
    before(() => {
      userFollowingQuery = agent.get(`${urlBase}/user/following`)
        .auth('token', process.env.ACCESS_TOKEN);
    });
    it('user should have been followed', () => userFollowingQuery.then((response) => {
      userFollowing = response.body.find(users => users.login === githubUserName);
      expect(userFollowing.login).to.be.equal(githubUserName);
    }));
    describe('Check function indempotency', () => {
      let userFollowingAgain;
      let followUserAgain;
      before(() => {
        followUserAgain = agent.put(`${urlBase}/user/following/${githubUserName}`)
          .auth('token', process.env.ACCESS_TOKEN);
      });
      it('Check method response', () => followUserAgain.then((response) => {
        expect(response.status).to.equal(statusCode.NO_CONTENT);
        expect(response.body).to.eql({});
      }));
      describe('Re-check users following list', () => {
        before(() => {
          userFollowingAgain = agent.get(`${urlBase}/user/following`)
            .auth('token', process.env.ACCESS_TOKEN);
        });
        it('user should still be followed', () => userFollowingAgain.then((response) => {
          userFollowingAgain = response.body.find(user => user.login === githubUserName);
          expect(userFollowingAgain.login).to.be.equal(githubUserName);
        }));
      });
    });
  });
});

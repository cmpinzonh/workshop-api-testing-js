const agent = require('superagent-promise')(require('superagent'), Promise);
const { expect } = require('chai');

const urlBase = 'https://api.github.com';


describe('Check if there is a logged in user', () => {
  let user;

  before(() => {
    const userLogged = agent.get(`${urlBase}/user`)
      .auth('token', process.env.ACCESS_TOKEN)
      .then((response) => {
        user = response.body;
      });
    return userLogged;
  });

  it('Check if the user has public repos', () => {
    expect(user.public_repos).to.be.above(0);
  });

  describe('Pick a repository in the array', () => {
    let repository;

    before(() => {
      const aRepository = agent.get(user.repos_url)
        .auth('token', process.env.ACCESS_TOKEN)
        .then((response) => {
          repository = response.body.shift();
          console.log(JSON.stringify(repository.name));
          console.log(JSON.stringify(user.login));
        });
      return aRepository;
    });

    it('The repository exists', () => {
      expect(repository).to.not.equal('undefined');
    });

    describe('Create an issue in the repo', () => {
      let issue;

      const title = { title: 'This is just a test' };
      before(() => {
        const issueCreate = agent.post(`${urlBase}/repos/${user.login}/${repository.name}/issues`, title)
          .auth('token', process.env.ACCESS_TOKEN)
          .then((response) => {
            issue = response.body;
          });
        return issueCreate;
      });

      it('Check if the issues body is empty', () => {
        expect(issue.title).to.be.equal(title.title);
        expect(issue.body).to.be.equal(null);
      });

      describe('Edit the body of the issue', () => {
        const updateBodyIssue = { body: 'body updated', state: 'closed' };
        let updatedIssue;

        before(() => {
          const issueUpdate = agent.patch(`${urlBase}/repos/${user.login}/${repository.name}/issues/${issue.number}`, updateBodyIssue)
            .auth('token', process.env.ACCESS_TOKEN)
            .then((response) => {
              updatedIssue = response.body;
            });
          return issueUpdate;
        });

        it('Check that the new body was created correctly', () => {
          expect(updatedIssue.title).to.be.equal(title.title);
          expect(updatedIssue.body).to.be.equal(updateBodyIssue.body);
          expect(updatedIssue.state).to.be.equal(updateBodyIssue.state);
        });
      });
    });
  });
});

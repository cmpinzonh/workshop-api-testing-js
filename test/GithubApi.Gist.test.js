const agent = require('superagent-promise')(require('superagent'), Promise);
const { expect } = require('chai');
const statusCode = require('http-status-codes');

const urlBase = 'https://api.github.com';

describe('Create and delete gist', () => {
  let createGistQuery;
  let gist;
  let responseStatus;
  const gistContent = `function wait(method, time) {
    return new Promise((resolve) => {
      setTimeout(resolve(method()), time);
    });
  }
  `;

  const newGist = {
    description: 'example promise',
    public: true,
    files: {
      'promise.js': {
        content: gistContent
      }
    }
  };

  before(() => {
    createGistQuery = agent.post(`${urlBase}/gists`, newGist)
      .auth('token', process.env.ACCESS_TOKEN)
      .then((response) => {
        gist = response.body;
        responseStatus = response.statusCode;
      });
    return createGistQuery;
  });

  it('Check if the gist was created', () => {
    expect(responseStatus).to.be.equal(statusCode.CREATED);
    expect(gist.public).to.be.equal(true);
    expect(gist.description).to.be.equal('example promise');
  });

  describe('Check the new gist', () => {
    let newGistQuery;
    before(() => {
      newGistQuery = agent.get(gist.url)
        .auth('token', process.env.ACCESS_TOKEN)
        .then((response) => {
          responseStatus = response.statusCode;
        });
      return newGistQuery;
    });

    it('The gist exists', () => {
      expect(responseStatus).to.be.equal(statusCode.OK);
    });

    describe('Delete the gist', () => {
      let deleteQuery;
      before(() => {
        deleteQuery = agent.del(gist.url)
          .auth('token', process.env.ACCESS_TOKEN)
          .then((response) => {
            responseStatus = response.statusCode;
          });
        return deleteQuery;
      });

      it('Check for no-content status', () => {
        expect(responseStatus).to.be.equal(statusCode.NO_CONTENT);
      });

      describe('Access the deleted gist', () => {
        let gistNotFoundQuery;

        before(() => {
          gistNotFoundQuery = agent
            .get(gist.url)
            .auth('token', process.env.ACCESS_TOKEN);
        });

        it('then the Gits should not be accessible', () => gistNotFoundQuery
          .catch(response => expect(response.status).to.equal(statusCode.NOT_FOUND)));
      });
    });
  });
});

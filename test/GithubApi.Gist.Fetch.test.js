const isomorphic = require('isomorphic-fetch');
const chai = require('chai');
const statusCode = require('http-status-codes');

chai.use(require('chai-subset'));

const { expect } = chai;

const jsCode = `
function wait(method, time) {
  return new Promise((resolve) => {
    setTimeout(resolve(method()), time);
  });
}
`;

const urlBase = 'https://api.github.com';
const defaultHeaders = {
  Authorization: `token ${process.env.ACCESS_TOKEN}`
};
let gist;

describe('Given a github user', () => {
  describe('when create a gist', () => {
    const createGist = {
      description: 'this is an example about promise',
      public: true,
      files: {
        'promise.js': {
          content: jsCode
        }
      }
    };

    let newGistQuery;
    let newGistQueryStatus;

    before(() => {
      const parameters = {
        method: 'POST',
        body: JSON.stringify(createGist),
        headers: defaultHeaders
      };

      newGistQuery = isomorphic(`${urlBase}/gists`, parameters)
        .then((response) => {
          newGistQueryStatus = response.status;
          return response.json();
        })
        .then((body) => {
          gist = body;
          return body;
        });

      return newGistQuery;
    });

    it('then a new gist should be created', () => {
      newGistQuery
        .then(() => {
          expect(newGistQueryStatus).to.equal(statusCode.CREATED);
          expect(gist).to.containSubset(createGist);
        });
    });

    describe('and get the new gist', () => {
      let gistQuery;
      let gistQueryStatus;

      before(() => {
        gistQuery = isomorphic(gist.url, {
          method: 'GET',
          headers: {
            Authorization: `token ${process.env.ACCESS_TOKEN}`
          }
        }).then((response) => {
          gistQueryStatus = response.status;
        });
        return gistQuery;
      });

      it('then the Gist should be accessible', () => {
        expect(gistQueryStatus).to.equal(statusCode.OK);
      });

      describe('when delete a gist', () => {
        let deleteGistQuery;
        let deleteGistQueryStatus;

        before(() => {
          deleteGistQuery = isomorphic(gist.url, { method: 'DELETE', headers: defaultHeaders })
            .then((response) => {
              deleteGistQueryStatus = response.status;
            });
          return deleteGistQuery;
        });

        it('then the gist should be deleted', () => {
          expect(deleteGistQueryStatus).to.equal(statusCode.NO_CONTENT);
        });
      });

      describe('and try to get the delete gist', () => {
        let gistNotFoundQuery;
        let gistNotFoundQueryStatus;

        before(() => {
          gistNotFoundQuery = isomorphic(gist.url, {
            headers: {
              Authorization: `token ${process.env.ACCESS_TOKEN}`
            }
          }).then((response) => {
            gistNotFoundQueryStatus = response.status;
          });

          return gistNotFoundQuery;
        });

        it('then the Gits should not be accessible', () => {
          expect(gistNotFoundQueryStatus).to.equal(statusCode.NOT_FOUND);
        });
      });
    });
  });
});

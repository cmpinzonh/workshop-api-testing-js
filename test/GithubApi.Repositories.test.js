const agent = require('superagent-promise')(require('superagent'), Promise);
const statusCode = require('http-status-codes');
const { expect } = require('chai');

const urlBase = 'https://api.github.com/users/aperdomob';

describe('Github Api Test', () => {
  describe('Authentication', () => {
    it('Test para Alejandro Perdomo', () => agent.get(`${urlBase}`)
      .auth('token', process.env.ACCESS_TOKEN)
      .then((response) => {
        expect(response.status).to.equal(statusCode.OK);
        expect(response.body).to.have.property('name');
        expect(response.body.name).to.equal('Alejandro Perdomo');
        expect(response.body.location).to.equal('Colombia');
        expect(response.body.company).to.equal('PSL');
      }));
  });

  describe('Test for specific repository', () => {
    const expectedRepo = 'jasmine-awesome-report';
    let repositories;
    let repository;
    before(() => {
      const reposQuery = agent.get(`${urlBase}/repos`)
        .auth('token', process.env.ACCESS_TOKEN)
        .then((response) => {
          repositories = response.body;
          repository = repositories.find(repos => repos.name === expectedRepo);
        });
      return reposQuery;
    });
    it('Check repo, privacity and description', () => {
      expect(repository.full_name).to.equal(`aperdomob/${expectedRepo}`);
      expect(repository.private).to.equal(false);
    });
  });
});

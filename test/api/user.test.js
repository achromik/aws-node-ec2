const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const AppLogger = require('../../src/config/logger');
const app = require('../../src/app');
const conn = require('../../src/config/db');

chai.use(chaiHttp);

describe('/user', () => {
  describe('POST', () => {
    before((done) => {
      conn
        .connectDB()
        .then(() => done())
        .catch((err) => done(err));
    });

    after((done) => {
      conn
        .close()
        .then(() => done())
        .catch((err) => done(err));
    });
    it('should return created user', (done) => {
      chai
        .request(app)
        .post('/user')
        .send({ username: 'Test', email: 'alex@example.com' })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('username');
          done();
        });
    });

    it('should fail', (done) => {
      chai
        .request(app)
        .post('/user')
        .send()
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(400);
          done();
        });
    });
  });
});

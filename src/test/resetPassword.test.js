/* eslint-disable prefer-destructuring */
import chai from 'chai';
import chaiHttp from 'chai-http';
import { before } from 'mocha';
import index from '../index';

const server = index.app;

const { expect } = chai;

const requestReset = '/api/v1/auth/forgotPassword';
let Url;
const signupUrl = '/api/v1/auth/signup';
const resetUrlWrong = '/api/v1/auth/resetPassword/1/eyJhbGciOiJIUzI1';

const regData = {
  userEmail: 'hanaurugai@gmail.com',
  firstName: 'Jonathan',
  lastName: 'Aurugai',
  userPassword: 'Root1234@'
};

chai.use(chaiHttp);

const correctPassword = {
  password: '11AAwwwwww@',
  newPassword: '11AAwwwwww@'
};
const wrongPassword = {
  password: 'wwwwwwwwww',
  newPassword: 'wwwwwwwwww'
};
const nonMatchPassword = {
  password: '11AAwwwwww@#',
  newPassword: 'wwwwQQ111wwwwww@#'
};
const emptyPassword = {
  password: '11AAwwwwww@#'
};
const existUser = { email: 'hanaurugai@gmail.com' };
let resetUrl;
let token;
let userId;

describe('Reset new Password', () => {
  before((done) => {
    chai
      .request(server)
      .post(signupUrl)
      .send(regData)
      .end((_err, res) => {
        expect(res.body.message).to.eq('Account has been created successfully');
        expect(res.status).to.eq(201);
        done();
      });
  });

  beforeEach((done) => {
    chai
      .request(server)
      .post(requestReset)
      .send(existUser)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Url = res.body.data;
        const UrlArray = Url.split('/');
        userId = UrlArray[UrlArray.length - 2];
        token = UrlArray[UrlArray.length - 1];

        resetUrl = `/api/v1/auth/resetPassword/${userId}/${token}`;
        done();
      });
  });
  it('Changes new password', (done) => {
    chai
      .request(server)
      .put(resetUrl)
      .send(correctPassword)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.message).to.eq('Password has been sucessfully changed. Proceed to login');
        expect(res.status).to.eq(200);
        done();
      });
  });
  it('Doesnot Change new password if password format is wrong', (done) => {
    chai
      .request(server)
      .put(resetUrl)
      .send(wrongPassword)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.eq(422);
        done();
      });
  });
  it('Doesnot Change to new password if password doenot match', (done) => {
    chai
      .request(server)
      .put(resetUrl)
      .send(nonMatchPassword)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.eq(400);
        done();
      });
  });
  it('Doesnot Change to new password if one password entry is empty', (done) => {
    chai
      .request(server)
      .put(resetUrl)
      .send(emptyPassword)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.eq(422);
        done();
      });
  });
  it('Doesnot Change Password if userId is corrupted with an non userID', (done) => {
    chai
      .request(server)
      .put(`/api/v1/auth/resetPassword/1000/${token}`)
      .send(nonMatchPassword)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.eq(401);
        done();
      });
  });
  it('Doesnot Change Password if token is corrupted', (done) => {
    chai
      .request(server)
      .put(resetUrlWrong)
      .send(nonMatchPassword)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.eq(400);
        done();
      });
  });
});

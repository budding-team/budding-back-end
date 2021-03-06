process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const connection = require('../db/connection');

beforeEach(() => connection.seed.run());
afterAll(() => connection.destroy());

describe('/users', () => {
  test('status:405 - invalid method - responds with msg: "method not allowed"', () => {
    const invalidMethods = ['patch', 'put', 'delete'];
    const requests = invalidMethods.map((method) => {
      return request(app)
        [method]('/api/users')
        .expect(405)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('method not allowed');
        });
    });

    return Promise.all(requests);
  });

  describe('GET', () => {
    test('status:200 - responds with array of user objects', () => {
      return request(app)
        .get('/api/users')
        .expect(200)
        .then(({ body: { users } }) => {
          expect(Array.isArray(users)).toBe(true);
          expect(users.length).toBe(4);
        });
    });

    test('status:200 - each user object has required keys', () => {
      return request(app)
        .get('/api/users')
        .expect(200)
        .then(({ body: { users } }) => {
          users.forEach((user) => {
            expect(user).toContainAllKeys(['user_id', 'username', 'name']);
          });
        });
    });
  });

  describe('POST', () => {
    test('status:201 responds with created user object', () => {
      return request(app)
        .post('/api/users')
        .send({
          username: 'unique-username',
          name: 'full name',
        })
        .expect(201)
        .then(({ body: { user } }) => {
          expect(user).toEqual({
            user_id: 5,
            username: 'unique-username',
            name: 'full name',
          });
        });
    });

    test('status:400 - invalid body, missing username key - responds with msg: "bad request"', () => {
      return request(app)
        .post('/api/users')
        .send({
          name: 'full name',
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('bad request');
        });
    });

    test('status:400 - invalid body, missing name key - responds with msg: "bad request"', () => {
      return request(app)
        .post('/api/users')
        .send({
          username: 'unique-username',
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('bad request');
        });
    });

    test('status:400 - invalid body, existing username - responds with msg: "bad request"', () => {
      return request(app)
        .post('/api/users')
        .send({
          username: 'robert_plant',
          name: 'Robert',
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('bad request');
        });
    });
  });

  // describe('/:user_id', () => {
  //   test('status:405 - invalid method - responds with msg: "method not allowed"', () => {
  //     const invalidMethods = ['post', 'patch', 'put', 'delete'];
  //     const requests = invalidMethods.map((method) => {
  //       return request(app)
  //         [method]('/api/users/1')
  //         .expect(405)
  //         .then(({ body: { msg } }) => {
  //           expect(msg).toBe('method not allowed');
  //         });
  //     });

  //     return Promise.all(requests);
  //   });

  //   describe('GET', () => {
  //     test('status:200 - responds with requested user object', () => {
  //       return request(app)
  //         .get('/api/users/1')
  //         .expect(200)
  //         .then(({ body: { user } }) => {
  //           expect(user).toEqual({
  //             user_id: 1,
  //             username: 'robert_plant',
  //             name: 'Robert',
  //           });
  //         });
  //     });

  //     test('status:404 - non-existent user_id - responds with msg: "user not found"', () => {
  //       return request(app)
  //         .get('/api/users/100')
  //         .expect(404)
  //         .then(({ body: { msg } }) => {
  //           expect(msg).toBe('user not found');
  //         });
  //     });

  //     test('status:400 - invalid user_id - responds with msg: "bad request"', () => {
  //       return request(app)
  //         .get('/api/users/notanumber')
  //         .expect(400)
  //         .then(({ body: { msg } }) => {
  //           expect(msg).toBe('bad request');
  //         });
  //     });
  //   });
  // });

  describe('/:username', () => {
    test('status:405 - invalid method - responds with msg: "method not allowed"', () => {
      const invalidMethods = ['post', 'patch', 'put', 'delete'];
      const requests = invalidMethods.map((method) => {
        return request(app)
          [method]('/api/users/robert_plant')
          .expect(405)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('method not allowed');
          });
      });

      return Promise.all(requests);
    });

    describe('GET', () => {
      test('status:200 - responds with requested user object', () => {
        return request(app)
          .get('/api/users/robert_plant')
          .expect(200)
          .then(({ body: { user } }) => {
            expect(user).toEqual({
              user_id: 1,
              username: 'robert_plant',
              name: 'Robert',
            });
          });
      });

      test('status:404 - non-existent username - responds with msg: "user not found"', () => {
        return request(app)
          .get('/api/users/nonExistentUser')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('user not found');
          });
      });
    });
  });
});

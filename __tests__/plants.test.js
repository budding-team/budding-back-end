process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const connection = require('../db/connection');

beforeEach(() => connection.seed.run());
afterAll(() => connection.destroy());

describe('/api/users/:user_id/plants', () => {
  describe('GET', () => {
    test('status:200 - responds with array of plant objects', () => {
      return request(app)
        .get('/api/users/1/plants')
        .expect(200)
        .then(({ body: { plants } }) => {
          expect(Array.isArray(plants)).toBe(true);
          expect(plants.length).toBe(2);
        });
    });

    test('status:200 - each plant object has required keys', () => {
      return request(app)
        .get('/api/users/1/plants')
        .expect(200)
        .then(({ body: { plants } }) => {
          plants.forEach((plant) => {
            expect(plant).toContainAllKeys([
              'plant_id',
              'plant_name',
              'user_id',
              'plant_type',
              'soil',
              'directSunlight',
              'inside',
              'wateringFreq',
              'created_at',
              'snapshot_count',
            ]);
          });
        });
    });

    test('status:200 - plants are sorted by created_at, descending by default', () => {
      return request(app)
        .get('/api/users/1/plants')
        .expect(200)
        .then(({ body: { plants } }) => {
          expect(plants).toBeSortedBy('created_at', {
            descending: true,
          });
        });
    });

    test('status:200 - plants can be sorted by created_at, ascending', () => {
      return request(app)
        .get('/api/users/1/plants?order=asc')
        .expect(200)
        .then(({ body: { plants } }) => {
          expect(plants).toBeSortedBy('created_at');
        });
    });

    test('status:200 - plants can be sorted by snapshot_count, descending', () => {
      return request(app)
        .get('/api/users/1/plants?sort_by=snapshot_count')
        .expect(200)
        .then(({ body: { plants } }) => {
          expect(plants).toBeSortedBy('snapshot_count', {
            descending: true,
          });
        });
    });

    test('status:200 - plants can be sorted by snapshot_count, ascending', () => {
      return request(app)
        .get('/api/users/1/plants?sort_by=snapshot_count&order=asc')
        .expect(200)
        .then(({ body: { plants } }) => {
          expect(plants).toBeSortedBy('snapshot_count');
        });
    });

    test('status:200 - each plant object has a snapshot_count key, value set to total count of comments with plant_id', () => {
      return request(app)
        .get('/api/users/1/plants')
        .expect(200)
        .then(({ body: { plants } }) => {
          plants.forEach((plant) => {
            expect(plant.snapshot_count).toEqual(expect.any(String));
          });
          expect(plants[0].snapshot_count).toBe('2');
        });
    });

    test('status:200 - plants can be filtered by plant_type', () => {
      return request(app)
        .get('/api/users/1/plants?plant_type=indoor')
        .expect(200)
        .then(({ body: { plants } }) => {
          plants.forEach((plant) => {
            expect(plant.plant_type).toBe('indoor');
          });
        });
    });
  });

  describe('POST', () => {
    test('status 201 : responds with created plant object', () => {
      return request(app)
        .post('/api/users/1/plants')
        .send({
          plant_name: 'plant-name-test',
          plant_type: 'indoor',
          soil: 'soil-test',
          directSunlight: true,
          inside: false,
          wateringFreq: 2,
        })
        .expect(201)
        .then(({ body: { plant } }) => {
          expect(plant.plant_id).toBe(7);
          expect(plant.plant_name).toBe('plant-name-test');
          expect(plant.plant_type).toBe('indoor');
          expect(plant.soil).toBe('soil-test');
          expect(plant.directSunlight).toBe(true);
          expect(plant.inside).toBe(false);
          expect(plant.wateringFreq).toBe(2);
          expect(plant.created_at).not.toBe('Invalid Date');
        });
    });
  });
});

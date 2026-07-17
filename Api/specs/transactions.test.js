const supertest = require('supertest');

const app = require('../app');
const db = require('../db/connect-test');
const Transaction = require('../models/transaction');
const User = require('../models/user');
const { genereteAuthToken } = require('../helpers/auth');

const agent = supertest.agent(app);

let transaction;
let user;
let token;

beforeAll(async () => await db.connect());
beforeEach(async () => {
  await db.clear();

  user = await new User({
    email: 'diary@meblabs.com',
    password: 'testtest',
    name: 'Diary',
    lastname: 'User',
    lang: 'EN',
    active: true,
    roles: ['user']
  }).save();
  token = genereteAuthToken(user).token;

  transaction = await new Transaction({
    type: 'expense',
    amount: 24.5,
    category: 'Food',
    date: new Date('2026-07-17T10:00:00.000Z'),
    description: 'Lunch'
  }).save();
});
afterEach(() => jest.clearAllMocks());
afterAll(async () => await db.close());

describe('Transactions', () => {
  test('GET /transactions returns the saved entry', () =>
    agent
      .get('/transactions?sorter=-date&count=true')
      .set('Cookie', `accessToken=${token}`)
      .expect(200)
      .then(res => {
        expect(res.body).toStrictEqual([
          {
            _id: transaction.id,
            type: 'expense',
            amount: 24.5,
            category: 'Food',
            date: expect.any(String),
            description: 'Lunch',
            createdAt: expect.any(String)
          }
        ]);
        expect(res.headers['x-total-count']).toBe('1');
      }));

  test('POST /transactions creates a transaction', () =>
    agent
      .post('/transactions')
      .set('Cookie', `accessToken=${token}`)
      .send({
        type: 'income',
        amount: 1200,
        category: 'Salary',
        date: '2026-07-17T12:00:00.000Z',
        description: 'Monthly salary'
      })
      .expect(200)
      .then(res => {
        expect(res.body.type).toBe('income');
        expect(res.body.amount).toBe(1200);
        expect(res.body.category).toBe('Salary');
      }));

  test('PATCH /transactions/:id updates a transaction', () =>
    agent
      .patch(`/transactions/${transaction.id}`)
      .set('Cookie', `accessToken=${token}`)
      .send({ amount: 30.75, description: 'Dinner' })
      .expect(200)
      .then(res => {
        expect(res.body.amount).toBe(30.75);
        expect(res.body.description).toBe('Dinner');
      }));

  test('DELETE /transactions/:id soft deletes a transaction', () =>
    agent
      .delete(`/transactions/${transaction.id}`)
      .set('Cookie', `accessToken=${token}`)
      .expect(200)
      .then(res => {
        expect(res.body.message).toBe('Transaction deleted successfully');
      }));

  test('POST /transactions rejects invalid payloads', () =>
    agent
      .post('/transactions')
      .set('Cookie', `accessToken=${token}`)
      .send({ type: 'expense', category: 'Food' })
      .expect(400)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 201, data: '/amount' }));
      }));
});

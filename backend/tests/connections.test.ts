// nexus/backend/tests/connections.test.ts
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';

let authToken: string;
let userId: string;
let companyId: string;

beforeAll(async () => {
  // Register and log in a test user
  const reg = await request(app).post('/api/auth/register').send({
    email: `conn-test-${Date.now()}@nexus.dev`,
    password: 'Test1234!',
    name: 'Connection Tester',
  });
  authToken = reg.body.token;
  userId = reg.body.user.id;

  // Get a company to connect with
  const companies = await prisma.company.findFirst({
    where: { ownerId: null }, // must not be owned by our user
  });
  companyId = companies!.id;
});

describe('POST /api/connections', () => {
  it('requires authentication', async () => {
    const res = await request(app).post('/api/connections').send({
      companyId, role: 'BUYER',
    });
    expect(res.status).toBe(401);
  });

  it('sends a connection request', async () => {
    const res = await request(app)
      .post('/api/connections')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ companyId, role: 'INVESTOR', message: 'Interested in investing' });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe('INVESTOR');
    expect(res.body.status).toBe('PENDING');
  });

  it('prevents duplicate connection requests', async () => {
    const res = await request(app)
      .post('/api/connections')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ companyId, role: 'BUYER' });

    expect(res.status).toBe(409);
  });

  it('rejects invalid role', async () => {
    const res = await request(app)
      .post('/api/connections')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ companyId, role: 'HACKER' });

    expect(res.status).toBe(422);
  });
});

describe('GET /api/connections', () => {
  it('returns the user\'s connections', async () => {
    const res = await request(app)
      .get('/api/connections')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].company).toBeDefined();
  });
});

afterAll(async () => {
  await prisma.connection.deleteMany({ where: { senderId: userId } });
  await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
});

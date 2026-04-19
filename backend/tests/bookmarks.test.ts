// nexus/backend/tests/bookmarks.test.ts
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';

let authToken: string;
let userId: string;
let companyId: string;

beforeAll(async () => {
  const reg = await request(app).post('/api/auth/register').send({
    email: `bm-test-${Date.now()}@nexus.dev`,
    password: 'Test1234!',
    name: 'Bookmark Tester',
  });
  authToken = reg.body.token;
  userId = reg.body.user.id;

  const company = await prisma.company.findFirst();
  companyId = company!.id;
});

describe('POST /api/bookmarks/:companyId', () => {
  it('bookmarks a company', async () => {
    const res = await request(app)
      .post(`/api/bookmarks/${companyId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Bookmarked');
  });

  it('is idempotent on double-bookmark', async () => {
    const res = await request(app)
      .post(`/api/bookmarks/${companyId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(201);
  });
});

describe('GET /api/bookmarks', () => {
  it('returns the user\'s bookmarks', async () => {
    const res = await request(app)
      .get('/api/bookmarks')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((c: any) => c.id === companyId)).toBe(true);
  });
});

describe('DELETE /api/bookmarks/:companyId', () => {
  it('removes a bookmark', async () => {
    const res = await request(app)
      .delete(`/api/bookmarks/${companyId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);

    // Verify removal
    const list = await request(app)
      .get('/api/bookmarks')
      .set('Authorization', `Bearer ${authToken}`);

    expect(list.body.some((c: any) => c.id === companyId)).toBe(false);
  });
});

afterAll(async () => {
  await prisma.bookmark.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { executeCode, getSupportedLanguages } from '../controllers/codeController.js';

function createMockReqRes({ body = {}, user = null } = {}) {
  const req = { body, user };
  const res = {
    statusCode: 200,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    }
  };
  return { req, res };
}

describe('Code Execution Controller & API Handlers', () => {
  it('getSupportedLanguages should return 200 with supported languages and limits', () => {
    const { req, res } = createMockReqRes();
    getSupportedLanguages(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.languages));
    assert.ok(res.body.languages.length >= 4);
    assert.ok(res.body.limits.timeoutMs > 0);
    assert.ok(res.body.limits.memoryLimit);
  });

  it('executeCode should return 400 when language is missing', async () => {
    const { req, res } = createMockReqRes({
      body: { code: 'print("hello")' }
    });
    let nextCalled = false;
    await executeCode(req, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('language'));
    assert.equal(nextCalled, false);
  });

  it('executeCode should return 400 when code is empty', async () => {
    const { req, res } = createMockReqRes({
      body: { language: 'python', code: '   ' }
    });
    await executeCode(req, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('code'));
  });

  it('executeCode should return 400 for unsupported language', async () => {
    const { req, res } = createMockReqRes({
      body: { language: 'unsupported_lang', code: 'print(1)' }
    });
    await executeCode(req, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('Unsupported'));
  });

  it('executeCode should handle execution and return structured result', async () => {
    const { req, res } = createMockReqRes({
      body: { language: 'python', code: 'print("Hello from test")' },
      user: { _id: 'test-user-id' }
    });
    await executeCode(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.status);
    assert.ok(res.body.data);
    assert.equal(typeof res.body.executionTime, 'number');
  });
});

const assert = require('node:assert/strict');
const test = require('node:test');
const loadSource = require('./load-source.cjs');
const createRequester = loadSource('src/javascripts/request.js', { setTimeout: fn => fn() });
function setup(send) {
  const events = { attempts: 0, unauthorized: 0, unavailable: 0, failed: 0, loading: [] };
  const request = createRequester({
    axios: { create() { return { request(config) { events.attempts++; return send(config); } }; } },
    baseURL: () => '/', token: () => 'token',
    loading: value => events.loading.push(value), failed: () => events.failed++,
    unauthorized: () => events.unauthorized++, unavailable: () => events.unavailable++
  });
  return { events, request };
}
test('401 rejects the original error and clears authentication once', async () => {
  const error = { response: { status: 401 } };
  const { events, request } = setup(() => Promise.reject(error));
  await assert.rejects(request({ method: 'GET' }), actual => actual === error);
  assert.equal(events.attempts, 1);
  assert.equal(events.unauthorized, 1);
  assert.deepEqual(events.loading, [true, false]);
});
test('503 and network read failures stop after three attempts', async () => {
  for (const error of [{ response: { status: 503 } }, new Error('offline')]) {
    const { events, request } = setup(() => Promise.reject(error));
    await assert.rejects(request({ method: 'GET' }), actual => actual === error);
    assert.equal(events.attempts, 3);
    assert.equal(events.unavailable, 1);
    assert.equal(events.failed, 1);
  }
});
test('writes never retry after transport failures', async () => {
  const { events, request } = setup(() => Promise.reject(new Error('timeout')));
  await assert.rejects(request({ method: 'POST' }));
  assert.equal(events.attempts, 1);
});
test('loading remains active until every tracked request settles', async () => {
  const settle = [];
  const { events, request } = setup(() => new Promise(resolve => settle.push(resolve)));
  const first = request({}); const second = request({});
  settle[0]({}); await first;
  assert.equal(events.loading.at(-1), true);
  settle[1]({}); await second;
  assert.equal(events.loading.at(-1), false);
});

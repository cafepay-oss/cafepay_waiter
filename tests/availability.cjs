const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-source.cjs');
test('failed availability update preserves server state and permits retry', async () => {
  let calls = 0;
  const module = load('src/store/product.js', {
    mixin: { methods: { request() { calls++; return Promise.reject(new Error('offline')); } } },
    message: { error() {} }
  });
  const product = { id: 1, available: true };
  assert.equal(await module.actions.changeAvailablity({}, product), false);
  assert.equal(product.available, true);
  await module.actions.changeAvailablity({}, product);
  assert.equal(calls, 2);
});
test('pending update blocks duplicate toggles', async () => {
  let resolve;
  const module = load('src/store/product.js', {
    mixin: { methods: { request() { return new Promise(done => { resolve = done; }); } } }, message: { error() {} }
  });
  const product = { id: 1, available: true };
  const update = module.actions.changeAvailablity({}, product);
  assert.equal(await module.actions.changeAvailablity({}, product), false);
  resolve({ data: { available: false } }); await update;
  assert.equal(product.available, false);
});

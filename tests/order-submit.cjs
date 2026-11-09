const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-source.cjs');
const component = load('src/views/Table.vue', { ProductCard: {}, printer: {} });
function vm(dispatch) {
  return { submitting: false, changes: [{ product: 4, count: -2, user_profile: 9, is_staff: false }],
    newOrders: [{ id: 3 }], tableOrders: [{ id: 4 }], sendOrderToKitchenPBRs: [],
    table: { id: 1, setDetailDate() {}, getTableProducts: () => [{ id: 5 }] }, $store: { dispatch } };
}
test('failed order request preserves every draft and count sign', async () => {
  const view = vm(() => Promise.reject(new Error('offline')));
  const snapshot = JSON.stringify([view.changes, view.newOrders, view.tableOrders]);
  assert.equal(await component.methods.sendBulkData.call(view), false);
  assert.equal(JSON.stringify([view.changes, view.newOrders, view.tableOrders]), snapshot);
  assert.equal(view.submitting, false);
});
test('pending request blocks duplicate orders and clears drafts only after success', async () => {
  let resolve; let calls = 0;
  const view = vm(() => { calls++; return new Promise(done => { resolve = done; }); });
  const pending = component.methods.sendBulkData.call(view);
  assert.equal(view.changes.length, 1);
  assert.equal(await component.methods.sendBulkData.call(view), false);
  assert.equal(calls, 1);
  resolve({ data: {} }); assert.equal(await pending, true);
  assert.deepEqual(view.changes, []); assert.deepEqual(view.newOrders, []);
  assert.deepEqual(view.tableOrders, [{ id: 5 }]);
});
test('atomic request preserves order ownership and original drafts', async () => {
  let request;
  const module = load('src/store/table.js', { mixin: { methods: { request(config) { request = config; return Promise.resolve({}); } } }, message: { error() {} } });
  const changes = [{ product: 4, count: -2, user_profile: 9, is_staff: false }, { product: 5, count: 1 }];
  await module.actions.changeProducts({ state: { localLoading: 0 } }, { table: 1, changes });
  assert.equal(request.url, 'api/v1/table/1/products/change/staff/');
  assert.deepEqual(request.data.remove, [{ product: 4, count: 2, user_profile: 9, is_staff: false }]);
  assert.equal(changes[0].count, -2);
});
test('removing an existing customer item keeps ownership separate from new staff additions', () => {
  const child = { userProfile: 9, isStaff: false, number: 2, price: 200, payed: 0, netAmount: 200 };
  const parent = { id: 4, number: 2, price: 200, payed: 0, netAmount: 200, children: [child] };
  const view = { submitting: false, changes: [{ product: 4, count: 1 }], tableOrders: [parent], newOrders: [] };
  component.methods.removeOrder.call(view, parent);
  assert.deepEqual(view.changes, [{ product: 4, count: 1 }, { product: 4, count: -1, user_profile: 9, is_staff: false }]);
  assert.equal(parent.number, 1);
  assert.equal(child.number, 1);
});

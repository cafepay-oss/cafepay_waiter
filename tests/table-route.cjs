const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-source.cjs');
const component = load('src/views/Table.vue', { ProductCard: {}, printer: {} });
test('table resolves from its stable URL identifier after store loading', () => {
  const table = { id: 12 };
  const vm = { tableId: '12', $store: { state: { tableModule: { tables: [] } } } };
  assert.equal(component.computed.table.call(vm), undefined);
  vm.$store.state.tableModule.tables.push(table);
  assert.equal(component.computed.table.call(vm), table);
});
test('absent table and menu produce empty render data', () => {
  assert.deepEqual(component.computed.tableProducts.call({ table: null }), []);
  assert.deepEqual(component.computed.categories.call({ activeMenu: null }), []);
  assert.deepEqual(component.computed.categoryProducts.call({ selectedCategory: null }), []);
});
test('initial orders appear without waiting for another socket message', () => {
  const vm = { changes: [], tableOrders: [] };
  const rows = [{ id: 1 }];
  assert.equal(component.watch.tableProducts.immediate, true);
  component.watch.tableProducts.handler.call(vm, rows);
  assert.equal(vm.tableOrders, rows);
});

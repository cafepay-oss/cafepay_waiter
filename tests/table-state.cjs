const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-source.cjs');
const admin = require('node:fs').existsSync(require('node:path').join(__dirname, '../src/modules/table.js'));
function setup() {
  const store = { state: { tableModule: { tables: [] }, productModule: { products: [] },
    accountModule: { user: { id: 1 } }, userModule: { user: { id: 1 } } } };
  const Table = load('src/models/TableClass.js', { store, Vue: { prototype: {} },
    Enums: { TableTokenTypes: { PAYMENT_ONLY: '4' } }, configs: {}, require: () => value => { if (value === undefined) throw new Error("Object argument required"); return JSON.stringify(value); },
    Customer: class { constructor(order) { this.id = order.user_profile.pk; this.orders = []; } },
    Order: class { constructor(order) { Object.assign(this, order); } }
  });
  return { Table, store };
}
test('table type derives immediately without waiting for merged table objects', () => {
  const { Table } = setup(); const table = new Table({ pk: 2 });
  table.mergedTablesId = [{ pk: 2 }, { pk: 1 }]; table.setTableType();
  assert.equal(table.tableType, 'merged');
  table.mergedTablesId = [{ pk: 2 }]; table.setTableType();
  assert.equal(table.tableType, 'fill');
  table.mergedTablesId = []; table.setTableType(); assert.equal(table.tableType, 'free');
});
test('nested table updates do not crash or duplicate notifications', () => {
  const { Table } = setup(); const table = new Table({ pk: 1 }); const changes = [];
  table.notificationHandler = (key, change) => changes.push([key, change]);
  table.diff({ nested: { count: 1 } }, { nested: { count: 2 } });
  assert.equal(changes.length, 1); assert.equal(changes[0][0], 'count');
});
test('missing catalog products remain visible without mutating server payloads', () => {
  const { Table } = setup(); const table = new Table({ pk: 1 });
  table.setAndResetTimer = () => {};
  const payload = { pk: 7, tables: [{ pk: 1 }], payment_info: {}, scanned: [], bill_products: [
    { pk: 8, product: 99, user_profile: { pk: 2 }, original_price: 100, count: 1 }
  ] };
  table.setDetailDate(payload);
  assert.equal(payload.bill_products[0].product, 99);
  assert.equal(table.customers[0].orders[0].product.id, 99);
  assert.equal(table.customers[0].orders[0].product.name, 'محصول حذف‌شده');
});
test('stale table events after a cafe switch do not dereference absent tables', () => {
  const module = load(admin ? 'src/modules/table.js' : 'src/store/table.js');
  const state = { tables: [] }; const event = { source: 'table.99.aggregate.', data: { pk: 1 } };
  assert.doesNotThrow(() => module.mutations.setTableAggregateData(state, event));
  assert.doesNotThrow(() => module.mutations.setTableDetailData(state, event));
});

test('added and deleted fields never pass undefined to object-hash', () => {
  const { Table } = setup(); const table = new Table({ pk: 1 }); const changes = [];
  table.notificationHandler = (key, change) => changes.push(change.type);
  table.diff({ old: 1 }, { fresh: 2 });
  assert.deepEqual(changes, ['deleted', 'added']);
});

test('menu-only tables are identified before table tokens load', () => {
  const { Table } = setup();
  assert.equal(new Table({ pk: 1, table_type: '0' }).isMenuOnly, true);
  assert.equal(new Table({ pk: 2, table_type: '1' }).isMenuOnly, false);
});

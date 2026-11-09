const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-source.cjs');
test('kitchen orders succeed when no printers exist', async () => {
  const component = load('src/views/Table.vue', { ProductCard: {} });
  const calls = [];
  const vm = { changes: [], submitting: false, sendingKitchen: false,
    sendOrderToKitchenPBRs: [{ children: [{ pbrs: [{ pbrId: 1 }] }] }], table: {},
    $store: { dispatch(name, data) { calls.push([name, data]); return Promise.resolve(name.includes('sendOrderKitchen')); } } };
  assert.equal(await component.methods.sendOrderToKitchen.call(vm), true);
  assert.deepEqual(vm.sendOrderToKitchenPBRs, []);
  assert.equal(calls[1][1].type, '0');
});
test('printer type codes select enabled printers without assuming database IDs', async () => {
  const requests = [];
  const module = load('src/store/printer.js', { mixin: { methods: { request(config) { requests.push(config); return Promise.resolve(); } } },
    printerTemplate: { sixCMPrinter: () => 'six', eightCMPrinter: () => 'eight' }, message: { error() {}, info() {} } });
  const state = { cloudPrinters: null };
  assert.equal(await module.actions.printOrders({ state }, { orders: [{}], table: {}, type: '0' }), false);
  state.cloudPrinters = [
    { pk: 40, is_on: true, width: '8cm', the_types: [{ pk: 99, type: '0' }] },
    { pk: 41, is_on: true, the_types: [{ type: '1' }] },
    { pk: 42, is_on: false, the_types: [{ type: '0' }] }
  ];
  await module.actions.printOrders({ state }, { orders: [{}], table: {}, type: '0' });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'api/v1/printer/40/job/create/');
  assert.equal(requests[0].data.raw_data, 'eight');
});

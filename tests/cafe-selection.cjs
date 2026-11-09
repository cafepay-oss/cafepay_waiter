const assert = require('node:assert/strict');
const test = require('node:test');
const loadSource = require('./load-source.cjs');
const admin = require('node:fs').existsSync(require('node:path').join(__dirname, '../src/modules/account.js'));
const source = admin ? 'src/modules/account.js' : 'src/store/user.js';
function setup(cafes, selected, stored = null) {
  const calls = []; const routes = [];
  const storage = { getItem: key => key === 'activeCafe' ? stored : 'token', setItem() {}, removeItem() {} };
  const account = loadSource(source, {
    window: { storage }, localStorage: storage,
    Cafe: class { constructor(data) { Object.assign(this, data); } },
    User: class { constructor(data) { Object.assign(this, data); } },
    mixin: { methods: { request(config) { calls.push(config); return Promise.resolve({ data: {} }); } } },
    router: { currentRoute: { path: '/table/123' }, replace(path) { routes.push(path); return Promise.resolve(); } },
    Toast: { open() {} }, message: { success() {}, error() {} }, i18n: { t: key => key }
  });
  const context = { state: { ...account.state, cafes, activeCafe: selected }, rootState: {}, getters: {},
    commit(name, value) { account.mutations[name](context.state, value); },
    dispatch(name) { calls.push(name); return Promise.resolve(); }
  };
  return { account, context, calls, routes };
}
test('invalid stored JSON cannot crash account initialization', () => {
  assert.doesNotThrow(() => setup([], null, '{invalid'));
});
test('empty and stale memberships route to selection without cafe requests', async () => {
  for (const cafes of [[], [{ id: 1 }, { id: 2 }]]) {
    const { account, context, calls, routes } = setup(cafes, { id: 99 });
    await account.actions.getUserData(context);
    assert.deepEqual(routes, ['/stores']);
    assert.equal(calls.includes('getCafeData'), false);
    assert.equal(Boolean(context.state.activeCafe && context.state.activeCafe.id), false);
  }
});
test('valid membership preserves a deep route', async () => {
  const { account, context, calls, routes } = setup([{ id: 1 }, { id: 2 }], { id: 2 });
  await account.actions.getUserData(context);
  assert.equal(context.state.activeCafe.id, 2);
  assert.equal(calls.includes('getCafeData'), true);
  assert.deepEqual(routes, []);
});
test('single membership replaces a stale selection', async () => {
  const { account, context } = setup([{ id: 1 }], { id: 99 });
  await account.actions.getUserData(context);
  assert.equal(context.state.activeCafe.id, 1);
});

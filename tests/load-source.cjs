const fs = require('node:fs');
const path = require('node:path');

module.exports = function loadSource(file, dependencies = {}) {
  let source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  if (file.endsWith('.vue')) source = source.match(/<script>([\s\S]*?)<\/script>/)[1];
  source = source.replace(/^import\s[\s\S]*?\sfrom\s+["'][^"']+["'];?\s*$/gm, '');
  source = source.replace('export default', 'return');
  return new Function(...Object.keys(dependencies), source)(...Object.values(dependencies));
};

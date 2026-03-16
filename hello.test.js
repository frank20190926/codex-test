const assert = require('assert');

const { greet } = require('./hello');

assert.strictEqual(greet('World'), 'Hello, World!');
assert.strictEqual(greet('Codex'), 'Hello, Codex!');

console.log('hello.test.js passed');

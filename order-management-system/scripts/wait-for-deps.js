#!/usr/bin/env node
// Simple wait-for-deps: checks TCP connect to host:port pairs before starting
const net = require('net');
const deps = [
  {
    host: process.env.DATABASE_HOST || 'postgres',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  },
  {
    host: process.env.KAFKA_BROKER
      ? process.env.KAFKA_BROKER.split(':')[0]
      : 'kafka',
    port: 9092,
  },
  {
    host: (
      process.env.ELASTICSEARCH_NODE || 'http://elasticsearch:9200'
    ).replace(/^https?:\/\//, ''),
    port: 9200,
  },
];

function waitFor(host, port, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function attempt() {
      const sock = net.createConnection({ host, port }, () => {
        sock.destroy();
        resolve(true);
      });
      sock.on('error', () => {
        sock.destroy();
        if (Date.now() - start > timeout)
          return reject(new Error(`Timeout waiting for ${host}:${port}`));
        setTimeout(attempt, 1000);
      });
    })();
  });
}

(async function () {
  for (const d of deps) {
    try {
      process.stdout.write(`Waiting for ${d.host}:${d.port}... `);
      await waitFor(d.host, d.port, 60000);
      console.log('ok');
    } catch (e) {
      console.warn(
        `Warning: dependency ${d.host}:${d.port} not available: ${e.message}`,
      );
    }
  }
  // Exec app start
  const { spawn } = require('child_process');
  const proc = spawn('node', ['dist/main'], { stdio: 'inherit' });
  proc.on('exit', (code) => process.exit(code));
})();

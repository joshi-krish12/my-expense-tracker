const http = require('http');

const postData = JSON.stringify({
  amount: 50.00,
  category: 'Test',
  description: 'Idempotency Test',
  date: '2023-10-27',
  idempotencyKey: 'key-12345'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/expenses',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

function makeRequest(label) {
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`${label}: Status ${res.statusCode} Response: ${data}`);
        resolve();
      });
    });
    req.on('error', (e) => {
      console.error(`${label}: problem with request: ${e.message}`);
      resolve();
    });
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('--- Idempotency Test ---');
  await makeRequest('Request 1');
  await makeRequest('Request 2 (Retry)');
  console.log('------------------------');
}

run();

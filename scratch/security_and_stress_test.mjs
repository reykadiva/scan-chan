import https from 'https';

const BASE_URL = 'https://scanchan.vercel.app';

function request(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE_URL);
    const start = performance.now();
    
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = https.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const latency = performance.now() - start;
        let json = null;
        try {
          json = JSON.parse(body);
        } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body,
          json,
          latency,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runSecurityTests() {
  console.log('=== [1] RUNNING SECURITY & ANTI-CHEAT PENETRATION TESTS ===\n');
  const results = [];

  // Test 1: Forged Cookie scan_session on GET /api/profile
  console.log('Test 1.1: Forged cookie scan_session on GET /api/profile');
  const res1 = await request('/api/profile', {
    headers: {
      Cookie: 'scan_session={"id":"forged_user_123","email":"hacker@evil.com","nickname":"Hacker"}',
    },
  });
  const pass1 = res1.status === 401;
  results.push({ name: 'Forged Cookie GET /api/profile', status: res1.status, pass: pass1, expected: 401 });
  console.log(`  -> Status: ${res1.status} (${pass1 ? 'PASS: 401 Unauthorized' : 'FAIL: Not blocked'})`);

  // Test 2: Forged Cookie scan_session on POST /api/actions/pet
  console.log('Test 1.2: Forged cookie scan_session on POST /api/actions/pet');
  const res2 = await request('/api/actions/pet', {
    method: 'POST',
    headers: {
      Cookie: 'scan_session={"id":"forged_user_123","email":"hacker@evil.com","nickname":"Hacker"}',
      'Content-Type': 'application/json',
    },
  });
  const pass2 = res2.status === 401;
  results.push({ name: 'Forged Cookie POST /api/actions/pet', status: res2.status, pass: pass2, expected: 401 });
  console.log(`  -> Status: ${res2.status} (${pass2 ? 'PASS: 401 Unauthorized' : 'FAIL: Not blocked'})`);

  // Test 3: Unauthenticated Progression Payload Injection on POST /api/profile
  console.log('Test 1.3: Unauthenticated progression payload injection on POST /api/profile');
  const res3 = await request('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      xp: 999999,
      streak: 999,
      level: 99,
      petHunger: 100,
      petAffection: 100,
      foodInventory: { '123456789': 99 },
    },
  });
  const pass3 = res3.status === 401;
  results.push({ name: 'Payload Injection (Unauthenticated)', status: res3.status, pass: pass3, expected: 401 });
  console.log(`  -> Status: ${res3.status} (${pass3 ? 'PASS: 401 Unauthorized' : 'FAIL: Not blocked'})`);

  // Test 4: Forged Cookie + Progression Injection on POST /api/profile
  console.log('Test 1.4: Forged Cookie + Progression Injection on POST /api/profile');
  const res4 = await request('/api/profile', {
    method: 'POST',
    headers: {
      Cookie: 'scan_session={"id":"forged_user_123"}',
      'Content-Type': 'application/json',
    },
    body: {
      xp: 999999,
      streak: 999,
      petName: 'Hacked Cat',
    },
  });
  const pass4 = res4.status === 401;
  results.push({ name: 'Forged Cookie + Progression Injection', status: res4.status, pass: pass4, expected: 401 });
  console.log(`  -> Status: ${res4.status} (${pass4 ? 'PASS: 401 Unauthorized' : 'FAIL: Not blocked'})`);

  // Test 5: Public Catalog Data Exposure on GET /api/products
  console.log('Test 1.5: Public Catalog Exposure on GET /api/products');
  const res5 = await request('/api/products?limit=10');
  const pass5 = res5.status === 200 && res5.json?.success === true;
  let noSensitiveLeaks = true;
  if (res5.json?.data && Array.isArray(res5.json.data)) {
    for (const item of res5.json.data) {
      if (item.user || item.email || item.password || item.hashedPassword) {
        noSensitiveLeaks = false;
        break;
      }
    }
  }
  results.push({ name: 'Public Catalog Endpoint', status: res5.status, pass: pass5 && noSensitiveLeaks });
  console.log(`  -> Status: ${res5.status}, Sensitive Leaks: ${!noSensitiveLeaks ? 'FOUND' : 'NONE'} (${pass5 && noSensitiveLeaks ? 'PASS' : 'FAIL'})`);

  // Test 6: Unauthenticated Action Scan
  console.log('Test 1.6: Unauthenticated POST /api/actions/scan');
  const res6 = await request('/api/actions/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { barcodeNumber: '8992753123456' },
  });
  const pass6 = res6.status === 401;
  results.push({ name: 'Unauthenticated POST /api/actions/scan', status: res6.status, pass: pass6, expected: 401 });
  console.log(`  -> Status: ${res6.status} (${pass6 ? 'PASS: 401 Unauthorized' : 'FAIL'})`);

  // Test 7: Unauthenticated Action Feed
  console.log('Test 1.7: Unauthenticated POST /api/actions/feed');
  const res7 = await request('/api/actions/feed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { barcode: '8992753123456', category: 'Snack' },
  });
  const pass7 = res7.status === 401;
  results.push({ name: 'Unauthenticated POST /api/actions/feed', status: res7.status, pass: pass7, expected: 401 });
  console.log(`  -> Status: ${res7.status} (${pass7 ? 'PASS: 401 Unauthorized' : 'FAIL'})`);

  return results;
}

async function runStressAndConcurrencyTests() {
  console.log('\n=== [2] RUNNING CONCURRENCY & STRESS TEST (3 WAVES OF 25 CONCURRENT REQUESTS) ===\n');

  const endpoints = [
    { name: 'GET /', path: '/', method: 'GET' },
    { name: 'GET /api/profile', path: '/api/profile', method: 'GET' },
    { name: 'GET /api/products?limit=5', path: '/api/products?limit=5', method: 'GET' },
    { name: 'POST /api/actions/feed', path: '/api/actions/feed', method: 'POST', body: { barcode: '8992753123456' } },
    { name: 'POST /api/actions/scan', path: '/api/actions/scan', method: 'POST', body: { barcodeNumber: '8992753123456' } },
  ];

  const allLatencies = [];
  const statusCounts = {};

  for (let wave = 1; wave <= 3; wave++) {
    console.log(`--- Executing Wave ${wave} (25 parallel requests across endpoints) ---`);
    const wavePromises = [];

    for (let i = 0; i < 25; i++) {
      const ep = endpoints[i % endpoints.length];
      wavePromises.push(
        request(ep.path, {
          method: ep.method,
          headers: ep.body ? { 'Content-Type': 'application/json' } : {},
          body: ep.body,
        }).then((res) => {
          allLatencies.push(res.latency);
          statusCounts[res.status] = (statusCounts[res.status] || 0) + 1;
          return { endpoint: ep.name, status: res.status, latency: res.latency };
        })
      );
    }

    const waveResults = await Promise.all(wavePromises);
    const waveAvg = waveResults.reduce((a, b) => a + b.latency, 0) / waveResults.length;
    console.log(`  Wave ${wave} completed. Total: ${waveResults.length} reqs, Avg Latency: ${waveAvg.toFixed(1)}ms`);
    await new Promise((r) => setTimeout(r, 800)); // Pause between waves
  }

  // Calculate statistics
  allLatencies.sort((a, b) => a - b);
  const minLatency = allLatencies[0];
  const maxLatency = allLatencies[allLatencies.length - 1];
  const p50 = allLatencies[Math.floor(allLatencies.length * 0.5)];
  const p95 = allLatencies[Math.floor(allLatencies.length * 0.95)];
  const p99 = allLatencies[Math.floor(allLatencies.length * 0.99)];
  const avg = allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length;

  console.log('\n--- Latency & Reliability Metrics ---');
  console.log(`Total Requests: ${allLatencies.length}`);
  console.log(`Status Distribution:`, statusCounts);
  console.log(`Min Latency: ${minLatency.toFixed(1)}ms`);
  console.log(`P50 (Median): ${p50.toFixed(1)}ms`);
  console.log(`P95: ${p95.toFixed(1)}ms`);
  console.log(`P99: ${p99.toFixed(1)}ms`);
  console.log(`Max Latency (Cold Start peak): ${maxLatency.toFixed(1)}ms`);
  console.log(`Average Latency: ${avg.toFixed(1)}ms`);

  const has500Errors = Object.keys(statusCounts).some((s) => Number(s) >= 500);
  console.log(`500 Internal Server Errors: ${has500Errors ? 'DETECTED (FAIL)' : 'ZERO (PASS)'}`);

  return {
    totalRequests: allLatencies.length,
    statusCounts,
    minLatency,
    maxLatency,
    p50,
    p95,
    p99,
    avg,
    has500Errors,
  };
}

async function main() {
  try {
    const secResults = await runSecurityTests();
    const stressResults = await runStressAndConcurrencyTests();
    console.log('\n=== JSON SUMMARY OUTPUT ===');
    console.log(JSON.stringify({ secResults, stressResults }, null, 2));
  } catch (e) {
    console.error('Test execution error:', e);
  }
}

main();

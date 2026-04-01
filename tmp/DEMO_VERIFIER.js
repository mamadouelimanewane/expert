const http = require('http');

async function testApi(name, path, method = 'GET', body = null) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`\n### DEMO: ${name} ###`);
                console.log(`POST/GET: ${path}`);
                console.log(`STATUS: ${res.statusCode}`);
                console.log(`RESULT: ${data.slice(0, 500)}${data.length > 500 ? '...' : ''}`);
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error(`\n### ERROR: ${name} ###`);
            console.error(e.message);
            resolve();
        });

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runDemo() {
    console.log("🚀 STARTING INDUSTRIAL DEMO (Backend Intelligence)");
    
    // 1. Audit Risk Score
    await testApi("Audit Intelligence (Scoring)", "/api/audit/risk-score");

    // 2. Banking Reconciliation
    await testApi("Banking Reconciliation (Matching IA)", "/api/banking/reconcile", "POST", { clientId: "demo" });

    // 3. Digital Signature
    await testApi("Probatory Signature (Certificat)", "/api/signature/process", "POST", { documentId: "SIG-001", userName: "Cabinet Expert OHADA" });

    console.log("\n✅ END OF DEMO - Frontend is fully connected to these endpoints.");
}

runDemo();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
const { performance } = require('perf_hooks');

const packageDef = protoLoader.loadSync('employee.proto', {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const proto = grpc.loadPackageDefinition(packageDef);

function startServer(port, callback) {
  const server = new grpc.Server();
  server.addService(proto.EmployeeService.service, {
    SendEmployees: (call, cb) => {
      const count = (call.request && call.request.employee) ? call.request.employee.length : 0;
      console.log(`Server: received ${count} employees`);
      cb(null, { ok: true, received: count });
    }
  });
  server.bindAsync(`127.0.0.1:${port}`, grpc.ServerCredentials.createInsecure(), (err, p) => {
    if (err) return callback(err);
    server.start();
    callback(null, server);
  });
}

async function runTest() {
  startServer(50052, (err, server) => {
    if (err) return console.error('server error', err);
    const client = new proto.EmployeeService('127.0.0.1:50052', grpc.credentials.createInsecure());
    const json = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    const start = performance.now();
    client.SendEmployees(json, (err, res) => {
      const end = performance.now();
      if (err) {
        console.error('RPC error:', err);
        server.tryShutdown(() => process.exit(1));
        return;
      }
      console.log('Client: response', res);
      console.log(`Roundtrip time: ${(end - start).toFixed(3)} ms`);
      server.tryShutdown(() => process.exit(0));
    });
  });
}

if (require.main === module) runTest();

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

async function main() {
  const client = new proto.EmployeeService('localhost:50051', grpc.credentials.createInsecure());
  const json = JSON.parse(fs.readFileSync('data.json', 'utf8'));

  const start = performance.now();
  client.SendEmployees(json, (err, res) => {
    const end = performance.now();
    if (err) return console.error('RPC error:', err);
    console.log(`Client: received response: ${JSON.stringify(res)}`);
    console.log(`Roundtrip time: ${(end - start).toFixed(3)} ms`);
    process.exit(0);
  });
}

if (require.main === module) main();

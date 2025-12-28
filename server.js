const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDef = protoLoader.loadSync('employee.proto', {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const proto = grpc.loadPackageDefinition(packageDef);

function SendEmployees(call, callback) {
  const count = (call.request && call.request.employee) ? call.request.employee.length : 0;
  console.log(`Server: received ${count} employees`);
  callback(null, { ok: true, received: count });
}

function main() {
  const server = new grpc.Server();
  server.addService(proto.EmployeeService.service, { SendEmployees });
  const addr = '0.0.0.0:50051';
  server.bindAsync(addr, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Server bind error:', err);
      return;
    }
    console.log(`gRPC server listening on ${addr}`);
    server.start();
  });
}

if (require.main === module) main();

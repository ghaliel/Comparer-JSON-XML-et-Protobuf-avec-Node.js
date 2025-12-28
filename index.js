const fs = require('fs');
const convert = require('xml-js');
const protobuf = require('protobufjs');
const { performance } = require('perf_hooks');

function now() {
  return performance.now();
}

try {
  // Charger la définition Protobuf
  const root = protobuf.loadSync('employee.proto');
  const EmployeeList = root.lookupType('Employees');

  // Construire la liste d'employés avec champs supplémentaires
  const employees = [];

employees.push({ id: 1, name: 'Ali', salary: 9000, email: 'ali@example.com', hireDate: '2020-01-15', position: 'Engineer', department: 'R&D', active: true });
employees.push({ id: 2, name: 'Kamal', salary: 22000, email: 'kamal@example.com', hireDate: '2018-06-03', position: 'Manager', department: 'Sales', active: true });
employees.push({ id: 3, name: 'Amal', salary: 23000, email: 'amal@example.com', hireDate: '2019-09-23', position: 'Analyst', department: 'Finance', active: false });

  // Objet racine
  let jsonObject = { employee: employees };

  // Fonction utilitaire de mesure sur N itérations
  function measure(fn, iterations = 1000) {
    const start = now();
    for (let i = 0; i < iterations; i++) fn();
    const end = now();
    return (end - start) / iterations; // ms per op
  }

  const iterations = 1000;

  // ---- JSON différents niveaux d'indentation ----
  const indents = [null, 2, 4];
  const jsonResults = [];

  indents.forEach((indent) => {
    const encodeFn = () => JSON.stringify(jsonObject, null, indent);
    const decodeFn = () => JSON.parse(encodeFn());

    const encMs = measure(encodeFn, iterations);
    const decMs = measure(() => JSON.parse(JSON.stringify(jsonObject)), iterations); // parse stringified once per op

    const data = JSON.stringify(jsonObject, null, indent);
    const filename = indent === null ? 'data.json' : `data.indent${indent}.json`;
    fs.writeFileSync(filename, data);

    jsonResults.push({ indent: indent === null ? 'compact' : indent, encodeMs: encMs, decodeMs: decMs, size: Buffer.byteLength(data) });
  });

  // ---- XML ----
  const xmlOptions = { compact: true, ignoreComment: true, spaces: 0 };
  const xmlEncodeFn = () => '<root>' + convert.json2xml(jsonObject, xmlOptions) + '</root>';
  const xmlEncMs = measure(xmlEncodeFn, iterations);
  const xmlData = xmlEncodeFn();
  const xmlDecodeMs = measure(() => JSON.parse(convert.xml2json(xmlData, { compact: true })), iterations);
  fs.writeFileSync('data.xml', xmlData);

  // ---- Protobuf ----
  let errMsg = EmployeeList.verify(jsonObject);
  if (errMsg) throw Error(errMsg);

  const pbEncodeFn = () => EmployeeList.encode(EmployeeList.create(jsonObject)).finish();
  const pbEncMs = measure(pbEncodeFn, iterations);
  const buffer = pbEncodeFn();
  fs.writeFileSync('data.bin', buffer);

  const pbDecodeFn = () => {
    const b = buffer;
    return EmployeeList.toObject(EmployeeList.decode(b), { longs: String, enums: String, defaults: true });
  };
  const pbDecMs = measure(pbDecodeFn, iterations);

  // Lecture depuis fichier et décodage
  const bufferFromFile = fs.readFileSync('data.bin');
  const decodedFromFile = EmployeeList.toObject(EmployeeList.decode(bufferFromFile), { longs: String, enums: String, defaults: true });

  // Lire le schéma .proto et l'afficher
  const protoSchema = fs.readFileSync('employee.proto', 'utf8');

  // --- Tailles ---
  const sizes = {
    data_files: jsonResults.reduce((acc, r) => { acc[`json_indent_${r.indent}`] = r.size; return acc; }, {}),
    xml: fs.statSync('data.xml').size,
    bin: fs.statSync('data.bin').size
  };

  // --- Affichage des résultats ---
  console.log('=== Résumé des mesures (moyennes sur', iterations, 'itérations) ===');
  jsonResults.forEach(r => {
    console.log(`JSON (indent=${r.indent}) encode: ${r.encodeMs.toFixed(6)} ms/op, decode: ${r.decodeMs.toFixed(6)} ms/op, size: ${r.size} bytes`);
  });

  console.log(`XML encode: ${xmlEncMs.toFixed(6)} ms/op, decode: ${xmlDecodeMs.toFixed(6)} ms/op, size: ${sizes.xml} bytes`);
  console.log(`Protobuf encode: ${pbEncMs.toFixed(6)} ms/op, decode: ${pbDecMs.toFixed(6)} ms/op, size: ${sizes.bin} bytes`);

  console.log('\nVérification de symétrie Protobuf (decode depuis file):', JSON.stringify(decodedFromFile) === JSON.stringify(jsonObject) ? 'OK' : 'DIFF');

  console.log('\nAperçu schema (employee.proto):\n');
  console.log(protoSchema);

  console.log('\nExtrait objet décodé (Protobuf depuis fichier, premier employé):\n', decodedFromFile.employee[0]);

  console.log('\nTailles détaillées:');
  Object.entries(sizes.data_files).forEach(([k,v]) => console.log(`${k}: ${v} bytes`));
  console.log(`xml: ${sizes.xml} bytes`);
  console.log(`bin: ${sizes.bin} bytes`);

  // Note: For a real gRPC integration, you can use @grpc/grpc-js + @grpc/proto-loader and stream these messages over the network via defined services.

} catch (err) {
  console.error('Erreur :', err.message);
  process.exit(1);
} 
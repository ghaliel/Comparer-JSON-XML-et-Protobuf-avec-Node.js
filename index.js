const fs = require('fs');
const convert = require('xml-js');
const protobuf = require('protobufjs');

try {
  // Charger la définition Protobuf
  const root = protobuf.loadSync('employee.proto');
  const EmployeeList = root.lookupType('Employees');

  // Construire la liste d'employés (ajout de champs : email, hire_date)
  const employees = [];

  employees.push({ id: 1, name: 'Ali', salary: 9000, email: 'ali@example.com', hireDate: '2020-01-15' });
  employees.push({ id: 2, name: 'Kamal', salary: 22000, email: 'kamal@example.com', hireDate: '2018-06-03' });
  employees.push({ id: 3, name: 'Amal', salary: 23000, email: 'amal@example.com', hireDate: '2019-09-23' });

  // Objet racine
  let jsonObject = { employee: employees };

  // ---------- JSON (compact) ----------
  console.time('JSON encode');
  let jsonData = JSON.stringify(jsonObject);
  console.timeEnd('JSON encode');

  console.time('JSON decode');
  let jsonDecoded = JSON.parse(jsonData);
  console.timeEnd('JSON decode');

  // ---------- JSON (pretty) ----------
  console.time('JSON pretty encode');
  let jsonPretty = JSON.stringify(jsonObject, null, 2);
  console.timeEnd('JSON pretty encode');

  console.time('JSON pretty decode');
  let jsonPrettyDecoded = JSON.parse(jsonPretty);
  console.timeEnd('JSON pretty decode');

  // ---------- XML ----------
  const options = { compact: true, ignoreComment: true, spaces: 0 };

  console.time('XML encode');
  let xmlData = "<root>" + convert.json2xml(jsonObject, options) + "</root>";
  console.timeEnd('XML encode');

  console.time('XML decode');
  let xmlJson = convert.xml2json(xmlData, { compact: true });
  let xmlDecoded = JSON.parse(xmlJson);
  console.timeEnd('XML decode');

  // ---------- Protobuf ----------
  console.time('Protobuf verify');
  let errMsg = EmployeeList.verify(jsonObject);
  console.timeEnd('Protobuf verify');

  if (errMsg) {
    throw Error(errMsg);
  }

  console.time('Protobuf encode');
  let message = EmployeeList.create(jsonObject);
  let buffer = EmployeeList.encode(message).finish();
  console.timeEnd('Protobuf encode');

  // Écrire le binaire dans un fichier distinct (data.bin)
  fs.writeFileSync('data.bin', buffer);

  console.time('Protobuf decode');
  let decodedMessage = EmployeeList.decode(buffer);
  let protoDecoded = EmployeeList.toObject(decodedMessage);
  console.timeEnd('Protobuf decode');

  // ---------- Lire le binaire depuis le disque et décoder (vérification de symétrie) ----------
  console.time('Protobuf decode-from-file');
  let bufferFromFile = fs.readFileSync('data.bin');
  let decodedFromFile = EmployeeList.decode(bufferFromFile);
  let protoDecodedFromFile = EmployeeList.toObject(decodedFromFile);
  console.timeEnd('Protobuf decode-from-file');

  // ---------- Écriture des fichiers ----------
  fs.writeFileSync('data.json', jsonData);
  fs.writeFileSync('data.pretty.json', jsonPretty);
  fs.writeFileSync('data.xml', xmlData);

  // ---------- Mesure des tailles ----------
  const jsonFileSize = fs.statSync('data.json').size;
  const jsonPrettySize = fs.statSync('data.pretty.json').size;
  const xmlFileSize = fs.statSync('data.xml').size;
  const binFileSize = fs.statSync('data.bin').size;

  console.log(`Taille de 'data.json'        : ${jsonFileSize} octets`);
  console.log(`Taille de 'data.pretty.json': ${jsonPrettySize} octets`);
  console.log(`Taille de 'data.xml'         : ${xmlFileSize} octets`);
  console.log(`Taille de 'data.bin'         : ${binFileSize} octets`);

  // Vérifications et symétrie
  const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  console.log('\nVérification JSON décodé:', deepEqual(jsonDecoded, jsonObject) ? 'OK' : 'NON');
  console.log('Vérification JSON pretty décodé:', deepEqual(jsonPrettyDecoded, jsonObject) ? 'OK' : 'NON');
  console.log('Vérification XML décodé (extrait):', xmlDecoded.root && xmlDecoded.root.employee ? 'OK' : '—');
  console.log('Vérification Protobuf décodé:', deepEqual(protoDecoded, jsonObject) ? 'OK' : 'NON');
  console.log('Vérification Protobuf décodé depuis fichier:', deepEqual(protoDecodedFromFile, jsonObject) ? 'OK' : 'NON');

  // Afficher échantillon
  console.log('\nExemple JSON décodé (extrait):', jsonDecoded.employee[0]);
  console.log('\nExemple Protobuf décodé depuis fichier (extrait):', protoDecodedFromFile.employee[0]);

} catch (err) {
  console.error('Erreur :', err.message);
  process.exit(1);
} 
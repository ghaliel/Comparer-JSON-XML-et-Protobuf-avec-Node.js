# Comparer JSON / XML / Protobuf (Node.js) 🚀

**Lab** pour comparer la taille et les performances d'encodage/décodage entre **JSON**, **XML** et **Protobuf**, et démontrer une intégration basique gRPC.

---

## ✅ Contenu du dépôt

- `index.js` — bench & génération de fichiers (`data.json`, `data.indent2.json`, `data.indent4.json`, `data.xml`, `data.bin`) et mesures (encode/decode). 🔧
- `employee.proto` — définition Protobuf (schema + service gRPC).
- `server.js` / `client.js` — exemple simple gRPC (service persistant et client).
- `grpc_test.js` — test serveur+client dans un même processus (utile pour bench rapide).
- `docs/screenshots/` — dossier pour **vos captures d'écran** (placeholders fournis).

---

## ▶️ Démarrage rapide

### Prérequis
- Node.js (16+ recommandé)

### Installation
```bash
npm install
```

### Exécuter le benchmark / générer les fichiers
```bash
node index.js
# ou
npm start
```

### Tester gRPC
- Démarrer un serveur persistant :
```bash
node server.js
```
- Lancer le client depuis un autre terminal :
```bash
node client.js
```
- Test rapide (serveur+client ensemble) :
```bash
node grpc_test.js
```

---

## 📸 Captures d'écran


![Benchmark terminal]

<img width="609" height="187" alt="Screenshot 2025-12-28 031605" src="https://github.com/user-attachments/assets/e363361c-9b64-43ff-97c7-b6915eab2aa4" />


<img width="427" height="106" alt="Screenshot 2025-12-28 031619" src="https://github.com/user-attachments/assets/3c51ff9e-919b-4102-8902-dbe1455af393" />


![Tailles fichiers]

<img width="333" height="84" alt="Screenshot 2025-12-28 031613" src="https://github.com/user-attachments/assets/38350f8a-816a-48c4-a9dc-013f931f6988" />

![Les Fichiers]

<img width="518" height="283" alt="Screenshot 2025-12-28 031628" src="https://github.com/user-attachments/assets/224a3e45-9827-4e16-87e3-c7c1a228470d" />
<img width="554" height="271" alt="Screenshot 2025-12-28 032156" src="https://github.com/user-attachments/assets/05dca59b-8fc7-48f3-840d-16fe64f26cf3" />

![gRPD tests ]
<img width="1623" height="322" alt="Screenshot 2025-12-28 032557" src="https://github.com/user-attachments/assets/7179c060-b2ad-42bd-8549-4d43095ac1fb" />


![Results ]

<img width="554" height="271" alt="Screenshot 2025-12-28 032156" src="https://github.com/user-attachments/assets/b3d6db4d-b5e3-40fb-b7ef-0e3aabd386e2" />
<img width="471" height="244" alt="Screenshot 2025-12-28 032203" src="https://github.com/user-attachments/assets/c4d5ba87-9217-4013-81bd-148e2be84b94" />


---

## 📊 Interprétation (extrait)
- **Protobuf**: plus compact (taille binaire faible) et rapide pour encode/decode.
- **JSON**: lisible, bon compromis; indentation augmente la taille.
- **XML**: plus verbeux et plus lent sur ces tests.

> Pour des mesures robustes : lancer plusieurs itérations, mesurer moyenne + écart-type, et tester en conditions réseau.

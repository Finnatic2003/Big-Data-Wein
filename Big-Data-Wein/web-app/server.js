const mariadb = require("mariadb");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { program: optionparser } = require("commander");
const app = express();
const port = 3000;
const { Kafka } = require("kafkajs");

// Middleware für JSON-Parsing, CORS und statische Dateien
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Definieren der Kommandozeilenoptionen
let options = optionparser
 .storeOptionsAsProperties(true)
 // Web server
 .option("--port <port>", "Web server port", 3000)
 // Kafka options
 .option(
  "--kafka-broker <host:port>",
  "Kafka bootstrap host:port",
  "my-cluster-kafka-bootstrap:9092"
 )
 .option(
  "--kafka-topic-tracking <topic>",
  "Kafka topic to tracking data send to",
  "tracking-data"
 )
 .option(
  "--kafka-client-id < id > ",
  "Kafka client ID",
  "tracker-" + Math.floor(Math.random() * 100000)
 )

 // Database options
 .option("--mariadb-host <host>", "MariaDB host", "big-data-mariadb-service")
 .option("--mariadb-port <port>", "MariaDB port", 3306)
 .option("--mariadb-schema <db>", "MariaDB Schema/database", "popular")
 .option("--mariadb-username <username>", "MariaDB username", "root")
 .option("--mariadb-password <password>", "MariaDB password", "ePddAss2024")
 // Misc
 .addHelpCommand()
 .parse()
 .opts();

// -------------------------------------------------------
// Kafka Configuration
// -------------------------------------------------------

// Kafka connection
const kafka = new Kafka({
 clientId: options.kafkaClientId,
 brokers: [options.kafkaBroker],
 retry: {
  retries: 0,
 },
});

const producer = kafka.producer();
// End

// Send tracking message to Kafka
async function sendTrackingMessage(data) {
 //Ensure the producer is connected
 console.log("Phase0");
 await producer.connect();
 console.log("Phase1");
 //Send message
 let result = await producer.send({
  topic: options.kafkaTopicTracking,
  messages: [{ value: JSON.stringify(data) }],
 });
 console.log("Phase2");

 console.log("Send result:", result);
 return result;
}
// End

// -------------------------------------------------------
// Database Configuration
// -------------------------------------------------------

// MariaDB-Verbindungspool
const pool = mariadb.createPool({
 host: options.mariadbHost,
 port: options.mariadbPort,
 database: options.mariadbSchema,
 user: options.mariadbUsername,
 password: options.mariadbPassword,
 connectionLimit: 5,
});

// Funktion zur Verbindung mit MariaDB und Erstellen der Tabelle 'logs'
async function connect() {
 let conn;
 try {
  conn = await pool.getConnection();
  console.log("Connected to MariaDB!");
  // console.log("Table 'logs' is ready");
 } catch (err) {
  console.error("Error connecting to MariaDB:", err);
 } finally {
  if (conn) conn.end();
 }
}

// Route zum Empfangen und Speichern von Klick-Logs
app.post("/logClick", async (req, res) => {
 console.log("Klappt");
 const product = req.body.product;
 console.log("Empfangener Produktklick:", product);
 console.log(result);
});

// Funktion zum Senden der HTML-Antwort für Produktseite
function sendResponse(res, html) {
 res.send(`<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Produkt 1</title>
    <link rel="stylesheet" href="produkt.css">
</head>
<body>
    <header>
        <h1>Produkt 1</h1>
	${html}
    </header>
    <div class="container">
        <div class="content">
            <div class="text">
                <h2>Produkt 1</h2>
                <p>Der Spätburgunder, auch als Pinot Noir bekannt, ist eine der bedeutendsten und qualitativ hochwertigsten Rotweinsorten. Ursprünglich aus Burgund stammend, hat sich die Rebsorte seit den 1990er Jahren auch in Deutschland etabliert, mit Hauptanbaugebieten in Baden und Rheinhessen. Dieser Edelwein erfordert viel Sorgfalt und optimale Bedingungen, um sein volles Potenzial zu entfalten. Spätburgunder-Weine sind meist trocken, samtig und fruchtig im Aroma, und werden oft in Barriquefässern ausgebaut. Die Rebsorte kann auch für die Herstellung von Roséweinen, Sekten und dem besonderen "Blanc des Noirs" verwendet werden.</p>
                <a href="/">Zurück zur Startseite</a>
            </div>
        </div>
    </div>
    <footer>
        <p>&copy; 2024 Unsere Produktseite</p>
    </footer>
</body>
</html>	`);
}

// Funktion zum Senden der HTML-Antwort für Admin-Dashboard
function sendAdminResponse(res, html) {
 res.send(`	
    <!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>

    <script>
        
    </script>

</head>
<body>


    <header>
        <h1>Admin Dashboard</h1>
    </header>
    <div class="container">
        <h2>Logs</h2>
    ${html}
    </div>
    <footer>
        <p>&copy; 2024 Admin Dashboard</p>
    </footer>
</body>
</html>
    `);
}
async function executeQuery(query, data) {
 let connection;
 try {
  connection = await pool.getConnection();
  console.log("Executing query ", query);
  let res = await connection.query(query);
  console.log(res);
  return res;
 } finally {
  if (connection) connection.end();
 }
}

// Funktion zum Abrufen der Logs aus der MariaDB
async function getLogs() {
 //const data = await executeQuery("describe popular.logs;", []);
 const data = await executeQuery("select * from popular.logs", []);

 if (data) {
  return data;
 } else {
  throw "No missions data found";
 }
}

// Route für das Admin-Dashboard
app.get("/admin", (req, res) => {
 getLogs().then((values) => {
  const logsHtml = values
   .map((m) => `<p> ${m.wein}: ${Number(m.count)} </p>`)
   .join(", ");
  sendAdminResponse(res, logsHtml);
 });
});

// Route zum Empfangen der Produktklicks
app.get("/wein/:weinen", (req, res) => {
 let wein = req.params["weinen"];

 console.log("DAs ist Wein:", wein);
 sendTrackingMessage({
  wein: wein,
  timestamp: Math.floor(new Date() / 1000),
 }).then(() => console.log("Successful"));
 sendResponse(res, "");
});

// Server starten
app.listen(port, () => {
 console.log(`Server läuft`);
});

// Initialisierung der Verbindung zu Kafka und MariaDB
// sendTrackingMessage("test");
connect();

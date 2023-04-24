const sqlite3 = require("sqlite3").verbose();
const when = require("when");
let db;

const initPG = (userDir) => {
  return when.promise((resolve, reject) => {
    db = new sqlite3.Database(`${userDir}/nodered.db`, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
};

const createTable = async () => {
  if (!db) throw new Error("No sqlite instance");
  console.log("create sqlite tables");
  const query = `
    CREATE TABLE IF NOT EXISTS "eConfigs" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appname VARCHAR(255) NOT NULL,
      flows TEXT,
      credentials TEXT,
      packages TEXT,
      settings TEXT
    );
  `;
  return when.promise((resolve, reject) => {
    db.exec(query, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const doSQL = async (query, values) => {
  if (!db) throw new Error("No sqlite instance");
  return when.promise((resolve, reject) => {
    db.all(query, values, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          rows,
          rowCount: rows.length,
        });
      }
    });
  });
};

const loadConfig = async (appname) => {
  const query = 'SELECT * FROM "eConfigs" WHERE appname = $1';
  const data = await doSQL(query, [JSON.stringify(appname)]);
  if (data && data.rowCount > 0) {
    let retData = data.rows[0];
    for (let key in retData) {
      if (retData[key]) {
        retData[key] = JSON.parse(retData[key]);
      }
    }
    return retData;
  }
  return null;
};

const saveConfig = async (appname, params) => {
  const columns = [
    "appname",
    "flows",
    "credentials",
    "packages",
    "settings",
    "id",
  ];
  let data = await loadConfig(appname);
  let query;
  let values;
  if (data) {
    data = Object.assign(data, params);
    query =
      'UPDATE "eConfigs" SET appname = $1, flows = $2, credentials = $3, packages = $4, settings = $5 WHERE id = $6';
    values = columns.map((c) => (data[c] ? JSON.stringify(data[c]) : ""));
  } else {
    data = params;
    query =
      'INSERT INTO "eConfigs"(appname, flows, credentials, packages, settings) VALUES($1, $2, $3, $4, $5)';
    values = columns
      .slice(0, 6)
      .map((c) => (data[c] ? JSON.stringify(data[c]) : ""));
  }
  await doSQL(query, values);
};

const removeConfig = async (appname) => {
  const query = 'DELETE FROM "eConfigs" WHERE appname = $1';
  await doSQL(query, [JSON.stringify(appname)]);
};

exports.initPG = initPG;
exports.createTable = createTable;
exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.removeConfig = removeConfig;

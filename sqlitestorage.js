const when = require("when");
const sqliteutil = require("./sqliteutil");

let settings;
let appname;

function timeoutWrap(func) {
  return when.promise(function (resolve, reject, notify) {
    const promise = func().timeout(5000, "timeout");
    promise.then(function (a, b, c, d) {
      resolve(a, b, c, d);
    });
    promise.otherwise(function (err) {
      console.log("func", func);
      console.log("timeout err", err);
      console.log("TIMEOUT: ", func.name);
      if (err == "timeout") {
        reject(err);
      }
    });
  });
}

function getFlows() {
  console.log("getFlows");
  return when.promise(async (resolve, reject, notify) => {
    try {
      const data = await sqliteutil.loadConfig(appname);
      if (data && data.flows) {
        resolve(data.flows);
      } else {
        // console.log("Prepopulate Flows");
        // let flow = fs.readFileSync(__dirname + "/defaults/flow.json", "utf8");
        // let flows = JSON.parse(flow);
        // let secureLink = process.env.SECURE_LINK;
        // await sqliteutil.saveConfig(appname, { appname, flows, secureLink });
        resolve([]);
      }
    } catch (err) {
      reject(err);
    }
  });
}

function saveFlows(flows) {
  console.log("saveFlows");
  return when.promise(async (resolve, reject, notify) => {
    try {
      let secureLink = process.env.SECURE_LINK;
      await sqliteutil.saveConfig(appname, { appname, flows, secureLink });
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

function getCredentials() {
  console.log("getCredentials");
  return when.promise(async (resolve, reject, notify) => {
    try {
      const data = await sqliteutil.loadConfig(appname);
      if (data && data.credentials) {
        resolve(data.credentials);
      } else {
        resolve({});
      }
    } catch (err) {
      reject(err);
    }
  });
}

function saveCredentials(credentials) {
  console.log("saveCredentials");
  return when.promise(async (resolve, reject, notify) => {
    try {
      await sqliteutil.saveConfig(appname, { appname, credentials });
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

function getSettings() {
  console.log("getSettings");
  return when.promise(async (resolve, reject, notify) => {
    try {
      const data = await sqliteutil.loadConfig(appname);
      if (data && data.settings) {
        resolve(data.settings);
      } else {
        resolve({});
      }
    } catch (err) {
      reject(err);
    }
  });
}

function saveSettings(settings) {
  console.log("saveSettings");
  return when.promise(async (resolve, reject, notify) => {
    try {
      await sqliteutil.saveConfig(appname, { appname, settings });
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

const sqlitestorage = {
  init: function (_settings) {
    settings = _settings;
    appname = settings.appName || require("os").hostname();
    return when.promise(async (resolve, reject, notify) => {
      try {
        const db = await sqliteutil.initPG(settings.userDir);
        await sqliteutil.createTable();
        resolve(db);
      } catch (err) {
        reject(err);
      }
    });
  },
  getFlows: function () {
    return timeoutWrap(getFlows);
  },
  saveFlows: function (flows) {
    return timeoutWrap(function () {
      return saveFlows(flows);
    });
  },

  getCredentials: function () {
    return timeoutWrap(getCredentials);
  },

  saveCredentials: function (credentials) {
    return timeoutWrap(function () {
      return saveCredentials(credentials);
    });
  },

  getSettings: function () {
    return timeoutWrap(getSettings);
  },

  saveSettings: function (data) {
    return timeoutWrap(function () {
      return saveSettings(data);
    });
  },
};

module.exports = sqlitestorage;

const axios = require("axios");
const WebSocket = require("ws");

async function alpha(hash, type) {
  try {
    const res = await axios.post(
      "https://www.cmd5.org/",
      new URLSearchParams({
        __EVENTTARGET: "Button1",
        __VIEWSTATE: "6fEUcEEj0b0eN1Obqeu4TSsOBdS0APqz...", // Replace if dynamic
        ctl00$ContentPlaceHolder1$TextBoxInput: hash,
        ctl00$ContentPlaceHolder1$InputHashType: type,
        ctl00$ContentPlaceHolder1$Button1: "decrypt",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0",
        },
      }
    );
    const match = res.data.match(/<span id="LabelAnswer"[^>]+?>(.+)<\/span>/);
    return match ? match[1] : null;
  } catch (err) {
    return null;
  }
}

async function beta(hash, type) {
  return new Promise((resolve) => {
    const url = "wss://md5hashing.net/sockjs/697/etstxji0/websocket";
    const ws = new WebSocket(url);

    ws.on("open", () => {
      ws.send(
        '["{\\"msg\\":\\"connect\\",\\"version\\":\\"1\\",\\"support\\":[\\"1\\",\\"pre2\\",\\"pre1\\"]}"]'
      );
      const msg = `["{\\"msg\\":\\"method\\",\\"method\\":\\"hash.get\\",\\"params\\":[\\"${type}\\",\\"${hash}\\"],\\"id\\":\\"1\\"}"]`;
      ws.send(msg);
    });

    ws.on("message", (data) => {
      const message = data.toString(); // convert to string
      const match = message.match(/"value":"([^"]+)"/);
      if (match) {
        ws.close();
        return resolve(match[1]);
      }
    });

    ws.on("close", () => resolve(null));
    ws.on("error", () => resolve(null));
  });
}

async function gamma(hash) {
  try {
    const res = await axios.get(`https://www.nitrxgen.net/md5db/${hash}`);
    return res.data || null;
  } catch {
    return null;
  }
}

async function theta(hash, type) {
  try {
    const MD5DECRYPT_EMAIL = "noyile6983@lofiey.com";
    const MD5DECRYPT_CODE = "fa9e66f3c9e245d6";
    const res = await axios.get(
      `https://md5decrypt.net/Api/api.php?hash=${hash}&hash_type=${type}&email=${MD5DECRYPT_EMAIL}&code=${MD5DECRYPT_CODE}`
    );
    return res.data || null;
  } catch {
    return null;
  }
}

const hashMap = {
  32: { type: "md5", methods: [alpha, beta, gamma, theta] },
  40: { type: "sha1", methods: [alpha, beta, theta] },
  64: { type: "sha256", methods: [alpha, beta, theta] },
  96: { type: "sha384", methods: [alpha, beta, theta] },
  128: { type: "sha512", methods: [alpha, beta, theta] },
};

async function crackHash(hash) {
  const config = hashMap[hash.length];
  if (!config) return null;

  for (const method of config.methods) {
    const result = await method(hash, config.type);
    if (result) return result;
  }

  return null;
}

module.exports = { crackHash };

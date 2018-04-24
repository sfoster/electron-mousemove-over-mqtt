module.exports = {
  CLOUDMQTT_URL: process.env.CLOUDMQTT_URL || "mqtt://localhost:18443",
  CLIENT_ID: process.env.CLIENT_ID || "electron-" + Math.random().toString(16).substr(2, 8),
  USERNAME: process.env.CLIENT_ID || 'electronA',
  PASSWORD: process.env.PASSWORD,
}

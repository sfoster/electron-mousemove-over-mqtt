# electron-mousemove-over-mqtt

## Getting started

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/sfoster/electron-mousemove-over-mqtt
# Go into the repository
cd electron-mousemove-over-mqtt
# Install dependencies
npm install

## Configuring and running the app

You'll want to edit config.js to change the URL to your MQTT broker and any default auth details you want to hardcode. Note that these credentials are passed to the MQTT broker. If you are using a local install of mosquitto or an open test broker like test.mosquitto.org, USERNAME and PASSWORD can be left undefined or set to anything. But to distinguish between clients, do supply a CLIENT_ID.

# Run the app with some environment vars to authenticate (change to your values!)
CLIENT_ID=electronB PASSWORD=123456 CLOUDMQTT_URL=mqtt://brokerhost:port npm start
```

## Notes & Status

This is hacked together as a working example of passing data between 2 connected clients.

The work to handshake and pair up via the 'concierge' server is incomplete, and I've hard-coded the pairing for now based on the CLIENT_ID, so that clientNameA pairs with clientNameB, where clientName is whatever value you defined for CLIENT_ID.

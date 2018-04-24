const mqtt = require('mqtt');

class PlayerClient {
  constructor(options={}) {
    this.pairId = null;
    this.connected =false;
    this.options = options;
  }
  init() {
    console.log("init: connecting to mqtt broker at: ", this.options.CLOUDMQTT_URL);
    const connectOptions = {
      clientId: this.options.CLIENT_ID,
      username: this.options.USERNAME,
      password: this.options.PASSWORD,
      reconnectPeriod: 10*1000
    };

    // create the mqtt client using the url + options (auth details, etc.)
    // TODO: if we fail to connect due to an auth error, currently this will
    // keep trying again and again which is a bit daft.
    this.mqttClient = mqtt.connect(this.options.CLOUDMQTT_URL, connectOptions);
    let mqttClient = this.mqttClient

    // hook up handlers for the various events
    mqttClient.on('connect', this.onConnect.bind(this));
    mqttClient.on('disconnect', this.onDisconnect.bind(this));
    mqttClient.on('close', () => {
      console.log('mqttClient closed');
    });
    mqttClient.on('offline', () => {
      console.log('mqttClient went offline');
    });
    mqttClient.on('error', (msg) => {
      this.pairId = null;
      if (msg.toString().includes("Connection refused")) {
        console.log('mqttClient connection refused');
      } else {
        console.log('mqttClient connection-error', err);
      }
    });
    mqttClient.on('end', () => {
      this.pairId = null;
      console.log('mqttClient end');
    });
    mqttClient.on('message', (topic, message) => {
      this.options.VERBOSE && console.log("got message: ", topic, message);

      if (topic.startsWith(`/${this.pairId}/`)) {
        return this.onPairMessage(topic, message);
      }
      console.log("no handler for topic: ", topic);
    });
  }

  onConnect() {
    console.log('mqttClient connected to: ', this.options.CLOUDMQTT_URL);
    this.connected = true;
    let mqttClient = this.mqttClient;

    this.sendMessage("join", `${this.options.CLIENT_ID} is alive`);

    setTimeout(() => {
      let pairId;
      if (this.options.CLIENT_ID.endsWith('A')) {
        pairId = 'electronB';
      } else {
        pairId = 'electronA';
      }
      console.log(`faking the pairing to ${pairId}`);
      this.changePair(pairId);
    }, 1000);
  }

  onDisconnect() {
    console.log('player mqtt client disconnected');
    this.connected = false;
    this.pairId = null;
    this.mqttClient = null;
  }

  changePair(id) {
    let mqttClient = this.mqttClient;
    if (this.pairId) {
      mqttClient.unsubscribe(`/${this.pairId}/positions`);
    }
    if (id) {
      this.pairId = id;
      mqttClient.subscribe(`/${this.pairId}/positions`);
    }
  }

  onPairMessage(topic, message, packet) {
    if (topic.endsWith('positions')) {
      message = message.toString();
      let positions = JSON.parse(message);
      let posn = positions.shift();
      display.drawDot(posn, 'blue');
    } else {
      this.options.VERBOSE && console.log(`Unhandled pair message ${topic}: ${message.toString()}`);
    }
  }

  sendMessage(name, messageData) {
    let mqttClient = this.mqttClient;
    let topic = `/${this.options.CLIENT_ID}/${name}`;
    let message = JSON.stringify(messageData);
    this.options.VERBOSE && console.log(`sendMessage, topic: ${topic}, message: `, messageData);
    mqttClient.publish(topic, message);
  }
};

module.exports = PlayerClient;

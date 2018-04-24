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
      resubscribe: false,
      reconnectPeriod: 10*1000
    };

    // create the mqtt client using the url + options (auth details, etc.)
    this.mqttClient = mqtt.connect(this.options.CLOUDMQTT_URL, connectOptions);
    let mqttClient = this.mqttClient

    // hook up handlers for the various events
    mqttClient.on('connect', this.onConnect.bind(this));
    mqttClient.on('disconnect', this.onDisconnect.bind(this));
    mqttClient.on('close', (arg) => {
      console.log('mqttClient closed', arg);
    });
    mqttClient.on('offline', () => {
      console.log('mqttClient offline');
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
      if (topic == '/consierge/recent') {
        return this.onRecent(message);
      }
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
    // subscribe to the concierge recents feed
    // console.log("subscribe to /consierge/recent");
    // mqttClient.subscribe('/consierge/recent', (err, granted) => {
    //   if (err) {
    //     console.warn("Failed to subscribe to /concierge/recent: ", err.message);
    //     return;
    //   }
    //   console.log("ok, subscribed:", granted);
    // });
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

  onRecent(topic, message) {
    // we expect an array like:
    // [{id: 'asdasd', timestamp: 'asfasdf'},{id: 'aasd', timestamp: 'asfasdf'}]
    this.options.VERBOSE && console.log("Raw recents message: ", message);
    if (typeof message == "string") {
      message = JSON.parse(message);
    }
    let recents = message.filter(status => {
      return status.id !== this.options.CLIENT_ID
    });
    this.options.VERBOSE && console.log("Recents: ", recents);
    for (let status of recents) {
      if (this.pairId && status.id == this.pairId) {
        // current pair is still active, no change
        return;
      }
      if (!this.pairId) {
        this.changePair(status.id);
        return;
      }
    }
    if (this.pairId) {
      // current pair hasn't responded in a while
      // try the top of list
      this.changePair(recents.shift());
    }
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
    // console.log(`sendMessage, topic: ${topic}, message: `, messageData);
    mqttClient.publish(topic, message);
  }
};

module.exports = PlayerClient;

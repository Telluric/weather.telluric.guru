# ⛈️ Weather @TelluricGuru [WIP]

React PWA for viewing sensor data from microcontrollers.
This uses [protobuf-mqtt-couchdb](https://github.com/Telluric/protobuf-mqtt-couchdb) and
[CircuitPython Weather Station](https://github.com/Telluric/Adafruit_CircuitPython_Weather_Station) to get
data into Couchdb. From there we reduce the data in a CouchDB View which is fetched by this
weather station chart

# 🚧 TODO:

Make this thing pretty and document how to use CP WS + PMC for DIY AdaIO


# ⚙️ Usage
```bash
# Install Dependencies
npm install
# Run the development build (should open a browser automatically)
npm run start
```

# 📝 License

See ./LICENSE

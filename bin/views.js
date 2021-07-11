function emit(key, value) {
    console.log([key, value])
}

module.exports = {
    "stats": {
        "reduce": "_stats",
        "map": function (doc) {
            Object.keys(doc).forEach(function (key) {
                if (key !== "_id" && key !== "_rev" && key !== "timestamp" && key !== "intervals" && key !== "replicates") {
                    emit([doc.timestamp, key], doc[key]);
                }
            });
        }.toString(),
    },
    "temperature": {
        "reduce": "_stats",
        "map": function (doc) {
            emit(doc.timestamp, doc.temperature);
        }.toString()
    },
    "altitude": {
        "reduce": "_stats",
        "map": function (doc) {
            emit(doc.timestamp, doc.altitude);
        }.toString()
    },
    "pressure": {
        "reduce": "_stats",
        "map": function (doc) {
            emit(doc.timestamp, doc.pressure);
        }.toString()
    },
    "gas": {
        "reduce": "_stats",
        "map": function (doc) {
            emit(doc.timestamp, doc.gas);
        }.toString()
    },
    "humidity": {
        "reduce": "_stats",
        "map": function (doc) {
            emit(doc.timestamp, doc.humidity);
        }.toString()
    }
}

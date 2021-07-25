function emit(key, value) {
    console.log([key, value])
}

function stats(keys, values, rereduce) {
    if (rereduce) {
        return {
            'o': values[0].o,
            'l': values.reduce(function (a, b) {
                return Math.min(a, b.l)
            }, Infinity),
            'h': values.reduce(function (a, b) {
                return Math.max(a, b.h)
            }, -Infinity),
            'c': values[values.length - 1].c,
            'sum': values.reduce(function (a, b) {
                return a + b.sum
            }, 0),
            'count': values.reduce(function (a, b) {
                return a + b.count
            }, 0),
            'sumsqr': values.reduce(function (a, b) {
                return a + b.sumsqr
            }, 0)
        }
    } else {
        return {
            'o': values[0],
            'l': Math.min.apply(null, values),
            'h': Math.max.apply(null, values),
            'c': values[values.length],
            'sum': sum(values),
            'count': values.length,
            'sumsqr': (function () {
                var sumsqr = 0;

                values.forEach(function (value) {
                    sumsqr += value * value;
                });

                return sumsqr;
            })(),
        }
    }
}

module.exports = {
    "temperature": {
        "reduce": function (keys, values, rereduce) {
            if (rereduce) {
                return {
                    'o': values[0].o,
                    'l': values.reduce(function (a, b) {
                        return Math.min(a, b.l)
                    }, Infinity),
                    'h': values.reduce(function (a, b) {
                        return Math.max(a, b.h)
                    }, -Infinity),
                    'c': values[values.length - 1].c,
                    'sum': values.reduce(function (a, b) {
                        return a + b.sum
                    }, 0),
                    'count': values.reduce(function (a, b) {
                        return a + b.count
                    }, 0),
                    'sumsqr': values.reduce(function (a, b) {
                        return a + b.sumsqr
                    }, 0)
                }
            } else {
                return {
                    'o': values[0],
                    'l': Math.min.apply(null, values),
                    'h': Math.max.apply(null, values),
                    'c': values[values.length - 1],
                    'sum': sum(values),
                    'count': values.length,
                    'sumsqr': (function () {
                        var sumsqr = 0;

                        values.forEach(function (value) {
                            sumsqr += value * value;
                        });

                        return sumsqr;
                    })(),
                }
            }
        }.toString(),
        "map": function (doc) {
            if (typeof doc.temperature !== 'undefined') {
                emit(doc.timestamp, doc.temperature);
            }
        }.toString()
    },
    "altitude": {
        "reduce": function (keys, values, rereduce) {
            if (rereduce) {
                return {
                    'o': values[0].o,
                    'l': values.reduce(function (a, b) {
                        return Math.min(a, b.l)
                    }, Infinity),
                    'h': values.reduce(function (a, b) {
                        return Math.max(a, b.h)
                    }, -Infinity),
                    'c': values[values.length - 1].c,
                    'sum': values.reduce(function (a, b) {
                        return a + b.sum
                    }, 0),
                    'count': values.reduce(function (a, b) {
                        return a + b.count
                    }, 0),
                    'sumsqr': values.reduce(function (a, b) {
                        return a + b.sumsqr
                    }, 0)
                }
            } else {
                return {
                    'o': values[0],
                    'l': Math.min.apply(null, values),
                    'h': Math.max.apply(null, values),
                    'c': values[values.length - 1],
                    'sum': sum(values),
                    'count': values.length,
                    'sumsqr': (function () {
                        var sumsqr = 0;

                        values.forEach(function (value) {
                            sumsqr += value * value;
                        });

                        return sumsqr;
                    })(),
                }
            }
        }.toString(),
        "map": function (doc) {
            if (typeof doc.altitude !== 'undefined') {
                emit(doc.timestamp, doc.altitude);
            }
        }.toString()
    },
    "pressure": {
        "reduce": function (keys, values, rereduce) {
            if (rereduce) {
                return {
                    'o': values[0].o,
                    'l': values.reduce(function (a, b) {
                        return Math.min(a, b.l)
                    }, Infinity),
                    'h': values.reduce(function (a, b) {
                        return Math.max(a, b.h)
                    }, -Infinity),
                    'c': values[values.length - 1].c,
                    'sum': values.reduce(function (a, b) {
                        return a + b.sum
                    }, 0),
                    'count': values.reduce(function (a, b) {
                        return a + b.count
                    }, 0),
                    'sumsqr': values.reduce(function (a, b) {
                        return a + b.sumsqr
                    }, 0)
                }
            } else {
                return {
                    'o': values[0],
                    'l': Math.min.apply(null, values),
                    'h': Math.max.apply(null, values),
                    'c': values[values.length - 1],
                    'sum': sum(values),
                    'count': values.length,
                    'sumsqr': (function () {
                        var sumsqr = 0;

                        values.forEach(function (value) {
                            sumsqr += value * value;
                        });

                        return sumsqr;
                    })(),
                }
            }
        }.toString(),
        "map": function (doc) {
            if (typeof doc.pressure !== 'undefined') {
                emit(doc.timestamp, doc.pressure);
            }
        }.toString()
    },
    "gas": {
        "reduce": function (keys, values, rereduce) {
            if (rereduce) {
                return {
                    'o': values[0].o,
                    'l': values.reduce(function (a, b) {
                        return Math.min(a, b.l)
                    }, Infinity),
                    'h': values.reduce(function (a, b) {
                        return Math.max(a, b.h)
                    }, -Infinity),
                    'c': values[values.length - 1].c,
                    'sum': values.reduce(function (a, b) {
                        return a + b.sum
                    }, 0),
                    'count': values.reduce(function (a, b) {
                        return a + b.count
                    }, 0),
                    'sumsqr': values.reduce(function (a, b) {
                        return a + b.sumsqr
                    }, 0)
                }
            } else {
                return {
                    'o': values[0],
                    'l': Math.min.apply(null, values),
                    'h': Math.max.apply(null, values),
                    'c': values[values.length - 1],
                    'sum': sum(values),
                    'count': values.length,
                    'sumsqr': (function () {
                        var sumsqr = 0;

                        values.forEach(function (value) {
                            sumsqr += value * value;
                        });

                        return sumsqr;
                    })(),
                }
            }
        }.toString(),
        "map": function (doc) {
            if (typeof doc.gas !== 'undefined') {
                emit(doc.timestamp, doc.gas);
            }
        }.toString()
    },
    "humidity": {
        "reduce": function (keys, values, rereduce) {
            if (rereduce) {
                return {
                    'o': values[0].o,
                    'l': values.reduce(function (a, b) {
                        return Math.min(a, b.l)
                    }, Infinity),
                    'h': values.reduce(function (a, b) {
                        return Math.max(a, b.h)
                    }, -Infinity),
                    'c': values[values.length - 1].c,
                    'sum': values.reduce(function (a, b) {
                        return a + b.sum
                    }, 0),
                    'count': values.reduce(function (a, b) {
                        return a + b.count
                    }, 0),
                    'sumsqr': values.reduce(function (a, b) {
                        return a + b.sumsqr
                    }, 0)
                }
            } else {
                return {
                    'o': values[0],
                    'l': Math.min.apply(null, values),
                    'h': Math.max.apply(null, values),
                    'c': values[values.length - 1],
                    'sum': sum(values),
                    'count': values.length,
                    'sumsqr': (function () {
                        var sumsqr = 0;

                        values.forEach(function (value) {
                            sumsqr += value * value;
                        });

                        return sumsqr;
                    })(),
                }
            }
        }.toString(),
        "map": function (doc) {
            if (typeof doc.humidity !== 'undefined') {
                emit(doc.timestamp, doc.humidity);
            }
        }.toString()
    }
}

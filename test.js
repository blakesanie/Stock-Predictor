const request = require('request');
var synaptic = require('synaptic');
var plotly = require('plotly')('bsanie','EH2WPwG715GYLE2ipj65');
var fs = require('fs');
var settings = require('./settings');

var symbol = settings.symbol;
var daysBefore = settings.daysBefore;
var timeSeries = settings.timeSeries;
var timeParameter = settings.timeParameter[timeSeries];
var daysBefore = settings.daysBefore;
var width = settings.resolution.width;
var height = settings.resolution.height;

var url = "https://www.alphavantage.co/query?function="+ timeParameter +"&symbol="+ symbol +"&outputsize=full&apikey=Q89RW8U7CR3LC2AL";

var parsed = JSON.parse(fs.readFileSync('neuralNetwork.json'));
var neuralNetwork = synaptic.Network.fromJSON(parsed);
var maxValue;

request(url, { json: true }, (err, res, body) => {
    if (err) throw err;
    var data = body[settings.timeKey[timeSeries]];
    var keys = Object.keys(data);
    var index = [];
    for (var i = 0; i < keys.length; i++) {
        index.unshift(parseFloat(data[keys[i]]["4. close"]));
    }
    maxValue = Math.max.apply(Math, index);
    var normalized = index.map(normalize);
    var predictedValues = [];
    for (var i = daysBefore; i < normalized.length - 1; i++) {
        var input = normalized.slice(i - daysBefore, i + 1);
        var predicted = neuralNetwork.activate(input);
        predictedValues.push(predicted * maxValue);
    }
    plot(predictedValues, index);
});

function normalize(input) {
    return input / maxValue;
}

function plot(predictedValues, trueValues) {
    var xs = [];
    for (var i = 0; i < predictedValues.length; i++) {
        xs.push(-1 * trueValues.length + i + 2);
    }
    console.log(predictedValues.length, trueValues.length);
    var Predicted = {
        x: xs.map(shift),
        y: predictedValues,
        type: "scatter"
    };
    var True = {
        x: xs,
        y: trueValues,
        type: "scatter"
    }
    var figure = { 'data': [Predicted, True] };
    var imgOpts = {
        format: 'png',
        width: width,
        height: height
    };
    plotly.getImage(figure, imgOpts, function (error, imageStream) {
        if (error) return console.log (error);
        var fileStream = fs.createWriteStream(symbol + "_tested_" + daysBefore + '.png');
        imageStream.pipe(fileStream);
    });
}

function shift(input) {
    return input + daysBefore;
}
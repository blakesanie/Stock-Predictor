const request = require('request');
var synaptic = require('synaptic');
var plotly = require('plotly')('bsanie','EH2WPwG715GYLE2ipj65');
var fs = require('fs');
var settings = require('./settings');

var symbol = settings.symbol;
var daysBefore = settings.daysBefore;
var daysInFuture = 2 * daysBefore;
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
    var futureValues = [];
    var index = [];
    for (var i = 0; i < keys.length; i++) {
        index.unshift(parseFloat(data[keys[i]]["4. close"]));
    }
    index = index.slice(index.length -  2 * daysInFuture);
    var prePrediction = index.slice(0, daysInFuture);
    var input = prePrediction.slice(prePrediction.length - daysBefore);
    for (var i = 0; i < daysInFuture; i++) {
        maxValue = Math.max.apply(Math, input);
        var normalized = input.map(normalize);
        var predicted = neuralNetwork.activate(normalized);
        var predictedFull = predicted * maxValue;
        futureValues.push(predictedFull);
        input = input.slice(1).concat(predictedFull);
    }
    var allPredicted = prePrediction.concat(futureValues);
    plot(allPredicted, index);
});

function normalize(input) {
    return input / maxValue;
}

function plot(predictedValues, trueValues) {
    var xs = [];
    for (var i = 0; i < predictedValues.length; i++) {
        xs.push(-1 * daysInFuture + i + 1);
    }
    var predictedPlot = {
        x: xs,
        y: predictedValues,
        type: "scatter"
    };
    var truePlot = {
        x: xs,
        y: trueValues,
        type: "scatter"
    }
    var figure = { 'data': [predictedPlot, truePlot] };
    var imgOpts = {
        format: 'png',
        width: width,
        height: height
    };
    plotly.getImage(figure, imgOpts, function (error, imageStream) {
        if (error) return console.log (error);

        var fileStream = fs.createWriteStream(symbol + "_past_" + daysInFuture + "_" + timeSeries + '.png');
        imageStream.pipe(fileStream);
    });
}
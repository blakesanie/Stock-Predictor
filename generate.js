const request = require('request');
var synaptic = require('synaptic');
var plotly = require('plotly')('bsanie','EH2WPwG715GYLE2ipj65');
var fs = require('fs');
var settings = require('./settings');

var symbol = settings.symbol;
var timeSeries = settings.timeSeries;
var timeParameter = settings.timeParameter[timeSeries];
var daysBefore = settings.daysBefore;

var url = "https://www.alphavantage.co/query?function="+ timeParameter +"&symbol="+ symbol +"&outputsize=full&apikey=Q89RW8U7CR3LC2AL";

var neuralNetwork = new synaptic.Architect.Perceptron(daysBefore,50,1);
var trainer = new synaptic.Trainer(neuralNetwork);
var maxValue;

request(url, { json: true }, (err, res, body) => {
    if (err) throw err;
    var data = body[settings.timeKey[timeSeries]];
    var keys = Object.keys(data);
    console.log(keys.length);
    var index = [];
    for (var i = 0; i < keys.length; i++) {
        index.unshift(parseFloat(data[keys[i]]["4. close"]));
    }
    maxValue = Math.max.apply(Math, index);
    var normalized = index.map(normalize);
    var trainingSet = [];
    for (var i = daysBefore; i < index.length - 1; i++) {
        var input = normalized.slice(i - daysBefore, i + 1);
        var output = [normalized[i + 1]];
        var obj = {
            input: input,
            output: output
        }
        trainingSet.push(obj);
    }
    trainer.train(trainingSet,{
        rate: .1,
        iterations: 5000,
        error: 0.000001 / maxValue,
        shuffle: true,
        log: 1
    });
    var exported = JSON.stringify(neuralNetwork.toJSON());
    console.log("\nNeural network trained!!!\n");
    fs.writeFile("neuralNetwork.json", exported, (err) => {
        if (err) throw err;
    });
});

function normalize(input) {
    return input / maxValue;
}
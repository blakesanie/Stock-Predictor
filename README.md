# Stock Predictor
a stock predictor for Node.js
## settings.js
* contains basic information such as stock symbol, time interval, and number of input days

## generate.js
* Receives time series data
* Trains neural network
* Exports neural network to neuralNetwork.json

## test.js
* Predicts prices after every interval in data set
* Exports plot of True vs Predicted prices

## predict.js
* Starts prediction with most recent prices as input
* Exports plot of predicted future-prices

## pastPrediction.js
* Builds mock prediction up until present
* Compares self-predicted data with true data following input days
* Exports plots of True vs Predicted (long-term) prices

## Demo
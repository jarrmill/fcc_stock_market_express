
var express = require('express');
var socket = require('socket.io');
var Stocks = require('./controllers/stocks');
var mongoose = require('mongoose');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();

const uristring = process.env.MONGODB_URI || 'mongodb://localhost:auth/auth';

app.use(cors());
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({extended: true}));

app.get("/", function (req, res){
  res.status(200).json("hello!");
});

app.get("/getstocks", Stocks.getStocks)

server = app.listen(8080, function(){
    console.log('server is running on port 8080')
});
//middleware

mongoose.connect(uristring, function(err, res){
  if(err){
    console.log('ERROR connectiong to ' + uristring + '. ' + err);
  } else {
    console.log('Succeeded connecting to ' + uristring);
  }
});

io = socket(server, {origins: '*:*'});

io.on('connection', (socket) => {
    console.log(socket.id);

    socket.on('NEW_STOCK', function(data){
      console.log("Request recieved for ", data.stock);
      Stocks.newStock(data.stock).then(function(results){
        io.emit('STOCKS_UPDATE', results);
      }).catch(error => {
        socket.emit('ERROR', {error_code: data});
      });
    });
    socket.on('DEL_STOCK', function(data){
      Stocks.removeStock(data.stock).then(function(results){
        io.emit('STOCKS_UPDATE', results)
      }).catch(error => {
        socket.emit('ERROR', {error_code: 'DEL_ERROR'});
      });
    });
});

var axios = require('axios');
const Stock = require('../models/stock');
const Color = require('../colors');

exports.newStock = function(stock_name){
  return new Promise(function(resolve, reject){
    if(!stock_name){
      console.log("send a stock name dumbass,", stock_name);
      reject(Error('bad parameters'))
    }
    const root_url = "https://www.quandl.com/api/v3/datasets/WIKI/"
    const datatype = "/data.json?api_key=";
    const start_date = "&start_date=2000-01-01"
    const api_key = process.env.QUANDL_KEY;
    const color = Color.getRandomColor();
    var full_url = root_url + stock_name + datatype + api_key + start_date;
    console.log("Initiating get request at: ", full_url);
    //api call
    axios.get(full_url).then(response => {
      console.log("Status: ", response.status);
      const newStock = new Stock ({
        name: stock_name.toUpperCase(),
        column_names: response.data.dataset_data.column_names,
        data: response.data.dataset_data.data,
        color: color
      });
      newStock.save(function(err){
        if (err) {return next(err)};
        console.log("newStock Saved");
        Stock.find({}, function(err, users){
          resolve(users);
        });
      });
    }).catch(error => {
      console.log("Recieved ", error.response.status, " for stock name ", stock_name);
      reject(Error(error.response.status));
    });
  });
}

exports.getStocks = function(req, res, next){
  console.log("Get Stock Request Recieved")
  Stock.find({}, function(err, stocks){
    if(err){
      return res.status(500).send("internal server error");
    }
    if(!stocks[0]){
      console.log("No stocks found");
      initStock("AAPL").then(results => {
        return res.status(200).send(results);
      }).catch(err => {
        return res.status(500).send(err);
      });
    }
    return res.status(200).json(stocks);
  });
}
exports.removeStock = function(stock_name){
  console.log("Recieved request to delete ", stock_name, ".");
  return new Promise(function(resolve, reject){
    if(!stock_name){
      console.log("send a stock name dumbass,", stock_name);
      reject(Error('bad parameters'))
    }
    Stock.remove({name:stock_name}, function(err){
      if(!err){
        Stock.find({}, function(err, stocks){
          if(!err){
            resolve(stocks);
          } else{
            reject(Error('problem fetching results after stock removal'));
          }
        })
      } else{
        reject(Error('Error removing stocks'));
      }
    })
  });
}

initStock = function(stock_name){
  console.log("Initializing stock name: ", stock_name);
  return new Promise(function(resolve, reject){
    if(!stock_name){
      console.log("send a stock name dumbass,", stock_name);
      reject(Error('bad parameters'))
    }
    const root_url = "https://www.quandl.com/api/v3/datasets/WIKI/"
    const datatype = "/data.json?api_key=";
    const start_date = "&start_date=2000-01-01"
    const api_key = process.env.QUANDL_KEY;
    const color = Color.getRandomColor();
    var full_url = root_url + stock_name + datatype + api_key + start_date;
    //api call
    axios.get(full_url).then(response => {
      console.log("Status: ", response.status);
      const newStock = new Stock ({
        name: stock_name.toUpperCase(),
        column_names: response.data.dataset_data.column_names,
        data: response.data.dataset_data.data,
        color: color
      });
      newStock.save(function(err){
        if (err) {reject(err)};
        console.log("newStock Saved");
        Stock.find({}, function(err, users){
          resolve(users);
        });
      });
    }).catch(error => {
      console.log("Recieved ", error.response.status, " for stock name ", stock_name);
      reject(Error(error.response.status));
    });
  });
}

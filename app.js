var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var mongojs = require('mongojs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'jade');


app.listen(3000);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

var db = mongojs('test',['homecalc']);


//find all existing record
app.get('/homecalc/find/all',function(req,res){
  db.homecalc.find(function(err,doc){
    res.send(doc);
  })
});

//add record
app.post('/homecalc/record/add',function(req,res){
  console.log('This is fuakiing imp'  + req.body  + 'End of Fouaking imp');
  res.send(req.body);
  db.homecalc.save(req.body);
});

//update record
app.post('/homecalc/record/update',function(req,res){
  db.homecalc.findAndModify({
    query : { _id : mongojs.ObjectId(req.body.id) },
    update : { $set : {name:req.body.name,total:req.body.amount} }
  },function(err,doc){
    res.send(doc)
  })
});

//find one record
app.post('/homecalc/record/findone',function(req,res){
  db.homecalc.findOne({
    _id : mongojs.ObjectId(req.body.id)
  },function(err,doc){
    res.send(doc);
  });
});

//deleteAll Records
app.post('/homecalc/record/delete/all',function(req,res){
  if(req.body.id){
    db.homecalc.remove({_id:mongojs.ObjectId(req.body.id)},function(err,doc){
      res.send(doc);
    })
  }
  else{
    db.homecalc.remove({},function(err,doc){
      res.send(doc);
    })
  }
  
})

// catch 404 and forward to error handler



module.exports = app;

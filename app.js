var express = require('express');
var routes = require('./server/routes');
var http = require('http');
var path = require('path');

var app = express();
var server = http.createServer(app);


app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'server/views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Handle Errors gracefully
app.use(function(err, req, res, next) {
    if(!err) return next();
    console.log(err.stack);
    res.json({error: true});
});

// Main App Page
app.get('/', routes.index);

server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
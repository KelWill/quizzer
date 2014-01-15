var express = require('express');
var app = express();

app.use(express.compress());
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response){
  response.sendfile('./public/index.html');
});

app.listen(process.env.PORT || 3000);
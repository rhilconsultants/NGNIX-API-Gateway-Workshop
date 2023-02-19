var express = require('express');
var app = express();
var port = 9091
var host = process.env.HOSTNAME

app.get('/', function (req, res) {
  res.send(`Hello Red-Hat!, From host --> ${host}`);
  console.log('Someone accessed me!')
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});


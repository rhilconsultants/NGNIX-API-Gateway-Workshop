const express = require('express');
const app = express();
const router = express.Router();
var port = process.env.PORT || 9091;
var host = process.env.HOSTNAME
    
router.get('/', function (req, res) {
  res.send(`Hello Red-Hat!, From host --> ${host}`);
  console.log('Someone accessed me!')
});
    
// Health Probe - Application Liveliness
router.get('/health/liveliness',function(req,res){
  console.log(`I am Alive`)
  res.status(200)
  res.send('Healty')
});
    
// Health Probe - Application Readiness
router.get('/health/readiness',function(req,res){
  console.log(`I am Ready`)
  res.status(200);
  res.send('Ready');
  });  
    
    
//add the router
app.use('/', router);
app.listen(port);
    
console.log(`Running at Port: ${port} From Host: ${host}`);

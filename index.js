const express = require('express');
var bodyParser = require('body-parser')
const path = require('path');
var cors = require('cors');
const Verify = require('./helper.js');
require('dotenv').config();
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
let validIps = ['210.24.209.42', '::1', '13.212.171.253', '13.214.205.82', '::ffff:127.0.0.1', '43.198.28.159'];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 

 // Authorization
 app.use('', async (req, res, next) => {
  let result = false;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
  const allow = Verify.whitelist(validIps, ip)

  if (req.headers.authorization) {
      result = await Verify.comparePassword(process.env.KEY, req.headers.authorization)
  }
  
  if (allow && result) {
      next();
  } else {
      res.sendStatus(403).end();
  }
});

app.get('/', (req, res )=>{
  res.send("authenticated");
})

app.post('/send-verification', async (req, res) => {
    try {
      await client.verify.services(process.env.VERIFY_SERVICE_SID)
        .verifications
        .create({to: `+${req.body.phoneNumber}`, channel: 'sms'})

      res.sendStatus(200).end();
    } catch (error) {
      res.status(500)
        .send(JSON.stringify(error))
    }
  });

  app.post('/verify-otp', async (req, res) => {
    try {
      const check = await client.verify.services(process.env.VERIFY_SERVICE_SID)
      .verificationChecks
      .create({to: `+${req.body.phoneNumber}`, code: req.body.otp})
  
    res.status(200).send(check);
    } catch (error) {
      res.status(500)
        .send(JSON.stringify(error))
    }
  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port);
console.log('Server started at http://localhost:' + port);
  
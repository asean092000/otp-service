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

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 

 // Authorization
 app.use('', async (req, res, next) => {
  let result = false;
  if (req.headers.authorization) {
      result = await Verify.comparePassword(process.env.KEY, req.headers.authorization)
  }
  
  if (result) {
      next();
  } else {
      res.sendStatus(403);
  }
});

app.post('/send-verification', async (req, res) => {
  await client.verify.services(process.env.VERIFY_SERVICE_SID)
      .verifications
      .create({to: `+${req.body.phoneNumber}`, channel: 'sms'})
      .then(verification => console.log(verification.status))
      .catch(e => {
        console.log(e)
        res.status(500).send(e);
      });
  
    res.sendStatus(200);
  });

  app.post('/verify-otp', async (req, res) => {
    const check = await client.verify.services(process.env.VERIFY_SERVICE_SID)
      .verificationChecks
      .create({to: `+${req.body.phoneNumber}`, code: req.body.otp})
      .catch(e => {
        console.log(e)
        res.status(500).send(e);
      });
  
    res.status(200).send(check);
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
  
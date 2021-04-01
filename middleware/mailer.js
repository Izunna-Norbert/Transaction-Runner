const nodemailer = require('nodemailer');
require('dotenv').config();

const transport = nodemailer.createTransport({
  service: 'Sendgrid',
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = {
  sendEmail(from, to, subject, html,res,req) {
    return new Promise((resolve, reject) => {
      transport.sendMail({ from, subject, to, html }, (err, info) => {
        if (err)  reject(err) ;
        resolve(info);
      });
    });
  }
}

const express = require("express")
const app = express()
const mongoose = require("mongoose")
//import Routes
const authRoute = require('./routes/auth');
const bodyParser = require('body-parser')
const cors = require('cors');

//const cookieParser = require('cookie-parser');
require('dotenv').config();


//connect to db
mongoose.connect(process.env.DB_CONNECT,
    {useNewUrlParser: true,
    useUnifiedTopology: true},
    () => console.log('connected to db!')
);

// middlewares

app.use(cors())
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());


//Routes middlewares
app.use('/api', authRoute);


app.listen(3000, () => {
    console.log('Server up and running');
  });
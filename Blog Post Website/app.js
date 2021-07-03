const bodyParser = require('body-parser');
const chalk = require('chalk');
const express = require('express');
const http = require('http');
const app = express();
const route = require('./routes/route.js');
const server = http.createServer(app);

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/', route);


server.listen(8000, function(req, res){
    console.log(chalk.greenBright('App started listening on port 8000'));
});

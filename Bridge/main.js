const express = require('express')
const fileUpload = require("express-fileupload")
const bodyParser = require('body-parser')

// IMPORT ROUTES
const content = require('./routes/content')
const my = require('./routes/my')
const trigger = require('./routes/trigger')
const view = require('./routes/view')
const whoami = require('./routes/whoami')

// APP
const app = express()
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))
app.use(fileUpload({
    createParentPath: true
}))
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Marvin-Authorization");
    next();
});

// ROUTES
app.use('/', content)
app.use('/', my)
app.use('/', trigger)
app.use('/', view)
app.use('/', whoami)

// SERVER
app.listen(3000, () => console.log(`Server started on port ${3000}`))

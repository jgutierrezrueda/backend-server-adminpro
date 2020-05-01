// Requires
let express = require('express');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');

// Init variables
let app = express();

// Import routes
let appRoutes = require('./routes/app');
let usuarioRoutes = require('./routes/usuario');
let loginRoutes = require('./routes/login');

// Body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// DB connection
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

// Routes
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// Listen requests. Port 3000
app.listen(3000, () => {
    console.log('express server port 3000: \x1b[32m%s\x1b[0m', 'online');
});

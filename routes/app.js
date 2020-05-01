let express = require('express');

let app = express();

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        message: 'Petición realizada correctamente'
    });
});

module.exports = app;

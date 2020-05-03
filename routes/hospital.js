let express = require('express');

let mdAuthentication = require('../middlewares/authentication');

let app = express();

let Hospital = require('../models/hospital');

// ================================================
// Obtener hospitales
// ================================================
app.get('/', (req, res, next) => {
    let desde = Number(req.query.desde || 0);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    res.status(500).json({
                        ok: false,
                        message: 'Error cargando hospitales',
                        errors: err
                    });
                }
                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        hospitales: hospitales
                    });
                });
            }
        );
});

// ================================================
// Actualizar un hospital
// ================================================
app.put('/:id', mdAuthentication.verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error buscando hospitales',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: 'El hospital con el id ' + id + ' no existe',
                errors: {message: 'No existe un hospital con ese id'}
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error actualizando hospitales',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

// ================================================
// Crear nuevo hospital
// ================================================
app.post('/', mdAuthentication.verificaToken, (req, res) => {
    let body = req.body;

    let hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            res.status(400).json({
                ok: false,
                message: 'Error creando hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

// ================================================
// Borrar hospital por ID
// ================================================
app.delete('/:id', mdAuthentication.verificaToken, (req, res) => {
    let id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            res.status(500).json({
                ok: false,
                message: 'Error borrando hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            res.status(400).json({
                ok: false,
                message: 'El hospital con el id ' + id + ' no existe',
                errors: {message: 'No existe un hospital con ese id'}
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    })
});

module.exports = app;

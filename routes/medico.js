let express = require('express');

let mdAuthentication = require('../middlewares/authentication');

let app = express();

let Medico = require('../models/medico');

// ================================================
// Obtener médicos
// ================================================
app.get('/', (req, res, next) => {
    let desde = Number(req.query.desde || 0);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    res.status(500).json({
                        ok: false,
                        message: 'Error cargando médicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        medicos: medicos
                    });
                });
            }
        );
});

// ================================================
// Actualizar un médico
// ================================================
app.put('/:id', mdAuthentication.verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error buscando medicos',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                message: 'El médico con el id ' + id + ' no existe',
                errors: {message: 'No existe un médico con ese id'}
            });
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario._id;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error actualizando médicos',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

// ================================================
// Crear nuevo médico
// ================================================
app.post('/', mdAuthentication.verificaToken, (req, res) => {
    let body = req.body;

    let medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            res.status(400).json({
                ok: false,
                message: 'Error creando médico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});

// ================================================
// Borrar médico por ID
// ================================================
app.delete('/:id', mdAuthentication.verificaToken, (req, res) => {
    let id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            res.status(500).json({
                ok: false,
                message: 'Error borrando médico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            res.status(400).json({
                ok: false,
                message: 'El médico con el id ' + id + ' no existe',
                errors: {message: 'No existe un médico con ese id'}
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    })
});

module.exports = app;

let express = require('express');
let bcrypt = require('bcryptjs');

let mdAuthentication = require('../middlewares/authentication');

let app = express();

let Usuario = require('../models/usuario');

// ================================================
// Obtener todos los usuarios
// ================================================
app.get('/', (req, res, next) => {
    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    res.status(500).json({
                        ok: false,
                        message: 'Error cargando usuarios',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });
            }
        );
});

// ================================================
// Actualizar un usuario
// ================================================
app.put('/:id', mdAuthentication.verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error buscando usuarios',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                message: 'El usuario con el id ' + id + ' no existe',
                errors: {message: 'No existe un usuario con ese id'}
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error actualizando usuarios',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});

// ================================================
// Crear nuevo usuario
// ================================================
app.post('/', mdAuthentication.verificaToken, (req, res) => {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            res.status(400).json({
                ok: false,
                message: 'Error creando usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
});

// ================================================
// Borrar usuario por ID
// ================================================
app.delete('/:id', mdAuthentication.verificaToken, (req, res) => {
    let id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            res.status(500).json({
                ok: false,
                message: 'Error borrando usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            res.status(400).json({
                ok: false,
                message: 'El usuario con el id ' + id + ' no existe',
                errors: {message: 'No existe un usuario con ese id'}
            });
        }

        usuarioBorrado.password = ':(';

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    })
});

module.exports = app;

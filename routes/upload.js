let express = require('express');
let fileUpload = require('express-fileupload');
let fs = require('fs');

let app = express();

let Usuario = require('../models/usuario');
let Medico = require('../models/medico');
let Hospital = require('../models/hospital');

app.use(fileUpload());

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if(!usuario){
                return res.status(400).json({
                    ok: false,
                    message: 'Usuario no existe',
                    errors: {message: 'Usuario no existe'}
                });
            }

            let pathViejo = './uploads/usuarios/' + usuario.img;

            // si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if(!medico){
                return res.status(400).json({
                    ok: false,
                    message: 'Médico no existe',
                    errors: {message: 'Médico no existe'}
                });
            }

            let pathViejo = './uploads/medicos/' + medico.img;

            // si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de médico actualizada',
                    medico: medicoActualizado
                });
            });
        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if(!hospital){
                return res.status(400).json({
                    ok: false,
                    message: 'Hospital no existe',
                    errors: {message: 'Hospital no existe'}
                });
            }

            let pathViejo = './uploads/hospitales/' + hospital.img;

            // si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }
}

app.put('/:tipo/:id', (req, res, next) => {
    let tipo = req.params.tipo;
    let id = req.params.id;

    // tipos de colección
    let tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Colección no válida',
            errors: {message: 'Las colecciones permitidas son ' + tiposValidos.join(', ')}
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No se seleccionó nada',
            errors: {message: 'No se ha seleccionado imagen'}
        });
    }

    // obtener archivo
    let archivo = req.files.imagen;
    let nombreCorto = archivo.name.split('.');
    let extensionArchivo = nombreCorto[nombreCorto.length - 1];

    // sólo estas extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Extensión no válida',
            errors: {message: 'Las extensiones permitidas son ' + extensionesValidas.join(', ')}
        });
    }

    // nombre de archivo personalizado
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // mover archivo del temporal a un path
    let path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al mover archivo',
                error: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    });
});

module.exports = app;

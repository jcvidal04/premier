import express from 'express';
import db from './db.js';
import passport from 'passport';
import Authentication from "./auth.js";
import path from 'path';
import fs from 'fs';
import CryptoJS from 'crypto-js';
import Bcrypt from 'bcrypt';


const dirname = fs.realpathSync('.');


class UsersBackendServer {
    constructor() {
        const app = express();
        app.use(express.json());
        app.use(express.static('public'));


        app.use(express.urlencoded({extended: false}));
        const authentication = new Authentication(app); // Instanciación de la clase autorización


        app.get('/login/', this.login); // Llama a log in


        app.post('/login/', (req, res, next) => {
            passport.authenticate('local', (err, user, info) => {
                if (err) { return next(err); }
                if (!user) {
                    return res.status(401).json({ message: 'Correo electrónico o contraseña incorrectos.' });
                }
                req.logIn(user, (err) => {
                    if (err) { return next(err); }
                    return res.status(200).json({ message: 'Inicio de sesión exitoso.' });
                });
            })(req, res, next);
        });


        app.get('/api/equipos', authentication.checkAuthenticated, this.fetchJson);


        app.post('/register/', this.doRegister);


        app.get('/', authentication.checkAuthenticated, this.goFixture);
        app.get('/buscar', authentication.checkAuthenticated, this.goBuscar);
        app.post('/api/favorite', authentication.checkAuthenticated, this.guardarEquipo);


        app.post('/userDetails', authentication.checkAuthenticated, this.getUserDetails);
        app.post('/delete/', authentication.checkAuthenticated, this.deleteEquipo);


        app.post("/logout", (req, res) => {
            req.logout((err) => {
                if (err) {
                    console.error('Error al cerrar la sesión:', err);
                    return next(err);
                }
                console.log("Usuario Cerrado");
                res.redirect("/login");
         });
     });

        app.listen(3000, () => console.log('Listening on http://localhost:3000'));
    }


    async login(req, res) {
        res.sendFile(path.join(dirname, "public/login.html")); // Te lleva a log in de nuevo
    }


    async goFixture(req, res) {
        res.sendFile(path.join(dirname, "public/fixture.html"));
    }


    async goBuscar(req, res) {
        res.sendFile(path.join(dirname, "public/buscar.html"));
    }


    async fetchJson(req, res) {
        const API_URL = 'https://www.mockachino.com/be7a7124-14a2-4c/equipos';
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            res.json(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).send('Error fetching data');
        }
    }


    async doRegister(req, res) {
        const key = "ProgramacionIII -AWI";
        const registerUsername = CryptoJS.AES.decrypt(req.body.username, key).toString(CryptoJS.enc.Utf8);
        const registerPassword = CryptoJS.AES.decrypt(req.body.password, key).toString(CryptoJS.enc.Utf8);


        const saltRounds = 10;
        const salt = await Bcrypt.genSalt(saltRounds);
        const hashedRegisterPassword = await Bcrypt.hash(registerPassword, salt);


        const query = {
            user: registerUsername,
            password: registerPassword
        };
        const update = { $set: { user: registerUsername, password: hashedRegisterPassword } };
        const params = { upsert: true };
        const collection = db.collection("encryptedUsers");
        await collection.updateOne(query, update, params);
        res.json({ success: true });
    }


    async guardarEquipo(req, res) {
        const equipoFavorito = req.body.equipoFavorito;
        const user = req.user.user;


        console.log('Username:', user);
        console.log('Equipo Favorito:', equipoFavorito);


        const collection = db.collection("encryptedUsers");
        const query = { user: user };
        const update = { $set: { equipoFavorito: equipoFavorito } };
        const params = { upsert: true };


        await collection.updateOne(query, update, params);
        res.json({ success: true });
    }


    async getUserDetails(req, res) {
        const user = req.user.user;


        try {
            const collection = db.collection("encryptedUsers");
            const userDetails = await collection.findOne({ user: user });


            if (userDetails) {
                res.json({
                    user: userDetails.user,
                    password: userDetails.password,
                    equipoFavorito: userDetails.equipoFavorito
                });
            } else {
                res.status(404).json({ message: "Detalles del usuario no encontrados" });
            }
        } catch (error) {
            console.error('Error obteniendo detalles del usuario:', error);
            res.status(500).send('Error obteniendo detalles del usuario');
        }
    }


    async deleteEquipo(req, res) {
        const user = req.user.user;


        try {
            const collection = db.collection('encryptedUsers');
            const update = { $unset: { equipoFavorito: '' } };
            const query = { user: user };


            const result = await collection.updateOne(query, update);


            if (result.modifiedCount > 0) {
                res.json({ success: true });
            } else {
                res.status(404).json({ message: 'No se encontró equipo favorito para eliminar' });
            }
        } catch (error) {
            console.error('Error eliminando equipo favorito:', error);
            res.status(500).send('Error eliminando equipo favorito');
        }
    }
}


new UsersBackendServer();



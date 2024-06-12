import passport from 'passport';
import LocalStrategy from 'passport-local'; //passport es una librería para autenticar
import session from 'express-session';
import db from './db.js';
import CryptoJS from 'crypto-js';
import Bcrypt from 'bcrypt';

class Authentication {
    constructor(app) {
        app.use(session({
            secret: "secret",
            resave: false,
            saveUninitialized: true,
        }));

        app.use(passport.initialize()); // init passport on every route call
        app.use(passport.session());
        passport.use(new LocalStrategy(this.verifyIdentity)); //localStrategy es palabra clave de passport, es local porque se llama local

        passport.serializeUser((user, done) => done(null, user));
        passport.deserializeUser((user, done) => done(null, user));
    }

    async verifyIdentity(username, password, done) { //verifica que exista en la bdd o en un archivo 


        const key = "ProgramacionIII -AWI"; 
        const user = CryptoJS.AES.decrypt(username, key).toString(CryptoJS.enc.Utf8); 
        const pass = CryptoJS.AES.decrypt(password, key).toString(CryptoJS.enc.Utf8);


        const collection = db.collection("encryptedUsers");
        const query = { user: user };
        const userFromDB = await collection.findOne(query);


        if (!userFromDB) {
            // If the user was not found, return an error.
            return done(new Error('Invalid username or password'));
        }
        // Compare the password entered by the user with the password stored in the database.


        const isMatch = await Bcrypt.compare(pass, userFromDB.password);
            if (!isMatch) { return done(new Error('Invalid password or password'));
            }
        
            return done(null, userFromDB);
        }


    checkAuthenticated(req, res, next) { //función intermediara que se mete en el medio; si se cumple podes hacer lo siguiente
        //primero tenes que autenticarte y luego vas a podés acceder a la página
        if (req.isAuthenticated()) { 
            return next(); 
        }
        res.redirect("/login"); //si no está ingresado el dato, te redirecciona siempre a log in
    }

}

export default Authentication;

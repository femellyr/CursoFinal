const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;
const pool = require('../database'); // ejecuta database.js conecion a DB
const helpers = require('../lib/helpers');  // rutinas de password 

passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req,username, password, done)  => {
    const rows = await pool.query('SELECT * FROM users WHERE username = ?',[username]);
    if (rows.length > 0) {
       const user = rows[0] ;
    //   console.log('User igual ' + user.id,user.username);
       const validPassword = await helpers.matchPassword(password,user.password);
       if (validPassword) {
           done(null,user,req.flash('success','Bienvenido: ' + user.username));
       } else {
           done(null,false,req.flash('message','Contraseña Incorrecta'));
            }
        } else {
        return done(null,false,req.flash('message','No existe el usuario'));
            }
}));
passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req,username, password, done)  => {
    const { fullname } = req.body;
    //        username: username,  es lo mismo
    const newUser = {
        username,
        password,
        fullname
    };
    newUser.password = await helpers.encryptPassword(password);
    const result = await pool.query('INSERT INTO users SET ?',[newUser]) ;
    newUser.id = result.insertId;  // id de  Insertid de sql 
    return done(null, newUser);
}));



// para guardar el usuario dentro de la sesion de passport- OJO
// serializo lo "guardo" en la session y deseralizo para recuperar los datos
passport.serializeUser((user,done) => {
    done(null, user.id);   // Callback
});
 
passport.deserializeUser( async(id,done) => {
    const rows = await pool.query('SELECT * FROM  users WHERE id = ?', [id]);
    done(null, rows[0]);
});
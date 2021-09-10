const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session');
const passport = require('passport');

const { database } = require('./keys');

// initialization
const app = express();
require('./lib/passport');

// settings
app.set('port',process.env.PORT || 4000);
app.set('views',path.join(__dirname,'views'));  // indica donde esta la carpeta views
app.engine('.hbs',exphbs({
        defaultLayout: 'main',   // indica cual es el arhchivo de inicio -- > main.hbs
        layoutsDir: path.join(app.get('views'),'layouts'),   // indica donde estaran los archivos de layouts 
        partialsDir: path.join(app.get('views'),'partials'), // indica codigo reutilizable
        extname: '.hbs',  // extension de handlebars
        helpers: require('./lib/handlebars')  // funciones de ayuda handlebars.js
}));
app.set('view engine','.hbs');  // aqui define que handlebars es el engine
// middleware
app.use(session({
    secret: 'unaprueba',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false})); // para aceptar datos sencillos desde el usuario
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use((req,res,next)  => {
    app.locals.success = req.flash('success');
    app.locals.success = req.flash('message');
    // carga los datos de la sesion de serializar (guardar y retornar datos de la sesion)
    app.locals.user = req.user;
    next();
});

// Routes
app.use(require('./routes/index'));
app.use(require('./routes/authentication'));
app.use('/links',require('./routes/links'));

// Public
app.use(express.static(path.join(__dirname,'public'))); // carpeta de css,img
// Starting server
app.listen(app.get('port'), () => {
    console.log('Servidor levantado en el puerto: ' , app.get('port'));
});

 
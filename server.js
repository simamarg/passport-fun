// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');
const app = express();

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(expressSession({ secret: 'thisIsASecret', resave: false, saveUninitialized: false }));

//Authentication middleware
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
    // console.log(user);
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use(new LocalStrategy(function (username, password, done) {
    if ((username === "john") && (password === "password")) {
        return done(null, { username: username, id: 1 });
    } else {
        return done(null, false, "Failed to login.");
    }
}));

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login?err'
}));

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/login.html'));
});

function authOnly(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.get('/userDetails', authOnly, function (req, res) {
    res.send(req.user);
});

app.get('/logout', function (req, res) {
    req.logout();
    res.send('Logged out!');
});

// Point static path to dist
app.use(authOnly, express.static(path.join(__dirname, 'dist')));

// Catch all other routes and return the index file
app.get('*', authOnly, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`API running on localhost:${port}`));
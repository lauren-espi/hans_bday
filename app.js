import express from 'express';
import configRoutes from './routes/postcard.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const app = express();
const port = 3000;

// Load the handlebars module
import exphbs from 'express-handlebars';
import session from 'express-session';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const staticDir = express.static(__dirname + '/public');
app.use('/public', staticDir);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions (used by the Connections game)
app.use(session({
	secret: process.env.SESSION_SECRET || 'change_this_in_prod',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false }
}));

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Serve static files from the 'public' directory
app.use(express.static('public'));

configRoutes(app);

app.listen(port, () => console.log(`App listening to port ${port}`));
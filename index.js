const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();
const db = require('./db');
const router = require('./router');
const { errorHandler } = require('./utils/errorHelpers');

// App setup
app.use(morgan('combined'));
app.use(bodyParser.json({ type: '*/*' }));
app.use(db.createConnection);
router(app);
app.use(db.closeConnection);
app.use(errorHandler);

// Server setup
const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
console.log(`Server listening on port: ${port}`);

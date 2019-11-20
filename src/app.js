require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { NODE_ENV } = require('./config');
const articlesRouter = require('./articles/articles-router')
const usersRouter = require('./users/users-router')
const commentsRouter = require('./comments/comments-router')


const jsonParser = express.json();
const app = express();

const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: {message: 'server error'} }; 
    } else {
        console.error(error);
        response = { message: error.message, error }
    }
    res.status(500).json(response);
})

app.use('/api/articles', articlesRouter)
app.use('/api/users', usersRouter)
app.use('/api/comments', commentsRouter)

app.get('/', (req, res) => {
    res.send('Hello, World!')
})



module.exports = app;
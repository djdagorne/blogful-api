const knex = require('knex');
const app = require('./app');
const { PORT, DATABASE_URL } = require('./config');

const db = knex({
    client:'pg',
    connection: DATABASE_URL,
    timezone: 'UTC',
});

app.set('db', db);

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});
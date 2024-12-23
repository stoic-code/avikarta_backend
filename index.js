import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import app from './src/app.js';
import mongodbApi from './src/DB/connect.db.js';

// deploy
mongodbApi()
    .then(() => {
        app.listen(process.env.PORT, () =>
            console.log('Server on port: ' + process.env.PORT)
        );
    })
    .catch((error) => {
        console.log('-->E: DB connection FAILED !! ', error, '@src/index.js');
    });

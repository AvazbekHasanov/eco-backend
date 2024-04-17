import {Router} from "express";
import bodyParser from 'body-parser';
import {GETTRANSPORT} from "../services/transport.service.js";
import middleware from "../middlewares/jwt.middleware.js";
import pkg from 'pg';
import moment from 'moment';

const {Pool} = pkg;



const pool = new Pool({
  user: 'ioofgkja',
  host: 'snuffleupagus.db.elephantsql.com',
  database: 'ioofgkja',
  password: '3krp76icZWDmV1lAegNoSvxBLV7OCZin',
  port: 5432, // Default PostgreSQL port
});

const transportRouter = Router();
transportRouter.use(bodyParser.json({limit: '10000000mb'}));


transportRouter.get('/' ,(req , res) => {
  res.status(200).send(
      {
        message: "Ishladi sex"
      }
  )
})

async function hash_password(password) {
  const {rows} = await pool.query('SELECT digest($1, \'sha256\') as hash', [password]);
  return rows[0].hash;
}

transportRouter.post('/register', async (req, res) => {
  try {
    // Preprocess request body to convert empty strings to null
    const processedBody = {};
    for (const key in req.body) {
      processedBody[key] = req.body[key] === '' ? null : req.body[key];
    }

    const {
      name,
      surname,
      phone,
      birth_date,
      region_id,
      district_id,
      username,
      client_name,
      password,
      photo
    } = processedBody;

    const query = `
      INSERT INTO auth_users (
        name,
        surname,
        phone,
        birth_day,
        region_id,
        district_id,
        username,
        client_name,
        password,
        photo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    const values = [name, surname, phone, birth_date, region_id, district_id, username, client_name, password, photo];

    await pool.query(query, values);

    const userInfo = await pool.query('SELECT * FROM auth_users WHERE username = $1', [username]);
    const user_info = userInfo.rows[0];

    const result = {
      message: 'User registered successfully',
      user_info
    };

    res.status(200).json(result);
  } catch (error) {
    if (error.code === '22P02') {
      // Extract the column name causing the error from the PostgreSQL error message
      const match = /column "(.+?)"/.exec(error.message);
      const columnName = match ? match[1] : 'unknown';
      res.status(400).json({ error: `Invalid data format for column ${columnName}. Please provide valid data.` });
    } else {
      console.error('Error during registration:', error);
      res.status(500).json({ error: error.message }); // Send detailed error message to client
    }
  }
});

transportRouter.get('/all_services', async (req, res) => {
  try {
    let query = 'select id, name, price, unit from services where state = 1 order by id';

    const result = await pool.query(query);

    if (result.rows.length > 0) {
      res.status(200).send({ message: 'successful', services: result.rows });
    } else {
      res.status(200).send({ message: 'not found' , services: []});
    }
  } catch (error) {
    console.error('Error during region retrieval:', error);
    res.status(500).json({ error: error.message });
  }
});

transportRouter.post('/connect_service', async (req, res) => {
  try {
    console.log("req.body", req.body);
    console.log("req.query", req.query);
    const { user_id, day } = req.body;
    let query = 'INSERT INTO waste_traffics_log(org_id, begin_date, end_date) VALUES ($1, NOW(), NOW() + INTERVAL \'1 DAY\'*$2) RETURNING *;';
    const result = await pool.query(query, [user_id, day]);
    const insertedRow = result.rows[0]; // Assuming only one row is inserted
    insertedRow.begin_date = moment(insertedRow.begin_date).format('DD-MM-YYYY')
    insertedRow.end_date = moment(insertedRow.end_date).format('DD-MM-YYYY')
    res.status(200).send({ message: 'SUCCESS', data: insertedRow });
  } catch (error) {
    res.status(500).json({message: 'ERROR', error: error.message });
  }
});



transportRouter.get('/get_service', async (req, res) => {
  try {
    const { id } = req.query;
    const query = 'SELECT id, name, price, unit, description FROM services WHERE state = 1 AND id = $1 ORDER BY id';

    const result = await pool.query(query, [id]);

    if (result.rows.length > 0) {
      res.status(200).json({ message: 'successful', service_info: result.rows[0] });
    } else {
      res.status(200).json({ message: 'not found' , service_info: []});
    }
  } catch (error) {
    console.error('Error during region retrieval:', error);
    res.status(500).json({ error: error.message });
  }
});


// salom

transportRouter.get('/regions', async (req, res) => {
  try {
    const { region_id } = req.query;
    let params = [];
    let query = 'SELECT id , name3 AS name FROM lists WHERE';
    if (region_id) {
      query += ' id = $1 AND';
      params.push(region_id)
    }
    query += ' type_id = 1 and ';
    query += ' id > 0 order by id';

    const result = await pool.query(query, params);

    if (result.rows.length > 0) {
      res.status(200).json({ message: 'successful', region_list: result.rows });
    } else {
      res.status(200).json({ message: 'not found' , region_list: []});
    }
  } catch (error) {
    console.error('Error during region retrieval:', error);
    res.status(500).json({ error: error.message });
  }
});
transportRouter.get('/districts', async (req, res) => {
  try {
    const { region_id } = req.query;
    let query = 'SELECT id, name3 AS name FROM lists WHERE type_id = 2';
    const params = [];

    if (region_id) {
      query += ' AND int01 = $1';
      params.push(region_id);
    }
    query += ' order by id'

    const result = await pool.query(query, params);

    if (result.rows.length > 0) {
      res.status(200).json({ message: 'Successful', district_list: result.rows });
    } else {
      res.status(200).json({ message: 'Districts not found', district_list: [] });
    }
  } catch (error) {
    console.error('Error during district retrieval:', error);
    res.status(500).json({ error: error.message });
  }
});





transportRouter.post('/login', async (req, res) => {
  try {
    const {username} = req.body;
    const query = 'SELECT * FROM auth_users WHERE username = $1';
    console.log("username", username, "req.query", req.query, "req.body", req.body);
    const result = await pool.query(query, [username]);

    if (result.rows.length > 0) {
      res.status(200).json({message: 'Login successful', user_info: result.rows[0]});
    } else {
      res.status(401).json({message: 'Invalid username or password'});
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({error: error.message});
  }
});


export default transportRouter;

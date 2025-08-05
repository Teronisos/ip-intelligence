require('dotenv').config({ path: '.env.server' });


const express = require('express');
const cors = require('cors');


const app = express();
app.use(cors({
  origin: '*', 
}));

app.use(express.json());

app.use('/api', require('./routes/ipDataRequest'));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));

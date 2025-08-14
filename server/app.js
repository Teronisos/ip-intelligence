require('dotenv').config({ path: '.env.server' });


const express = require('express');
const cors = require('cors');


const app = express();
app.use(cors({
  origin: '*', 
}));

app.use(express.json());

// for workflow action check
app.use('/', (req, res) => {
  res.send(`server is running on port ${PORT}`)
})

app.use('/api', require('./routes/ipDataRequest'));

const PORT = 3000;
app.listen(PORT, () => console.log(`server is running on port ${PORT}`));

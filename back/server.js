require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const interventionRoutes = require('./routes/interventionRoutes');
const commentRoutes = require('./routes/commentRoutes');

const reportRoutes = require('./routes/reportRoutes');
const statsRoutes = require('./routes/statsRoutes');
const congeRoutes = require('./routes/congeRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);
app.use('/tickets', ticketRoutes);
app.use('/notifications', notificationRoutes);
app.use('/interventions', interventionRoutes);
app.use('/comments', commentRoutes);
app.use('/reports', reportRoutes);
app.use('/stats', statsRoutes);
app.use('/conges', congeRoutes);
app.get('/', (req, res) => {
  res.send('API is running');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
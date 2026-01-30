const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req,res)=>{
    res.send('API is running...');
})

app.use('/api/auth', authRoutes);

const protect = require("./middleware/authMiddleware");

app.get("/api/test/protected", protect, (req, res) => {
  res.json({
    message: "Authorized ✅",
    user: req.user
  });
});


const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
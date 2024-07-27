const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors')
const app = express();
app.use(cors())
app.use(express.json());
require("dotenv").config();


const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    referal: String
  });



const USERS = mongoose.model('User', userSchema);

console.log(USERS);

const SECRET = process.env.SECRET_KEY;

const authenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

mongoose.connect(process.env.MONGO_URL);

// User routes
app.post('/user/signup', async(req, res) => {
  const { username, password } = req.body;
  const user = await USERS.findOne({username});
  console.log("user signup");
  if (user) {
    res.status(403).json({ message: 'user already exists' });
  } else {
    const obj = { username: username, password: password };
      const newUser = new USERS(obj);
      await  newUser.save();
      const token = jwt.sign({ username, role: 'user' }, SECRET, { expiresIn: process.env.TOKEN_TIMEOUT });
      res.json({ message: 'User created successfully', token });
  }
});
console.log(USERS);
app.post('/user/login', async(req, res) => {
    console.log(USERS);
    const { username, password } = req.body;
    const user = await USERS.findOne({ username,password });
    console.log(user);
    if (user) {
      const token = jwt.sign({ username, role: 'user' }, SECRET, { expiresIn: process.env.TOKEN_TIMEOUT });
      res.json({ message: 'User found successfully', USERS, token });
    } else {
      res.status(403).json(user);
    }
  }
);


app.listen(3000, () => console.log('Server running on port 3000'));

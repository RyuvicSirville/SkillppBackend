const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors')
const app = express();
app.use(cors())
app.use(express.json());
require("dotenv").config();
const { USERS, TASKS } = require("./db");
const { SECRET } = require("./middleware/auth")
const { authenticateJwt } = require("./middleware/auth");


mongoose.connect(process.env.MONGO_URL);

// User routes
app.post('/user/signup', async (req, res) => {
  const userDetails = req.body;
  const regNo = userDetails.regNo;
  const user = await USERS.findOne({ regNo });

  if (user) {
    console.log("User already exists");
    res.status(403).json({ message: 'User already exists' });

  }
  else {
    const newUser = new USERS(userDetails);
    const newTask = new TASKS({
      regNo: userDetails.regNo,
      domain1: {
        description: userDetails.domain1,
        drive: userDetails.drive1
      },
      domain2: {
        description: userDetails.domain2,
        drive: userDetails.drive2
      }
    })
    await newUser.save();
    await newTask.save();
    console.log("User created successfully");
    res.json({ message: 'User created successfully' });
  }

});
console.log(USERS);
app.post('/user/login', async (req, res) => {
  console.log(USERS);
  const userDetails = req.body;
  const reg = {
    email: userDetails.email,
    password: userDetails.password
  }
  const user = await USERS.findOne(reg);
  console.log(user);
  if (user) {
    const token = jwt.sign({ email: reg.email, role: 'user' }, SECRET, { expiresIn: process.env.TOKEN_TIMEOUT });
    res.json({ message: 'User found successfully', user, token });
  } else {
    res.status(403).json(user);
  }
}
);
app.get('/user/dashboard', authenticateJwt, async (req, res) => {
  const email = req.user.email;
  const user = await USERS.findOne({ email });
  const regNo = user.regNo;
  const task = await TASKS.findOne({ regNo });
  const userData = {
    username: user.username,
    email: user.email,
    domain1: task.domain1,
    domain2: task.domain2
  }
  if (user) {
    res.json({userData});
  } else {
    res.status(403).json({ message: 'User not found' });
  }
});
app.get('/user/self', authenticateJwt, async (req, res) => {
  const email = req.user.email;
  const user = await USERS.findOne({ email });
  res.json({
    username: user.username
  })
})
app.put('/user/domain', authenticateJwt, async (req, res) => {
  const user = await TASKS.findOneAndUpdate({ regNo: req.body.regNo }, req.body, { new: true });
  if (user) {
    res.json({ message: 'user updated successfully' });
  } else {
    res.status(404).json({ message: 'user not found' });
  }
});
app.listen(3001, () => console.log('Server running on port 3001'));

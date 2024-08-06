const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors')
const app = express();
app.use(cors())
app.use(express.json());
require("dotenv").config();


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  regNo: {
    type: Number,
    required: true,
    unique: true
  },
  phNo: {
    type: Number,
    required: true,
    maxLength: 10,
  },
  branch: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  }
});

const taskSchema = new mongoose.Schema({
  regNo: {
    type: String,
    required: true,
    unique: true
  },
  domain1: {
    description: {
      type: String,
      url: String,
      required: true
    },
    drive: {
      type: String,
      default: ""
    },
    task: {
      type: String,
      default: ""
    },
    badge: {
      url: String,
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  domain2: {
    description: {
      type: String,
      url: String,
      required: true
    },
    drive: {
      type: String,
      default: ""
    },
    task: {
      type: String,
      default: ""
    },
    badge: {
      url: String,
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
})

const USERS = mongoose.model('User', userSchema);
const TASKS = mongoose.model('Task', taskSchema);
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
app.post('/user/signup', async (req, res) => {
  const userDetails = req.body;
  const regNo = userDetails.regNo;
  const user = await USERS.findOne({ regNo });
  console.log("user signup");
  if (user) {
    res.status(403).json({ message: 'User already exists' });
  }
  else {
    const newUser = new USERS(userDetails);
    const newTask = new TASKS({
      regNo: userDetails.regNo,
      domain1: {
        description:userDetails.domain1,
        drive:userDetails.drive1
      },
      domain2: {
        description:userDetails.domain2,
        drive:userDetails.drive2
      }
    })
    await newUser.save();
    await newTask.save();
    const token = jwt.sign({ email: userDetails.email, role: 'user' }, SECRET, { expiresIn: process.env.TOKEN_TIMEOUT });
    res.json({ message: 'User created successfully', token });
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
app.get('/user/dashboard', async (req, res) => {
  const userDetails = req.body;
  const regNo = userDetails.regNo;
  const user = await USERS.findOne({ regNo });
  const task = await TASKS.findOne({ regNo });
  if (user) {
    res.json({
      username: user.username,
      year: user.year,
      branch: user.branch,
      domain1: task.domain1,
      domain2: task.domain2
    });
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
  const course = await TASKS.findOneAndUpdate({ regNo: req.body.regNo }, req.body, { new: true });
  if (course) {
    res.json({ message: 'Course updated successfully' });
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});
app.listen(3001, () => console.log('Server running on port 3001'));

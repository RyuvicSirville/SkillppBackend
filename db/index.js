const mongoose = require('mongoose');

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
      week0:{
        isCompleted: {
          type: Boolean,
          default: false
        }
      },
      week1:{
        isCompleted: {
          type: Boolean,
          default: false
        }
      },
      week2:{isCompleted: {
        type: Boolean,
        default: false
      }},
      week3:{isCompleted: {
        type: Boolean,
        default: false
      }},
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
      week0:{
        isCompleted: {
          type: Boolean,
          default: false
        }
      },
      week1:{
        isCompleted: {
          type: Boolean,
          default: false
        }
      },
      week2:{isCompleted: {
        type: Boolean,
        default: false
      }},
      week3:{isCompleted: {
        type: Boolean,
        default: false
      }},
    },
  })
  
  const USERS = mongoose.model('User', userSchema);
  const TASKS = mongoose.model('Task', taskSchema);
  module.exports={
    USERS,
    TASKS
  }
'use strict';

const serverless = require('serverless-http');
const express = require('express');
const app = express();
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.get('/test', function (req, res) {
  res.send('Hello World!' + process.env.BASE_PATH);
})

/**
 * Get user by email
 */
app.get('/users', function (req, res) {
  try {
    const params = {
      TableName: 'users',
      Key: {
        email: req.query.email
      },
    }
    dynamoDb.get(params, (error, result) => {
      if (error) {
        return res.status(400).json({ message: 'Could not get user', error });
      }
      if (result.Item) {
        const { email, name } = result.Item;
        return res.json({ email, name });
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error', error });
  }
});

/**
 * Create/ Update user
 */
app.post('/users', function (req, res) {
  try {
    const { email, name } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: '"Email" must be a string' });
    }
    const params = {
      TableName: 'users',
      Item: {
        email, name
      },
    };
    dynamoDb.put(params, (error) => {
      if (error) {
        return res.status(400).json({ error: 'Could not create user', error });
      }
      return res.json({ email, name });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error', error });
  }
});

/**
 * Delete user by email
 */
 app.delete('/users', function (req, res) {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: '"Email" must be a string' });
    }
    const params = {
      TableName: 'users',
      Key: {
        email
      },
    };
    dynamoDb.delete(params, (error) => {
      if (error) {
        return res.status(400).json({ error: 'Could not delete user', error });
      }
      return res.json({ message: `User '${email} has been deleted` });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error', error });
  }
});

module.exports.handler = serverless(app);
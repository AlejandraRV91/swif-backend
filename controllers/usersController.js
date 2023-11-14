const { validationResult } = require('express-validator');
const users = require('../queries/users');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { createUserQuery, loginUserQuery, getUsersQuery } = require("../queries/users");

const usersController = {
  
  createUser: async (req, res) => {
    const { first_name, last_name, username, password } = req.body;

    try {
      if (!first_name || !last_name || !username || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newUser = await createUserQuery({ first_name, last_name, username, password });
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error in createUser:", error);
      res.status(500).json({ error: error.message });
    }
  },

  loginUser: async (req, res) => {
    const { username, password } = req.body;
    try {
      if (!username || !password) {
        return res.status(400).json({ error: "username and password are required" });
      }
      const token = await loginUserQuery({ username, password });
      res.json({ token });
    } catch (error) {
      console.error("Error in loginUser:", error);
      res.status(500).json({ error: error.message });
    }
  },

  authenticateToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  },

  people: async (req, res) => {
    try {
      const users = await getUsersQuery();
      console.log('Sending users:', users); 
      res.json(users);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  },

};

module.exports = usersController;
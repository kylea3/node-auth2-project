const router = require("express").Router();
const { checkUsernameExists, validateRoleName } = require('./auth-middleware');
const { JWT_SECRET } = require("../secrets"); // use this secret!
const jwt = require('jsonwebtoken');
const User = require('../users/users-model')
const bcrypt = require('bcryptjs')

router.post("/register", validateRoleName, (req, res, next) => {

  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */
});


router.post("/login", checkUsernameExists, (req, res, next) => {
  let { username, password } = req.body;
  
  User.findBy({ username })
  .then(user => {
    console.log(user)
    if (user && bcrypt.compareSync(password, user[0].password)) {
      const token = buildToken(user[0])
      res.status(200).json({ message: `Welcome back ${user[0].username}...`, token})
    } else {
      next({ status:401, message: 'Invalid Credentials' })
    }})
    .catch(next)

  function buildToken(user) {
    const payload = {
      subject: user.user_id,
      username: user.username,
      role: user.role_name
    }
    const options = {
      expiresIn: "1d",
    }
    return jwt.sign(payload, JWT_SECRET , options)
  }
  /**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status 200
    {
      "message": "sue is back!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    The token must expire in one day, and must provide the following information
    in its payload:

    {
      "subject"  : 1       // the user_id of the authenticated user
      "username" : "bob"   // the username of the authenticated user
      "role_name": "admin" // the role of the authenticated user
    }
   */
});

module.exports = router;

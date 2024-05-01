const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const {sendResponseError} = require('../middleware/middleware')
const {checkPassword, newToken} = require('../utils/utility.function')

const signUpUser = async (req, res) => {
  //  const {email, fullName, password} = req.body
  // remove major smell issue found 
  let { password} = req.body
  let passwordCreated = String(password);
  try {
    const hash = await bcrypt.hash(passwordCreated, 8)

    await User.create({...req.body, password: hash})
    res.status(201).send('Sucessfully account opened ')
    return
  } catch (err) {
    console.log('Eorror : ', err)
    sendResponseError(500, 'Something wrong please try again', res)
    return
  }
}

const signInUser = async (req, res) => {
  let {password, email} = req.body
  let userEmail = String(email);
  let userPassword = String(password);

  console.log(req.body)
  try {
    const user = await User.findOne({email: userEmail})
    if (!!!user) {
      return sendResponseError(400, 'You have to Sign up first !', res)
    }

    const same = await checkPassword(userPassword, user.password)
    if (same) {
      let token = newToken(user)
      console.log({status: 'ok', token}); 
     return res.status(200).send({status: 'ok', token})
    }
    console.log('InValid password !', res);
    sendResponseError(400, 'InValid password !', res)
  } catch (err) {
    console.log('EROR', err)
    return sendResponseError(500, `Error ${err}`, res)
  }
}

const getUser = async (req, res) => {
  res.status(200).send({user: req.user})
}
module.exports = {signUpUser, signInUser, getUser}

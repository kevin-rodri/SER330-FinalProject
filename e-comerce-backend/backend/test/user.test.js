// https://circleci.com/blog/api-testing-with-jest/ , https://www.freecodecamp.org/news/how-to-test-in-express-and-mongoose-apps/, and  https://www.npmjs.com/package/supertest were used as a reference for this test 
const User = require('../models/User');
const request = require("supertest");
const app = require('../app'); 
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')


describe("User TestCases", () => {

    let user = null;
    let passswordd = null;
    beforeEach(async () => {
        // Connect to db
        await mongoose.connect('mongodb://127.0.0.1/ecom');
        // get rid of the user info stored in the db 
        await User.deleteMany({});
        // hash passsword (made tests easier)
        passswordd = "test123";
        const hash = await bcrypt.hash(passswordd, 8)
       user = await new User({
            email: "Dylan.Edward@quinnipiac.edu",
            password: hash, 
            fullName: "Dylan Edward"
        }).save();
    });

   // disconnect from db after running tests 
    afterEach(async () => {
        await mongoose.connection.close();
    });
  

    // post request for user sign up 
    test("POST /api/user/signup", async () => {
        const response = await request(app).post("/api/user/signup").send({
            email: "kevin.rodriguez@quinnipiac.edu",
            password: "newpassword",
            fullName: "Kevin Rodriguez"
        });
        expect(response.status).toBe(201);
        expect(response.text).toBe('Sucessfully account opened ');
        
    });

    // post request for user sign in
    test("POST /api/user/signin", async () => {
        const signInResponse = await request(app).post("/api/user/signin").send({
            email: user.email,
            password: passswordd
        });
        expect(signInResponse.status).toBe(200);
        expect(signInResponse.body.status).toBe('ok');
    });

    // post request for user sign with wrong credentials 
    test("POST /api/user/signin - ERROR", async () => {
        const signInResponse = await request(app).post("/api/user/signin").send({
            email: user.email,
            password: "wrongPassword"
        });
        expect(signInResponse.status).toBe(400);
        expect(signInResponse.text).toBe('InValid password !');
    });

    // post request for user sign in with account that does not exist
    test("POST /api/user/signin - ACCOUNT DNE", async () => {
        const signInResponse = await request(app).post("/api/user/signin").send({
            email: "bill.smith@quinnipiac.edu",
            password: "password123", 
        });
        expect(signInResponse.status).toBe(400);
        expect(signInResponse.text).toBe('You have to Sign up first !');
    });

});

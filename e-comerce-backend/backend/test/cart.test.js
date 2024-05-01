// https://circleci.com/blog/api-testing-with-jest/ , https://www.freecodecamp.org/news/how-to-test-in-express-and-mongoose-apps/, and  https://www.npmjs.com/package/supertest were used as a reference for this test const User = require('../models/User');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const request = require("supertest");
const app = require('../app');  
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
// needed to create a token for the user (This test is fun :/)
const {newToken} = require('../utils/utility.function');

describe("Cart TestCases", () => {

    // variables needed for test case 
    let productOne = null;
    let user = null;
    let cartItem = null;
    let token = null;
   
    beforeEach(async () => {
        // Connect to db
        await mongoose.connect('mongodb://127.0.0.1/ecom');
        // Clean up the user collection or seed necessary initial data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Cart.deleteMany({});
        const hash = await bcrypt.hash("test123", 8)
        // add user to db
        user = await new User({
            email: "Dylan.Nicolini@quinnipiac.edu",
            password: hash, 
            fullName: "Dylan Nicolini"
        }).save();
        // generate new token for user
        token = newToken(user);
        // product added to db
        productOne = await new Product({
            name: "Magnetic Soccer Tactics Board",
            imageUrl:
              "https://images.unsplash.com/photo-1605296867304-46d5465a13f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            description:
              "This magnetic tactics board is perfect for coaches to explain strategies and formations. It comes with magnets representing players, the ball, and other game components, making it easy to visualize and move pieces around during pre-game and halftime discussions.",
            price: 45,
            countInStock: 20
          }).save();
          // store the product in the cart
          cartItem = await new Cart({
            userId: user._id,
            productId: productOne._id,
            count: "3"
        }).save();
    });

     // disconnect from db after running tests 
     afterEach(async () => {
        await mongoose.connection.close();
    });
  
    // get request for cart items 
    test("GET /api/cart - ERROR", async () => {
        const response = await request(app).get("/api/cart")
        .set('Authorization', `Test ${token}`) // fails because of the 'Test' added to the token
        .send();
        expect(response.status).toBe(400);
        expect(response.text).toBe('You are not authorized ');

    });

    // adds item to cart
    test("POST /api/cart", async () => {
        const cartAddedItem = await request(app).post("/api/cart")
        .set('Authorization', `Bearer ${token}`) 
        .send({
            productId: productOne._id.toString(),
            count: cartItem.count

        });
        expect(cartAddedItem.status).toBe(201);
        const responseBody = JSON.parse(cartAddedItem.text);
    // make sure the response status is ok
    expect(responseBody.status).toBe('ok');
    // check product info matches what was added
    expect(responseBody.cart.productId).toBe(productOne._id.toString());
    expect(responseBody.cart.count).toBe('3');
    expect(responseBody.cart.userId).toBe(user._id.toString());
    });

    // get request for cart items
    test("GET /api/cart", async () => {
        const response = await request(app).get("/api/cart")
        .set('Authorization', `Bearer ${token}`) 
        .send();
        expect(response.status).toBe(200);
        const responseBody = JSON.parse(response.text);
        // ensures 1 item is in the cart
        expect(responseBody.carts.length).toBe(1);

    });

    // delete request for removing an item from the cart
    test("DELETE /api/cart/:productId", async () => {
        const response = await request(app).delete(`/api/cart/${cartItem._id}`)
        .set('Authorization', `Bearer ${token}`) 
        .send();
        expect(response.status).toBe(200);
        const responseBody = JSON.parse(response.text);
        // just to make sure it deleted the item
        expect(responseBody.status).toBe('ok');
    }); 

});

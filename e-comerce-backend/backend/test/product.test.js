// https://circleci.com/blog/api-testing-with-jest/ , https://www.freecodecamp.org/news/how-to-test-in-express-and-mongoose-apps/, and  https://www.npmjs.com/package/supertest were used as a reference for this test 
const Product = require('../models/Product');
const mongoose = require('mongoose');
const request = require("supertest");
const app = require('../app'); 

describe("Product TestCases", () => {

  // product variables
  let productOne = null;
  let productTwo = null;
  let productThree = null; 

beforeEach(async () => {
  // connect to db - copied from db file 
  await mongoose.connect('mongodb://127.0.0.1/ecom');
  // get rid of the products stored in the db 
  await Product.deleteMany({});
  // product 1 
  productOne = await new Product({
    name: "Magnetic Soccer Tactics Board",
    imageUrl:
      "https://images.unsplash.com/photo-1605296867304-46d5465a13f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description:
      "This magnetic tactics board is perfect for coaches to explain strategies and formations. It comes with magnets representing players, the ball, and other game components, making it easy to visualize and move pieces around during pre-game and halftime discussions.",
    price: 45,
    countInStock: 20
  }).save();
  // product 2 
  productTwo = await new Product({
    name: "Soccer Training Cones",
    imageUrl:
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description:
      "Set of 50 high visibility orange training cones, essential for any coaching kit. Perfect for setting up drills and exercises on the soccer field.",
    price: 30,
    countInStock: 40
  }).save();
  // product 3 
  productThree = await new Product({
    name: "Adidas Copa Mundial Soccer Cleats",
    imageUrl:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description:
      "Classic design combined with modern materials, these cleats offer unparalleled comfort and durability. Perfect for competitive soccer players looking for top-notch footwear.",
    price: 150,
    countInStock: 25
  }).save();
});

// disconnect from db after running tests 
afterEach(async () => {
  await mongoose.connection.close();
});


    // get request that gets all products stored so far 
    test("GET /api/products ", async () => {
        const response = await request(app).get("/api/products");
        expect(response.body.length).toBe(3);
    });

    // gets a specific product stored 
    test("GET /api/products/:id", async () => {
        const response = await request(app).get(`/api/products/${productOne._id}`);
        // get the corresponding product info 
        expect(response.body.name).toBe("Magnetic Soccer Tactics Board");
        expect(response.body.price).toBe(45);
        expect(response.body.countInStock).toBe(20);
        expect(response.body.description).toBe("This magnetic tactics board is perfect for coaches to explain strategies and formations. It comes with magnets representing players, the ball, and other game components, making it easy to visualize and move pieces around during pre-game and halftime discussions.");
      });

      // gives error as id does not exist
      test("GET /api/products/:id - ERROR", async () => {
        // invalid ID 
        const response = await request(app).get("/api/products/2024");
        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Server Error");
      });



});



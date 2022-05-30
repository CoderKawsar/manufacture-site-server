const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { ObjectId } = require("mongodb");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// ------------------ Middlewares -------------------------//
app.use(cors());
app.use(express.json());

// ------------------ Mongo DB -------------------------//
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.otylb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();

    const toolsCollection = client.db("manufacturer").collection("tools");
    const reviewsCollection = client.db("manufacturer").collection("reviews");
    const ordersCollection = client.db("manufacturer").collection("orders");
    const usersCollection = client.db("manufacturer").collection("users");

    app.get("/", (req, res) => {
      res.send("Yay!");
    });

    // GET all tools data
    app.get("/tools", async (req, res) => {
      const total = parseInt(req.query.total);
      const query = {};
      const options = {
        sort: { _id: -1 },
      };
      const cursor = toolsCollection.find(query, options);
      let result;
      if (total) {
        result = await cursor.limit(total).toArray();
      } else {
        result = await cursor.toArray();
      }
      res.send(result);
    });

    // GET single tool data based on id
    app.get("/tools/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const tool = await toolsCollection.findOne(query);
      res.send(tool);
    });

    // POST a tool/product
    app.post("/tools", async (req, res) => {
      const toolData = req.body;
      const result = await toolsCollection.insertOne(toolData);
      res.send(result);
    });

    // GET reviews data
    app.get("/reviews", async (req, res) => {
      const total = parseInt(req.query.total);
      const query = {};
      const options = {
        sort: { _id: -1 },
      };
      const cursor = reviewsCollection.find(query, options);
      let result;
      if (total) {
        result = await cursor.limit(total).toArray();
      } else {
        result = await cursor.toArray();
      }
      res.send(result);
    });

    // POST a review
    app.post("/reviews", async (req, res) => {
      const reviewData = req.body;
      const result = await reviewsCollection.insertOne(reviewData);
      res.send(result);
    });

    // GET all orders
    app.get("/orders", async (req, res) => {
      const query = {};
      const cursor = await ordersCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });

    // GET all orders data of an user
    app.get("/orders/:uid", async (req, res) => {
      const searchedUid = req.params.uid;
      const query = { uid: searchedUid };
      const cursor = ordersCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });

    // POST order data to db
    app.post("/orders", async (req, res) => {
      const orderData = req.body;
      const result = await ordersCollection.insertOne(orderData);
      res.send(result);
    });

    // DELETE an order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    });

    // GET all users
    app.get("/users", async (req, res) => {
      const query = {};
      const cursor = usersCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });

    // Get the user data
    app.get("/user/:uid", async (req, res) => {
      const uidToGet = req.params.uid;
      const query = { uid: uidToGet };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });

    // Upsert User info
    app.put("/user/:uid", async (req, res) => {
      const uidToChange = req.params.uid;
      const userData = req.body;
      const filter = { uid: uidToChange };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          uid: userData.uid,
          name: userData.name,
          email: userData.email,
          photoURL: userData.photoURL,
          education: userData.education,
          location: userData.location,
          phone: userData.phone,
          linkedinProfileLink: userData.linkedinProfileLink,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // Make an user admin
    app.put("/user/admin/:uid", async (req, res) => {
      const uidToChange = req.params.uid;
      const filter = { uid: uidToChange };
      const updatedDoc = {
        $set: { role: "admin" },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

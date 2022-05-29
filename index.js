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

    app.get("/", (req, res) => {
      res.send("Hello World!");
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

    // POST order data to db
    app.post("/orders", async (req, res) => {
      const orderData = req.body;
      const result = await ordersCollection.insertOne(orderData);
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

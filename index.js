const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// Mongodb server

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.bfg1fsg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const popularClass = client.db("snapSchool").collection("popularClass");
    const popularInstructor = client
      .db("snapSchool")
      .collection("popularInstructor");
    const selectedClass = client.db("snapSchool").collection("selectedClass");

    // All Class & Instructor
    app.get("/allClass", async (req, res) => {
      const result = await popularClass.find().toArray();
      res.send(result);
    });
    app.get("/allInstructor", async (req, res) => {
      const result = await popularInstructor.find().toArray();
      res.send(result);
    });

    // Popular Class & Instructor
    app.get("/popularClass", async (req, res) => {
      const result = await popularClass
        .find()
        .sort({ enrolledStudents: -1 }) // Sort in descending order based on enrolledStudents
        .limit(6) // Limit the result to top 6 classes
        .toArray();
      res.send(result);
    });
    app.get("/popularTeacher", async (req, res) => {
      const result = await popularInstructor
        .find()
        .sort({ classesTaken: -1 })
        .toArray();
      res.send(result);
    });

    app.post("/selectedClass", async (req, res) => {
      const item = req.body;
      const result = await selectedClass.insertOne(item);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Snap school is running");
});
app.listen(port, () => {
  console.log(`Snap School is running on ${port}`);
});

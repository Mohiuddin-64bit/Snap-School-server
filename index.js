const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// Mongodb server

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

    const usersCollection = client.db("snapSchool").collection("users");
    const popularClassCollection = client
      .db("snapSchool")
      .collection("popularClass");
    const popularInstructorCollection = client
      .db("snapSchool")
      .collection("popularInstructor");
    const selectedClassCollection = client
      .db("snapSchool")
      .collection("selectedClass");

    // Users related API
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    // Find User by email
    app.get("/usersE", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    // save user info to database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send({ message: "User already Exists" });
      } else {
        const result = await usersCollection.insertOne(user);
        res.send(result);
      }
    });

    // Dashboard User Role(Admin, Instructor)
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(query, updatedDoc);
      res.send(result);
    });
    app.patch("/users/instructor/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "instructor",
        },
      };
      const result = await usersCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    // Delete User
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // All Class & Instructor
    app.get("/allClass", async (req, res) => {
      const result = await selectedClassCollection.find().toArray();
      res.send(result);
    });
    app.post("/allClass", async (req, res) => {
      const classes = req.body;
      const result = await selectedClassCollection.insertOne(classes);
      res.send(result);
    });
    // Approved Method
    app.patch("/allClass/approved/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "Approved",
        },
      };
      const result = await selectedClassCollection.updateOne(query, updatedDoc);
      res.send(result);
    });
    // Denied Method
    app.patch("/allClass/denied/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "Denied",
        },
      };
      const result = await selectedClassCollection.updateOne(query, updatedDoc);
      res.send(result);
    });
    app.get("/allInstructor", async (req, res) => {
      const result = await popularInstructorCollection.find().toArray();
      res.send(result);
    });

    // Popular Class & Instructor
    app.get("/popularClass", async (req, res) => {
      const result = await selectedClassCollection
        .find()
        .sort({ enrolledStudents: -1 }) // Sort in descending order based on enrolledStudents
        .limit(6) // Limit the result to top 6 classes
        .toArray();
      res.send(result);
    });
    app.get("/popularTeacher", async (req, res) => {
      const result = await selectedClassCollection
        .find()
        .limit(6)
        .toArray();
      res.send(result);
    });

    // My Selected class API
    app.post("/selectedClass", async (req, res) => {
      const item = req.body;
      const result = await selectedClassCollection.insertOne(item);
      res.send(result);
    });

    app.get("/selectedClass", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      } else {
        const query = { email: email };
        const result = await selectedClassCollection.find(query).toArray();
        res.send(result);
      }
    });

    app.delete("/selectedClass/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await selectedClassCollection.deleteOne(query);
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

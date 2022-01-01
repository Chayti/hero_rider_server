const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
// const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iea9q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("heroRider");
        const usersCollection = database.collection("users");
        const LessonsCollection = database.collection("lessons");

        // add user to DB
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // GET Single user API
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            res.send(user)
        })

        // GET API
        // app.get('/users', async (req, res) => {
        //     const cursor = usersCollection.find({})
        //     const users = await cursor.toArray()
        //     res.send(users)
        // })

        // POST API
        app.post('/addLesson', async (req, res) => {
            const lesson = req.body
            const result = await LessonsCollection.insertOne(lesson)
            res.json(result)
        })

        // GET API
        app.get('/lessons', async (req, res) => {
            const cursor = LessonsCollection.find({})
            const lessons = await cursor.toArray()
            res.send(lessons)
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hero Rider Website!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})
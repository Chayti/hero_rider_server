const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;
const stripe = require('stripe')(process.env.STRIPE_SECRET)

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
        // const bookingCollection = database.collection("booking");

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

        // app.post('/booking', async (req, res) => {
        //     const booking = req.body
        //     const result = await bookingCollection.insertOne(booking)
        //     res.json(result)
        // })

        // app.get('/booking/:email', async (req, res) => {
        //     const cursor = bookingCollection.find({})
        //     const booking = await cursor.toArray()
        //     res.send(booking)
        // })

        app.get('/lessons/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await LessonsCollection.findOne(query);
            res.json(result);
        })

        app.put('/lessons/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    payment: payment
                }
            };
            const result = await LessonsCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        app.post('/create-payment-intent', async (req, res) => {
            const paymentInfo = req.body;
            const amount = paymentInfo.price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                payment_method_types: ['card']
            });
            res.json({ clientSecret: paymentIntent.client_secret })
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
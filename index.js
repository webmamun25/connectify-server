const express = require('express')
const app = express()
const port = 5000
var cors = require('cors')
require('dotenv').config()
var jwt = require('jsonwebtoken');
app.use(cors())
app.use(express.json());
// connectify-user
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7oueg7i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const bcrypt = require('bcrypt');






const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)

        const database = client.db("TripZen");

        const UsersCollection = database.collection("User");

        app.get('/', async (req, res) => {
            res.send("Hello world")
        })


        app.post('/register', async (req, res) => {
            const { username, password } = req.body;
            const existingUser = await UsersCollection.findOne({ username });

            if (existingUser) {
                return res.status(400).send({ message: 'Username already exists' });
            }

            try {
                // Hash the password with bcrypt
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);

                // Insert user with hashed password into MongoDB
                const result = await UsersCollection.insertOne({
                    username,
                    password: hashedPassword, // store the hashed password
                });

                res.status(201).send({ message: 'User registered successfully', userId: result.insertedId });
            } catch (err) {
                console.error('Error registering user:', err);
                res.status(500).send({ message: 'Error registering user' });
            }
        });

        app.post('/signin', async (req, res) => {
            const { username, password } = req.body;

            try {
                // Find user in the MongoDB database
                const user = await UsersCollection.findOne({ username });

                if (!user) {
                    return res.status(400).send({ message: 'User not found' });
                }

                // Compare the provided password with the stored hashed password
                const isPasswordValid = await bcrypt.compare(password, user.password);

                if (!isPasswordValid) {
                    return res.status(400).send({ message: 'Invalid password' });
                }

                res.status(200).send({ message: 'Login successful' });
            } catch (err) {
                console.error('Error during login:', err);
                res.status(500).send({ message: 'Error during login' });
            }
        });







        app.get('/users', async (req, res) => {

            const users = await UsersCollection.find().toArray();
            res.send(users)
        })





        // jwt api 










        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error    await client.close();
    }
}

run().catch(console.dir);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
// add the required logic in this server template.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express()
const PORT = process.env.PORT || 5000;
// Middleware 
app.use(cors({
    origin: ['http://localhost:5173', 'https://assignment-12-93b12.web.app', 'https://ass-12-delta.vercel.app'],
    credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.send("TOOTHORA SERVER RUNNING")
})

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.x6oak.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const appoinmentsCollection = client.db("Toothora").collection('appoinments');

        app.post('/api/bookingAppoinments', async (req, res) => {
            const appoinment = req.body;
            const { doctor, date } = appoinment;

            if (!doctor || !date) {
                return res.status(400).json({ message: "Doctor and date are required" });
            }
 
            const existingBookings = await appoinmentsCollection
                .find({ doctor, date })
                .sort({ serial: 1 })
                .toArray();

            if (existingBookings.length >= 20) {
                return res.status(400).json({ message: "All 20 appointment slots are filled for this doctor on this date." });
            }
 
            const serial = existingBookings.length + 1; 
            const newBooking = { ...appoinment, serial, createdAt: new Date() };

            const result = await appoinmentsCollection.insertOne(newBooking);

            res.send({
                acknowledged: true,
                message: "Appointment booked successfully",
                serial,
                insertedId: result.insertedId
            });
        });


        // // BLOG API 
        // app.post('/blogs', async (req, res) => {
        //     const blog = req.body
        //     const result = await BlogsCollections.insertOne(blog)
        //     res.send(result)
        // })

        // app.get('/blogs', async (req, res) => {
        //     const page = parseInt(req.query.page)
        //     const size = parseInt(req.query.size)
        //     const blogCount = await BlogsCollections.countDocuments()
        //     const result = await BlogsCollections.find().skip(page * size).limit(size).toArray()
        //     res.send({ result, blogCount })
        // })

        // app.get('/blogs/:id', async (req, res) => {
        //     const id = req.params.id
        //     const query = { _id: new ObjectId(id) }
        //     const result = await BlogsCollections.findOne(query)
        //     res.send(result)
        // })



    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
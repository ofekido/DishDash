
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const CONNECTION_STRING = "mongodb+srv://ofekidodo:1Q2W3e4r@questiontree.cljmgut.mongodb.net/?retryWrites=true&w=majority&appName=questionTree";
const DATABASE_NAME = "questionTreeDB";
let database;

app.listen(5038, () => {
    MongoClient.connect(CONNECTION_STRING, (error, client) => {
        if (error) {
            console.error("Mongo Db connection error:", error);
        } else {
            database = client.db(DATABASE_NAME);
            console.log("Mongo Db connection established");
        }
    });
});

app.get('/api/DishDash/GetQuestions', (request, response) => {
    database.collection("questionTreeCollection").find({}).toArray((error, result) => {
        if (error) {
            console.error("Error fetching data:", error);
            response.status(500).send("Internal Server Error");
        } else {
            response.send(result);
        }
    });
});

app.post('/api/saveResponseToMongoDB', (request, response) => {
    const { userId, questionText, responseText, questionId, createdAt } = request.body;

    database.collection("responsesCollection").insertOne({
        userId,
        questionText,
        responseText,
        questionId,
        createdAt
    }, (error, result) => {
        if (error) {
            console.error("Error adding response:", error);
            response.status(500).send("Internal Server Error");
        } else {
            response.json('Response added successfully');
        }
    });
});

module.exports = app;
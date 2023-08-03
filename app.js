const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const ejs = require("ejs");
var _ = require('lodash');

const app = express();

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

// connect to DB
mongoose.connect(process.env.DB, { useNewUrlParser : true});

// DB model
const foodSchema = new mongoose.Schema({
    name: String,
    rating: [{
        username: String,
        ratingNumber: Number,
        review: String
    }],
    currentRating: Number,
    categories: [String]
});

const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    favoriteCategories: [String],
    favoriteFood: [foodSchema],
    ratingGiven: [{
        foodName: String,
        rating: Number
    }]
});

// establish db collection
const Food = mongoose.model("Food", foodSchema);
const User = mongoose.model("User", userSchema);

// HTTP Request
app.get('/', async(req, res) =>{
    try{
        // return sorted food based on rating
        const foods = await Food.find({});
        foods.sort((a, b) => a.currentRating - b.currentRating);

        const response = {
            error: false,
            foods
        };
        res.status(200).json(response);
    } catch(err){
        res.status(500).json({error: true, message: "Internal Server Error"});
    }
});

app.get('/categories', async(req, res) => {
    try{
        res.status(200).json({error: false});
    }catch(err){
        res.status(500).json({error: true, message: "Internal Server Error"});
    }
});

app.get('/category-search', async(req, res) => {
    try{
        const foods = await Food.find({});
        const response = {
            error: false,
            foods
        }
    }catch(err){
        res.status(500).json({error: true, message: "Internal Server Error"});
    }
});

app.get('/foods/:foodName', async(req, res)=>{
    try{
        const foods = await Food.find({});
        let found = false;
        for (let i = 0; i < foods.length; i++){
            if (_.lowerCase(foods[i].name) === _.lowerCase(req.params.foodName)){
                found = true;
                res.status(200).json({error: true, food: foods[i]});
            }
        }
        if (!found){
            res.status(400);
        }
    }catch(err){
        res.status(500).json({error: true, message: "Internal Server Error"});
    }
});

app.listen(port, ()=> {
    console.log("Server started on port 3000");
});
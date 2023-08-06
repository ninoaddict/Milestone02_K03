const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const ejs = require("ejs");
var _ = require('lodash');
// const foodsData = require("./config/foods.json")

const app = express();

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

// connect to DB
mongoose.connect("mongodb://localhost:27017/makanyukDB", { useNewUrlParser : true});

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
        let foods = await Food.find({});
        foods.sort((a, b) => b.currentRating - a.currentRating);

        const response = {
            error: false,
            foods
        };
        res.render("home", response);
        //res.status(200).json(response);
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

app.get('/categorysearch', async(req, res) => {
    try{
        const foods = await Food.find({});
        const response = {
            error: false,
            foods
        }
        res.status(200).json(response)
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
                res.status(200).json({error: false, food: foods[i]});
            }
        }
        if (!found){
            res.status(400);
        }
    }catch(err){
        res.status(500).json({error: true, message: "Internal Server Error"});
    }
});

app.get('/toprated', async(req, res)=>{
    try{
        let foods = await Food.find({});
        foods.sort((a, b) => b.currentRating - a.currentRating);
        foods = foods.slice(0, 3);
        // res.status(200).json({error: false, foods : foods});
        res.render("toprated", {foods : foods, pageTitle : ""});
    }catch{
        res.status(500).json({error: true, message: "Internal Server Error"});   
    }
});

app.get('/about', (req, res)=>{
    try{
        res.status(200).json({error: false});
    }catch{
        res.status(500).json({error: true});
    }
});

// const insertFoods = async () => {
//     try{
//         const docs = await Food.insertMany(foodsData);
//         return Promise.resolve(docs);
//     }catch{
//         return Promise.reject(err);
//     }
// };

// insertFoods()
//     .then((docs) => console.log(docs))
//     .catch((err)=> console.log(err));

app.listen(port, ()=> {
    console.log("Server started on port" + port);
});
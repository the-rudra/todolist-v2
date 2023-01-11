const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const items = ["Buy food", "Cook food", "Eat food"];
const workItems = [];

const itemSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model("Item", itemSchema);
const first = new Item({name: "Welcome to your todo List"});
const second = new Item({name: "Press the + button to add a new item"});
Item.insertMany([first, second], function (err) {
    if (err) {
        console.log(err);
    }else {
        console.log("success")
    }});

app.get("/", (req, res) => {
    const day = date.getDate();
    res.render('list', {listTitle: day, newListItem: items});
});

app.get("/work", (req, res) => {
    res.render('list', {listTitle: "Work List", newListItem: workItems});
});

app.get("/about", (req, res) => {
    res.render('about');
});

app.post("/", (req, res) => {
    const item = req.body.newItem;

    if(req.body.button === "Work List"){
        workItems.push(item);
        res.redirect("/work");
    } else {
        items.push(item);
        res.redirect("/");
    }
    
});

app.listen(3000, function () {
    console.log("server listening on port 3000");
});
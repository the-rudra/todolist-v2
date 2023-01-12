const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const pass = process.env.PASSWORD;
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://admin-rudra:" + pass + "@cluster0.fsn0ojs.mongodb.net/todolistDB");

const day = date.getDate();
const itemSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});
const List = mongoose.model("List", listSchema);

const first = new Item({name: "Welcome to your todo List"});
const second = new Item({name: "Press the + button to add a new item"});
const defaultItems = [first, second];

app.get("/", (req, res) => {
        Item.find({}, 'name', function(err, items){
            if(items.length === 0) {
                Item.insertMany(defaultItems, function (err) {
                    if (err) {
                        console.log(err);
                    }else {
                        console.log("success")
                }});
                res.redirect("/");
            } else {
                res.render('list', {listTitle: day, newListItem: items});
            }
        });   
});

app.get("/:listName", (req, res) => {
    const customListName = _.capitalize(req.params.listName);
    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({name: customListName, items: defaultItems});
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render('list', {listTitle: foundList.name, newListItem: foundList.items});
            }
        } else {
            console.log(err);
        }
    });
});

app.post("/", (req, res) => {
    const itemName = req.body.newItem;
    const newListItem = new Item({name: itemName});

    const listName = req.body.button;

    if(listName === day){
        newListItem.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(newListItem);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
    
});

app.post("/delete", (req, res) => {
    const checkedItem = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === day){
        Item.findByIdAndRemove(checkedItem, function(err){
            if(!err) {
                console.log("removed item");
            }});
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}, function(err, foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        })
    }
});

app.listen(process.env.PORT || 3000, function () {
    console.log("server started");
});
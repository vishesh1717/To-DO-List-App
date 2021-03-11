//jshint esversion:6

const express = require("express");
const _=require("lodash");
const mongoose = require("mongoose");
const app = express();
const bodyParser  = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin-Vishesh:golempekka16@cluster0.7rvyq.mongodb.net/todolistDB",{useUnifiedTopology: true},{useNewUrlParser:true});

const itemsSchema={
  name :String
}

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to your todolist!"
})

const item2=new Item({
  name:"hit the + button to add a new item"
})

const item3=new Item({
  name :"hit this to delete"
})

const defaultItems=[item1,item2,item3]

const listSchema={
  name:String,
  items:[itemsSchema]
}

const List=mongoose.model("List",listSchema)
 


app.get("/", function(req, res) {

// const day = date.getDate();\
  Item.find({},function(err,founditems){
    // console.log(founditems);
    if(founditems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully saved default items to DB");
        }
      })
      res.redirect("/");

    }else{
    res.render("list", {listTitle: "Today", newListItems: founditems});
    }
  })
});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function (err,foundList) {
    if(!err){
      if (!foundList){
        const list=new List({
          name:customListName,
          items:defaultItems
        });
      list.save()
      res.redirect("/"+customListName);
      
      }else{
        res.render("list",{listTitle:foundList.name ,newListItems:foundList.items});
      }
    }
  })

})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list
  
  const item=new Item({
    name: itemName
  })
  
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item)
      foundList.save()
      res.redirect("/"+listName)
    })
  }
});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("suceesfuly deleted");
        res.redirect("/");
      }
    })

  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName)
      }
    })
  }

  
})


app.get("/about", function(req, res){
  res.render("about");
});
let port=process.env.PORT;
if(port== null || port ==""){
  port=3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
 
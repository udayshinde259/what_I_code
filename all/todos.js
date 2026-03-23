const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

let pathRoute = path.join(__dirname, "a.json")

app.use(express.json());

app.get("/", function(req, res){
    let data = fs.readFileSync(pathRoute, "utf-8")
    let todos = JSON.parse(data);
    res.json(todos);
})

app.get("/", function(req, res){
    let data = fs.readFileSync(pathRoute, "utf-8")
    let todos = JSON.parse(data);

    let id = req.body.id;
    let todo = todos[id];
    res.json(todo);
})

app.post("/", function(req, res){
    let title = req.body.title;
    let complete = req.body.complete;

    let data = fs.readFileSync(pathRoute, "utf-8")
    let todos = JSON.parse(data);
    let id = todos.length;

    todos.push({
        id: id,
        title: title,
        complete: complete
    })

    fs.writeFileSync(pathRoute, JSON.stringify(todos, null, 2), "utf-8");
    id++;
    res.json({
        msg: "done"
    })
})

app.put("/", function(req, res){
    let data = fs.readFileSync(pathRoute, "utf-8")
    let todos = JSON.parse(data);

    let id = req.body.id;
    todos[id-1].complete = true;

    fs.writeFileSync(pathRoute, JSON.stringify(todos, null, 2), "utf-8");
    res.json({
        msg: "done"
    })
})

app.delete("/", function(req, res){
    let data = fs.readFileSync(pathRoute, "utf-8")
    let todos = JSON.parse(data);

    let idDelete = req.body.id;
    todos.splice(idDelete-1, 1);

    for (let i = idDelete-1; i < todos.length; i++){
        todos[i].id = i;  
    }

    fs.writeFileSync(pathRoute, JSON.stringify(todos, null, 2), "utf-8");
    
    res.send("The todo is deleted sucessfully");
})


app.delete("/all", function(req, res){
    let todos = [];

    
    fs.writeFileSync(pathRoute, JSON.stringify(todos, null, 2), "utf-8");
    
    res.send("All the todos are deleted sucessfully");
})

app.listen(3000);
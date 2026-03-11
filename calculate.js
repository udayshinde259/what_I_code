const express = require("express");
const app = express();

app.get("/add", function(req, res){
    let a = parseInt(req.query.a);
    let b = parseInt(req.query.b);

    
    res.json({
        answer: a+b
    });
})

app.get("/sub", function(req, res){
    let a = parseInt(req.query.a);
    let b = parseInt(req.query.b);

    
    res.json({
        answer: a-b
    });
})

app.get("/mul/:a/:b", function(req, res){
    let a = parseInt(req.params.a);
    let b = parseInt(req.params.b);

    
    res.json({
        answer: a*b
    });
})

app.get("/div", function(req, res){
    let a = parseInt(req.query.a);
    let b = parseInt(req.query.b);

    
    res.json({
        answer: a/b
    });
})

app.listen(3000);


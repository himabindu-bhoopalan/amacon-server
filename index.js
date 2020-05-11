const express=require('express');
const app=express();
const cors=require('cors');
const bodyParser=require('body-parser');
const mongoClient=require('mongodb');
const url='mongodb+srv://hima:nature@cluster0-6o34c.mongodb.net/test?retryWrites=true&w=majority';


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); 

app.delete("/del/:id", function (req, res) {
    let id=req.params.id;
    // console.log('inside delete'+id);
    var ObjectId = require('mongodb').ObjectID; 
    mongoClient.connect(url, function (err, client) {
        if (err) throw err;
        var db = client.db("demoDb");
        // console.log(id);
        db.collection("product").deleteOne({ _id: ObjectId(id) }, function (err, result) {
            if (err) throw err;
            client.close();
            if(result.deletedCount==1){
                res.json({
                    status:200,
                    message: "Product deleted"
                })
            }
            else{
                res.json({
                    status:404,
                    message:"Product not found"
                })
            }
           
        });
    });
});

app.get('/',function(req,res){
    console.log('get');
    mongoClient.connect(url,function(err,client){
        if(err) throw err;
        var db=client.db("demoDb")
        var userData= db.collection("product").find().toArray(
            function(err, result) {
                if (err) throw err;
                // console.log(result);
                res.json(result);
                client.close();
            })
        
    })
    
});


app.get('/category/:name',function(req,res){
    var cat=req.params.name;
    // console.log('inside the category get method');
    // console.log(cat);

    mongoClient.connect(url,function(err,client){
        if(err) throw err;
        var db=client.db("demoDb")
        var userData= db.collection("product").find({category:cat}).toArray(
            function(err, result) {
                if (err) throw err;
                // console.log(result);
                res.json(result);
                client.close();
            })
        
    })
    
});


app.post('/addproduct',function(req,res){
    // console.log(req.body);
    mongoClient.connect(url,function(err,client){
    
        if(err) throw err;
        var db=client.db("demoDb")                           
        db.collection("product").insert(req.body,function(err,data){  
            if(err) throw err;                              
                client.close();                            
                res.json({
                    message:"data inserted"
                })
                                                 
        })

    })
    
});

app.put('/update',function(req,res){
    // console.log(req.params.data);
    // console.log(req.body);
    // console.log(req.params.id);
    var id=req.body._id;
    console.log(id);
    mongoClient.connect(url,function(err,client){
        if(err) throw err;
        var db=client.db('demoDb');
        var ObjectId = require('mongodb').ObjectID;
        db.collection('product').updateOne({ _id: ObjectId(id) },{$set:{name:req.body.name,id:req.body.id,category:req.body.category,price:req.body.price,
            image:req.body.image,description:req.body.description}},function(err,data){
            if(err) throw err;
            client.close();
            if(data.modifiedCount==1){
                res.json({
                    message:"Updated!!"
                })
            }
            else{
                res.json({
                    message:'not updated..something went wrong!Try again after sometime'
                })
            }
            
        })    
        })
    
    });

app.listen(process.env.PORT,function(){
    console.log('port is running on 3000')
});
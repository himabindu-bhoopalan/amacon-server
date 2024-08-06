const express=require('express');
const app=express();
const cors=require('cors');
const bodyParser=require('body-parser');
const mongoClient=require('mongodb');

require('dotenv').config();

const url = process.env.DB_HOST;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); 

app.get('/home', async (req, res) => {
    let client;
    try {
        client = await mongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db("ecommerce");
        const products = await db.collection("products").find().toArray();
        res.json(products);
    } catch (err) {
        console.error("Failed to connect to MongoDB or fetch data:", err);
        res.status(500).json({ message: "An error occurred while fetching data." });
    } finally {
        if (client) {
            client.close();
        }
    }
});

app.delete("/del/:id", function (req, res) {
    let id=req.params.id;
    var ObjectId = require('mongodb').ObjectID; 
    mongoClient.connect(url, function (err, client) {
        if (err) throw err;
        var db = client.db("ecommerce");
        db.collection("products").deleteOne({ _id: ObjectId(id) }, function (err, result) {
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

app.get('/categories', function(req, res) {
    mongoClient.connect(url, function(err, client) {
        if (err) {
            console.error("Failed to connect to MongoDB:", err);
            return res.status(500).json({ message: "Database connection failed" });
        }

        const db = client.db("ecommerce");

        db.collection("category").find().toArray(function(err, categories) {
            client.close();
            if (err) {
                console.error("Failed to fetch categories:", err);
                return res.status(500).json({ message: "Failed to fetch categories" });
            }
            res.json(categories);
        });
    });
});


app.get('/category/:name',function(req,res){
    var cat=req.params.name;

    mongoClient.connect(url,function(err,client){
        if(err) throw err;
        var db=client.db("ecommerce")
        var userData= db.collection("products").find({category:cat}).toArray(
            function(err, result) {
                if (err) throw err;
                res.json(result);
                client.close();
            })
        
    })
    
});


app.post('/addproduct', function(req, res) {
    var ObjectId = require('mongodb').ObjectID; 
    mongoClient.connect(url, function(err, client) {
        if (err) {
            console.error("Failed to connect to MongoDB:", err);
            return res.status(500).json({ message: "Database connection failed" });
        }

        const db = client.db("ecommerce");
        const newProduct = {
            _id: new ObjectId(),  
            name: req.body.name,
            product_id: req.body.product_id,
            category: req.body.category,
            price: req.body.price
        };

        const categoryQuery = { name: req.body.category };

        // Check if the category exists
        db.collection("categories").findOne(categoryQuery, function(err, category) {
            if (err) {
                client.close();
                console.error("Error checking category:", err);
                return res.status(500).json({ message: "Failed to check category" });
            }

            if (!category) {
                // Category doesn't exist, insert it
                db.collection("category").insertOne({ name: req.body.category }, function(err, result) {
                    if (err) {
                        client.close();
                        console.error("Error inserting category:", err);
                        return res.status(500).json({ message: "Failed to insert category" });
                    }

                    // Now insert the product
                    insertProduct(db, newProduct, client, res);
                });
            } else {
                // Category exists, directly insert the product
                insertProduct(db, newProduct, client, res);
            }
        });
    });

    function insertProduct(db, newProduct, client, res) {
        db.collection("products").insertOne(newProduct, function(err, data) {
            client.close();
            if (err) {
                console.error("Error inserting product:", err);
                return res.status(500).json({ message: "Failed to insert product" });
            }

            res.json({
                message: "Product inserted successfully",
                productId: newProduct._id
            });
        });
    }
});

app.put('/update', function(req, res) {
    var id = req.body._id;
    console.log(id);
    mongoClient.connect(url, function(err, client) {
        if (err) throw err;
        var db = client.db('ecommerce');
        var ObjectId = require('mongodb').ObjectID;
        db.collection('products').updateOne(
            { _id: ObjectId(id) },
            {
                $set: {
                    name: req.body.name,
                    product_id: req.body.product_id,
                    category: req.body.category,
                    price: req.body.price
                }
            },
            function(err, data) {
                if (err) throw err;
                client.close();
                if (data.modifiedCount == 1) {
                    res.json({
                        message: "Updated!!"
                    });
                } else {
                    res.json({
                        message: 'Not updated..something went wrong! Try again later.'
                    });
                }
            }
        );    
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
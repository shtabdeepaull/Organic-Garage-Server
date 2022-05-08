const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// used middleware
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gfrpv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const productCollection = client.db('WarehouseManagement').collection('product');

  //AUTH
   app.post('/login', async(req, res) => {
    const user =req.body;
    const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN,{
      expiresIn: '1d'
    });
    res.send(accessToken);
   })   

    // products API 
    app.get('/product', async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const query = {};
      const cursor = productCollection.find(query);
      let products;
      if (page || size) {
        products = await cursor.skip(size*page).toArray();
      }
      else {
        products = await cursor.toArray();
      }

      res.send(products);
    });

    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    app.get('/product', async(req, res) => {
      const email = req.query.email;
      const query={email: email};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    })

    // POST
    app.post('/product', async (req, res) => {
      const newItem = req.body;
      const result = await productCollection.insertOne(newItem);
      res.send(result);
    });

    // product count API
    app.get('/productCount', async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const count = await productCollection.estimatedDocumentCount();
      res.send({ count });
    })
  }
  finally {

  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Running warehouse server');
});


app.listen(port, () => {
  console.log('Listening to server')
})
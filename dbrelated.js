const express =require("express");
const app =express();
const knex = require('knex')({
    client: 'pg',
    connection: {
      host : 'postgres://localhost/postgres',
      user : 'postgres',
      password : 'Welcome123',
      database : 'postgres'
    }
  });

  knex.schema.createTable('USERS', (table) => {
    table.increments('id')
    table.string('name')
    table.integer('age')
  });

app.use(express.json());
app.get("/",(req,res)=>
{
    console.log("inside get");
    res.json(req.body);
})

app.get("/api",(req,res)=>
{
    console.log("inside get");
    res.json("api");
})



app.listen(3001,()=>
{
    console.log('server is listening');
});
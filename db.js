const db= require("knex")({
    client:"pg",
    connection:{
        host:"localhost",
        user:"postgres",
        database:"users",
        password:"Welcome123"
    }

})

module.exports=db;
const express = require("express");
const session = require("express-session");
const fs = require("fs");
//const { ppid } = require("process");
const app = express();
const db = require("./db");
app.set("db", db);
app.set("trust proxy", 1);
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

app.use(express.json());
//app.use(express.static('./htmlfiles'));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);

const user = [];

//For signup
app.post("/signup", (req, res) => {
  const db = req.app.get("db");
  const { Email, Password, Fullname } = req.body;
  // Check whether the table exists inside the database, if not create one and insert record !!! Only for the first time column creation--
  db.schema.hasTable("users").then(exists => {
    if (!exists) {
      db.schema
        .createTable("users", table => {
          table.increments("id").primary();
          table.string("FULLNAME");
          table.string("EMAIL");
          table.string("PASSWORD");
          table.timestamp("CREATEDDATE").defaultTo(db.fn.now());
        })
        .then(() => {
          console.log("Table not exists  first time ");
          db("users")
            .insert({ FULLNAME: Fullname, EMAIL: Email, PASSWORD: Password })
            .then(() => {
              console.log("row inserted");
              res.redirect("/?error=false");
            });
        });
    } else {
      console.log("table exists");
      // Insert the new record only if the record not exists else throw error
      const { Email, Password, Fullname } = req.body;
      db("users")
        .where({ EMAIL: Email })
        .then(rows => {
          const MatchedEmail = rows.find(row => row.EMAIL === Email);
          console.log(MatchedEmail);

          if (MatchedEmail) {
            res.redirect("/?error=true");
          } else {
            db("users")
              .insert({ FULLNAME: Fullname, EMAIL: Email, PASSWORD: Password })
              .then(() => {
                console.log("row inserted");
                res.redirect("/?error=false");
              });
          }
        });
    }
  });
});

//For Login validation and authentications

app.post("/signin", (req, res) => {
  const { Email, Password } = req.body;
  const db = req.app.get("db");
  db.schema.hasTable("users").then(exists => {
    if (exists) {
      db("users")
        .where({ EMAIL: Email, PASSWORD: Password })
        .then(rows => {
          console.log(rows);
          const MatchedUser = rows.find(
            User => User.EMAIL === Email && User.PASSWORD === Password
          );
          if (MatchedUser) {
            console.log("User authenticated");
            req.session.User = MatchedUser;
            res.redirect("/");
          } else {
            console.log("unmatched user");
            res.redirect("/?error=true");
          }
        });
    } else {
      res.redirect("/?error=true");
    }
  });
});

app.get("/", (req, res) => {
  if (req.session.User) {
    res.send(
      fs
        .readFileSync("./htmlfiles/dashboard.html")
        .toString()
        .replace(/USER/g, req.session.User.FULLNAME)
    );
  } else {
    if (req.query.error === "true" || req.query.error === "false") {
      const Errormessage = `<div class="alert alert-danger" role="alert">
            SOMETHING WENT WRONG.
          </div>`;

      const Successmessage = `<div class="alert alert-success" role="alert">
          Thank you for registration!!
        </div>`;
      res.send(
        fs
          .readFileSync("./htmlfiles/index.html")
          .toString()
          .replace(
            "ERROR",
            req.query.error === "true" ? Errormessage : Successmessage
          )
      );
    } else {
      res.send(
        fs
          .readFileSync("./htmlfiles/index.html")
          .toString()
          .replace("ERROR", "")
      );
    }
  }
});
// //For getting without DB
// app.get("/users", (req, res) => {
//   res.json({ user });
//   //debuggin purpose
// });

// //For registration without DB
// app.post("/register", (req, res) => {
//   const { Email, Password, Fullname } = req.body;

//   if (user.find(User => User.Email === Email)) {
//     res.redirect("/?error=true");
//   } else {
//     user.push({ Email, Password, Fullname });
//     res.redirect("/?error=false");
//   }
// });

// //For login
// app.post("/login", (req, res) => {
//   const { Email, Password } = req.body;
//   const MatchedUser = user.find(
//     User => User.Email === Email && User.Password === Password
//   );

//   if (MatchedUser) {
//     req.session.User = MatchedUser;
//     res.redirect("/");
//   } else {
//     res.redirect("/?error=true");
//   }
// });

//logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/?error=logout");
});

app.listen(3001, () => {
  console.log("server is listening");
});

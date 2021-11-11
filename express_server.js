const express = require("express");
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080; // default port 8080

app.use(express.static("public")); 
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

// GET LIST OF URLS
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: (users[req.cookies["user_id"]])
  };

  res.render("urls_index", templateVars);
});

// urls_index
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: (users[req.cookies["user_id"]])
  };
  res.render("urls_new", templateVars);
});
//POST REQUEST
app.post("/urls", (req, res) => {
  const random = generateRandomString();
  urlDatabase[random] = req.body.longURL;
  res.redirect(`/urls/${random}`);
});

// POST LOGIN 
app.post("/login", (req, res) => {
  const username = String(req.body.username);
  res.cookie("username", username);
  res.redirect('/urls');
});

// POST LOGOUT 
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.clearCookie("user_id");
  res.redirect('/urls');
});

//POST REQUEST (DELETE)
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = String(req.params.shortURL);
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// POST EDIT ROUTE
app.post("/urls/:shortURL", (req, res) => {
  const newLongURL = req.body.shortURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect('/urls');
});

const { userAuthurization } = require("./helper/userHelper");

// POST REGISTER
app.post("/register", (req, res) => {
  const random = generateRandomString();
  const { email, password } = req.body;

  const { status, error } = userAuthurization(users, email, password);

  // if (email === '' || password === '') {
    if(error) {
      res.status(status);
      return res.send(error);
    }
    // return 
  // }
  // for (const user in users) {
  //   if (users[user].email === email) {
  //   res.status(400);
  //   return res.send("email is already used");
  //   }
  // }
  
  users[random] = {
    id: random,
    email,
    password
  };
  
  res.cookie("user_id", random);
  res.redirect('/urls');
});

// GET URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(`${longURL}`);
 });

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// GET REGISTRATION
app.get("/register", (req, res) => {
  res.render("registration");
});


function generateRandomString() {
  let arr = [];
  for (let i = 0; i < 6; i++) {
    let randomNum = Math.floor(Math.random() * 25 + 1);
    arr.push(String.fromCharCode(97 + randomNum));
  }
  return arr.join('');
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

//FIRST route
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// urls_index
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
//POST REQUEST
app.post("/urls", (req, res) => {
  const random = generateRandomString();
  urlDatabase[random] = req.body.longURL;
  res.redirect(`/urls/${random}`);
});

// POST LOGIN ROUTE
app.post("/login", (req, res) => {
  const username = String(req.body.username);
  // urlDatabase[shortURL] = newLongURL;
  res.cookie
  console.log(username);
  res.redirect('/urls');

})

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

})

//SECOND route
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  console.log(urlDatabase);
  res.redirect(`${longURL}`);
 });

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
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
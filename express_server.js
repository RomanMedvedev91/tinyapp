const express = require("express");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const userHelper = require("./helper/userHelper");
const bcrypt = require("bcryptjs");
const { urlDatabase, users } = require('./helper/dataBases');
const { getUserInformation, userAuthurization, userRegister } =
  userHelper(users);

const app = express();
const PORT = 8080;

app.use(express.static("public"));
app.use(
  cookieSession({
    name: "session",
    keys: ["email"],
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//=====GET ROUTES========

// MINOR PAGE
app.get("/", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (!templateVars.user) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

// GET LIST OF URLS
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[userId],
  };
  res.render("urls_index", templateVars);
});

// urls_index
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (!templateVars.user) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

// short url
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log("from /u/:", shortURL);
  if (!urlDatabase[shortURL]) {
    return res.send(
      "Page is not defined, <a href='/urls'>try again</a> with http://..."
    );
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(`${longURL}`);
});

// GET URL
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
// check authorized user
  if (!users[userId]) {
    return res.redirect("/login");
  }
  if (!urlDatabase[shortURL]) {
    return res.send(
      "Page is not defined, <a href='/urls'>try again</a> with http://..."
    );
  }
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[userId],
  };
  res.render("urls_show", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// GET REGISTRATION
app.get("/register", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  if (user) {
    return res.redirect('/urls');
  }
  res.render("registration", { user });
});

// GET LOGIN
app.get("/login", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  if (user) {
    return res.redirect('/urls');
  }
  res.render("login", { user });
});

//===POST ROUTS===

//list of urls
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    console.log("Not authorized user tried to send POST req to /urls");
    return res.send("Access denied: not authorized user");
  }
  const random = generateRandomString();
  urlDatabase[random] = {};
  urlDatabase[random].longURL = req.body.longURL;
  urlDatabase[random].userID = req.session.user_id;
  res.redirect(`/urls/${random}`);
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const currentUser = getUserInformation(email);
  const { status, error } = userAuthurization(currentUser, email, password);

  if (error) {
    return res.status(status).send(error);
  }

  req.session.user_id = currentUser.id;
  res.redirect("/urls");
});

// LOGOUT
app.post("/logout", (req, res) => {
  console.log('I am logout');
  req.session = null;
  res.redirect("/urls");
});

// DELETE url
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  // check user auth
  const currentUserUrls = urlsForUser(req.session.user_id);

  if (!currentUserUrls[shortURL]) {
    return res.send("Access denied, Please <a href='/login'>Log In</a>");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// EDIT urls
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  const currentUserUrls = urlsForUser(req.session.user_id);

  if (!currentUserUrls[shortURL]) {
    return res.send("Access denied, Please <a href='/login'>Log In</a>");
  }
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
  return;
});

// REGISTER new user
app.post("/register", (req, res) => {
  const random = generateRandomString();
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const currentUser = getUserInformation(email);
  const { status, error } = userRegister(currentUser, email, password); //check on error

  if (error) {
    res.status(status);
    return res.send(error);
  }

  users[random] = {
    id: random,
    email,
    password: hashedPassword,
  };

  req.session.user_id = random;
  res.redirect("/urls");
});


//helper function
function generateRandomString() {
  let arr = [];
  for (let i = 0; i < 6; i++) {
    let randomNum = Math.floor(Math.random() * 25 + 1);
    arr.push(String.fromCharCode(97 + randomNum));
  }
  return arr.join("");
}

//checker appropriate url for user
function urlsForUser(id) {
  newDatabase = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      newDatabase[key] = urlDatabase[key];
    }
  }
  return newDatabase;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

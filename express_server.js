const express = require("express");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const userHelper = require("./helper/userHelper");
const bcrypt = require("bcryptjs");
const { urlDatabase, users } = require('./helper/dataBases');
const { getUserInformation, userAuthurization } =
  userHelper(users);
const { generateRandomString, urlsForUser } = require("./helper/helperFunctions");
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

//list of GET routs

app.get("/", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (!templateVars.user) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[userId],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (!templateVars.user) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.send(
      "Page is not defined, <a href='/urls'>try again</a> with http://..."
    );
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(`${longURL}`);
});

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
// check if currecnt user can user other users' shortURL
 if (urlDatabase[shortURL].userID !== userId) {
  return res.send(
    "Page is not defined, <a href='/urls'>try again</a>"
  );
 }
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[userId],
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  if (user) {
    return res.redirect('/urls');
  }
  res.render("registration", { user });
});

app.get("/login", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  if (user) {
    return res.redirect('/urls');
  }
  res.render("login", { user });
});

//list of POST routs

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

app.post("/login", (req, res) => {
  const url = req.url;
  const { email, password } = req.body;
  const currentUser = getUserInformation(email);
  const { status, error } = userAuthurization(currentUser, email, password, url);

  if (error) {
    return res.status(status).send(error);
  }

  req.session.user_id = currentUser.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  // check user auth
  const currentUserUrls = urlsForUser(req.session.user_id, urlDatabase);

  if (!currentUserUrls[shortURL]) {
    return res.send("Access denied, Please <a href='/login'>Log In</a>");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  const currentUserUrls = urlsForUser(req.session.user_id, urlDatabase);


  if (!currentUserUrls[shortURL]) {
    return res.send("Access denied, Please <a href='/login'>Log In</a>");
  }
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
  return;
});

app.post("/register", (req, res) => {
  const url = req.url;
  const random = generateRandomString();
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const currentUser = getUserInformation(email);
  const { status, error } = userAuthurization(currentUser, email, password, url);

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

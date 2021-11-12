const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const userHelper = require("./helper/userHelper");
const bcrypt = require("bcryptjs");
//DATA BASE
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ481W",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ481W",
  },
};

const users = {
  aJ481W: {
    id: "aJ481W",
    email: "roma@gmail.com",
    password: "1",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  user23RandomID: {
    id: "user23RandomID",
    email: "user3@example.com",
    password: "dishwasher-funk",
  },
};

const { getUserInformation, userAuthurization, userRegister } =
  userHelper(users);

const app = express();
const PORT = 8080;

app.use(express.static("public"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//=====ROUTES========

app.get("/", (req, res) => {
  res.send("Hello!");
});

// GET LIST OF URLS
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    // urls: urlDatabase,
    urls: urlsForUser(req.cookies["user_id"]),
    user: users[userId],
  };
  res.render("urls_index", templateVars);
});

// urls_index
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  if (!templateVars.user) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

//POST REQUEST
app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    console.log("Not authorized user tried to send POST req to /urls");
    return res.send("Access denied: not authorized user");
  }
  const random = generateRandomString();
  urlDatabase[random] = {};
  urlDatabase[random].longURL = req.body.longURL;
  urlDatabase[random].userID = req.cookies["user_id"];
  res.redirect(`/urls/${random}`);
});

// POST LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const currentUser = getUserInformation(email);
  console.log("current user => ", currentUser);

  const { status, error } = userAuthurization(currentUser, email, password);
  if (error) {
    res.status(status);
    return res.send(error);
  }

  // users[currentUser.id] = {
  //   id: currentUser.id,
  //   email,
  //   password,
  // };

  // console.log(users);

  res.cookie("user_id", currentUser.id);
  res.redirect("/urls");
});

// POST LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");

  res.redirect("/urls");
});

//POST REQUEST (DELETE)
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  // check user auth
  const currentUserUrls = urlsForUser(req.cookies["user_id"]);

  if (!currentUserUrls[shortURL]) {
    return res.send("Access denied, Please <a href='/login'>Log In</a>");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// POST EDIT ROUTE
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;

  const currentUserUrls = urlsForUser(req.cookies["user_id"]);
  if (!currentUserUrls[shortURL]) {
    return res.send("Access denied, Please <a href='/login'>Log In</a>");
  }
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
  return;
});

// POST REGISTER
app.post("/register", (req, res) => {
  const random = generateRandomString();
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const currentUser = getUserInformation(email);

  const { status, error } = userRegister(currentUser, email, password); //check on error

  // if (email === '' || password === '') {
  if (error) {
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
    password: hashedPassword,
    // password,
  };
  res.cookie("user_id", random);
  res.redirect("/urls");
});

// GET URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: String(req.params.shortURL),
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
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

// GET LOGIN
app.get("/login", (req, res) => {
  res.render("login");
});

function generateRandomString() {
  let arr = [];
  for (let i = 0; i < 6; i++) {
    let randomNum = Math.floor(Math.random() * 25 + 1);
    arr.push(String.fromCharCode(97 + randomNum));
  }
  return arr.join("");
}

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

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
function urlsForUser(id, urlDatabase) {
  newDatabase = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      newDatabase[key] = urlDatabase[key];
    }
  }
  return newDatabase;
}

module.exports = { generateRandomString, urlsForUser };
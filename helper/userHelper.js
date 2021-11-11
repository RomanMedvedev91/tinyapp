const userAuthurization = function(users, email, password) {
    if (email === '' || password === '') {
    return { status: 400, error: "email or password is incorrect" };
  }
  for (const user in users) {
    if (users[user].email === email) {
      console.log("hey");
      return { status: 400, error: "email is already used" }
    }
 } 
 return { status: 200, error: null }
}

module.exports = { userAuthurization }
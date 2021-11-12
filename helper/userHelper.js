const bcrypt = require("bcryptjs");

const userHelper = (users) => {
  const getUserInformation = (email) => {
    for (let user in users) {
      if (users[user].email === email) {
        return users[user];
      }
    }
    return null;
  };

  const userAuthurization = function (currentUser, email, password) {
    if (email === "" || password === "") {
      return {
        status: 400,
        error: "email or password is incorrect <a href='/login'>try again</a>",
      };
    }

    if (!currentUser) {
      return {
        status: 403,
        error: "user cannot be found <a href='/login'>try again</a>",
      };
    }
    // if (currentUser.password !== password) {
    if (!bcrypt.compareSync(password, currentUser.password)) {
      return {
        status: 403,
        error: "email or password is incorrect <a href='/login'>try again</a>",
      };
    }
    return { status: 200, error: null };
  };

  const userRegister = function (currentUser, email, password) {
    if (email === "" || password === "") {
      return {
        status: 400,
        error:
          "email or password is incorrect <a href='/register'>try again</a>",
      };
    }
    if (currentUser) {
      return {
        status: 400,
        error: "email is already used <a href='/register'>try again</a>",
      };
    }
    return { status: 200, error: null };
  };

  return {
    getUserInformation,
    userAuthurization,
    userRegister,
  };
};

// const userRegistration = function(users, email, password) {
//     if (email === '' || password === '') {
//     return { status: 400, error: "email or password is incorrect" };
//   }
//   for (const user in users) {
//     if (users[user].email === email) {

//       return { status: 400, error: "email is already used" }
//     }
//  }
// }

// const userLogin = function(users, email, password) {
//     if (email === '' || password === '') {
//     return { status: 400, error: "email or password is incorrect" };
//   }
//   for (const user in users) {
//     if (users[user].email === email && users[user].password !== password) {
//       return { status: 403, error: "email or password is incorrect" }
//     }
//     if (users[user[email]]) {
//       return { status: 403, error: "user cannot be found" }

//     }
//   }

//  return { status: 200, error: null }
// }

module.exports = userHelper;

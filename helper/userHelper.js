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

module.exports = userHelper;

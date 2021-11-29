const { assert } = require('chai');
const userHelper = require("../helper/userHelper");
const testUsers = {
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
};

const { getUserInformation } =
  userHelper(testUsers);

describe('getUserByEmail', function() {
  it('should return a type of user object', function() {
    const user = getUserInformation("user@example.com")
    assert.strictEqual(typeof user, 'object');
  });
  it('should return user id with valid email', function() {
    const user = getUserInformation("user@example.com")
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });
  it('should return null with invalid email', function() {
    const user = getUserInformation("user@exmple.com")
    const expected = null;
    assert.strictEqual(user, expected);
  });
});
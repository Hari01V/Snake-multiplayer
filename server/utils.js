export { makeId };

const makeId = (length) => {
  var result = "";
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charslength = chars.length;
  for (var i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charslength));
  }
  return result;
};

/* eslint-disable @typescript-eslint/explicit-function-return-type */
module.exports = {
  process: (content) => {
    return "module.exports = " + JSON.stringify(content);
  },
};

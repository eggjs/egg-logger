const { rm } = require('fs/promises');

exports.sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

exports.rimraf = async file => {
  await rm(file, { force: true, recursive: true });
};

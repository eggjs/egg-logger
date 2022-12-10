const { rm } = require('fs/promises');

exports.sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

exports.rimraf = async file => {
  try {
    await rm(file, { force: true, recursive: true });
  } catch (_) {
    // ignore error
  }
};

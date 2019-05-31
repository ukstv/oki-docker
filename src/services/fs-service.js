const fs = require('fs');

const readFile = path => fs.readFileSync(path, 'utf8');
const writeFile = (path, data = '') => fs.writeFileSync(path, data, 'utf8');
const isFile = path => fs.statSync(path).isFile();
const isDir = path => fs.statSync(path).isDirectory();
const exists = path => fs.existsSync(path);
const mkdir = path => fs.mkdirSync(path);
const dirIsEmpty = path => fs.readdirSync(path).length === 0;
const filesAreEqual = (path1, path2) => readFile(path1) === readFile(path2);

module.exports = {
  readFile,
  writeFile,
  isFile,
  isDir,
  exists,
  mkdir,
  dirIsEmpty,
  filesAreEqual,
};

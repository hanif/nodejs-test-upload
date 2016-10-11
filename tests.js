const request = require('request');
const path = require('path');
const fs = require('fs');
const config = require('./config.json');
const execSync = require('child_process').execSync;
const moment = require('moment');
const colors = require('colors');
const glob = require('glob');

const url = `http://localhost:${config.port}/test`;

const responseLogger = (num) => {
  return (err, httpResponse, body) => {
    const time = moment().format('h:m:s.SSS');
    console.log(`[RES:${num} - ${time}]`.green, ` response: ${body}`);
  };
};

const getRandomFiles = () => {
  var files = [];
  const rand = Math.floor(Math.random() * (3 - 1)) + 1;

  for (var i = 0; i < rand; i++) {
    files.push(fs.createReadStream(path.join(__dirname, `/${config.fileName}`)));
  }

  return files;
};

const createLargeFile = () => {
  console.log(`creating file named ${config.fileName.blue} with size of ${config.fileSize.blue}...`);
  execSync(`mkfile -n ${config.fileSize} ${config.fileName}`);
};

const cleanUpFiles = () => {
  console.log(`cleaning up files...`);
  glob(path.join(__dirname, `/*.dat`), (err, files) => {
    if (err) throw err;
    files.forEach((item, index, array) => {
      fs.unlink(item, (err) => {
        if (err) throw err;
        console.log(`file ${item} deleted`.red);
      });
    });
  });
}

const createPostRequest = (num) => {
  return () => {
    const time = moment().format('h:m:s.SSS');
    const files = getRandomFiles();
    console.log(`[REQ:${num} - ${time}]`.green, ` POST /test ${files.length.toString().blue} file(s).`);
    return request.post({url, formData: { uploads: files }}, responseLogger(num));
  };
};

const createGetRequest = (num) => {
  return () => {
    const time = moment().format('h:m:s.SSS');
    console.log(`[REQ:${num} - ${time}]`.green, ` GET  /test`);
    return request.get({url}, responseLogger(num));
  };
};

var arg = process.argv.slice(2);
if (arg == 'cleanup') {
  cleanUpFiles();
  return;
}

if (!parseInt(arg)) arg = 10;

var requestArray = [];
for (var i = 1; i <= arg; i++) {
  const num = "000".substring(0, 3 - i.toString().length) + i.toString();
  if (Math.random() >= 0.5) {
    requestArray.push(createPostRequest(num));
  } else {
    requestArray.push(createGetRequest(num));
  }
}

createLargeFile();
console.log(`Creating ${arg} random requests...`.yellow);
requestArray.forEach((item) => { item() });

var fileName = './README.md';
var dirName = './new_dir';
console.log('Application going to read ' + fileName);

setInterval(function(){
  fs.readFile(fileName, function(err, src) {
    if (!err) {
      console.log('File ' + fileName + ' size ' + src.length);
    }
  });
}, 2000);


setTimeout(function(){
  fs.readdir(".", function(err, files) {
    if (!err) {
      console.log('content of the dir:' + files);
    }
  });
}, 1500);

setInterval(function(){
  fs.access(fileName, fs.F_OK, function(err) {
    console.log(err ? 'file does not exist' : 'file is OK');
  });
}, 3000);

setTimeout(()=>{
  fs.mkdir(dirName, (err)=>{
    if (!err) {
      console.log('dir is created');
    }
  });
}, 2000);

setTimeout(()=>{
  fs.rmdir(dirName, (err)=>{
    if (!err) {
      console.log('dir is deleted')
    }
  });
}, 3500);

setInterval(function(){
  fs.appendFile("new_file.txt", "out_inf", {flag: 'a'}, (err) => {
    if(err) {
      throw err;
    }
  });
}, 3000);

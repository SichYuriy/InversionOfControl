var fileName = './README.md';
var dirName = './new_dir';
console.log('Application going to read ' + fileName);
// fs.readFile(fileName, function(err, src) {
//   console.log('File ' + fileName + ' size ' + src.length);
// });

fs.readdir(".", function(err, files) {
  console.dir(files);
})

fs.access(fileName, fs.F_OK, function(err) {
  console.log(err ? 'file does not exist' : 'file is OK');
})


setTimeout(()=>{
  fs.mkdir(dirName, (err)=>{
    console.log(err);
  });
}, 100);

setTimeout(()=>{
  fs.rmdir(dirName, (err)=>{
    console.log(err);
  });
}, 500);

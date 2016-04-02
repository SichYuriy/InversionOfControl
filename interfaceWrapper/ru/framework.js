// Пример оборачивания функции в песочнице
var fs = require('fs'),
    vm = require('vm');

var statistics = {};

function calculateNewAvgVal(oldAvg, oldCount, newVal) {
  var total = oldAvg * oldCount + newVal;
  return total / (oldCount + 1);
}

function cloneInterface(anInterface) {
  var clone = {};
  for (var key in anInterface) {
    clone[key] = anInterface[key];
  }
  return clone;
}

function wrapInterface(anInterface) {
  initStatistics(statistics);
  for (key in anInterface) {
    if (typeof(fsCopy[key]) == "function") {
      fsCopy[key] = wrapFunction(key, fsCopy[key], statistics);
    }
  }
}


function initStatistics(statistics) {
  if (statistics == null || statistics == undefined) {
    statistics = {};
  }
  statistics.funcCalls = statistics.funcCalls || 0;
  statistics.avgSpeed = statistics.avgSpeed || 0;
  statistics.readData = statistics.readData || 0;
  statistics.writeData = statistics.readData || 0;

  statistics.avgReadSpeed = statistics.avgReadSpeed || 0;
  statistics.readTime = statistics.readTime || 0;

  statistics.avgWriteSpeed = statistics.avgWriteSpeed || 0;
  statistics.writeTime = statistics.writeTime || 0;

  if (statistics.callbacks == undefined) {
    statistics.callbacks = {};
  }
  statistics.callbacks.calls = statistics.callbacks.calls || 0;
  statistics.callbacks.avgSpeed = statistics.callbacks.avgSpeed || 0;
}

function wrapCallback(fnName, fn, statistics) {
  return function(wrapper) {
    var args = [];
    Array.prototype.push.apply(args, arguments);
    console.log('Call: ' + fnName);
    console.dir(args.filter((arg)=>{
      return (arg == null
        || arg.length === 'undefined'
        || arg.length < 10);
    }));
    var start = process.hrtime();
    fn.apply(undefined, args);
    var end = process.hrtime();
    var executionTime = ((end[0] * 1e9 + end[1]) - (start[0] * 1e9 + start[1])) / 1e6;
    statistics.callbacks.avgSpeed = calculateNewAvgVal(
      statistics.callbacks.avgSpeed,
      statistics.callbacks.calls,
      executionTime
    );
    statistics.callbacks.calls++;

    if (fnName.indexOf('read') == 0) {
      statistics.readData += args[1].length;
    }
  }
}

function wrapFunction(fnName, fn, statistics) {
  return function wrapper() {

    var args = [];
    Array.prototype.push.apply(args, arguments);
    console.log('Call: ' + fnName);
    console.dir(args.filter((arg)=>{
      return (arg == null
        || arg.length === 'undefined'
        || arg.length < 10);
    }));
    if (typeof(args[args.length - 1]) == "function") {
      args[args.length - 1] = wrapCallback(fnName + " callback", args[args.length - 1], statistics);
    }


    var start = process.hrtime();
    fn.apply(undefined, args);
    var end = process.hrtime();

    var executionTime = ((end[0] * 1e9 + end[1]) - (start[0] * 1e9 + start[1])) / 1e6;

    statistics.avgSpeed = calculateNewAvgVal(
      statistics.avgSpeed,
      statistics.funcCalls,
      executionTime
    );

    statistics.funcCalls++;

    if (fnName.indexOf('read') == 0) {
      statistics.readTime += executionTime;
      statistics.avgReadSpeed = statistics.readData / (statistics.readTime * 1000);
    }

    if (fnName.indexOf('write') == 0 || fnName.indexOf('append') == 0) {
      statistics.writeTime += executionTime;
      statistics.writeData += args[1].length;
      statistics.avgWriteSpeed = statistics.writeData / (statistics.writeTime * 1000);
    }
  }
}

var fsCopy = cloneInterface(fs);
wrapInterface(fsCopy);

// Объявляем хеш из которого сделаем контекст-песочницу
var context = {
  module: {},
  console: console,
  // Помещаем ссылку на fs API в песочницу
  fs: fsCopy,
  // Оборачиваем функцию setTimeout в песочнице
  setTimeout: setTimeout,
  setInterval: setInterval,
  clearTimeout: clearTimeout

};

// Преобразовываем хеш в контекст
context.global = context;
var sandbox = vm.createContext(context);

// Читаем исходный код приложения из файла
var fileName = './application.js';
fs.readFile(fileName, function(err, src) {
  // Запускаем код приложения в песочнице
  var script = vm.createScript(src, fileName);
  script.runInNewContext(sandbox);
});
setInterval(()=>{
  console.log(statistics);
}, 30000);

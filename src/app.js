require('dotenv').config();
const utils = require('./workers/utils');
const mongoose = require('mongoose');
const { Worker } = require('worker_threads');
const runWorker = (workerPath) => {
	return new Promise((resolve,reject) => {
		const worker = new Worker(workerPath);
		worker.on('message',resolve);
		worker.on('error',reject);
		worker.on('exit', code => {
			if(code !== 0)
				reject(new Error(`Worker ${workerPath} exited with code ${code}`))
		});
	});	
};
const workersBasePath = './src/workers/'
const workers = ['solides','inhire','recrutai'];
const promises = workers.map(worker => runWorker(`${workersBasePath}${worker}`));
Promise.all(promises).then(result => {
	result.forEach(i => console.log(i));
});

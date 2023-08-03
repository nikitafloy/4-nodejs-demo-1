const { Worker } = require('worker_threads');
const { fork } = require('child_process');
const { performance, PerformanceObserver } = require('perf_hooks');

workerFunction = performance.timerify(workerFunction);
forkFunction = performance.timerify(forkFunction);

const performanceObserver = new PerformanceObserver((items, observer) => {
	console.log(items.getEntries());

	// observer.disconnect();
});

performanceObserver.observe({ entryTypes: ['function'] });

function workerFunction (array){
	return new Promise((resolve, reject) => {
		performance.mark('worker');

		const path = __dirname + '/worker.js';
		const worker = new Worker(path, { workerData: { array } });

		worker.on('message', (msg) => {
			resolve(msg);
			worker.terminate();
		});

		worker.on('error', (err) => {
			reject(err);
			worker.terminate();
		});

		performance.mark('worker');
	});
};

function forkFunction (array) {
	return new Promise((resolve, reject) => {
		const path = __dirname + '/fork.js';
		const forkProcess = fork(path);

		forkProcess.send({ array });

		forkProcess.on('message', (msg) => {
			resolve(msg);
			forkProcess.kill();
		});

		forkProcess.on('error', (err) => {
			reject(msg);
			forkProcess.kill();
		});
	});
};

const main = async () => {
	try {
		await workerFunction([25, 20, 19, 48, 30, 50]);

		await forkFunction([25, 20, 19, 48, 30, 50]);
	} catch (e) {
		console.error(e.message);
	}
};

main();
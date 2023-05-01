const { randomUUID } = require("node:crypto");

let ui;
const isUiDisabled = process.env.UI_DISABLED;

if (!isUiDisabled) {
	const Ui = require("./ui");
	ui = new Ui();
}

function route(routeName) {
	return (target, { kind, name }) => {
		if (kind !== "method") return target;

		return async function (request, response) {
			if (!request.url.includes(routeName)) return;
			const { statusCode, value } = await target.apply(this, [request, response]);
			response.writeHead(statusCode);
			response.end(JSON.stringify(value));
		};
	};
}

function responseTimeTracker(target, { kind, name }) {
	if (kind !== "method") return target;

	return function (request, response) {
		const reqId = randomUUID();
		const requestStartedAt = performance.now();
		const methodsTimeTracker = {
			GET: performance.now(),
			POST: performance.now(),
		};
		const afterExecution = target.apply(this, [request, response]);

		const data = {
			reqId,
			name,
			method: request.method,
			url: request.url,
		};

		// assuming it'll always be a promise object
		afterExecution.finally(
			onRequestEnded({
				data,
				response,
				requestStartedAt,
				methodsTimeTracker,
			})
		);

		return afterExecution;
	};
}

function log(...args) {
	if (isUiDisabled) console.log(...args);
}

function onRequestEnded({ data, response, requestStartedAt, methodsTimeTracker }) {
	return () => {
		const requestEndedAt = performance.now();
		let timeDiff = requestEndedAt - requestStartedAt;
		let seconds = Math.round(timeDiff);

		data.statusCode = response.statusCode;
		data.statusMessage = response.statusMessage;
		data.elapsed = timeDiff.toFixed(2).concat("ms");
		log("benchmark", data);
		// simulating that we already made some calculations or spawned the process in another one
		const trackerDiff = requestEndedAt - methodsTimeTracker[data.method];

		if (trackerDiff >= 135) {
      log("benchmark", trackerDiff)
			ui?.updateGraph(data.method, seconds);
		}

    methodsTimeTracker[data.method] = performance.now();
	};
}

module.exports = {
	route,
	responseTimeTracker,
};

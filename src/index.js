const { createServer } = require("node:http");
const { once } = require("node:events");
const { randomUUID } = require("node:crypto");
const { setTimeout } = require("node:timers/promises");

const { route, responseTimeTracker } = require("./decorator");

const DB = new Map();

class Server {
	@responseTimeTracker
	@route('/people') // must be first because it changes the response data
	static async handler(request, response) {
		await setTimeout(parseInt(Math.random() * 200));

		if (request.method === "POST") {
			const data = await once(request, "data");
			const item = JSON.parse(data);
			item.id = randomUUID();

			DB.set(item.id, item);
			return {
				statusCode: 201,
				value: item,
			};
		}

		return {
			statusCode: 200,
			value: [...DB.values()],
		};
	}
}

const server = new Server();
createServer(Server.handler).listen(3000, () => console.log("Server start at port 3000"));

const blessed = require("blessed");
const contrib = require("blessed-contrib");

const screen = blessed.screen();

function createEmptyList(len, value) {
  return Array.from({
    length: len
  }, _ => value)
}

function getEmptyCoordinates() {
  return {
    x: createEmptyList(10, ' '),
    y: createEmptyList(10, 1)
  }
}

class Ui {
	line = contrib.line({
		label: "Response Time (MS)",
		showLegend: true,
    xPadding: 5,
    xLabelPadding: 3,
    style: {
      line: "yellow",
      text: "green",
      baseline: "black"
    }
	});

	getRequest = {
    ...getEmptyCoordinates(),
		title: "GET /people",
		style: {
			line: "yellow",
		},
	};

	postRequest = {
    ...getEmptyCoordinates(),
		title: "POST /people",
		style: {
			line: "green",
		},
	};

  constructor() {
    this.screen = screen
    this.screen.append(this.line)
    this.renderGraph()
  }

  renderGraph() {
    this.line.setData([
      this.getRequest,
      this.postRequest
    ])

    this.screen.render()
  }

  updateGraph(method, value) {
    const target = method === "GET" ? this.getRequest : this.postRequest
    target.y.shift()
    target.y.push(value)

    this.renderGraph()
  } 
}

module.exports = Ui;

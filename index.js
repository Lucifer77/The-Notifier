const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
const request = require("request");
const cheerio = require("cheerio");

const app = express();
app.use(express.static(path.join(__dirname, "client")));
app.use(bodyParser.json());
const publicVapidKey =
	"BPW397GpZpEty4gjhS_8X9RleurahhoIPo9Je8ZnEuja4LCiq8nBJrFa_Qxg5vFNM927KwaVHmtj8_WHgdjxxnY";
const privateVapidKey = "ltUGkbIwZ5tPaK068-A53etxF06nPio6koOpcikBoL4";
webpush.setVapidDetails(
	"mailto:test@test.com",
	publicVapidKey,
	privateVapidKey
);

var price = 0;

// Subscribe Route
app.post("/subscribe", (req, res) => {
	const subscription = req.body;
	res.status(201).json({});
	theNotifier(subscription);
});

theNotifier = (subscription) => {
	// Scrape Logic
	let url =
		"https://www.flipkart.com/acer-helios-300-core-i7-9th-gen-8-gb-2-tb-hdd-256-gb-ssd-windows-10-home-6-graphics-nvidia-geforce-gtx-1660-ti-ph317-53-726q-gaming-laptop/p/itm338db6f3e5781?pid=COMFHNY8VZHVPXFY&lid=LSTCOMFHNY8VZHVPXFYV8DKFD";

	request(url, function(error, response, html) {
		setInterval(() => {
			if (!error) {
				var $ = cheerio.load(html);
				let oldPrice = price;
				console.log(oldPrice);
				let newPrice = $("._1vC4OE")
					.first()
					.text()
					.replace(/[^0-9]/g, "");
				if (oldPrice !== Number(newPrice)) {
					const payload = JSON.stringify({
						title: "Price Change Alert",
						body: "OLD Price:- ".concat(
							oldPrice,
							"\nNEW Price:- ",
							newPrice
						)
					});
					price = Number(newPrice);
					webpush
						.sendNotification(subscription, payload)
						.catch((err) => console.error(err));
				}
			} else {
				const payload = JSON.stringify({
					title: "Price Fetch Error",
					body: "Error Fetching Price, Debug ASAP"
				});
				webpush
					.sendNotification(subscription, payload)
					.catch((err) => console.error(err));
			}
		}, 960000);
	});
};

app.get("/test", (req, res) => {
	res.status(200).json({
		test: "SERVER UP AND RUNNING"
	});
});

const port = 7000;
app.listen(port, () => console.log(`Server started on port ${port}`));

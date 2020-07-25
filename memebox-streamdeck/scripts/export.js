const os = require("os");
const fs = require("fs-extra");
const path = require("path");
const http = require("https");
const child_process = require("child_process");

const platforms = {
	win32: {
		distributionToolFilename: "DistributionTool.exe",
		distributionToolUrl:
			"https://developer.elgato.com/documentation/stream-deck/distributiontool/",
		distributionToolUrlFilename: "DistributionToolWindows.zip"
	},
	darwin: {
		distributionToolFilename: "DistributionTool",
		distributionToolUrl:
			"https://developer.elgato.com/documentation/stream-deck/distributiontool/",
		distributionToolUrlFilename: "DistributionToolMac.zip"
	}
};

const currentPlatform = platforms[os.platform()];

if (!currentPlatform) {
	console.error(
		"Current Platform not supported. Supported platforms are: 'win32', 'darwin'"
	);
	process.exit(-1);
}

const zipPath = path.resolve(
	`./${currentPlatform.distributionToolUrlFilename}`
);

const file = fs.createWriteStream(zipPath);

console.log(`Fetching distribution tool for platform (${os.platform()})`);
http
	.get(
		`${currentPlatform.distributionToolUrl}${currentPlatform.distributionToolUrlFilename}`,
		function(response) {
			response.pipe(file);
			file.on("finish", function() {
				file.close(function() {
					console.log("Unzipping distribution tool file");

					const unzipResult = child_process.spawnSync("tar", [
						"-xf",
						currentPlatform.distributionToolUrlFilename
					]);

					if (unzipResult.error) {
						console.log("Error unzipping Distribution Tool.");
						if (os.platform() === "win32") {
							console.log(
								"Windows users will need tar installed for this to function. You can unzip with other tools manually but then you must also run the Distribution Tool manually."
							);
						}
					}

					console.log("Running distribution tool");
					try {
						fs.removeSync(
							`./Release/com.memebox.memebox-streamdeck.streamDeckPlugin`
						);
						let distributionCommand = `${currentPlatform.distributionToolFilename} -b -i ./build/com.memebox.memebox-streamdeck.sdPlugin -o ./Release`;
						if (os.platform() !== "win32") {
							distributionCommand = "./" + distributionCommand;
						}
						child_process.execSync(distributionCommand);
						console.log("Plugin created in Release directory.");
						process.exit(0);
					} catch (e) {
						console.log("Error running Distribution Tool.", e);
						process.exit(-1);
					}
				});
			});
		}
	)
	.on("error", function(err) {
		// Handle errors
		console.log("Error fetching DistributionTool for your platform.");
		process.exit(-1);
	});

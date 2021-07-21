const path = require("path");

module.exports = {
	packagerConfig: {
		executableName: "farm-chores",
		icon: path.resolve(__dirname, ".webpack/renderer/assets/macOS/icon-512.icns"),
	},
	makers: [
		{
			name: "@electron-forge/maker-squirrel",
			config: {
				name: "farm_chores"
			}
		},
		{
			name: "@electron-forge/maker-dmg",
			config: {
				icon: path.resolve(__dirname, ".webpack/renderer/assets/macOS/icon-512.icns"),
				name: "Farm Chores Manager"
			}
		},
		{
			name: "@electron-forge/maker-deb",
			config: {
				options: {
					maintainer: "Zachary Collazo",
					productDescription: "A dashboard for tracking todos, weather, projects, production, and more.",
					categories: [
						"Utility"
					],
					description: "A tracker for farm chores.",
					version: "0.0.1",
					icon: path.resolve(__dirname, ".webpack/renderer/assets/icon.png")
				}
			}
		},
		{
			name: "@electron-forge/maker-rpm",
			config: {
				options: {
					icon: path.resolve(__dirname, ".webpack/renderer/assets/icon.png"),
					version: "0.0.1",
					description: "A tracker for farm chores.",
					categories: [
						"Utility"
					],
					productDescription: "A dashboard for tracking todos, weather, projects, production, and more."
				}
			}
		}
	],
	plugins: [
		[
			"@electron-forge/plugin-webpack",
			{
				mainConfig: "./webpack.config.js",
				renderer: {
					config: "./webpack.renderer.config.js",
					entryPoints: [
						{
							html: "./src/index.html",
							js: "./src/renderer.ts",
							name: "main_window"
						}
					]
				}
			}
		]
	]
}

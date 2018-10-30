import * as cv from "canvas-constructor";
import { readFile } from "fs-nextra";
import { request } from "axios";
import { yt_api_key, darkSkyAPI } from "../../config";
import { Command } from "../../util";
const { Canvas } = cv;
Canvas.registerFont(`${process.cwd()}/canvas/fonts/Roboto-Regular.ttf`, "Roboto");
Canvas.registerFont(`${process.cwd()}/canvas/fonts/RobotoCondensed-Regular.ttf`, "Roboto Condensed");
Canvas.registerFont(`${process.cwd()}/canvas/fonts/RobotoMono-Light.ttf`, "Roboto Mono");
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "weather",
            description: "Shows weather for a certain location.",
            guildOnly: true,
            cooldown: 10
        });
    }

    public async run(message, args) {
        let text = args.join(" ");
        if (!text) return message.error(`Missing city.`);
        const mg = await message.send(`<a:typing:393848431413559296> Loading Weather.....`);
        try {
            text = text.replace(/ /g, "");
            const { data } = await request({
                url: `https://maps.googleapis.com/maps/api/geocode/json`,
                params: { address: encodeURIComponent(text.replace(/ /g, "+")), key: yt_api_key },
                method: "GET"
            });

            const geocodelocation = data.results[0].formatted_address;
            const params = `${data.results[0].geometry.location.lat},${data.results[0].geometry.location.lng}`;

            const locality = data.results[0].address_components.find(loc => loc.types.includes("locality"));
            const governing = data.results[0].address_components.find(gov => gov.types.includes("administrative_area_level_1")); // eslint-disable-line max-len
            const country = data.results[0].address_components.find(cou => cou.types.includes("country"));
            const continent = data.results[0].address_components.find(con => con.types.includes("continent"));

            const city = locality || governing || country || continent || {};
            const state = locality && governing ? governing : locality ? country : {};
            const dsky = await request({
                url: `https://api.darksky.net/forecast/${darkSkyAPI}/${params}`,
                params: { exclude: "minutely,hourly,flags", units: "auto" }
            });

            const condition = dsky.data.currently.summary;
            const { icon } = dsky.data.currently;
            const chanceofrain = Math.round((dsky.data.currently.precipProbability * 100) / 5) * 5;
            const temperature = Math.round(dsky.data.currently.temperature);
            const humidity = Math.round(dsky.data.currently.humidity * 100);

            let theme = "light";
            let fontColor = "#FFFFFF";
            if (icon === "snow" || icon === "sleet" || icon === "fog") {
                theme = "dark";
                fontColor = "#444444";
            }

            const bg = await this.getBase(icon);
            const cond = await readFile(`${process.cwd()}/canvas/weather/icons/${theme}/${icon}.png`);
            const hum = await readFile(`${process.cwd()}/canvas/weather/icons/${theme}/humidity.png`);
            const precip = await readFile(`${process.cwd()}/canvas/weather/icons/${theme}/precip.png`);

            const img = await new Canvas(400, 180)
                .addImage(bg, 0, 0, 400, 180)
                .setColor(fontColor)
                .setTextFont("20px Roboto")
                .addText(city.long_name ? await this.client.translate(city.long_name, this.client.locales[message.guild.config.language]).catch(() => city.long_name) : "Unknown", 35, 50)
                .setTextFont("16px Roboto")
                .addText(state.long_name ? await this.client.translate(state.long_name, await this.client.locales[message.guild.config.language]).catch(() => state.long_name) : "", 35, 72.5)
                .setTextFont("48px Roboto Mono")
                .addText(`${temperature}°`, 35, 140)
                .addImage(cond, 325, 31, 48, 48)
                .addImage(hum, 358, 88, 13, 13)
                .addImage(precip, 358, 108, 13, 13)
                .setTextAlign("right")
                .setTextFont("16px Roboto")
                .addText(condition, 370, 142)
                .setTextFont("16px Roboto Condensed")
                .addText(`${humidity}%`, 353, 100)
                .addText(`${chanceofrain}%`, 353, 121)
                .toBufferAsync();
            await mg.delete();
            return message.channel.send({ files: [{ attachment: img, name: `${geocodelocation}.png` }] });
        } catch (error) {
            mg.error(`Error while loading weather for this location. ${error.message}`);
        }
    }

    public async getBase(icon) {
        if (icon === "clear-day" || icon === "partly-cloudy-day") {
            return `${process.cwd()}/canvas/weather/base/day.png`;
        } else if (icon === "clear-night" || icon === "partly-cloudy-night") {
            return `${process.cwd()}/canvas/weather/base/night.png`;
        } else if (icon === "rain") {
            return `${process.cwd()}/canvas/weather/base/rain.png`;
        } else if (icon === "thunderstorm") {
            return `${process.cwd()}/canvas/weather/base/thunderstorm.png`;
        } else if (icon === "snow" || icon === "sleet" || icon === "fog") {
            return `${process.cwd()}/canvas/weather/base/snow.png`;
        } else if (icon === "wind" || icon === "tornado") {
            return `${process.cwd()}/canvas/weather/base/windy.png`;
        } else if (icon === "cloudy") {
            return `${process.cwd()}/canvas/weather/base/cloudy.png`;
        } else {
            return `${process.cwd()}/canvas/weather/base/cloudy.png`;
        }
    }

}

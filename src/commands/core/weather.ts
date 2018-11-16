// tslint:disable:no-magic-numbers
import axios, { AxiosResponse } from "axios";
import * as cv from "canvas-constructor";
import { readFile } from "fs-nextra";
import { darkSkyAPI, googleAPI } from "../../config.json";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions/index.js";
const { Canvas } = cv;
Canvas.registerFont(`${process.cwd()}/build/canvas/fonts/Roboto-Regular.ttf`, "Roboto");
Canvas.registerFont(`${process.cwd()}/build/canvas/fonts/RobotoCondensed-Regular.ttf`, "Roboto Condensed");
Canvas.registerFont(`${process.cwd()}/build/canvas/fonts/RobotoMono-Light.ttf`, "Roboto Mono");
export default class FoxCommand extends Command {

    public static getBase(icon: string): string {
        switch (icon) {
            case "clear-day":
            case "partly-cloudy-day":
                return `${process.cwd()}/build/canvas/weather/base/day.png`;

            case "clear-night":
            case "partly-cloudy-night":
                return `${process.cwd()}/build/canvas/weather/base/day.png`;

            case "rain":
                return `${process.cwd()}/build/canvas/weather/base/rain.png`;

            case "thunderstorm":
                return `${process.cwd()}/build/canvas/weather/base/thunderstorm.png`;

            case "snow":
            case "sleet":
            case "fog":
                return `${process.cwd()}/build/canvas/weather/base/snow.png`;

            case "wind":
            case "tornado":
                return `${process.cwd()}/build/canvas/weather/base/windy.png`;

            case "cloudy":
                return `${process.cwd()}/build/canvas/weather/base/cloudy.png`;

            default:
                return `${process.cwd()}/build/canvas/weather/base/cloudy.png`;
        }
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "weather",
            description: "Shows weather for a certain location.",
            guildOnly: true,
            cooldown: 10,
        });
    }

    public async run(message: FoxMessage, args: string[]): Promise<void | FoxMessage> {
        let text: string = args.join(" ");
        if (!text) { return message.error("Missing city."); }
        const mg: FoxMessage = await message.send("<a:typing:393848431413559296> Loading Weather.....");
        try {
            text = text.replace(/ /g, "");
            const { data } = await axios({
                url: "https://maps.googleapis.com/maps/api/geocode/json",
                params: { address: encodeURIComponent(text.replace(/ /g, "+")), key: googleAPI },
                method: "GET",
            });

            const geocodelocation: string = data.results[0].formatted_address;
            const params: string = `${data.results[0].geometry.location.lat},${data.results[0].geometry.location.lng}`;

            const locality: string = data.results[0].address_components.find(loc => loc.types.includes("locality"));
            const governing: string = data.results[0].address_components.find(gov => gov.types.includes("administrative_area_level_1")); // tslint:disable-line
            const country: string = data.results[0].address_components.find(cou => cou.types.includes("country"));
            const continent: string = data.results[0].address_components.find(con => con.types.includes("continent"));

            const city: any = locality || governing || country || continent || {};
            const state: any = locality && governing ? governing : locality ? country : {};
            const dsky: AxiosResponse = await axios({
                url: `https://api.darksky.net/forecast/${darkSkyAPI}/${params}`,
                params: { exclude: "minutely,hourly,flags", units: "auto" },
            });

            const condition: string = dsky.data.currently.summary;
            const { icon }: { icon: string } = dsky.data.currently;
            const chanceofrain: number = Math.round((dsky.data.currently.precipProbability * 100) / 5) * 5;
            const temperature: number = Math.round(dsky.data.currently.temperature);
            const humidity: number = Math.round(dsky.data.currently.humidity * 100);

            let theme: string = "light";
            let fontColor: string  = "#FFFFFF";
            // tslint:disable-next-line:switch-default
            switch (icon) {
                case "snow":
                case "sleet":
                case "fog":
                    theme = "dark";
                    fontColor = "#444444";
            }
            const bg: string = FoxCommand.getBase(icon);
            const cond: Buffer = await readFile(`${process.cwd()}/build/canvas/weather/icons/${theme}/humidity.png`);
            const hum: Buffer = await readFile(`${process.cwd()}/build/canvas/weather/icons/${theme}/humidity.png`);
            const precip: Buffer = await readFile(`${process.cwd()}/build/canvas/weather/icons/${theme}/precip.png`);

            const img: Buffer = await new Canvas(400, 180)
                .addImage(bg, 0, 0, 400, 180)
                .setColor(fontColor)
                .setTextFont("20px Roboto")
                .addText(
                    city.long_name
                    ? (await this.client.translate(
                        city.long_name, await this.client.locales[message.guild.config.language]
                    )).text
                        .catch(() => city.long_name)
                    : "Unknown", 35, 50
                )
                .setTextFont("16px Roboto")
                .addText(
                    state.long_name
                    ? (await this.client.translate(
                        state.long_name, await this.client.locales[message.guild.config.language]
                    )).text
                    : "", 35, 72.5
                )
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

            message.channel.send({ files: [{ attachment: img, name: `${geocodelocation}.png` }] });
        } catch (error) {
            mg.error(`Error while loading weather for this location. ${error.message}`);
        }
    }

}

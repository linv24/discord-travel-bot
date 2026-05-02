import { insertTrip } from "../src/db/trips.js";
import trip_data from "./sample_data.json" assert { type: "json" };

const discord_id = "238837641473163264";
await insertTrip(discord_id, trip_data);
console.log("Trip inserted successfully.");

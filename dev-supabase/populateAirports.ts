/**
 * Filters airport data to include only entries with valid IATA codes,
 * then writes the filtered data to 'filtered_airports.json'.
 *
 * Airport data is generated from: https://ourairports.com/data/
 * 
 * Usage: Run this script to generate a cleaned airports dataset.
 */

import airportData from "./airports.json" assert { type: "json" };
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import * as dotenv from "dotenv";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../.env") });

function saveFilteredAirports() {
    const seen = new Map<string, object>()
    for (const { iata, name, city, state, country, tz } of Object.values(airportData)) {
        if (!iata || iata.trim() === "" || seen.has(iata)) continue
        seen.set(iata, {
            iata,
            name,
            city,
            state: state && state.trim() !== "" ? state : null,
            country,
            timezone: tz,
        })
    }
    const filteredAirportData = Array.from(seen.values())

    // save to directory 
    fs.writeFileSync("filtered_airports.json", JSON.stringify(filteredAirportData, null, 2));
    
    return filteredAirportData
}

async function populateAirportDataToDatabase() {
    const filteredAirportData = saveFilteredAirports();

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SECRET_KEY
    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase config in environment variables.")
    }
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error } = await supabase
        .from("airports")
        .insert(filteredAirportData)
    if (error) throw error;
}

await populateAirportDataToDatabase();
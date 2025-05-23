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
import { v4 as uuidv4 } from "uuid";

import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import * as dotenv from "dotenv";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../.env") });

function saveFilteredAirports() {
    const filteredAirportData = Object.values(airportData)
        .filter(({ iata }) => iata && iata.trim() !== "")
        .map(({ iata, name, city, state, country, tz }) => ({
            id: uuidv4(), 
            iata,
            name,
            city,
            state,
            country, 
            timezone: tz,
        }))

    // save to directory 
    fs.writeFileSync("filtered_airports.json", JSON.stringify(filteredAirportData, null, 2));
    
    return filteredAirportData
}

async function populateAirportDataToDatabase() {
    const filteredAirportData = saveFilteredAirports();

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_KEY
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
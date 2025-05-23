import { createClient } from "@supabase/supabase-js";
import * as utils from "./utils";
import { v4 as uuidv4 } from "uuid"; 

// dev 
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import * as dotenv from "dotenv";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../.env") });

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

// TODO: some fields can be null, enforce this in interface
interface TripJSON {
  name: string
  description: string
  start_timestamp: string
  end_timestamp: string
  journeys: {
    confirmation: string
    departure_timestamp: string
    arrival_timestamp: string
    legs: {
      flight_number: string
      airline: string
      departure_airport_code: string
      arrival_airport_code: string
      departure_timestamp: string
      arrival_timestamp: string
    }[]
  }[]
}

async function main(discord_id: string, trip: TripJSON) {
    // console.log(JSON.stringify(trip_data, null, 2))

    if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase config in environment variables.")
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const userId = await utils.getUserId(supabase, discord_id)

    // insert trip
    const tripId = uuidv4()
    const {error: tripError } = await supabase
        .from("trips")
        .insert({
            id: tripId,
            user_id: userId,
            name: trip.name,
            description: trip.description,
            start_timestamp: trip.start_timestamp,
            end_timestamp: trip.end_timestamp,
        })
    if (tripError) throw tripError;

    // insert journey
    for (const journey of trip.journeys) {
        const journeyId = uuidv4()
        const { error: journeyError } = await supabase
            .from("journeys")
            .insert({
                id: journeyId,
                trip_id: tripId,
                confirmation: journey.confirmation,
                departure_timestamp: journey.departure_timestamp,
                arrival_timestamp: journey.arrival_timestamp,
            })
        if (journeyError) throw journeyError;

        // insert legs
        const legs = journey.legs.map((leg) => ({
            id: uuidv4(),
            journey_id: journeyId,
            flight_number: leg.flight_number,
            airline: leg.airline,
            departure_airport_code: leg.departure_airport_code,
            departure_timestamp: leg.departure_timestamp,
            arrival_airport_code: leg.arrival_airport_code,
            arrival_timestamp: leg.arrival_timestamp,
        }));
        const { error: legsError } = await supabase
            .from("legs")
            .insert(legs)
        if (legsError) throw legsError;
    }

    return { success: true, tripId };
}

const discord_id = "238837641473163264"
import trip_data from "./sample_data.json";
await main(discord_id, trip_data)
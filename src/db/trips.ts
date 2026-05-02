import { v4 as uuidv4 } from "uuid";
import { supabase } from "./client.js";
import { getUserId } from "./users.js";
import { addReminders } from "./reminders.js";
import type { TripJSON } from "../types/trip.js";

export async function insertTrip(discordId: string, trip: TripJSON): Promise<string> {
    const userId = await getUserId(discordId);

    const tripId = uuidv4();
    const { error: tripError } = await supabase
        .from("trips")
        .insert({
            id: tripId,
            user_id: userId,
            name: trip.name,
            description: trip.description,
            start_date: trip.start_date,
            end_date: trip.end_date,
        });
    if (tripError) throw tripError;

    for (const journey of trip.journeys) {
        const journeyId = uuidv4();
        const { error: journeyError } = await supabase
            .from("journeys")
            .insert({
                id: journeyId,
                trip_id: tripId,
                confirmation: journey.confirmation,
                departure_datetime: journey.departure_datetime,
                arrival_datetime: journey.arrival_datetime,
            });
        if (journeyError) throw journeyError;

        const legs = journey.legs.map((leg) => ({
            id: uuidv4(),
            journey_id: journeyId,
            flight_number: leg.flight_number,
            airline: leg.airline,
            departure_airport_code: leg.departure_airport_code,
            departure_datetime: leg.departure_datetime,
            arrival_airport_code: leg.arrival_airport_code,
            arrival_datetime: leg.arrival_datetime,
        }));
        const { error: legsError } = await supabase.from("legs").insert(legs);
        if (legsError) throw legsError;

        await addReminders(journeyId);
    }

    return tripId;
}

export async function getUserTrips(discordId: string) {
    const { data, error } = await supabase
        .from("trips")
        .select(`
            id,
            name,
            description,
            start_date,
            end_date,
            users!inner (
                discord_user_id
            )
        `)
        .eq("users.discord_user_id", discordId)
        .order("start_date", { ascending: true });
    if (error) throw error;
    return data ?? [];
}

export async function getTripById(tripId: string) {
    const { data, error } = await supabase
        .from("trips")
        .select(`
            id,
            name,
            description,
            start_date,
            end_date,
            journeys (
                id,
                confirmation,
                departure_datetime,
                arrival_datetime,
                legs (
                    flight_number,
                    airline,
                    departure_airport_code,
                    departure_datetime,
                    arrival_airport_code,
                    arrival_datetime
                )
            )
        `)
        .eq("id", tripId)
        .single();
    if (error) throw error;
    return data;
}

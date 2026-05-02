import { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

/**
 * Gets a user's ID from the database by Discord ID, or creates a new user if not found.
 * @param supabase The Supabase client instance.
 * @param discordId The Discord Snowflake ID to look up.
 * @returns The user's ID from the databaes.
 * @throws If there is an error in inserting a new user.
 */
export async function getUserId(supabase: SupabaseClient, discordId: string) {
    const { data: user, error: userError} = await supabase
        .from("users")
        .select("id")
        .eq("discord_user_id", discordId)
        .single()

    let userId: string

    if (userError || !user) {
        const { data: newUser, error: insertUserError } = await supabase
            .from("users")
            .insert({ discord_user_id: discordId })
            .select()
            .single()

        if (insertUserError || !newUser) throw insertUserError
        userId = newUser.id
    } else {
        userId = user.id
    }

    return userId 
}

/**
 * Adds reminders to the database by journey ID. Currently, only supports reminders
 * at 2 hours before and 10 minutes before journey check-in, no custom reminders yet.
 * @param supabase The Supabase client instance.
 * @param journeyId The journey ID for which the reminders should be added.
 * @throws If there is an error in adding reminders.
 */
export async function addReminders(supabase: SupabaseClient, journeyId: string) {
    // Get the earliest leg in the journey 
    const { data: departureTimestamps, error: departureTimestampsError } = await supabase
        .from("legs")
        .select("departure_datetime")
        .eq("journey_id", journeyId)
    if (departureTimestampsError || !departureTimestamps) throw departureTimestampsError;
    const depatureTimestampsArray = departureTimestamps.map((legTimestamp) => legTimestamp.departure_datetime);
    depatureTimestampsArray
        .sort((a, b) => 
            new Date(a).getTime() - new Date(b).getTime()
        );
    const earliestTimestamp = depatureTimestampsArray[0]

    // Create reminders based on earliest timestamp in journey
    const reminderSchedule: { type: string; minutesBefore: number }[] = [
        { type: "check_in", minutesBefore: 24 * 60 },
        { type: "check_in", minutesBefore: 15 },
        { type: "departure", minutesBefore: 120 },
        { type: "departure", minutesBefore: 10 },
    ]
    const reminders = reminderSchedule.map(({ type, minutesBefore }) => {
        const date = new Date(earliestTimestamp)
        date.setMinutes(date.getMinutes() - minutesBefore)
        return {
            id: uuidv4(),
            journey_id: journeyId,
            type,
            notify_at: date.toISOString(),
            is_completed: false,
            repeat_interval_minutes: 15,
        }
    })

    // Insert reminders into database
    const { error: remindersError } = await supabase
        .from("reminders")
        .insert(reminders)
    if (remindersError) throw remindersError;
}
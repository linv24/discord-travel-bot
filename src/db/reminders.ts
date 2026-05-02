import { v4 as uuidv4 } from "uuid";
import { supabase } from "./client.js";

const REMINDER_SCHEDULE = [
    { type: "check_in", minutesBefore: 24 * 60 },
    { type: "check_in", minutesBefore: 15 },
    { type: "departure", minutesBefore: 120 },
    { type: "departure", minutesBefore: 10 },
] as const;

export async function addReminders(journeyId: string): Promise<void> {
    const { data: legs, error } = await supabase
        .from("legs")
        .select("departure_datetime")
        .eq("journey_id", journeyId);
    if (error || !legs) throw error;

    const earliest = legs
        .map((l) => l.departure_datetime)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];

    const reminders = REMINDER_SCHEDULE.map(({ type, minutesBefore }) => {
        const date = new Date(earliest);
        date.setMinutes(date.getMinutes() - minutesBefore);
        return {
            id: uuidv4(),
            journey_id: journeyId,
            type,
            notify_at: date.toISOString(),
            is_completed: false,
            repeat_interval_minutes: 15,
        };
    });

    const { error: remindersError } = await supabase.from("reminders").insert(reminders);
    if (remindersError) throw remindersError;
}

export async function getPendingReminders() {
    const { data, error } = await supabase
        .from("reminders")
        .select(`
            id,
            type,
            repeat_interval_minutes,
            journeys (
                id,
                trips (
                    name,
                    users (
                        discord_user_id
                    )
                )
            ),
            legs:journeys (
                legs (
                    departure_airport_code,
                    arrival_airport_code,
                    departure_datetime
                )
            )
        `)
        .eq("is_completed", false)
        .lte("notify_at", new Date().toISOString());
    if (error) throw error;
    return data ?? [];
}

export async function markReminderComplete(reminderId: string): Promise<void> {
    const { error } = await supabase
        .from("reminders")
        .update({ is_completed: true })
        .eq("id", reminderId);
    if (error) throw error;
}

export async function advanceReminderNotifyAt(reminderId: string, intervalMinutes: number): Promise<void> {
    const date = new Date();
    date.setMinutes(date.getMinutes() + intervalMinutes);
    const { error } = await supabase
        .from("reminders")
        .update({ notify_at: date.toISOString() })
        .eq("id", reminderId);
    if (error) throw error;
}

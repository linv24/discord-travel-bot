import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Gets a user's ID from the database by Discord ID, or creates a new user if not found.
 * @param supabase The Supabase client instance.
 * @param discord_id The Discord Snowflake ID to look up.
 * @returns The user's ID from the databaes.
 * @throws If there is an error in inserting a new user.
 */
export async function getUserId(supabase: SupabaseClient, discord_id: string) {
    const { data: user, error: userError} = await supabase
        .from("users")
        .select("id")
        .eq("discord_id", discord_id)
        .single()

    let userId: string

    if (userError || !user) {
        const { data: newUser, error: insertUserError } = await supabase
            .from("users")
            .insert({ discord_id })
            .select()
            .single()

        if (insertUserError || !newUser) throw insertUserError
        userId = newUser.id
    } else {
        userId = user.id
    }

    return userId 
}
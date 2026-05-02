import { supabase } from "./client.js";

export async function getUserId(discordId: string): Promise<string> {
    const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("discord_user_id", discordId)
        .single();

    if (!userError && user) return user.id;

    const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({ discord_user_id: discordId })
        .select()
        .single();

    if (insertError || !newUser) throw insertError;
    return newUser.id;
}

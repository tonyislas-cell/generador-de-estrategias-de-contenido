import { supabase } from "@/lib/supabase";

/**
 * Contador público de usos totales, sin identidad asociada (ni IP, ni
 * cookie, ni fingerprint) — solo un número que sube.
 */

export async function incrementKitUsage(): Promise<void> {
  const { error } = await supabase.rpc("increment_kit_usage");
  if (error) throw error;
}

export async function getKitUsageTotal(): Promise<number> {
  const { data, error } = await supabase
    .from("usage_counter")
    .select("total")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw error;
  return data?.total ?? 0;
}

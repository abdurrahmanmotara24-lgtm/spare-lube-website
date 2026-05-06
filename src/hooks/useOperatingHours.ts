import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface OperatingHour {
  id: string;
  day_of_week: number;
  label: string;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  notes: string | null;
  sort_order: number;
}

export const DEFAULT_OPERATING_HOURS: OperatingHour[] = [
  {
    id: "default-0",
    day_of_week: 0,
    label: "Sunday",
    is_open: false,
    open_time: null,
    close_time: null,
    notes: "Closed",
    sort_order: 0,
  },
  {
    id: "default-1",
    day_of_week: 1,
    label: "Monday",
    is_open: true,
    open_time: "08:00:00",
    close_time: "17:00:00",
    notes: null,
    sort_order: 1,
  },
  {
    id: "default-2",
    day_of_week: 2,
    label: "Tuesday",
    is_open: true,
    open_time: "08:00:00",
    close_time: "17:00:00",
    notes: null,
    sort_order: 2,
  },
  {
    id: "default-3",
    day_of_week: 3,
    label: "Wednesday",
    is_open: true,
    open_time: "08:00:00",
    close_time: "17:00:00",
    notes: null,
    sort_order: 3,
  },
  {
    id: "default-4",
    day_of_week: 4,
    label: "Thursday",
    is_open: true,
    open_time: "08:00:00",
    close_time: "17:00:00",
    notes: null,
    sort_order: 4,
  },
  {
    id: "default-5",
    day_of_week: 5,
    label: "Friday",
    is_open: true,
    open_time: "08:00:00",
    close_time: "17:00:00",
    notes: null,
    sort_order: 5,
  },
  {
    id: "default-6",
    day_of_week: 6,
    label: "Saturday",
    is_open: true,
    open_time: "08:00:00",
    close_time: "13:00:00",
    notes: null,
    sort_order: 6,
  },
];

export const formatHoursTime = (time: string | null) => {
  if (!time) return null;
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return time;
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export function useOperatingHours() {
  const [hours, setHours] = useState<OperatingHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHours = useCallback(async () => {
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("operating_hours")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("day_of_week", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setHours((data as OperatingHour[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHours();
    const channel = supabase
      .channel(`operating-hours-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "operating_hours" }, () => {
        fetchHours();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchHours]);

  const effectiveHours = useMemo(
    () => (hours.length > 0 ? hours : DEFAULT_OPERATING_HOURS),
    [hours],
  );

  return { hours: effectiveHours, loading, error, refreshOperatingHours: fetchHours };
}


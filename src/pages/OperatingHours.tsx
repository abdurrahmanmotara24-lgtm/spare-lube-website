import PublicLayout from "@/components/PublicLayout";
import { useOperatingHours, formatHoursTime } from "@/hooks/useOperatingHours";
import { usePageContent, type PageContent } from "@/hooks/usePageContent";

const DEFAULT_OPERATING_HOURS_CONTENT: PageContent = {
  id: "operating_hours",
  eyebrow: "Operating Hours",
  heading: "Business Schedule",
  subheading:
    "Visit or contact us during trading hours below. For urgent order requests, WhatsApp is the fastest channel.",
  body_paragraph_1: null,
  body_paragraph_2: null,
  body_paragraph_3: null,
};

const OperatingHours = () => {
  const { hours } = useOperatingHours();
  const { content } = usePageContent("operating_hours", DEFAULT_OPERATING_HOURS_CONTENT);
  const today = new Date().getDay();
  const todayHours = hours.find((item) => item.day_of_week === today);
  const todayWindow =
    todayHours && todayHours.is_open
      ? `${formatHoursTime(todayHours.open_time)} - ${formatHoursTime(todayHours.close_time)}`
      : "Closed";
  const openNowText = todayHours && todayHours.is_open ? `OPEN NOW · ${todayWindow}` : "CLOSED NOW";

  return (
    <PublicLayout>
      <section className="max-w-5xl mx-auto section-padding py-14 sm:py-18">
        <p className="text-[10px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-3">
          {content.eyebrow}
        </p>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold text-foreground uppercase tracking-[0.02em] mb-4">
          {content.heading}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
          {content.subheading}
        </p>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground/90">
          Public holiday trading hours may vary.
        </p>
      </section>

      <section className="max-w-5xl mx-auto section-padding pb-20">
        <div className="rounded-2xl border border-border/70 bg-gradient-to-b from-card to-card/90 p-4 sm:p-6 shadow-[0_24px_44px_-28px_rgba(0,0,0,0.55)]">
          <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-3">
            <p className="text-sm font-bold tracking-[0.08em] text-foreground">{openNowText}</p>
            <p className="mt-1 text-xs text-muted-foreground">Public holiday trading hours may vary.</p>
          </div>
          <div className="divide-y divide-border/60">
            {hours.map((item) => {
              const isToday = item.day_of_week === today;
              const hoursText = item.is_open
                ? `${formatHoursTime(item.open_time)} - ${formatHoursTime(item.close_time)}`
                : "Closed";

              return (
                <div
                  key={item.id}
                  className={`py-4 flex items-start justify-between gap-4 ${
                    isToday ? "bg-muted/45 -mx-3 px-3 rounded-lg border-l-2 border-primary" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm sm:text-base font-semibold text-foreground">
                        {item.label} {isToday ? "(Today)" : ""}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          item.is_open
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                            : "bg-rose-500/15 text-rose-600 dark:text-rose-300"
                        }`}
                      >
                        {item.is_open ? "Open" : "Closed"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground/90 sm:hidden">{hoursText}</p>
                    {item.notes ? <p className="text-xs text-muted-foreground mt-1">{item.notes}</p> : null}
                  </div>
                  <p className="hidden sm:block text-sm sm:text-base font-semibold text-foreground min-w-[170px] text-right">
                    {hoursText}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default OperatingHours;


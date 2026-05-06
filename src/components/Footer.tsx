import { NavLink } from "@/components/NavLink";
import { useSiteContact } from "@/hooks/useSiteContact";
import { useOperatingHours, formatHoursTime } from "@/hooks/useOperatingHours";

const Footer = () => {
  const { contact } = useSiteContact();
  const { hours } = useOperatingHours();
  const today = new Date().getDay();
  const todayHours = hours.find((item) => item.day_of_week === today);
  const hoursText = todayHours
    ? todayHours.is_open
      ? `${formatHoursTime(todayHours.open_time)} - ${formatHoursTime(todayHours.close_time)}`
      : "Closed today"
    : "Hours unavailable";

  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto section-padding py-10">
        <div className="grid gap-6 sm:grid-cols-3 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-2">Quick Links</p>
            <div className="space-y-2 text-sm">
              <NavLink to="/" end className="block text-foreground/90 hover:text-foreground">Home</NavLink>
              <NavLink to="/about" className="block text-foreground/90 hover:text-foreground">About</NavLink>
              <NavLink to="/contact" className="block text-foreground/90 hover:text-foreground">Contact</NavLink>
              <NavLink to="/operating-hours" className="block text-foreground/90 hover:text-foreground">
                Operating Hours
              </NavLink>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-2">Contact</p>
            <div className="space-y-2 text-sm text-foreground/90">
              <p>{contact.phone}</p>
              <p>{contact.email ?? "sales@sparelube.co.za"}</p>
              <p>{[contact.address_line_1, contact.city].filter(Boolean).join(", ")}</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-2">Today</p>
            <p className="text-sm text-foreground/90">{todayHours?.label ?? "Today"}: {hoursText}</p>
          </div>
        </div>
        <p className="font-heading text-muted-foreground text-sm uppercase tracking-widest text-center">
          © {new Date().getFullYear()} Spare Lube. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

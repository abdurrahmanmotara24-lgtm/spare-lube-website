import { ShieldCheck, Package, HeartHandshake, Truck } from "lucide-react";

const features = [
  { icon: ShieldCheck, label: "Genuine Products" },
  { icon: Truck, label: "Fast Delivery Support" },
  { icon: Package, label: "Bulk Supply Available" },
  { icon: HeartHandshake, label: "Reliable Service" },
];

const WhyChoose = () => {
  return (
    <section className="bg-muted/60">
      <div className="max-w-7xl mx-auto section-padding py-14 text-center">
        <p className="text-sm font-semibold text-primary mb-2">Built for workshops and fleet buyers</p>
        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 mt-5">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-2 text-foreground">
              <f.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium tracking-wide">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;

import { Truck, ShieldCheck, Package } from "lucide-react";

const items = [
  { icon: Truck, label: "Fast Delivery" },
  { icon: ShieldCheck, label: "Trusted Brands" },
  { icon: Package, label: "Bulk Orders Available" },
];

const TrustBar = () => {
  return (
    <div className="bg-zinc-950/95 border-y border-white/5">
      <div className="max-w-7xl mx-auto section-padding py-4 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-white/80 text-sm">
            <item.icon className="h-4 w-4 text-primary" />
            <span className="tracking-wide">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustBar;

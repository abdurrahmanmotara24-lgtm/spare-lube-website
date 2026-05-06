import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type PageId = "about" | "contact" | "operating_hours";

type PageDraft = {
  id: PageId;
  eyebrow: string;
  heading: string;
  subheading: string;
  body_paragraph_1: string;
  body_paragraph_2: string;
  body_paragraph_3: string;
};

const DEFAULTS: Record<PageId, PageDraft> = {
  about: {
    id: "about",
    eyebrow: "ABOUT SPARELUBE",
    heading: "Reliable Lubricant Supply Since 2010",
    subheading: "",
    body_paragraph_1:
      "SpareLube Auto Lubricant Distributors has been operating since 2010, supplying high-quality automotive lubricants to registered dealers and distributors. With extensive experience in the retail automotive sector, we understand the demands of the industry and deliver solutions that meet them.",
    body_paragraph_2:
      "We are a service-oriented supplier committed to reliability, efficiency, and excellence. Our strong distribution network, broad product range, and focus on customer satisfaction position us as a preferred distributor for all automotive lubricant requirements.",
    body_paragraph_3:
      "At SpareLube, we take pride in our customer service. Every client's needs are carefully assessed to provide tailored solutions. From the moment an order is placed through to final delivery, we ensure a smooth, dependable experience that meets and exceeds expectations.",
  },
  contact: {
    id: "contact",
    eyebrow: "Contact Us",
    heading: "Speak With Our Team",
    subheading: "Reach out directly to our sales team for product support, pricing, and order assistance.",
    body_paragraph_1: "",
    body_paragraph_2: "",
    body_paragraph_3: "",
  },
  operating_hours: {
    id: "operating_hours",
    eyebrow: "Operating Hours",
    heading: "Business Schedule",
    subheading:
      "Visit or contact us during trading hours below. For urgent order requests, WhatsApp is the fastest channel.",
    body_paragraph_1: "",
    body_paragraph_2: "",
    body_paragraph_3: "",
  },
};

const PublicPageContentManager = () => {
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<PageId, PageDraft>>(DEFAULTS);
  const [savingId, setSavingId] = useState<PageId | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("page_content")
        .select("*")
        .in("id", ["about", "contact", "operating_hours"]);
      if (!data) return;
      setDrafts((previous) => {
        const next = { ...previous };
        data.forEach((row) => {
          const id = row.id as PageId;
          if (!next[id]) return;
          next[id] = {
            ...next[id],
            eyebrow: row.eyebrow ?? "",
            heading: row.heading ?? "",
            subheading: row.subheading ?? "",
            body_paragraph_1: row.body_paragraph_1 ?? "",
            body_paragraph_2: row.body_paragraph_2 ?? "",
            body_paragraph_3: row.body_paragraph_3 ?? "",
          };
        });
        return next;
      });
    };
    load();
  }, []);

  const update = (id: PageId, key: keyof PageDraft, value: string) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  };

  const save = async (id: PageId) => {
    setSavingId(id);
    const draft = drafts[id];
    const { error } = await supabase.from("page_content").upsert(
      {
        id,
        eyebrow: draft.eyebrow,
        heading: draft.heading,
        subheading: draft.subheading,
        body_paragraph_1: draft.body_paragraph_1 || null,
        body_paragraph_2: draft.body_paragraph_2 || null,
        body_paragraph_3: draft.body_paragraph_3 || null,
      },
      { onConflict: "id" },
    );
    setSavingId(null);
    if (error) {
      toast({ title: "Could not save page content", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `${id.replace("_", " ")} content saved` });
  };

  return (
    <section className="bg-card border border-border rounded-xl p-6 mb-10">
      <h2 className="font-heading text-lg font-semibold text-foreground mb-5">Public Page Content</h2>
      <div className="space-y-6">
        {(Object.keys(drafts) as PageId[]).map((id) => (
          <div key={id} className="rounded-lg border border-border p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{id.replace("_", " ")}</p>
            <div>
              <Label>Eyebrow</Label>
              <Input value={drafts[id].eyebrow} onChange={(e) => update(id, "eyebrow", e.target.value)} />
            </div>
            <div>
              <Label>Heading</Label>
              <Input value={drafts[id].heading} onChange={(e) => update(id, "heading", e.target.value)} />
            </div>
            <div>
              <Label>Subheading</Label>
              <Textarea
                rows={2}
                value={drafts[id].subheading}
                onChange={(e) => update(id, "subheading", e.target.value)}
              />
            </div>
            {id === "about" ? (
              <>
                <div>
                  <Label>About paragraph 1</Label>
                  <Textarea
                    rows={3}
                    value={drafts[id].body_paragraph_1}
                    onChange={(e) => update(id, "body_paragraph_1", e.target.value)}
                  />
                </div>
                <div>
                  <Label>About paragraph 2</Label>
                  <Textarea
                    rows={3}
                    value={drafts[id].body_paragraph_2}
                    onChange={(e) => update(id, "body_paragraph_2", e.target.value)}
                  />
                </div>
                <div>
                  <Label>About paragraph 3</Label>
                  <Textarea
                    rows={3}
                    value={drafts[id].body_paragraph_3}
                    onChange={(e) => update(id, "body_paragraph_3", e.target.value)}
                  />
                </div>
              </>
            ) : null}
            <div className="flex justify-end">
              <Button size="sm" onClick={() => void save(id)} disabled={savingId === id}>
                {savingId === id ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PublicPageContentManager;


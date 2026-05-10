import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Upload, CheckCircle2, Clock, FileText, Award, QrCode, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({ meta: [{ title: "Documents — DriveSchool Pro" }] }),
  component: DocumentsPage,
});

const REQUIRED_DOCS = [
  { id: "id", label: "National ID / Passport", desc: "Clear scan or photo of both sides", uploaded: true, verified: true },
  { id: "photo", label: "Passport Photo", desc: "Recent colour photo, white background", uploaded: true, verified: false },
  { id: "medical", label: "Medical Certificate", desc: "From a registered medical practitioner", uploaded: false, verified: false },
];

function DocumentsPage() {
  const [docs, setDocs] = useState(REQUIRED_DOCS);
  const [uploading, setUploading] = useState<string | null>(null);

  const handleUpload = async (id: string) => {
    setUploading(id);
    await new Promise((r) => setTimeout(r, 1500));
    setDocs((prev) => prev.map((d) => d.id === id ? { ...d, uploaded: true } : d));
    setUploading(null);
    toast.success("Document uploaded successfully");
  };

  const allUploaded = docs.every((d) => d.uploaded);
  const courseComplete = false; // would be true when all lessons done + exam passed

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10">
      <h1 className="text-h1 text-navy">Documents</h1>
      <p className="mt-1 text-sm text-muted-foreground">Upload required documents and download your completion certificate.</p>

      {/* Certificate section */}
      <div className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl",
            courseComplete ? "bg-success-light text-success" : "bg-surface-2 text-muted-foreground",
          )}>
            <Award className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <h2 className="text-h2 text-navy">Completion Certificate</h2>
            {courseComplete ? (
              <>
                <p className="mt-1 text-sm text-muted-foreground">Your certificate is ready. Certificate #DSP-2026-1847</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="primary" size="sm" onClick={() => toast.success("Certificate downloaded")}>
                    <Download className="mr-1.5 h-4 w-4" /> Download PDF
                  </Button>
                  <Button variant="secondary" size="sm">
                    <QrCode className="mr-1.5 h-4 w-4" /> Verify QR code
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your certificate will be auto-generated once you complete all lessons and pass your exam assessment.
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    { label: "All lessons completed", done: false, current: true },
                    { label: "Theory test passed", done: false, current: false },
                    { label: "Exam assessment passed", done: false, current: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-sm">
                      <span className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full",
                        item.done ? "bg-success text-white" : "border-2 border-border",
                      )}>
                        {item.done && <CheckCircle2 className="h-3 w-3" />}
                      </span>
                      <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                      {item.current && <Badge variant="warning" size="sm">In progress</Badge>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Required documents */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-h2 text-navy">Required documents</h2>
          {allUploaded
            ? <Badge variant="success">All uploaded</Badge>
            : <Badge variant="warning">{docs.filter((d) => !d.uploaded).length} pending</Badge>
          }
        </div>

        {!allUploaded && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-warning bg-warning-light p-4 text-sm text-warning-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Please upload all required documents to complete your enrolment.</span>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 rounded-xl border border-border bg-white p-4">
              <div className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                doc.verified ? "bg-success-light text-success" :
                doc.uploaded ? "bg-warning-light text-warning-foreground" :
                "bg-surface-2 text-muted-foreground",
              )}>
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-navy">{doc.label}</p>
                <p className="text-sm text-muted-foreground">{doc.desc}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {doc.verified
                  ? <Badge variant="success" size="sm"><CheckCircle2 className="mr-1 h-3 w-3" /> Verified</Badge>
                  : doc.uploaded
                  ? <Badge variant="warning" size="sm"><Clock className="mr-1 h-3 w-3" /> Under review</Badge>
                  : null
                }
                {!doc.uploaded ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={uploading === doc.id}
                    onClick={() => handleUpload(doc.id)}
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    {uploading === doc.id ? "Uploading…" : "Upload"}
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => toast.info("File viewer coming soon")}>
                    View
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

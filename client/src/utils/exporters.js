import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function downloadCSV(report) {
  const rows = [];

  rows.push(["Report", report.title]);
  rows.push(["Generated", new Date(report.createdAt).toISOString()]);
  rows.push(["Filters", JSON.stringify(report.filters)]);
  rows.push([]);

  rows.push(["Metric", "Value"]);
  rows.push(["Total feedback", report.summary.total]);
  rows.push(["Analyzed", report.summary.analyzed]);
  rows.push(["Pending", report.summary.pending]);
  rows.push(["Positive", report.summary.sentiment.positive]);
  rows.push(["Neutral", report.summary.sentiment.neutral]);
  rows.push(["Negative", report.summary.sentiment.negative]);
  rows.push([
    "Negativity rate",
    (report.summary.negativityRate * 100).toFixed(1) + "%",
  ]);
  rows.push([]);

  rows.push(["Top complaints"]);
  rows.push(["Complaint", "Count"]);
  (report.summary.topComplaints || []).forEach((c) =>
    rows.push([c.complaint, c.count]),
  );
  rows.push([]);

  rows.push(["Issues"]);
  rows.push([
    "Title",
    "Severity",
    "Priority",
    "Frequency",
    "Status",
    "Recommendation",
  ]);
  (report.issues || []).forEach((i) =>
    rows.push([
      i.title,
      i.severity,
      i.priorityScore,
      i.frequency,
      i.status,
      (i.recommendation || "").replace(/\n/g, " "),
    ]),
  );

  const csv = rows
    .map((r) =>
      r
        .map((v) => {
          const s = v === undefined || v === null ? "" : String(v);
          return s.includes(",") || s.includes('"') || s.includes("\n")
            ? '"' + s.replace(/"/g, '""') + '"'
            : s;
        })
        .join(","),
    )
    .join("\n");

  downloadBlob(csv, `${sanitize(report.title)}.csv`, "text/csv;charset=utf-8;");
}

export function downloadPDF(report) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let y = margin;

  doc.setFontSize(18);
  doc.text("InsightFlow — Customer Feedback Report", margin, y);
  y += 24;

  doc.setFontSize(12);
  doc.text(report.title || "Untitled report", margin, y);
  y += 16;

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(
    "Generated " +
      new Date(report.createdAt).toLocaleString() +
      "  |  Filters: " +
      JSON.stringify(report.filters || {}),
    margin,
    y,
  );
  doc.setTextColor(0);
  y += 20;

  // Summary block
  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Total feedback", report.summary.total],
      ["Analyzed", report.summary.analyzed],
      ["Pending", report.summary.pending],
      ["Positive", report.summary.sentiment.positive],
      ["Neutral", report.summary.sentiment.neutral],
      ["Negative", report.summary.sentiment.negative],
      [
        "Negativity rate",
        (report.summary.negativityRate * 100).toFixed(1) + "%",
      ],
    ],
    theme: "grid",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [99, 102, 241] },
  });

  y = doc.lastAutoTable.finalY + 20;

  // Top complaints
  if (report.summary.topComplaints?.length) {
    doc.setFontSize(12);
    doc.text("Top complaints", margin, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [["Complaint", "Count"]],
      body: report.summary.topComplaints.map((c) => [c.complaint, c.count]),
      theme: "striped",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [239, 68, 68] },
    });
    y = doc.lastAutoTable.finalY + 20;
  }

  // Issues
  if (report.issues?.length) {
    doc.setFontSize(12);
    doc.text("Priority issues", margin, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [["Issue", "Sev", "Priority", "Freq", "Status", "Recommendation"]],
      body: report.issues.map((i) => [
        i.title,
        i.severity,
        i.priorityScore,
        i.frequency,
        i.status,
        i.recommendation || "",
      ]),
      theme: "grid",
      styles: { fontSize: 9, cellWidth: "wrap" },
      headStyles: { fillColor: [99, 102, 241] },
      columnStyles: {
        0: { cellWidth: 130 },
        5: { cellWidth: 180 },
      },
    });
  }

  doc.save(`${sanitize(report.title)}.pdf`);
}

function sanitize(name) {
  return (name || "report").replace(/[^a-z0-9\-_]+/gi, "_").slice(0, 60);
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

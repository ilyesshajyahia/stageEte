
import React, { useEffect, useState, useRef } from "react";
import "./respReport.css";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ranges = [
  { label: "Aujourd'hui", value: "daily" },
  { label: "Cette semaine", value: "weekly" },
  { label: "Ce mois", value: "monthly" },
];

const RespReport = () => {
  const [range, setRange] = useState("daily");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`http://localhost:5000/reports?range=${range}&date=${date}`);
        if (!res.ok) throw new Error("Erreur lors du chargement du rapport");
        const data = await res.json();

        // Fetch average assignment-to-intervention time
        let avgTime = null;
        try {
          const avgRes = await fetch('http://localhost:5000/stats/average-assignment-to-intervention');
          if (avgRes.ok) {
            const avgData = await avgRes.json();
            avgTime = avgData.avg_time;
          }
        } catch {}

        setReport({ ...data, avgAssignmentToIntervention: avgTime });
      } catch (err) {
        setError(err.message || "Erreur lors du chargement du rapport");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [range, date]);

  // Chart data
  // Chart refs for export
  const typeChartRef = useRef();
  const statusChartRef = useRef();
  const techChartRef = useRef();

  const typeChartData = report && {
    labels: report.byType.map((t) => t.type),
    datasets: [
      {
        label: "Tickets par type",
        data: report.byType.map((t) => t.count),
        backgroundColor: ["#38bdf8", "#10b981", "#f59e42", "#ef4444", "#6366f1", "#fbbf24"],
      },
    ],
  };
  const statusChartData = report && {
  labels: report.byStatus.map((s) => s.status),
  datasets: [
    {
      label: "Tickets par statut",
      data: report.byStatus.map((s) => s.count),
      backgroundColor: report.byStatus.map((s) => {
        if (s.status === "EN_ATTENTE") return "#fbbf24"; // orange
        if (s.status === "EN_COURS") return "#6366f1"; // blueish
        if (s.status === "TERMINE") return "#10b981"; // green
        if (s.status === "REFUSE") return "#ef4444"; // red
        return "#e5e7eb"; // fallback gray
      }),
    },
  ],
  };
  const techChartData = report && {
    labels: report.byTechnicien.map((t) => `Tech #${t.assigned_to}`),
    datasets: [
      {
        label: "Tickets par technicien",
        data: report.byTechnicien.map((t) => t.count),
        backgroundColor: ["#6366f1", "#38bdf8", "#10b981", "#f59e42", "#ef4444", "#fbbf24"],
      },
    ],
  };

  // PDF Export
  const handleExportPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Rapport des tickets", 14, 18);
    doc.setFontSize(12);
    // Calculate date range
    let fromDate = date, toDate = date;
    if (range === "weekly") {
      const d = new Date(date);
      const from = new Date(d);
      from.setDate(d.getDate() - 6);
      fromDate = from.toISOString().slice(0, 10);
    } else if (range === "monthly") {
      const d = new Date(date);
      fromDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    }
    // Format dates for display
    const formatDate = (d) => {
      const [y, m, da] = d.split("-");
      return `${da}/${m}/${y}`;
    };
    let periodText = "";
    if (range === "daily") {
      periodText = `Date : ${formatDate(date)}`;
    } else {
      periodText = `Du ${formatDate(fromDate)} au ${formatDate(toDate)}`;
    }
    doc.text(periodText, 14, 28);
    doc.text(`Total tickets: ${report.total}`, 14, 38);
    doc.setDrawColor(56, 189, 248);
    doc.setLineWidth(0.5);
    doc.line(14, 42, 196, 42);
    let y = 48;
    doc.setFontSize(14);
    doc.text("Tickets par type", 14, y);
    // Paragraph above table
    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.text("Ce tableau et graphique montrent la répartition des tickets selon leur type (logiciel, matériel, etc.) pour la période choisie.", 14, y, { maxWidth: 180 });
    y += 14; // Increased spacing to avoid overlap
    autoTable(doc, {
      startY: y,
      head: [["Type", "Nombre"]],
      body: report.byType.map((t) => [t.type, t.count]),
      theme: 'striped',
      styles: { fontSize: 11 },
      headStyles: { fillColor: [56, 189, 248] },
      tableWidth: 90,
    });
    // Insert chart image for type, right of the table
    if (typeChartRef.current) {
      const img = typeChartRef.current.canvas.toDataURL("image/png", 1.0);
      doc.addImage(img, "PNG", 110, y, 70, 40);
    }
    y = doc.lastAutoTable.finalY + 48;
    doc.setFontSize(14);
    doc.setTextColor(20);
    doc.text("Tickets par statut", 14, y);
    // Paragraph above table
    y += 7;
    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.text("Ce tableau et graphique illustrent la progression des tickets (en attente, en cours, terminé, etc.) pour la période sélectionnée.", 14, y, { maxWidth: 180 });
    y += 10;
    autoTable(doc, {
      startY: y,
      head: [["Statut", "Nombre"]],
      body: report.byStatus.map((s) => [s.status, s.count]),
      theme: 'striped',
      styles: {
        fontSize: 11,
        textColor: (row, data) => {
          if (data.column.index === 0) {
            if (data.cell.raw === "EN_ATTENTE") return [251, 191, 36]; // orange
            if (data.cell.raw === "EN_COURS") return [99, 102, 241]; // blueish
            if (data.cell.raw === "TERMINE") return [16, 185, 129]; // green
            if (data.cell.raw === "REFUSE") return [239, 68, 68]; // red
          }
          return 20;
        },
      },
      headStyles: { fillColor: [16, 185, 129] },
      tableWidth: 90,
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 0) {
          if (data.cell.raw === "EN_ATTENTE") {
            data.cell.styles.textColor = [251, 191, 36]; // orange
          } else if (data.cell.raw === "EN_COURS") {
            data.cell.styles.textColor = [99, 102, 241]; // blueish
          } else if (data.cell.raw === "TERMINE") {
            data.cell.styles.textColor = [16, 185, 129]; // green
          } else if (data.cell.raw === "REFUSE") {
            data.cell.styles.textColor = [239, 68, 68]; // red
          }
        }
      },
    });
    if (statusChartRef.current) {
      const img = statusChartRef.current.canvas.toDataURL("image/png", 1.0);
      doc.addImage(img, "PNG", 110, y, 70, 40);
    }
    y = doc.lastAutoTable.finalY + 48;
    doc.setFontSize(14);
    doc.setTextColor(20);
    doc.text("Tickets par technicien", 14, y);
    y += 7;
    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.text("Ce tableau et graphique présentent la charge de travail de chaque technicien ayant reçu des tickets durant la période.", 14, y, { maxWidth: 180 });
    y += 10;
    autoTable(doc, {
      startY: y,
      head: [["Technicien", "Nombre"]],
      body: report.byTechnicien.map((t) => [t.assigned_to, t.count]),
      theme: 'striped',
      styles: { fontSize: 11 },
      headStyles: { fillColor: [99, 102, 241] },
      tableWidth: 90,
    });
    if (techChartRef.current) {
      const img = techChartRef.current.canvas.toDataURL("image/png", 1.0);
      doc.addImage(img, "PNG", 110, y, 70, 40);
    }
    doc.save("rapport_tickets.pdf");
  };

  return (
    <div className="resp-report-page">
      <h2>Rapport des tickets</h2>
      <div className="resp-report-range-btns">
        {ranges.map((r) => (
          <button
            key={r.value}
            className={`resp-report-range-btn${range === r.value ? " active" : ""}`}
            onClick={() => setRange(r.value)}
          >
            {r.label}
          </button>
        ))}
        <input
          type="date"
          className="resp-report-date"
          value={date}
          onChange={e => setDate(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
        />
        {report && (
          <button className="resp-report-export-btn" onClick={handleExportPDF}>
            Exporter en PDF
          </button>
        )}
      </div>
      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="resp-report-error">{error}</p>
      ) : report ? (
        <div className="resp-report-content dashboard">
          <div className="resp-report-block dashboard-summary">
            <h3>Total de tickets</h3>
            <div className="resp-report-total">{report.total}</div>
            <p className="resp-report-desc">Nombre total de tickets créés pour la période sélectionnée.</p>
            {report.avgAssignmentToIntervention && (
              <div style={{ marginTop: 12, fontWeight: 500 }}>
                ⏱️ Délai moyen assignation → intervention :{' '}
                <span style={{ color: '#38bdf8' }}>{report.avgAssignmentToIntervention}</span>
              </div>
            )}
          </div>
          <div className="resp-report-block dashboard-chart">
            <h3>Répartition par type</h3>
            {typeChartData && <Pie data={typeChartData} ref={typeChartRef} />}
            <p className="resp-report-desc">Visualisez la diversité des demandes traitées.</p>
          </div>
          <div className="resp-report-block dashboard-chart">
            <h3>Répartition par statut</h3>
            {statusChartData && <Doughnut data={statusChartData} ref={statusChartRef} />}
            <p className="resp-report-desc">Suivez la progression des tickets.</p>
          </div>
          <div className="resp-report-block dashboard-chart">
            <h3>Tickets par technicien</h3>
            {techChartData && <Bar data={techChartData} options={{ indexAxis: "y" }} ref={techChartRef} />}
            <p className="resp-report-desc">Charge de travail par technicien assigné.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default RespReport;

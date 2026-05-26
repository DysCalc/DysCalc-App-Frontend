import { jsPDF } from "jspdf";

export interface PDFReportData {
  studentName: string;
  assessmentTitle: string;
  isAtRisk: boolean;
  confidence?: number;
  testPerformance: {
    label: string;
    display: string;
    efficiency?: number;
  }[];
  decisionPathReadable?: string;
  domainSeverityScores?: Record<string, number>;
}

export function generateClassificationPDF(data: PDFReportData) {
  const doc = new jsPDF("p", "mm", "a4");

  // Web Colors
  const COLORS = {
    primaryGreen: [41, 161, 119], // #29A177
    redAtRisk: [239, 68, 68], // #EF4444
    textDark: [92, 94, 100], // #5C5E64
    textLight: [113, 113, 122], // zinc-500
    bgLight: [247, 247, 247], // #F7F7F7
    lineColor: [236, 236, 236], // #ECECEC
  };

  // 1. Header (Light background, accented text)
  doc.setFillColor(COLORS.bgLight[0], COLORS.bgLight[1], COLORS.bgLight[2]);
  doc.rect(0, 0, 210, 30, "F"); // Reduced height from 45 to 30

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10); // Reduced from 12
  doc.setTextColor(COLORS.primaryGreen[0], COLORS.primaryGreen[1], COLORS.primaryGreen[2]);
  doc.text("SCREENING & ASSESSMENT INFORMATION", 15, 12);

  doc.setFontSize(16); // Reduced from 22
  doc.setTextColor(COLORS.textDark[0], COLORS.textDark[1], COLORS.textDark[2]);
  doc.text(`${data.studentName}'s Profile`, 15, 22);

  // 2. Diagnostic Status
  let y = 40; // Starts higher up
  doc.setFontSize(12); // Reduced from 14
  doc.setTextColor(COLORS.textDark[0], COLORS.textDark[1], COLORS.textDark[2]);
  doc.text("Diagnostic Status:", 15, y);

  doc.setFontSize(14); // Reduced from 16
  if (data.isAtRisk) {
    doc.setTextColor(COLORS.redAtRisk[0], COLORS.redAtRisk[1], COLORS.redAtRisk[2]);
  } else {
    doc.setTextColor(COLORS.primaryGreen[0], COLORS.primaryGreen[1], COLORS.primaryGreen[2]);
  }
  doc.text(data.isAtRisk ? "AT-RISK" : "TYPICAL", 55, y);

  if (data.confidence) {
    y += 6;
    doc.setFontSize(10); // Reduced from 12
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    doc.text(`Confidence: ${(data.confidence * 100).toFixed(1)}%`, 15, y);
  }

  // 3. Test Performance
  y += 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(COLORS.textDark[0], COLORS.textDark[1], COLORS.textDark[2]);
  doc.text(`Test Performance: ${data.assessmentTitle}`, 15, y);

  y += 6;
  doc.setFontSize(9); // Reduced from 10
  data.testPerformance.forEach((item) => {
    doc.setDrawColor(COLORS.lineColor[0], COLORS.lineColor[1], COLORS.lineColor[2]);
    doc.rect(15, y, 180, 8); // Reduced height from 12 to 8
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.textDark[0], COLORS.textDark[1], COLORS.textDark[2]);
    doc.text(item.label, 18, y + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    let rightText = `Score: ${item.display}`;
    if (item.efficiency !== undefined) {
      rightText += `   |   Efficiency: ${item.efficiency.toFixed(2)}`;
    }
    
    doc.text(rightText, 190, y + 5.5, { align: "right" });
    y += 10; // Increment reduced from 15
  });

  // 4. Decision Path
  if (data.decisionPathReadable) {
    y += 8;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(COLORS.textDark[0], COLORS.textDark[1], COLORS.textDark[2]);
    doc.text("Decision Path", 15, y);

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    doc.text(data.decisionPathReadable, 15, y);
    y += 10;
  }

  // 5. Domain Severity Scores
  if (data.domainSeverityScores) {
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(COLORS.textDark[0], COLORS.textDark[1], COLORS.textDark[2]);
    doc.text("Domain Severity Scores", 15, y);

    y += 8;
    doc.setFontSize(9);
    Object.entries(data.domainSeverityScores).forEach(([domain, score]) => {
      const numScore = score as number;
      if (numScore === 0) return; // Skip 0

      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
      doc.text(domain, 15, y);

      // Draw Bar
      const barX = 110;
      const barWidth = 60;
      const fillWidth = Math.min(numScore, 1) * barWidth;

      doc.setFillColor(COLORS.lineColor[0], COLORS.lineColor[1], COLORS.lineColor[2]);
      doc.rect(barX, y - 3, barWidth, 3, "F");

      doc.setFillColor(59, 130, 246); // blue-500
      if (fillWidth > 0) {
        doc.rect(barX, y - 3, fillWidth, 3, "F");
      }

      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.textDark[0], COLORS.textDark[1], COLORS.textDark[2]);
      doc.text(numScore.toFixed(3), barX + barWidth + 5, y);

      y += 8; // Increment reduced from 10
    });
  }

  // Save the PDF
  doc.save(`${data.studentName.replace(/ /g, "_")}_Classification_Report.pdf`);
}

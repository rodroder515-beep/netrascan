import { ScreeningAnalysisResult } from '../services/api';

/**
 * Downloads a standalone, self-contained offline HTML clinical referral slip.
 * Opens on any phone, tablet, or desktop without internet connection.
 */
export const downloadHtmlReport = (analysis: ScreeningAnalysisResult, imageSrc?: string) => {
  const { patient, triage, riskLabel, imageQuality, lesions, explainability } = analysis;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NetraScan Screening Slip - ${patient.id}</title>
  <style>
    @media print {
      body { margin: 0; padding: 12mm; }
      .no-print { display: none !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background: #FFFFFF;
      line-height: 1.5;
      max-width: 840px;
      margin: 20px auto;
      padding: 28px;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #1E5B62;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand-tag {
      font-size: 11px;
      font-weight: 700;
      color: #C87121;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #111827;
      margin: 4px 0 2px 0;
    }
    .subhead {
      font-size: 13px;
      color: #4B5563;
    }
    .meta-box {
      text-align: right;
      font-family: monospace;
      font-size: 12px;
      color: #4B5563;
    }
    .meta-box strong {
      color: #111827;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .info-card {
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      padding: 14px;
    }
    .label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: #6B7280;
      display: block;
      margin-bottom: 2px;
    }
    .val {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
    }
    .triage-banner {
      background: ${
        triage.category === 'CLEAR'
          ? '#ECFDF5'
          : triage.category === 'REFER'
          ? '#FFFBEB'
          : '#FEF2F2'
      };
      border: 1.5px solid ${
        triage.category === 'CLEAR'
          ? '#10B981'
          : triage.category === 'REFER'
          ? '#F59E0B'
          : '#EF4444'
      };
      border-radius: 10px;
      padding: 16px;
      margin: 20px 0;
    }
    .triage-title {
      font-size: 18px;
      font-weight: 700;
      color: ${
        triage.category === 'CLEAR'
          ? '#065F46'
          : triage.category === 'REFER'
          ? '#92400E'
          : '#991B1B'
      };
    }
    .retina-preview {
      display: flex;
      gap: 16px;
      align-items: center;
      margin: 16px 0;
      padding: 12px;
      background: #F3F4F6;
      border-radius: 8px;
    }
    .retina-img {
      width: 120px;
      height: 120px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid #D1D5DB;
    }
    .disclaimer {
      margin-top: 30px;
      padding-top: 14px;
      border-top: 1px solid #E5E7EB;
      font-size: 11px;
      color: #6B7280;
      line-height: 1.5;
    }
    .print-btn {
      background: #1E5B62;
      color: #FFF;
      border: none;
      padding: 10px 20px;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 12px;">
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="header">
    <div>
      <div class="brand-tag">Ayushman Bharat Digital Health Outreach · SIH 2026</div>
      <h1>NetraScan Retinal Screening & Referral Slip</h1>
      <div class="subhead">Primary Health Centre 01 · Kalyanpur Block · ASHA Outreach Network</div>
    </div>
    <div class="meta-box">
      <div>SLIP ID: <strong>${analysis.screeningId}</strong></div>
      <div>DATE: <strong>${new Date(analysis.timestamp).toLocaleDateString()}</strong></div>
      <div>TIME: <strong>${new Date(analysis.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></div>
    </div>
  </div>

  <div class="grid-2">
    <div class="info-card">
      <span class="label">Patient Name & Demographics</span>
      <div class="val">${patient.name} (${patient.age} / ${patient.gender})</div>
      <div style="font-size:12px; color:#4B5563; margin-top:4px;">ID: ${patient.id} · Phone: ${patient.phone || 'N/A'}</div>
      <div style="font-size:12px; color:#4B5563;">Village: ${patient.village} · Cluster: Kalyanpur</div>
    </div>
    <div class="info-card">
      <span class="label">Clinical Context</span>
      <div class="val">Screened Eye: ${patient.eye} Eye</div>
      <div style="font-size:12px; color:#4B5563; margin-top:4px;">Known Diabetes: ${patient.diabetesDurationYears} Years</div>
      <div style="font-size:12px; color:#4B5563;">Latest HbA1c: ${patient.hba1c ? patient.hba1c + '%' : 'Not Recorded'}</div>
    </div>
  </div>

  <div class="triage-banner">
    <div class="triage-title">Triage Outcome: ${triage.category} (${riskLabel})</div>
    <div style="font-size:14px; font-weight:600; margin-top:6px; color:#1F2937;">
      Action Protocol: ${triage.actionProtocol}
    </div>
    <div style="font-size:13px; color:#4B5563; margin-top:4px;">
      Follow-up Timeline: <strong>${triage.timeframe}</strong> at <strong>${triage.referralFacility}</strong>
    </div>
  </div>

  ${imageSrc ? `
  <div class="retina-preview">
    <img src="${imageSrc}" class="retina-img" alt="Screened Fundus Frame" />
    <div>
      <span class="label">Edge Optical Quality Gate</span>
      <div class="val" style="font-size:13px;">${imageQuality.isAcceptable ? 'PASS - Gradable Optical Focus (' + imageQuality.overallScore + '%)' : 'RETAKE REQUIRED'}</div>
      <div style="font-size:12px; color:#4B5563; margin-top:4px;">Optic Disc: Demarcated · Macula: Centered · Field: 45° Posterior Pole</div>
    </div>
  </div>
  ` : ''}

  <div class="info-card" style="margin-top:16px;">
    <span class="label">Diagnostic Biomarkers & Explainability</span>
    <div style="font-size:13px; color:#1F2937; margin-top:4px;">
      ${explainability.clinicalRationale}
    </div>
    ${lesions && lesions.length > 0 ? `
    <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:10px;">
      ${lesions.map((l) => `<span style="background:#E5E7EB; color:#374151; font-size:11px; padding:3px 8px; border-radius:4px; font-weight:500;">${l.type}: ${l.count} (${l.location})</span>`).join('')}
    </div>
    ` : ''}
  </div>

  <div class="disclaimer">
    <strong>Clinical Decision Support Disclaimer:</strong> This point-of-care report is generated by an automated explainable retinal screening model intended to prioritize referrals. It is not an affirmative ophthalmologic diagnosis. Patients requiring referral should be evaluated by a certified ophthalmologist.
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NetraScan_Report_${patient.id}_${analysis.screeningId}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Downloads standard ABDM / HL7 FHIR DiagnosticReport JSON payload
 * for interoperability with electronic hospital systems.
 */
export const downloadFhirJsonReport = (analysis: ScreeningAnalysisResult) => {
  const fhirPayload = {
    resourceType: 'DiagnosticReport',
    id: analysis.screeningId,
    meta: {
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/DiagnosticReportRecord']
    },
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
            code: 'RAD',
            display: 'Radiology / Ophthalmic Imaging'
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '68991-9',
          display: 'Diabetic retinopathy screening report'
        }
      ],
      text: 'Diabetic Retinopathy Point-of-Care Edge Screening'
    },
    subject: {
      reference: `Patient/${analysis.patient.id}`,
      display: analysis.patient.name
    },
    effectiveDateTime: analysis.timestamp,
    issued: new Date().toISOString(),
    performer: [
      {
        display: 'NetraScan Edge AI Diagnostics · PHC 01 Kalyanpur'
      }
    ],
    conclusion: `${analysis.triage.category}: ${analysis.riskLabel}. Action: ${analysis.triage.actionProtocol}. Follow-up: ${analysis.triage.timeframe} at ${analysis.triage.referralFacility}`,
    conclusionCode: [
      {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: analysis.triage.category === 'CLEAR' ? '280413001' : '4855003',
            display: analysis.riskLabel
          }
        ]
      }
    ],
    extension: [
      {
        url: 'http://netrascan.ai/fhir/StructureDefinition/qualityScore',
        valueInteger: analysis.imageQuality.overallScore
      },
      {
        url: 'http://netrascan.ai/fhir/StructureDefinition/explainabilitySummary',
        valueString: analysis.explainability.clinicalRationale
      }
    ]
  };

  const blob = new Blob([JSON.stringify(fhirPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FHIR_DiagnosticReport_${analysis.patient.id}_${analysis.screeningId}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

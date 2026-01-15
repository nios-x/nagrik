import nodemailer from "nodemailer"

export async function sendAlertEmail({
    summary,
    reports,
}: {
    summary: string
    reports: any
}) {
    // Validate required environment variables
    if (!process.env.ALERT_EMAIL || !process.env.ALERT_EMAIL_PASSWORD || !process.env.ADMIN_EMAIL) {
        console.warn("Email configuration missing. Skipping alert email. Required: ALERT_EMAIL, ALERT_EMAIL_PASSWORD, ADMIN_EMAIL")
        return
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.ALERT_EMAIL,
                pass: process.env.ALERT_EMAIL_PASSWORD,
            },
        })

        const latitude = reports[0]?.latitude
        const longitude = reports[0]?.longitude
        const googleMapsUrl = latitude && longitude 
            ? `https://www.google.com/maps?q=${latitude},${longitude}`
            : "#"

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.7;
            color: #1f2937;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .email-wrapper {
            max-width: 650px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 3s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }
        .header-content {
            position: relative;
            z-index: 1;
        }
        .header-icon {
            font-size: 48px;
            margin-bottom: 15px;
            display: block;
            animation: shake 0.5s ease-in-out infinite;
        }
        @keyframes shake {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(5deg); }
        }
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            letter-spacing: -0.5px;
        }
        .header-subtitle {
            font-size: 16px;
            opacity: 0.95;
            font-weight: 500;
        }
        .alert-badge {
            display: inline-block;
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            color: #991b1b;
            padding: 12px 24px;
            border-radius: 50px;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 25px auto;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
            border: 2px solid rgba(220, 38, 38, 0.1);
        }
        .content {
            padding: 40px 35px;
        }
        .greeting {
            font-size: 18px;
            color: #374151;
            margin-bottom: 20px;
            font-weight: 500;
        }
        .intro-text {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
            line-height: 1.8;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .info-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .info-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .info-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 600;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        .info-value {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
        }
        .severity-badge {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .severity-high {
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            color: #991b1b;
            box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
        }
        .severity-medium {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            color: #92400e;
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
        }
        .severity-low {
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            color: #065f46;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
        }
        .location-card {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            padding: 25px;
            border-radius: 12px;
            border: 2px solid #3b82f6;
            margin: 25px 0;
            text-align: center;
        }
        .location-coords {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 15px;
            font-family: 'Courier New', monospace;
        }
        .map-link {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
            transition: all 0.3s ease;
            border: none;
        }
        .map-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
        }
        .summary-section {
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            border: 2px solid #fbbf24;
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
            box-shadow: 0 4px 12px rgba(251, 191, 36, 0.15);
        }
        .summary-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        .summary-icon {
            font-size: 24px;
            margin-right: 12px;
        }
        .summary-section h3 {
            margin: 0;
            color: #92400e;
            font-size: 20px;
            font-weight: 700;
        }
        .summary-text {
            color: #78350f;
            font-size: 15px;
            line-height: 1.8;
            margin-top: 15px;
        }
        .reports-section {
            margin: 35px 0;
        }
        .reports-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        .reports-icon {
            font-size: 24px;
            margin-right: 12px;
        }
        .reports-section h3 {
            margin: 0;
            color: #1e293b;
            font-size: 20px;
            font-weight: 700;
        }
        .reports-count {
            background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
            color: #4338ca;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 600;
            margin-left: 10px;
        }
        .report-item {
            background: white;
            padding: 20px;
            margin: 15px 0;
            border-left: 4px solid #3b82f6;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            transition: all 0.2s ease;
        }
        .report-item:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }
        .report-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .report-number {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 14px;
            margin-right: 12px;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
        .report-text {
            color: #374151;
            font-size: 15px;
            line-height: 1.7;
            flex: 1;
        }
        .urgent-notice {
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            border: 2px solid #ef4444;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }
        .urgent-notice p {
            color: #991b1b;
            font-size: 17px;
            font-weight: 700;
            margin: 0;
        }
        .footer {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer-logo {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 8px;
        }
        .footer-text {
            color: #64748b;
            font-size: 14px;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            .info-grid {
                grid-template-columns: 1fr;
            }
            .header {
                padding: 30px 20px;
            }
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
            <div class="header-content">
                <span class="header-icon">🚨</span>
                <h1>Critical Public Safety Alert</h1>
                <p class="header-subtitle">Repeated Incident Reports Detected</p>
            </div>
        </div>
        
        <div class="content">
            <div class="alert-badge">⚠️ Action Required</div>
            
            <p class="greeting">Dear Administrator,</p>
            <p class="intro-text">
                This is to formally notify you that <strong>multiple reports</strong> concerning the same public safety issue have been detected in your area. Immediate attention is recommended.
            </p>
            
            <div class="info-grid">
                <div class="info-card">
                    <div class="info-label">📁 Category</div>
                    <div class="info-value">${reports[0]?.category || "N/A"}</div>
                </div>
                <div class="info-card">
                    <div class="info-label">⚡ Severity</div>
                    <div class="info-value">
                        <span class="severity-badge severity-${(reports[0]?.severity || "").toLowerCase()}">
                            ${reports[0]?.severity || "N/A"}
                        </span>
                    </div>
                </div>
            </div>
            
            ${latitude && longitude ? `
            <div class="location-card">
                <div class="info-label" style="margin-bottom: 10px;">📍 Incident Location</div>
                <div class="location-coords">
                    ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
                </div>
                <a href="${googleMapsUrl}" target="_blank" class="map-link">
                    🗺️ Open in Google Maps
                </a>
            </div>
            ` : ''}
            
            <div class="summary-section">
                <div class="summary-header">
                    <span class="summary-icon">🤖</span>
                    <h3>AI-Generated Incident Summary</h3>
                </div>
                <div class="summary-text">
                    ${summary.replace(/\n/g, '<br>')}
                </div>
            </div>
            
            <div class="reports-section">
                <div class="reports-header">
                    <span class="reports-icon">📋</span>
                    <h3>Citizen Reports</h3>
                    <span class="reports-count">${reports.length} Reports</span>
                </div>
                ${reports.map((r: any, idx: number) => `
                    <div class="report-item">
                        <div class="report-header">
                            <div class="report-number">${idx + 1}</div>
                            <div class="report-text">${r.description || "N/A"}</div>
                        </div>
                    </div>
                `).join("")}
            </div>
            
            <div class="urgent-notice">
                <p>⚠️ Please review this matter immediately</p>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-logo">Smart City Emergency Monitoring System</div>
            <div class="footer-text">Automated Alert Notification Service</div>
        </div>
    </div>
</body>
</html>
        `

        const textContent = `
Dear Administrator,

This is to formally notify you that multiple reports concerning the same public safety issue have been detected.

Category       : ${reports[0]?.category || "N/A"}
Severity       : ${reports[0]?.severity || "N/A"}
Location       : ${latitude && longitude ? `Latitude ${latitude}, Longitude ${longitude}\nView on Google Maps: ${googleMapsUrl}` : "N/A"}

AI-Generated Summary:
${summary}

Sample Reports:
${reports.map((r: any, idx: number) => `${idx + 1}. ${r.description || "N/A"}`).join("\n")}

Please review this matter immediately.

Regards,
Smart City Emergency Monitoring System
        `

        const mailOptions = {
            from: `"Smart City Alert System" <${process.env.ALERT_EMAIL}>`,
            to: process.env.ADMIN_EMAIL,
            subject: "🚨 Critical Public Safety Alert: Repeated Reports Detected",
            text: textContent,
            html: htmlContent,
        }

        await transporter.sendMail(mailOptions)
        console.log("Alert email sent successfully")
    } catch (error) {
        console.error("Failed to send alert email:", error)
        // Don't throw - email failure shouldn't break the API
    }
}

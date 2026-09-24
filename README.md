# SME Cyber Exposure Dashboard 🛡️

A lightweight, real-time threat intelligence and exposure monitoring dashboard designed for Small and Medium Enterprises (SMEs). This tool allows organizations to instantly assess their external attack surface by integrating OSINT data and generating actionable security recommendations.

## 🚀 Features
* **Real-Time Asset Scanning:** Integrates with the Shodan API to extract open ports, running services, and exposed OS details.
* **Vulnerability Assessment (CVE):** Automatically cross-references exposed services with known vulnerabilities.
* **Dynamic Risk Scoring:** Uses a custom risk calculator to evaluate findings and assign a severity level (Secured, Low, Medium, Critical) based on CVSS principles.
* **Actionable Recommendations:** Provides immediate, human-readable mitigation steps (e.g., hiding RDP behind a VPN, closing SMB ports).
* **Historical Tracking:** Logs all scans in a MongoDB database, allowing security teams to track exposure over time.

## 🛠️ Tech Stack
* **Frontend:** React.js, Tailwind CSS v4, Vite, Lucide Icons
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Atlas / Mongoose)
* **APIs:** Shodan Developer API

## ⚙️ Installation & Usage
1. Clone the repository: `git clone https://github.com/your-username/sme-cyber-dashboard.git`
2. Install dependencies for both frontend and backend: `npm install`
3. Create a `.env` file in the `backend` directory and add your credentials:
   ```env
   PORT=5000
   SHODAN_API_KEY=your_api_key_here
   MONGO_URI=your_mongodb_connection_string
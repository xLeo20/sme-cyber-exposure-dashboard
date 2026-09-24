const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
    ip: { type: String, required: true },
    organization: String,
    os: String,
    ports: [Number],
    vulns: [String],
    shodan_last_update: String,
    riskScore: Number,
    riskLevel: String,
    recommendations: [String],
    scan_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scan', scanSchema);
const express = require('express');
const router = express.Router();

// Mock market alerts — replace with DB/external feed when available
const ALERTS = [
  { id: 1, message: "Tomato price increased by ₹12/kg in Chennai market", time: "2h ago", severity: "info" },
  { id: 2, message: "Rice MSP revised upward by ₹50/quintal", time: "5h ago", severity: "info" },
  { id: 3, message: "Early Blight outbreak reported in Coimbatore district", time: "1d ago", severity: "critical" },
];

router.get('/', (req, res) => {
  res.json({
    alerts: ALERTS.length,
    latest: ALERTS[0]?.message ?? "No new alerts",
    items: ALERTS,
  });
});

module.exports = router;

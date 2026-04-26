const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory storage (production me database use karein)
let dustbins = {};

// API: NodeMCU se data receive
app.post('/api/update', (req, res) => {
    const { id, fill, moisture, wet, lat, lng, location } = req.body;
    if (!id) return res.status(400).json({ error: 'Bin ID required' });

    dustbins[id] = {
        id,
        location: location || `Bin ${id}`,
        lat: lat || 28.62 + Math.random() * 0.02,
        lng: lng || 77.21 + Math.random() * 0.02,
        fill: fill || 0,
        moisture: moisture || 0,
        wet: wet || false,
        lastUpdate: new Date().toISOString(),
        status: fill > 90 ? 'full' : fill > 60 ? 'medium' : 'normal'
    };
    console.log(`Updated ${id}: fill=${fill}%`);
    res.json({ success: true });
});

// API: Dashboard ke liye sab data
app.get('/api/bins', (req, res) => {
    res.json(Object.values(dustbins));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

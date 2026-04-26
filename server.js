const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let dustbins = {};
let commands = {};   // command queue

// NodeMCU se data receive
app.post('/api/update', (req, res) => {
    const { id, fill, moisture, wet, lat, lng, location } = req.body;
    if (!id) return res.status(400).json({ error: 'Bin ID required' });
    dustbins[id] = {
        id,
        location: location || `Bin ${id}`,
        lat: lat || 28.62,
        lng: lng || 77.21,
        fill: fill || 0,
        moisture: moisture || 0,
        wet: wet || false,
        lastUpdate: new Date().toISOString(),
        status: fill > 90 ? 'full' : fill > 60 ? 'medium' : 'normal'
    };
    console.log(`Updated ${id}: fill=${fill}%`);
    res.json({ success: true });
});

// Dashboard ke liye sab bins
app.get('/api/bins', (req, res) => {
    res.json(Object.values(dustbins));
});

// Dashboard se control command (queue)
app.post('/api/control', (req, res) => {
    const { id, command } = req.body;
    if (!id || !command) return res.status(400).json({ error: 'id and command required' });
    commands[id] = command;
    console.log(`Command queued: ${id} -> ${command}`);
    res.json({ success: true });
});

// NodeMCU command check kare
app.get('/api/command', (req, res) => {
    const binId = req.query.bin;
    if (!binId) return res.status(400).json({ error: 'bin parameter required' });
    const cmd = commands[binId] || null;
    if (cmd) {
        delete commands[binId];
    }
    res.json({ command: cmd });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

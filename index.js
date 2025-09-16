import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
const port = 8080;

const app = express();
app.use(cors());
const API_KEY = 'AIzaSyDB9-XXx4xQTBRNX5ZOSfxBwXWhmtaYmtc';

// Configure base map URL
const MAP_BASE_URL = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}`;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Cultural events data (you can move this to a separate JSON file later)
const culturalEvents = [
    {
        id: 1,
        name: "Losoong",
        date: "December",
        description: "Sikkimese New Year celebration marking the end of harvest season",
        traditions: ["Masked dances", "Traditional sports", "Archery competitions"],
        location: "Throughout Sikkim",
        category: "festival"
    },
    {
        id: 2,
        name: "Saga Dawa",
        date: "May-June",
        description: "Buddhist festival celebrating Buddha's enlightenment",
        traditions: ["Prayer ceremonies", "Butter lamp offerings", "Processions"],
        location: "Buddhist monasteries",
        category: "religious"
    },
    {
        id: 3,
        name: "Pang Lhabsol",
        date: "August-September",
        description: "Traditional festival honoring Mount Khangchendzonga",
        traditions: ["Warrior dances", "Religious ceremonies", "Cultural performances"],
        location: "Gangtok",
        category: "festival"
    }
];

// Root route
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: './public' });
});

// Map route handler
app.get('/map', (req, res) => {
    const { q = 'Sikkim Monasteries', center = '27.3516,88.3239', zoom = '10' } = req.query;
    
    const mapData = {
        mapUrl: `${MAP_BASE_URL}&q=${encodeURIComponent(q)}&center=${center}&zoom=${zoom}`,
        title: 'Interactive Monastery Map',
        description: 'Explore Sikkim\'s monasteries with our interactive map'
    };
    
    res.json(mapData);
});

// Specific monastery route
app.get('/monastery/:id', (req, res) => {
    const monasteryId = req.params.id;
    // Add monastery-specific logic here
    res.json({ message: `Monastery ${monasteryId} details` });
});

// Calendar routes
app.get('/api/calendar', (req, res) => {
    res.json(culturalEvents);
});

app.get('/api/calendar/:id', (req, res) => {
    const event = culturalEvents.find(e => e.id === parseInt(req.params.id));
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
});

app.get('/api/calendar/category/:category', (req, res) => {
    const events = culturalEvents.filter(e => e.category === req.params.category);
    res.json(events);
});

// Search events
app.get('/api/calendar/search', (req, res) => {
    const { q } = req.query;
    if (!q) return res.json(culturalEvents);
    
    const filteredEvents = culturalEvents.filter(event => 
        event.name.toLowerCase().includes(q.toLowerCase()) ||
        event.description.toLowerCase().includes(q.toLowerCase())
    );
    res.json(filteredEvents);
});

// Add new event (protected route - add authentication later)
app.post('/api/calendar', (req, res) => {
    const newEvent = {
        id: culturalEvents.length + 1,
        name: req.body.name,
        date: req.body.date,
        description: req.body.description,
        traditions: req.body.traditions || [],
        location: req.body.location,
        category: req.body.category
    };
    
    culturalEvents.push(newEvent);
    res.status(201).json(newEvent);
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Map API endpoint: http://localhost:${port}/map`);
});
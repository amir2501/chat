import express from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
const port = process.env.PORT || 8000;
const server = http.createServer(app); // Create HTTP server for WebSockets
const io = new Server(server);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const users = {
    "1@gmail.com": { id: uuidv4(), email: "1@gmail.com", password: "amir" },
    "2@gmail.com": { id: uuidv4(), email: "2@gmail.com", password: "amir" }
};

const messages = {}; // Temporary storage for chat messages

// Authentication Page
app.get('/', (req, res) => {
    res.render('auth');
});

// Login/Register Routes (Same as before)
app.post('/register', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send("Email and password are required");

    if (users[email]) return res.status(400).send("User already exists");

    users[email] = { id: uuidv4(), email, password };
    res.redirect(`/index?user=${email}`);
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password || !users[email] || users[email].password !== password) {
        return res.status(400).send("Invalid email or password");
    }
    res.redirect(`/index?user=${email}`);
});

// User List Page
app.get('/index', (req, res) => {
    const currentUser = req.query.user;
    if (!currentUser || !users[currentUser]) return res.redirect('/');

    const otherUsers = Object.values(users).filter(user => user.email !== currentUser);
    res.render('index', { users: otherUsers, currentUser });
});

// Chat Page
app.get('/chat', (req, res) => {
    const { user, to } = req.query;
    if (!user || !to || !users[user] || !users[to]) return res.redirect('/index');

    const chatKey = [user, to].sort().join('-');
    if (!messages[chatKey]) messages[chatKey] = [];

    res.render('chat', { currentUser: user, otherUser: to, chatMessages: messages[chatKey] });
});

// WebSocket Connection for Real-time Messaging
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinChat', ({ sender, receiver }) => {
        const chatKey = [sender, receiver].sort().join('-');
        socket.join(chatKey);
    });

    socket.on('sendMessage', ({ sender, receiver, message }) => {
        const chatKey = [sender, receiver].sort().join('-');

        if (!messages[chatKey]) messages[chatKey] = [];
        messages[chatKey].push({ sender, message });

        // Emit message to both users in the chat
        io.to(chatKey).emit('receiveMessage', { sender, message });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(port, () => {
    console.log(`Local telegram app is running at http://localhost:${port}`);
});
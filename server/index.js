const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const {Server} = require("socket.io");
const MongoClient = require("mongodb").MongoClient;
const mongodbSaveMessage = require("./services/mongo-save-messages");
const MongoGetMessages = require('./services/mongo-get-messages');

app.use(cors());

const server = http.createServer(app);

const CONNECTION_STRING = "mongodb+srv://antosspan:antek12345@realtimechat.jtsrc.mongodb.net/?retryWrites=true&w=majority&appName=realtimechat"
const DATABASE = "realtimechat"

let database

async function connectToMongo(){
    try{
        console.log("Connecting to mongodb...")
        const client = await MongoClient.connect(CONNECTION_STRING)
        console.log("Database connected succesfully")
        database = client.db(DATABASE)

    }catch (error){
        console.log("error" + error)
    }
}

app.get("/", (req, res) => {
    res.send("Hello world")
})
app.get("/test-connection", (req, res) => {
    if (database){
        res.status(200).send("Polaczenie z baza dziala")
    }else{
        res.status(500).send("blad z laczeniu z baza danych")
    }
})

const io = new Server(server , {
    cors: {
        origin: "http://localhost:3000",
        methods: ['GET', 'POST'],
    },
});

const CHAT_BOT = 'chat-bot'
let chatroom = '';
let allUsers = [];

io.on('connection', (socket) => {
    console.log(`User connected ${socket.id}`);

    socket.on('join_room', (data) => {
        const { username, room } = data;
        socket.join(room);

        let __createdtime__ = Date.now();

        socket.to(room).emit('receive_message', {
            message: `${username} has joined the chat room`,
            username: CHAT_BOT,
            __createdtime__,
        });

        socket.emit('receive_message', {
            message: `Welcome ${username}`,
            username: CHAT_BOT,
            __createdtime__,
        });

        chatroom = room;
        allUsers.push({ id: socket.id, username, room });
        const chatRoomUsers = allUsers.filter((user) => user.room === room);
        socket.to(room).emit('chatroom_users', chatRoomUsers);
        socket.emit('chatroom_users', chatRoomUsers);
    });

    socket.on('send_message', async (data) => { // Funkcja asynchroniczna
        const { message, username, room, __createdtime__ } = data;
        io.in(room).emit('receive_message', data);
        try {
            await mongodbSaveMessage(database, message, username, room, __createdtime__);
            console.log("Wiadomość zapisana w MongoDB");
        } catch (error) {
            console.log("Błąd z zapisywaniem wiadomości", error);
        }
    });

    // Pobieranie ostatnich 10 wiadomości
    socket.on('get_last_10_messages', async (room) => {
        try {
            const last10messages = await MongoGetMessages(database, room);
            socket.emit('last_10_messages', last10messages);
        } catch (err) {
            console.log("Błąd w pobieraniu wiadomości", err);
        }
    });
});

connectToMongo();



server.listen(4000, () => 'Server is running on port 4000')

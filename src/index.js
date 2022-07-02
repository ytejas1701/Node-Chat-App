import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { generateMessage } from './utils/messages.js';
import {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} from './utils/users.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port  = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '../public')

app.use(express.static(publicPath));

app.get('/', (req, res)=>{
    res.render('index');
});

debugger
io.on('connection', (socket)=>{
    console.log('new connection');

    socket.on('join', (options, callback)=>{
        const { error, user } = addUser({
            id: socket.id,
            ...options
        });
        if(error){
            return callback(error);
        }
        socket.join(user.room);
        socket.emit('message', generateMessage({info:'Welcome '+user.username}));
        socket.broadcast.to(user.room).emit('message', generateMessage({info: user.username+' joined'}));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room),
        });
        callback();    
    });

    socket.on('message', (message, sent)=>{
        const user = getUser(socket.id);
        if(user){
            io.to(user.room).emit('message', generateMessage({text:message, username:user.username}));
            sent();
        }
    });

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', generateMessage({info: user.username+' left'}));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
            }
    })
});

server.listen(port, () => {
});
const socket = io();

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');
const $messages = document.querySelector('#messages');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });
socket.on('message', (message)=>{
    console.log(message.text);
    const html = Mustache.render(messageTemplate, {
        createdAt: moment(message.createdAt).format('HH:MM'), 
        message: message.text, 
        username:message.username, 
        info:message.info
    });
    $messages.insertAdjacentHTML('beforebegin', html); 
});

socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room, 
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled');
    const message = e.target.elements.message.value;
    socket.emit(
        'message', 
        message, 
        ()=>{
            $messageFormButton.removeAttribute('disabled');
            $messageFormInput.value = '';
            $messageFormInput.focus();
            console.log('----',message)
        });
});

socket.emit(
    'join', 
    { username, room },
    (error)=>{
        if(error){alert(error);
        location.href = '/';}    
    }
    );
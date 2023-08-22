const express = require('express')
const { v4: uuidv4 } = require('uuid')
const engine = require('js-chess-engine')
const socketio = require('socket.io')
const cors = require('cors')
const http = require('http')
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('static'))

const io = socketio(http.createServer(app), {
	cors : {
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST']
	}
})

let sockets = new Map();
let games = [];

class Game{
	constructor(code, player){
		this.code = code
		this.game = new engine.Game();
		this.players = []
		this.players.push(player);
		this.started = false;
		this.white = player;
		this.ended = false;
		this.black = null;
	}
	end(){
		console.log('game ended')
		this.ended = true;
	}
	add_player(player){
		if(this.ended) return false;
		if(this.players.length < 2){
			this.players.push(player)
			this.black = player;
			this.start();
			return true;
		}
		return false;
	}
	start(){
		this.started = true;
		this.start_time = new Date();
		if(!sockets.get(this.white) && !sockets.get(this.black)){
			this.end();
		}
		else if(!sockets.get(this.white)){
			sockets.get(this.black).emit('message', 'player disconnected');
			return;
		}
		else if(!sockets.get(this.black)){
			sockets.get(this.white).emit('message', 'player disconnected');
			return;
		}
		else{
			sockets.get(this.white).emit('game-update', this.game);
			sockets.get(this.black).emit('game-update', this.game);
		}
	}
	move(from, to){
		try{this.game.move(from, to);}catch{}
		console.log('here')
		if(!sockets.get(this.white) && !sockets.get(this.black)){
			this.end();
		}
		else if(!sockets.get(this.white)){
			sockets.get(this.black).emit('message', 'player disconnected');
			return;
		}
		else if(!sockets.get(this.black)){
			sockets.get(this.white).emit('message', 'player disconnected');
			return;
		}
		else{
			this.game.move(from, to);
			sockets.get(this.white).emit('game-update', this.game);
			sockets.get(this.black).emit('game-update', this.game);
		}
	}
}

io.on('connection', sock => {
	sockets.set(sock.toString(), sock);
	sock.on('game-join', (code) => {
		let joined = false;
		for(let i = 0; i < games.length; i++){
			if(games[i].code === code){
				if(games[i].add_player(sock.toString())){
					let gcode = games[i].code;
					let ggame = games[i].game;
					sock.emit('game-joined', { code: gcode, game: ggame })
					joined = true;
				}
			}
		}
		if(!joined) sock.emit('message', 'No game with the given code') 
	})
	sock.on('game-move', ({ code, move }) => {
		for(let i = 0; i < games.length; i++){
			if(games[i].code === code){
				games[i].game.printToConsole()
				if(games[i].started === true){
					try{
						games[i].move(move[0], move[1]);
					}
					catch{
				
					}
				}
			}
		}
	})
	sock.on('game-moves', ({ code, square }) => {
		for(let i = 0; i < games[i].length; i++){
			if(games[i].code === code){
				return games[i].game.moves(square);
			}
		}
	})
	sock.on('game-create', () => {
		let code = uuidv4();
		let new_game = new Game(code, sock.toString());
		games.push(new_game);
		let game = new_game.game;
		sock.emit('game-screate', { code, game });
	})
})
io.listen(5001)
app.listen(5000, () => {
	console.log('5000')
})
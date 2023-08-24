const express = require('express')
const { v4: uuidv4 } = require('uuid')
const engine = require('js-chess-engine')
const socketio = require('socket.io')
const cors = require('cors')
const http = require('http')
const app = express()

app.use(express.json())
app.use(cors({
	origin: '*'
}))
app.use(express.urlencoded({ extended: false }))
app.use(express.static('static'))

const io = socketio(http.createServer(app), {
	cors : {
		origin: '*',
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
		sockets.get(this.white).emit('message', 'white');
	}
	end(){
		this.ended = true;
		if(this.game.exportJson()['turn'] === 'black'){
			this.winner = 'white';
		}
		else if(this.game.exportJson()['turn'] === 'white'){
			this.winner = 'black';
		}
		try{
			sockets.get(this.white).emit('message', `Game ended ${this.winner} wins!`);
			sockets.get(this.black).emit('message', `Game ended ${this.winner} wins!`);
		}
		catch{

		}
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
			sockets.get(this.black).emit('message', 'black')
		}
	}
	move(from, to){
		if(!sockets.get(this.white) && !sockets.get(this.black)){
			this.end();
			return;
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
			try{
				this.game.move(from, to);
			}catch{}
			sockets.get(this.white).emit('game-update', this.game);
			sockets.get(this.black).emit('game-update', this.game);
			if(this.game.exportJson().isFinished){
				
				this.end();
			}
		}
	}
}

io.on('connection', sock => {
	sockets.set(sock.id, sock);
	sock.on('disconnect', () => {
		sockets.set(sock.id, null);
	})
	sock.on('game-join', (code) => {
		let joined = false;
		for(let i = 0; i < games.length; i++){
			if(games[i].code === code){
				if(games[i].add_player(sock.id)){
					let gcode = games[i].code;
					let ggame = games[i].game;
					sock.emit('game-joined', { code: gcode, game: ggame })
					joined = true;
				}
			}
		}
		if(!joined) sock.emit('message', 'No game with the given code') 
	})
	sock.on('game-move', (code, move) => {
		for(let i = 0; i < games.length; i++){
			if(games[i].code === code){
				let next = games[i].game.board.configuration.turn
				if(games[i].white === sock.id && next === 'white'){
					games[i].move(move[0], move[1])
				}
				else if(games[i].black === sock.id && next === 'black'){
					games[i].move(move[0], move[1])
				}
			}
		}
	})
	sock.on('game-moves', (code, square) => {
		for(let i = 0; i < games.length; i++){
			if(games[i].code === code){
				sock.emit('legal-moves', games[i].game.moves(square) )
			}
		}
	})
	sock.on('game-create', () => {
		let code = uuidv4().toString().split('-')[0];
		let new_game = new Game(code, sock.id);
		games.push(new_game);
		let game = new_game.game;
		sock.emit('game-screate', { code, game });
	})
})
io.listen(5001)
app.listen(5000, () => {
	console.log('5000')
})

const io = require('socket.io-client')
function fenToJson(ufen){
	let fen = ufen.split(' ')[0];
	let rank = 8;
	let ans = new Map();
	let files = 'ABCDEFGH'
	let file = 0;
	for(let i = 0; i < fen.length; i++){
		if(fen[i] == '/'){
			rank--;
			file = 0;
		}
		else if(isNaN(fen[i]) == false){
			file = (file + parseInt(fen[i])) % 8;
		}
		else{
			ans.set(`${files[file]}${rank}`, `${fen[i]}`);
			file++;
		}
	}
	let squares = []
	for(let i = 8; i > 0; i--){
		for(let j = 0; j < 8; j++){
			squares.push({
				id: `${files[j]}${i}`,
				piece: ans.get(`${files[j]}${i}`) ? ans.get(`${files[j]}${i}`) : ''
			})
		}
	}
	return squares;
}
const pieces = new Map()
pieces.set('p', 'black-pawn.png');
pieces.set('P', 'white-pawn.png');
pieces.set('r', 'black-rook.png');
pieces.set('R', 'white-rook.png');
pieces.set('q', 'black-queen.png');
pieces.set('Q', 'white-queen.png');
pieces.set('k', 'black-king.png');
pieces.set('K', 'white-king.png');
pieces.set('n', 'black-knight.png');
pieces.set('N', 'white-knight.png');
pieces.set('b', 'black-bishop.png');
pieces.set('B', 'white-bishop.png');
const serverUrl = 'http://localhost:5001/'

const createSocket = () => {
	const socket = io(serverUrl)
	return socket
}

const jsonToSquares = (game) => {
	let pieces = game['board']['configuration']['pieces'];
	let files = 'ABCDEFGH'
	let ans = []
	for(let rank = 8; rank > 0; rank--){
		for(let file = 0; file < 8; file++){
			let square = `${files[file]}${rank}`;
			if(pieces[square] !== undefined){
				ans.push({
					id: square,
					piece: pieces[square]
				})
			}
			else{
				ans.push({
					id: square,
					piece: ''
				})
			}
		}
	}
	return ans;
}

module.exports = { fenToJson, pieces, createSocket, jsonToSquares };

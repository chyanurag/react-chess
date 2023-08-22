import React, { useState, useEffect } from 'react';
import { jsonToSquares, pieces,  createSocket } from './util';

let files = 'ABCDEFGH'
const Square = ({ id, piece, handleSelect }) => {
	const isWhite = (files.indexOf(id[0]) + parseInt(id[1])) % 2 === 0;
	return(
		<div className="square" style={{backgroundColor : isWhite ? '#ffffff' : '#93bf56'}} id={`square-${id}`} onClick={() => handleSelect(id)}>
			{piece && <img src={`http://localhost:5000/imgs/${pieces.get(piece)}`}/>}
		</div>
	)
}

const Board = ({ squares, handleSelect, handleDeselect }) => {
	return(
		<div id="board">
			{squares.map(square => <Square handleDeselect={handleDeselect} handleSelect={handleSelect} piece={square.piece} key={square.id} id={square.id}/>)}
		</div>
	)
}

const JoinGame = ({ handleJoin, handleBack }) => {
	const [code, setCode] = useState('');
	return (
		<div className="game-join">
			<input type="text" name="code" value={code} onChange={e => setCode(e.target.value)}/>
			<button onClick={() => handleJoin(code)}>Join</button>
			<button onClick={handleBack}>Back</button>
		</div>
	)
}

const App = () => {
	const [squares, setSquares] = useState([]);
	const [started, setStarted] = useState(false);
	const [showJoin, setShowJoin] = useState(false);
	const [socket, setSocket] = useState(null);
	const [game, setGame] = useState(null);
	const [message, setMessage] = useState(null);
	const [waiting, setWaiting] = useState(false);
	const [code, setCode] = useState(null);
	const [selected, setSelected] = useState(null);
	const [prevs, setPrev] = useState(null);
	const [moves, setMoves] = useState([]);

	useEffect(() => {
		if(message){
			console.log('new message : ' + message)
		}
	}, [message])

	useEffect(() => {
		if(game) setSquares(jsonToSquares(game))
	}, [game])

	const handleJoin = (code) => {
				if(code !== ''){
			const sock = createSocket();
			sock.on('game-joined', ({code, game}) => {
				setCode(code);
				setGame(game);
				setShowJoin(false);
				if(!started) setStarted(true);
			})
			sock.on('game-update', game => {
				setGame(game)
			});
			sock.emit('game-join', code);
			sock.on('message', msg => setMessage(msg))
			setSocket(sock);
		}
	}

	if(showJoin){
		return <JoinGame handleBack={() => setShowJoin(false)} handleJoin={handleJoin}/>
	}

	const handleSelect = (id) => {
		if(moves.length > 0){
			for(let i = 0; i < moves.length; i++){
				document.querySelector(`#square-${moves[i]}`).style.border = '1px solid black';
			}
			setMoves([]);
		}
		if(selected){
			document.querySelector(`#square-${selected}`).style.border = '1px solid black';
			socket.emit('game-move', code, [selected, id]);
			setSelected(null);
		}
		else{
			setSelected(id)
			document.querySelector(`#square-${id}`).style.border = '5px solid green';
			// highlight legal moves
			socket.emit('game-moves', code, id)
			socket.on('legal-moves', cmoves => {
				if(moves.length > 0){
					for(let i = 0; i < moves.length; i++){
						document.querySelector(`#square-${moves[i]}`).style.border = '1px solid black';
					}
				}
				setMoves(cmoves);
				for(let i = 0; i < cmoves.length; i++){
					document.querySelector(`#square-${cmoves[i]}`).style.border = '3px solid green';
				}
			})
			setSocket(socket);
		}
	}

	const handleStart = () => {
		const sock = createSocket();
		sock.emit('game-create');
		sock.on('game-screate', ({ code, game }) => {
			setCode(code)
			setWaiting(true);
			setGame(game);
			setMessage('waiting for other player')
		})
		sock.on('game-update', (game) => {
			setWaiting(false);
			if(!started) setStarted(true);
			setGame(game);
		})
		sock.on('message', msg => {
			console.log(msg)
		})
		setSocket(sock);
	}
	if(waiting){
		return(
			<>
				<Board squares={squares} handleSelect={handleSelect}/>
				<h1>Game code : {code}</h1>
				<h3>Waiting for other players</h3>
			</>
		)
	}
	if(started){
		return(
			<Board squares={squares} handleSelect={handleSelect}/>
		)
	}
	return(
		<>
			<button onClick={handleStart}>Start Game</button>
			<button onClick={() => setShowJoin(true)}>Join Game</button>
		</>
	)
}

export default App;

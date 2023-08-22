import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { fenToJson, jsonToSquares, pieces,  createSocket } from './util';

const Square = ({ id, piece, handleSelect }) => {
	return(
		<div className="square" id={`square-${id}`} onClick={() => handleSelect(id)}>
			{piece && <img src={`http://localhost:5000/imgs/${pieces.get(piece)}`}/>}
		</div>
	)
}

const Board = ({ squares, handleSelect }) => {
	return(
		<div id="board">
			{squares.map(square => <Square handleSelect={handleSelect} piece={square.piece} key={square.id} id={square.id}/>)}
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
	const [from, setFrom] = useState(null);
	const [to, setTo] = useState(null);

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
			setSocket(sock);
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
		}
	}

	if(showJoin){
		return <JoinGame handleBack={() => setShowJoin(false)} handleJoin={handleJoin}/>
	}

	const handleSelect = (id) => {
		if(selected){
			document.querySelector(`#square-${selected}`).style.border = '1px solid grey';
			setSelected(id);
			document.querySelector(`#square-${id}`).style.border = '5px solid green';
			socket.emit('game-move', { code: code, move : ['e2', 'e4']})
		}
		else{
			setSelected(id);
			document.querySelector(`#square-${id}`).style.border = '5px solid green';
		}
	}

	const handleStart = () => {
		const sock = createSocket();
		setSocket(sock);
		sock.emit('game-create');
		sock.on('game-screate', ({ code, game }) => {
			setCode(code)
			setWaiting(true);
			setGame(game);
			setMessage('waiting for other player')
		})
		sock.on('game-update', () => {
			setWaiting(false);
			if(!started) setStarted(true);
		})
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
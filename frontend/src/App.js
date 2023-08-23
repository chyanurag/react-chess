import React, { useState, useEffect } from 'react';
import { jsonToSquares, pieces,  createSocket } from './util';
import JoinGame from './components/JoinGame';
import Board from './components/Board';

const App = () => {
	const [squares, setSquares] = useState([]);
	const [started, setStarted] = useState(false);
	const [showJoin, setShowJoin] = useState(false);
	const [socket, setSocket] = useState(null);
	const [game, setGame] = useState(null);
	const [message, setMessage] = useState(null);
	const [waiting, setWaiting] = useState(false);
	const [black, setBlack] = useState(false);
	const [code, setCode] = useState(null);
	const [selected, setSelected] = useState(null);
	const [moves, setMoves] = useState([]);

	useEffect(() => {
		if(message){
			if(message == 'black'){
				setBlack(true);
			}
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
					document.querySelector(`#square-${cmoves[i]}`).style.border = '1px solid lightgreen';
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
				<div class="waiting-text">
					<h1 style={{textAlign: 'center'}}>Game code : {code}</h1>
					<h3 style={{textAlign: 'center'}}>Waiting for other player to join</h3>
				</div>
			</>
		)
	}
	if(started){
		return(
			<Board squares={squares} handleSelect={handleSelect} black={black}/>
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
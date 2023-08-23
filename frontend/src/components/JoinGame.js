import React, { useState } from "react";

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

export default JoinGame;
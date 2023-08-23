import React, { Children } from 'react';
import Square from './Square';
const Board = ({ squares, handleSelect, black }) => {
    if(black){
        return(
            <div id="board" style={{transform: 'rotateX(180deg)'}}>
			    {squares.map(square => <Square black={black} handleSelect={handleSelect} piece={square.piece} key={square.id} id={square.id}/>)}
		    </div>
        )
    }
	return(
		<div id="board">
			{squares.map(square => <Square handleSelect={handleSelect} piece={square.piece} key={square.id} id={square.id}/>)}
		</div>
	)
}

export default Board;
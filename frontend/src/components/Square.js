import React from 'react'
import { pieces } from '../util';
let files = 'ABCDEFGH'
const Square = ({ id, piece, handleSelect, black }) => {
	const isWhite = (files.indexOf(id[0]) + parseInt(id[1])) % 2 === 0;
    if(black){
        return(
            <div className="square" style={{backgroundColor : isWhite ? '#f0dab5' : '#b58763'}} id={`square-${id}`} onClick={() => handleSelect(id)}>
			    {piece && <img style={{transform:'rotateX(180deg)'}} alt={`${id}`} src={`${process.env.SERVER_URL}/imgs/${pieces.get(piece)}`}/>}
		    </div> 
        )
    }
	return(
		<div className="square" style={{backgroundColor : isWhite ? '#f0dab5' : '#b58763'}} id={`square-${id}`} onClick={() => handleSelect(id)}>
			{piece && <img alt={`${id}`} src={`${process.env.SERVER_URL}/imgs/${pieces.get(piece)}`}/>}
		</div>
	)
}

export default Square;

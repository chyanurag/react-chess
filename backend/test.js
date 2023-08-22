const { Game } = require('js-chess-engine')

const game = new Game()
game.move('e2', 'e4')
game.move('f7', 'f5')
game.move('b1', 'c3')
game.move('g7', 'g5')
game.move('d1', 'h5')

data = game.exportJson()
console.log(data['isFinished'])

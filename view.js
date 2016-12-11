function render() {
  renderCards()
  renderScore()
}

function renderCards() {
  saveGame()
  $('tr').remove()
  displayCards()
  attachClickHandlers()
}

function renderScore() {
  $('#score').empty()
  $('#score').append(`<div>Score: ${state.score}</div>
                      <div>Possible sets: ${numberOfSets(state.faceUpCards)}</div>`)
}

function attachClickHandlers() {
  $('td').click(function() {
    $(this).toggleClass('selected')
    const card = state.faceUpCards[Number($(this).attr('id'))]
    if (!state.selectedCards.includes(card)) {
      state.selectedCards.push(card)
    } else {
      state.selectedCards.splice(state.selectedCards.indexOf(card), 1)
    }
    if (state.selectedCards.length === 3) {
      if (isASet(state.selectedCards)) {
        // alert('You found a set!')
        state.score++
        discardAndReplace()
        render()
        state.hintI = 0
      } else {
        alert('This is not a set...')
        if (state.score > 0) state.score--
        render()
        state.selectedCards = []
        $('td').removeClass('selected')
      }
    }
  })
}

function attachKeypressEvents () {
  $('body').keypress(function(event) {
    switch (event.which) {
      case 104:
        giveHint()
        break;
      case 114:
        resetGame()
        break;
      case 51:
        addThreeCards()
        break;
      default:
        console.log(event.which)
    }
  })
}

// depends on faceUpCards
function displayCards() {
  let tds = state.faceUpCards.map((card, i) => {
    let td = document.createElement('td')
    td.id = i
    td.appendChild(cardSvgNode(card))
    return td
  })

  const cardsPerRow = Math.ceil(tds.length / 3)
  let row

  let rows = tds.reduce((rows, td, i) => {
    if (i % cardsPerRow === 0) {
      row = document.createElement('tr')
    }
    row.appendChild(td)
    return rows.concat(row)
  }, [])

  rows.forEach(row =>
    $('table').append(row)
  )
}

function cardSvgNode(card) {
  const numbers = {
    one: 1,
    two: 2,
    three: 3
  }

  const SQRT3_2 = Math.sqrt(3) / 2

  const symbols = {
    diamond: `M ${-SQRT3_2} 0 L 0 0.5 L ${SQRT3_2} 0 L 0 -0.5 Z`,

    squiggle: 'm -1,0 c 0.0219,-0.22632 0.19302,-0.42982 0.40935,-0.49502 0.18511,-0.0385 0.35255,0.0735 0.52058,0.1313 0.12701,0.0488 0.27616,0.062 0.3974,-0.0111 0.13821,-0.0674 0.26427,-0.19055 0.42758,-0.18155 0.16573,0.0246 0.28275,0.19002 0.29308,0.34992 0.003,0.20586 -0.14932,0.3758 -0.31174,0.48394 -0.11055,0.0754 -0.24898,0.12618 -0.38284,0.0895 -0.18566,-0.0396 -0.35768,-0.16081 -0.55425,-0.13296 -0.17664,0.0339 -0.28742,0.21813 -0.47144,0.22797 -0.15944,-0.0138 -0.26399,-0.16518 -0.30768,-0.30625 -0.0163,-0.0505 -0.0219,-0.10376 -0.0191,-0.15642 z',

    oval: 'M 0.5 0.5 A 0.5 0.5 0 0 0 0.5 -0.5 L -0.5 -0.5 A 0.5 0.5 0 0 0 -0.5 0.5 Z'
  }

  const shadings = {
    solid: 1,
    striped: 1,
    open: 0
  }

  const colors = {
    red: '#e91e63',
    green: '#4caf50',
    purple: '#673ab7'
  }

  let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '100%')
  svg.setAttribute('height', '100%')
  svg.setAttribute('viewBox', '-1 0 2 4')

  if (card.shading === 'striped') {
    let defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')

    let pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern')
    pattern.setAttribute('id', 'Striped')
    pattern.setAttribute('x', '0')
    pattern.setAttribute('y', '0')
    pattern.setAttribute('width', '0.03')
    pattern.setAttribute('height', '1')

    let line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', '0')
    line.setAttribute('y1', '0')
    line.setAttribute('x2', '0')
    line.setAttribute('y2', '1')
    line.setAttribute('stroke-width', '0.04')
    line.setAttribute('stroke', colors[card.color])

    pattern.appendChild(line)
    defs.appendChild(pattern)
    svg.appendChild(defs)
  }

  let path, yPosition
  let numberOfShapes = numbers[card.number]
  let fill = (card.shading === 'striped') ?
               'url(#Striped)' :
               `${colors[card.color]}`

  for (let i = 0; i < numberOfShapes; i++) {
    yPosition = 2 - (numberOfShapes - 1) * 0.625 + i * 1.25

    path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', symbols[card.symbol])
    path.setAttribute('fill', fill)
    path.setAttribute('stroke', colors[card.color])
    path.setAttribute('fill-opacity', shadings[card.shading])
    path.setAttribute('transform', `translate(0, ${yPosition})`)

    svg.appendChild(path)
  }

  return svg
}
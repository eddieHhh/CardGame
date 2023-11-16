class Player {
  constructor(name) {
    this.name = name;
    this.hiddenCard = 0;
    this.visibleCards = [];
    this.sumOfVisibleCards = 0;
    this.passed = false;
  }

  takeHiddenCard(card) {
    this.hiddenCard = card;
    if (this instanceof HumanPlayer) {
      this.updateHiddenCardDisplay();
    }
  }

  takeVisibleCard(card) {
    this.visibleCards.push(card);
    this.sumOfVisibleCards += card;
    this.updateDisplay();
  }

  updateDisplay() {
    const playerElement = document.getElementById(this.name);
    const visibleCardsDiv = playerElement.getElementsByClassName('cards')[0];
    visibleCardsDiv.textContent = 'Visible Cards: ' + this.visibleCards.join(', ');
  }

  updateHiddenCardDisplay() {
    const playerElement = document.getElementById(this.name);
    const hiddenCardDiv = playerElement.getElementsByClassName('hidden-card')[0];
    hiddenCardDiv.textContent = 'Hidden Card: ' + this.hiddenCard;
  }

  getScore() {
    return this.hiddenCard + this.sumOfVisibleCards;
  }

  getVisibleScore() {
    return this.sumOfVisibleCards;
  }

  offerCard() {
    return this.getScore() < 16;
  }

  updateStatus(passed) {
    const playerElement = document.getElementById(this.name);
    const statusDiv = playerElement.getElementsByClassName('status')[0];
    statusDiv.textContent = passed ? 'Passed' : '';
  }
}

class HumanPlayer extends Player {
  constructor(name) {
    super(name);
  }

  offerCard() {
    if (this.getScore() > 21) {
      this.passed = true;
      return false;
    }
    return confirm(this.name + ": Do you want to take another card?");
  }
}

const human = new HumanPlayer('human-player');
const player1 = new Player('player1');
const player2 = new Player('player2');
const player3 = new Player('player3');

function nextCard() {
  let card = Math.floor(Math.random() * 13) + 1;
  return card > 10 ? 10 : card;
}

function deal() {
  [human, player1, player2, player3].forEach(player => {
    player.hiddenCard = 0;
    player.visibleCards = [];
    player.sumOfVisibleCards = 0;
    player.passed = false;
    player.updateDisplay();
    if (player instanceof HumanPlayer) {
      player.updateHiddenCardDisplay();
    }
    player.updateStatus(player.passed);
  });

  showScores();
}

let isFirstTurn = true;

function controlPlay() {
  if (isFirstTurn) {
    [human, player1, player2, player3].forEach(player => {
      player.takeHiddenCard(nextCard());
      player.takeVisibleCard(nextCard());
    });
    isFirstTurn = false;
  } else {
    if (!human.passed && human.offerCard()) {
      human.takeVisibleCard(nextCard());
      if (human.getScore() > 21) {
        human.passed = true;
        completeComputerTurns();
        declareWinner();
        askForNewGame();
        return;
      }
    } else {
      human.passed = true;
    }

    completeComputerTurns();
  }

  human.updateStatus(human.passed);
  showScores();

  if (isGameOver()) {
    declareWinner();
    askForNewGame();
  }
}

function completeComputerTurns() {
  [player1, player2, player3].forEach(player => {
    if (!player.passed && player.offerCard()) {
      player.takeVisibleCard(nextCard());
    }
    player.passed = true;
    player.updateStatus(player.passed);
    player.updateDisplay(); // 更新电脑玩家的牌面显示
  });

  showScores();
}

function showScores() {
  let scoresDiv = document.getElementById('scores');
  scoresDiv.innerHTML = '';
  [human, player1, player2, player3].forEach(player => {
    let scoreDisplay;
    if (player instanceof HumanPlayer) {
      scoreDisplay = player.name + " has " + player.getScore() + " total points.<br>";
    } else {
      scoreDisplay = player.name + " has " + player.getVisibleScore() + " points from visible cards.<br>";
    }
    scoresDiv.innerHTML += scoreDisplay;
  });
}

function isGameOver() {
  return [human, player1, player2, player3].every(player => player.passed);
}

function declareWinner() {
  let highestScore = 0;
  let winner = null;
  let finalScoresMessage = 'Game Over! Final scores:\n';

  [human, player1, player2, player3].forEach(player => {
    let score = player.getScore();
    finalScoresMessage += player.name + " has " + score + " points.\n";

    if (score <= 21 && score > highestScore) {
      highestScore = score;
      winner = player;
    }
  });

  alert(finalScoresMessage);

  let winnerMessage = winner ? winner.name + " wins with " + highestScore + " points!" : "No winner!";
  alert(winnerMessage);
}

function askForNewGame() {
  if (confirm("Game over! Do you want to play again?")) {
    isFirstTurn = true;
    deal();
  }
}

document.getElementById('take-card').addEventListener('click', () => {
  controlPlay();
});

document.getElementById('pass').addEventListener('click', () => {
  human.passed = true;
  completeComputerTurns();
  declareWinner();
  askForNewGame();
});

deal();

let score

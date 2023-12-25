  // Функция для отправки запроса на сервер при авторизации
	function login() {
	  const username = document.getElementById('username').value;
	  const password = document.getElementById('password').value;

	  // Отправка данных на сервер
	  fetch('http://localhost:3000/login', {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({ username, password }),
	  })
		.then(response => response.json())
		.then(data => {
		  console.log(data);

		  if (data.success) {
			// Если авторизация успешна, скрываем форму
			const authContainer = document.getElementById('auth-container');
			if (authContainer) {
			  authContainer.style.display = 'none';
			}
			updatePlayerName(username);
			toggleMenu();
		  }

      if (data.error)
        alert(data.error);
		})
		.catch(error => console.error('Ошибка:', error));
	}
	
	// Переключение показа меню
    function toggleMenu() {
      const menu = document.getElementById('menu');
      if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'flex';
      } else {
        menu.style.display = 'none';
      }
    }
	
	function updatePlayerName(username) {
		const playerNameElement = document.getElementById('menu-player-name');
		if (playerNameElement) {
			playerNameElement.textContent = 'Добро пожаловать,' + username;
		}
	}
  // Функция для отправки запроса на сервер при регистрации
  function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Отправка данных на сервер
    fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then(response => response.json())
      .then(data => {
		if (data.error)
			alert(data.error);
		else
			alert(data.message);
        console.log(data);
      })
      .catch(error => console.error('Ошибка:', error));
  }

document.addEventListener('DOMContentLoaded', () => {
	const boardSize = 10;
    let maxAttempts = 60;
	const ratingList = document.getElementById('player-rating-list');
	updateRatingList();
	const gameContainer = document.getElementById('game-content');
	var username = document.getElementById('username').value;
    const board = [];
    const ships = [
      { size: 5, positions: [] },
      { size: 4, positions: [] },
      { size: 3, positions: [] },
      { size: 2, positions: [] },
      { size: 1, positions: [] }
    ];

    let attempts = 0;
    let score = 0;

    let infoElement;
	let difficulty = 'easy';

	function setDifficulty(selectedDifficulty) {
	    difficulty = selectedDifficulty;
	    switch (difficulty) {
	      case 'easy':
	        maxAttempts = 60;
	        break;
	      case 'medium':
	        maxAttempts = 40;
	        break;
	      case 'hard':
	        maxAttempts = 25;
	        break;
	      default:
	        maxAttempts = 60;
	    }
	  }

    function getRandomDirection() {
      return Math.random() < 0.5 ? 'horizontal' : 'vertical';
    }

    // Инициализация поля
    function initializeBoard() {
      for (let i = 0; i < boardSize; i++) {
        const row = [];
        for (let j = 0; j < boardSize; j++) {
          row.push(0);
        }
        board.push(row);
      }
    }

    // Размещаем корабли
    function placeShips() {
      for (const ship of ships) {
        let validPlacement = false;
        while (!validPlacement) {
          const row = Math.floor(Math.random() * boardSize);
          const col = Math.floor(Math.random() * boardSize);
          const direction = getRandomDirection();
          validPlacement = checkValidPlacement(row, col, direction, ship);
          if (validPlacement) {
          	clearShipPositions(ship);
            placeShipOnBoard(row, col, direction, ship);
          }
        }
      }
    }

	//Очищаем позиции кораблей для старта новой игры
	function clearShipPositions(ship) {
	  ship.positions = [];
	}

  // Проверяем можем ли поместить корабль на данное место
   function checkValidPlacement(row, col, direction, ship) {
    if (
      row < 0 || row >= boardSize ||
      col < 0 || col >= boardSize
    ) {
      return false;
    }

    // Проверяем, что рядом нет других кораблей
    for (let i = -1; i <= ship.size; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i;
        const newCol = col + j;

        if (
          newRow >= 0 && newRow < boardSize &&
          newCol >= 0 && newCol < boardSize &&
          board[newRow][newCol] !== 0
        ) {
          return false;
        }
      }
    }

    if (direction === 'horizontal') {
      if (col + ship.size > boardSize) {
        return false;
      }

      for (let i = 0; i < ship.size; i++) {
        if (board[row][col + i] !== 0) {
          return false;
        }
      }
    } else {
      if (row + ship.size > boardSize) {
        return false;
      }

      for (let i = 0; i < ship.size; i++) {
        if (board[row + i][col] !== 0) {
          return false;
        }
      }
    }

    return true;
  }

  // Размещаем корабль
  function placeShipOnBoard(row, col, direction, ship) {
    if (direction === 'horizontal') {
      for (let i = 0; i < ship.size; i++) {
        board[row][col + i] = 1;
        ship.positions.push({ row, col: col + i });
      }
    } else {
      for (let i = 0; i < ship.size; i++) {
        board[row + i][col] = 1;
        ship.positions.push({ row: row + i, col });
      }
    }
  }

  //Отображение таблицы или её рендер
  function renderBoard() {
    const table = document.createElement('table');
    for (let i = 0; i < boardSize; i++) {
      const tr = document.createElement('tr');
      for (let j = 0; j < boardSize; j++) {
        const td = document.createElement('td');
        td.dataset.row = i;
        td.dataset.col = j;
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    gameContainer.appendChild(table);
  }

  //Обработка клика по ячейке таблице
	function handleCellClick(event) {
	  if (attempts >= maxAttempts) {
	    alert('Игра завершена. Вы использовали все попытки.');
	    showScore();
		  updateScore(username, score);
	    toggleMenu();
	    return;
	  }

	  const row = parseInt(event.target.dataset.row);
	  const col = parseInt(event.target.dataset.col);

	  if (board[row][col] === 1) {
	    event.target.classList.add('hit');
      board[row][col] = 2;
	    score++;
	    checkVictory();
	    showScore(score);
	  } else {
	    attempts++;
	  }

	  updateInfo();

	  if (attempts === maxAttempts) {
	    alert('Игра завершена. Вы использовали все попытки.');
	    markRemainingShipParts();
	    showScore();
		  updateScore(username, score);
	    toggleMenu();
	  }
	}

    // Проверяем попадание по всем кораблям
	function checkVictory() {
	  let allShipsHit = true;
	  for (const ship of ships) {
	    for (const position of ship.positions) {
	      if (board[position.row][position.col] !== 2) {
	        allShipsHit = false;
	        break;
	      }
	    }
	  }

	  if (allShipsHit) {
	    const difficultyMultiplier = getDifficultyMultiplier();
	    const finalScore = Math.round(score * difficultyMultiplier);
	    alert(`Поздравляем! Вы победили!\nВаш итоговый счет: ${finalScore}`);
		  updateScore(username, finalScore);
	    showScore(finalScore);

	    attempts = 0;
	    score = 0;

	    toggleMenu();
	    removeGameTable();
	  }
	}

	function removeGameTable() {
	  const existingTable = document.querySelector('table');
	  if (existingTable) {
	   gameContainer.removeChild(existingTable);
	  }

	  // Удаляем элемент отображения оставшихся попыток
	  const infoElement = document.getElementById('info');
	  if (infoElement) {
	   gameContainer.removeChild(infoElement);
	  }

  	  // Удаляем элемент отображения счёта
	  const scoreElement = document.getElementById('score');
	  if (scoreElement) {
	   gameContainer.removeChild(scoreElement);
	  }
	}
    // Отмечаем ячейки кораблей которые не были выбраны
    function markRemainingShipParts() {
      for (const ship of ships) {
        for (const position of ship.positions) {
          const cell = document.querySelector(`td[data-row="${position.row}"][data-col="${position.col}"]`);
          if (cell && !cell.classList.contains('hit')) {
            cell.classList.add('remaining-part');
          }
        }
      }
    }

    // Обновляем оставшиеся попытки
    function updateInfo() {
      infoElement.textContent = `Оставшиеся попытки: ${maxAttempts - attempts}`;
    }

	// Показываем счёт
	function showScore(finalScore) {
	  const scoreElement = document.getElementById('score');
	  if (scoreElement) {
	    if (finalScore !== undefined) {
	      scoreElement.textContent = `Счёт: ${finalScore}`;
	    } else {
	      scoreElement.textContent = `Счёт: ${score}`;
	    }
	  }
	}

    //При победе умножаем итоговый счет
    function getDifficultyMultiplier() {
      switch (maxAttempts) {
        case 60:
          return 1;
        case 40:
          return 1.5; 
        case 25:
          return 2;
        default:
          return 1;
      }
    }

    function showDifficultyMenu() {
	  const menu = document.getElementById('menu');
	  menu.style.display = 'none';

	  // Проверяем наличие элемента таблицы перед его удалением
	  const existingTable = document.querySelector('table');
	  if (existingTable) {
	   gameContainer.removeChild(existingTable);
	  }

	  // Проверяем наличие элемента отображения оставшихся попыток перед его удалением
	  const infoElement = document.getElementById('info');
	  if (infoElement) {
	   gameContainer.removeChild(infoElement);
	  }

	  createDifficultyMenu();
}

    function createDifficultyMenu() {
      const difficultyMenu = document.createElement('div');
      difficultyMenu.id = 'difficulty-menu';

      const backButton = document.createElement('div');
      backButton.textContent = 'Назад';
      backButton.className = 'menu-button';
      backButton.addEventListener('click', () => {
        difficultyMenu.style.display = 'none';
        toggleMenu();
      });
      difficultyMenu.appendChild(backButton);

      const easyButton = document.createElement('div');
      easyButton.textContent = 'Легкая';
      easyButton.className = 'menu-button';
      easyButton.addEventListener('click', () => {
        setDifficulty('easy');
        difficultyMenu.style.display = 'none';
        startGame();
      });
      difficultyMenu.appendChild(easyButton);

      const mediumButton = document.createElement('div');
      mediumButton.textContent = 'Средняя';
      mediumButton.className = 'menu-button';
      mediumButton.addEventListener('click', () => {
        setDifficulty('medium');
        difficultyMenu.style.display = 'none';
        startGame();
      });
      difficultyMenu.appendChild(mediumButton);

      const hardButton = document.createElement('div');
      hardButton.textContent = 'Сложная';
      hardButton.className = 'menu-button';
      hardButton.addEventListener('click', () => {
        setDifficulty('hard');
        difficultyMenu.style.display = 'none';
        startGame();
      });
      difficultyMenu.appendChild(hardButton);

      gameContainer.appendChild(difficultyMenu);
      difficultyMenu.style.display = 'flex';
    }

	function startGame() {
		updateRatingList();
		removeGameTable();
		username = document.getElementById('username').value;
	    const difficultyMenu = document.getElementById('difficulty-menu');
	    if (difficultyMenu) {
	      difficultyMenu.style.display = 'none';
	    }

  		attempts = 0;
	  	score = 0;
	  	finalScore = 0;

	    setDifficulty(difficulty);

	    const existingTable = document.querySelector('table');
	    if (existingTable) {
	     gameContainer.removeChild(existingTable);
	    }

	    board.length = 0;
	    initializeBoard();

	    renderBoard();
	    placeShips();
	    initInfo();
	    showScore(0);

	    document.querySelectorAll('td').forEach(cell => {
	      cell.addEventListener('click', handleCellClick);
	    });
	    const scoreElement = document.getElementById('score');

		if (scoreElement) {
		    scoreElement.style.display = 'block';
		}
  }
	
	function exitGame() {
		showAuthForm();
		removeGameTable();
		toggleMenu();
	}
	
    function initInfo() {
      infoElement = document.createElement('div');
      infoElement.id = 'info';
      gameContainer.appendChild(infoElement);

      const scoreElement = document.createElement('div');
  	  scoreElement.id = 'score';
  	  scoreElement.textContent = 'Счёт: 0';
  	  gameContainer.appendChild(scoreElement);

  	  gameContainer.appendChild(infoElement);
    }

    initMenu();

    function initMenu() {
      const menu = document.createElement('div');
      menu.id = 'menu';
	  
  	  const playerName = document.createElement('div');
  	  playerName.id = 'menu-player-name';
  	  playerName.textContent = 'Добро пожаловать';
  	  menu.appendChild(playerName);

      const playButton = document.createElement('div');
      playButton.className = 'menu-button';
      playButton.textContent = 'Играть';
      playButton.addEventListener('click', showDifficultyMenu);
      menu.appendChild(playButton);
	  
  	  const exitButton = document.createElement('div');
  	  exitButton.className = 'menu-button';
  	  exitButton.textContent = 'Выйти';
  	  exitButton.addEventListener('click', exitGame);
  	  menu.appendChild(exitButton);

      gameContainer.appendChild(menu);
    }

   // Функция для отображения формы авторизации и регистрации
  function showAuthForm() {
    const authContainer = document.getElementById('auth-container');
    if (authContainer) {
      authContainer.style.display = 'block';
    }
  }
	// Обновление счета игрока
	function updateScore(username, newScore) {
		// Отправляем запрос на сервер для обновления счета
		fetch('http://localhost:3000/update-score', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username: username, score: newScore }),
		})
		.then(response => response.json())
		.then(data => {
			console.log('Счет успешно обновлен:', data);
		})
		.catch(error => console.error('Ошибка при обновлении счета:', error));
	}

	// Функция для обновления списка рейтинга
    function updateRatingList() {
        // Очищаем текущий список
        ratingList.innerHTML = '';

        // Отправляем запрос на сервер для получения рейтинга
        fetch('http://localhost:3000/rating?username=' + username)
            .then(response => response.json())
            .then(playerRatingData => {
                // Сортируем игроков по убыванию счета
                playerRatingData.sort((a, b) => b.score - a.score);

                // Создаем новый список
                playerRatingData.forEach((player, index) => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${index + 1}. ${player.username}: ${player.score}`;
                    ratingList.appendChild(listItem);
                });
            })
            .catch(error => console.error('Ошибка при получении рейтинга:', error));
    }

  // Вызываем функцию отображения формы при загрузке страницы
  showAuthForm();
});
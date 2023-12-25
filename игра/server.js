const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/battleship', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Определение схемы и модели для игрока
const playerSchema = new mongoose.Schema({
  username: String,
  password: String,
  score: Number,
});

const Player = mongoose.model('Player', playerSchema);

app.use(express.json());

// Регистрация нового игрока
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username == ""){
      return res.status(400).json({ error: 'Заполните имя пользователя' });
    }
    if (password == "") {
      return res.status(400).json({ error: 'Укажите пароль' });
    }
    const existingPlayer = await Player.findOne({ username });

    if (existingPlayer) {
      return res.status(400).json({ error: 'Игрок с таким именем уже существует' });
    }

    const player = new Player({ username, password, score: 0 });
    await player.save();

    res.status(201).json({ message: 'Игрок зарегистрирован успешно' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Авторизация игрока
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const player = await Player.findOne({ username, password });

    if (!player) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }

    res.json({ username: player.username, score: player.score, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Обновление счета игрока
app.put('/update-score', async (req, res) => {
  try {
    const { username, score } = req.body;
    const player = await Player.findOne({ username });
	
	if (!username || !score) {
      return res.status(400).json({ error: 'Отсутствует имя пользователя или счет' });
    }

    if (!player) {
      return res.status(404).json({ error: 'Игрок не найден' });
    }
	
    if (score > player.score) {
      player.score = score;
      await player.save();
      res.json({ message: 'Счет обновлен успешно' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение рейтинга
app.get('/rating', async (req, res) => {
  try {
    const playerRatingData = await Player.find({}, 'username score -_id');
    res.json(playerRatingData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});

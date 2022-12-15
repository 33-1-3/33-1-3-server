const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

// mongoose 연결 확인
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log('MongoDB Connected'), {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .catch((error) => console.error(error));

const Auth = require('./models/Auth');

app.post('/test', async (req, res) => {
  console.log(Auth);
  try {
    const auth = await new Auth(req.body);
    console.log(auth._id);
    await auth.save();
    res.send('good');
  } catch (err) {
    console.log(err);
  }
});

// 예시 코드
const User = require('./models/User');

app.post('/test/user', async (req, res) => {
  console.log(User);
  try {
    const user = await new User(req.body);
    await user.save();
    res.send('good');
  } catch (err) {
    console.log(err);
  }
});
// 현정

// 윤하

// 채린

app.listen(process.env.PORT || 5000, () => {
  console.log('server started');
});

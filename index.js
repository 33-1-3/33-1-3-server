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
// const User = require('./models/User');

// app.post('/test/user', async (req, res) => {
//   console.log(User);
//   try {
//     const user = await new User(req.body);
//     await user.save();
//     res.send('good');
//   } catch (err) {
//     console.log(err);
//   }
// });
// 현정

// 로그인
app.post('/signin', async (req, res) => {
  try {
    const { email, password } = await req.body;
    if (!email || !password) {
      return res.status(401).send({ error: '값을 입력해라' });
    }

    const user = await Auth.findOne({ email, password });

    if (!user) return res.status(401).send({ error: '가입해라' });

    res.status(200).send({
      email: user.email,
    });
  } catch (err) {
    return res.status(401).send(err);
  }
});

// 회원가입
app.post('/check', async (req, res) => {
  try {
    const ExistedUser = await Auth.findOne({ email: req.body.email });

    if (ExistedUser) {
      return res.status(401).send({ error: '이미 존재하는 이메일임' });
    }

    const user = new Auth(req.body);

    await user.save();
    res.send(user);
  } catch (err) {
    return res.status(401).send({ error: 'error' });
  }
});

// 윤하

// 채린

app.listen(process.env.PORT || 5000, () => {
  console.log('server started');
});

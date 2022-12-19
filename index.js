const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const cors = require('cors');

dotenv.config();

const app = express();

// cors
const safesitelist = ['http://localhost:3000', 'https://33-1-3.com/'];
const corsOptions = {
  origin(origin, callback) {
    const issafesitelisted = safesitelist.indexOf(origin) !== -1;
    callback(null, issafesitelisted);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

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

const { Auth, Collection, UserVinyl, CommonVinyl } = require('./models');

// auth 요청
app.get('/auth', (req, res) => {
  const { accessToken } = req.cookies;

  try {
    const { userId } = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);

    res.send({ isLogin: true, userId });
  } catch (error) {
    res.send({ isLogin: false });
  }
});

// 로그아웃
app.get('/logout', (req, res) => {
  res.clearCookie('accessToken');

  res.end();
});

// 로그인
app.post('/signin', async (req, res) => {
  try {
    const { email, password } = await req.body;

    const user = await Auth.findOne({ email });
    if (!user) return res.status(200).send({ state: 'notExist' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(200).send({ state: 'notExist' });

    if (user.auth === false) return res.status(200).send({ state: 'needAuth' });
    console.log(user.id);
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1d' }
    );

    res.setHeader('Access-Control-Allow-Credentials', 'true');

    res.cookie('accessToken', accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
      httpOnly: true,
      secure: true,
    });

    return res.status(200).send({ userId: user.id });
  } catch (error) {
    return res.status(401).send({ error });
  }
});

// 회원가입
app.post('/signup', async (req, res) => {
  try {
    const { email, nickname, password } = req.body;
    const ExistedUser = await Auth.findOne({ email });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (ExistedUser) {
      return res.send({ state: 'duplicate' });
    }
    const user = new Auth({ email, nickname, password: hashedPassword });
    await user.save();
    const userId = user.id;
    // 이메일 전송

    let emailTemplate;
    ejs.renderFile(
      './verification/emailTemplate.ejs',
      { email, userId, nickname },
      (err, data) => {
        if (err) console.log(err);
        emailTemplate = data;
      }
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 313,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `33-1-3 <${process.env.EMAIL}>`,
      to: `${email}`,
      subject: '[33-1-3] 이메일 인증',
      html: emailTemplate,
    });

    return res.send({ state: 'success' });
  } catch (err) {
    return res.status(401).send(err);
  }
});

// 이메일 인증
app.post('/verification', async (req, res) => {
  try {
    const { userId } = req.body;
    await Auth.findOneAndUpdate({ _id: userId }, { $set: { auth: true } });
    return res.send('success');
  } catch (error) {
    return res.status(400).send({ error });
  }
});

// 아이템 추가 모달 렌더링
app.get('/collections/:userId/:releasedId', async (req, res) => {
  try {
    const { userId, releasedId } = req.params;
    const collections = await Collection.find({ userId });

    const response = collections.map(({ title, vinyls }) => {
      const isChecked =
        vinyls.find(
          ({ releasedId: _releasedId }) => _releasedId === +releasedId
        ) !== undefined;
      return { title, isChecked };
    });

    return res.send(response);
  } catch (error) {
    return res.status(400).send({ error });
  }
});

// 컬렉션 렌더링
app.get('/collections/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const targetCollection = await Collection.find({ userId });
    const response = targetCollection.map(
      ({ title, _id: collectionId, vinyls }) => ({
        title,
        collectionId,
        vinylCount: vinyls.length,
      })
    );
    return res.send(response);
  } catch (error) {
    return res.send([]);
  }
});

// 컬렉션 추가
app.post('/collections/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { title } = req.body;
    const collection = new Collection({ title, userId });
    await collection.save();
    return res.send(collection.id);
  } catch (error) {
    return res.status(400).send({ error });
  }
});

// 컬렉션 편집
app.put('/collections/:collectionId', async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { title } = req.body;
    await Collection.findOneAndUpdate(
      { _id: collectionId },
      { $set: { title } }
    );
    return res.end();
  } catch (error) {
    return res.status(400).send({ error });
  }
});

// 컬렉션 삭제
app.delete('/collections/:collectionId', async (req, res) => {
  try {
    const { collectionId } = req.params;
    await Collection.findOneAndDelete({ _id: collectionId });
    return res.end();
  } catch (error) {
    return res.status(400).send({ error });
  }
});

// 아이템 렌더링
app.get('/collection/:collectionId', async (req, res) => {
  try {
    const { collectionId } = req.params;
    const targetCollection = await Collection.findOne({ _id: collectionId });
    const { title: collectionTitle } = targetCollection;
    const targetVinyls = targetCollection.vinyls.map(
      ({ releasedId }) => releasedId
    );
    const _vinylsInfo = await CommonVinyl.find({ _id: { $in: targetVinyls } });
    const vinylsInfo = _vinylsInfo.map(
      ({ imgUrl, title, artist, genre, released }) => ({
        imgUrl,
        title,
        artist,
        genre,
        released,
      })
    );
    return res.send({ collectionTitle, vinylsInfo });
  } catch (error) {
    return res.status(400).send({ error });
  }
});

// Add Items 모달 내부 확인 버튼 클릭 시 -> 컬렉션에 vinyl 추가, 삭제 & 컬렉션 추가
app.post('/vinyl/:userId', async (req, res) => {
  const { userId } = req.params;
  const {
    releasedId,
    selectedCollectionIds,
    imgUrl,
    title,
    artist,
    released,
    genre,
  } = req.body;

  try {
    // TODO: 아래 두 요청 하나로 합칠 수 있는가?
    await Collection.updateMany(
      { userId, _id: { $in: selectedCollectionIds } },
      { $addToSet: { vinyls: { releasedId } } }
    );
    await Collection.updateMany(
      { userId, _id: { $nin: selectedCollectionIds } },
      { $pull: { vinyls: { releasedId } } }
    );

    const userVinyl = await UserVinyl.findOne({ userId, releasedId });
    if (!userVinyl) {
      const newVinyl = new UserVinyl({
        userId,
        releasedId,
        info: [],
        memo: '',
      });
      await newVinyl.save();
    }

    const commonVinyl = await CommonVinyl.findOne({ _id: +releasedId });
    if (!commonVinyl) {
      const newVinyl = new CommonVinyl({
        _id: +releasedId,
        imgUrl,
        title,
        artist,
        released,
        genre,
      });
      await newVinyl.save();
    }

    return res.status(201).send();
  } catch (error) {
    return res.status(400).send({ error });
  }
});

// 아이템 삭제 모달 확인 버튼 클릭 시 -> 아이템 삭제
app.put('/userVinyl/:collectionId/:releasedId', async (req, res) => {
  const { collectionId, releasedId } = req.params;

  try {
    const targetCollection = await Collection.findById(collectionId);
    const newVinyls = targetCollection.vinyls.filter(
      (vinyls) => vinyls.releasedId !== +releasedId
    );
    const updatedCollection = await Collection.findByIdAndUpdate(
      collectionId,
      { vinyls: newVinyls },
      { new: true }
    );
    if (!updatedCollection) res.status(404).send();
    return res.send(updatedCollection);
  } catch (error) {
    return res.status(400).send({ error });
  }
});

// My Item 페이지 렌더링 바로 직전 -> My Item 페이지 우측 정보 렌더링
app.get('/userVinyl/:userId/:releasedId', async (req, res) => {
  const { userId, releasedId } = req.params;

  try {
    const userVinyl = await UserVinyl.findOne({ userId, releasedId });
    if (!userVinyl) res.status(404).send();
    return res.send({ info: userVinyl.info, memo: userVinyl.memo });
  } catch (error) {
    return res.status(500).send({ error });
  }
});

// My Item 페이지 렌더링 직후 -> DB commonVinyl 업데이트
app.put('/commonVinyl/:releasedId', async (req, res) => {
  const { releasedId } = req.params;

  try {
    const updatedVinyl = await CommonVinyl.findByIdAndUpdate(
      releasedId,
      req.body,
      { new: true }
    );
    if (!updatedVinyl) res.status(404).send();
    return res.send(updatedVinyl);
  } catch (error) {
    return res.status(400).send({ error });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log('server started');
});

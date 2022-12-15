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

// 윤하
const { Collection, CommonVinyl } = require('./models');

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

    res.send(response);
  } catch (err) {
    console.log(err);
  }
});

// 컬렉션 렌더링
app.get('/collections/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const targetCollection = await Collection.find({ userId });
    const response = targetCollection.map(({ title, _id: collectionId }) => ({
      title,
      collectionId,
    }));
    res.send(response);
  } catch (err) {
    console.log(err);
  }
});

// 컬렉션 추가
app.post('/collections/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { title } = req.body;
    const collection = await new Collection({ title, userId });
    await collection.save();
    res.send(collection.id);
  } catch (err) {
    console.log(err);
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
    res.end();
  } catch (err) {
    console.log(err);
  }
});

// 컬렉션 삭제
app.delete('/collections/:collectionId', async (req, res) => {
  try {
    const { collectionId } = req.params;
    await Collection.findOneAndDelete({ _id: collectionId });
    res.end();
  } catch (err) {
    console.log(err);
  }
});

// 아이템 렌더링
app.get('/collection/:collectionId', async (req, res) => {
  try {
    const { collectionId } = req.params;
    const targetCollection = await Collection.findOne({ _id: collectionId });
    const targetVinyls = targetCollection.vinyls.map(
      ({ releasedId }) => releasedId
    );
    const vinylsInfo = await CommonVinyl.find({ _id: { $in: targetVinyls } });
    const response = vinylsInfo.map(
      ({ imgUrl, title, artist, genre, _id: released }) => ({
        imgUrl,
        title,
        artist,
        genre,
        released,
      })
    );
    res.send(response);
  } catch (err) {
    console.log(err);
  }
});

// 채린

app.listen(process.env.PORT || 5000, () => {
  console.log('server started');
});

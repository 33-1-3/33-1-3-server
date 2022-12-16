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

// 현정

// 윤하

// 채린
const { Collection, UserVinyl, CommonVinyl } = require('./models');

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

    res.status(201).send();
  } catch (err) {
    res.status(400).send(err);
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
    res.send(updatedCollection);
  } catch (err) {
    res.status(400).send(err);
  }
});

// My Item 페이지 렌더링 바로 직전 -> My Item 페이지 우측 정보 렌더링
app.get('/userVinyl/:userId/:releasedId', async (req, res) => {
  const { userId, releasedId } = req.params;

  try {
    const userVinyl = await UserVinyl.findOne({ userId, releasedId });
    if (!userVinyl) res.status(404).send();
    res.send({ info: userVinyl.info, memo: userVinyl.memo });
  } catch (err) {
    res.status(500).send(err);
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
    res.send(updatedVinyl);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log('server started');
});

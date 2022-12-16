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


const { Collection, UserVinyl, CommonVinyl } = require('./models');

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
    res.status(400).send(err);
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

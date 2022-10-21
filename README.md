# express-stream-range-mp4

> Stream your mp4 videos with partial content

This package streams your mp4 videos with partial content inside your video player. Compatible with IOS.

You need express library.

#### Installation

```bash
npm i express-stream-range-mp4
```

#### Usage

```js
const ESRM = require("express-stream-range-mp4");

app.get("/my-route-stream", (req, res) => {
  const videoPath = `video-path-file.mp4`;

  const esrm = new ESRM(req, res);
  esrm.stream(videoPath);
});
```

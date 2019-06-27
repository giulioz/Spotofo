# Spotofo
React Native app for streaming private music from HTTP.

To compile, you must add an `urls.js` file in the root directory, containing the playlist url in m3u format and additional server headers:

```js
export const playlistUrl =
  "https://test.com/playlist.m3u";

export const serverHeaders = {
  Authorization: "Basic ....."
};

```

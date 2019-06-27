import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, Text, View, Button, TextInput } from "react-native";
import Video from "react-native-video";
import MusicControl from "react-native-music-control";

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: "row"
  },
  rowSpread: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center"
  }
});

function formatTime(seconds) {
  const minutes = seconds / 60;
  return `${minutes.toFixed(0).padStart(2, "0")}:${(seconds % 60)
    .toFixed(0)
    .padStart(2, "0")}`;
}

export default function Audio({ path, next, prev, title }) {
  const [progress, setProgress] = useState();
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [paused, setPaused] = useState(true);
  const [speedInput, setSpeedInput] = useState("1.0");
  const [buffering, setBuffering] = useState(false);

  const playerRef = useRef();

  useEffect(() => {
    MusicControl.enableControl("play", true);
    MusicControl.enableControl("pause", true);
    MusicControl.enableControl("nextTrack", true);
    MusicControl.enableControl("previousTrack", true);
    MusicControl.enableControl("changePlaybackPosition", true);
  }, []);

  useEffect(() => {
    if (duration && title) {
      MusicControl.setNowPlaying({
        title,
        duration
      });
    }
  }, [title, duration]);

  function updateProgress(progress) {
    setProgress(progress);
    setDuration(progress.playableDuration);
    setBuffering(false);

    MusicControl.updatePlayback({
      // (STATE_ERROR, STATE_STOPPED, STATE_PLAYING, STATE_PAUSED, STATE_BUFFERING)
      state: buffering
        ? MusicControl.STATE_BUFFERING
        : paused
        ? MusicControl.STATE_PAUSED
        : MusicControl.STATE_PLAYING,
      speed,
      elapsedTime: progress.currentTime
    });
  }

  useEffect(() => {
    MusicControl.enableBackgroundMode(true);
    MusicControl.handleAudioInterruptions(true);

    MusicControl.on("play", () => {
      setPaused(false);
    });

    MusicControl.on("pause", () => {
      setPaused(true);
    });

    MusicControl.on("nextTrack", () => {
      next();
    });

    MusicControl.on("previousTrack", () => {
      prev();
    });

    MusicControl.on("changePlaybackPosition", pos => {
      if (playerRef.current) {
        playerRef.current.seek(pos);
      }
    });

    MusicControl.on("togglePlayPause", () => setPaused(p => !p));
  }, [setPaused, next, prev]);

  return (
    <View style={styles.container}>
      <View style={styles.rowSpread}>
        {progress && (
          <Text>
            {"Time: "}
            {formatTime(progress.currentTime)}
            {" / "}
            {formatTime(progress.playableDuration)}
          </Text>
        )}
      </View>

      <View style={styles.rowSpread}>
        {title && (
          <Text>
            {buffering ? "Buffering: " : "Playing: "}
            {title}
          </Text>
        )}
      </View>

      <View style={styles.rowSpread}>
        <Text>Speed:</Text>
        <TextInput onChangeText={setSpeedInput} value={speedInput} />
        <Button
          onPress={() => setSpeed(parseFloat(speedInput))}
          title={"Set"}
        />
      </View>

      <View style={styles.rowSpread}>
        <Button onPress={() => prev()} title={"Prev"} />
        <Button
          onPress={() => setPaused(p => !p)}
          title={paused ? "Play" : "Pause"}
        />
        <Button onPress={() => next()} title={"Next"} />
      </View>

      <Video
        source={path}
        rate={speed}
        ref={playerRef}
        playInBackground={true}
        playWhenInactive={true}
        paused={paused}
        ignoreSilentSwitch={"ignore"}
        progressUpdateInterval={500.0}
        onProgress={updateProgress}
        onEnd={e => next()}
        onError={e => console.log("VIDEO: ", e)}
        onBuffer={() => setBuffering(true)}
      />
    </View>
  );
}

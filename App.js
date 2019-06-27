import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Button,
  TextInput,
  SafeAreaView
} from "react-native";
import { orderBy } from "natural-orderby";

import Audio from "./components/Audio";
import { playlistUrl, serverHeaders } from "./urls";

function getFilename(url) {
  const splitted = url.split("/");
  return splitted[splitted.length - 1];
}

export default function App() {
  const [playlist, setPlaylist] = useState([]);
  const [position, setPosition] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    async function loadPlaylist() {
      const req = await fetch(playlistUrl, { headers: serverHeaders });

      const text = await req.text();
      const lines = text.split("\n").filter(s => s.length > 0);
      const linesSorted = orderBy(lines);
      setPlaylist(linesSorted.map((l, i) => ({ url: l, index: i })));
    }

    loadPlaylist();
  }, []);

  const path = useMemo(
    () =>
      playlist[position] && {
        uri: encodeURI(playlist[position].url),
        headers: serverHeaders
      },
    [playlist, position]
  );

  function advance() {
    setPosition(i => (i + 1 < playlist.length ? i + 1 : 0));
  }
  function prev() {
    setPosition(i => (i - 1 >= 0 ? i - 1 : playlist.length - 1));
  }

  const filteredPL = playlist.filter(
    e => search === "" || e.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {path && path.uri ? (
        <Audio
          path={path}
          next={advance}
          prev={prev}
          title={getFilename(playlist[position].url)}
        />
      ) : null}

      <View style={styles.row}>
        <Text>Search:</Text>
        <TextInput
          style={styles.grow}
          onChangeText={setSearchInput}
          value={searchInput}
        />
        <Button onPress={() => setSearch(searchInput)} title={"Go"} />
      </View>

      <FlatList
        data={filteredPL}
        keyExtractor={item => item.url}
        renderItem={({ item }) => (
          <Button
            title={item.url.split("/Musica/")[1]}
            onPress={() => setPosition(item.index)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  row: {
    flexDirection: "row",
    alignItems: "center"
  },
  grow: {
    flex: 1
  }
});

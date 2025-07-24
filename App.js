import React from "react";
import { StyleSheet, Text, View, StatusBar } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

export default function App() {
  return (
    <View style={styles.container}>
      <ExpoStatusBar style="auto" />
      <View style={styles.content}>
        <Text style={styles.title}>Hello, World! 👋</Text>
        <Text style={styles.subtitle}>
          Welcome to your first React Native app!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    backgroundColor: "#ffffff",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "600",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 15,
  },
  instruction: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 20,
  },
});

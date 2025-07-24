import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [sleepRecords, setSleepRecords] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("awake"); // 'awake' or 'sleeping'
  const [lastAction, setLastAction] = useState(null);

  useEffect(() => {
    loadSleepData();
  }, []);

  const loadSleepData = async () => {
    try {
      const savedRecords = await AsyncStorage.getItem("sleepRecords");
      const savedStatus = await AsyncStorage.getItem("currentStatus");
      const savedLastAction = await AsyncStorage.getItem("lastAction");

      if (savedRecords) {
        setSleepRecords(JSON.parse(savedRecords));
      }
      if (savedStatus) {
        setCurrentStatus(savedStatus);
      }
      if (savedLastAction) {
        setLastAction(JSON.parse(savedLastAction));
      }
    } catch (error) {
      console.error("Error loading sleep data:", error);
    }
  };

  const saveSleepData = async (records, status, action) => {
    try {
      await AsyncStorage.setItem("sleepRecords", JSON.stringify(records));
      await AsyncStorage.setItem("currentStatus", status);
      await AsyncStorage.setItem("lastAction", JSON.stringify(action));
    } catch (error) {
      console.error("Error saving sleep data:", error);
    }
  };

  const recordSleepTime = () => {
    const now = new Date();
    const sleepTime = {
      type: "sleep",
      timestamp: now.toISOString(),
      displayTime: now.toLocaleTimeString(),
      displayDate: now.toLocaleDateString(),
    };

    setCurrentStatus("sleeping");
    setLastAction(sleepTime);

    // Create new record or update existing one
    const newRecords = [...sleepRecords];
    const todayRecord = newRecords.find(
      (record) => record.date === sleepTime.displayDate && !record.wakeTime,
    );

    if (todayRecord) {
      todayRecord.sleepTime = sleepTime.displayTime;
      todayRecord.sleepTimestamp = sleepTime.timestamp;
    } else {
      newRecords.unshift({
        id: Date.now(),
        date: sleepTime.displayDate,
        sleepTime: sleepTime.displayTime,
        sleepTimestamp: sleepTime.timestamp,
        wakeTime: null,
        wakeTimestamp: null,
        duration: null,
      });
    }

    setSleepRecords(newRecords);
    saveSleepData(newRecords, "sleeping", sleepTime);

    Alert.alert("Sleep Time Recorded", `Bedtime: ${sleepTime.displayTime}`);
  };

  const recordWakeTime = () => {
    const now = new Date();
    const wakeTime = {
      type: "wake",
      timestamp: now.toISOString(),
      displayTime: now.toLocaleTimeString(),
      displayDate: now.toLocaleDateString(),
    };

    setCurrentStatus("awake");
    setLastAction(wakeTime);

    const newRecords = [...sleepRecords];
    const latestRecord = newRecords[0];

    if (latestRecord && !latestRecord.wakeTime) {
      latestRecord.wakeTime = wakeTime.displayTime;
      latestRecord.wakeTimestamp = wakeTime.timestamp;

      // Calculate sleep duration
      if (latestRecord.sleepTimestamp) {
        const sleepStart = new Date(latestRecord.sleepTimestamp);
        const sleepEnd = new Date(wakeTime.timestamp);
        const durationMs = sleepEnd - sleepStart;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor(
          (durationMs % (1000 * 60 * 60)) / (1000 * 60),
        );
        latestRecord.duration = `${hours}h ${minutes}m`;
      }
    } else {
      // Create new record for wake time only
      newRecords.unshift({
        id: Date.now(),
        date: wakeTime.displayDate,
        sleepTime: null,
        sleepTimestamp: null,
        wakeTime: wakeTime.displayTime,
        wakeTimestamp: wakeTime.timestamp,
        duration: null,
      });
    }

    setSleepRecords(newRecords);
    saveSleepData(newRecords, "awake", wakeTime);

    Alert.alert("Wake Time Recorded", `Wake up: ${wakeTime.displayTime}`);
  };

  const clearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all sleep records?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setSleepRecords([]);
            setCurrentStatus("awake");
            setLastAction(null);
            await AsyncStorage.clear();
            Alert.alert("Data Cleared", "All sleep records have been deleted.");
          },
        },
      ],
    );
  };

  const getStatusColor = () => {
    return currentStatus === "sleeping" ? "#4A90E2" : "#50C878";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      <ExpoStatusBar style="auto" />

      <View style={styles.header}>
        <Text style={styles.title}>💤 Sleep Tracker</Text>
        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
        >
          <Text style={styles.statusText}>{currentStatus.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.sleepButton]}
          onPress={recordSleepTime}
        >
          <Text style={styles.buttonText}>😴 Going to Sleep</Text>
          <Text style={styles.buttonSubtext}>Tap when you go to bed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.wakeButton]}
          onPress={recordWakeTime}
        >
          <Text style={styles.buttonText}>☀️ Woke Up</Text>
          <Text style={styles.buttonSubtext}>Tap when you wake up</Text>
        </TouchableOpacity>
      </View>

      {lastAction && (
        <View style={styles.lastActionContainer}>
          <Text style={styles.lastActionText}>
            Last recorded: {lastAction.type === "sleep" ? "😴" : "☀️"}{" "}
            {lastAction.displayTime}
          </Text>
        </View>
      )}

      <ScrollView style={styles.recordsContainer}>
        <View style={styles.recordsHeader}>
          <Text style={styles.recordsTitle}>Sleep History</Text>
          {sleepRecords.length > 0 && (
            <TouchableOpacity onPress={clearAllData} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {sleepRecords.length === 0 ? (
          <Text style={styles.noRecordsText}>
            No sleep records yet. Start by tapping "Going to Sleep" when you go
            to bed!
          </Text>
        ) : (
          sleepRecords.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <Text style={styles.recordDate}>{formatDate(record.date)}</Text>
              <View style={styles.recordDetails}>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>😴 Sleep:</Text>
                  <Text style={styles.timeValue}>
                    {record.sleepTime || "--:--"}
                  </Text>
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>☀️ Wake:</Text>
                  <Text style={styles.timeValue}>
                    {record.wakeTime || "--:--"}
                  </Text>
                </View>
                {record.duration && (
                  <View style={styles.timeRow}>
                    <Text style={styles.timeLabel}>⏱️ Duration:</Text>
                    <Text style={[styles.timeValue, styles.durationText]}>
                      {record.duration}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sleepButton: {
    backgroundColor: "#4A90E2",
  },
  wakeButton: {
    backgroundColor: "#50C878",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  buttonSubtext: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  lastActionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  lastActionText: {
    fontSize: 16,
    color: "#666",
  },
  recordsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recordsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  recordsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  clearButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  noRecordsText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginTop: 50,
    lineHeight: 24,
  },
  recordCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  recordDetails: {
    gap: 8,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 14,
    color: "#666",
  },
  timeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  durationText: {
    color: "#4A90E2",
    fontWeight: "bold",
  },
});

import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  AppState,
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [unlockEvents, setUnlockEvents] = useState([]);
  const [todayUnlocks, setTodayUnlocks] = useState(0);
  const [isTracking, setIsTracking] = useState(true);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    loadUnlockData();

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => subscription?.remove();
  }, []);

  const loadUnlockData = async () => {
    try {
      const savedEvents = await AsyncStorage.getItem("unlockEvents");
      const savedTracking = await AsyncStorage.getItem("isTracking");

      if (savedEvents) {
        const events = JSON.parse(savedEvents);
        setUnlockEvents(events);
        updateTodayCount(events);
      }
      if (savedTracking !== null) {
        setIsTracking(JSON.parse(savedTracking));
      }
    } catch (error) {
      console.error("Error loading unlock data:", error);
    }
  };

  const saveUnlockData = async (events, tracking = null) => {
    try {
      await AsyncStorage.setItem("unlockEvents", JSON.stringify(events));
      if (tracking !== null) {
        await AsyncStorage.setItem("isTracking", JSON.stringify(tracking));
      }
    } catch (error) {
      console.error("Error saving unlock data:", error);
    }
  };

  const handleAppStateChange = (nextAppState) => {
    if (!isTracking) return;

    // Detect when app comes to foreground (phone unlocked)
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      recordUnlockEvent();
    }

    appState.current = nextAppState;
    setAppStateVisible(appState.current);
  };

  const recordUnlockEvent = () => {
    const now = new Date();
    const unlockEvent = {
      id: Date.now(),
      timestamp: now.toISOString(),
      displayTime: now.toLocaleTimeString(),
      displayDate: now.toLocaleDateString(),
      dayOfWeek: now.toLocaleDateString("en-US", { weekday: "short" }),
    };

    const newEvents = [unlockEvent, ...unlockEvents].slice(0, 1000); // Keep last 1000 events
    setUnlockEvents(newEvents);
    updateTodayCount(newEvents);
    saveUnlockData(newEvents);
  };

  const updateTodayCount = (events) => {
    const today = new Date().toLocaleDateString();
    const todayEvents = events.filter((event) => event.displayDate === today);
    setTodayUnlocks(todayEvents.length);
  };

  const toggleTracking = () => {
    const newTracking = !isTracking;
    setIsTracking(newTracking);
    saveUnlockData(unlockEvents, newTracking);
  };

  const clearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all unlock records?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setUnlockEvents([]);
            setTodayUnlocks(0);
            await AsyncStorage.clear();
            Alert.alert(
              "Data Cleared",
              "All unlock records have been deleted.",
            );
          },
        },
      ],
    );
  };

  const getEventsByDate = () => {
    const grouped = {};
    unlockEvents.forEach((event) => {
      const date = event.displayDate;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });
    return grouped;
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

  const getFirstLastUnlock = (events) => {
    if (events.length === 0) return { first: null, last: null };

    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    );

    return {
      first: sortedEvents[0],
      last: sortedEvents[sortedEvents.length - 1],
    };
  };

  const calculateActiveHours = (events) => {
    if (events.length < 2) return null;

    const { first, last } = getFirstLastUnlock(events);
    if (!first || !last) return null;

    const firstTime = new Date(first.timestamp);
    const lastTime = new Date(last.timestamp);
    const diffMs = lastTime - firstTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const eventsByDate = getEventsByDate();

  return (
    <View style={styles.container}>
      <ExpoStatusBar style="auto" />

      <View style={styles.header}>
        <Text style={styles.title}>📱 Phone Usage Tracker</Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isTracking ? "#50C878" : "#FF6B6B" },
            ]}
          >
            <Text style={styles.statusText}>
              {isTracking ? "TRACKING" : "PAUSED"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{todayUnlocks}</Text>
          <Text style={styles.statLabel}>Today's Unlocks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{unlockEvents.length}</Text>
          <Text style={styles.statLabel}>Total Recorded</Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.buttonRow}>
          <View
            style={[
              styles.button,
              styles.toggleButton,
              { backgroundColor: isTracking ? "#FF6B6B" : "#50C878" },
            ]}
            onTouchEnd={toggleTracking}
          >
            <Text style={styles.buttonText}>
              {isTracking ? "⏸️ Pause Tracking" : "▶️ Resume Tracking"}
            </Text>
          </View>

          <View
            style={[styles.button, styles.clearButton]}
            onTouchEnd={clearAllData}
          >
            <Text style={styles.buttonText}>🗑️ Clear Data</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.eventsContainer}>
        <Text style={styles.sectionTitle}>Unlock History</Text>

        {unlockEvents.length === 0 ? (
          <Text style={styles.noEventsText}>
            {isTracking
              ? "No unlock events recorded yet. Lock and unlock your phone to start tracking!"
              : "Tracking is paused. Resume tracking to record unlock events."}
          </Text>
        ) : (
          Object.entries(eventsByDate).map(([date, events]) => {
            const { first, last } = getFirstLastUnlock(events);
            const activeTime = calculateActiveHours(events);

            return (
              <View key={date} style={styles.dateSection}>
                <View style={styles.dateHeader}>
                  <Text style={styles.dateTitle}>{formatDate(date)}</Text>
                  <Text style={styles.unlockCount}>
                    {events.length} unlocks
                  </Text>
                </View>

                {activeTime && (
                  <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>First unlock:</Text>
                      <Text style={styles.summaryValue}>
                        {first.displayTime}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Last unlock:</Text>
                      <Text style={styles.summaryValue}>
                        {last.displayTime}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Active period:</Text>
                      <Text style={[styles.summaryValue, styles.activeTime]}>
                        {activeTime}
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.eventsGrid}>
                  {events.slice(0, 20).map((event) => (
                    <View key={event.id} style={styles.eventCard}>
                      <Text style={styles.eventTime}>{event.displayTime}</Text>
                    </View>
                  ))}
                  {events.length > 20 && (
                    <View style={styles.moreCard}>
                      <Text style={styles.moreText}>
                        +{events.length - 20} more
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          App automatically tracks when you unlock your phone
        </Text>
      </View>
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
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  statusContainer: {
    alignItems: "center",
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
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4A90E2",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  controlsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  toggleButton: {
    // Color set dynamically
  },
  clearButton: {
    backgroundColor: "#FF6B6B",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  noEventsText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginTop: 50,
    lineHeight: 24,
  },
  dateSection: {
    marginBottom: 25,
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  unlockCount: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "#E8E8E8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  summaryCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  activeTime: {
    color: "#4A90E2",
    fontWeight: "bold",
  },
  eventsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  eventCard: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  eventTime: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  moreCard: {
    backgroundColor: "#E8E8E8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  moreText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  footer: {
    padding: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    backgroundColor: "white",
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});

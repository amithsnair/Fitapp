import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dumbbell, ClipboardList, Weight } from "lucide-react-native";
import { useTheme } from "./context/ThemeContext";

// Import components
import Header from "./components/Header";
import ExerciseSelector from "./components/ExerciseSelector";
import WorkoutHistory from "./components/WorkoutHistory";
import CustomWorkoutModal from "./components/CustomWorkoutModal";
import ProfileMenu from "./components/ProfileMenu";
import LogBodyWeight from "./components/LogBodyWeight";
import ProgressStats from "./components/ProgressStats";
import Settings from "./components/Settings";
import WeightTracker from "./components/weighttracker";

interface WorkoutEntry {
  id: string;
  date: string;
  bodyPart: string;
  exerciseName: string;
  timestamp: string;
  value?: string;
  valueType?: string;
}

interface WorkoutData {
  name: string;
  bodyPart: string;
  description: string;
}

export default function Dashboard() {
  const { isDarkMode } = useTheme();
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [isCustomWorkoutModalVisible, setCustomWorkoutModalVisible] =
    useState(false);
  const [isProfileMenuVisible, setProfileMenuVisible] = useState(false);
  const [isWeightTrackerVisible, setWeightTrackerVisible] = useState(false);
  const [isProgressStatsVisible, setProgressStatsVisible] = useState(false);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"exercise" | "history" | "weight">("exercise");

  // Load workouts from AsyncStorage on component mount
  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const storedWorkouts = await AsyncStorage.getItem("workouts");
        if (storedWorkouts) {
          setWorkouts(JSON.parse(storedWorkouts));
        }
      } catch (error) {
        console.error("Error loading workouts:", error);
      }
    };

    loadWorkouts();
  }, []);

  // Save workouts to AsyncStorage whenever they change
  useEffect(() => {
    const saveWorkouts = async () => {
      try {
        await AsyncStorage.setItem("workouts", JSON.stringify(workouts));
      } catch (error) {
        console.error("Error saving workouts:", error);
      }
    };

    if (workouts.length > 0) {
      saveWorkouts();
    }
  }, [workouts]);

  const handleAddCustomWorkout = () => {
    setCustomWorkoutModalVisible(true);
  };

  const handleSaveCustomWorkout = (workoutData: WorkoutData) => {
    // This would typically add the custom workout to a list of available exercises
    console.log("Custom workout saved:", workoutData);
    // Close the modal
    setCustomWorkoutModalVisible(false);
  };

  const handleLogWorkout = (
    bodyPart: string,
    exerciseName: string,
    value: string,
    valueType: string,
  ) => {
    const newWorkout: WorkoutEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      bodyPart,
      exerciseName,
      value,
      valueType,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setWorkouts([newWorkout, ...workouts]);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    setWorkouts(workouts.filter((workout) => workout.id !== workoutId));
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <Header
        onProfilePress={() => setProfileMenuVisible(true)}
      />
      <View className="flex-1 px-4">
        {/* Tab Navigation */}
        <View className="flex-row justify-between mb-4 mt-2">
          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center py-2 ${activeTab === "exercise" ? (isDarkMode ? "bg-gray-800" : "bg-blue-500") : "bg-transparent"} rounded-l-lg`}
            onPress={() => setActiveTab("exercise")}
          >
            <Dumbbell
              size={20}
              color={activeTab === "exercise" ? "white" : (isDarkMode ? "#9ca3af" : "#6b7280")}
            />
            <Text
              className={`ml-2 font-medium ${activeTab === "exercise" ? "text-white" : (isDarkMode ? "text-gray-400" : "text-gray-600")}`}
            >
              Exercise
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center py-2 ${activeTab === "history" ? (isDarkMode ? "bg-gray-800" : "bg-blue-500") : "bg-transparent"}`}
            onPress={() => setActiveTab("history")}
          >
            <ClipboardList
              size={20}
              color={activeTab === "history" ? "white" : (isDarkMode ? "#9ca3af" : "#6b7280")}
            />
            <Text
              className={`ml-2 font-medium ${activeTab === "history" ? "text-white" : (isDarkMode ? "text-gray-400" : "text-gray-600")}`}
            >
              History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center py-2 ${activeTab === "weight" ? (isDarkMode ? "bg-gray-800" : "bg-blue-500") : "bg-transparent"} rounded-r-lg`}
            onPress={() => setActiveTab("weight")}
          >
            <Weight
              size={20}
              color={activeTab === "weight" ? "white" : (isDarkMode ? "#9ca3af" : "#6b7280")}
            />
            <Text
              className={`ml-2 font-medium ${activeTab === "weight" ? "text-white" : (isDarkMode ? "text-gray-400" : "text-gray-600")}`}
            >
              Body Weight
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "exercise" ? (
          <ExerciseSelector onLogWorkout={handleLogWorkout} />
        ) : activeTab === "history" ? (
          <WorkoutHistory
            workouts={workouts}
            onDeleteWorkout={handleDeleteWorkout}
          />
        ) : (
          <WeightTracker
            visible={true}
            onClose={() => setActiveTab("exercise")}
          />
        )}
      </View>

      {/* Modals */}
      <ProfileMenu
        visible={isProfileMenuVisible}
        onClose={() => setProfileMenuVisible(false)}
        onLogBodyWeight={() => setWeightTrackerVisible(true)}
        onProgressStats={() => setProgressStatsVisible(true)}
        onSettings={() => setSettingsVisible(true)}
      />

      <CustomWorkoutModal
        visible={isCustomWorkoutModalVisible}
        onClose={() => setCustomWorkoutModalVisible(false)}
        onSave={handleSaveCustomWorkout}
      />

      <WeightTracker
        visible={isWeightTrackerVisible}
        onClose={() => setWeightTrackerVisible(false)}
      />

      <ProgressStats
        visible={isProgressStatsVisible}
        onClose={() => setProgressStatsVisible(false)}
      />

      <Settings
        visible={isSettingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </SafeAreaView>
  );
}

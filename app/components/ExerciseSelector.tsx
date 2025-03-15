import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ChevronDown, Dumbbell, Clock, Weight } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

// Conditionally import AdMob only on native platforms
let AdMobBanner;
if (Platform.OS !== "web") {
  try {
    const AdMob = require('expo-ads-admob');
    AdMobBanner = AdMob.AdMobBanner;
  } catch (error) {
    console.warn("AdMob not available:", error);
  }
}

interface ExerciseSelectorProps {
  onLogWorkout?: (
    bodyPart: string,
    exercise: string,
    value: string,
    valueType: string,
  ) => void;
}

const ExerciseSelector = ({ onLogWorkout }: ExerciseSelectorProps) => {
  const { isDarkMode } = useTheme();
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("Chest");
  const [selectedExercise, setSelectedExercise] =
    useState<string>("Bench Press");
  const [bodyPartDropdownOpen, setBodyPartDropdownOpen] =
    useState<boolean>(false);
  const [exerciseDropdownOpen, setExerciseDropdownOpen] =
    useState<boolean>(false);
  const [maxWeight, setMaxWeight] = useState<string>("");
  const [duration, setDuration] = useState<string>("");

  // Mock data for body parts and exercises
  const bodyParts = [
    "Chest",
    "Back",
    "Legs",
    "Shoulders",
    "Cardio",
    "Abs",
    "Biceps",
    "Triceps",
  ];

  const [exercisesByBodyPart, setExercisesByBodyPart] = useState<Record<string, string[]>>({    
    Chest: ["Bench Press", "Incline Press", "Chest Fly", "Push-ups", "Decline Press"],
    Back: ["Pull-ups", "Deadlift", "Bent Over Row", "Lat Pulldown", "T-Bar Row"],
    Legs: ["Squat", "Leg Press", "Lunges", "Leg Extension", "Hamstring Curl"],
    Shoulders: ["Shoulder Press", "Lateral Raise", "Front Raise", "Reverse Fly", "Shrugs"],
    Cardio: ["Running", "Cycling", "Jump Rope", "Stair Climber", "Elliptical"],
    Abs: ["Crunches", "Plank", "Russian Twist", "Leg Raises", "Ab Rollout"],
    Biceps: ["Bicep Curl", "Hammer Curl", "Preacher Curl", "Concentration Curl", "Cable Curl"],
    Triceps: ["Tricep Extension", "Skull Crushers", "Tricep Pushdown", "Dips", "Close-Grip Bench Press"]
  });
  useEffect(() => {
    const loadCustomExercises = async () => {
      try {
        const customExercisesJson = await AsyncStorage.getItem("customExercises");
        if (customExercisesJson) {
          const customExercises = JSON.parse(customExercisesJson);
          // Create a new object to store merged exercises
          const mergedExercises = { ...exercisesByBodyPart };
          
          // Merge custom exercises with default exercises
          Object.keys(customExercises).forEach((bodyPart) => {
            if (mergedExercises[bodyPart]) {
              // Add unique exercises only
              customExercises[bodyPart].forEach((exercise: string) => {
                if (!mergedExercises[bodyPart].includes(exercise)) {
                  mergedExercises[bodyPart].push(exercise);
                }
              });
            } else {
              mergedExercises[bodyPart] = customExercises[bodyPart];
            }
          });
          
          // Update the state with merged exercises
          setExercisesByBodyPart(mergedExercises);
        }
      } catch (error) {
        console.error("Error loading custom exercises:", error);
      }
    };

    loadCustomExercises();
  }, []);

  // Reload custom exercises when body part changes
  useEffect(() => {
    const reloadCustomExercises = async () => {
      try {
        const customExercisesJson = await AsyncStorage.getItem("customExercises");
        if (customExercisesJson) {
          const customExercises = JSON.parse(customExercisesJson);
          if (customExercises[selectedBodyPart]) {
            const defaultExercises = exercisesByBodyPart[selectedBodyPart] || [];
            const allExercises = [...new Set([...defaultExercises, ...customExercises[selectedBodyPart]])];
            setExercisesByBodyPart(prev => ({
              ...prev,
              [selectedBodyPart]: allExercises
            }));
          }
        }
      } catch (error) {
        console.error("Error reloading custom exercises:", error);
      }
    };

    reloadCustomExercises();
  }, [selectedBodyPart]);
  const handleLogWorkout = async () => {
    if (onLogWorkout) {
      // Save custom exercise if it's not in the list
      if (
        selectedExercise &&
        !exercisesByBodyPart[selectedBodyPart]?.includes(selectedExercise)
      ) {
        try {
          // Get existing custom exercises
          const customExercisesJson = await AsyncStorage.getItem("customExercises");
          const customExercises = customExercisesJson
            ? JSON.parse(customExercisesJson)
            : {};

          // Initialize array for body part if it doesn't exist
          if (!customExercises[selectedBodyPart]) {
            customExercises[selectedBodyPart] = [];
          }

          // Add new exercise if it's not already in the list
          if (!customExercises[selectedBodyPart].includes(selectedExercise)) {
            customExercises[selectedBodyPart].push(selectedExercise);
            
            // Save updated custom exercises
            await AsyncStorage.setItem(
              "customExercises",
              JSON.stringify(customExercises)
            );

            // Update local state
            setExercisesByBodyPart(prev => ({
              ...prev,
              [selectedBodyPart]: [...(prev[selectedBodyPart] || []), selectedExercise]
            }));
          }
        } catch (error) {
          console.error("Error saving custom exercise:", error);
        }
      }

      // Determine if we're logging weight or duration
      const isCardio = selectedBodyPart === "Cardio";
      const valueType = isCardio ? "duration" : "weight";
      const value = isCardio ? duration : maxWeight;

      onLogWorkout(selectedBodyPart, selectedExercise, value, valueType);

      // Reset fields after logging
      setMaxWeight("");
      setDuration("");
    }
  };



  // Update selected exercise when body part changes
  useEffect(() => {
    if (
      exercisesByBodyPart[selectedBodyPart] &&
      exercisesByBodyPart[selectedBodyPart].length > 0
    ) {
      setSelectedExercise(exercisesByBodyPart[selectedBodyPart][0]);
    }
  }, [selectedBodyPart]);

  const handleBodyPartSelect = (bodyPart: string) => {
    setSelectedBodyPart(bodyPart);
    setBodyPartDropdownOpen(false);
    // Reset weight/duration when changing body part
    setMaxWeight("");
    setDuration("");
  };

  const handleExerciseSelect = (exercise: string) => {
    setSelectedExercise(exercise);
    setExerciseDropdownOpen(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className={`w-full pt-10 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
    >
      <View className={`w-full p-4 rounded-lg shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Select Exercise
        </Text>

        {/* Body Part Dropdown */}
        <View className="mb-4">
          <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Body Part
          </Text>
          <TouchableOpacity
            className={`flex-row items-center justify-between p-3 border rounded-lg ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}
            onPress={() => setBodyPartDropdownOpen(!bodyPartDropdownOpen)}
          >
            <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{selectedBodyPart}</Text>
            <ChevronDown size={20} color={isDarkMode ? "#9ca3af" : "#4b5563"} />
          </TouchableOpacity>

          {bodyPartDropdownOpen && (
            <View className={`border rounded-lg mt-1 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
              {bodyParts.map((bodyPart) => (
                <TouchableOpacity
                  key={bodyPart}
                  className={`p-3 ${bodyPart === selectedBodyPart ? (isDarkMode ? "bg-blue-900" : "bg-blue-50") : ""}`}
                  onPress={() => handleBodyPartSelect(bodyPart)}
                >
                  <Text
                    className={`${bodyPart === selectedBodyPart ? "text-blue-600 font-medium" : (isDarkMode ? "text-gray-300" : "text-gray-800")}`}
                  >
                    {bodyPart}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Exercise Dropdown/Input */}
        <View className="mb-4">
          <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Exercise
          </Text>
          <TouchableOpacity
            onPress={() => setExerciseDropdownOpen(!exerciseDropdownOpen)}
            className={`flex-row items-center justify-between border rounded-lg ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}
          >
            <TextInput
              className={`flex-1 p-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
              placeholder="Enter or select exercise"
              placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
              value={selectedExercise}
              onChangeText={setSelectedExercise}
            />
            <ChevronDown size={20} color={isDarkMode ? "#9ca3af" : "#4b5563"} style={{ marginRight: 12 }} />
          </TouchableOpacity>

          {exerciseDropdownOpen && (
            <View className={`border rounded-lg mt-1 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
              {exercisesByBodyPart[selectedBodyPart]?.map((exercise) => (
                <TouchableOpacity
                  key={exercise}
                  className={`p-3 ${exercise === selectedExercise ? (isDarkMode ? "bg-blue-900" : "bg-blue-50") : ""}`}
                  onPress={() => handleExerciseSelect(exercise)}
                >
                  <Text
                    className={`${exercise === selectedExercise ? "text-blue-600 font-medium" : (isDarkMode ? "text-gray-300" : "text-gray-800")}`}
                  >
                    {exercise}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Weight/Duration Input */}
        <View className="mb-4">
          <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {selectedBodyPart === "Cardio" ? "Duration (minutes)" : "Max Weight (kg)"}
          </Text>
          <View className={`flex-row items-center border rounded-lg ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
            <TextInput
              className={`flex-1 p-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
              placeholder={selectedBodyPart === "Cardio" ? "Enter duration" : "Enter max weight"}
              placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
              value={selectedBodyPart === "Cardio" ? duration : maxWeight}
              onChangeText={selectedBodyPart === "Cardio" ? setDuration : setMaxWeight}
              keyboardType="numeric"
            />
            {selectedBodyPart === "Cardio" ? 
              <Clock size={20} color={isDarkMode ? "#9ca3af" : "#4b5563"} style={{ marginRight: 12 }} /> :
              <Weight size={20} color={isDarkMode ? "#9ca3af" : "#4b5563"} style={{ marginRight: 12 }} />
            }
          </View>
        </View>

        {/* Log Button */}
        <TouchableOpacity
          className="bg-blue-500 py-3 px-4 rounded-lg flex-row items-center justify-center"
          onPress={handleLogWorkout}
        >
          <Dumbbell size={20} color="white" />
          <Text className="text-white font-bold ml-2">Log Workout</Text>
        </TouchableOpacity>
        
        {/* AdMob Banner - Only show on native platforms */}
        {Platform.OS !== "web" && typeof AdMobBanner === 'function' && (
          <View className="mt-6">
            <AdMobBanner
              bannerSize="smartBannerPortrait"
              adUnitID="ca-app-pub-7195531441696154/4636747999"
              servePersonalizedAds={true}
              onDidFailToReceiveAdWithError={(error) => console.error(error)}
            />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default ExerciseSelector;

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { ChevronDown, X } from "lucide-react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ProgressStatsProps {
  visible: boolean;
  onClose: () => void;
}

interface WorkoutEntry {
  id: string;
  date: string;
  bodyPart: string;
  exerciseName: string;
  timestamp: string;
  value?: string;
  valueType?: string;
}

const ProgressStats = ({ visible, onClose }: ProgressStatsProps) => {
  const { isDarkMode } = useTheme();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("Chest");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [workoutData, setWorkoutData] = useState<WorkoutEntry[]>([]);

  const muscleGroups = [
    "Chest",
    "Back",
    "Legs",
    "Shoulders",
    "Arms",
    "Abs",
  ];

  useEffect(() => {
    loadWorkoutData();
  }, []);

  const loadWorkoutData = async () => {
    try {
      const workouts = await AsyncStorage.getItem("workouts");
      if (workouts) {
        setWorkoutData(JSON.parse(workouts));
      }
    } catch (error) {
      console.error("Error loading workout data:", error);
    }
  };

  const getProgressData = () => {
    // Filter workouts by selected muscle group and exclude cardio (which uses duration)
    const filteredWorkouts = workoutData.filter(
      (workout) => workout.bodyPart === selectedMuscleGroup && workout.valueType === 'weight' && workout.value
    );

    // Group workouts by date to find maximum weight for each day
    const workoutsByDate = filteredWorkouts.reduce((acc, workout) => {
      const date = workout.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(parseFloat(workout.value || '0'));
      return acc;
    }, {} as Record<string, number[]>);

    // Get dates and maximum weights
    const entries = Object.entries(workoutsByDate)
      .map(([date, weights]) => ({
        date,
        maxWeight: Math.max(...weights)
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const labels = entries.map(entry => entry.date);
    const data = entries.map(entry => entry.maxWeight);

    return {
      labels: labels.slice(-7), // Show last 7 data points
      datasets: [
        {
          data: data.slice(-7),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue color
          strokeWidth: 2,
        },
      ],
    };
  };

  const chartConfig = {
    backgroundGradientFrom: isDarkMode ? "#1f2937" : "#ffffff",
    backgroundGradientTo: isDarkMode ? "#1f2937" : "#ffffff",
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <View className={`flex-row justify-between items-center p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Progress Stats</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={24} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Muscle Group Dropdown */}
          <View className="mb-6">
            <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Select Muscle Group
            </Text>
            <TouchableOpacity
              className={`flex-row items-center justify-between p-3 border rounded-lg ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}
              onPress={() => setDropdownOpen(!dropdownOpen)}
            >
              <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{selectedMuscleGroup}</Text>
              <ChevronDown size={20} color={isDarkMode ? "#9ca3af" : "#4b5563"} />
            </TouchableOpacity>

            {dropdownOpen && (
              <View className={`border rounded-lg mt-1 ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}>
                {muscleGroups.map((group) => (
                  <TouchableOpacity
                    key={group}
                    className={`p-3 ${group === selectedMuscleGroup ? (isDarkMode ? "bg-blue-900" : "bg-blue-50") : ""}`}
                    onPress={() => {
                      setSelectedMuscleGroup(group);
                      setDropdownOpen(false);
                    }}
                  >
                    <Text
                      className={`${group === selectedMuscleGroup ? "text-blue-600 font-medium" : (isDarkMode ? "text-gray-300" : "text-gray-800")}`}
                    >
                      {group}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Progress Graph */}
          <View className={`rounded-lg p-4 shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Strength Progress - {selectedMuscleGroup}
            </Text>
            {workoutData.length > 0 ? (
              <LineChart
                data={getProgressData()}
                width={Dimensions.get("window").width - 48}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            ) : (
              <View className="h-[220px] justify-center items-center">
                <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No workout data available</Text>
              </View>
            )}
          </View>

          {/* Stats Summary */}
          <View className={`mt-6 rounded-lg p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Text className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Progress Summary
            </Text>
            <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Track your strength development over time. The graph shows your
              progress for the selected muscle group based on the weights used in
              your workouts.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default ProgressStats;
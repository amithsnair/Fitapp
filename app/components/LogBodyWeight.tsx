import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { X, Save } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { LineChart } from "react-native-chart-kit";

interface LogBodyWeightProps {
  visible: boolean;
  onClose: () => void;
}

interface WeightEntry {
  weight: string;
  date: string;
  timestamp: string;
}

const LogBodyWeight = ({ visible, onClose }: LogBodyWeightProps) => {
  const { isDarkMode } = useTheme();
  const [weight, setWeight] = useState<string>("");
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);

  useEffect(() => {
    loadWeightHistory();
  }, []);

  const loadWeightHistory = async () => {
    try {
      const history = await AsyncStorage.getItem("weightHistory");
      if (history) {
        setWeightHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error("Error loading weight history:", error);
    }
  };

  const handleSave = async () => {
    if (!weight) return;

    const newEntry: WeightEntry = {
      weight,
      date: new Date().toISOString().split("T")[0],
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedHistory = [newEntry, ...weightHistory];

    try {
      await AsyncStorage.setItem("weightHistory", JSON.stringify(updatedHistory));
      setWeightHistory(updatedHistory);
      setWeight("");
    } catch (error) {
      console.error("Error saving weight:", error);
    }
  };

  const getChartData = () => {
    const sortedHistory = [...weightHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      labels: sortedHistory.slice(-7).map(entry => entry.date),
      datasets: [
        {
          data: sortedHistory.slice(-7).map(entry => parseFloat(entry.weight)),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
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
    decimalPlaces: 1,
    style: {
      borderRadius: 16,
    },
  };

  if (!visible) return null;

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <View className={`flex-row justify-between items-center p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Body Weight Tracker
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Weight Input Section */}
        <View className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Current Weight (kg)
          </Text>
          <View className="flex-row space-x-2">
            <TextInput
              className={`flex-1 border rounded-lg p-3 ${isDarkMode ? 'border-gray-600 text-white bg-gray-700' : 'border-gray-300 text-gray-800 bg-white'}`}
              placeholder="Enter your weight"
              placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
            <TouchableOpacity
              onPress={handleSave}
              className="bg-blue-500 px-4 rounded-lg flex-row items-center justify-center"
            >
              <Save size={20} color="white" />
              <Text className="text-white font-bold ml-2">Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Weight Progress Chart */}
        <View className={`rounded-lg p-4 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Body Weight Progress
          </Text>
          {weightHistory.length > 0 ? (
            <LineChart
              data={getChartData()}
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
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No weight history available
              </Text>
            </View>
          )}
        </View>

        {/* Weight History List */}
        <View className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Body Weight History
          </Text>
          {weightHistory.map((entry, index) => (
            <View
              key={index}
              className={`flex-row justify-between items-center py-3 ${index !== weightHistory.length - 1 ? (isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200') : ''}`}
            >
              <View>
                <Text className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  {entry.weight} kg
                </Text>
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {entry.date}
                </Text>
              </View>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {entry.timestamp}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default LogBodyWeight;
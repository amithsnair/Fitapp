import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Save, Trash2 } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

interface WeightTrackerProps {
  visible: boolean;
  onClose: () => void;
}

interface WeightEntry {
  weight: string;
  date: string;
  timestamp: string;
}

const WeightTracker = ({ visible, onClose }: WeightTrackerProps) => {
  const { isDarkMode } = useTheme();
  const [weight, setWeight] = useState<string>("");
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

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

  const handleDelete = async (index: number) => {
    const updatedHistory = [...weightHistory];
    updatedHistory.splice(index, 1);

    try {
      await AsyncStorage.setItem("weightHistory", JSON.stringify(updatedHistory));
      setWeightHistory(updatedHistory);
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting weight entry:", error);
    }
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
          <View className="flex-col">
            <TextInput
              className={`w-full border rounded-lg p-3 ${isDarkMode ? 'border-gray-600 text-white bg-gray-700' : 'border-gray-300 text-gray-800 bg-white'}`}
              placeholder="Enter your weight"
              placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
            <TouchableOpacity
              onPress={handleSave}
              className="bg-blue-500 py-3 rounded-lg flex-row items-center justify-center"
              style={{ marginTop: 40 }}
            >
              <Save size={20} color="white" />
              <Text className="text-white font-bold ml-2">Save</Text>
            </TouchableOpacity>
          </View>
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
              <View className="flex-row items-center">
                <Text className={`text-sm mr-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {entry.timestamp}
                </Text>
                <TouchableOpacity 
                  onPress={() => setConfirmDelete(index)}
                  className="p-2"
                >
                  <Trash2 size={18} color={isDarkMode ? "#ef4444" : "#dc2626"} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      {confirmDelete !== null && (
        <Modal
          transparent={true}
          visible={confirmDelete !== null}
          animationType="fade"
          onRequestClose={() => setConfirmDelete(null)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className={`w-4/5 p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <Text className={`text-lg font-bold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Delete Body Weight Entry
              </Text>
              <Text className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure you want to delete this body weight entry? This action cannot be undone.
              </Text>
              <View className="flex-row justify-center w-full">
                <View className="w-[45%] mr-4">
                  <TouchableOpacity 
                    onPress={() => handleDelete(confirmDelete)}
                    className="bg-red-500 py-2 rounded-lg items-center w-full"
                  >
                    <Text className="text-white font-medium">Delete</Text>
                  </TouchableOpacity>
                </View>
                <View className="w-[45%]">
                  <TouchableOpacity 
                    onPress={() => setConfirmDelete(null)}
                    className={`py-2 rounded-lg items-center w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                  >
                    <Text className={isDarkMode ? 'text-white' : 'text-gray-800'}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default WeightTracker;
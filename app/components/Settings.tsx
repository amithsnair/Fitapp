import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Switch, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { X, Save } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

interface SettingsProps {
  visible: boolean;
  onClose: () => void;
}

const Settings = ({ visible, onClose }: SettingsProps) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMetric, setIsMetric] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const measurementSystem = await AsyncStorage.getItem("measurementSystem");
      const name = await AsyncStorage.getItem("userName");

      setIsMetric(measurementSystem !== "imperial");
      if (name) setUserName(name);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem("measurementSystem", isMetric ? "metric" : "imperial");
      await AsyncStorage.setItem("userName", userName);
      onClose();
    } catch (error) {
      console.error("Error saving settings:", error);
    }
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
          <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Settings</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={24} color={isDarkMode ? "#ffffff" : "#6b7280"} />
          </TouchableOpacity>
        </View>

        <View className="p-4 space-y-6">
          {/* Theme Toggle */}
          <View className="flex-row justify-between items-center">
            <Text className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#d1d5db", true: "#93c5fd" }}
              thumbColor={isDarkMode ? "#3b82f6" : "#f3f4f6"}
            />
          </View>

          {/* Measurement System Toggle */}
          <View className="flex-row justify-between items-center">
            <Text className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Use Metric System</Text>
            <Switch
              value={isMetric}
              onValueChange={setIsMetric}
              trackColor={{ false: "#d1d5db", true: "#93c5fd" }}
              thumbColor={isMetric ? "#3b82f6" : "#f3f4f6"}
            />
          </View>

          {/* User Name Input */}
          <View>
            <Text className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Your Name</Text>
            <TextInput
              className={`border rounded-lg p-3 ${isDarkMode ? 'border-gray-600 text-white bg-gray-800' : 'border-gray-300 text-gray-800 bg-gray-50'}`}
              placeholder="Enter your name"
              value={userName}
              onChangeText={setUserName}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            className="bg-blue-500 py-3 px-4 rounded-lg flex-row items-center justify-center mt-4"
          >
            <Save size={20} color="white" />
            <Text className="text-white font-bold ml-2">Save Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default Settings;
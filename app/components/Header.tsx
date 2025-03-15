import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Menu } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

interface HeaderProps {
  userName?: string;
  onProfilePress?: () => void;
}

const Header = ({ userName = "Fitness Enthusiast", onProfilePress }: HeaderProps) => {
  const { isDarkMode } = useTheme();
  const [storedName, setStoredName] = useState<string>(userName);
  const [greeting, setGreeting] = useState<string>("Good day");

  useEffect(() => {
    // Get time of day for appropriate greeting
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
    };

    setGreeting(getGreeting());

    // Fetch user name from AsyncStorage
    const fetchUserName = async () => {
      try {
        const name = await AsyncStorage.getItem("userName");
        if (name) {
          setStoredName(name);
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };

    fetchUserName();
  }, []);

  return (
    <View className={`w-full px-4 pt-16 pb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-blue-500'}`}>
      <View className="flex-row items-center">
        <TouchableOpacity 
          className={`p-2 rounded-full mr-4 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-400'}`}
          onPress={onProfilePress}
        >
          <Menu size={24} color="white" />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-lg font-bold">{greeting},</Text>
          <Text className="text-white text-2xl font-bold">{storedName}</Text>
        </View>
      </View>
    </View>
  );
};

export default Header;

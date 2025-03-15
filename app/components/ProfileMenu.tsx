import React from "react";
import { View, Text, TouchableOpacity, Modal, Linking } from "react-native";
import { X, Settings, Instagram } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

interface ProfileMenuProps {
  visible: boolean;
  onClose: () => void;
  onProgressStats: () => void;
  onSettings: () => void;
  onLogBodyWeight: () => void;
}

const ProfileMenu = ({
  visible,
  onClose,
  onProgressStats,
  onSettings,
  onLogBodyWeight,
}: ProfileMenuProps) => {
  const { isDarkMode } = useTheme();
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View 
          className={`absolute left-0 top-0 h-full w-[80%] max-w-[300px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          style={{
            shadowColor: '#000',
            shadowOffset: {
              width: 2,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            transform: [{ translateX: visible ? 0 : -300 }]
          }}
        >
          {/* Header */}
          <View className={`flex-row justify-between items-center p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Menu</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <X size={24} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View className="p-4">
            <TouchableOpacity
              className="flex-row items-center py-3"
              onPress={onSettings}
            >
              <Settings size={24} color="#3b82f6" />
              <Text className={`ml-3 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Settings</Text>
            </TouchableOpacity>

            {/* About Developer Section */}
            <View className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <Text className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>About Developer</Text>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Amith S Nair</Text>
              <View className="flex-row items-center mt-2">
                <Instagram size={20} color="#3b82f6" />
                <TouchableOpacity onPress={() => Linking.openURL('https://www.instagram.com/amith_arash/')}>
                  <Text className="ml-2 text-blue-500">amith_arash</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ProfileMenu;
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { X, Save, Plus } from "lucide-react-native";

interface CustomWorkoutModalProps {
  visible?: boolean;
  onClose?: () => void;
  onSave?: (workout: WorkoutData) => void;
}

interface WorkoutData {
  name: string;
  bodyPart: string;
  description: string;
}

const CustomWorkoutModal = ({
  visible = true,
  onClose = () => {},
  onSave = () => {},
}: CustomWorkoutModalProps) => {
  const [workoutName, setWorkoutName] = useState("");
  const [bodyPart, setBodyPart] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    // Create workout data object
    const workoutData: WorkoutData = {
      name: workoutName,
      bodyPart: bodyPart,
      description: description,
    };

    // Call the onSave callback with the workout data
    onSave(workoutData);

    // Reset form fields
    setWorkoutName("");
    setBodyPart("");
    setDescription("");

    // Close the modal
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white w-[350px] rounded-xl p-6 shadow-lg">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-800">
              Add Custom Workout
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="max-h-[300px]">
            {/* Workout Name Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Workout Name
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-800 bg-gray-50"
                placeholder="Enter workout name"
                value={workoutName}
                onChangeText={setWorkoutName}
              />
            </View>

            {/* Body Part Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Body Part
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-800 bg-gray-50"
                placeholder="Enter body part"
                value={bodyPart}
                onChangeText={setBodyPart}
              />
            </View>

            {/* Description Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Description
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-800 bg-gray-50"
                placeholder="Enter workout description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row justify-end mt-4 space-x-3">
            <TouchableOpacity
              onPress={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <Text className="text-gray-700 font-medium">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              className="px-4 py-2 bg-blue-500 rounded-lg flex-row items-center"
            >
              <Save size={18} color="#ffffff" />
              <Text className="text-white font-medium ml-1">Save Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomWorkoutModal;

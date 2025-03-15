import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Download,
} from "lucide-react-native";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface WorkoutEntry {
  id: string;
  date: string;
  bodyPart: string;
  exerciseName: string;
  timestamp: string;
  value?: string;
  valueType?: string;
}

interface WorkoutHistoryProps {
  workouts?: WorkoutEntry[];
  onWorkoutPress?: (workout: WorkoutEntry) => void;
  onDeleteWorkout?: (workoutId: string) => void;
}

const WorkoutHistory = ({
  workouts = [
    {
      id: "1",
      date: "2023-06-15",
      bodyPart: "Legs",
      exerciseName: "Squats",
      timestamp: "09:30 AM",
    },
    {
      id: "2",
      date: "2023-06-15",
      bodyPart: "Legs",
      exerciseName: "Lunges",
      timestamp: "09:45 AM",
    },
    {
      id: "3",
      date: "2023-06-14",
      bodyPart: "Chest",
      exerciseName: "Bench Press",
      timestamp: "10:15 AM",
    },
    {
      id: "4",
      date: "2023-06-13",
      bodyPart: "Arms",
      exerciseName: "Bicep Curls",
      timestamp: "11:00 AM",
    },
    {
      id: "5",
      date: "2023-06-13",
      bodyPart: "Arms",
      exerciseName: "Tricep Extensions",
      timestamp: "11:20 AM",
    },
  ],
  onWorkoutPress = () => {},
  onDeleteWorkout = () => {},
}: WorkoutHistoryProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string>(
    today.toISOString().split("T")[0],
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(today);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<string>("");

  // Group workouts by date
  const groupedWorkouts = workouts.reduce(
    (groups, workout) => {
      if (!groups[workout.date]) {
        groups[workout.date] = [];
      }
      groups[workout.date].push(workout);
      return groups;
    },
    {} as Record<string, WorkoutEntry[]>,
  );

  // Get dates with workouts for the current month
  const getDatesWithWorkouts = () => {
    return Object.keys(groupedWorkouts).filter((date) => {
      const workoutDate = new Date(date);
      return (
        workoutDate.getMonth() === currentMonth.getMonth() &&
        workoutDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  // Format date for display (e.g., "June 15, 2023")
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format month for display (e.g., "March 2025")
  const formatMonth = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
    };
    return date.toLocaleDateString(undefined, options);
  };

  // Generate days for the calendar
  const generateCalendarDays = () => {
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    ).getDate();

    const datesWithWorkouts = getDatesWithWorkouts();
    const today = new Date().getDate();
    const currentMonthDate = new Date().getMonth() === currentMonth.getMonth() && 
                            new Date().getFullYear() === currentMonth.getFullYear();

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const hasWorkout = datesWithWorkouts.includes(dateString);
      const isToday = currentMonthDate && i === today;

      days.push({
        day: i,
        date: dateString,
        hasWorkout,
        isSelected: dateString === selectedDate,
        isToday
      });
    }
    return days;
  };

  // Scroll to center current day when month changes or component mounts
  useEffect(() => {
    if (scrollViewRef.current) {
      const today = new Date().getDate();
      const currentMonthDate = new Date().getMonth() === currentMonth.getMonth() && 
                              new Date().getFullYear() === currentMonth.getFullYear();
      
      if (currentMonthDate) {
        // Calculate scroll position to center current day
        const dayWidth = 36; // width of day button (w-9)
        const screenWidth = Dimensions.get('window').width;
        const scrollPosition = (today - 1) * dayWidth - (screenWidth - dayWidth) / 2;
        
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ x: Math.max(0, scrollPosition), animated: true });
        }, 100);
      }
    }
  }, [currentMonth]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  // Handle workout deletion
  const handleDeleteWorkout = (workoutId: string) => {
    setWorkoutToDelete(workoutId);
    setDeleteModalVisible(true);
  };

  // Confirm workout deletion
  const confirmDeleteWorkout = () => {
    onDeleteWorkout(workoutToDelete);
    setDeleteModalVisible(false);
  };

  // Get day of week abbreviation
  const getDayOfWeekAbbr = (index: number) => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return days[index];
  };

  // Export workout history to CSV
  const exportWorkoutHistory = async () => {
    try {
      // Create CSV header
      let csvContent = "Date,Body Part,Exercise,Time,Value,Value Type\n";
      
      // Add all workout entries
      workouts.forEach(workout => {
        const date = workout.date;
        const bodyPart = workout.bodyPart.replace(/,/g, ' ');
        const exercise = workout.exerciseName.replace(/,/g, ' ');
        const time = workout.timestamp;
        const value = workout.value || '';
        const valueType = workout.valueType || '';
        
        csvContent += `${date},${bodyPart},${exercise},${time},${value},${valueType}\n`;
      });
      
      if (Platform.OS === 'web') {
        // For web, create a download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `workout-history-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For mobile, save file and share
        const fileUri = `${FileSystem.documentDirectory}workout-history-${new Date().toISOString().split('T')[0]}.csv`;
        await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, { UTI: '.csv', mimeType: 'text/csv' });
        } else {
          Alert.alert('Sharing not available', 'Sharing is not available on this device');
        }
      }
    } catch (error) {
      console.error('Error exporting workout history:', error);
      Alert.alert('Export Failed', 'There was an error exporting your workout history.');
    }
  };

  const { isDarkMode } = useTheme();

  return (
    <View className={`w-full h-full p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <View className="mb-4">
        <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Workout History
        </Text>
        <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>View your past workouts by date</Text>
      </View>

      {/* Calendar Section */}
      <View className={`rounded-lg border p-4 mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {/* Month Navigation */}
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity onPress={goToPreviousMonth} className="p-1">
            <ChevronLeft size={24} color={isDarkMode ? "#9ca3af" : "#4b5563"} />
          </TouchableOpacity>

          <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {formatMonth(currentMonth)}
          </Text>

          <TouchableOpacity onPress={goToNextMonth} className="p-1">
            <ChevronRight size={24} color={isDarkMode ? "#9ca3af" : "#4b5563"} />
          </TouchableOpacity>
        </View>

        {/* Calendar Days */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="py-2"
          ref={scrollViewRef}
        >
          <View>
            {/* Day of Week Headers */}
            <View className="flex-row mb-2">
              {generateCalendarDays().map((day) => {
                const date = new Date(day.date);
                const dayOfWeek = getDayOfWeekAbbr(date.getDay());
                return (
                  <View key={`header-${day.date}`} className="w-9 items-center mx-1">
                    <Text className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {dayOfWeek}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Calendar Days */}
            <View className="flex-row">
              {generateCalendarDays().map((day) => (
                <TouchableOpacity
                  key={day.date}
                  className={`mx-1 w-9 h-9 rounded-full justify-center items-center ${day.isSelected ? "bg-blue-500" : day.hasWorkout ? "bg-blue-100" : "bg-transparent"}`}
                  onPress={() => setSelectedDate(day.date)}
                >
                  <Text
                    className={`text-sm font-medium ${day.isSelected ? "text-white" : day.hasWorkout ? "text-blue-600" : isDarkMode ? "text-gray-300" : "text-gray-800"}`}
                  >
                    {day.day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Workouts for Selected Date */}
      <View className="mb-4">
        <Text className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Workouts for {formatDate(selectedDate)}
        </Text>
      </View>

      <ScrollView className="flex-1">
        {groupedWorkouts[selectedDate] &&
        groupedWorkouts[selectedDate].length > 0 ? (
          <View className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            {groupedWorkouts[selectedDate].map((workout) => (
              <View
                key={workout.id}
                className={`p-3 border-b last:border-b-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <View className="flex-row justify-between items-center">
                  <TouchableOpacity
                    className="flex-1"
                    onPress={() => onWorkoutPress(workout)}
                  >
                    <View>
                      <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {workout.bodyPart}
                      </Text>
                      <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {workout.exerciseName}
                      </Text>
                      {workout.value && (
                        <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {workout.valueType === "duration"
                            ? `Duration: ${workout.value} min`
                            : `Max Weight: ${workout.value} kg`}
                        </Text>
                      )}
                      <View className="flex-row items-center mt-1">
                        <Clock size={14} color={isDarkMode ? "#6b7280" : "#9ca3af"} />
                        <Text className={`ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {workout.timestamp}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="p-2"
                    onPress={() => handleDeleteWorkout(workout.id)}
                  >
                    <Trash2 size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className={`flex-1 justify-center items-center py-10 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Text className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No workouts found for this date.
            </Text>
          </View>
        )}

        <View className="flex-row justify-between items-center mt-4 px-2">
          <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Showing {groupedWorkouts[selectedDate]?.length || 0} of{" "}
            {groupedWorkouts[selectedDate]?.length || 0} workouts
          </Text>
          <TouchableOpacity className="flex-row items-center" onPress={exportWorkoutHistory}>
            <Download size={16} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
            <Text className={`ml-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Export History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className={`rounded-lg p-6 w-[80%] max-w-[300px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Delete Workout
            </Text>
            <Text className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete this workout? This action cannot
              be undone.
            </Text>
            <View className="flex-row justify-between space-x-4">
              <TouchableOpacity
                className="px-4 py-2 rounded-lg bg-red-500"
                onPress={confirmDeleteWorkout}
              >
                <Text className="text-white font-medium">Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WorkoutHistory;

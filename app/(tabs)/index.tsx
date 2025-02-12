import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Modal, Alert} from 'react-native';
import * as Notifications from 'expo-notifications';

export default function App() {
  const [tasks, setTasks] = useState<{
    id: string; duration: number; text: string; completed: boolean 
}[]>([]);
  const [task, setTask] = useState('');
  const [taskDuration, setTaskDuration] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable notifications in settings!');
      }
    };
  
    requestPermissions();
  }, []);

  const addTask = async () => {
    if (task.trim() === '' || taskDuration == null) return;
    
    const id = Date.now().toString();
    const durationInSeconds = taskDuration * 60; // minutes to milliseconds

  //schedule notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Alarm!',
      body: `Task "${task}" is due now!`,
      sound: true,
      priority: 'max',
      vibrate: [0, 500, 500, 500], 
    },
    trigger: {
      seconds: durationInSeconds, 
      repeats: false, 
      type: 'timeInterval', // explicitly specify the type
    } as Notifications.TimeIntervalTriggerInput, // type assertion to fix TypeScript error
  });

    
    setTasks([...tasks, { id: Date.now().toString(), duration: taskDuration, text: task, completed: false }]);
    setTask('');
    setTaskDuration(null);
  };

  const updateTaskDuration = (id: string, duration: number) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, duration } : task));
  };

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Tracker</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter a task"
        value={task}
        onChangeText={setTask}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter a duration in minutes"
        value={taskDuration !== null ? taskDuration.toString() : ''}
        onChangeText={(text) => setTaskDuration(text ? parseInt(text, 10) : null)}
        />

      <Button title="Add Task" onPress={addTask}/>
      
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <TouchableOpacity onPress={() => toggleComplete(item.id)}>
              
              <Text style={styles.taskText}>{item.text} - {item.duration > 0 ? `${item.duration} min` : 'Time’s up!'}
              </Text>
              
            </TouchableOpacity>
            <Button title="Edit Time" onPress={() =>  { setEditingTaskId(item.id); setShowModal(true); }} />
            <Button title="Done" onPress={() => deleteTask(item.id)} color="red" />
          </View>
        )}
      />

  <Modal visible={showModal} transparent animationType="slide">
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Select Duration</Text>
        
        {['15','30', '45', '60','120'].map((time) => (
          <TouchableOpacity key={time} onPress={() => {{ 
            if (editingTaskId) {
              updateTaskDuration(editingTaskId, parseInt(time, 10));
            }
            setShowModal(false); 
          }}}>
            <Text style={styles.modalOption}>{time}</Text>
          </TouchableOpacity>
        ))}

        <Button title="Close" onPress={() => setShowModal(false)} />
      </View>
    </View>
  </Modal>


    </View>

    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#7a7a79',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    fontSize: 18,
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  taskText: {
    fontSize: 18,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalOption: {
    fontSize: 18,
    padding: 10,
    textAlign: 'center',
  },
  modalClose: {
    marginTop: 20, 

  },
});



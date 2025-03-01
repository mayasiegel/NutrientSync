import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
      padding: 16,
    },
    userInfoContainer: {
      borderWidth: 1,
      borderColor: '#000',
      padding: 20,
      marginBottom: 30,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 150,
    },
    contentContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    leftColumn: {
      width: '60%',
    },
    rightColumn: {
      width: '35%',
    },
    leftSection: {
      borderWidth: 1,
      borderColor: '#000',
      padding: 15,
      marginBottom: 20,
      minHeight: 100,
    },
    rightSection: {
      borderWidth: 1,
      borderColor: '#000',
      padding: 15,
      height: '100%',
      minHeight: 500, // Adjust this to match the combined height of your left sections
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
  
  export default styles;
  
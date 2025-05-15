import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    authButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 16,
      backgroundColor: 'transparent',
      zIndex: 1,
      marginBottom: 0,
    },
    authButton: {
      backgroundColor: '#235789',
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 5,
      marginLeft: 10,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
    },
    authButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 14,
    },
    scrollContainer: {
      padding: 16,
      paddingTop: 0,
    },
    headerContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      padding: 10,
      backgroundColor: 'white',
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    profilePictureContainer: {
      width: 100,
      height: 100,
      backgroundColor: '#cccccc',
      borderRadius: 8,
      marginRight: 16,
    },
    userInfoContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    userName: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    userDetails: {
      fontSize: 14,
      color: '#666',
      marginBottom: 2,
    },
    sectionContainer: {
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#235789', // Using your app's color scheme
    },
    sectionContent: {
      fontSize: 16,
      marginBottom: 6,
      color: '#333',
    },
  });
  
  export default styles;
  
import { StyleSheet } from 'react-native';

// New color palette
const colors = {
  blackOlive: '#34403A',
  emerald: '#0CCE6B',
  whiteSmoke: '#F2F4F3',
  glaucous: '#507DBC',
  satinGold: '#C8963E',
  red: '#f44336', // Keeping red for remove buttons
  background: '#6FD08C' // New background color
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 16,
      color: colors.blackOlive,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      backgroundColor: colors.blackOlive,
      padding: 24,
      alignItems: 'center',
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    appName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 8,
    },
    tagline: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    authContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      padding: 20,
      marginTop: 10,
    },
    authButton: {
      backgroundColor: colors.glaucous,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginHorizontal: 10,
      minWidth: 140,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    loginButton: {
      backgroundColor: colors.satinGold,
    },
    authButtonText: {
      color: colors.whiteSmoke,
      fontWeight: 'bold',
      fontSize: 16,
    },
    featuresContainer: {
      padding: 20,
    },
    featureCard: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      flexDirection: 'row',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    featureIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.emerald,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    featureIcon: {
      width: 30,
      height: 30,
      tintColor: colors.blackOlive,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 6,
      color: colors.blackOlive,
    },
    featureDescription: {
      fontSize: 14,
      color: '#666',
      lineHeight: 20,
    },
    footer: {
      padding: 20,
      alignItems: 'center',
      marginTop: 10,
    },
    footerText: {
      color: '#888',
      fontSize: 14,
    },
  });
  
  export default styles;
  
import { StyleSheet } from 'react-native';

// New color palette
const colors = {
  blackOlive: '#34403A',
  emerald: '#0CCE6B',
  whiteSmoke: '#F2F4F3',
  glaucous: '#507DBC',
  satinGold: '#C8963E',
  red: '#f44336', // Keeping red for remove buttons
  background: '#ffffff', // White background
  white: '#ffffff' // White for components
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  header: {
    backgroundColor: '#235789',
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  addItemContainer: {
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.blackOlive,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.blackOlive,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.blackOlive,
    borderRadius: 4,
    padding: 10,
    marginRight: 8,
    backgroundColor: colors.white,
    color: colors.blackOlive,
  },
  smallInput: {
    flex: 0,
    width: 60,
    minWidth: 0,
    paddingHorizontal: 8,
    textAlign: 'left',
  },
  mediumInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: colors.glaucous,
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    flex: 0.35,
    borderWidth: 1,
    borderColor: colors.blackOlive,
  },
  addButtonText: {
    color: colors.whiteSmoke,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    marginTop: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.blackOlive,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.blackOlive,
  },
  itemInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemActions: {
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: colors.red,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.blackOlive,
  },
  actionButtonText: {
    color: colors.whiteSmoke,
    fontWeight: 'bold',
  },
});

export default styles;

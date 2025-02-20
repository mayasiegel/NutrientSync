// Import the JSON files that we'll create from our CSVs
import menCaloriesData from '../data/men_calories.json';
import womenCaloriesData from '../data/women_calories.json';

export const getCalorieData = () => {
  return {
    men: menCaloriesData,
    women: womenCaloriesData
  };
};

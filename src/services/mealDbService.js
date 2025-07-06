const BASE_URL = 'https://www.themealdb.com/api/json/v1/1/';

export async function getMealsByIngredient(ingredient) {
  try {
    const res = await fetch(`${BASE_URL}filter.php?i=${encodeURIComponent(ingredient)}`);
    const data = await res.json();
    return data.meals || [];
  } catch (e) {
    console.error('Error fetching meals by ingredient:', e);
    return null;
  }
}

export async function getMealDetailsById(id) {
  try {
    const res = await fetch(`${BASE_URL}lookup.php?i=${id}`);
    const data = await res.json();
    return data.meals ? data.meals[0] : null;
  } catch (e) {
    console.error('Error fetching meal details:', e);
    return null;
  }
} 
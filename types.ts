export interface FoodEntry {
  foodItem: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  healthRating: number; // 1-10 scale
  image?: string; // base64 encoded image
}

export type FoodLog = {
  [date: string]: FoodEntry[]; // Key is 'yyyy-MM-dd'
};

export interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export type WeightLog = {
  [date: string]: { weight: number }; // Key is 'yyyy-MM-dd'
}

export type Page = 'dashboard' | 'calendar' | 'sheet' | 'add' | 'progress';
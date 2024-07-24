import { async } from 'regenerator-runtime';
import { API_URL } from './config.js';
import { resolveJSON, sendJSON } from './helper.js';
import { RES_PER_PAGE, KEY } from './config.js';
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    res_per_page: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createrecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    image: recipe.image_url,
    ingredients: recipe.ingredients,
    Cookingtime: recipe.cooking_time,
    servings: recipe.servings,
    sourceURL: recipe.source_url,
    ...(recipe.key && { key: recipe.key }),
  };
};

export async function renderRecipe(id) {
  try {
    const data = await resolveJSON(`${API_URL}/${id}?key=${KEY}`);
    state.recipe = createrecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
  } catch (err) {
    throw err;
  }
}

export async function loadSearchResult(query) {
  try {
    const data = await resolveJSON(`${API_URL}?search=${query}&key=${KEY}`);
    console.log(data);
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.query = query;
    state.search.page = 1;
  } catch (err) {
    console.log(err);
  }
}
export function getsearchResultsPage(page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.res_per_page;
  const end = page * state.search.res_per_page;

  return state.search.results.slice(start, end);
}
export function updateServing(newServing) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServing) / state.recipe.servings;
  });
  state.recipe.servings = newServing;
}

const persistBookmark = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  // add bookmark
  state.bookmarks.push(recipe);
  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = true;
  }
  persistBookmark();
};
export const deleteBookmark = function (id) {
  //delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);
  //mark current recipe as not bookmarked
  if (id === state.recipe.id) {
    state.recipe.bookmarked = false;
  }
  persistBookmark();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) {
    state.bookmarks = JSON.parse(storage);
  }
};
init();

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => {
        return entry[0].startsWith('ingredient') && entry[1] != '';
      })
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3) {
          throw new Error(
            'Wrong ingredient fromat. Please use the correct format :)'
          );
        }
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    const data = await sendJSON(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createrecipeObject(data);
    console.log(state.recipe);
    addBookmark(state.recipe);
  } catch (error) {
    throw error;
  }
};

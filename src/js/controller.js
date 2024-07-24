import * as model from './model.js';
import recipeView from './view/recipeView';
import searchView from './view/searchView.js';
import icons from 'url:../img/icons.svg';
import resultsView from './view/resultsView.js';
import 'core-js/actual'; // polyfiling to old verson of js
import 'regenerator-runtime'; // polyfilling for async await
import paginationView from './view/paginationView/';
import bookmarkView from './view/BookmarkView/';
import addrecipeView from './view/addrecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

// https://forkify-api.herokuapp.com/v2

if (module.hot) {
  module.hot.accept();
}

async function controlRecipes() {
  try {
    //render spinner
    let id = window.location.hash.slice(1);
    console.log(id);
    if (!id) return;
    recipeView.loadSpinner();
    //update results view to mark slected search result
    resultsView.update(model.getsearchResultsPage());
    bookmarkView.update(model.state.bookmarks);
    //loading recipe
    await model.renderRecipe(id);
    //rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
}

async function controlSearchResult() {
  try {
    resultsView.loadSpinner();
    //1) Get query result
    const query = searchView.getQuery();
    if (!query) return;
    //2) Load search results
    await model.loadSearchResult(query);
    //3) Render search results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getsearchResultsPage());
    console.log(model.state);
    //render pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
}
const controlPagination = function (goto) {
  // render new results view
  resultsView.render(model.getsearchResultsPage(goto));
  //render new pagination buttons
  paginationView.render(model.state.search);
};
const controlserving = function (newserving) {
  //update the recipe serving
  model.updateServing(newserving);
  //update the recipe view
  // recipeView.render(model.state.recipe); // creates flickering effect
  recipeView.update(model.state.recipe);
};

const controlBookmarking = function () {
  //Add or remove bookmarks
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }
  // update recipeview
  recipeView.update(model.state.recipe);

  //render bookmarks
  bookmarkView.render(model.state.bookmarks);
};

const controlBookmark = function () {
  bookmarkView.render(model.state.bookmarks);
};

const controladdRecipe = async function (newRecipe) {
  try {
    //render spinner
    addrecipeView.loadSpinner();
    //upload the new recipe
    await model.uploadRecipe(newRecipe);
    //render recipe view
    recipeView.render(model.state.recipe);
    //render success message
    addrecipeView.renderMessage();
    //render bookmark view
    bookmarkView.render(model.state.bookmarks);
    //change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //Close form window
    setTimeout(() => {
      addrecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addrecipeView.renderError(err.message);
  }
};

function init() {
  bookmarkView.addHandlerRender(controlBookmark);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServing(controlserving);
  recipeView.addHandlerBookmark(controlBookmarking);
  searchView.addHandlerSearch(controlSearchResult);
  paginationView.addHandlerClick(controlPagination);
  addrecipeView.addHandlerUpload(controladdRecipe);
}
init();

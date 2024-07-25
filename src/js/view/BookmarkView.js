import View from './View';
import icons from 'url:../../img/icons.svg';
class bookmarkView extends View {
  _parentElement = document.querySelector('.bookmarks__list');
  _errorMessage = 'No bookmark yet. Find a nice recipe and bookmark it :)';
  _message;
  _renderMarkup() {
    return this._data.map(this._generateMarkupPreview).join('');
  }
  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }
  _generateMarkupPreview(data) {
    const id = window.location.hash.slice(1);

    return `<li class="preview">
    <a class="preview__link ${
      data.id === id ? 'preview__link--active' : ''
    }" href="#${data.id}">
      <figure class="preview__fig">
        <img src="${data.image}" alt="${data.title}" />
      </figure>
      <div class="preview__data">
        <h4 class="preview__title">${data.title}</h4>
        <p class="preview__publisher">${data.publisher}</p>
         <div class="preview__user-generated ${data.key ? '' : 'hidden'}">
        <svg>
          <use href="${icons}#icon-user"></use>
        </svg>
      </div>
      </div>
    </a>
  </li>`;
  }
}
export default new bookmarkView();

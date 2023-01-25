import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import fetchImages from './fetchImages';

const refs = {
  form: document.querySelector('#search-form'),
  divGallery: document.querySelector('.gallery'),
  guard: document.querySelector('.js-guard'),
};

const simpleligthbox = new SimpleLightbox('.gallery a', { loop: false });

let page = 1;
let totalPages = 0;
let searchQuery = '';
const imagesPerPage = 40;

const options = {
  root: null,
  rootMargin: '200px',
  threshold: 1.0,
};

const observer = new IntersectionObserver(onLoad, options);

refs.form.addEventListener('submit', onFormSubmit);

async function onFormSubmit(evt) {
  evt.preventDefault();

  searchQuery = evt.currentTarget.elements.searchQuery.value.trim();

  resetPage();

  if (!searchQuery) {
    // clearDivGallery();
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }
  
  // clearDivGallery();
  try {
    const data = await fetchImages(searchQuery, page);
    console.log(data);
    if (!data.totalHits) {
      // clearDivGallery();
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    clearDivGallery();
    Notify.success(`Hooray! We found ${data.totalHits} images.`);
    createMarkup(data.hits);
    observer.observe(refs.guard);
    totalPages = Math.ceil(data.totalHits / imagesPerPage);
    if (page === totalPages) {
      console.log(page);
      Notify.info(`We're sorry, but you've reached the end of search results.`);
      observer.unobserve(refs.guard);

      return;
    }
    simpleligthbox.refresh();
  } catch (error) {
    Notify.failure(`${error}`);
    console.log(error);
  }
}
function createMarkup(arr) {
  let markup = arr
    .map(item => {
      return `<div class="photo-card">
       <div class="thumb"><a class="gallery-item" href="${item.largeImageURL}">
         <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" /></a></div>
   <div class="info">
     <p class="info-item">
       <b>Likes</b>${item.likes}
     </p>
     <p class="info-item">
       <b>Views</b>${item.views}
     </p>
     <p class="info-item">
       <b>Comments</b>${item.comments}
     </p>
     <p class="info-item">
       <b>Downloads </b>${item.downloads}
     </p>
   </div>
 </div>`;
    })
    .join('');
  refs.divGallery.insertAdjacentHTML('beforeend', markup);
}

async function onLoad(entries, observer) {
  console.log(entries);
  entries.forEach(async entry => {
    console.log(entries)
    if (entry.isIntersecting) {
      page += 1;

      try {
        const data = await fetchImages(searchQuery, page);
        createMarkup(data.hits);
        totalPages = Math.ceil(data.totalHits / imagesPerPage);
        if (page > 1) {
          smoothScroll()
        }
        if (page === totalPages) {

          console.log(page);
          Notify.info(
            `We're sorry, but you've reached the end of search results.`
          );
          observer.unobserve(refs.guard);

          return;

        }
        simpleligthbox.refresh();
      } catch (error) {
        Notify.failure(`${error}`);
        console.log(error);
      }
    }
  });
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function clearDivGallery() {
  refs.divGallery.innerHTML = '';
}

function resetPage() {
  page = 1;
}

import './css/styles.css';
import debounce from 'lodash.debounce';
import Notiflix from 'notiflix';
import fetchCountries from './fetchCountries';

const searchBox = document.querySelector('#search-box');
const countryList = document.querySelector('.country-list');
const countryInfo = document.querySelector('.country-info');
const DEBOUNCE_DELAY = 300;
searchBox.addEventListener('input', debounce(searchCountry, DEBOUNCE_DELAY));
countryInfo.style.display = 'none';

function searchCountry(e) {
  const mainCountry = e.target.value.trim();
  countryInfo.style.display = 'none';
  countryList.innerHTML = '';
  countryInfo.innerHTML = '';
  if (mainCountry !== '') {
    fetchCountries(mainCountry)
      .then(data => {
        if (data.length >= 2 && data.length <= 10) {
          // countryInfo.style.display = 'none';
          createCountryList(data);
        } else if (data.length === 1) {
          countryInfo.style.display = 'flex';
          createCountryCard(data);
        } else if (data.length > 10) {
          Notiflix.Notify.info(
            'Too many matches found. Please enter a more specific name.'
          );
        }
      })
      .catch(
        err => (
          console.error(err.toString()),
          Notiflix.Notify.failure('Oops, there is no country with that name')
        )
      );
  }
}
function createCountryList(arr) {
  const list = arr
    .map(({ flags, name }) => {
      return `<li class="country__item">
  <img src="${flags.svg}" alt="${name.official}" width="30" height="30" />
  <h2 class="country__name">${name.common}</h2>
</li>`;
    })
    .join('');
  countryList.insertAdjacentHTML('beforeend', list);
}
function createCountryCard(arr) {
  const card = arr
    .map(({ flags, name, capital, population, languages }) => {
      return `<div class="country__title">
  <img src="${flags.svg}" alt="${name.official}" width="55" height="45" />
  <h1 class="country__name">${name.official}</h1>
</div>
<ul>
  <li class="country__capital item">Capital: ${capital}</li>
  <li class="country__population item">Population: ${population}</li>
  <li class="country__languages item">languages: ${Object.values(
    languages
  )}</li>
</ul>`;
    })
    .join('');
  countryInfo.insertAdjacentHTML('beforeend', card);
}

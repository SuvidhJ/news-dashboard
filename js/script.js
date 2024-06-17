document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'FO0onOZBnKrJcZEw_Y2SWesKsQBkQWiajY3VRRJzmy4MyRY6';   // Currents API
    const newsContainer = document.getElementById('news-container');
    const regionSelect = document.getElementById('region-select');
    const categorySelect = document.getElementById('category-select');
    const loadingIndicator = document.querySelector('.loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const loadMoreButton = document.getElementById('load-more');

    let currentPage = 1;
    let currentRegion = 'us';
    let currentCategory = 'general';
    let cache = {};

    const fetchNewsData = async (region = 'us', category = 'general', page = 1) => {
        try {
            LoadingIndicator();
            errorMessage.style.display = 'none';

            const cacheKey = `${region}-${category}-${page}`;
            if (cache[cacheKey]) {
                hidingIndicator();
                return cache[cacheKey];
            }

            let url = `https://api.currentsapi.services/v1/latest-news?apiKey=${apiKey}&category=${category}&country=${region}&page=${page}`;
            if (region === 'world') {
                url = `https://api.currentsapi.services/v1/latest-news?apiKey=${apiKey}&category=${category}&page=${page}`;
            }

            console.log(`Fetching news from: ${url}`);

            const response = await fetch(url);
            const data = await response.json();
            hidingIndicator();

            if (data.status === "ok" || data.status === "success") {
                cache[cacheKey] = data.news;
                return data.news;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            hidingIndicator();
            errorMessage.style.display = 'block';
            errorMessage.innerText = `Error fetching news: ${error.message}`;
        }
    };

    const displayNews = (articles, append = false) => {
        if (!append) {
            newsContainer.innerHTML = '';
        }

        articles.forEach(article => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card';

            const img = document.createElement('img');
            img.src = article.image ? article.image : 'placeholder.jpg';
            img.alt = 'News Image';
            newsCard.appendChild(img);

            const newsTitle = document.createElement('h2');
            newsTitle.className = 'news-title';
            newsTitle.textContent = article.title;
            newsCard.appendChild(newsTitle);

            const newsDesc = document.createElement('p');
            newsDesc.className = 'news-desc';
            newsDesc.textContent = article.description ? article.description : 'No description available.';
            newsCard.appendChild(newsDesc);

            const readMoreLink = document.createElement('a');
            readMoreLink.href = article.url;
            readMoreLink.target = '_blank';
            readMoreLink.textContent = 'Read more';
            newsCard.appendChild(readMoreLink);

            newsContainer.appendChild(newsCard);
        });
    };

    const updateNews = async (append = false) => {
        const newsData = await fetchNewsData(currentRegion, currentCategory, currentPage);
        if (newsData) {
            displayNews(newsData, append);
        }
    };

    const RegionChange = () => {
        currentRegion = regionSelect.value;
        currentPage = 1;
        updateNews();
    };

    const CategoryChange = () => {
        currentCategory = categorySelect.value;
        currentPage = 1;
        updateNews();
    };

    const loadMoreNews = () => {
        currentPage++;
        updateNews(true);
    };

    const LoadingIndicator = () => {
        loadingIndicator.style.display = 'block';
        loadMoreButton.style.display = 'none';
        newsContainer.innerHTML = '';
    };

    const hidingIndicator = () => {
        loadingIndicator.style.display = 'none';
        loadMoreButton.style.display = 'block';
    };

    regionSelect.addEventListener('change', RegionChange);
    categorySelect.addEventListener('change', CategoryChange);
    loadMoreButton.addEventListener('click', loadMoreNews);

    updateNews();
});

document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'FO0onOZBnKrJcZEw_Y2SWesKsQBkQWiajY3VRRJzmy4MyRY6'; // Currents API
    const newsContainer = document.getElementById('news-container');
    const regionSelect = document.getElementById('region-select');
    const categorySelect = document.getElementById('category-select');
    const loadingIndicator = document.querySelector('.loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const loadMoreButton = document.getElementById('load-more');
    const viewBookmarksButton = document.getElementById('view-bookmarks');
    const backToNewsButton = document.getElementById('back-to-news');
    const toggleThemeButton = document.getElementById('toggle-theme');

    let currentPage = 1;
    let currentRegion = 'us';
    let currentCategory = 'general';
    let cache = {};
    let viewingBookmarks = false;

    const fetchNewsData = async (region = 'us', category = 'general', page = 1) => {
        try {
            showLoadingIndicator();
            errorMessage.style.display = 'none';

            const cacheKey = `${region}-${category}-${page}`;
            if (cache[cacheKey]) {
                hideLoadingIndicator();
                return cache[cacheKey];
            }

            let url = `https://api.currentsapi.services/v1/latest-news?apiKey=${apiKey}&category=${category}&country=${region}&page=${page}`;
            if (region === 'world') {
                url = `https://api.currentsapi.services/v1/latest-news?apiKey=${apiKey}&category=${category}&page=${page}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            hideLoadingIndicator();

            if (data.status === "ok" || data.status === "success") {
                cache[cacheKey] = data.news;
                return data.news;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            hideLoadingIndicator();
            showError(`Error fetching news: ${error.message}`);
        }
    };

    const displayNews = (articles, append = false) => {
        if (!append) {
            newsContainer.innerHTML = '';
        }

        articles.forEach(article => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card';
            newsCard.style.opacity = '0';
            newsCard.style.transform = 'translateY(20px)';
            setTimeout(() => {
                newsCard.style.opacity = '1';
                newsCard.style.transform = 'translateY(0)';
            }, 100);

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
            readMoreLink.addEventListener('click', (e) => e.stopPropagation());
            newsCard.appendChild(readMoreLink);

            const bookmarkButton = document.createElement('button');
            bookmarkButton.className = 'bookmark-btn';
            bookmarkButton.innerHTML = '🔖';
            bookmarkButton.addEventListener('click', (e) => {
                e.stopPropagation();
                bookmarkArticle(article);
            });
            newsCard.appendChild(bookmarkButton);

            if (viewingBookmarks) {
                const removeBookmarkButton = document.createElement('button');
                removeBookmarkButton.className = 'remove-bookmark-btn';
                removeBookmarkButton.innerHTML = '✖';
                removeBookmarkButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeBookmark(article);
                });
                newsCard.appendChild(removeBookmarkButton);
            }

            newsCard.addEventListener('click', () => {
                window.open(article.url, '_blank');
            });

            newsContainer.appendChild(newsCard);
        });
    };

    const updateNews = async (append = false) => {
        if (viewingBookmarks) return;
        const newsData = await fetchNewsData(currentRegion, currentCategory, currentPage);
        if (newsData) {
            displayNews(newsData, append);
        }
    };

    const handleRegionChange = () => {
        currentRegion = regionSelect.value;
        currentPage = 1;
        updateNews();
    };

    const handleCategoryChange = () => {
        currentCategory = categorySelect.value;
        currentPage = 1;
        updateNews();
    };

    const handleLoadMoreNews = () => {
        if (!viewingBookmarks) {
            currentPage++;
            updateNews(true);
        }
    };

    const showLoadingIndicator = () => {
        loadingIndicator.style.display = 'block';
        loadMoreButton.style.display = 'none';
    };

    const hideLoadingIndicator = () => {
        loadingIndicator.style.display = 'none';
        loadMoreButton.style.display = 'block';
    };

    const showError = (message) => {
        errorMessage.style.display = 'block';
        errorMessage.innerText = message;
    };

    const toggleTheme = () => {
        if (document.documentElement.hasAttribute("data-theme")) {
            document.documentElement.removeAttribute("data-theme");
            toggleThemeButton.textContent = "🌙";
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            toggleThemeButton.textContent = "☀️";
        }
    };

    const bookmarkArticle = (article) => {
        let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        if (!bookmarks.some(a => a.url === article.url)) {
            bookmarks.push(article);
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            alert('Article bookmarked!');
        } else {
            alert('Article already bookmarked!');
        }
    };

    const removeBookmark = (article) => {
        let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        bookmarks = bookmarks.filter(a => a.url !== article.url);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        if (bookmarks.length > 0) {
            loadBookmarks();
        } else {
            showError("No news bookmarked.");
        }
    };

    const loadBookmarks = () => {
        viewingBookmarks = true;
        let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        if (bookmarks.length > 0) {
            displayNews(bookmarks);
            loadMoreButton.style.display = 'none';
            viewBookmarksButton.style.display = 'none';
            backToNewsButton.style.display = 'inline-block';
        } else {
            showError('No news bookmarked.');
        }
    };

    const backToNews = () => {
        viewingBookmarks = false;
        currentPage = 1;
        updateNews();
        loadMoreButton.style.display = 'block';
        viewBookmarksButton.style.display = 'inline-block';
        backToNewsButton.style.display = 'none';
        errorMessage.style.display = 'none';
    };

    regionSelect.addEventListener('change', handleRegionChange);
    categorySelect.addEventListener('change', handleCategoryChange);
    loadMoreButton.addEventListener('click', handleLoadMoreNews);
    viewBookmarksButton.addEventListener('click', loadBookmarks);
    backToNewsButton.addEventListener('click', backToNews);
    toggleThemeButton.addEventListener('click', toggleTheme);

    updateNews();
});

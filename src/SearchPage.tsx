import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { translations } from './translations';

interface SearchArticle {
  id_article: number;
  Titre: string;
  Journal: string;
  Date: string;
  Contenu: string;
  URLImage: string;
}

function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<SearchArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q');
  const lang = searchParams.get('lang') || 'fr-fr';

  const t = translations[lang];

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;

      try {
        setLoading(true);
        const response = await fetch(
          `https://newsflix.fr/api/fetch_search.php?q=${encodeURIComponent(query)}&lang=${lang}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setArticles(data.articles || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch search results');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, lang]);

  const handleArticleClick = (article: SearchArticle) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const urlTitle = article.Titre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    navigate(`/article/${article.id_article}/${urlTitle}`, { 
      state: { 
        articleId: article.id_article,
        article: {
          ...article,
          SimilarArticles: []
        }
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">{t.search.searching}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-red-600">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.common.backToArticles}
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Search: {query} - NewsFlix</title>
        <meta name="description" content={`Search results for "${query}" - Find the latest news and articles on NewsFlix`} />
        <meta name="robots" content="noindex" />
        <meta property="og:title" content={`Search: ${query} - NewsFlix`} />
        <meta property="og:description" content={`Search results for "${query}" - Find the latest news and articles on NewsFlix`} />
        <meta property="og:type" content="website" />
      </Helmet>
      <div>
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t.common.backToArticles}
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            {t.search.results} <span className="text-blue-600">{query}</span>
          </h1>
          <p className="text-gray-600 mt-2">
            {t.search.foundResults} {articles.length} {articles.length !== 1 ? 'articles' : 'article'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.id_article}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleArticleClick(article)}
            >
              <div className="block">
                <img
                  src={article.URLImage}
                  alt={article.Titre}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop';
                  }}
                />
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.Titre}
                  </h2>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span className="font-medium">{article.Journal}</span>
                    <span className="mx-2">•</span>
                    <time>{new Date(article.Date).toLocaleDateString(lang)}</time>
                  </div>
                  <p className="text-gray-600 line-clamp-3">{article.Contenu}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {articles.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">{t.search.noResults}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default SearchPage;
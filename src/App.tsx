import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Globe, Newspaper } from 'lucide-react';
import ArticlePage from './ArticlePage';

interface Article {
  Titre: string;
  Journal: string;
  Date: string;
  URLImage: string;
  Contenu: string;
  SimilarArticles: Array<{
    Titre: string;
    Journal: string;
  }>;
}

interface FilterState {
  category: string;
  language: string;
}

const categories = [
  'TopArticles',
  'Politics',
  'Sports',
  'Technology',
  'Entertainment',
  'Business'
];

const languages = [
  { code: 'en-us', label: 'United States', flag: '🇺🇸' },
  { code: 'en-gb', label: 'United Kingdom', flag: '🇬🇧' },
  { code: 'fr-fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es-es', label: 'Español', flag: '🇪🇸' },
  { code: 'de-de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'en-ie', label: 'Ireland', flag: '🇮🇪' },
  { code: 'be-be', label: 'België', flag: '🇧🇪' }
];

function Header() {
  const [isOpen, setIsOpen] = useState<{ category: boolean; language: boolean }>({
    category: false,
    language: false
  });
  const [filters, setFilters] = useState<FilterState>({
    category: 'TopArticles',
    language: 'fr-fr'
  });

  const handleFilterChange = (type: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [type]: value }));
    setIsOpen(prev => ({ ...prev, [type]: false }));
    window.dispatchEvent(new CustomEvent('filtersChanged', { detail: { ...filters, [type]: value } }));
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === filters.language) || languages[2]; // Default to French
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-6">
          {/* Logo/App Name */}
          <Link to="/" className="flex items-center justify-center md:justify-start">
            <Newspaper className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              NewsFlix
            </span>
          </Link>

          {/* Filters Container */}
          <div className="flex flex-1 items-center justify-between md:justify-end space-x-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsOpen(prev => ({ ...prev, category: !prev.category }))}
                className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <span className="text-gray-700">{filters.category}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {isOpen.category && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleFilterChange('category', category)}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsOpen(prev => ({ ...prev, language: !prev.language }))}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <span className="text-xl" role="img" aria-label={getCurrentLanguage().label}>
                  {getCurrentLanguage().flag}
                </span>
                <span className="text-gray-700 hidden sm:inline">{getCurrentLanguage().label}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {isOpen.language && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleFilterChange('language', lang.code)}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-3"
                    >
                      <span className="text-xl" role="img" aria-label={lang.label}>
                        {lang.flag}
                      </span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchArticles = async (filters: FilterState) => {
    try {
      setLoading(true);
      console.log("Starting fetch request with filters:", filters);
      const response = await fetch(
        `https://newsflix.fr/api.php?action=getTopCategory&category=${filters.category}&language=${filters.language}&exclude=null,null`
      );
      console.log(`https://newsflix.fr/api.php?action=getTopCategory&category=${filters.category}&language=${filters.language}&exclude=null,null`);

      if (!response.ok) {
        console.error("Response not OK:", response.statusText);
        throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Response data:", data);
      
      if (!data.articles) {
        console.error("No articles in response:", data);
        throw new Error('No articles found in response');
      }

      setArticles(data.articles);
      setError(null);
    } catch (err) {
      console.error("Fetch error details:", err);
      setError(err instanceof Error ? `${err.name}: ${err.message}` : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchArticles({ category: 'TopArticles', language: 'fr-fr' });

    // Listen for filter changes
    const handleFiltersChanged = (event: CustomEvent<FilterState>) => {
      fetchArticles(event.detail);
    };

    window.addEventListener('filtersChanged', handleFiltersChanged as EventListener);

    return () => {
      window.removeEventListener('filtersChanged', handleFiltersChanged as EventListener);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-red-600">Error: {error}</p>
        <pre className="bg-gray-100 p-4 rounded-lg text-sm max-w-2xl overflow-auto">
          Please check the browser console for detailed error information.
        </pre>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article, index) => (
        <article
          key={index}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <Link 
            to={`/article/${index}`}
            state={{ article }}
            className="block"
          >
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
                <time>{new Date(article.Date).toLocaleDateString()}</time>
              </div>
              <p className="text-gray-600 line-clamp-3">{article.Contenu}</p>
            </div>
          </Link>

          {article.SimilarArticles && article.SimilarArticles.length > 0 && (
            <div className="px-6 pb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Similar Articles</h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {article.SimilarArticles.map((similar, idx) => (
                  <div 
                    key={idx}
                    className="flex-shrink-0 w-48 p-3 bg-gray-50 rounded-lg"
                  >
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                      {similar.Titre}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {similar.Journal}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<ArticleList />} />
          <Route path="/article/:id" element={<ArticlePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
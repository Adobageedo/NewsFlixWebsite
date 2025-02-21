import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Newspaper } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import ArticlePage from './ArticlePage';
import SearchPage from './SearchPage';
import { translations } from './translations';

interface Article {
  Titre: string;
  Journal: string;
  Date: string;
  URLImage: string;
  Contenu: string;
  SimilarArticles: Array<{
    id_article: number;
    Titre: string;
    Journal: string;
    Date: string;
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
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<{ category: boolean; language: boolean }>({
    category: false,
    language: false
  });
  const [filters, setFilters] = useState<FilterState>(() => {
    const savedFilters = localStorage.getItem('newsFilters');
    return savedFilters ? JSON.parse(savedFilters) : {
      category: 'TopArticles',
      language: 'fr-fr'
    };
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  const categoryRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('newsFilters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsOpen(prev => ({ ...prev, category: false }));
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setIsOpen(prev => ({ ...prev, language: false }));
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilterChange = (type: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [type]: value };
    setFilters(newFilters);
    setIsOpen(prev => ({ ...prev, [type]: false }));
    window.dispatchEvent(new CustomEvent('filtersChanged', { detail: newFilters }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&lang=${filters.language}`);
    }
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === filters.language) || languages[2]; // Default to French
  };

  const t = translations[filters.language];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-6">
          <Link to="/" className="flex items-center justify-center md:justify-start">
            <Newspaper className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              NewsFlix
            </span>
          </Link>

          <div className="flex flex-1 items-center justify-between md:justify-end space-x-4">
            <div className="flex-1 max-w-md">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.search.placeholder}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>

            <div className="relative" ref={categoryRef}>
              <button
                onClick={() => setIsOpen(prev => ({ ...prev, category: !prev.category }))}
                className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <span className="text-gray-700">{t.categories[filters.category as keyof typeof t.categories]}</span>
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
                      {t.categories[category as keyof typeof t.categories]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={languageRef}>
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
  const [filters, setFilters] = useState<FilterState>(() => {
    const savedFilters = localStorage.getItem('newsFilters');
    return savedFilters ? JSON.parse(savedFilters) : {
      category: 'TopArticles',
      language: 'fr-fr'
    };
  });

  const t = translations[filters.language];

  const fetchArticles = async (filters: FilterState) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://newsflix.fr/api/fetch_main_articles.php?action=getTopCategory&category=${filters.category}&language=${filters.language}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.articles) {
        throw new Error('No articles found in response');
      }

      setArticles(data.articles);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedFilters = localStorage.getItem('newsFilters');
    const initialFilters = savedFilters ? JSON.parse(savedFilters) : {
      category: 'TopArticles',
      language: 'fr-fr'
    };
    setFilters(initialFilters);
    fetchArticles(initialFilters);

    const handleFiltersChanged = (event: CustomEvent<FilterState>) => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setFilters(event.detail);
      fetchArticles(event.detail);
    };

    window.addEventListener('filtersChanged', handleFiltersChanged as EventListener);
    return () => {
      window.removeEventListener('filtersChanged', handleFiltersChanged as EventListener);
    };
  }, []);

  const handleArticleClick = (article: Article, index: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const urlTitle = article.Titre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    navigate(`/article/${index}/${urlTitle}`, { state: { article } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">{t.common.loading}</p>
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
    <>
      <Helmet>
        <title>NewsFlix - Latest News from Around the World</title>
        <meta name="description" content="Stay informed with the latest news articles from trusted sources worldwide. Breaking news, politics, sports, technology, and more." />
        <meta name="keywords" content="news, articles, world news, breaking news, latest updates" />
        <meta property="og:title" content="NewsFlix - Latest News from Around the World" />
        <meta property="og:description" content="Stay informed with the latest news articles from trusted sources worldwide." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <article
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleArticleClick(article, index)}
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
                  <time>{new Date(article.Date).toLocaleDateString(filters.language)}</time>
                </div>
                <p className="text-gray-600 line-clamp-3">{article.Contenu}</p>
              </div>
            </div>

            {article.SimilarArticles && article.SimilarArticles.length > 0 && (
              <div className="px-6 pb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t.common.similarArticles}</h3>
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
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<ArticleList />} />
          <Route path="/article/:id/:title" element={<ArticlePage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
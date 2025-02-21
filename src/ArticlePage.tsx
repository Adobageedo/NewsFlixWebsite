import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { translations } from './translations';

interface SimilarArticle {
  id_article: number;
  Titre: string;
  Journal: string;
  Date: string;
}

interface Article {
  Titre: string;
  Journal: string;
  Date: string;
  URLImage: string;
  Contenu: string;
  SimilarArticles: SimilarArticle[];
}

interface DetailedArticle {
  id_article: number;
  Journal: string;
  Titre: string;
  Date: string;
  Contenu: string;
  URLImage: string;
  FullArticle: string;
  Titre_id_article1: string;
  Journal_id_article1: string;
  Titre_id_article2: string;
  Journal_id_article2: string;
  Titre_id_article3: string;
  Journal_id_article3: string;
  Titre_id_article4: string;
  Journal_id_article4: string;
  Titre_id_article5: string;
  Journal_id_article5: string;
  id_article1: number;
  id_article2: number;
  id_article3: number;
  id_article4: number;
  id_article5: number;
}

function ArticlePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, title } = useParams();
  const [currentArticle, setCurrentArticle] = useState<DetailedArticle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savedFilters = localStorage.getItem('newsFilters');
  const { language } = savedFilters ? JSON.parse(savedFilters) : { language: 'fr-fr' };
  const t = translations[language];

  const fetchArticleDetails = async (articleId: number) => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setLoading(true);
      const response = await fetch(
        `https://newsflix.fr/api/fetch_article.php?action=getArticle&id_article=${articleId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setCurrentArticle(data);
      
      // Update URL with the article title if it's different
      const urlTitle = data.Titre
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (title !== urlTitle) {
        navigate(`/article/${articleId}/${urlTitle}`, { replace: true, state: { article: data } });
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch article details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.articleId) {
      fetchArticleDetails(location.state.articleId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.state]);

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

  if (!currentArticle && !location.state?.article) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Article not found</p>
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

  const article = currentArticle || location.state?.article;
  const similarArticles = currentArticle ? [
    { id_article: currentArticle.id_article1, Titre: currentArticle.Titre_id_article1, Journal: currentArticle.Journal_id_article1 },
    { id_article: currentArticle.id_article2, Titre: currentArticle.Titre_id_article2, Journal: currentArticle.Journal_id_article2 },
    { id_article: currentArticle.id_article3, Titre: currentArticle.Titre_id_article3, Journal: currentArticle.Journal_id_article3 },
    { id_article: currentArticle.id_article4, Titre: currentArticle.Titre_id_article4, Journal: currentArticle.Journal_id_article4 },
    { id_article: currentArticle.id_article5, Titre: currentArticle.Titre_id_article5, Journal: currentArticle.Journal_id_article5 }
  ] : article?.SimilarArticles;

  return (
    <>
      <Helmet>
        <title>{article?.Titre} - NewsFlix</title>
        <meta name="description" content={article?.Contenu?.substring(0, 155) + '...'} />
        <meta name="keywords" content={`news, ${article?.Journal}, ${article?.Titre.split(' ').join(', ')}`} />
        <meta property="og:title" content={`${article?.Titre} - NewsFlix`} />
        <meta property="og:description" content={article?.Contenu?.substring(0, 155) + '...'} />
        <meta property="og:image" content={article?.URLImage} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article?.Titre} />
        <meta name="twitter:description" content={article?.Contenu?.substring(0, 155) + '...'} />
        <meta name="twitter:image" content={article?.URLImage} />
        <meta property="article:published_time" content={article?.Date} />
        <meta property="article:author" content={article?.Journal} />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t.common.backToArticles}
        </button>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img
            src={article.URLImage}
            alt={article.Titre}
            className="w-full h-72 object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop';
            }}
          />
          
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {article.Titre}
            </h1>
            
            <div className="flex items-center text-sm text-gray-500 mb-8">
              <span className="font-medium">{article.Journal}</span>
              <span className="mx-2">•</span>
              <time>{new Date(article.Date).toLocaleDateString(language)}</time>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {currentArticle ? currentArticle.FullArticle : article.Contenu}
              </p>
            </div>
          </div>
        </article>

        {similarArticles && similarArticles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.common.similarArticles}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {similarArticles.map((similar) => (
                <button
                  key={similar.id_article}
                  onClick={() => fetchArticleDetails(similar.id_article)}
                  className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left w-full"
                >
                  <h3 className="font-medium text-gray-900 mb-2">
                    {similar.Titre}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {similar.Journal}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ArticlePage;
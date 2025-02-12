import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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

function ArticlePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { article } = location.state as { article: Article };

  if (!article) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Article not found</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to articles
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to articles
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
            <time>{new Date(article.Date).toLocaleDateString()}</time>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {article.Contenu}
            </p>
          </div>
        </div>
      </article>

      {article.SimilarArticles && article.SimilarArticles.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Similar Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {article.SimilarArticles.map((similar, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-900 mb-2">
                  {similar.Titre}
                </h3>
                <p className="text-sm text-gray-500">
                  {similar.Journal}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ArticlePage;
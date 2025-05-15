import { useState, useEffect } from "react";
import {
  Search,
  Heart,
  ThumbsUp,
  X,
  Gamepad2,
  Star,
  Clock,
  Menu,
  Sun,
  Moon,
} from "lucide-react";

// Vous devrez obtenir votre propre clé API de RAWG (https://rawg.io/apidocs)
const API_KEY = "0ca4b7884be14b21be82ee0d6bf38ce7";
const API_URL = "https://api.rawg.io/api";

function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [view, setView] = useState("discover"); // discover, favorites
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genres, setGenres] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);

  // Chargement initial des données
  useEffect(() => {
    // Récupération des favoris depuis localStorage
    const storedFavorites = localStorage.getItem("gamesFavorites");
    console.log(storedFavorites);

    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }

    // Récupération du mode (clair/sombre) depuis localStorage
    const storedDarkMode = localStorage.getItem("darkMode");
    if (storedDarkMode) {
      setDarkMode(JSON.parse(storedDarkMode));
    }

    // Chargement des genres
    fetchGenres();

    // Chargement des jeux populaires
    fetchGames();
  }, []);

  // Effet pour appliquer le mode sombre
  useEffect(() => {
    document.body.className = darkMode
      ? "bg-gray-900 text-white"
      : "bg-gray-100 text-gray-900";
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Effet pour sauvegarder les favoris dans localStorage
  useEffect(() => {
    localStorage.setItem("gamesFavorites", JSON.stringify(favorites));
  }, [favorites]);

  // Effet pour rechercher des jeux
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      const delayDebounce = setTimeout(() => {
        fetchGames(searchTerm);
      }, 800);

      return () => clearTimeout(delayDebounce);
    }
  }, [searchTerm]);

  // Effet lorsque le genre sélectionné change
  useEffect(() => {
    if (selectedGenre) {
      fetchGamesByGenre(selectedGenre.id);
    }
  }, [selectedGenre]);

  // Fonction pour récupérer les genres
  const fetchGenres = async () => {
    try {
      const response = await fetch(`${API_URL}/genres?key=${API_KEY}`);
      const data = await response.json();
      setGenres(data.results);
    } catch (error) {
      console.error("Erreur lors de la récupération des genres:", error);
    }
  };

  // Fonction pour récupérer les jeux
  const fetchGames = async (query = "") => {
    setLoading(true);
    try {
      let url = `${API_URL}/games?key=${API_KEY}&page_size=20`;

      if (query) {
        url += `&search=${query}`;
      } else {
        // Si pas de recherche, tri par popularité
        url += "&ordering=-rating";
      }

      const response = await fetch(url);
      const data = await response.json();
      setGames(data.results);
    } catch (error) {
      console.error("Erreur lors de la récupération des jeux:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les jeux par genre
  const fetchGamesByGenre = async (genreId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/games?key=${API_KEY}&genres=${genreId}`
      );
      const data = await response.json();
      setGames(data.results);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des jeux par genre:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si un jeu est dans les favoris
  const isFavorite = (id) => {
    return favorites.some((game) => game.id === id);
  };

  // Ajouter ou supprimer un jeu des favoris
  const toggleFavorite = (game) => {
    if (isFavorite(game.id)) {
      setFavorites(favorites.filter((fav) => fav.id !== game.id));
    } else {
      setFavorites([...favorites, game]);
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Barre de navigation */}
      <nav className={`p-4 shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Gamepad2 size={28} className="text-purple-600" />
            <h1 className="text-xl font-bold">FicheGame</h1>
          </div>

          <div className="relative hidden md:block w-1/2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher des jeux..."
              className={`w-full p-2 pl-10 rounded-lg border ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-50 border-gray-300"
              }`}
            />
            <Search className="absolute left-3 top-2.5" size={18} />
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => {
                setView("discover");
                setSelectedGenre(null);
              }}
              className={`px-4 py-2 rounded-lg ${
                view === "discover" ? "bg-purple-600 text-white" : ""
              }`}
            >
              Découvrir
            </button>
            <button
              onClick={() => setView("favorites")}
              className={`px-4 py-2 rounded-lg ${
                view === "favorites" ? "bg-purple-600 text-white" : ""
              }`}
            >
              Favoris ({favorites.length})
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {menuOpen && (
        <div
          className={`md:hidden p-4 ${darkMode ? "bg-gray-800" : "bg-white"}`}
        >
          <div className="relative mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher des jeux..."
              className={`w-full p-2 pl-10 rounded-lg border ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-50 border-gray-300"
              }`}
            />
            <Search className="absolute left-3 top-2.5" size={18} />
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setView("discover");
                setSelectedGenre(null);
                setMenuOpen(false);
              }}
              className={`p-2 rounded-lg ${
                view === "discover" ? "bg-purple-600 text-white" : ""
              }`}
            >
              Découvrir
            </button>
            <button
              onClick={() => {
                setView("favorites");
                setMenuOpen(false);
              }}
              className={`p-2 rounded-lg ${
                view === "favorites" ? "bg-purple-600 text-white" : ""
              }`}
            >
              Favoris ({favorites.length})
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 flex items-center gap-2"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span>{darkMode ? "Mode clair" : "Mode sombre"}</span>
            </button>
          </div>
        </div>
      )}

      <main className="container mx-auto p-4">
        {/* En-tête de page */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">
            {view === "discover"
              ? selectedGenre
                ? `Jeux de ${selectedGenre.name}`
                : "Découvrez des jeux"
              : "Vos jeux favoris"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {view === "discover"
              ? "Explorez notre collection de jeux vidéo et ajoutez vos préférés à vos favoris"
              : "Retrouvez ici tous les jeux que vous avez mis en favoris"}
          </p>
        </div>

        {/* Filtres par genre (uniquement sur la page découvrir) */}
        {view === "discover" && (
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              <button
                onClick={() => setSelectedGenre(null)}
                className={`px-4 py-2 rounded-full ${
                  selectedGenre === null
                    ? "bg-purple-600 text-white"
                    : `${darkMode ? "bg-gray-700" : "bg-gray-200"}`
                } whitespace-nowrap`}
              >
                Tous
              </button>
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-full ${
                    selectedGenre?.id === genre.id
                      ? "bg-purple-600 text-white"
                      : `${darkMode ? "bg-gray-700" : "bg-gray-200"}`
                  } whitespace-nowrap`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Affichage des jeux */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : view === "favorites" && favorites.length === 0 ? (
          <div className="text-center p-12">
            <Heart size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold mb-2">
              Aucun favori pour l'instant
            </h3>
            <p className="mb-4">
              Vous n'avez pas encore ajouté de jeux à vos favoris
            </p>
            <button
              onClick={() => setView("discover")}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Découvrir des jeux
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(view === "discover" ? games : favorites).map((game) => (
              <div
                key={game.id}
                className={`rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="relative">
                  <img
                    src={game.background_image || "/api/placeholder/600/300"}
                    alt={game.name}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => toggleFavorite(game)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
                  >
                    <Heart
                      size={20}
                      fill={isFavorite(game.id) ? "#ec4899" : "none"}
                      color={isFavorite(game.id) ? "#ec4899" : "white"}
                    />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{game.name}</h3>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-500" />
                      <span>{game.rating || "N/A"}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <ThumbsUp size={16} className="text-blue-500" />
                      <span>{game.ratings_count || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <Clock size={14} />
                    <span>{formatDate(game.released)}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {game.genres?.slice(0, 3).map((genre) => (
                      <span
                        key={genre.id}
                        className={`text-xs px-2 py-1 rounded-full ${
                          darkMode ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedGame(game)}
                    className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Voir les détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {selectedGame && (
        <div className="fixed inset-0 bg-black/75 z-50 overflow-y-auto p-4 flex flex-col">
          <div
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } rounded-lg shadow-xl max-w-4xl mx-auto w-full`}
          >
            {/* En-tête avec titre et bouton de fermeture */}
            <div className="bg-purple-700 text-white p-4 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-bold">{selectedGame.name}</h2>
              <button
                className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/30 transition-colors"
                onClick={() => setSelectedGame(null)}
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            {/* Image du jeu */}
            {selectedGame.background_image && (
              <div className="w-full">
                <img
                  src={selectedGame.background_image}
                  alt={selectedGame.name}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Informations du jeu */}
            <div className={`p-6 ${darkMode ? "text-white" : "text-gray-800"}`}>
              {/* Section d'informations générales */}
              <div className="flex flex-wrap items-center gap-6 mb-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Date de sortie :
                  </span>
                  <span className="ml-2 font-medium">
                    {formatDate(selectedGame.released)}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {selectedGame.rating || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Note
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="font-medium">
                      {selectedGame.ratings_count || 0}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      évaluations
                    </div>
                  </div>
                </div>

                {selectedGame.metacritic && (
                  <div className="flex flex-col items-center">
                    <div
                      className={`text-lg font-bold px-2 py-1 rounded ${
                        selectedGame.metacritic > 75
                          ? "bg-green-100 text-green-800"
                          : selectedGame.metacritic > 50
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedGame.metacritic}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Metacritic
                    </div>
                  </div>
                )}
              </div>

              {/* Description du jeu */}
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-3">Description</h3>
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedGame.description ||
                      "Aucune description disponible.",
                  }}
                ></div>
              </div>

              {/* Détails du jeu en grille */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedGame.genres?.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-2">Genres</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedGame.genres.map((genre) => (
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            darkMode ? "bg-gray-700" : "bg-gray-200"
                          }`}
                          key={genre.id}
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedGame.platforms?.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-2">Plateformes</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedGame.platforms.map((platform) => (
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            darkMode ? "bg-gray-700" : "bg-gray-200"
                          }`}
                          key={platform.platform.id}
                        >
                          {platform.platform.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedGame.developers?.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-2">Développeurs</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedGame.developers.map((dev) => (
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            darkMode ? "bg-gray-700" : "bg-gray-200"
                          }`}
                          key={dev.id}
                        >
                          {dev.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedGame.publishers?.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-2">Éditeurs</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedGame.publishers.map((pub) => (
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            darkMode ? "bg-gray-700" : "bg-gray-200"
                          }`}
                          key={pub.id}
                        >
                          {pub.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedGame.tags?.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedGame.tags.map((tag) => (
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            darkMode ? "bg-gray-700" : "bg-gray-200"
                          }`}
                          key={tag.id}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedGame.esrb_rating && (
                  <div>
                    <h4 className="font-bold mb-2">Classification ESRB</h4>
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        darkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      {selectedGame.esrb_rating.name}
                    </span>
                  </div>
                )}

                {selectedGame.website && (
                  <div>
                    <h4 className="font-bold mb-2">Site Web</h4>
                    <a
                      href={selectedGame.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 dark:text-purple-400 hover:underline break-all"
                    >
                      {selectedGame.website}
                    </a>
                  </div>
                )}
              </div>

              {/* Screenshots */}
              {selectedGame.screenshots?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold mb-4">Captures d'écran</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedGame.screenshots.map((screenshot) => (
                      <div
                        key={screenshot.id}
                        className="rounded-lg overflow-hidden"
                      >
                        <img
                          src={screenshot.image}
                          alt={`Capture d'écran de ${selectedGame.name}`}
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer
        className={`mt-8 py-6 ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}
      >
        <div className="container mx-auto text-center">
          <p>FicheGame - Propulsé par l'API RAWG</p>
          <p className="text-sm mt-2">
            Données et images fournies par{" "}
            <a href="https://rawg.io/" className="text-purple-600">
              RAWG.io
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

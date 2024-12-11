import React from "react";
import "../../css/main/GenreList.css";

const GenreNavBar = ({ genres, onNavClick }) => {
    return (
      <nav className="nav-bar">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => onNavClick(genre.id)}
            className="nav-item"
          >
            {genre.name}
          </button>
        ))}
      </nav>
    );
  };

  export default GenreNavBar;
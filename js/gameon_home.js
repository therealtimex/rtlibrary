function getThumbnailHTML(game, isListView = false) {
  if (!game.thumbnail) {
    if (isListView) {
      const gameCategory = (game.game_genres && game.game_genres.length > 0 && game.game_genres[0].genres && game.game_genres[0].genres.name) || game.title

      return `<div class="w-16 h-16 bg-theme-primary flex items-center justify-center text-white font-bold rounded-md">
      ${gameCategory.charAt(0)}
      </div>`;
    }
    return `<div class="w-full h-48 flex items-center justify-center overflow-hidden bg-gray-100">
      <img src="https://placehold.co/600x400/png?text=Game+Thumbnail"
      alt="Thumbnail for ${game.title}" class="object-contain max-h-full max-w-full">
    </div>`;
  }

  if (typeof game.thumbnail === 'string') {
    if (game.thumbnail.trim().startsWith('<svg')) {
      return isListView ?
      `<div class="w-16 h-16 flex items-center justify-center overflow-hidden bg-gray-100 rounded-md">
        <div class="transform scale-75">${game.thumbnail}</div>
      </div>` :
      `<div class="w-full h-48 flex items-center justify-center overflow-hidden bg-gray-100">
        <div class="transform scale-75">${game.thumbnail}</div>
      </div>`;
    } else {
      return isListView ?
      `<div class="w-16 h-16 flex items-center justify-center overflow-hidden bg-gray-100 rounded-md">
        <img src="${game.thumbnail}" alt="Thumbnail for ${game.title}" class="object-cover w-full h-full">
      </div>` :
      `<div class="w-full h-48 flex items-center justify-center overflow-hidden bg-gray-100">
        <img src="${game.thumbnail}" alt="Thumbnail for ${game.title}" class="object-contain max-h-full max-w-full">
      </div>`;
    }
  }
}

function getActionButtonHTML(game, isListView = false, isInline = false) {
  if (isListView) {
    return `<div class="flex space-x-1">
      <button class="play-button px-4 py-1 font-semibold bg-theme-primary text-theme-text-onprimary rounded-lg" data-game-id="${game.game_id}">
        Play
      </button>
    </div>`;
  } else if (isInline) {
    return `<div class="flex space-x-1">
      <button class="play-button px-4 py-2 text-sm font-semibold bg-theme-primary text-theme-text-onprimary rounded-lg" data-game-id="${game.game_id}">
        Play
      </button>
    </div>`;
  } else {
    return `<div class="flex space-x-2 mt-2">
      <button class="play-button w-full py-2 font-semibold bg-theme-primary text-theme-text-onprimary rounded-lg" data-game-id="${game.game_id}">
        <i class="fas fa-play mr-2"></i> Play
      </button>
    </div>`;
  }
}

function getFavoriteButtonHTML(game, isFavorite, isListView = false) {
  const favoriteClass = isFavorite ? 'text-red-500' : 'text-gray-400';

  return isListView ?
  `<button class="favorite-btn w-8 h-8 flex items-center justify-center rounded-full ${favoriteClass} hover:bg-gray-100 transition" data-game-id="${game.game_id}">
    <i class="fas fa-heart"></i>
  </button>` :
  `<div class="absolute top-2 right-2 z-10">
    <button class="favorite-btn w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm ${favoriteClass} hover:bg-white/20 transition shadow-sm" data-game-id="${game.game_id}">
      <i class="fas fa-heart"></i>
    </button>
  </div>`;
}

// function renderGames(games) {
//   // Hide all empty states first
//   hideAllEmptyStates();

//   // If no games match the current filter, show the appropriate empty state
//   if (games.length === 0) {
//     showEmptyStateForCurrentTab();
//     document.getElementById('gameGrid').classList.add('hidden');
//     document.getElementById('gameList').classList.add('hidden');
//     return;
//   }

//   // If we have games to display, show them in the appropriate view
//   if (currentView === 'grid') {
//     renderGameGrid(games,currentUsername);
//     document.getElementById('gameGrid').classList.remove('hidden');
//     document.getElementById('gameList').classList.add('hidden');
//   } else {
//     renderGameList(games,currentUsername);
//     document.getElementById('gameGrid').classList.add('hidden');
//     document.getElementById('gameList').classList.remove('hidden');
//   }
// }
function renderGameGrid(games) {
  const gameGrid = document.getElementById('gameGrid');
  gameGrid.innerHTML = '';

  if (activeCategory == 'My Games') {
    games.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (activeCategory == 'Trending') {
    games.sort((a, b) => ((b.game_trends && b.game_trends.trend_score) || 0) - ((a.game_trends && a.game_trends.trend_score) || 0));
  } else if (activeCategory == 'Favorites') {
    games.sort((a, b) => {
      const aFav = (a.user_favorites && a.user_favorites[0] && a.user_favorites[0].created_at) || a.created_at;
      const bFav = (b.user_favorites && b.user_favorites[0] && b.user_favorites[0].created_at) || b.created_at;
      return new Date(bFav) - new Date(aFav);
    });
  }

  games.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card flex flex-col h-full';

    const isFavorite = game.user_favorites && game.user_favorites.some(fav => fav.is_favorite === true);
    let rating;
    if (game.game_summary && game.game_summary.average_rating != null) {
      rating = game.game_summary.average_rating;
    } else {
      rating = (game.username === 'rta') ? ((Math.floor(Math.random() * 4) + 7) / 2) : 0;
    }

    card.innerHTML = `
    <div class="bg-white shadow-lg rounded-lg overflow-hidden relative">
      ${getFavoriteButtonHTML(game, isFavorite)}
      ${getThumbnailHTML(game)}
      <div class="p-3">
        <h5 class="text-lg font-bold text-gray-800">${game.title}</h5>
        <div class="flex items-center justify-between mt-1">
          <div class="flex items-center">
            <span class="text-yellow-500 mr-1"><i class="fas fa-star"></i></span>
            <span class="font-medium text-sm">${rating.toFixed(1)}</span>
             <span class="ml-4 text-gray-500 cursor-pointer" onclick="App.callActionButton(JSON.stringify({ actionID: 99, orderNumber: 1, type: 'act_dm_view', label: 'no label', screen: '', alias: 'jxfmuo0swf_6', args: { game_id: ${game.game_id}, title: &quot;${game.title}&quot; } }))">
              <i class="fas fa-comment-dots"></i>
            </span>
            ${game.username === currentUsername ? `
              <button class="publish-button ml-2 px-3 py-1 bg-transparent" data-game-id="${game.game_id}">
                <i class="fas fa-share-alt ${(game.is_published === true || game.is_published === 'true') ? 'text-green-500' : 'text-gray-400'}"></i>
              </button>` : ''}
              <button class="about-button ml-2 px-3 py-1 bg-transparent text-gray-500" data-game-id="${game.game_id}">
                <i class="fas fa-bars"></i>
              </button>
          </div>
          ${getActionButtonHTML(game, false, true)}
        </div>
      </div>
    </div>`;

    setupCardEventListeners(card, game);
    gameGrid.appendChild(card);
  });
}

function renderGameList(games) {
  const gameList = document.getElementById('gameList');
  gameList.innerHTML = '';

  if (activeCategory == 'My Games') {
    games.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (activeCategory == 'Trending') {
    games.sort((a, b) => ((b.game_trends && b.game_trends.trend_score) || 0) - ((a.game_trends && a.game_trends.trend_score) || 0));
  } else if (activeCategory == 'Favorites') {
    games.sort((a, b) => {
      const aFav = (a.user_favorites && a.user_favorites[0] && a.user_favorites[0].created_at) || a.created_at;
      const bFav = (b.user_favorites && b.user_favorites[0] && b.user_favorites[0].created_at) || b.created_at;
      return new Date(bFav) - new Date(aFav);
    });
  }

  games.forEach(game => {
    const listItem = document.createElement('div');
    listItem.className = 'game-list-item bg-white shadow-sm rounded-lg overflow-hidden mb-2';

    const isFavorite = game.user_favorites && game.user_favorites.some(fav => fav.is_favorite === true);
    let rating;
    if (game.game_summary && game.game_summary.average_rating != null) {
      rating = game.game_summary.average_rating;
    } else {
      rating = (game.username === 'rta') ? ((Math.floor(Math.random() * 4) + 7) / 2) : 0;
    }

    let plays;
    if (game.game_summary && game.game_summary.play_count != null) {
      plays = game.game_summary.play_count;
      if (game.username === 'rta') {
        plays += 10000;
      }
    } else {
      if (game.username === 'rta') {
        plays = Math.floor(Math.random() * 5000) + 10000;
      } else if (game.username === currentUsername) {
        plays = 0;
      } else {
        plays = 0;
      }
    }

    const gameCategory = (game.game_genres && game.game_genres.length > 0 && game.game_genres[0].genres && game.game_genres[0].genres.name);

    listItem.innerHTML = `
    <div class="flex p-3">
      <div class="mr-3">
        ${getThumbnailHTML(game, true)}
      </div>
      <div class="flex flex-col flex-grow">
        <h5 class="text-base font-bold text-gray-800 cursor-pointer">${game.title}</h5>
        <div class="text-sm text-gray-600">
          ${gameCategory || 'Game'} <span class="mx-1">•</span> ${plays.toLocaleString()} plays
        </div>
        <div class="flex items-center justify-between mt-auto">
          <div class="flex items-center">
            <span class="text-yellow-500 mr-1"><i class="fas fa-star"></i></span>
            <span class="font-medium text-sm mr-0.5">${rating.toFixed(1)}</span>
            <span class="ml-1 text-gray-500 cursor-pointer" onclick="App.callActionButton(JSON.stringify({ actionID: 99, orderNumber: 1, type: 'act_dm_view', label: 'no label', screen: '', alias: 'jxfmuo0swf_6', args: { game_id: ${game.game_id}, title: &quot;${game.title}&quot; } }))">
              <i class="fas fa-comment-dots"></i></span>
              ${game.username === currentUsername ? `
                <button class="publish-button ml-2 px-3 py-1 bg-transparent" data-game-id="${game.game_id}">
                  <i class="fas fa-share-alt ${(game.is_published === true || game.is_published === 'true') ? 'text-green-500' : 'text-gray-400'}"></i>
                </button>` : ''}
            <button class="about-button ml-2 px-3 py-1 bg-transparent text-gray-500" data-game-id="${game.game_id}">
                  <i class="fas fa-bars"></i>
                </button>
          </div>
          <div class="flex items-center">
            ${getFavoriteButtonHTML(game, isFavorite, true)}
            ${getActionButtonHTML(game, true)}
          </div>
        </div>
      </div>
    </div>`;

    setupListItemEventListeners(listItem, game);
    gameList.appendChild(listItem);
  });
}


function hideAllEmptyStates() {
  // Hide all empty states
  document.getElementById('emptyStateMyGames').classList.add('hidden');
  document.getElementById('emptyStateTrending').classList.add('hidden');
  document.getElementById('emptyStateAllFavorites').classList.add('hidden');
  document.getElementById('emptyStateFavoritesMyGames').classList.add('hidden');
  document.getElementById('emptyStateFavoritesCommunity').classList.add('hidden');
}


function setupCardEventListeners(card, game) {
  const showDescription = () => {
    const author = (game.users?.user_profiles?.display_name)|| game.username
    document.getElementById('modalTitle').textContent = game.title;
    document.getElementById('modalDescription').innerHTML = `
    <p>${game.description || 'No description available.'}</p>
    <p class="mt-2 text-sm text-gray-500">Author: ${author}</p>
    `;
    document.getElementById('descriptionModal').classList.remove('hidden');
  };

  // Only add description popup to image and title
  const imageContainer = card.querySelector('.w-full.h-48');
  const titleElement = card.querySelector('h5');

  if (imageContainer) {
    imageContainer.style.cursor = 'pointer';
    // imageContainer.addEventListener('click', showDescription);
  }

  if (titleElement) {
    titleElement.style.cursor = 'pointer';
    // titleElement.addEventListener('click', showDescription);
  }

  const publishButton = card.querySelector('.publish-button');
  if (publishButton) {
    publishButton.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePublish(publishButton, game);
    });
  }

  const favoriteButton = card.querySelector('.favorite-btn');
  if (favoriteButton) {
    favoriteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(favoriteButton, game);
    });
  }

  const playButton = card.querySelector('.play-button');
  if (playButton) {
    playButton.addEventListener('click', (e) => {
      e.stopPropagation();
      playGame(game.game_id);
    });
  }

  const aboutButton = card.querySelector('.about-button');
  if (aboutButton) {
    aboutButton.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateToScreen(8, args = {game_id: game.game_id})
    });
  }

}

function setupListItemEventListeners(listItem, game) {
  // Only add description popup to image and title
  const imageContainer = listItem.querySelector('.w-16.h-16');
  const titleElement = listItem.querySelector('h5');

  const showDescription = () => {
    const author = (game.users?.user_profiles?.display_name)|| game.username
    document.getElementById('modalTitle').textContent = game.title;
    document.getElementById('modalDescription').innerHTML = `
    <p>${game.description || 'No description available.'}</p>
    <p class="mt-2 text-sm text-gray-500">Author: ${author}</p>
    `;
    document.getElementById('descriptionModal').classList.remove('hidden');
  };

  if (imageContainer) {
    imageContainer.style.cursor = 'pointer';
    // imageContainer.addEventListener('click', showDescription);
  }

  if (titleElement) {
    titleElement.style.cursor = 'pointer';
    // titleElement.addEventListener('click', showDescription);
  }

  const publishButton = listItem.querySelector('.publish-button');
  if (publishButton) {
    publishButton.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePublish(publishButton, game);
    });
  }

  const favoriteButton = listItem.querySelector('.favorite-btn');
  if (favoriteButton) {
    favoriteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(favoriteButton, game);
    });
  }

  const playButton = listItem.querySelector('.play-button');
  if (playButton) {
    playButton.addEventListener('click', (e) => {
      e.stopPropagation();
      playGame(game.game_id);
    });
  }
  const aboutButton = listItem.querySelector('.about-button');
  if (aboutButton) {
    aboutButton.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateToScreen(8, args = {game_id: game.game_id})
    });
  }
}

function displayNextAchievement() {
  // If queue is empty or already displaying, exit
  if (achievementsQueue.length === 0) {
    isDisplayingAchievement = false;
    console.log("No more achievements to display");
    return;
  }
  // Set flag to prevent multiple displays
  isDisplayingAchievement = true;
  // Get the next achievement from the queue
  const achievement = achievementsQueue.shift();
  console.log("Displaying achievement:", achievement);
  // Display it
  displayAchievement(achievement);
}

function displayAchievement(achievement) {
  // Set achievement details
  const achievementTitle = document.getElementById('achievementTitle');
  const achievementDescription = document.getElementById('achievementDescription');
  const achievementIcon = document.querySelector('#achievementNotification .fas');
  const notification = document.getElementById('achievementNotification');
  // For debugging - create a default achievement if data is missing
  if (!achievement.title && !achievement.description) {
    console.log("Achievement missing title/description, using defaults");
    // Use achievement_id to create a default title/description
    achievement.achievements.name = achievement.achievements.name || `Achievement #${achievement.achievement_id} Unlocked!`;
    achievement.achievements.description = achievement.achievements.description || "You've reached a new milestone!";
  }
  // Use the data directly from the achievement object
  achievementTitle.textContent = achievement.achievements.name;
  achievementDescription.textContent = achievement.achievements.description;
  // Update icon if provided
  if (achievement.icon) {
    achievementIcon.className = achievement.achievements.icon + ' text-yellow-500 text-xl';
  } else {
    // Default to trophy icon
    achievementIcon.className = 'fas fa-trophy text-yellow-500 text-xl';
  }
  // Reset any previous transitions
  notification.classList.remove('opacity-100', 'opacity-0', 'translate-y-0', 'translate-y-4');
  notification.classList.add('opacity-0');
  // Show the notification
  notification.classList.remove('hidden');
  // Force a reflow to ensure transitions work
  void notification.offsetWidth;
  // Trigger animation
  notification.classList.add('opacity-100', 'translate-y-0');
  notification.classList.remove('translate-y-4');
  // Add a subtle bounce effect
  notification.animate([
    { transform: 'translateY(10px) translateX(-50%)' },
    { transform: 'translateY(-5px) translateX(-50%)' },
    { transform: 'translateY(0) translateX(-50%)' }
  ], {
    duration: 600,
    easing: 'ease-out'
  });
  // Mark achievement as notified
  Data.update('user_achievements', 'keyid', achievement.keyid, {
    username: currentUsername,
    user_notified: true
  })
    .then(res => {
      console.log('Achievement marked as notified:', res);
    })
    .catch(err => {
      console.error('Error updating achievement notification status:', err);
    });

  // Auto-hide after 5 seconds with fade-out animation
  setTimeout(() => {
    notification.classList.remove('opacity-100');
    notification.classList.add('opacity-0');
    // Hide completely after animation completes and prepare for next achievement
    setTimeout(() => {
      notification.classList.add('hidden');
      // Reset flag and display next achievement if any
      isDisplayingAchievement = false;
      displayNextAchievement();
    }, 500);
  }, 5000);
}

function fetchBalance(username) {
  onsole.log("Checking for user achievements...");
  // Fetch user achievements that haven't been notified yet
  Data.supabaseClient
    .from('users')
    .select('gem_balance,gold_balance')
    .eq('username', username)
    .then(response => {
      if (response.error) {
        console.error('Error fetching achievements:', response.error.message);
        return;
      }
      console.log("Unnotified achievements found:", response.data?.length || 0);
      if (response.data && response.data.length > 0) {
        return [...response.data];
      }
    })
    .catch(err => { console.error('Error checking achievements:', err); });
}
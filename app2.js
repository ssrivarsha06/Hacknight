// DOM Elements
const app = document.getElementById('app');
const backButton = document.getElementById('back-button');
const loadingSpinner = document.getElementById('loading-spinner');
const mainContent = document.getElementById('main-content');

// Page elements
const homePage = document.getElementById('home-page');
const categoryPage = document.getElementById('category-page');
const recipeDetailPage = document.getElementById('recipe-detail-page');
const recipeGeneratorPage = document.getElementById('recipe-generator-page');

// Recipe generator elements
const ingredientsInput = document.getElementById('ingredients-input');
const generateRecipeButton = document.getElementById('generate-recipe-button');
const generatedRecipeContainer = document.getElementById('generated-recipe-container');
const generatedRecipeText = document.getElementById('generated-recipe-text');

// Navigation state
let currentPage = 'home';
let pageHistory = [];
let activeCategoryId = null;
let activeRecipeId = null;

// -------------------------
// NAVIGATION FUNCTIONS
// -------------------------

// Show loading spinner
function showLoading() {
  loadingSpinner.style.display = 'flex';
}

// Hide loading spinner
function hideLoading() {
  loadingSpinner.style.display = 'none';
}

// Navigate to a page
function navigateTo(page, data = {}) {
  // Add current page to history
  if (currentPage) {
    pageHistory.push(currentPage);
  }
  
  // Update current page
  currentPage = page;
  
  // Hide all pages
  homePage.classList.remove('active');
  categoryPage.classList.remove('active');
  recipeDetailPage.classList.remove('active');
  recipeGeneratorPage.classList.remove('active');
  
  // Show loading
  showLoading();
  
  // Wait a bit to simulate loading
  setTimeout(() => {
    // Show appropriate page based on navigation
    switch (page) {
      case 'home':
        document.querySelector('.nav-title').textContent = 'Recipes';
        homePage.classList.add('active');
        break;
        
      case 'category':
        activeCategoryId = data.categoryId;
        renderCategoryPage(activeCategoryId);
        categoryPage.classList.add('active');
        break;
        
      case 'recipe':
        activeRecipeId = data.recipeId;
        activeCategoryId = data.categoryId;
        renderRecipeDetail(activeRecipeId, activeCategoryId);
        recipeDetailPage.classList.add('active');
        break;
        
      case 'generator':
        document.querySelector('.nav-title').textContent = 'Recipe Generator';
        recipeGeneratorPage.classList.add('active');
        break;
    }
    
    // Hide loading
    hideLoading();
    
    // Update back button visibility
    backButton.style.display = pageHistory.length ? 'flex' : 'none';
    
    // Scroll to top
    window.scrollTo(0, 0);
  }, 300);
}

// Go back to previous page
function goBack() {
  if (pageHistory.length) {
    const previousPage = pageHistory.pop();
    
    // Special handling for different pages
    switch (previousPage) {
      case 'home':
        navigateTo('home');
        pageHistory.pop(); // Remove duplicate history entry
        break;
        
      case 'category':
        navigateTo('category', { categoryId: activeCategoryId });
        pageHistory.pop(); // Remove duplicate history entry
        break;
        
      default:
        navigateTo(previousPage);
        pageHistory.pop(); // Remove duplicate history entry
    }
  }
}

// -------------------------
// RENDERING FUNCTIONS
// -------------------------

// Render category page
function renderCategoryPage(categoryId) {
  // Get category data
  const categoryData = recipeData[categoryId] || [];
  
  // Update page title
  document.querySelector('.nav-title').textContent = categoryId === 'vegetarian' ? 'Vegetarian' :
    categoryId === 'non-vegetarian' ? 'Non Vegetarian' : 'Quick Recipes';
  
  // Update banner
  const bannerTitle = categoryPage.querySelector('.banner-title');
  bannerTitle.textContent = `50 ${document.querySelector('.nav-title').textContent} recipes`;
  
  // Update category title
  const categoryTitle = categoryPage.querySelector('.category-title');
  categoryTitle.textContent = document.querySelector('.nav-title').textContent;
  
  // Clear existing recipes
  const recipeGrid = categoryPage.querySelector('.recipe-grid-category');
  recipeGrid.innerHTML = '';
  
  // Add recipes
  categoryData.forEach((recipe, index) => {
    const recipeCard = document.createElement('a');
    recipeCard.href = '#';
    recipeCard.className = 'recipe-card animate-zoom-in';
    recipeCard.style.animationDelay = `${index * 0.05}s`;
    recipeCard.dataset.id = recipe.id;
    recipeCard.dataset.category = categoryId;
    
    recipeCard.innerHTML = `
      <div class="recipe-image-container">
        <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image">
      </div>
    `;
    
    recipeCard.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('recipe', { recipeId: recipe.id, categoryId: categoryId });
    });
    
    recipeGrid.appendChild(recipeCard);
  });
}

// Render recipe detail
function renderRecipeDetail(recipeId, categoryId) {
  // Find recipe data
  const categoryData = recipeData[categoryId] || [];
  const recipe = categoryData.find(r => r.id === recipeId);
  
  if (!recipe) {
    console.error('Recipe not found:', recipeId);
    return;
  }
  
  // Update page title
  document.querySelector('.nav-title').textContent = recipe.name;
  
  // Update recipe image
  const recipeImage = recipeDetailPage.querySelector('.recipe-image-full');
  recipeImage.innerHTML = `<img src="${recipe.image}" alt="${recipe.name}">`;
  
  // Update recipe info
  const recipeInfo = recipeDetailPage.querySelector('.recipe-info');
  
  // Create recipe content HTML
  const recipeHTML = `
    <div class="recipe-header">
      <h1 class="recipe-title">${recipe.name}</h1>
      
      <div class="recipe-actions">
        <button class="favorite-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
        
        <div class="cooking-time">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>${recipe.cookingTime}</span>
        </div>
      </div>
    </div>
    
    <div class="recipe-rating">
      <span class="rating-value">${recipe.rating}</span>
      <div class="rating-stars">
        ${renderRatingStars(recipe.rating)}
      </div>
    </div>
    
    <section class="recipe-section time-required animate-slide-up">
      <h2 class="section-title">Time Required</h2>
      <ul class="ingredient-list">
        <li>Preparation Time: ${recipe.timeRequired.prep}</li>
        <li>Cooking Time: ${recipe.timeRequired.cook}</li>
        <li>Total Time: ${recipe.timeRequired.total}</li>
      </ul>
    </section>
    
    <section class="recipe-section animate-slide-up" style="animation-delay: 0.1s;">
      <h2 class="section-title">Ingredients:</h2>
      <ul class="ingredient-list">
        ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
      </ul>
    </section>
    
    <section class="recipe-section animate-slide-up" style="animation-delay: 0.2s;">
      <h2 class="section-title">Instructions:</h2>
      <ul class="ingredient-list">
        ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
      </ul>
    </section>
  `;
  
  recipeInfo.innerHTML = recipeHTML;
  
  // Add event listeners for favorite button
  const favoriteButton = recipeInfo.querySelector('.favorite-button');
  favoriteButton.addEventListener('click', () => {
    favoriteButton.classList.toggle('active');
    favoriteButton.querySelector('svg').style.fill = favoriteButton.classList.contains('active') ? '#D70015' : 'none';
  });
}

// Render star rating
function renderRatingStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const totalStars = 5;
  
  let starsHTML = '';
  
  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    starsHTML += `
      <svg class="star-filled" width="16" height="16" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#F59E0B" />
      </svg>
    `;
  }
  
  // Add half star if needed
  if (hasHalfStar) {
    starsHTML += `
      <svg class="star-half" width="16" height="16" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="half-star" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stop-color="#F59E0B" />
            <stop offset="50%" stop-color="#E5E7EB" />
          </linearGradient>
        </defs>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#half-star)" />
      </svg>
    `;
  }
  
  // Add empty stars
  const emptyStars = totalStars - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += `
      <svg class="star-empty" width="16" height="16" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="#F59E0B" stroke-width="1" fill="#E5E7EB" />
      </svg>
    `;
  }
  
  return starsHTML;
}

// -------------------------
// RECIPE GENERATOR FUNCTIONS
// -------------------------

// Generate recipe based on ingredients
async function generateRecipe() {
  const ingredients = ingredientsInput.value.trim();
  
  if (!ingredients) {
    alert("Please enter some ingredients first");
    return;
  }
  
  // Show loading
  showLoading();
  generatedRecipeContainer.style.display = 'none';
  
  try {
    const apiKey = "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";
    const model = "tiiuae/falcon-7b-instruct";
    
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        inputs: `Create a recipe using these ingredients: ${ingredients}. Include a title, ingredients list, and step-by-step instructions.` 
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate recipe');
    }
    
    const data = await response.json();
    generatedRecipeText.innerText = data[0]?.generated_text || "Couldn't generate a recipe with those ingredients. Try a different combination.";
    generatedRecipeContainer.style.display = 'block';
  } catch (error) {
    console.error('Error generating recipe:', error);
    generatedRecipeText.innerText = "Error generating recipe. Please try again later.";
    generatedRecipeContainer.style.display = 'block';
  } finally {
    hideLoading();
  }
}

// -------------------------
// EVENT LISTENERS
// -------------------------

// Back button click
backButton.addEventListener('click', (e) => {
  e.preventDefault();
  goBack();
});

// Category header click
document.querySelectorAll('.category-header').forEach(header => {
  header.addEventListener('click', (e) => {
    e.preventDefault();
    const categoryId = header.dataset.category;
    navigateTo('category', { categoryId });
  });
});

// Recipe card click (on home page)
document.querySelectorAll('.recipe-card').forEach(card => {
  card.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('recipe', { 
      recipeId: card.dataset.id, 
      categoryId: card.dataset.category 
    });
  });
});

// Bottom navigation click
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const page = item.dataset.page;
    
    if (page === 'home') {
      navigateTo('home');
    } else if (page === 'generator') {
      navigateTo('generator');
    }
  });
});

// Generate recipe button click
generateRecipeButton.addEventListener('click', generateRecipe);

// -------------------------
// INITIALIZATION
// -------------------------

// Hide back button initially
backButton.style.display = 'none';

// Initial navigation to home page
navigateTo('home');
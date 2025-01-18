<div align="center">
  
# CosmoCart a E-commerce Recommendation System
</div> 

A modern e-commerce platform built with React and Flask, featuring a sophisticated recommendation system powered by TF-IDF Vectorization and Cosine Similarity for personalized product suggestions. The platform also boasts a responsive design, ensuring an optimal user experience across all devices.

<div align="center">
  
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](#)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-green.svg)](#)
[![Maintenance](https://img.shields.io/badge/Maintained-Yes-green.svg)](#)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC.svg)](#)
[![Redux](https://img.shields.io/badge/Redux-4.x-764ABC.svg)](#)
[![React Router](https://img.shields.io/badge/React_Router-6.x-CA4245.svg)](#)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-000.svg)](#)
[![Webpack](https://img.shields.io/badge/Webpack-5.x-8DD6F9.svg)](#)
[![Python](https://img.shields.io/badge/Python-3.8%2B-yellow.svg)](#)
[![Flask](https://img.shields.io/badge/Flask-2.x-black.svg)](#)
[![NumPy](https://img.shields.io/badge/NumPy-1.24.x-013243.svg)](#)
[![scikit--learn](https://img.shields.io/badge/scikit--learn-1.3.x-F7931E.svg)](#)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-FF6F00.svg)](#)
[![Pandas](https://img.shields.io/badge/Pandas-2.x-150458.svg)](#)
[![ESLint](https://img.shields.io/badge/ESLint-8.x-4B32C3.svg)](#)
[![Prettier](https://img.shields.io/badge/Prettier-3.x-F7B93E.svg)](#)

</div>

## Features

- 🛍️ Product catalog with search and category filtering
- 🌙 Dark mode support
- 🔍 Real-time search functionality
- 📱 Responsive design for all devices
- 🛒 Shopping cart management
- 🎯 Personalized product recommendations
- 🎨 Modern UI with Tailwind CSS and shadcn/ui components

## Technology Stack

### Frontend
- React
- Tailwind CSS
- shadcn/ui components
- React Modal
- React Icons

### Backend
- Flask
- NumPy
- scikit-learn
- Flask-CORS
- TF-IDF Vectorizer for recommendation engine

## Key Components and Implementation Details

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Karthickeien/CosmoCart.git
cd CosmoCart
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Start the backend server:
```bash
python backend.py
```

5. Start the frontend development server:
```bash
npm run dev
```

## Project Structure
```
CosmoCart/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── styles.css
│   │   └── components/
│   └── package.json
|   ├──backend/
|   |   ├── backend.py
|   |   └── requirements.txt
```

### Frontend Implementation (App.jsx)

#### State Management
```jsx
// App.jsx
const [products] = useState([...]); // Product catalog
const [cart, setCart] = useState([]); // Shopping cart
const [theme, setTheme] = useState("light"); // Theme toggle
const [searchTerm, setSearchTerm] = useState(""); // Search functionality
const [selectedCategory, setSelectedCategory] = useState("All"); // Category filter
```

#### Product Filtering System
```jsx
// App.jsx
const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
});
```

#### Shopping Cart Management
```jsx
// App.jsx
const handleAddToCart = async (product) => {
    setCart(prevCart => [...prevCart, product]);
    await recordInteraction(product.id, 'cart');
    await fetchRecommendations(product.name);
    setAddedProductModal({
        isOpen: true,
        product: product,
    });
};
```

### Styling System (styles.css)

#### Responsive Grid Layout
```css
/* styles.css */
.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    padding: 20px;
}

@media (max-width: 768px) {
    .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    }
}
```

#### Theme Implementation
```css
/* styles.css */
.app {
    min-height: 100vh;
    padding: 20px;
    transition: background-color 0.3s ease, color 0.3s ease;
    background-color: #fff;
    color: #333;
}

.app.dark {
    background-color: #1a1a1a;
    color: #fff;
}
```

### Recommendation System (backend.py)

#### TF-IDF Feature Matrix Construction
```python
# backend.py
def _build_feature_matrix(self):
    """Build TF-IDF feature matrix for content-based filtering"""
    if not self.products:
        return

    product_texts = []
    self.product_ids = []

    for pid, product in self.products.items():
        text = f"{product['name']} {product['description']} {product['category']}"
        product_texts.append(text.lower())
        self.product_ids.append(pid)
        
    self.product_features = self.vectorizer.fit_transform(product_texts)
    self.similarity_matrix = cosine_similarity(self.product_features)
```

#### Recommendation Algorithm
```python
# backend.py
def get_recommendations(self, session_id, viewed_products, n_recommendations=4):
    if self.similarity_matrix is None:
        return []

    viewed_ids = [pid for pid in self.product_ids if any(
        p.lower() in self.products[pid]['name'].lower() for p in viewed_products)]

    if not viewed_ids:
        return self._get_popular_products(n_recommendations)

    scores = np.zeros(len(self.products))

    for pid in viewed_ids:
        try:
            idx = self.product_ids.index(pid)
            time_weight = 1.0
            
            if session_id in self.user_sessions:
                for interaction in reversed(self.user_sessions[session_id]):
                    if interaction['product_id'] == pid:
                        time_weight = 1.5
                        break
            
            scores += self.similarity_matrix[idx] * time_weight
        
        except ValueError:
            continue

    top_indices = scores.argsort()[-n_recommendations:][::-1]
    return [self.products[self.product_ids[i]] for i in top_indices]
```

#### User Interaction Tracking
```python
# backend.py
def record_interaction(self, session_id, product_id, interaction_type='view'):
    if session_id not in self.user_sessions:
        self.user_sessions[session_id] = []

    self.user_sessions[session_id].append({
        'product_id': product_id,
        'type': interaction_type,
        'timestamp': np.datetime64('now'),
    })
```

### API Integration

#### Frontend Communication with Backend API Endpoints
```jsx
// App.jsx
const fetchRecommendations = async (productName) => {
    try {
        const response = await fetch('http://127.0.0.1:5000/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id,
                viewed_products,
            }),
        });

        if (!response.ok) throw new Error('Failed to fetch recommendations.');

        const data = await response.json();
        setRecommendations(data);
    } catch (error) {
        console.error(error);
    }
};
```

### Backend API Endpoints

#### Get Recommendations (`POST /recommend`)
Request Body:
```json
{
    "session_id": "string",
    "viewed_products": ["string"]
}
```

Response:
```json
[
    {
        "id": "product_1",
        "name": "Product Name",
        "category": "Category"
    }
]
```


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

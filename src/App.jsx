import React, { useState, useEffect } from "react";
import "./styles.css";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Modal from "react-modal";
import { FaShoppingCart, FaSun, FaMoon, FaSearch } from 'react-icons/fa';

Modal.setAppElement("#root");

const App = () => {
  const [products] = useState([
    { id: 1, name: "Wireless Noise-Cancelling Headphones", price: "$299.99", image: "https://m.media-amazon.com/images/I/610NdWdTLiL.__AC_SX300_SY300_QL70_ML2_.jpg", description: "Premium bluetooth headphones with active noise cancellation.", category: "Electronics" },
    { id: 2, name: "Smart Fitness Watch", price: "$199.99", image: "https://m.media-amazon.com/images/I/71CQ6esBqFL._AC_SX679_.jpg", description: "Track your workouts and health metrics with this advanced smartwatch.", category: "Wearables" },
    { id: 3, name: "Bluetooth Speaker", price: "$79.99", image: "https://m.media-amazon.com/images/I/810dSwE0MoL._AC_SX679_.jpg", description: "Portable wireless speaker with deep bass and 20-hour battery life.", category: "Electronics" },
    { id: 4, name: "Running Shoes", price: "$129.99", image: "https://m.media-amazon.com/images/I/71jGYKb6uiL._AC_SY575_.jpg", description: "Lightweight athletic shoes with cushioned support.", category: "Sports" },
    { id: 5, name: "Yoga Mat", price: "$49.99", image: "https://m.media-amazon.com/images/I/71fDvjK2-CL.__AC_SX300_SY300_QL70_ML2_.jpg", description: "Non-slip exercise mat perfect for yoga and fitness.", category: "Sports" },
    { id: 6, name: "Electric Kettle", price: "$39.99", image: "https://m.media-amazon.com/images/I/61WS0rothIL._AC_SX569_.jpg", description: "Fast boiling electric kettle with automatic shut-off.", category: "Home" },
    { id: 7, name: "Stainless Steel Water Bottle", price: "$19.99", image: "https://m.media-amazon.com/images/I/61du0HKPT-L.__AC_SX300_SY300_QL70_ML2_.jpg", description: "Insulated water bottle that keeps drinks cold for 24 hours.", category: "Sports" },
    { id: 8, name: "Electric Toothbrush", price: "$49.99", image: "https://m.media-amazon.com/images/I/71qj6MUVkIL._AC_SX425_.jpg", description: "Rechargeable electric toothbrush with smart timer.", category: "Health" },
    { id: 9, name: "Smart LED Bulbs", price: "$34.99", image: "https://m.media-amazon.com/images/I/61gaO3Jny7L._AC_SX679_.jpg", description: "Wi-Fi-enabled LED bulbs controllable via smartphone.", category: "Smart Home" },
    { id: 10, name: "Fitness Tracker Watch", price: "$59.99", image: "https://m.media-amazon.com/images/I/61AeGQhwjxL.__AC_SX300_SY300_QL70_ML2_.jpg", description: "Wearable fitness tracker that monitors heart rate and steps.", category: "Wearables" },
    { id: 11, name: "Portable Charger", price: "$29.99", image: "https://m.media-amazon.com/images/I/51E4tGpWPmL._AC_SX679_.jpg", description: "High-capacity portable charger with dual USB ports.", category: "Electronics" },
    { id: 12, name: "Non-Stick Cookware Set", price: "$89.99", image: "https://m.media-amazon.com/images/I/81-tPQ-u8vL.__AC_SX300_SY300_QL70_ML2_.jpg", description: "Durable non-stick cookware set for easy cooking.", category: "Home" },
    { id: 13, name: "Pet Grooming Kit", price: "$39.99", image: "https://m.media-amazon.com/images/I/61R1ye6gGKL._AC_SX679_.jpg", description: "Complete grooming kit for dogs and cats.", category: "Pets" },
    { id: 14, name: "Kids' Building Blocks Set", price: "$24.99", image: "https://m.media-amazon.com/images/I/91AUb4LJgBL._AC_SX425_.jpg", description: "Colorful building blocks set for creative play.", category: "Toys" },
    { id: 15, name: "Instant Pot Multi-Cooker", price: "$89.99", image: "https://m.media-amazon.com/images/I/71++-bZz+4L._AC_SY300_SX300_.jpg", description: "Versatile multi-cooker that combines pressure cooking and slow cooking.", category: "Home" },
    { id: 16, name: "Electric Griddle", price: "$49.99", image: "https://m.media-amazon.com/images/I/91gT1IJP7zL.__AC_SX300_SY300_QL70_ML2_.jpg", description: "Large electric griddle with non-stick surface.", category: "Home" },
    { id: 17, name: "Casual Sneakers", price: "$59.99", image: "https://m.media-amazon.com/images/I/81n6HX9GxlL._AC_SX575_.jpg", description: "Comfortable casual sneakers designed for daily wear.", category: "Fashion" },
    { id: 18, name: "Gaming Mouse", price: "$39.99", image: "https://m.media-amazon.com/images/I/713RxxjGIGL.__AC_SY300_SX300_QL70_ML2_.jpg", description: "Ergonomic gaming mouse with customizable DPI settings.", category: "Gaming" },
    { id: 19, name: "Coffee Maker", price: "$49.99", image: "https://m.media-amazon.com/images/I/517yg6D6GxL._AC_SL1250_.jpg", description: "Programmable coffee maker with built-in grinder.", category: "Home" },
    { id: 20, name: "Air Fryer", price: "$79.99", image: "https://m.media-amazon.com/images/I/61NKhAZRIUL.__AC_SY300_SX300_QL70_ML2_.jpg", description: "Healthy air fryer that cooks food using hot air circulation.", category: "Home" },
    { id: 21, name: "Smartphone Stand", price: "$15.99", image: "https://m.media-amazon.com/images/I/61srjyM7TFL.__AC_SX300_SY300_QL70_ML2_.jpg", description: "Adjustable smartphone stand compatible with all smartphones.", category: "Electronics" },
    { id: 22, name: "Men Casual Shirt", price: "$29.99", image: "https://m.media-amazon.com/images/I/81VfVizPknL._AC_SY500_.jpg", description: "Stylish casual shirt made from breathable cotton fabric.", category: "Fashion" },
    { id: 23, name: "Women Running Shoes", price: "$69.99", image: "https://m.media-amazon.com/images/I/51xsDZHFhxL._AC_SY695_.jpg", description: "Lightweight running shoes designed for comfort during workouts.", category: "Sports" },
    { id: 24, name: "Wireless Charger", price: "$25.99", image: "https://m.media-amazon.com/images/I/61-n1+G62UL._AC_SX300_SY300_.jpg", description: "Fast wireless charger compatible with all Qi-enabled devices.", category: "Electronics" },
    { id: 25, name: "Smart Home Security Camera", price: "$89.99", image: "https://m.media-amazon.com/images/I/41EprViBuqL.__AC_SX300_SY300_QL70_ML2_.jpg", description: "1080p HD security camera with night vision and motion detection.", category: "Smart Home" }
  ]);

  const [cart, setCart] = useState([]);
  const [theme, setTheme] = useState("light");
  const [addedProductModal, setAddedProductModal] = useState({ isOpen: false, product: null });
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [sessionId] = useState(() => localStorage.getItem('sessionId') || Math.random().toString(36).substring(7));
  const [recommendations, setRecommendations] = useState([]);
  const [viewedProducts, setViewedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...new Set(products.map(product => product.category))].sort();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    localStorage.setItem('sessionId', sessionId);
  }, [sessionId]);

  const recordInteraction = async (productId, type) => {
    try {
      await fetch('http://127.0.0.1:5000/record-interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          product_id: productId,
          type: type
        }),
      });
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  };

  const fetchRecommendations = async (productName) => {
    try {
      const updatedViewedProducts = [...viewedProducts, productName];
      setViewedProducts(updatedViewedProducts);

      const response = await fetch('http://127.0.0.1:5000/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          viewed_products: updatedViewedProducts
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      const fallbackRecs = products
        .filter(p => p.name !== productName)
        .slice(0, 2);
      setRecommendations(fallbackRecs);
    }
  };

  const handleAddToCart = async (product) => {
    setCart(prevCart => [...prevCart, product]);
    await recordInteraction(product.id, 'cart');
    await fetchRecommendations(product.name);
    setAddedProductModal({
      isOpen: true,
      product: product
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === "light" ? "dark" : "light"));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price.replace('$', ''));
      return total + price;
    }, 0).toFixed(2);
  };

  return (
    <div className={`app ${theme}`}>
      <header className="header">
        <h1 className="header-title">CosmoCart</h1>
        
        <div className="search-and-filter">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="header-controls">
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? <FaMoon size={24} /> : <FaSun size={24} />}
          </button>
          <button className="cart-button" onClick={() => setCartModalOpen(true)}>
            <FaShoppingCart size={24} />
            {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="product-card">
              <CardHeader>
                <img src={product.image} alt={product.name} className="product-image" />
                <span className="category-tag">{product.category}</span>
              </CardHeader>
              <CardContent>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">{product.price}</p>
                <p className="product-description">{product.description}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleAddToCart(product)} className="add-to-cart-btn">
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      {/* Shopping Cart Modal */}
      <Modal
        isOpen={cartModalOpen}
        onRequestClose={() => setCartModalOpen(false)}
        contentLabel="Shopping Cart"
        className="cart-modal"
        overlayClassName="overlay"
      >
        <div className="cart-modal-content">
          <h2>Your Shopping Cart</h2>
          {cart.length > 0 ? (
            <div className="cart-items">
              {cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p>{item.price}</p>
                  </div>
                  <Button 
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="remove-button"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="cart-total">
                <h3>Total: ${calculateTotal()}</h3>
              </div>
              <Button className="checkout-button">
                Proceed to Checkout
              </Button>
            </div>
          ) : (
            <p>Your cart is empty.</p>
          )}
          <Button onClick={() => setCartModalOpen(false)} className="close-button">
            Close
          </Button>
        </div>
      </Modal>

      {/* Added to Cart Modal with Recommendations */}
      <Modal
        isOpen={addedProductModal.isOpen}
        onRequestClose={() => setAddedProductModal({ isOpen: false, product: null })}
        contentLabel="Product Added"
        className="added-product-modal"
        overlayClassName="overlay"
      >
        <div className="added-product-content">
          <h2>Added to Cart!</h2>
          
          {addedProductModal.product && (
            <div className="added-item">
              <div className="success-icon">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <img 
                src={addedProductModal.product.image} 
                alt={addedProductModal.product.name} 
                className="added-item-image"
              />
              <h3>{addedProductModal.product.name}</h3>
              <p className="price">{addedProductModal.product.price}</p>
              <p className="description">{addedProductModal.product.description}</p>
            </div>
          )}
          
          {recommendations.length > 0 && (
            <div className="recommendations-section">
              <h3>You May Also Like</h3>
              <div className="recommendations-grid">
                {recommendations.slice(0, 2).map((rec) => (
                  <Card key={rec.product_id} className="recommendation-card">
                    <CardHeader>
                      <img 
                        src={rec.image}
                        alt={rec.product_name} 
                        className="recommendation-image" 
                      />
                    </CardHeader>
                    <CardContent>
                      <h4 className="recommendation-name">{rec.product_name}</h4>
                      <p className="recommendation-price">{rec.price}</p>
                      <p className="recommendation-description">{rec.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => {
                          handleAddToCart({
                            id: rec.product_id,
                            name: rec.product_name,
                            price: rec.price,
                            image: rec.image,
                            description: rec.description
                          });
                          setAddedProductModal({ isOpen: false, product: null });
                        }}
                        className="w-full"
                      >
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          <div className="modal-actions">
            <Button 
              onClick={() => setAddedProductModal({ isOpen: false, product: null })}
              className="continue-shopping-btn"
            >
              Continue Shopping
            </Button>
            <Button 
              onClick={() => {
                setAddedProductModal({ isOpen: false, product: null });
                setCartModalOpen(true);
              }}
              className="view-cart-btn"
            >
              View Cart
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;
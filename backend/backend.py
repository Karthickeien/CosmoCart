import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from collections import defaultdict
import uuid

app = Flask(__name__)
CORS(app)

class RecommendationSystem:
    def __init__(self):
        self.products = {}
        self.user_sessions = defaultdict(list)
        self.product_features = None
        self.similarity_matrix = None
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.view_weights = defaultdict(float)

    def add_product(self, product_id, name, description, category, price, image):
        """Add a product to the recommendation system"""
        self.products[product_id] = {
            'name': name,
            'description': description,
            'category': category,
            'price': price,
            'image': image
        }
        self._build_feature_matrix()

    def _build_feature_matrix(self):
        """Build TF-IDF feature matrix for content-based filtering"""
        if not self.products:
            return
            
        product_texts = []
        self.product_ids = []
        
        for pid, product in self.products.items():
            # Combine product features into text, including category for better matching
            text = f"{product['name']} {product['description']} {product['category']}"
            product_texts.append(text.lower())  # Normalize text
            self.product_ids.append(pid)
            
        self.product_features = self.vectorizer.fit_transform(product_texts)
        self.similarity_matrix = cosine_similarity(self.product_features)

    def record_interaction(self, session_id, product_id, interaction_type='view'):
        """Record user interaction with a product"""
        self.user_sessions[session_id].append({
            'product_id': product_id,
            'type': interaction_type,
            'timestamp': np.datetime64('now')
        })
        
        # Update view weights
        if interaction_type == 'view':
            self.view_weights[product_id] += 1
        elif interaction_type == 'cart':
            self.view_weights[product_id] += 2
        elif interaction_type == 'purchase':
            self.view_weights[product_id] += 3

    def get_recommendations(self, session_id, viewed_products, n_recommendations=4):
      """Get personalized recommendations based on viewing history"""
      if self.similarity_matrix is None:
          return []

      # Filter out None values and validate viewed_products
      if not viewed_products:
          return self._get_popular_products(n_recommendations)
      
      valid_viewed_products = [p for p in viewed_products if p is not None]
      if not valid_viewed_products:
          return self._get_popular_products(n_recommendations)

      # Convert product names to IDs if necessary
      viewed_ids = [pid for pid in self.product_ids if any(
          str(p).lower() in self.products[pid]['name'].lower() 
          for p in valid_viewed_products
      )]
      
      if not viewed_ids:
          return self._get_popular_products(n_recommendations)

      # Calculate recommendation scores with improved diversity
      scores = np.zeros(len(self.products))
      
      # Base similarity scores
      for pid in viewed_ids:
          try:
              idx = self.product_ids.index(pid)
              # Weight recent views more heavily
              time_weight = 1.0
              if self.user_sessions[session_id]:
                  for interaction in reversed(self.user_sessions[session_id]):
                      if interaction['product_id'] == pid:
                          time_weight = 1.5
                          break
              scores += self.similarity_matrix[idx] * time_weight
          except ValueError:
              continue

      # Normalize scores
      if np.max(scores) > 0:
          scores = scores / np.max(scores)

      # Apply various diversity boosters
      viewed_categories = {self.products[pid]['category'] for pid in viewed_ids}
      price_ranges = {
          pid: self._get_price_range(self.products[pid]['price']) 
          for pid in self.product_ids
      }
      viewed_price_ranges = {price_ranges[pid] for pid in viewed_ids}

      for i, pid in enumerate(self.product_ids):
          # Category diversity bonus
          if self.products[pid]['category'] not in viewed_categories:
              scores[i] *= 1.2
          
          # Price range diversity bonus
          if price_ranges[pid] not in viewed_price_ranges:
              scores[i] *= 1.1
          
          # Popularity bonus (scaled to be a smaller factor)
          popularity_score = self.view_weights.get(pid, 0) / (max(self.view_weights.values(), default=1) + 1)
          scores[i] += popularity_score * 0.3
          
          # Penalty for already viewed products
          if pid in viewed_ids:
              scores[i] = 0

      # Get top N recommendations
      recommended_indices = []
      sorted_indices = np.argsort(scores)[::-1]
      
      # Ensure we get enough recommendations
      for idx in sorted_indices:
          if self.product_ids[idx] not in viewed_ids:
              recommended_indices.append(idx)
          if len(recommended_indices) == n_recommendations:
              break
      
      # If we still don't have enough recommendations, add popular products
      if len(recommended_indices) < n_recommendations:
          popular_products = self._get_popular_products(n_recommendations - len(recommended_indices))
          existing_ids = {self.product_ids[idx] for idx in recommended_indices}
          for product in popular_products:
              if product['product_id'] not in existing_ids and product['product_id'] not in viewed_ids:
                  try:
                      idx = self.product_ids.index(product['product_id'])
                      recommended_indices.append(idx)
                  except ValueError:
                      continue

      # Build recommendation list
      recommendations = []
      for idx in recommended_indices:
          pid = self.product_ids[idx]
          product = self.products[pid]
          recommendations.append({
              'product_id': pid,
              'product_name': product['name'],
              'description': product['description'],
              'price': product['price'],
              'image': product['image'],
              'category': product['category']
          })

      return recommendations

    def _get_price_range(self, price):
        """Helper method to categorize products into price ranges"""
        if price < 25:
            return 'budget'
        elif price < 50:
            return 'mid_range'
        elif price < 100:
            return 'premium'
        else:
            return 'luxury'

    def _get_popular_products(self, n):
        """Get most popular products based on view weights"""
        sorted_products = sorted(
            self.view_weights.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        recommendations = []
        for pid, _ in sorted_products[:n]:
            product = self.products[pid]
            recommendations.append({
                'product_id': pid,
                'product_name': product['name'],
                'description': product['description'],
                'price': product['price'],
                'image': product['image'],
                'category': product['category']
            })
            
        return recommendations

# Initialize recommendation system
rec_system = RecommendationSystem()

sample_products = [
  {
    'id': '1',
    'name': 'Wireless Noise-Cancelling Headphones',
    'description': 'Premium bluetooth headphones with active noise cancellation.',
    'category': 'Electronics',
    'price': 299.99,
    'image': 'https://m.media-amazon.com/images/I/610NdWdTLiL.__AC_SX300_SY300_QL70_ML2_.jpg'
  },
  {
    'id': '2',
    'name': 'Smart Fitness Watch',
    'description': 'Track your workouts and health metrics with this advanced smartwatch.',
    'category': 'Electronics',
    'price': 199.99,
    'image': 'https://m.media-amazon.com/images/I/71CQ6esBqFL._AC_SX679_.jpg'
  },
  {
    'id': '3',
    'name': 'Bluetooth Speaker',
    'description': 'Portable wireless speaker with deep bass and 20-hour battery life.',
    'category': 'Electronics',
    'price': 79.99,
    'image': 'https://m.media-amazon.com/images/I/810dSwE0MoL._AC_SX679_.jpg'
  },
  {
    'id': '4',
    'name': 'Running Shoes',
    'description': 'Lightweight athletic shoes with cushioned support.',
    'category': 'Footwear',
    'price': 129.99,
    'image': 'https://m.media-amazon.com/images/I/71jGYKb6uiL._AC_SY575_.jpg'
  },
  {
    'id': '5',
    'name': 'Yoga Mat',
    'description': 'Non-slip exercise mat perfect for yoga and fitness.',
    'category': 'Fitness',
    'price': 49.99,
    'image': 'https://m.media-amazon.com/images/I/71fDvjK2-CL.__AC_SX300_SY300_QL70_ML2_.jpg'
  },
  {
    'id': '6',
    'name': 'Electric Kettle',
    'description': 'Fast boiling electric kettle with automatic shut-off.',
    'category': 'Kitchen Appliances',
    'price': 39.99,
    'image': 'https://m.media-amazon.com/images/I/61WS0rothIL._AC_SX569_.jpg'
  },
  {
    'id': '7',
    'name': 'Stainless Steel Water Bottle',
    'description': "Insulated water bottle that keeps drinks cold for 24 hours.",
    'category': 'Outdoor',
    'price': 19.99,
    'image': 'https://m.media-amazon.com/images/I/61du0HKPT-L.__AC_SX300_SY300_QL70_ML2_.jpg'
  },
  {
    'id': '8',
    'name': 'Electric Toothbrush',
    'description': 'Rechargeable electric toothbrush with smart timer.',
    'category': 'Personal Care',
    'price': 49.99,
    'image': 'https://m.media-amazon.com/images/I/71qj6MUVkIL._AC_SX425_.jpg'
  },
  {
    'id': '9',
    'name': 'Smart LED Bulbs',
    'description': 'Wi-Fi-enabled LED bulbs controllable via smartphone.',
    'category': 'Smart Home',
    'price': 34.99,
    'image': 'https://m.media-amazon.com/images/I/61gaO3Jny7L._AC_SX679_.jpg'
  },
  {
    'id': '10',
    'name': 'Fitness Tracker Watch',
    'description': 'Wearable fitness tracker that monitors heart rate and steps.',
    'category': 'Electronics',
    'price': 59.99,
    'image': 'https://m.media-amazon.com/images/I/61AeGQhwjxL.__AC_SX300_SY300_QL70_ML2_.jpg'
  },
  {
    'id': '11',
    'name': 'Portable Charger',
    'description': 'High-capacity portable charger with dual USB ports.',
    'category': 'Electronics',
    'price': 29.99,
    'image': 'https://m.media-amazon.com/images/I/51E4tGpWPmL._AC_SX679_.jpg'
  },
  {
    'id': '12',
    'name': 'Non-Stick Cookware Set',
    'description': 'Durable non-stick cookware set for easy cooking.',
    'category': 'Kitchenware',
    'price': 89.99,
    'image': 'https://m.media-amazon.com/images/I/81-tPQ-u8vL.__AC_SX300_SY300_QL70_ML2_.jpg'
  },
  {
    'id': '13',
    'name': 'Pet Grooming Kit',
    'description': 'Complete grooming kit for dogs and cats.',
    'category': 'Pet Supplies',
    'price': 39.99,
    'image': 'https://m.media-amazon.com/images/I/61R1ye6gGKL._AC_SX679_.jpg'
  },
  {
    'id': '14',
    'name': 'Kids\' Building Blocks Set',
    'description': 'Colorful building blocks set for creative play.',
    'category': 'Toys',
    'price': 24.99,
    'image': 'https://m.media-amazon.com/images/I/91AUb4LJgBL._AC_SX425_.jpg'
  },
  {
    'id': '15',
    'name': 'Instant Pot Multi-Cooker',
    'description': 'Versatile multi-cooker that combines pressure cooking and slow cooking.',
    'category': 'Kitchen Appliances',
    'price': 89.99,
    'image': 'https://m.media-amazon.com/images/I/71++-bZz+4L._AC_SY300_SX300_.jpg'
  },
  {
    'id': '16',
    'name': 'Electric Griddle',
    'description': 'Large electric griddle with non-stick surface.',
    'category': 'Kitchen Appliances',
    'price': 49.99,
    'image': 'https://m.media-amazon.com/images/I/91gT1IJP7zL.__AC_SX300_SY300_QL70_ML2_.jpg'
  },
  {
    'id': '17',
    'name': 'Casual Sneakers',
    'description': 'Comfortable casual sneakers designed for daily wear.',
    'category': 'Footwear',
    'price': 59.99,
    'image': 'https://m.media-amazon.com/images/I/81n6HX9GxlL._AC_SX575_.jpg'
  },
  {
    'id': '18',
    'name': 'Gaming Mouse',
    'description': 'Ergonomic gaming mouse with customizable DPI settings.',
    'category': 'Electronics',
    'price': 39.99,
    'image': 'https://m.media-amazon.com/images/I/713RxxjGIGL.__AC_SY300_SX300_QL70_ML2_.jpg'
  },
  {
    'id': '19',
    'name': 'Coffee Maker',
    'description': 'Programmable coffee maker with built-in grinder.',
    'category': 'Kitchen Appliances',
    'price': 49.99,
    'image': 'https://m.media-amazon.com/images/I/517yg6D6GxL._AC_SL1250_.jpg'
  },
  {
    'id': '20',
    'name': 'Air Fryer',
    'description': 'Healthy air fryer that cooks food using hot air circulation.',
    'category': 'Kitchen Appliances',
    'price': 79.99,
    'image': 'https://m.media-amazon.com/images/I/61NKhAZRIUL.__AC_SY300_SX300_QL70_ML2_.jpg'
  },
  {
    'id': '21',
    'name': 'Smartphone Stand',
    'description': 'Adjustable smartphone stand compatible with all smartphones.',
    'category': 'Accessories',
    'price': 15.99,
    'image': 'https://m.media-amazon.com/images/I/61srjyM7TFL.__AC_SX300_SY300_QL70_ML2_.jpg'
  },
  {
    'id': '22',
    'name': 'Men Casual Shirt',
    'description': 'Stylish casual shirt made from breathable cotton fabric.',
    'category': 'Clothing',
    'price': 29.99,
    'image': 'https://m.media-amazon.com/images/I/81VfVizPknL._AC_SY500_.jpg'
  },
  {
    'id': '23',
    'name': 'Women Running Shoes',
    'description': 'Lightweight running shoes designed for comfort during workouts.',
    'category': 'Footwear',
    'price': 69.99,
    'image': 'https://m.media-amazon.com/images/I/51xsDZHFhxL._AC_SY695_.jpg'
  },
  {
    'id': '24',
    'name': 'Wireless Charger',
    'description': 'Fast wireless charger compatible with all Qi-enabled devices.',
    'category': 'Electronics',
    'price': 25.99,
    'image': 'https://m.media-amazon.com/images/I/61-n1+G62UL._AC_SX300_SY300_.jpg'
  },
  {
    'id': '25',
    'name': 'Smart Home Security Camera',
    'description': '1080p HD security camera with night vision and motion detection.',
    'category': 'Smart Home',
    'price': 89.99,
    'image': 'https://m.media-amazon.com/images/I/41EprViBuqL.__AC_SX300_SY300_QL70_ML2_.jpg'
  }
];  


# Initialize recommendation system
rec_system = RecommendationSystem()

# Add sample products
for product in sample_products:
    rec_system.add_product(
        product['id'],
        product['name'],
        product['description'],
        product['category'],
        product['price'],
        product['image']
    )

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json
    viewed_products = data.get('viewed_products', [])
    session_id = data.get('session_id', str(uuid.uuid4()))
    category_filter = data.get('category', None)

    if not viewed_products:
        return jsonify({'error': 'No products in browsing history.'}), 400

    # Record views
    for product in viewed_products:
        rec_system.record_interaction(session_id, product, 'view')

    recommendations = rec_system.get_recommendations(session_id, viewed_products)

    # Apply category filter if specified
    if category_filter and category_filter != "All":
        recommendations = [
            r for r in recommendations 
            if r['category'].lower() == category_filter.lower()
        ]

    if not recommendations:
        return jsonify({'error': 'No matching products found.'}), 400

    return jsonify(recommendations)

@app.route('/record-interaction', methods=['POST'])
def record_interaction():
    data = request.json
    session_id = data.get('session_id', str(uuid.uuid4()))
    product_id = data.get('product_id')
    interaction_type = data.get('type', 'view')

    if not product_id:
        return jsonify({'error': 'Product ID is required.'}), 400

    rec_system.record_interaction(session_id, product_id, interaction_type)
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True)

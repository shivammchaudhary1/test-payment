import { useState, useEffect } from "react";
import "./App.css";

const products = [
  {
    id: 1,
    name: "Premium Headphones",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500",
  },
  {
    id: 3,
    name: "Wireless Speaker",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
  },
  {
    id: 4,
    name: "Camera Lens",
    price: 399.99,
    image: "https://images.unsplash.com/photo-1513652990199-8a52e2313122?w=500",
  },
];

function App() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      alert("Payment successful! Thank you for your purchase.");
    }

    if (query.get("canceled")) {
      alert("Payment canceled. Please try again when you are ready.");
    }
  }, []);

  const handleBuy = async (product) => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3333/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // parcelID:
          // userId 
        },
        body: JSON.stringify({
          productId: product.id,
          amount: product.price,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("There was an error processing your payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Our Products</h1>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="price">${product.price}</p>
              <button
                className="buy-button"
                onClick={() => handleBuy(product)}
                disabled={loading}
              >
                {loading ? "Processing..." : "Buy Now"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

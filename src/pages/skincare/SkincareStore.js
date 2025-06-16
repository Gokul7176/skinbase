import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import {
  collection, addDoc, getDocs, query, where, deleteDoc, doc
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

export default function SkincareStore() {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [products, setProducts] = useState([]);
  const [productDetails, setProductDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [pastViews, setPastViews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const auth = getAuth();
    signInAnonymously(auth)
      .then((userCredential) => {
        const uid = userCredential.user.uid;
        setUserId(uid);
        loadProducts(uid);
        loadPastViews(uid);
      })
      .catch(() => setError('Authentication failed.'));
  }, []);

  const loadProducts = async (uid) => {
    try {
      const q = query(collection(db, 'skincare'), where('userId', '==', uid));
      const snapshot = await getDocs(q);
      const list = [];
      const docsMap = new Map();
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({ name: data.productName, price: parseFloat(data.price) });
        docsMap.set(data.productName, docSnap.id);
      });
      setProducts(list);
      window.productDocs = docsMap;
    } catch {
      setError('Failed to load products.');
    }
  };

  const loadPastViews = async (uid) => {
    try {
      const q = query(collection(db, 'skincareViews'), where('userId', '==', uid));
      const snapshot = await getDocs(q);
      const views = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          productName: data.productName,
          details: data.details,
          timestamp: data.timestamp.toDate().toLocaleString(),
        };
      });
      setPastViews(views.reverse());
    } catch {
      setError('Failed to load view history.');
    }
  };

  const addProduct = async () => {
    const name = productName.trim();
    const price = parseFloat(productPrice);
    if (!name || isNaN(price) || price <= 0) {
      setError('Enter a valid product and price.');
      return;
    }
    if (products.some(p => p.name === name)) {
      setError('Product already exists.');
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'skincare'), {
        userId,
        productName: name,
        price,
        timestamp: new Date()
      });
      setProducts([...products, { name, price }]);
      window.productDocs.set(name, docRef.id);
      setProductName('');
      setProductPrice('');
      setError('');
    } catch {
      setError('Failed to add product.');
    }
  };

  const deleteProduct = async (name) => {
    try {
      const id = window.productDocs.get(name);
      await deleteDoc(doc(db, 'skincare', id));
      setProducts(products.filter(p => p.name !== name));
      window.productDocs.delete(name);
    } catch {
      setError('Failed to delete.');
    }
  };

  const viewDetails = async () => {
    if (products.length === 0) return setError('Add at least one product.');
    setLoading(true);
    try {
      const res = await fetch('/api/skincare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products, userId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setProductDetails(data.details || 'No details available.');
      await addDoc(collection(db, 'skincareViews'), {
        userId,
        productName: products.map(p => p.name).join(', '),
        details: data.details,
        timestamp: new Date()
      });
      loadPastViews(userId);
    } catch {
      setProductDetails('Error fetching details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: 'auto',
      padding: '20px',
      background: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>🌿 Skincare Product Manager</h2>
      
      {error && <p style={{ color: '#c62828', fontWeight: 'bold' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Product Name"
          style={{ flex: 2, padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <input
          type="number"
          value={productPrice}
          onChange={(e) => setProductPrice(e.target.value)}
          placeholder="Price ($)"
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <button onClick={addProduct} disabled={!userId} style={{
          background: '#66bb6a',
          color: 'white',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>Add</button>
      </div>

      <button onClick={viewDetails} disabled={!userId || products.length === 0} style={{
        background: '#81c784',
        padding: '10px 18px',
        border: 'none',
        borderRadius: '6px',
        marginBottom: '20px',
        color: '#fff',
        cursor: 'pointer'
      }}>
        {loading ? 'Loading...' : 'View Skincare Details'}
      </button>

      <h3>🧴 Your Products</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
        {products.map((p, i) => (
          <div key={i} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '12px',
            position: 'relative'
          }}>
            <h4 style={{ margin: 0 }}>{p.name}</h4>
            <p>${p.price.toFixed(2)}</p>
            <button onClick={() => deleteProduct(p.name)} style={{
              position: 'absolute',
              top: '8px',
              right: '10px',
              background: 'transparent',
              border: 'none',
              color: '#d32f2f',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>✕</button>
          </div>
        ))}
      </div>

      {productDetails && (
        <div style={{
          marginTop: '20px',
          background: '#f1f8e9',
          padding: '15px',
          borderRadius: '6px'
        }}>
          <h4>📝 Product Info</h4>
          <p style={{ whiteSpace: 'pre-wrap' }}>{productDetails}</p>
        </div>
      )}

      {pastViews.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>🕒 Past Searches</h3>
          {pastViews.map((view) => (
            <div key={view.id} style={{
              borderBottom: '1px solid #ccc',
              padding: '10px 0'
            }}>
              <p><strong>Products:</strong> {view.productName}</p>
              <p><strong>Details:</strong> {view.details}</p>
              <p><strong>Viewed At:</strong> {view.timestamp}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

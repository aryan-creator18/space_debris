# Development Guide

## Integrating Your ML Models

### 1. Replace Mock LSTM Model

In `backend/app.py`, replace the `MockLSTM` class:

```python
# Remove this:
class MockLSTM:
    def predict(self, X):
        return X + np.random.randn(*X.shape) * 10

# Add this:
import tensorflow as tf
lstm_model = tf.keras.models.load_model('path/to/your/lstm_model.h5')

# Or for PyTorch:
import torch
lstm_model = torch.load('path/to/your/lstm_model.pt')
lstm_model.eval()
```

### 2. Replace Mock XGBoost Model

```python
# Remove this:
class MockXGBoost:
    def predict_proba(self, X):
        return np.random.rand(X.shape[0], 2)

# Add this:
import xgboost as xgb
xgboost_model = xgb.Booster()
xgboost_model.load_model('path/to/your/xgboost_model.json')
```

### 3. Update Prediction Logic

Modify the `/api/predict/trajectory` endpoint:

```python
@app.route('/api/predict/trajectory', methods=['POST'])
def predict_trajectory():
    data = request.json
    sat_id = data['sat_id']
    hours = data.get('hours', 24)
    
    # Get satellite features
    sat_data = df[df['NORAD_CAT_ID'] == sat_id].iloc[0]
    
    # Prepare input for your model
    features = np.array([[
        sat_data['MEAN_MOTION'],
        sat_data['ECCENTRICITY'],
        sat_data['INCLINATION'],
        # ... add more features
    ]])
    
    # Your model prediction
    predictions = lstm_model.predict(features)
    
    # Format response
    return jsonify({
        'sat_id': sat_id,
        'predictions': predictions.tolist()
    })
```

## Adding New Features

### Add New API Endpoint

1. Add route in `backend/app.py`:
```python
@app.route('/api/your-endpoint', methods=['POST'])
def your_function():
    data = request.json
    # Your logic here
    return jsonify({'result': 'data'})
```

2. Call from frontend in `frontend/src/App.js`:
```javascript
const callYourEndpoint = async () => {
    const res = await axios.post(`${API_URL}/your-endpoint`, {
        param: value
    });
    console.log(res.data);
};
```

### Add New Component

1. Create `frontend/src/components/YourComponent.js`:
```javascript
import React from 'react';
import './YourComponent.css';

function YourComponent({ props }) {
    return (
        <div className="your-component">
            {/* Your JSX */}
        </div>
    );
}

export default YourComponent;
```

2. Import in `App.js`:
```javascript
import YourComponent from './components/YourComponent';

// Use in render:
<YourComponent prop={value} />
```

## Customizing Visualization

### Change Orbit Colors

In `frontend/src/components/OrbitVisualization.js`:
```javascript
const colors = ['#ff5252', '#4fc3f7', '#ffeb3b', '#4caf50'];
// Change to your preferred colors
```

### Add More Satellites to Visualization

In `backend/app.py`:
```python
@app.route('/api/satellites', methods=['GET'])
def get_satellites():
    satellites = df['NORAD_CAT_ID'].unique().tolist()
    return jsonify({'satellites': satellites[:100]})  # Increase limit
```

### Modify Earth Appearance

In `frontend/src/components/OrbitVisualization.js`:
```javascript
<Sphere ref={earthRef} args={[6371, 64, 64]}>
    <meshStandardMaterial 
        color="#1e88e5"  // Change color
        metalness={0.4}   // Adjust metalness
        roughness={0.7}   // Adjust roughness
    />
</Sphere>
```

## Testing

### Backend Tests

```bash
cd backend
python test_api.py
```

### Frontend Tests

Add to `frontend/src/App.test.js`:
```javascript
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Space Debris/i);
    expect(titleElement).toBeInTheDocument();
});
```

Run tests:
```bash
cd frontend
npm test
```

## Deployment

### Backend (Flask)

Production server with Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend (React)

Build for production:
```bash
cd frontend
npm run build
```

Serve with nginx or deploy to:
- Vercel
- Netlify
- GitHub Pages

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM python:3.9
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["python", "app.py"]
```

Build and run:
```bash
docker build -t space-debris-api .
docker run -p 5000:5000 space-debris-api
```

## Performance Optimization

### Backend
- Use caching for orbit calculations
- Implement database for faster queries
- Add Redis for session management

### Frontend
- Lazy load components
- Memoize expensive calculations
- Use React.memo for pure components
- Implement virtual scrolling for large lists

## Troubleshooting

### CORS Issues
Add to `backend/app.py`:
```python
CORS(app, resources={r"/api/*": {"origins": "*"}})
```

### Memory Issues with 3D
Reduce orbit resolution in `backend/app.py`:
```python
for theta in np.linspace(0, 2*np.pi, 50):  # Reduce from 100
```

### Slow Predictions
Implement caching:
```python
from functools import lru_cache

@lru_cache(maxsize=100)
def get_orbit_cached(sat_id):
    # Your orbit calculation
    pass
```

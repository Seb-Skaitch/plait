import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

4. Commit changes

**Then update index.html**

1. Click on `index.html` in your file list
2. Click the pencil icon (Edit)
3. Change this line:
```
<script type="module" src="/src/App.jsx"></script>
```
To this:
```
<script type="module" src="/src/main.jsx"></script>

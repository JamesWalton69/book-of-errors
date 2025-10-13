class CloudTemplateManager {
    constructor() {
        this.templates = new Map();
        this.templateSources = {
            local: 'Local Templates',
            googledrive: 'Google Drive',
            github: 'GitHub',
            community: 'Community'
        };
        
        this.initializeBuiltInTemplates();
        this.setupEventListeners();
    }

    initializeBuiltInTemplates() {
        // Advanced Data Science Template
        this.addTemplate('advanced_data_science', {
            name: 'Advanced Data Science',
            description: 'Complete data science workflow with ML models',
            category: 'Data Science',
            source: 'local',
            tags: ['pandas', 'sklearn', 'matplotlib', 'jupyter'],
            files: [
                {
                    name: 'data_pipeline.py',
                    content: `# Advanced Data Science Pipeline
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

class DataPipeline:
    def __init__(self):
        self.data = None
        self.model = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
    
    def load_data(self, file_path=None):
        """Load data from CSV or generate sample data"""
        if file_path:
            self.data = pd.read_csv(file_path)
        else:
            # Generate sample classification data
            from sklearn.datasets import make_classification
            X, y = make_classification(
                n_samples=1000,
                n_features=10,
                n_informative=5,
                n_redundant=2,
                random_state=42
            )
            feature_names = [f'feature_{i}' for i in range(X.shape[1])]
            self.data = pd.DataFrame(X, columns=feature_names)
            self.data['target'] = y
        
        print(f"Data loaded: {self.data.shape}")
        return self.data
    
    def explore_data(self):
        """Basic data exploration"""
        print("Data Info:")
        print(self.data.info())
        print("\nDescriptive Statistics:")
        print(self.data.describe())
        
        # Visualization
        plt.figure(figsize=(12, 8))
        
        # Correlation heatmap
        plt.subplot(2, 2, 1)
        sns.heatmap(self.data.corr(), annot=True, cmap='coolwarm', center=0)
        plt.title('Feature Correlation')
        
        # Distribution plots
        plt.subplot(2, 2, 2)
        self.data.hist(bins=20, figsize=(12, 8))
        plt.tight_layout()
        
        plt.show()
    
    def preprocess_data(self, target_column='target'):
        """Preprocess data for modeling"""
        # Separate features and target
        X = self.data.drop(target_column, axis=1)
        y = self.data[target_column]
        
        # Split data
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"Training set: {self.X_train.shape}")
        print(f"Test set: {self.X_test.shape}")
    
    def train_model(self):
        """Train Random Forest model"""
        self.model = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            max_depth=10
        )
        
        self.model.fit(self.X_train, self.y_train)
        print("Model trained successfully!")
    
    def evaluate_model(self):
        """Evaluate model performance"""
        # Predictions
        y_pred = self.model.predict(self.X_test)
        
        # Classification report
        print("Classification Report:")
        print(classification_report(self.y_test, y_pred))
        
        # Confusion Matrix
        cm = confusion_matrix(self.y_test, y_pred)
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
        plt.title('Confusion Matrix')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        plt.show()
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': self.X_train.columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        plt.figure(figsize=(10, 6))
        sns.barplot(data=feature_importance.head(10), x='importance', y='feature')
        plt.title('Top 10 Feature Importance')
        plt.show()
        
        return feature_importance
    
    def run_full_pipeline(self):
        """Run complete data science pipeline"""
        print("=" * 50)
        print("STARTING DATA SCIENCE PIPELINE")
        print("=" * 50)
        
        # Load data
        self.load_data()
        
        # Explore data
        self.explore_data()
        
        # Preprocess
        self.preprocess_data()
        
        # Train model
        self.train_model()
        
        # Evaluate
        feature_importance = self.evaluate_model()
        
        print("=" * 50)
        print("PIPELINE COMPLETED")
        print("=" * 50)
        
        return feature_importance

# Example usage
if __name__ == "__main__":
    pipeline = DataPipeline()
    results = pipeline.run_full_pipeline()
    print(f"\nTop 5 most important features:")
    print(results.head())`
                },
                {
                    name: 'model_utils.py',
                    content: `# Model Utilities and Helpers
import joblib
import json
from datetime import datetime

class ModelManager:
    """Utility class for model management"""
    
    @staticmethod
    def save_model(model, filename, metadata=None):
        """Save model with metadata"""
        # Save model
        joblib.dump(model, f"{filename}.joblib")
        
        # Save metadata
        if metadata is None:
            metadata = {}
        
        metadata.update({
            'saved_at': datetime.now().isoformat(),
            'model_type': type(model).__name__
        })
        
        with open(f"{filename}_metadata.json", 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Model saved as {filename}.joblib")
    
    @staticmethod
    def load_model(filename):
        """Load model with metadata"""
        model = joblib.load(f"{filename}.joblib")
        
        try:
            with open(f"{filename}_metadata.json", 'r') as f:
                metadata = json.load(f)
            print(f"Model loaded: {metadata.get('model_type', 'Unknown')}")
            print(f"Saved at: {metadata.get('saved_at', 'Unknown')}")
            return model, metadata
        except FileNotFoundError:
            print("Model loaded (no metadata found)")
            return model, {}

class DataValidator:
    """Data validation utilities"""
    
    @staticmethod
    def check_missing_values(df):
        """Check for missing values"""
        missing = df.isnull().sum()
        if missing.sum() > 0:
            print("Missing values found:")
            print(missing[missing > 0])
            return True
        else:
            print("No missing values found")
            return False
    
    @staticmethod
    def check_data_types(df):
        """Check data types"""
        print("Data types:")
        print(df.dtypes)
    
    @staticmethod
    def detect_outliers(df, columns=None, method='iqr'):
        """Detect outliers using IQR method"""
        if columns is None:
            columns = df.select_dtypes(include=[np.number]).columns
        
        outliers = {}
        
        for col in columns:
            if method == 'iqr':
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                outlier_mask = (df[col] < lower_bound) | (df[col] > upper_bound)
                outliers[col] = df[outlier_mask].index.tolist()
        
        return outliers

# Performance monitoring
class PerformanceMonitor:
    """Monitor model performance over time"""
    
    def __init__(self):
        self.metrics_history = []
    
    def log_metrics(self, metrics, timestamp=None):
        """Log performance metrics"""
        if timestamp is None:
            timestamp = datetime.now().isoformat()
        
        entry = {
            'timestamp': timestamp,
            'metrics': metrics
        }
        
        self.metrics_history.append(entry)
        print(f"Metrics logged for {timestamp}")
    
    def get_performance_trend(self, metric_name):
        """Get trend for specific metric"""
        values = [entry['metrics'].get(metric_name) for entry in self.metrics_history]
        timestamps = [entry['timestamp'] for entry in self.metrics_history]
        
        return timestamps, values
    
    def export_history(self, filename):
        """Export metrics history to JSON"""
        with open(filename, 'w') as f:
            json.dump(self.metrics_history, f, indent=2)
        
        print(f"Metrics history exported to {filename}")`
                },
                {
                    name: 'requirements.txt',
                    content: `# Data Science Requirements
pandas>=1.5.0
numpy>=1.21.0
scikit-learn>=1.1.0
matplotlib>=3.5.0
seaborn>=0.11.2
jupyter>=1.0.0
joblib>=1.2.0
scipy>=1.9.0
plotly>=5.0.0
streamlit>=1.20.0`
                },
                {
                    name: 'config.py',
                    content: `# Configuration file for data science project

# Data settings
DATA_CONFIG = {
    'train_size': 0.8,
    'validation_size': 0.1,
    'test_size': 0.1,
    'random_state': 42,
    'shuffle': True
}

# Model settings
MODEL_CONFIG = {
    'random_forest': {
        'n_estimators': 100,
        'max_depth': 10,
        'min_samples_split': 2,
        'min_samples_leaf': 1,
        'random_state': 42
    },
    'gradient_boosting': {
        'n_estimators': 100,
        'learning_rate': 0.1,
        'max_depth': 3,
        'random_state': 42
    }
}

# Visualization settings
VIZ_CONFIG = {
    'figure_size': (12, 8),
    'color_palette': 'viridis',
    'style': 'whitegrid',
    'context': 'notebook'
}

# File paths
PATHS = {
    'data_dir': 'data/',
    'models_dir': 'models/',
    'outputs_dir': 'outputs/',
    'logs_dir': 'logs/'
}`
                }
            ]
        });

        // Web Development Template
        this.addTemplate('flask_web_app', {
            name: 'Flask Web Application',
            description: 'Complete Flask web application with authentication',
            category: 'Web Development',
            source: 'local',
            tags: ['flask', 'web', 'authentication', 'database'],
            files: [
                {
                    name: 'app.py',
                    content: `# Flask Web Application
from flask import Flask, render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Change this in production

# Database setup
def init_db():
    """Initialize the database"""
    conn = sqlite3.connect('app.db')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            author_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES users (id)
        )
    ''')
    conn.commit()
    conn.close()

# Routes
@app.route('/')
def index():
    """Home page"""
    conn = sqlite3.connect('app.db')
    posts = conn.execute('''
        SELECT p.id, p.title, p.content, u.username, p.created_at
        FROM posts p
        JOIN users u ON p.author_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 10
    ''').fetchall()
    conn.close()
    
    return render_template('index.html', posts=posts)

@app.route('/register', methods=['GET', 'POST'])
def register():
    """User registration"""
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        # Validate input
        if not username or not email or not password:
            flash('All fields are required')
            return render_template('register.html')
        
        # Hash password
        password_hash = generate_password_hash(password)
        
        # Insert user
        try:
            conn = sqlite3.connect('app.db')
            conn.execute(
                'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                (username, email, password_hash)
            )
            conn.commit()
            conn.close()
            
            flash('Registration successful! Please log in.')
            return redirect(url_for('login'))
            
        except sqlite3.IntegrityError:
            flash('Username or email already exists')
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """User login"""
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        conn = sqlite3.connect('app.db')
        user = conn.execute(
            'SELECT id, username, password_hash FROM users WHERE username = ?',
            (username,)
        ).fetchone()
        conn.close()
        
        if user and check_password_hash(user[2], password):
            session['user_id'] = user[0]
            session['username'] = user[1]
            flash('Login successful!')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """User logout"""
    session.clear()
    flash('You have been logged out')
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    """User dashboard"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    conn = sqlite3.connect('app.db')
    posts = conn.execute(
        'SELECT id, title, content, created_at FROM posts WHERE author_id = ? ORDER BY created_at DESC',
        (session['user_id'],)
    ).fetchall()
    conn.close()
    
    return render_template('dashboard.html', posts=posts)

@app.route('/create_post', methods=['GET', 'POST'])
def create_post():
    """Create new post"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        
        if not title or not content:
            flash('Title and content are required')
            return render_template('create_post.html')
        
        conn = sqlite3.connect('app.db')
        conn.execute(
            'INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)',
            (title, content, session['user_id'])
        )
        conn.commit()
        conn.close()
        
        flash('Post created successfully!')
        return redirect(url_for('dashboard'))
    
    return render_template('create_post.html')

if __name__ == '__main__':
    init_db()
    app.run(debug=True)`
                },
                {
                    name: 'models.py',
                    content: `# Database Models
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class User:
    """User model"""
    id: Optional[int]
    username: str
    email: str
    password_hash: str
    created_at: Optional[datetime] = None
    
    @classmethod
    def from_db_row(cls, row):
        """Create User instance from database row"""
        return cls(
            id=row[0],
            username=row[1],
            email=row[2],
            password_hash=row[3],
            created_at=row[4]
        )

@dataclass
class Post:
    """Post model"""
    id: Optional[int]
    title: str
    content: str
    author_id: int
    created_at: Optional[datetime] = None
    author_username: Optional[str] = None
    
    @classmethod
    def from_db_row(cls, row):
        """Create Post instance from database row"""
        return cls(
            id=row[0],
            title=row[1],
            content=row[2],
            author_id=row[3],
            created_at=row[4],
            author_username=row[5] if len(row) > 5 else None
        )`
                },
                {
                    name: 'requirements.txt',
                    content: `# Flask Web Application Requirements
Flask>=2.3.0
Werkzeug>=2.3.0
Jinja2>=3.1.0
click>=8.0.0
itsdangerous>=2.1.0
MarkupSafe>=2.1.0
sqlite3
gunicorn>=21.0.0  # for production
python-dotenv>=1.0.0  # for environment variables`
                }
            ]
        });

        // Machine Learning Template
        this.addTemplate('ml_classification', {
            name: 'ML Classification Project',
            description: 'Complete machine learning classification pipeline',
            category: 'Machine Learning',
            source: 'local',
            tags: ['scikit-learn', 'classification', 'preprocessing', 'evaluation'],
            files: [
                {
                    name: 'ml_pipeline.py',
                    content: `# Machine Learning Classification Pipeline
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
from datetime import datetime

class MLClassificationPipeline:
    """Complete ML Classification Pipeline"""
    
    def __init__(self):
        self.data = None
        self.X = None
        self.y = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.scaler = StandardScaler()
        self.models = {}
        self.results = {}
    
    def load_data(self, file_path=None, target_column='target'):
        """Load and prepare data"""
        if file_path:
            self.data = pd.read_csv(file_path)
        else:
            # Generate sample data
            from sklearn.datasets import make_classification
            X, y = make_classification(
                n_samples=1000,
                n_features=20,
                n_informative=10,
                n_redundant=5,
                n_classes=3,
                random_state=42
            )
            
            feature_names = [f'feature_{i}' for i in range(X.shape[1])]
            self.data = pd.DataFrame(X, columns=feature_names)
            self.data[target_column] = y
        
        # Separate features and target
        self.X = self.data.drop(target_column, axis=1)
        self.y = self.data[target_column]
        
        print(f"Data loaded: {self.data.shape}")
        print(f"Features: {self.X.shape[1]}")
        print(f"Classes: {len(np.unique(self.y))}")
        
        return self.data
    
    def explore_data(self):
        """Explore the dataset"""
        print("\n=== DATA EXPLORATION ===")
        print(f"Dataset shape: {self.data.shape}")
        print(f"Missing values: {self.data.isnull().sum().sum()}")
        print(f"\nTarget distribution:")
        print(self.y.value_counts().sort_index())
        
        # Visualizations
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # Target distribution
        self.y.value_counts().plot(kind='bar', ax=axes[0, 0], title='Target Distribution')
        
        # Feature correlations
        corr_matrix = self.X.corr()
        sns.heatmap(corr_matrix, annot=False, cmap='coolwarm', ax=axes[0, 1])
        axes[0, 1].set_title('Feature Correlations')
        
        # Feature distributions
        self.X.hist(bins=30, figsize=(20, 15), ax=axes[1, 0])
        axes[1, 0].set_title('Feature Distributions')
        
        # Box plot for outliers
        self.X.select_dtypes(include=[np.number]).iloc[:, :5].boxplot(ax=axes[1, 1])
        axes[1, 1].set_title('Outlier Detection (First 5 Features)')
        
        plt.tight_layout()
        plt.show()
    
    def preprocess_data(self, test_size=0.2, random_state=42):
        """Preprocess the data"""
        print("\n=== DATA PREPROCESSING ===")
        
        # Split the data
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            self.X, self.y, test_size=test_size, random_state=random_state, 
            stratify=self.y
        )
        
        # Scale features
        self.X_train_scaled = self.scaler.fit_transform(self.X_train)
        self.X_test_scaled = self.scaler.transform(self.X_test)
        
        print(f"Training set: {self.X_train.shape}")
        print(f"Test set: {self.X_test.shape}")
        print("Data preprocessing completed!")
    
    def train_models(self):
        """Train multiple models"""
        print("\n=== MODEL TRAINING ===")
        
        # Define models
        models = {
            'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
            'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
            'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
            'SVM': SVC(random_state=42, probability=True)
        }
        
        # Train each model
        for name, model in models.items():
            print(f"Training {name}...")
            
            # Use scaled data for models that need it
            if name in ['Logistic Regression', 'SVM']:
                X_train_use = self.X_train_scaled
                X_test_use = self.X_test_scaled
            else:
                X_train_use = self.X_train
                X_test_use = self.X_test
            
            # Train model
            model.fit(X_train_use, self.y_train)
            
            # Make predictions
            y_pred = model.predict(X_test_use)
            y_pred_proba = model.predict_proba(X_test_use) if hasattr(model, 'predict_proba') else None
            
            # Calculate metrics
            metrics = {
                'accuracy': accuracy_score(self.y_test, y_pred),
                'precision': precision_score(self.y_test, y_pred, average='weighted'),
                'recall': recall_score(self.y_test, y_pred, average='weighted'),
                'f1': f1_score(self.y_test, y_pred, average='weighted')
            }
            
            # Cross-validation
            cv_scores = cross_val_score(model, X_train_use, self.y_train, cv=5)
            metrics['cv_mean'] = cv_scores.mean()
            metrics['cv_std'] = cv_scores.std()
            
            # Store results
            self.models[name] = model
            self.results[name] = {
                'model': model,
                'predictions': y_pred,
                'probabilities': y_pred_proba,
                'metrics': metrics,
                'X_test': X_test_use
            }
            
            print(f"{name} - Accuracy: {metrics['accuracy']:.4f}, F1: {metrics['f1']:.4f}")
        
        print("Model training completed!")
    
    def evaluate_models(self):
        """Evaluate and compare models"""
        print("\n=== MODEL EVALUATION ===")
        
        # Create comparison dataframe
        comparison_data = []
        for name, result in self.results.items():
            metrics = result['metrics']
            comparison_data.append({
                'Model': name,
                'Accuracy': metrics['accuracy'],
                'Precision': metrics['precision'],
                'Recall': metrics['recall'],
                'F1-Score': metrics['f1'],
                'CV Mean': metrics['cv_mean'],
                'CV Std': metrics['cv_std']
            })
        
        comparison_df = pd.DataFrame(comparison_data)
        comparison_df = comparison_df.sort_values('Accuracy', ascending=False)
        print(comparison_df.round(4))
        
        # Visualizations
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # Model comparison
        metrics_to_plot = ['Accuracy', 'Precision', 'Recall', 'F1-Score']
        comparison_df.set_index('Model')[metrics_to_plot].plot(kind='bar', ax=axes[0, 0])
        axes[0, 0].set_title('Model Performance Comparison')
        axes[0, 0].legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        
        # Cross-validation scores
        comparison_df.plot(x='Model', y='CV Mean', kind='bar', yerr='CV Std', ax=axes[0, 1])
        axes[0, 1].set_title('Cross-Validation Scores')
        
        # Confusion matrix for best model
        best_model_name = comparison_df.iloc[0]['Model']
        best_result = self.results[best_model_name]
        cm = confusion_matrix(self.y_test, best_result['predictions'])
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=axes[1, 0])
        axes[1, 0].set_title(f'Confusion Matrix - {best_model_name}')
        
        # Feature importance (if available)
        if hasattr(best_result['model'], 'feature_importances_'):
            feature_importance = pd.DataFrame({
                'feature': self.X.columns,
                'importance': best_result['model'].feature_importances_
            }).sort_values('importance', ascending=False).head(10)
            
            sns.barplot(data=feature_importance, y='feature', x='importance', ax=axes[1, 1])
            axes[1, 1].set_title(f'Top 10 Features - {best_model_name}')
        
        plt.tight_layout()
        plt.show()
        
        return comparison_df
    
    def hyperparameter_tuning(self, model_name='Random Forest'):
        """Perform hyperparameter tuning"""
        print(f"\n=== HYPERPARAMETER TUNING for {model_name} ===")
        
        if model_name == 'Random Forest':
            model = RandomForestClassifier(random_state=42)
            param_grid = {
                'n_estimators': [50, 100, 200],
                'max_depth': [10, 20, None],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            }
        
        # Grid search
        grid_search = GridSearchCV(
            model, param_grid, cv=5, scoring='accuracy', n_jobs=-1, verbose=1
        )
        
        grid_search.fit(self.X_train, self.y_train)
        
        # Best model
        best_model = grid_search.best_estimator_
        best_score = grid_search.best_score_
        best_params = grid_search.best_params_
        
        print(f"Best cross-validation score: {best_score:.4f}")
        print(f"Best parameters: {best_params}")
        
        # Evaluate on test set
        test_score = best_model.score(self.X_test, self.y_test)
        print(f"Test set accuracy: {test_score:.4f}")
        
        return best_model, best_params
    
    def save_model(self, model_name, filename=None):
        """Save trained model"""
        if model_name not in self.models:
            print(f"Model {model_name} not found!")
            return
        
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{model_name.lower().replace(' ', '_')}_{timestamp}"
        
        # Save model
        joblib.dump(self.models[model_name], f"{filename}.joblib")
        
        # Save scaler if used
        joblib.dump(self.scaler, f"{filename}_scaler.joblib")
        
        print(f"Model saved as {filename}.joblib")
        print(f"Scaler saved as {filename}_scaler.joblib")
    
    def run_complete_pipeline(self):
        """Run the complete ML pipeline"""
        print("=" * 60)
        print("MACHINE LEARNING CLASSIFICATION PIPELINE")
        print("=" * 60)
        
        # Load and explore data
        self.load_data()
        self.explore_data()
        
        # Preprocess data
        self.preprocess_data()
        
        # Train models
        self.train_models()
        
        # Evaluate models
        comparison = self.evaluate_models()
        
        # Hyperparameter tuning for best model
        best_model_name = comparison.iloc[0]['Model']
        print(f"\nPerforming hyperparameter tuning for {best_model_name}")
        tuned_model, best_params = self.hyperparameter_tuning(best_model_name)
        
        # Save best model
        self.save_model(best_model_name)
        
        print("\n=" * 60)
        print("PIPELINE COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        
        return comparison, tuned_model, best_params

# Example usage
if __name__ == "__main__":
    pipeline = MLClassificationPipeline()
    results = pipeline.run_complete_pipeline()
    print("\nPipeline finished. Check the generated plots and saved models!")`
                }
            ]
        });
    }

    setupEventListeners() {
        // Template search and filtering could be added here
        // For now, we'll handle this in the main cloud manager
    }

    addTemplate(id, templateData) {
        this.templates.set(id, {
            id,
            ...templateData,
            createdAt: new Date().toISOString(),
            downloads: 0
        });
    }

    getTemplate(id) {
        return this.templates.get(id);
    }

    getAllTemplates() {
        return Array.from(this.templates.values());
    }

    getTemplatesByCategory(category) {
        return this.getAllTemplates().filter(template => template.category === category);
    }

    searchTemplates(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAllTemplates().filter(template => 
            template.name.toLowerCase().includes(lowerQuery) ||
            template.description.toLowerCase().includes(lowerQuery) ||
            template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    incrementDownloads(id) {
        const template = this.templates.get(id);
        if (template) {
            template.downloads++;
            this.templates.set(id, template);
        }
    }

    exportTemplate(id) {
        const template = this.getTemplate(id);
        if (!template) return null;

        const exportData = {
            name: template.name,
            description: template.description,
            files: template.files,
            metadata: {
                category: template.category,
                tags: template.tags,
                source: template.source,
                exportedAt: new Date().toISOString()
            }
        };

        return JSON.stringify(exportData, null, 2);
    }

    importTemplate(templateData) {
        try {
            const data = typeof templateData === 'string' ? JSON.parse(templateData) : templateData;
            const id = data.name.toLowerCase().replace(/\s+/g, '_');
            
            this.addTemplate(id, {
                name: data.name,
                description: data.description,
                category: data.metadata?.category || 'Imported',
                source: 'imported',
                tags: data.metadata?.tags || [],
                files: data.files
            });
            
            return id;
        } catch (error) {
            console.error('Failed to import template:', error);
            return null;
        }
    }
}

// Create global instance
window.cloudTemplateManager = new CloudTemplateManager();
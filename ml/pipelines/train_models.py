import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta, timezone
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, IsolationForest
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

os.makedirs("ml/data", exist_ok=True)
os.makedirs("ml/trained_models", exist_ok=True)

def generate_traffic_dataset(n_samples=2500):
    np.random.seed(42)
    start_time = datetime(2026, 1, 1)
    
    records = []
    for i in range(n_samples):
        ts = start_time + timedelta(hours=i)
        hour = ts.hour
        day_of_week = ts.weekday()
        is_weekend = 1 if day_of_week >= 5 else 0
        
        # Diurnal pattern
        morning_peak = np.exp(-0.5 * ((hour - 9) / 2.0) ** 2)
        evening_peak = np.exp(-0.5 * ((hour - 18) / 2.5) ** 2)
        base_factor = 25.0 + (morning_peak * 45.0 + evening_peak * 50.0) * (0.6 if is_weekend else 1.0)
        
        weather_temp = 25.0 + 10.0 * np.sin(hour / 24.0 * 2 * np.pi) + np.random.normal(0, 2)
        precipitation = np.random.exponential(1.5) if np.random.rand() > 0.8 else 0.0
        event_flag = 1 if (hour in [18, 19, 20] and day_of_week in [4, 5] and np.random.rand() > 0.7) else 0
        
        noise = np.random.normal(0, 3.5)
        congestion = np.clip(base_factor + precipitation * 4.2 + event_flag * 15.0 + noise, 5.0, 98.0)
        
        records.append({
            "timestamp": ts.isoformat(),
            "hour": hour,
            "day_of_week": day_of_week,
            "is_weekend": is_weekend,
            "weather_temp": round(weather_temp, 2),
            "precipitation": round(precipitation, 2),
            "event_flag": event_flag,
            "congestion": round(congestion, 2)
        })
    
    df = pd.DataFrame(records)
    # Lag features
    df["lag_1h"] = df["congestion"].shift(1).bfill()
    df["lag_2h"] = df["congestion"].shift(2).bfill()
    df["lag_24h"] = df["congestion"].shift(24).bfill()
    df["rolling_mean_3h"] = df["congestion"].rolling(3, min_periods=1).mean()
    
    df.to_csv("ml/data/traffic_series.csv", index=False)
    return df

def generate_aqi_dataset(n_samples=2500):
    np.random.seed(101)
    start_time = datetime(2026, 1, 1)
    
    records = []
    for i in range(n_samples):
        ts = start_time + timedelta(hours=i)
        hour = ts.hour
        wind_speed = np.random.uniform(4.0, 25.0)
        temperature = 22.0 + 8.0 * np.sin(hour / 24.0 * 2 * np.pi)
        traffic_load = 40.0 + 35.0 * (np.exp(-0.5 * ((hour - 9)/2)**2) + np.exp(-0.5 * ((hour - 18)/2.5)**2))
        
        base_aqi = 65.0 + (traffic_load * 0.7) - (wind_speed * 1.8) + np.random.normal(0, 6.0)
        aqi = np.clip(base_aqi, 20.0, 350.0)
        
        records.append({
            "timestamp": ts.isoformat(),
            "hour": hour,
            "wind_speed": round(wind_speed, 2),
            "temperature": round(temperature, 2),
            "traffic_load": round(traffic_load, 2),
            "aqi": round(aqi, 2)
        })
    
    df = pd.DataFrame(records)
    df["lag_1h"] = df["aqi"].shift(1).bfill()
    df["lag_3h"] = df["aqi"].shift(3).bfill()
    df.to_csv("ml/data/aqi_series.csv", index=False)
    return df

def generate_energy_dataset(n_samples=2500):
    np.random.seed(202)
    start_time = datetime(2026, 1, 1)
    
    records = []
    for i in range(n_samples):
        ts = start_time + timedelta(hours=i)
        hour = ts.hour
        is_weekend = 1 if ts.weekday() >= 5 else 0
        temperature = 24.0 + 9.0 * np.sin((hour - 6) / 24.0 * 2 * np.pi)
        
        occupancy = 0.1 if is_weekend else (0.85 if 9 <= hour <= 18 else 0.25)
        cooling_demand = max(0.0, (temperature - 22.0) * 4.5)
        
        kwh = 35.0 + (occupancy * 45.0) + cooling_demand + np.random.normal(0, 3.0)
        
        records.append({
            "timestamp": ts.isoformat(),
            "hour": hour,
            "is_weekend": is_weekend,
            "temperature": round(temperature, 2),
            "occupancy_rate": round(occupancy, 2),
            "kwh": round(kwh, 2)
        })
    
    df = pd.DataFrame(records)
    df["lag_1h"] = df["kwh"].shift(1).bfill()
    df.to_csv("ml/data/energy_series.csv", index=False)
    return df

def calculate_mape(y_true, y_pred):
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    nonzero = y_true != 0
    return np.mean(np.abs((y_true[nonzero] - y_pred[nonzero]) / y_true[nonzero])) * 100

def train_and_evaluate_all():
    print("Generating training datasets...")
    df_traffic = generate_traffic_dataset()
    df_aqi = generate_aqi_dataset()
    df_energy = generate_energy_dataset()
    
    model_registry = {}
    
    # 1. TRAFFIC MODELS COMPARISON
    print("Training Traffic Forecasting models...")
    traffic_features = ["hour", "day_of_week", "is_weekend", "weather_temp", "precipitation", "event_flag", "lag_1h", "lag_2h", "lag_24h", "rolling_mean_3h"]
    X_tr = df_traffic[traffic_features]
    y_tr = df_traffic["congestion"]
    
    X_train, X_test, y_train, y_test = train_test_split(X_tr, y_tr, test_size=0.2, shuffle=False)
    
    # Baseline: Linear Regression (exogenous only)
    lr_features = ["hour", "day_of_week", "is_weekend", "weather_temp", "precipitation", "event_flag"]
    lr_model = LinearRegression()
    lr_model.fit(X_train[lr_features], y_train)
    y_pred_lr = lr_model.predict(X_test[lr_features])
    
    mae_lr = mean_absolute_error(y_test, y_pred_lr)
    rmse_lr = np.sqrt(mean_squared_error(y_test, y_pred_lr))
    mape_lr = calculate_mape(y_test, y_pred_lr)
    r2_lr = r2_score(y_test, y_pred_lr)
    
    joblib.dump(lr_model, "ml/trained_models/traffic_linear_regression.joblib")
    
    # Advanced: Random Forest
    rf_model = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42)
    rf_model.fit(X_train, y_train)
    y_pred_rf = rf_model.predict(X_test)
    
    mae_rf = mean_absolute_error(y_test, y_pred_rf)
    rmse_rf = np.sqrt(mean_squared_error(y_test, y_pred_rf))
    mape_rf = calculate_mape(y_test, y_pred_rf)
    r2_rf = r2_score(y_test, y_pred_rf)
    
    joblib.dump(rf_model, "ml/trained_models/traffic_random_forest.joblib")
    
    # Advanced: Gradient Boosting (XGBoost proxy)
    gb_model = GradientBoostingRegressor(n_estimators=150, learning_rate=0.08, max_depth=6, random_state=42)
    gb_model.fit(X_train, y_train)
    y_pred_gb = gb_model.predict(X_test)
    
    mae_gb = mean_absolute_error(y_test, y_pred_gb)
    rmse_gb = np.sqrt(mean_squared_error(y_test, y_pred_gb))
    mape_gb = calculate_mape(y_test, y_pred_gb)
    r2_gb = r2_score(y_test, y_pred_gb)
    
    joblib.dump(gb_model, "ml/trained_models/traffic_gradient_boost.joblib")
    
    # Advanced: Sequence / Ridge Multi-Horizon
    ridge_model = Ridge(alpha=100.0)
    ridge_model.fit(X_train[lr_features], y_train)
    y_pred_ridge = ridge_model.predict(X_test[lr_features])
    
    mae_ridge = mean_absolute_error(y_test, y_pred_ridge)
    rmse_ridge = np.sqrt(mean_squared_error(y_test, y_pred_ridge))
    mape_ridge = calculate_mape(y_test, y_pred_ridge)
    r2_ridge = r2_score(y_test, y_pred_ridge)
    
    # Feature Importances for GB
    importances = dict(zip(traffic_features, [round(float(v), 4) for v in gb_model.feature_importances_]))
    
    model_registry["traffic_models"] = {
        "features": traffic_features,
        "feature_importances": importances,
        "models": {
            "LinearRegression": {"mae": round(mae_lr, 3), "rmse": round(rmse_lr, 3), "mape": round(mape_lr, 2), "r2": round(r2_lr, 4), "status": "Baseline"},
            "RandomForest": {"mae": round(mae_rf, 3), "rmse": round(rmse_rf, 3), "mape": round(mape_rf, 2), "r2": round(r2_rf, 4), "status": "Candidate"},
            "GradientBoosting_XGB": {"mae": round(mae_gb, 3), "rmse": round(rmse_gb, 3), "mape": round(mape_gb, 2), "r2": round(r2_gb, 4), "status": "Active Champion"},
            "Ridge_Sequence": {"mae": round(mae_ridge, 3), "rmse": round(rmse_ridge, 3), "mape": round(mape_ridge, 2), "r2": round(r2_ridge, 4), "status": "Backup"}
        }
    }
    
    # 2. AIR QUALITY MODEL
    print("Training Air Quality Forecasting model...")
    aqi_features = ["hour", "wind_speed", "temperature", "traffic_load", "lag_1h", "lag_3h"]
    X_aqi = df_aqi[aqi_features]
    y_aqi = df_aqi["aqi"]
    X_aqi_tr, X_aqi_te, y_aqi_tr, y_aqi_te = train_test_split(X_aqi, y_aqi, test_size=0.2, shuffle=False)
    
    aqi_gb = GradientBoostingRegressor(n_estimators=100, learning_rate=0.08, max_depth=5, random_state=42)
    aqi_gb.fit(X_aqi_tr, y_aqi_tr)
    y_aqi_pred = aqi_gb.predict(X_aqi_te)
    
    joblib.dump(aqi_gb, "ml/trained_models/aqi_model.joblib")
    
    model_registry["aqi_model"] = {
        "features": aqi_features,
        "mae": round(mean_absolute_error(y_aqi_te, y_aqi_pred), 3),
        "rmse": round(np.sqrt(mean_squared_error(y_aqi_te, y_aqi_pred)), 3),
        "mape": round(calculate_mape(y_aqi_te, y_aqi_pred), 2),
        "r2": round(r2_score(y_aqi_te, y_aqi_pred), 4),
        "algorithm": "GradientBoosting"
    }
    
    # 3. ENERGY MODEL
    print("Training Building Energy Forecasting model...")
    energy_features = ["hour", "is_weekend", "temperature", "occupancy_rate", "lag_1h"]
    X_en = df_energy[energy_features]
    y_en = df_energy["kwh"]
    X_en_tr, X_en_te, y_en_tr, y_en_te = train_test_split(X_en, y_en, test_size=0.2, shuffle=False)
    
    en_rf = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    en_rf.fit(X_en_tr, y_en_tr)
    y_en_pred = en_rf.predict(X_en_te)
    
    joblib.dump(en_rf, "ml/trained_models/energy_model.joblib")
    
    model_registry["energy_model"] = {
        "features": energy_features,
        "mae": round(mean_absolute_error(y_en_te, y_en_pred), 3),
        "rmse": round(np.sqrt(mean_squared_error(y_en_te, y_en_pred)), 3),
        "mape": round(calculate_mape(y_en_te, y_en_pred), 2),
        "r2": round(r2_score(y_en_te, y_en_pred), 4),
        "algorithm": "RandomForest"
    }
    
    # 4. ANOMALY DETECTION ENGINE
    print("Training Isolation Forest Anomaly Detector...")
    iso_forest = IsolationForest(contamination=0.03, random_state=42)
    iso_forest.fit(X_tr)
    joblib.dump(iso_forest, "ml/trained_models/isolation_forest_anomaly.joblib")
    
    model_registry["anomaly_detector"] = {
        "algorithm": "IsolationForest",
        "contamination": 0.03,
        "status": "Active"
    }
    
    # Save Metadata Registry
    model_registry["metadata"] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "dataset_samples": len(df_traffic),
        "dataset_version": "v1.0-research-benchmarks",
        "is_demo_data": True
    }
    
    with open("ml/trained_models/model_registry.json", "w") as f:
        json.dump(model_registry, f, indent=2)
        
    print("All ML models trained and saved to ml/trained_models/ with full metrics!")
    return model_registry

if __name__ == "__main__":
    train_and_evaluate_all()

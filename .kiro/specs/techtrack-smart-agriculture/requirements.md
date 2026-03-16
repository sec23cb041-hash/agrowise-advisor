# Requirements Document

## Introduction

TechTrack is an AI-powered smart agriculture platform that helps farmers detect crop diseases, classify soil types from images, and receive real-time weather alerts. The system consists of a Node.js Express backend (API layer) and a Python/TensorFlow ML service. The existing React frontend (built with Lovable) communicates with the Node.js backend, which in turn proxies image and weather requests to the appropriate services. This document covers the backend and ML service requirements only — the frontend UI already exists.

## Glossary

- **Backend**: The Node.js Express server that acts as the API layer between the frontend and the ML Service.
- **ML_Service**: The Python FastAPI application that loads trained TensorFlow CNN models and serves predictions.
- **Crop_Disease_Model**: A TensorFlow CNN model trained to classify crop diseases from leaf images.
- **Soil_Classification_Model**: A TensorFlow CNN model trained to classify soil types from soil images.
- **Trainer**: The Python training scripts responsible for building and saving the CNN models.
- **Weather_Service**: The Backend module that integrates with the OpenWeatherMap API to fetch weather data.
- **Image_Preprocessor**: The ML_Service component that resizes and normalizes images before inference.
- **Prediction_Response**: A JSON object containing the predicted class label and confidence score.
- **Farmer**: The end user of the TechTrack platform who uploads images and views predictions.

---

## Requirements

### Requirement 1: Node.js Backend Server

**User Story:** As a Farmer, I want a reliable API server, so that the frontend can communicate with the ML and weather services through a single endpoint.

#### Acceptance Criteria

1. THE Backend SHALL expose a REST API on a configurable port (default 3000).
2. THE Backend SHALL accept cross-origin requests from the frontend origin.
3. WHEN the Backend receives a request to an undefined route, THE Backend SHALL return a 404 JSON error response.
4. IF the Backend encounters an unhandled internal error, THEN THE Backend SHALL return a 500 JSON error response with a descriptive message.

---

### Requirement 2: Crop Disease Prediction Endpoint

**User Story:** As a Farmer, I want to upload a crop image and receive a disease diagnosis, so that I can take timely action to protect my crops.

#### Acceptance Criteria

1. THE Backend SHALL expose a `POST /predict-crop-disease` endpoint that accepts a multipart/form-data request containing an image file.
2. WHEN a valid image is uploaded to `POST /predict-crop-disease`, THE Backend SHALL forward the image to the ML_Service `POST /predict-disease` endpoint and return the Prediction_Response to the caller.
3. IF the uploaded file is not an image (JPEG or PNG), THEN THE Backend SHALL return a 400 error response with the message "Invalid file type. Only JPEG and PNG are accepted."
4. IF the uploaded image exceeds 10 MB, THEN THE Backend SHALL return a 413 error response with the message "File too large. Maximum size is 10MB."
5. IF the ML_Service is unreachable, THEN THE Backend SHALL return a 503 error response with the message "ML service unavailable."
6. THE Backend SHALL use multer middleware to handle image file uploads for this endpoint.

---

### Requirement 3: Soil Type Prediction Endpoint

**User Story:** As a Farmer, I want to upload a soil image and receive a soil type classification, so that I can choose the right crops and fertilizers.

#### Acceptance Criteria

1. THE Backend SHALL expose a `POST /predict-soil-type` endpoint that accepts a multipart/form-data request containing an image file.
2. WHEN a valid image is uploaded to `POST /predict-soil-type`, THE Backend SHALL forward the image to the ML_Service `POST /predict-soil` endpoint and return the Prediction_Response to the caller.
3. IF the uploaded file is not an image (JPEG or PNG), THEN THE Backend SHALL return a 400 error response with the message "Invalid file type. Only JPEG and PNG are accepted."
4. IF the uploaded image exceeds 10 MB, THEN THE Backend SHALL return a 413 error response with the message "File too large. Maximum size is 10MB."
5. IF the ML_Service is unreachable, THEN THE Backend SHALL return a 503 error response with the message "ML service unavailable."
6. THE Backend SHALL use multer middleware to handle image file uploads for this endpoint.

---

### Requirement 4: Weather Information Endpoint

**User Story:** As a Farmer, I want to query current weather conditions for my city, so that I can plan farming activities like spraying and irrigation.

#### Acceptance Criteria

1. THE Backend SHALL expose a `GET /weather` endpoint that accepts a `city` query parameter.
2. WHEN a valid city name is provided, THE Weather_Service SHALL query the OpenWeatherMap Current Weather API and return a JSON object containing temperature (°C), humidity (%), and weather description.
3. IF the `city` query parameter is missing or empty, THEN THE Backend SHALL return a 400 error response with the message "City parameter is required."
4. IF the OpenWeatherMap API returns a city-not-found error, THEN THE Backend SHALL return a 404 error response with the message "City not found."
5. IF the OpenWeatherMap API key is invalid or the API is unreachable, THEN THE Backend SHALL return a 503 error response with the message "Weather service unavailable."
6. THE Backend SHALL read the OpenWeatherMap API key from an environment variable named `OPENWEATHER_API_KEY`.

---

### Requirement 5: ML Service — Crop Disease Prediction API

**User Story:** As a Backend developer, I want a dedicated ML prediction endpoint for crop diseases, so that the Backend can obtain AI-generated diagnoses.

#### Acceptance Criteria

1. THE ML_Service SHALL expose a `POST /predict-disease` endpoint that accepts a multipart/form-data request containing an image file.
2. WHEN an image is received at `POST /predict-disease`, THE Image_Preprocessor SHALL resize the image to 224×224 pixels and normalize pixel values to the range [0, 1].
3. WHEN the preprocessed image is ready, THE ML_Service SHALL load the Crop_Disease_Model from `models/crop_disease_model.h5` and run inference.
4. THE ML_Service SHALL return a Prediction_Response JSON object containing the fields `predicted_class` (string) and `confidence` (float between 0 and 1).
5. IF the Crop_Disease_Model file does not exist at startup, THEN THE ML_Service SHALL log an error and return a 503 response for all prediction requests until the model is available.
6. IF the uploaded file cannot be decoded as a valid image, THEN THE ML_Service SHALL return a 400 error response with the message "Invalid image file."

---

### Requirement 6: ML Service — Soil Type Prediction API

**User Story:** As a Backend developer, I want a dedicated ML prediction endpoint for soil classification, so that the Backend can obtain AI-generated soil type labels.

#### Acceptance Criteria

1. THE ML_Service SHALL expose a `POST /predict-soil` endpoint that accepts a multipart/form-data request containing an image file.
2. WHEN an image is received at `POST /predict-soil`, THE Image_Preprocessor SHALL resize the image to 224×224 pixels and normalize pixel values to the range [0, 1].
3. WHEN the preprocessed image is ready, THE ML_Service SHALL load the Soil_Classification_Model from `models/soil_classification_model.h5` and run inference.
4. THE ML_Service SHALL return a Prediction_Response JSON object containing the fields `predicted_class` (string) and `confidence` (float between 0 and 1).
5. IF the Soil_Classification_Model file does not exist at startup, THEN THE ML_Service SHALL log an error and return a 503 response for all prediction requests until the model is available.
6. IF the uploaded file cannot be decoded as a valid image, THEN THE ML_Service SHALL return a 400 error response with the message "Invalid image file."

---

### Requirement 7: Crop Disease Model Training

**User Story:** As a developer, I want a training script for the crop disease classifier, so that I can produce a deployable model from the Kaggle dataset.

#### Acceptance Criteria

1. THE Trainer SHALL accept the path to the crop disease dataset directory as a configurable parameter (default: `datasets/crop_disease/`).
2. WHEN training begins, THE Trainer SHALL split the dataset into 80% training and 20% validation sets.
3. THE Trainer SHALL build a CNN architecture with at least one convolutional block, max-pooling, dropout for regularization, and a dense output layer matching the number of disease classes.
4. THE Trainer SHALL resize all input images to 224×224 pixels and normalize pixel values to the range [0, 1] during data loading.
5. THE Trainer SHALL train the Crop_Disease_Model for 10 epochs using categorical cross-entropy loss and the Adam optimizer.
6. WHEN training completes, THE Trainer SHALL save the trained model to `models/crop_disease_model.h5`.
7. THE Trainer SHALL print training accuracy and validation accuracy after each epoch.

---

### Requirement 8: Soil Classification Model Training

**User Story:** As a developer, I want a training script for the soil type classifier, so that I can produce a deployable model from the Kaggle dataset.

#### Acceptance Criteria

1. THE Trainer SHALL accept the path to the soil image dataset directory as a configurable parameter (default: `datasets/soil_images/`).
2. WHEN training begins, THE Trainer SHALL split the dataset into 80% training and 20% validation sets.
3. THE Trainer SHALL build a CNN architecture with at least one convolutional block, max-pooling, dropout for regularization, and a dense output layer matching the number of soil classes.
4. THE Trainer SHALL resize all input images to 224×224 pixels and normalize pixel values to the range [0, 1] during data loading.
5. THE Trainer SHALL train the Soil_Classification_Model for 10 epochs using categorical cross-entropy loss and the Adam optimizer.
6. WHEN training completes, THE Trainer SHALL save the trained model to `models/soil_classification_model.h5`.
7. THE Trainer SHALL print training accuracy and validation accuracy after each epoch.

---

### Requirement 9: Image Preprocessing Round-Trip

**User Story:** As a developer, I want to verify that image preprocessing is consistent between training and inference, so that the model receives the same input distribution it was trained on.

#### Acceptance Criteria

1. THE Image_Preprocessor SHALL apply the same resize (224×224) and normalization ([0, 1]) transformations during both training and inference.
2. FOR ALL valid input images, applying the preprocessing pipeline twice SHALL produce the same output as applying it once (idempotence of normalization after the first pass).
3. THE Image_Preprocessor SHALL accept JPEG and PNG image formats.

---

### Requirement 10: Dataset Preparation

**User Story:** As a developer, I want clear instructions for downloading and organizing the Kaggle datasets, so that training scripts can locate the data without manual path configuration.

#### Acceptance Criteria

1. THE Backend documentation SHALL specify that the crop disease dataset (from `jawadali1045/20k-multi-class-crop-disease-images`) must be extracted to `datasets/crop_disease/` with one subdirectory per disease class.
2. THE Backend documentation SHALL specify that the soil image dataset (from `jayaprakashpondy/soil-image-dataset`) must be extracted to `datasets/soil_images/` with one subdirectory per soil type.
3. WHEN the dataset directories follow the required structure, THE Trainer SHALL automatically discover all class labels from subdirectory names without requiring manual label configuration.

---

### Requirement 11: System Integration — End-to-End Image Prediction Flow

**User Story:** As a Farmer, I want the full pipeline from image upload to prediction result to work seamlessly, so that I receive a diagnosis within a reasonable time.

#### Acceptance Criteria

1. WHEN a Farmer uploads a crop image via the frontend, THE Backend SHALL return a Prediction_Response to the frontend within 10 seconds under normal operating conditions.
2. WHEN a Farmer uploads a soil image via the frontend, THE Backend SHALL return a Prediction_Response to the frontend within 10 seconds under normal operating conditions.
3. THE Backend SHALL forward the original image bytes to the ML_Service without re-encoding or altering the image data.
4. THE ML_Service SHALL keep the Crop_Disease_Model and Soil_Classification_Model loaded in memory after the first request to avoid repeated disk reads on subsequent requests.

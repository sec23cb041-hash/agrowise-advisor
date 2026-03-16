# Implementation Plan: TechTrack Smart Agriculture

## Overview

Implement the Node.js Express backend, Python FastAPI ML service, and TensorFlow CNN training scripts. The React frontend already exists at `src/` and is not modified. Tasks build incrementally from project scaffolding through service integration.

## Tasks

- [x] 1. Scaffold project structure and environment configuration
  - Create `backend/` directory with `package.json` (express, multer, axios, cors, dotenv)
  - Create `backend/.env.example` with `PORT`, `ML_SERVICE_URL`, `OPENWEATHER_API_KEY`
  - Create `ml_service/` directory with `requirements.txt` (fastapi, uvicorn, tensorflow, pillow, python-multipart, python-dotenv, hypothesis, pytest, httpx)
  - Create `training/requirements.txt` (tensorflow, pillow, numpy)
  - Create `datasets/crop_disease/.gitkeep` and `datasets/soil_images/.gitkeep`
  - Create `ml_service/models/.gitkeep` and add `models/*.h5` to `.gitignore`
  - _Requirements: 1.1, 7.1, 8.1, 10.1, 10.2_

- [x] 2. Implement Node.js backend core
  - [x] 2.1 Create `backend/src/middleware/upload.js`
    - Configure Multer with `memoryStorage`
    - Add MIME type filter for `image/jpeg` and `image/png`; throw `ValidationError` for other types
    - Set `limits.fileSize` to 10 MB
    - Export `imageUpload` middleware instance
    - _Requirements: 2.3, 2.4, 2.6, 3.3, 3.4, 3.6_

  - [ ]* 2.2 Write unit tests for upload middleware
    - Test JPEG and PNG pass through
    - Test non-image MIME type triggers `ValidationError`
    - Test file size limit triggers `MulterError` with `LIMIT_FILE_SIZE`
    - _Requirements: 2.3, 2.4_

  - [x] 2.3 Create `backend/src/middleware/errorHandler.js`
    - Map `ValidationError` → 400, `FileTooLargeError` / `MulterError(LIMIT_FILE_SIZE)` → 413, `NotFoundError` → 404, `ServiceUnavailableError` → 503, unhandled → 500
    - All responses use shape `{ "error": "<message>" }`
    - _Requirements: 1.3, 1.4, 2.3, 2.4, 2.5, 3.3, 3.4, 3.5, 4.3, 4.4, 4.5_

  - [ ]* 2.4 Write unit tests for errorHandler middleware
    - Test each error class maps to the correct HTTP status code
    - Test unrecognised errors fall through to 500
    - _Requirements: 1.3, 1.4_

  - [x] 2.5 Create `backend/src/services/mlService.js`
    - Implement `predictCropDisease(imageBuffer, mimetype)` — POST to `ML_SERVICE_URL/predict-disease` via Axios with `multipart/form-data`
    - Implement `predictSoilType(imageBuffer, mimetype)` — POST to `ML_SERVICE_URL/predict-soil`
    - Throw `ServiceUnavailableError` when Axios cannot reach the ML service
    - _Requirements: 2.2, 2.5, 3.2, 3.5, 11.3_

  - [ ]* 2.6 Write unit tests for mlService
    - Mock Axios; verify correct URL, form-data field, and response passthrough
    - Verify `ServiceUnavailableError` thrown on connection error
    - _Requirements: 2.2, 2.5, 3.2, 3.5_

  - [x] 2.7 Create `backend/src/services/weatherService.js`
    - Implement `getWeather(city)` — GET OpenWeatherMap `/data/2.5/weather?q={city}&units=metric&appid={KEY}`
    - Map response to `{ temperature, humidity, description }`
    - Throw `ValidationError` for missing/empty city, `NotFoundError` for 404 from OWM, `ServiceUnavailableError` for network/auth errors
    - Read key from `process.env.OPENWEATHER_API_KEY`
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 2.8 Write unit tests for weatherService
    - Mock Axios; verify field mapping for temperature, humidity, description
    - Verify each error condition throws the correct typed error
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 3. Implement Node.js backend routes and app wiring
  - [x] 3.1 Create `backend/src/routes/cropDisease.js`
    - Mount `POST /predict-crop-disease` with `imageUpload` middleware
    - Call `mlService.predictCropDisease` and return result
    - Pass errors to `next(err)`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.2 Create `backend/src/routes/soilType.js`
    - Mount `POST /predict-soil-type` with `imageUpload` middleware
    - Call `mlService.predictSoilType` and return result
    - Pass errors to `next(err)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.3 Create `backend/src/routes/weather.js`
    - Mount `GET /weather`
    - Validate `city` query param; throw `ValidationError` if missing/empty
    - Call `weatherService.getWeather` and return result
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 3.4 Create `backend/src/app.js` and `backend/src/server.js`
    - Register CORS, JSON body parser, Multer, and all routers in `app.js`
    - Register 404 handler for undefined routes returning `{ "error": "Not found" }`
    - Register `errorHandler` as last middleware
    - `server.js` reads `PORT` from env (default 3000) and starts HTTP server
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 3.5 Write route integration tests using Supertest
    - `cropDisease.test.js`: valid upload returns 200, wrong type returns 400, oversized returns 413, ML down returns 503
    - `soilType.test.js`: same contract as crop disease
    - `weather.test.js`: valid city returns 200 with all fields, missing city returns 400, unknown city returns 404, API down returns 503
    - _Requirements: 2.1–2.5, 3.1–3.5, 4.1–4.5_

- [ ] 4. Write Node.js property-based tests
  - [ ]* 4.1 Write property test for unknown routes (Property 1)
    - Use `fast-check` to generate random path strings not matching registered routes
    - Assert response status is 404 and body contains `error` field
    - Minimum 100 iterations
    - **Property 1: Unknown routes return 404 JSON**
    - **Validates: Requirements 1.3**

  - [ ]* 4.2 Write property test for invalid file type rejection (Property 3)
    - Use `fast-check` to generate random non-image MIME type strings
    - Assert both `/predict-crop-disease` and `/predict-soil-type` return 400 with correct message
    - Assert ML service is never contacted
    - Minimum 100 iterations
    - **Property 3: Invalid file type rejected at both prediction endpoints**
    - **Validates: Requirements 2.3, 3.3**

  - [ ]* 4.3 Write property test for missing/empty city param (Property 5)
    - Use `fast-check` to generate empty strings, whitespace strings, and absent params
    - Assert `GET /weather` returns 400 with message `"City parameter is required."`
    - Minimum 100 iterations
    - **Property 5: Missing or empty city parameter returns 400**
    - **Validates: Requirements 4.3**

- [ ] 5. Checkpoint — Node.js backend
  - Ensure all backend tests pass, ask the user if questions arise.

- [x] 6. Implement Python ML service
  - [x] 6.1 Create `ml_service/schemas.py`
    - Define `PredictionResponse` Pydantic model with `predicted_class: str` and `confidence: float`
    - _Requirements: 5.4, 6.4_

  - [x] 6.2 Create `ml_service/services/preprocess.py`
    - Implement `prepare_image(file_bytes: bytes) -> np.ndarray`
    - Decode bytes with Pillow; raise `ValueError("Invalid image file.")` if decoding fails
    - Convert to RGB, resize to 224×224, normalize to `[0, 1]`, return shape `(1, 224, 224, 3)` float32 array
    - _Requirements: 5.2, 5.6, 6.2, 6.6, 9.1, 9.3_

  - [ ]* 6.3 Write unit tests for preprocess.py
    - Test with known JPEG and PNG fixtures: verify shape `(1, 224, 224, 3)`, dtype `float32`, values in `[0, 1]`
    - Test with invalid bytes: verify `ValueError` is raised
    - _Requirements: 5.2, 5.6, 9.1, 9.3_

  - [x] 6.4 Create `ml_service/services/model_loader.py`
    - Implement `load_models()` — load `models/crop_disease_model.h5` and `models/soil_classification_model.h5`
    - Return `None` for any model whose file is missing; log an error
    - Store loaded models as module-level singletons
    - _Requirements: 5.3, 5.5, 6.3, 6.5, 11.4_

  - [ ]* 6.5 Write unit tests for model_loader.py
    - Test with missing file path: verify returns `None`
    - Test singleton behaviour: verify model is not reloaded on second call
    - _Requirements: 5.5, 6.5, 11.4_

  - [x] 6.6 Create `ml_service/routers/disease.py`
    - Implement `POST /predict-disease` accepting `UploadFile`
    - Call `prepare_image`; return 400 with `"Invalid image file."` on `ValueError`
    - Check model singleton; return 503 with `"Model not available"` if `None`
    - Run inference, extract `predicted_class` and `confidence`, return `PredictionResponse`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 6.7 Write unit tests for disease router
    - Test valid image returns 200 with `predicted_class` and `confidence`
    - Test non-image bytes returns 400
    - Test missing model returns 503
    - _Requirements: 5.1, 5.4, 5.5, 5.6_

  - [x] 6.8 Create `ml_service/routers/soil.py`
    - Implement `POST /predict-soil` with same contract as disease router
    - Use soil model singleton
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 6.9 Write unit tests for soil router
    - Test valid image returns 200 with `predicted_class` and `confidence`
    - Test non-image bytes returns 400
    - Test missing model returns 503
    - _Requirements: 6.1, 6.4, 6.5, 6.6_

  - [x] 6.10 Create `ml_service/main.py`
    - Create FastAPI app with `lifespan` event that calls `load_models()` at startup
    - Register disease and soil routers
    - _Requirements: 5.3, 5.5, 6.3, 6.5, 11.4_

- [ ] 7. Write Python ML service property-based tests
  - [ ]* 7.1 Write property test for preprocessing tensor validity (Property 6)
    - Use `@given(st.binary())` filtered to valid image bytes (construct minimal valid JPEG/PNG in strategy)
    - Assert output shape is `(1, 224, 224, 3)`, dtype is `float32`, all values in `[0.0, 1.0]`
    - Minimum 100 iterations
    - **Property 6: Preprocessing produces valid normalized tensor**
    - **Validates: Requirements 5.2, 6.2, 9.1, 9.3**

  - [ ]* 7.2 Write property test for preprocessing idempotence (Property 7)
    - Generate valid image bytes, apply `prepare_image` twice, assert outputs are element-wise equal
    - Minimum 100 iterations
    - **Property 7: Preprocessing is idempotent after first application**
    - **Validates: Requirements 9.2**

  - [ ]* 7.3 Write property test for prediction response structure (Property 8)
    - Mock model to return random logits via `@given(st.lists(st.floats(...), min_size=2))`
    - Assert `predicted_class` is a non-empty string and `confidence` satisfies `0.0 ≤ confidence ≤ 1.0`
    - Minimum 100 iterations
    - **Property 8: Prediction response structure is valid for all inputs**
    - **Validates: Requirements 5.4, 6.4**

  - [ ]* 7.4 Write property test for invalid image bytes returning 400 (Property 9)
    - Use `@given(st.binary())` with bytes that are not valid images
    - Submit to both `/predict-disease` and `/predict-soil` via TestClient
    - Assert 400 response with message `"Invalid image file."`
    - Minimum 100 iterations
    - **Property 9: Invalid image bytes return 400 from ML service**
    - **Validates: Requirements 5.6, 6.6**

- [ ] 8. Checkpoint — ML service
  - Ensure all ML service tests pass, ask the user if questions arise.

- [x] 9. Implement TensorFlow CNN training scripts
  - [x] 9.1 Create `training/train_crop_disease.py`
    - Accept dataset path as CLI argument (default `datasets/crop_disease/`)
    - Use `tf.keras.utils.image_dataset_from_directory` with 80/20 split, image size 224×224, normalization rescale 1/255
    - Build CNN: Conv2D(32)→MaxPool, Conv2D(64)→MaxPool, Conv2D(128)→MaxPool, Flatten, Dense(256, relu), Dropout(0.5), Dense(num_classes, softmax)
    - Compile with `categorical_crossentropy` and `Adam`; train for 10 epochs with verbose=1
    - Save model to `models/crop_disease_model.h5`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 9.2 Create `training/train_soil_type.py`
    - Same structure as crop disease script with dataset path default `datasets/soil_images/`
    - Save model to `models/soil_classification_model.h5`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 9.3 Write unit tests for training scripts
    - `test_train_crop_disease.py`: create temp directory with dummy images across 2 classes, verify 80/20 split, verify model architecture layers (Conv2D, MaxPooling2D, Dropout, Dense), verify `.h5` file is created after 1 epoch
    - `test_train_soil_type.py`: same pattern for soil script
    - _Requirements: 7.2, 7.3, 7.6, 8.2, 8.3, 8.6_

- [ ] 10. Write training property-based test
  - [ ]* 10.1 Write property test for 80/20 dataset split (Property 10)
    - Use `@given(st.integers(min_value=10, max_value=1000))` for dataset size N
    - Create N dummy image paths, run split logic, assert training set size is `floor(0.8 * N) ± 1` and validation set size is `ceil(0.2 * N) ± 1`
    - Assert no sample appears in both sets
    - Minimum 100 iterations
    - **Property 10: Training dataset split preserves 80/20 ratio**
    - **Validates: Requirements 7.2, 8.2**

- [x] 11. Write dataset preparation documentation
  - Create `datasets/README.md` with instructions for downloading `jawadali1045/20k-multi-class-crop-disease-images` to `datasets/crop_disease/` and `jayaprakashpondy/soil-image-dataset` to `datasets/soil_images/`
  - Document required directory structure: one subdirectory per class label
  - Document that class labels are auto-discovered from subdirectory names
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 12. Wire backend and ML service together and final integration tests
  - [ ] 12.1 Write property test for image prediction proxy round-trip (Property 2)
    - Use `fast-check` to generate valid JPEG/PNG buffers
    - Mock ML service to return a fixed `PredictionResponse`
    - Assert backend response `predicted_class` and `confidence` are identical to mock values (no transformation)
    - Minimum 100 iterations
    - **Property 2: Image prediction proxy round-trip**
    - **Validates: Requirements 2.2, 3.2, 11.3**

  - [ ]* 12.2 Write property test for weather response fields (Property 4)
    - Use `fast-check` to generate valid city name strings
    - Mock OpenWeatherMap to return valid weather JSON
    - Assert response contains `temperature` (number), `humidity` (integer), `description` (non-empty string)
    - Minimum 100 iterations
    - **Property 4: Weather response contains all required fields**
    - **Validates: Requirements 4.2**

- [ ] 13. Final checkpoint — Ensure all tests pass
  - Ensure all backend and ML service tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` (Node.js) and `Hypothesis` (Python)
- Models must be trained and placed in `ml_service/models/` before running the ML service
- The React frontend at `src/` is not modified by any task in this plan

# Dataset Preparation

This directory holds the image datasets used to train the TechTrack crop disease and soil type classification models.

> **Note:** Dataset directories are gitignored — only `.gitkeep` placeholder files are tracked. You must download and extract the datasets locally before running the training scripts.

---

## Datasets

### 1. Crop Disease Dataset

- **Kaggle slug:** `jawadali1045/20k-multi-class-crop-disease-images`
- **Extract to:** `datasets/crop_disease/`

### 2. Soil Image Dataset

- **Kaggle slug:** `jayaprakashpondy/soil-image-dataset`
- **Extract to:** `datasets/soil_images/`

---

## Downloading the Datasets

### Option A — Kaggle CLI (recommended)

1. Install the Kaggle CLI and configure your API key (`~/.kaggle/kaggle.json`):
   ```bash
   pip install kaggle
   ```

2. Download and extract the crop disease dataset:
   ```bash
   kaggle datasets download -d jawadali1045/20k-multi-class-crop-disease-images -p datasets/crop_disease --unzip
   ```

3. Download and extract the soil image dataset:
   ```bash
   kaggle datasets download -d jayaprakashpondy/soil-image-dataset -p datasets/soil_images --unzip
   ```

### Option B — Manual browser download

1. Visit the dataset pages on Kaggle:
   - https://www.kaggle.com/datasets/jawadali1045/20k-multi-class-crop-disease-images
   - https://www.kaggle.com/datasets/jayaprakashpondy/soil-image-dataset
2. Click **Download** on each page (requires a free Kaggle account).
3. Extract the downloaded ZIP files into the corresponding directories:
   - Crop disease → `datasets/crop_disease/`
   - Soil images → `datasets/soil_images/`

---

## Required Directory Structure

Each dataset directory must contain one subdirectory per class label. The training scripts discover class labels automatically from these subdirectory names — no manual configuration is needed.

```
datasets/
├── crop_disease/
│   ├── Early_Blight/
│   │   ├── image1.jpg
│   │   └── ...
│   ├── Late_Blight/
│   │   └── ...
│   └── Healthy/
│       └── ...
└── soil_images/
    ├── Alluvial Soil/
    │   ├── image1.jpg
    │   └── ...
    ├── Black Soil/
    │   └── ...
    └── Red Soil/
        └── ...
```

Class labels are auto-discovered from subdirectory names — no manual label configuration is needed.

---

## Running the Training Scripts

Once the datasets are in place, run the training scripts from the project root:

```bash
# Train the crop disease classifier
python training/train_crop_disease.py

# Train the soil type classifier
python training/train_soil_type.py
```

To use a custom dataset path:

```bash
python training/train_crop_disease.py --dataset path/to/data
```

Trained models are saved to `ml_service/models/` and are required by the ML service before it can serve predictions.

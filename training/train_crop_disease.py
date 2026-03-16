"""
TensorFlow CNN training script for crop disease classification.

Usage:
    python training/train_crop_disease.py
    python training/train_crop_disease.py --dataset path/to/data
"""

import argparse
import os
import sys

import tensorflow as tf
from tensorflow.keras import layers, models


def parse_args():
    parser = argparse.ArgumentParser(
        description="Train a CNN model for crop disease classification."
    )
    parser.add_argument(
        "--dataset",
        type=str,
        default="datasets/crop_disease/",
        help="Path to the dataset directory (default: datasets/crop_disease/)",
    )
    return parser.parse_args()


def build_model(num_classes: int) -> tf.keras.Model:
    model = models.Sequential([
        layers.Input(shape=(224, 224, 3)),
        layers.Rescaling(1.0 / 255),
        layers.Conv2D(32, 3, activation="relu", padding="same"),
        layers.MaxPooling2D(2),
        layers.Conv2D(64, 3, activation="relu", padding="same"),
        layers.MaxPooling2D(2),
        layers.Conv2D(128, 3, activation="relu", padding="same"),
        layers.MaxPooling2D(2),
        layers.Flatten(),
        layers.Dense(256, activation="relu"),
        layers.Dropout(0.5),
        layers.Dense(num_classes, activation="softmax"),
    ])
    return model


def main():
    args = parse_args()
    dataset_path = args.dataset

    if not os.path.isdir(dataset_path):
        print(f"Error: Dataset directory '{dataset_path}' does not exist.", file=sys.stderr)
        sys.exit(1)

    print(f"Loading dataset from: {dataset_path}")

    train_ds = tf.keras.utils.image_dataset_from_directory(
        dataset_path,
        validation_split=0.2,
        subset="training",
        seed=42,
        image_size=(224, 224),
        batch_size=32,
        label_mode="categorical",
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        dataset_path,
        validation_split=0.2,
        subset="validation",
        seed=42,
        image_size=(224, 224),
        batch_size=32,
        label_mode="categorical",
    )

    class_names = train_ds.class_names
    num_classes = len(class_names)
    print(f"Discovered {num_classes} classes: {class_names}")

    model = build_model(num_classes)
    model.compile(
        optimizer="adam",
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    print("\nStarting training...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=10,
        verbose=1,
    )

    os.makedirs("models", exist_ok=True)
    save_path = "models/crop_disease_model.h5"
    model.save(save_path)
    print(f"\nModel saved to: {save_path}")

    final_acc = history.history["accuracy"][-1]
    final_val_acc = history.history["val_accuracy"][-1]
    final_loss = history.history["loss"][-1]
    final_val_loss = history.history["val_loss"][-1]

    print("\n--- Training Summary ---")
    print(f"  Final training accuracy:   {final_acc:.4f}")
    print(f"  Final validation accuracy: {final_val_acc:.4f}")
    print(f"  Final training loss:       {final_loss:.4f}")
    print(f"  Final validation loss:     {final_val_loss:.4f}")
    print("------------------------")


if __name__ == "__main__":
    main()

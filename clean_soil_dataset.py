import os
import tensorflow as tf
from PIL import Image
import shutil

# Path to your soil images dataset
dataset_path = "datasets/soil_images"
bad_folder = "datasets/bad_soil_images"

# Create folder to store unreadable or bad images
os.makedirs(bad_folder, exist_ok=True)

# Supported image formats
supported_formats = (".jpg", ".jpeg", ".png", ".bmp", ".gif")

for root, dirs, files in os.walk(dataset_path):
    for file in files:
        path = os.path.join(root, file)
        rel_path = os.path.relpath(root, dataset_path)
        target_dir = os.path.join(bad_folder, rel_path)
        os.makedirs(target_dir, exist_ok=True)

        # 1️⃣ Try to convert unsupported formats to JPEG
        if not file.lower().endswith(supported_formats):
            try:
                img = Image.open(path).convert("RGB")
                new_file = os.path.splitext(file)[0] + ".jpg"
                new_path = os.path.join(root, new_file)
                img.save(new_path, "JPEG")
                os.remove(path)
                print(f"Converted {path} → {new_path}")
                path = new_path
            except Exception as e:
                shutil.move(path, os.path.join(target_dir, file))
                print(f"Failed to convert {path}, moved to bad: {e}")
                continue

        # 2️⃣ Check if TensorFlow can read the image
        try:
            img_tf = tf.io.read_file(path)
            img_tf = tf.io.decode_image(img_tf, channels=3)
        except Exception as e:
            shutil.move(path, os.path.join(target_dir, file))
            print(f"Unreadable image moved to bad: {path} ({e})")

print("Soil dataset cleaning complete.")
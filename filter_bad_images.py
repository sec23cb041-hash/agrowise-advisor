import os
import tensorflow as tf
import shutil

dataset_path = "datasets/crop_disease"
bad_folder = "datasets/bad_images"

os.makedirs(bad_folder, exist_ok=True)

for root, dirs, files in os.walk(dataset_path):
    for file in files:
        path = os.path.join(root, file)
        rel_path = os.path.relpath(root, dataset_path)
        try:
            # Try reading the image with TensorFlow
            img = tf.io.read_file(path)
            img = tf.io.decode_image(img, channels=3)
        except:
            # Move bad image to bad_images folder preserving class subfolder
            target_dir = os.path.join(bad_folder, rel_path)
            os.makedirs(target_dir, exist_ok=True)
            shutil.move(path, os.path.join(target_dir, file))
            print(f"Moved unreadable file: {path} → {target_dir}")

print("Dataset filtering complete.")
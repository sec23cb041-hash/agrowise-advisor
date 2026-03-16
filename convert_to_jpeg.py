import os
from PIL import Image

dataset_path = "datasets/crop_disease"
supported_formats = (".jpg", ".jpeg", ".png", ".bmp", ".gif")

for root, dirs, files in os.walk(dataset_path):
    for file in files:
        file_lower = file.lower()
        if not file_lower.endswith(supported_formats):
            old_path = os.path.join(root, file)
            new_file = os.path.splitext(file)[0] + ".jpg"
            new_path = os.path.join(root, new_file)
            try:
                img = Image.open(old_path).convert("RGB")
                img.save(new_path, "JPEG")
                print(f"Converted {old_path} → {new_path}")
                os.remove(old_path)
            except Exception as e:
                print(f"Failed to convert {old_path}: {e}")

print("Finished converting all unsupported images to JPEG.")
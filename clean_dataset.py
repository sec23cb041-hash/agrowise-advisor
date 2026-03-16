import os
from PIL import Image

dataset_path = "datasets/crop_disease"

bad_files = []

for root, dirs, files in os.walk(dataset_path):
    for file in files:
        path = os.path.join(root, file)
        try:
            img = Image.open(path)
            img.verify()
        except:
            print("Removing bad file:", path)
            bad_files.append(path)
            os.remove(path)

print("Finished cleaning dataset.")
print("Total removed files:", len(bad_files))